# scripts/poc_generate.py —— 直接打 /api/chat，测试 model / maxTokens 是否被服务端按额度校验
#
# 用法:
#   python scripts/poc_generate.py --model nalang-max-0826 --max-tokens 4500
#   python scripts/poc_generate.py --model x-apex-flux-0217-16k --max-tokens 4500 --dry
#
# 依赖: out/session.json（含 cookie / access_token / chatId / cardId），可先用
#   node scripts/cdp.mjs "fetch('/api/trpc/chat.listAll...')" 拿 chatId
import argparse
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

BASE = "https://www.dzmm.ai"
SESSION = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out", "session.json")


def load_session():
    with io.open(SESSION, encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="x-apex-flux-0217-16k")
    ap.add_argument("--max-tokens", type=int, default=4500)
    ap.add_argument("--text", default="用一句话介绍你自己")
    ap.add_argument("--chat-id", default=None)
    ap.add_argument("--card-id", default=None)
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    ap.add_argument("--dry", action="store_true", help="只打印 body，不发请求")
    ap.add_argument("--timeout", type=int, default=90)
    args = ap.parse_args()

    s = load_session()
    chat_id = args.chat_id or s.get("chat_id")
    card_id = args.card_id or s.get("card_id")
    if not chat_id or not card_id:
        print("缺 chatId/cardId：先跑一次页面并写入 out/session.json")
        return 2

    body = {
        "operation": "generate",
        "chatId": chat_id,
        "cardId": str(card_id),
        "chatSettings": {
            "model": args.model,
            "style": "standard",
            "maxTokens": args.max_tokens,
            "randomIndex": 0,
            "deepThinking": False,
            "enableMemoryEnhance": False,
            "voiceSettings": {
                "ignore_parentheses": False,
                "only_quotes": True,
                "ignore_english": False,
                "read_asterisks": False,
            },
        },
        "presetConfig": {"presetIds": []},
        "prompts": [{"role": "user", "content": args.text}],
    }
    payload = json.dumps(body, ensure_ascii=False)
    print("BODY:", payload[:600])
    if args.dry:
        return 0

    proxies = {"http": args.proxy, "https": args.proxy} if args.proxy else None
    headers = {
        "content-type": "application/json",
        "cookie": s["cookie"],
        "origin": BASE,
        "referer": BASE + "/chat?c=" + chat_id,
        "x-dzmm-client": "web",
        "x-dzmm-request-id": "poc-%d" % int(time.time() * 1000),
    }
    t0 = time.time()
    try:
        r = creq.post(BASE + "/api/chat", data=payload.encode("utf-8"),
                      headers=headers, impersonate="chrome", proxies=proxies,
                      timeout=args.timeout, stream=False)
    except Exception as e:
        print("REQUEST ERROR:", e)
        return 1

    print("STATUS:", r.status_code, "| %.1fs" % (time.time() - t0))
    for k, v in r.headers.items():
        if k.lower() in ("content-type", "x-dzmm-captcha-required", "x-request-id", "x-dzmm-build"):
            print("  %s: %s" % (k, v))
    txt = r.text or ""
    print("RESP(%d):" % len(txt), txt[:800].replace("\n", "\\n"))

    out = os.path.join(os.path.dirname(SESSION), "poc_generate.jsonl")
    with io.open(out, "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(), "model": args.model, "maxTokens": args.max_tokens,
                            "status": r.status_code, "resp": txt[:4000]}, ensure_ascii=False) + "\n")
    return 0 if r.status_code == 200 else 1


if __name__ == "__main__":
    sys.exit(main())
