# push-deploy.ps1 —— 一条命令把站推到你的服务器并配置好子域
#
#   .\push-deploy.ps1 -Server root@1.2.3.4 -Domain lan.yourdomain.com
#   .\push-deploy.ps1 -Server root@1.2.3.4 -Domain lan.yourdomain.com -Pass lan-4006
#
# 做的事情：
#   1) 检查 DNS 是否已指向该服务器
#   2) 把 deploy/ 传到 /root/lan
#   3) 远程执行 setup-subdomain.sh（起容器、写 nginx、签证书、自检）
#   4) 从本机验证 https 可达
param(
  [Parameter(Mandatory = $true)][string]$Server,   # 形如 root@1.2.3.4
  [Parameter(Mandatory = $true)][string]$Domain,   # 形如 lan.yourdomain.com
  [string]$Pass = "",
  [switch]$NoCert
)

$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot

Write-Host "`n==> 1/4 检查 DNS" -ForegroundColor Cyan
try {
  $ips = (Resolve-DnsName $Domain -Type A -ErrorAction Stop | Where-Object { $_.IPAddress }).IPAddress
  Write-Host "   $Domain -> $($ips -join ', ')"
} catch {
  Write-Host "   ⚠ 解析不到 $Domain，先去 DNS 加一条 A 记录，否则证书签不下来" -ForegroundColor Yellow
}
$hostPart = $Server.Split("@")[-1]
try {
  $srvIp = (Resolve-DnsName $hostPart -Type A -ErrorAction Stop | Where-Object { $_.IPAddress }).IPAddress | Select-Object -First 1
  if ($srvIp) { Write-Host "   服务器 IP: $srvIp" }
} catch { $srvIp = $hostPart }

Write-Host "`n==> 2/4 上传 deploy/" -ForegroundColor Cyan
& ssh $Server "mkdir -p /root/lan"
& scp -r "$Here\*" "${Server}:/root/lan/"
if ($LASTEXITCODE -ne 0) { throw "上传失败" }

Write-Host "`n==> 3/4 远程执行部署脚本" -ForegroundColor Cyan
$flag = if ($NoCert) { " --no-cert" } else { "" }
$pre = if ($Pass) { "sed -i 's/^SITE_PASS=.*/SITE_PASS=$Pass/' /root/lan/.env 2>/dev/null || true; " } else { "" }
& ssh $Server "cd /root/lan && chmod +x setup-subdomain.sh && ${pre}bash setup-subdomain.sh $Domain$flag"

Write-Host "`n==> 4/4 本机验证" -ForegroundColor Cyan
foreach ($u in @("https://$Domain/enter", "https://$Domain/")) {
  try {
    $r = Invoke-WebRequest $u -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20 -ErrorAction SilentlyContinue
    Write-Host "   $u -> $($r.StatusCode)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "   $u -> $(if($code){$code}else{'连接失败'})"
  }
}

Write-Host "`n完成。手机打开 https://$Domain ，口令见上面脚本输出。" -ForegroundColor Green
