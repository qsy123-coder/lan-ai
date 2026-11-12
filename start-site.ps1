# start-site.ps1 —— 启动「澜」角色对话站（液态玻璃版）：Python 引擎 + Next.js 前台
#
#   powershell -ExecutionPolicy Bypass -File start-site.ps1
#   powershell -ExecutionPolicy Bypass -File start-site.ps1 -Port 3101 -Rebuild
param(
  [switch]$NoOpen,
  [switch]$Rebuild,
  [int]$Port = 3100,
  [int]$EnginePort = 8787,
  [switch]$Tunnel
)

$ErrorActionPreference = "Stop"
$ROOT  = $PSScriptRoot
$SRC   = Join-Path $ROOT "site"
$RT    = Join-Path $env:LOCALAPPDATA "dzmm-site"
$CARDS = Join-Path $ROOT "captures\site\cards.json"
$PY    = if ($env:LAN_PY) { $env:LAN_PY }
         elseif (Test-Path "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe") { "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe" }
         else { (Get-Command python -ErrorAction Stop).Source }
$NODE  = if ($env:LAN_NODE) { $env:LAN_NODE }
         elseif (Test-Path "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe") { "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" }
         else { (Get-Command node -ErrorAction Stop).Source }
$PNPM  = if ($env:LAN_PNPM) { $env:LAN_PNPM }
         elseif (Test-Path "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs") { "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs" }
         elseif (Test-Path (Join-Path $env:APPDATA "npm\node_modules\pnpm\bin\pnpm.cjs")) { Join-Path $env:APPDATA "npm\node_modules\pnpm\bin\pnpm.cjs" }
         else { throw "找不到 pnpm，请设置 LAN_PNPM" }
function Test-Port([int]$p) {
  [bool](Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue)
}

# 口令与引擎 token：首次自动生成，之后从文件读
$TOKEN_FILE = Join-Path $ROOT "out\site_token.txt"
$PASS_FILE  = Join-Path $ROOT "out\site_pass.txt"
if (-not (Test-Path $TOKEN_FILE)) {
  New-Item -ItemType Directory -Force -Path (Join-Path $ROOT "out") | Out-Null
  Set-Content -Path $TOKEN_FILE -Value ([System.Text.Encoding]::UTF8.GetBytes("lg-" + (Get-Random -Minimum 100000 -Maximum 999999))) -Encoding Byte
}
if (-not (Test-Path $PASS_FILE)) {
  Set-Content -Path $PASS_FILE -Value ([System.Text.Encoding]::UTF8.GetBytes("lan-" + (Get-Random -Minimum 1000 -Maximum 9999))) -Encoding Byte
}
$env:SITE_TOKEN = (Get-Content $TOKEN_FILE -Raw -Encoding UTF8).Trim()
$env:SITE_PASS  = (Get-Content $PASS_FILE  -Raw -Encoding UTF8).Trim()

Write-Host "`n  澜 · 角色对话站" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────" -ForegroundColor DarkGray

# 0) 同步 + 依赖 + 构建
New-Item -ItemType Directory -Force -Path $RT | Out-Null
robocopy $SRC $RT /E /XD node_modules .next /NFL /NDL /NJH /NJS /NP | Out-Null

$needInstall = -not (Test-Path (Join-Path $RT "node_modules\next"))
$needBuild = $Rebuild -or -not (Test-Path (Join-Path $RT ".next\BUILD_ID"))
if (-not $needBuild) {
  $newest = Get-ChildItem (Join-Path $RT "app") -Recurse -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($newest.LastWriteTime -gt (Get-Item (Join-Path $RT ".next\BUILD_ID")).LastWriteTime) {
    $needBuild = $true
  }
}
if ($needInstall) {
  Write-Host "  [0/3] 安装依赖…" -ForegroundColor Cyan
  & $NODE $PNPM install --dir $RT | Select-Object -Last 3
}
if ($needBuild) {
  Write-Host "  [0/3] 构建前台…" -ForegroundColor Cyan
  Push-Location $RT
  & $NODE ".\node_modules\next\dist\bin\next" build | Select-Object -Last 4
  Pop-Location
}

# 1) 引擎（额度池）
if (-not (Test-Port $EnginePort)) {
  Write-Host "  [1/3] 启动引擎 :$EnginePort" -ForegroundColor Cyan
  $env:DZMM_ROOT = $ROOT
  Start-Process -FilePath $PY `
    -ArgumentList "`"$(Join-Path $ROOT 'engine\server.py')`" --port $EnginePort" `
    -WorkingDirectory $ROOT -WindowStyle Hidden | Out-Null
  for ($i = 0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 300; if (Test-Port $EnginePort) { break } }
} else {
  Write-Host "  [1/3] 引擎已在 :$EnginePort" -ForegroundColor DarkGray
}

# 2) 前台
if (-not (Test-Port $Port)) {
  Write-Host "  [2/3] 启动前台 :$Port" -ForegroundColor Cyan
  $env:ENGINE_URL = "http://127.0.0.1:$EnginePort"
  $env:CARDS_FILE = $CARDS
  Start-Process -FilePath $NODE `
    -ArgumentList "`"$(Join-Path $RT 'node_modules\next\dist\bin\next')`" start -p $Port" `
    -WorkingDirectory $RT -WindowStyle Hidden | Out-Null
  for ($i = 0; $i -lt 60; $i++) { Start-Sleep -Milliseconds 300; if (Test-Port $Port) { break } }
} else {
  Write-Host "  [2/3] 前台已在 :$Port" -ForegroundColor DarkGray
}

$url = "http://127.0.0.1:$Port"
Write-Host "  [3/3] 引擎 $(if(Test-Port $EnginePort){'在线'}else{'未起'}) · 前台 $(if(Test-Port $Port){'在线'}else{'未起'})" -ForegroundColor Green
Write-Host ""
Write-Host "  ✔ $url" -ForegroundColor Green
Write-Host "  卡片库：$CARDS" -ForegroundColor DarkGray
Write-Host ""
if (-not $NoOpen) { Start-Process $url }

if ($Tunnel) {
  $cf = if ($env:LAN_CLOUDFLARED) { $env:LAN_CLOUDFLARED }
      elseif (Test-Path "C:\Users\dsh\cloudflared.exe") { "C:\Users\dsh\cloudflared.exe" }
      else { (Get-Command cloudflared -ErrorAction SilentlyContinue).Source }
  if (-not (Test-Path $cf)) { Write-Host "  找不到 cloudflared，跳过隧道" -ForegroundColor Red; return }
  Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  $log = Join-Path $ROOT "out\cf.log"
  Remove-Item $log -ErrorAction SilentlyContinue
  Start-Process -FilePath $cf -ArgumentList "tunnel","--url","http://127.0.0.1:$Port","--no-autoupdate","--logfile","$log" -WindowStyle Hidden
  $pub = $null
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path $log) {
      $m = Select-String -Path $log -Pattern "https://[-a-z0-9]+\.trycloudflare\.com" -AllMatches | Select-Object -First 1
      if ($m) { $pub = $m.Matches[0].Value; break }
    }
  }
  if ($pub) {
    Set-Content -Path (Join-Path $ROOT "out\tunnel_url.txt") -Value $pub -Encoding UTF8
    Write-Host "  ✔ 手机入口：$pub" -ForegroundColor Green
    Write-Host "  ✔ 口令：$($env:SITE_PASS)" -ForegroundColor Green
  } else {
    Write-Host "  隧道没拿到地址，看 out\cf.log" -ForegroundColor Red
  }
}
