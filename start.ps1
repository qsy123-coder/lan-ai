# start.ps1 —— 一键启动「额度池」：Python 引擎 + Next.js 界面
#
#   powershell -ExecutionPolicy Bypass -File start.ps1
#   powershell -ExecutionPolicy Bypass -File start.ps1 -Rebuild -Port 3001
#
# 说明：工程在 UNC 共享上，Next.js 无法在共享路径构建，
#       所以运行副本放在 %LOCALAPPDATA%\dzmm-web，本脚本自动同步 + 首次自动安装/构建。
param(
  [switch]$NoOpen,
  [switch]$Rebuild,
  [int]$Port = 3000,
  [int]$EnginePort = 8787
)

$ErrorActionPreference = "Stop"
$ROOT  = $PSScriptRoot
$SRC   = Join-Path $ROOT "web"
$RT    = Join-Path $env:LOCALAPPDATA "dzmm-web"
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

Write-Host "`n  额度池 · 连续生成控制台" -ForegroundColor Magenta
Write-Host "  ─────────────────────────────" -ForegroundColor DarkGray

# 0) 运行目录同步
New-Item -ItemType Directory -Force -Path $RT | Out-Null
robocopy (Join-Path $SRC "app") (Join-Path $RT "app") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
foreach ($f in @("package.json", ".npmrc", "next.config.mjs")) {
  Copy-Item (Join-Path $SRC $f) (Join-Path $RT $f) -Force
}

$needInstall = -not (Test-Path (Join-Path $RT "node_modules\next"))
$needBuild = $Rebuild -or -not (Test-Path (Join-Path $RT ".next\BUILD_ID"))
if (-not $needBuild) {
  # 只扫 app/ 会漏掉 lib/ 与 components/ 的改动，三处一起看。
  $srcDirs = @("app", "lib", "components") | ForEach-Object { Join-Path $RT $_ } |
             Where-Object { Test-Path $_ }
  $newest = Get-ChildItem $srcDirs -Recurse -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($newest -and $newest.LastWriteTime -gt (Get-Item (Join-Path $RT ".next\BUILD_ID")).LastWriteTime) {
    $needBuild = $true
  }
}

if ($needInstall) {
  Write-Host "  [0/3] 安装依赖（首次，约 40s）…" -ForegroundColor Cyan
  & $NODE $PNPM install --dir $RT | Select-Object -Last 4
}
if ($needBuild) {
  Write-Host "  [0/3] 构建界面（约 20s）…" -ForegroundColor Cyan
  Push-Location $RT
  & $NODE ".\node_modules\next\dist\bin\next" build | Select-Object -Last 6
  Pop-Location
}

# 1) 引擎
if (-not (Test-Port $EnginePort)) {
  Write-Host "  [1/3] 启动引擎 :$EnginePort" -ForegroundColor Cyan
  $env:DZMM_ROOT = $ROOT
  $env:DZMM_PROXY = if ($env:DZMM_PROXY) { $env:DZMM_PROXY } else { "http://127.0.0.1:7897" }
  Start-Process -FilePath $PY `
    -ArgumentList "`"$(Join-Path $ROOT 'engine\server.py')`" --port $EnginePort" `
    -WorkingDirectory $ROOT -WindowStyle Hidden | Out-Null
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 300
    if (Test-Port $EnginePort) { break }
  }
} else {
  Write-Host "  [1/3] 引擎已在 :$EnginePort" -ForegroundColor DarkGray
}

# 2) 界面
if (-not (Test-Port $Port)) {
  Write-Host "  [2/3] 启动界面 :$Port" -ForegroundColor Cyan
  $env:ENGINE_URL = "http://127.0.0.1:$EnginePort"
  Start-Process -FilePath $NODE `
    -ArgumentList "`"$(Join-Path $RT 'node_modules\next\dist\bin\next')`" start -p $Port" `
    -WorkingDirectory $RT -WindowStyle Hidden | Out-Null
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 300
    if (Test-Port $Port) { break }
  }
} else {
  Write-Host "  [2/3] 界面已在 :$Port" -ForegroundColor DarkGray
}

# 3) 打开
$url = "http://127.0.0.1:$Port"
$okEngine = Test-Port $EnginePort
$okWeb = Test-Port $Port
Write-Host "  [3/3] 引擎 $(if($okEngine){'在线'}else{'未起'}) · 界面 $(if($okWeb){'在线'}else{'未起'})" -ForegroundColor $(if($okEngine -and $okWeb){'Green'}else{'Red'})
Write-Host ""
Write-Host "  ✔ $url" -ForegroundColor Green
Write-Host "  停止：powershell -ExecutionPolicy Bypass -File stop.ps1" -ForegroundColor DarkGray
Write-Host ""
if (-not $NoOpen) { Start-Process $url }
