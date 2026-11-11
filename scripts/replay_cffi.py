# scripts/replay_cffi.py  —— python replay_cffi.py <path> <cookie> [bodyFile]
import sys, json
from curl_cffi import requests as creq

path, cookie = sys.argv[1], sys.argv[2]
body = open(sys.argv[3], encoding="utf-8").read() if len(sys.argv) > 3 else None
r = creq.request(
    "POST" if body else "GET",
    "https://www.dzmm.ai" + path,
    headers={
        "content-type": "application/json",
        "cookie": cookie,
        "x-dzmm-client": "web",
        "origin": "https://www.dzmm.ai",
        "referer": "https://www.dzmm.ai/",
    },
    data=body,
    impersonate="chrome",
    proxies={"https": "http://127.0.0.1:7897"},
    timeout=40,
)
print(r.status_code, {k: v for k, v in r.headers.items() if k.startswith("x-dzmm")})
print(r.text[:4000])
