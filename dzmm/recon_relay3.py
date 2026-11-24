# -*- coding: utf-8 -*-
"""relay 第三轮：LiteLLM 风格管理端点 + 错误注入。"""
import json
import time

import requests

BASE = "https://api.sillytraven.dev"
P = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"

GETS = [
    "/api/ai/health", "/api/ai/health/readiness", "/api/ai/health/liveliness",
    "/api/ai/model/info", "/api/ai/model/list", "/api/ai/models", "/api/ai/key/info",
    "/api/ai/spend/logs", "/api/ai/global/spend", "/api/ai/cache/ping",
    "/api/ai/metrics", "/api/ai/v1/messages", "/api/ai/v1/responses",
    "/api/ai/v2/health", "/api/ai/v2/model/info", "/api/ai/v2/keys/info",
    "/api/ai/v1/model/info", "/api/ai/v1/models/x-apex-surge-0505-16k",
]


def get(path):
    try:
        r = requests.get(BASE + path, headers={"User-Agent": UA}, proxies=P, timeout=15)
        return path, r.status_code, r.text[:110].replace("\n", " ")
    except Exception as e:
        return path, -1, str(e)[:60]


def post(label, path, body, headers=None):
    h = {"User-Agent": UA, "Content-Type": "application/json"}
    if headers:
        h.update(headers)
    try:
        r = requests.post(BASE + path, data=body, headers=h, proxies=P, timeout=25)
        return label, r.status_code, r.text[:180].replace("\n", " ")
    except Exception as e:
        return label, -1, str(e)[:60]


def main():
    print("== GET ==")
    for p in GETS:
        path, st, body = get(p)
        print("%-38s %-4s %s" % (path, st, body[:100]))
        time.sleep(0.4)

    print("\n== 错误注入 ==")
    cases = [
        ("type-error", "/api/ai/v1/chat/completions", json.dumps({"model": 1, "messages": "x"}), None),
        ("bad-json", "/api/ai/v1/chat/completions", "not json", None),
        ("empty", "/api/ai/v1/chat/completions", "{}", None),
        ("empty-bearer", "/api/ai/v1/chat/completions",
         json.dumps({"model": "x", "messages": []}), {"Authorization": "Bearer "}),
        ("null-key", "/api/ai/v1/chat/completions",
         json.dumps({"model": "x", "messages": []}), {"Authorization": "Bearer null"}),
        ("v2-no-card", "/api/ai/v2/chat/completions",
         json.dumps({"model": "x-apex-surge-0505-16k", "user_name": "a", "messages": []}), None),
        ("v2-bad-card-type", "/api/ai/v2/chat/completions",
         json.dumps({"model": "x", "user_name": "a", "card": 123,
                     "messages": [{"role": "user", "content": "hi"}]}), None),
    ]
    for label, path, body, hdrs in cases:
        l, st, resp = post(label, path, body, hdrs)
        print("%-18s %-4s %s" % (l, st, resp[:150]))
        time.sleep(0.5)


if __name__ == "__main__":
    main()
