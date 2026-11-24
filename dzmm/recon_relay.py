# -*- coding: utf-8 -*-
"""relay (api.sillytraven.dev) 指纹与未鉴权端点枚举。

只读，GET/OPTIONS，不发送凭据。
"""
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.sillytraven.dev"
P = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"

PATHS = [
    "/", "/api", "/api/", "/api/docs", "/api/docs-json", "/api/swagger", "/swagger",
    "/swagger-json", "/api-json", "/docs", "/openapi.json", "/api/openapi.json",
    "/api/health", "/health", "/healthz", "/metrics", "/api/metrics",
    "/api/ai", "/api/ai/", "/api/ai/v1", "/api/ai/v2", "/api/ai/v1/models", "/api/ai/v2/models",
    "/api/ai/debug", "/api/ai/status", "/api/ai/health", "/api/ai/config",
    "/api/ai/v1/chat/completions", "/api/ai/v2/chat/completions",
    "/.git/config", "/.env", "/api/version", "/version",
]


def probe(path):
    try:
        r = requests.get(BASE + path, headers={"User-Agent": UA, "Accept": "*/*"},
                         proxies=P, timeout=20, allow_redirects=False)
        body = r.text[:160].replace("\n", " ")
        hdr = {k: v for k, v in r.headers.items()
               if k.lower() in ("server", "x-powered-by", "via", "x-request-id", "content-type")}
        return path, r.status_code, hdr, body
    except Exception as e:
        return path, -1, {}, str(e)[:60]


def main():
    print("%-34s %-4s %-28s %s" % ("path", "st", "headers", "body"))
    with ThreadPoolExecutor(max_workers=5) as ex:
        for path, st, hdr, body in ex.map(probe, PATHS):
            h = ",".join("%s=%s" % (k, v) for k, v in hdr.items())[:28]
            print("%-34s %-4s %-28s %s" % (path, st, h, body[:90]))
            time.sleep(0.2)


if __name__ == "__main__":
    main()
