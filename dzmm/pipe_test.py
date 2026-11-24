import subprocess, sys
ps = r'''
$ErrorActionPreference='Stop'
try {
  $p = New-Object System.IO.Pipes.NamedPipeClientStream(".", "verge-mihomo", [System.IO.Pipes.PipeDirection]::InOut)
  $p.Connect(3000)
  $req = [System.Text.Encoding]::ASCII.GetBytes("GET /version HTTP/1.1`r`nHost: localhost`r`nConnection: close`r`n`r`n")
  $p.Write($req, 0, $req.Length)
  $p.Flush()
  $buf = New-Object byte[] 4096
  $n = $p.Read($buf, 0, 4096)
  $s = [System.Text.Encoding]::UTF8.GetString($buf, 0, $n)
  Write-Output $s
  $p.Dispose()
} catch { Write-Output ("ERR: " + $_.Exception.Message) }
'''
r = subprocess.run(["powershell","-NoProfile","-Command",ps], capture_output=True, text=True, timeout=30)
print(r.stdout[:800])
if r.stderr: print("STDERR:", r.stderr[:300])
