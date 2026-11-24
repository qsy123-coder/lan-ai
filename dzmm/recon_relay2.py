# -*- coding: utf-8 -*-
"""relay 第二轮：方法枚举 + v2 子路径 + 错误注入（看是否泄露 stack/内部字段）。"""
import json
import time
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.sillytraven.dev"
P = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"

PATHS = [
    "/api/ai/v1/completions", "/api/ai/v1/embeddings", "/api/ai/v1/audio/transcriptions",
    "/api/ai/v1/audio/speech", "/api/ai/v1/images/generations",
    "/api/ai/v2/session", "/api/ai/v2/token", "/api/ai/v2/auth", "/api/ai/v2/login",
    "/api/ai/v2/stream", "/api/ai/v2/complete", "/api/ai/v2/generate",
    "/api/ai/v2/card", "/api/ai/v2/cards", "/api/ai/v2/user", "/api/ai/v2/usage",
    "/api/ai/v2/keys", "/api/ai/v2/apikeys", "/api/ai/v2/health", "/api/ai/v2/status",
    "/api/ai/v2/models/x-apex-surge-0505-16k",
]


def opt(path):
    try:
        r = requests.options(BASE + path, headers={"User-Agent": UA, "Origin": "https://www.dzmm.ai"},
                             proxies=P, timeout=15)
        return path, "OPTIONS", r.status_code, (r.headers.get("Allow") or "")[:60], r.text[:80]
    except Exception as e:
        return path, "OPTIONS", -1, "", str(e)[:50]


def get(path):
    try:
        r = requests.get(BASE + path, headers={"User-Agent": UA}, proxies=P, timeout=15)
        ct = r.headers.get("Content-Type", "")[:20]
        return path, "GET", r.status_code, ct, r.text[:90].replace("\n", " ")
    except Exception as e:
        return path, "GET", -1, "", str(e)[:50]


def main():
    print("== OPTIONS ==")
    with ThreadPoolExecutor(max_workers=4) as ex:
        for p, m, st, allow, body in ex.map(opt, PATHS[:10]):
            print("%-34s %-8s %-4s allow=%-12s %s" % (p, m, st, allow, body))
            time.sleep(0.2)
    print("\n== GET 子路径 ==")
    with ThreadPoolExecutor(max_workers=4) as ex:
        for p, m, st, ct, body in ex.map(get, PATHS):
            print("%-34s %-4s %-20s %s" % (p, st, ct, body[:80]))
            time.sleep(0.2)


if __name__ == "__main__":
    main()
