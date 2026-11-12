# stop.ps1 —— 停止「额度池」引擎与界面
param([int]$Port = 3000, [int]$EnginePort = 8787)

$stopped = 0
foreach ($p in @($EnginePort, $Port)) {
  $conns = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
      Write-Host "  停止 :$p -> $($proc.ProcessName) ($($proc.Id))"
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
      $stopped++
    }
  }
}
if ($stopped -eq 0) { Write-Host "  没有在跑的实例。" -ForegroundColor DarkGray }
else { Write-Host "  已停止 $stopped 个进程。" -ForegroundColor Green }
