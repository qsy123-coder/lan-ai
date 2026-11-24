# -*- coding: utf-8 -*-
"""
Clash Verge (mihomo) 控制接口客户端

优先走 TCP external-controller（默认 127.0.0.1:9097，secret 见 clash-verge.yaml）；
若不可用则回退到命名管道。

用途：枚举节点 / 切换节点 / 换出口 IP
"""
import json
import os
import subprocess
import tempfile

import requests

API = os.environ.get("CLASH_API", "http://127.0.0.1:9097")
SECRET = os.environ.get("CLASH_SECRET", "set-your-secret")
PIPE = "verge-mihomo"

_LOCAL = {"http": None, "https": None}  # 本地直连，别走代理


def _tcp(method, path, body=None):
    h = {"Authorization": "Bearer " + SECRET}
    try:
        r = requests.request(method, API + path, headers=h,
                             data=json.dumps(body, ensure_ascii=False) if body is not None else None,
                             timeout=15, proxies={"http": None, "https": None})
        try:
            return r.status_code, r.json()
        except Exception:
            return r.status_code, r.text[:300]
    except Exception as e:
        return None, "tcp_err:" + str(e)[:80]


_PS_TMPL = r'''
$ErrorActionPreference='Stop'
try {
  $p = New-Object System.IO.Pipes.NamedPipeClientStream(".", "@PIPE@", [System.IO.Pipes.PipeDirection]::InOut)
  $p.Connect(5000)
  $body = ''
  if ('@BODYFILE@' -ne '') { $body = [System.IO.File]::ReadAllText('@BODYFILE@', [System.Text.Encoding]::UTF8) }
  $head = "@METHOD@ @PATH@ HTTP/1.1`r`nHost: localhost`r`n@EXTRA@Connection: close`r`n`r`n"
  $req = [System.Text.Encoding]::UTF8.GetBytes($head + $body)
  $p.Write($req, 0, $req.Length); $p.Flush()
  $sr = New-Object System.IO.StreamReader($p, [System.Text.Encoding]::UTF8)
  $all = $sr.ReadToEnd(); $sr.Dispose(); $p.Dispose()
  [System.IO.File]::WriteAllText("@OUTFILE@", $all, (New-Object System.Text.UTF8Encoding $false))
} catch { Write-Output ("ERR:" + $_.Exception.Message) }
'''


def _pipe(method, path, body=None):
    extra = ""
    b = ""
    if body is not None:
        j = json.dumps(body, ensure_ascii=False)
        extra = "Content-Type: application/json`r`nContent-Length: %d`r`n" % len(j.encode("utf-8"))
        b = j
    fd, outfile = tempfile.mkstemp(suffix=".http")
    os.close(fd)
    bodyfile = ""
    if b:
        fd2, bodyfile = tempfile.mkstemp(suffix=".body")
        os.close(fd2)
        with open(bodyfile, "w", encoding="utf-8", newline="") as bf:
            bf.write(b)
    ps = (_PS_TMPL.replace("@PIPE@", PIPE).replace("@METHOD@", method)
          .replace("@PATH@", path).replace("@EXTRA@", extra)
          .replace("@BODYFILE@", bodyfile.replace("\\", "\\\\"))
          .replace("@OUTFILE@", outfile))
    try:
        subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True, timeout=60)
        raw = open(outfile, "rb").read()
    finally:
        for f_ in (outfile, bodyfile):
            if f_:
                try:
                    os.unlink(f_)
                except Exception:
                    pass
    if not raw:
        return None, "empty"
    head_b, _, body_b = raw.partition(b"\r\n\r\n")
    head = head_b.decode("utf-8", "replace")
    code = 0
    try:
        code = int(head.split()[1])
    except Exception:
        pass
    if b"chunked" in head_b.lower():
        parts, pos = [], 0
        while True:
            nl = body_b.find(b"\r\n", pos)
            if nl < 0:
                break
            size = int(body_b[pos:nl].strip().split(b";")[0] or b"0", 16)
            if size == 0:
                break
            parts.append(body_b[nl + 2:nl + 2 + size])
            pos = nl + 2 + size + 2
        body_b = b"".join(parts)
    txt = body_b.decode("utf-8", "replace")
    try:
        return code, json.loads(txt)
    except Exception:
        return code, txt[:300]


def api(method, path, body=None):
    code, data = _tcp(method, path, body)
    if code is not None:
        return code, data
    return _pipe(method, path, body)


def version():
    return api("GET", "/version")


def proxies():
    return api("GET", "/proxies")


def groups():
    code, data = proxies()
    out = []
    if code != 200 or not isinstance(data, dict):
        return out
    for name, p in (data.get("proxies") or {}).items():
        if p.get("type") in ("Selector", "URLTest", "Fallback", "LoadBalance"):
            out.append((name, p.get("now"), list(p.get("all") or [])))
    return out


def nodes(group="GLOBAL"):
    """返回该组里真正可用的节点名（过滤策略/信息项）"""
    code, data = proxies()
    if code != 200 or not isinstance(data, dict):
        return []
    pr = data.get("proxies") or {}
    g = pr.get(group) or {}
    bad = ("DIRECT", "REJECT", "REJECT-DROP", "COMPATIBLE", "PASS", "自动选择", "故障转移", "负载均衡")
    out = []
    for n in g.get("all") or []:
        if n in bad:
            continue
        if any(k in n for k in ("流量", "到期", "重置", "套餐", "官网", "订阅")):
            continue
        out.append(n)
    return out


def switch(group, node):
    from urllib.parse import quote
    return api("PUT", "/proxies/" + quote(group, safe=""), body={"name": node})


def current(group="GLOBAL"):
    code, data = proxies()
    if code == 200 and isinstance(data, dict):
        return (data.get("proxies", {}).get(group) or {}).get("now")
    return None


if __name__ == "__main__":
    print("version:", version())
    gs = groups()
    for name, now, alln in gs:
        print("[%s] now=%s 候选=%d" % (name, now, len(alln)))
    ns = nodes("GLOBAL")
    print("可用节点 %d 个，前 5：" % len(ns))
    for n in ns[:5]:
        print("  -", n)
