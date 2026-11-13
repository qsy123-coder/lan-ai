# bare-metal.ps1 -- deploy lan (dzmm) to a host WITHOUT docker
#
#   powershell -ExecutionPolicy Bypass -File deploy\bare-metal.ps1 `
#     -Server root@45.135.119.204 -Port 28822 -Key "$env:USERPROFILE\.ssh\wavemod_hk"
#
# Notes:
#   - Ports: site 18100 (public), engine 18101 (loopback only)
#   - Does NOT touch nginx or ports 80/443
#   - data/ is preserved across redeploys
param(
  [Parameter(Mandatory = $true)][string]$Server,
  [int]$Port = 22,
  [Parameter(Mandatory = $true)][string]$Key,
  [int]$SitePort = 18100,
  [int]$EnginePort = 18101,
  [string]$RemoteDir = "/root/lan",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$Here = Split-Path -Parent $PSScriptRoot
$Work = Join-Path $env:TEMP ("lan-deploy-" + [guid]::NewGuid().ToString("N").Substring(0, 8))

function Invoke-Ssh([string]$cmd) {
  & ssh -o BatchMode=yes -o StrictHostKeyChecking=no -p $Port -i $Key $Server $cmd
  if ($LASTEXITCODE -ne 0) { throw "ssh failed: $cmd" }
}
function Invoke-Scp([string]$local, [string]$remote) {
  & scp -o BatchMode=yes -o StrictHostKeyChecking=no -P $Port -i $Key $local "${Server}:${remote}"
  if ($LASTEXITCODE -ne 0) { throw "scp failed: $local" }
}

Write-Host "`n==> 1/7 stage files" -ForegroundColor Cyan
New-Item -ItemType Directory -Force $Work, "$Work\site", "$Work\engine", "$Work\data" | Out-Null
robocopy "$Here\site" "$Work\site" /E /XD node_modules .next /XF *.bak /NFL /NDL /NJH /NJS /NP | Out-Null
Copy-Item "$Here\engine\server.py" "$Work\engine\" -Force

# credentials: prefer repo out/, fall back to deploy/data/
$pairs = @(
  @{ f = "site_pass.txt";  src = @("$Here\out\site_pass.txt",  "$Here\deploy\data\site_pass.txt") },
  @{ f = "site_token.txt"; src = @("$Here\out\site_token.txt", "$Here\deploy\data\site_token.txt") },
  @{ f = "accounts.json";  src = @("$Here\accounts.json",      "$Here\deploy\data\accounts.json") },
  @{ f = "webstate.json";  src = @("$Here\out\webstate.json",  "$Here\deploy\data\webstate.json") },
  @{ f = "cards.json";     src = @("$Here\captures\site\cards.json", "$Here\deploy\data\cards.json") }
)
foreach ($p in $pairs) {
  $found = $p.src | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($found) { Copy-Item $found "$Work\data\$($p.f)" -Force }
  else { Write-Host "   ! missing $($p.f)" -ForegroundColor Yellow }
}

Write-Host "`n==> 2/7 upload" -ForegroundColor Cyan
Push-Location $Work
& tar -czf "payload.tar.gz" site engine data
Pop-Location
Invoke-Scp "$Work\payload.tar.gz" "$RemoteDir.tar.gz"
Invoke-Ssh "mkdir -p $RemoteDir && cd $RemoteDir && tar -xzf $RemoteDir.tar.gz && rm -f $RemoteDir.tar.gz"

Write-Host "`n==> 3/7 python venv + curl_cffi" -ForegroundColor Cyan
$venvScript = @'
set -e
export DEBIAN_FRONTEND=noninteractive
command -v python3 >/dev/null || (apt-get update -qq && apt-get install -y -qq python3)
cd REMOTE_DIR
[ -d .venv ] || python3 -m venv .venv
./.venv/bin/pip install -q --upgrade pip
./.venv/bin/pip install -q curl_cffi
./.venv/bin/python -c "import curl_cffi; print('curl_cffi', curl_cffi.__version__)"
'@.Replace("REMOTE_DIR", $RemoteDir)
$venvTmp = Join-Path $env:TEMP "lan-venv.sh"
[System.IO.File]::WriteAllText($venvTmp, ($venvScript -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
Invoke-Scp $venvTmp "$RemoteDir/setup-venv.sh"
Invoke-Ssh "bash $RemoteDir/setup-venv.sh"

if (-not $SkipBuild) {
  Write-Host "`n==> 4/7 npm install + build" -ForegroundColor Cyan
  $buildScript = @"
set -e
cd $RemoteDir/site
[ -d node_modules ] || npm install --no-audit --no-fund
npm run build 2>&1 | tail -14
"@
  $buildTmp = Join-Path $env:TEMP "lan-build.sh"
  [System.IO.File]::WriteAllText($buildTmp, ($buildScript -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
  Invoke-Scp $buildTmp "$RemoteDir/setup-build.sh"
  Invoke-Ssh "bash $RemoteDir/setup-build.sh"
} else {
  Write-Host "`n==> 4/7 build skipped" -ForegroundColor DarkGray
}

Write-Host "`n==> 5/7 write .env + systemd units" -ForegroundColor Cyan
$units = @"
cd $RemoteDir
mkdir -p logs out
PASS=`$(cat data/site_pass.txt | tr -d '\r\n')
TOKEN=`$(cat data/site_token.txt | tr -d '\r\n')
printf 'SITE_PASS=%s\nSITE_TOKEN=%s\n' "`$PASS" "`$TOKEN" > .env
chmod 600 .env

# engine resolves ROOT/accounts.json and ROOT/out/webstate.json
ln -sfn $RemoteDir/data/accounts.json $RemoteDir/accounts.json
ln -sfn $RemoteDir/data/cards.json    $RemoteDir/cards.json
ln -sfn $RemoteDir/data/webstate.json $RemoteDir/out/webstate.json

cat > /etc/systemd/system/lan-engine.service <<'UNIT'
[Unit]
Description=Lan engine (account pool + SSE relay)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/root/lan
Environment=DZMM_ROOT=/root/lan
Environment=DZMM_PROXY=
Environment=PYTHONUNBUFFERED=1
ExecStart=/root/lan/.venv/bin/python /root/lan/engine/server.py --port 18101
Restart=always
RestartSec=3
StandardOutput=append:/root/lan/logs/engine.log
StandardError=append:/root/lan/logs/engine.log

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/systemd/system/lan-site.service <<'UNIT'
[Unit]
Description=Lan site (Next.js front-end)
After=network-online.target lan-engine.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/root/lan/site
Environment=NODE_ENV=production
Environment=ENGINE_URL=http://127.0.0.1:18101
Environment=CARDS_FILE=/root/lan/data/cards.json
EnvironmentFile=/root/lan/.env
ExecStart=/usr/local/bin/node /root/lan/site/node_modules/next/dist/bin/next start -H 0.0.0.0 -p 18100
Restart=always
RestartSec=3
StandardOutput=append:/root/lan/logs/site.log
StandardError=append:/root/lan/logs/site.log

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/logrotate.d/lan <<'LOGROTATE'
/root/lan/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    copytruncate
}
LOGROTATE

systemctl daemon-reload
systemctl enable lan-engine lan-site >/dev/null 2>&1
systemctl restart lan-engine
sleep 3
systemctl restart lan-site
sleep 8
"@
$tmp = Join-Path $env:TEMP "lan-units.sh"
[System.IO.File]::WriteAllText($tmp, ($units -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
Invoke-Scp $tmp "$RemoteDir/setup-units.sh"
Invoke-Ssh "bash $RemoteDir/setup-units.sh"

Write-Host "`n==> 6/7 self-check" -ForegroundColor Cyan
$checkScript = @"
echo '--- services ---'; systemctl is-active lan-engine lan-site
echo '--- ports ---';    ss -lntp | grep -E ':($SitePort|$EnginePort)\b'
echo '--- engine ---';   curl -s -o /dev/null -w 'health %{http_code}\n' http://127.0.0.1:$EnginePort/health
echo '--- site ---';     curl -s -o /dev/null -w 'enter  %{http_code}\n' http://127.0.0.1:$SitePort/enter
echo '--- pool ---';     curl -s http://127.0.0.1:$EnginePort/site/pool | head -c 160; echo
"@
$checkTmp = Join-Path $env:TEMP "lan-check.sh"
[System.IO.File]::WriteAllText($checkTmp, ($checkScript -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
Invoke-Scp $checkTmp "$RemoteDir/check.sh"
Invoke-Ssh "bash $RemoteDir/check.sh"

Write-Host "`n==> 7/7 external reachability" -ForegroundColor Cyan
$ip = ($Server -split "@")[-1]
try {
  $r = Invoke-WebRequest "http://${ip}:$SitePort/enter" -TimeoutSec 15 -UseBasicParsing
  Write-Host "   http://${ip}:$SitePort/enter -> $($r.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "   external unreachable: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "   check cloud security group for TCP $SitePort" -ForegroundColor Yellow
}

Remove-Item $Work -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nDone." -ForegroundColor Green
Write-Host "   site : http://${ip}:$SitePort"
Write-Host "   pass : see /root/lan/data/site_pass.txt on the server"
