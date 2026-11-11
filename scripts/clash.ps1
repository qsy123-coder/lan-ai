# scripts/clash.ps1 —— 通过 Clash Verge 命名管道调 mihomo API，列出/测速/切换出口节点
# 用法:
#   powershell -File scripts\clash.ps1 -Status          # 当前 GLOBAL 选中节点 + 版本
#   powershell -File scripts\clash.ps1 -List            # 所有节点
#   powershell -File scripts\clash.ps1 -Best            # 切到延迟最低的节点
#   powershell -File scripts\clash.ps1 -Set "节点名"     # 切到指定节点
param(
  [switch]$Status,
  [switch]$List,
  [switch]$Best,
  [string]$Set = ""
)

$ErrorActionPreference = "Stop"

function Get-ClashPipe {
  $p = [System.IO.Directory]::GetFiles('\\.\pipe\') | Where-Object { $_ -match 'verge-mihomo' } | Select-Object -First 1
  if (-not $p) { throw "找不到 Clash Verge 命名管道（verge-mihomo*）：Clash Verge 没在跑？" }
  return ($p -replace '^\\\\\.\\pipe\\', '')
}

function Invoke-ClashApi {
  param([string]$Method = 'GET', [string]$Path = '/', [string]$Body = '')
  $pipeName = Get-ClashPipe
  $pipe = New-Object System.IO.Pipes.NamedPipeClientStream('.', $pipeName, [System.IO.Pipes.PipeDirection]::InOut)
  $pipe.Connect(3000)
  $req = "$Method $Path HTTP/1.1`r`nHost: localhost`r`nAccept: application/json`r`nConnection: close`r`n"
  if ($Body) { $req += "Content-Type: application/json`r`nContent-Length: $([Text.Encoding]::UTF8.GetByteCount($Body))`r`n" }
  $req += "`r`n$Body"
  $bytes = [Text.Encoding]::UTF8.GetBytes($req)
  $pipe.Write($bytes, 0, $bytes.Length)
  $pipe.Flush()

  $ms = New-Object System.IO.MemoryStream
  $buf = New-Object byte[] 8192
  while (($n = $pipe.Read($buf, 0, $buf.Length)) -gt 0) { $ms.Write($buf, 0, $n) }
  $pipe.Dispose()
  $all = $ms.ToArray()

  # 找 \r\n\r\n 的字节位置
  $sep = -1
  for ($i = 0; $i -lt $all.Length - 3; $i++) {
    if ($all[$i] -eq 13 -and $all[$i + 1] -eq 10 -and $all[$i + 2] -eq 13 -and $all[$i + 3] -eq 10) { $sep = $i; break }
  }
  if ($sep -lt 0) { throw "管道响应不是 HTTP（%d 字节）" -f $all.Length }
  $head = [Text.Encoding]::ASCII.GetString($all, 0, $sep)
  $bodyStart = $sep + 4

  if ($head -match 'Transfer-Encoding:\s*chunked') {
    $out = New-Object System.IO.MemoryStream
    $pos = $bodyStart
    while ($pos -lt $all.Length) {
      $eol = -1
      for ($i = $pos; $i -lt $all.Length - 1; $i++) { if ($all[$i] -eq 13 -and $all[$i + 1] -eq 10) { $eol = $i; break } }
      if ($eol -lt 0) { break }
      $hex = [Text.Encoding]::ASCII.GetString($all, $pos, $eol - $pos).Trim()
      if (-not $hex) { break }
      $len = [Convert]::ToInt32($hex, 16)
      if ($len -le 0) { break }
      $out.Write($all, $eol + 2, $len)
      $pos = $eol + 2 + $len + 2
    }
    $payload = [Text.Encoding]::UTF8.GetString($out.ToArray())
  } else {
    $payload = [Text.Encoding]::UTF8.GetString($all, $bodyStart, $all.Length - $bodyStart)
  }
  return ($payload | ConvertFrom-Json)
}

$ver = Invoke-ClashApi -Path '/version'
$proxies = Invoke-ClashApi -Path '/proxies'
$g = $proxies.proxies.GLOBAL

if ($Status -or (-not $List -and -not $Best -and -not $Set)) {
  "mihomo $($ver.version) | GLOBAL -> $($g.now) | 节点数 $($g.all.Count)"
  "前 12: " + (($g.all | Select-Object -First 12) -join ', ')
  return
}

if ($List) {
  $g.all | ForEach-Object { [pscustomobject]@{ Node = $_; Type = $proxies.proxies.$_.type; Now = ($_ -eq $g.now) } } | Format-Table -AutoSize
  return
}

if ($Best) {
  $best = $null; $bestLat = [int]::MaxValue
  foreach ($name in $g.all) {
    $enc = [Uri]::EscapeDataString($name)
    try {
      $r = Invoke-ClashApi -Path "/proxies/$enc/delay?url=https%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=3000"
      if ($r.delay -lt $bestLat) { $bestLat = $r.delay; $best = $name }
    } catch { }
  }
  if ($best) {
    Invoke-ClashApi -Method PUT -Path '/proxies/GLOBAL' -Body (@{ name = $best } | ConvertTo-Json -Compress) | Out-Null
    "已切到 $best ($bestLat ms)"
  } else { "没有测出可用节点" }
  return
}

if ($Set) {
  Invoke-ClashApi -Method PUT -Path '/proxies/GLOBAL' -Body (@{ name = $Set } | ConvertTo-Json -Compress) | Out-Null
  $g2 = (Invoke-ClashApi -Path '/proxies').proxies.GLOBAL
  "GLOBAL -> $($g2.now)"
}
