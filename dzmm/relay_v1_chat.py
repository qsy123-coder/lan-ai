# -*- coding: utf-8 -*-
"""用站点 X-MGW-Auth 直连 relay v1 OpenAI 兼容端点（无需 api_token）。

用法:
  python relay_v1_chat.py --models            列出可用模型
  python relay_v1_chat.py "你好"              用默认模型对话
  python relay_v1_chat.py --model <id> "你好"  指定模型
"""
import base64
import json
import sys

import requests

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

BASE = "https://api.sillytraven.dev/api/ai/v1"
DEFAULT_MODEL = "nalang-turbo-1115-16k"


def mgw_auth(real):
    payload = {"access_token": real["access_token"],
               "refresh_token": real.get("refresh_token", "")}
    return base64.b64encode(
        json.dumps(payload, separators=(",", ":")).encode()).decode()


def load():
    return json.load(open("real_account.json", encoding="utf-8"))


def list_models():
    r = requests.get(BASE + "/models", proxies=C.PROXIES, timeout=30)
    j = r.json()
    rows = j.get("data", [])
    print("%d models" % len(rows))
    for m in rows:
        pr = m.get("pricing") or {}
        print("  %-32s in=%s out=%s ctx=%s" % (m.get("id"), pr.get("input"), pr.get("output"),
                                               m.get("context_window")))
    return rows


def chat(prompt, model=DEFAULT_MODEL, stream=False, max_tokens=120):
    real = load()
    h = {"Content-Type": "application/json", "X-MGW-Auth": mgw_auth(real)}
    body = {"model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens, "stream": stream}
    r = requests.post(BASE + "/chat/completions", headers=h,
                      data=json.dumps(body), proxies=C.PROXIES, timeout=120, stream=stream)
    print("HTTP", r.status_code)
    if r.status_code != 200:
        print(r.text[:500])
        return None
    if not stream:
        j = r.json()
        txt = (j.get("choices") or [{}])[0].get("message", {}).get("content")
        print("usage:", json.dumps(j.get("usage"), ensure_ascii=False))
        print("--- reply ---")
        print(txt)
        return txt
    out = []
    for line in r.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        p = line[6:].strip()
        if p == "[DONE]":
            break
        try:
            ev = json.loads(p)
        except Exception:
            continue
        d = (ev.get("choices") or [{}])[0].get("delta") or {}
        if d.get("content"):
            out.append(d["content"])
            sys.stdout.write(d["content"])
            sys.stdout.flush()
        if ev.get("usage"):
            print("\nusage:", json.dumps(ev["usage"], ensure_ascii=False))
    print()
    return "".join(out)


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--models" in args:
        list_models()
    elif args and args[0] == "--model":
        model = args[1]
        prompt = args[2] if len(args) > 2 else "你好"
        chat(prompt, model=model)
    else:
        chat(args[0] if args else "你好")
