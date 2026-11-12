# scripts/capture.py —— mitmproxy addon
# 记录 dzmm.ai 上所有 /api/* 请求（含流式的 /api/chat），落到 captures/<时间>/trpc.jsonl
import json
import os
import time

from mitmproxy import http

OUT = os.path.join("captures", time.strftime("%Y%m%d-%H%M"))
os.makedirs(OUT, exist_ok=True)
LOG = os.path.join(OUT, "trpc.jsonl")

# 只关心这些前缀，避免把静态资源写爆
KEEP = ("/api/", "/ws/")


def response(flow: http.HTTPFlow) -> None:
    host = flow.request.pretty_host
    if not host.endswith("dzmm.ai"):
        return
    path = flow.request.path
    if not any(path.startswith(k) for k in KEEP):
        return

    def body(msg):
        if msg is None:
            return None
        try:
            txt = msg.get_text(strict=False)
        except Exception:
            return None
        return txt[:200000] if txt else None

    rec = {
        "t": time.time(),
        "method": flow.request.method,
        "path": path,
        "req_headers": dict(flow.request.headers),
        "req_cookies": flow.request.headers.get_all("cookie"),
        "req_body": body(flow.request),
        "status": flow.response.status_code if flow.response else None,
        "resp_headers": dict(flow.response.headers) if flow.response else {},
        "resp_body": body(flow.response),
    }
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
