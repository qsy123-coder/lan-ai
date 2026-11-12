# scripts/replay_chat.py —— 用抓包里 /api/chat 的原始头 + 最新 cookie 复现生成请求
#
# 用法:
#   python scripts/replay_chat.py --model nalang-max-0826 --max-tokens 4500
#   python scripts/replay_chat.py --from-capture        # 用抓到的原始 body 原样重放（控制组）
#
# 说明: 直接抄抓包里的 headers（含 sec-fetch-*、priority、Edge UA、referer），
#       只替换 cookie 为最新值、body 为本次实验参数 —— 少一个头就可能拿到 403 Forbidden。
import argparse
import glob
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"


def latest_chat_flow():
    """取最近一条 /api/chat 抓包记录（含 headers / body）。"""
    best = None
    for p in glob.glob(os.path.join(ROOT, "captures", "*", "trpc.jsonl")):
        with io.open(p, encoding="utf-8") as f:
            for line in f:
                r = json.loads(line)
                if r["path"].startswith("/api/chat") and r["method"] == "POST":
                    if best is None or r["t"] > best["t"]:
                        best = r
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model")
    ap.add_argument("--max-tokens", type=int, default=4500)
    ap.add_argument("--text", default="一句话就好")
    ap.add_argument("--from-capture", action="store_true")
    ap.add_argument("--body-file")
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    ap.add_argument("--timeout", type=int, default=120)
    args = ap.parse_args()

    flow = latest_chat_flow()
    if not flow:
        print("没有 /api/chat 抓包，先在页面上发一条消息")
        return 2

    hdrs = {k: v for k, v in flow["req_headers"].items()
            if k.lower() not in ("content-length", "host", "connection")}
    cks = flow.get("req_cookies") or []
    cookie = "; ".join(cks) if cks else hdrs.get("cookie", "")
    hdrs["cookie"] = cookie
    print("cookie headers:", len(cks), "| names:", [c.split("=")[0] for c in cookie.split("; ")][:6])

    if args.body_file:
        body = io.open(args.body_file, encoding="utf-8-sig").read()
    elif args.from_capture and flow.get("req_body"):
        body = flow["req_body"]
    else:
        raw = flow.get("req_body") or ""
        base = json.loads(raw) if raw else {
            "operation": "generate", "chatId": None, "cardId": None,
            "chatSettings": {}, "presetConfig": {"presetIds": []}, "prompts": [],
        }
        base.setdefault("chatSettings", {})
        if args.model:
            base["chatSettings"]["model"] = args.model
        base["chatSettings"]["maxTokens"] = args.max_tokens
        base["prompts"] = [{"role": "user", "content": args.text}]
        body = json.dumps(base, ensure_ascii=False)

    bj = json.loads(body)
    print("MODEL:", bj["chatSettings"].get("model"),
          "| maxTokens:", bj["chatSettings"].get("maxTokens"),
          "| body:", len(body), "bytes")

    proxies = {"http": args.proxy, "https": args.proxy} if args.proxy else None
    t0 = time.time()
    r = creq.post(BASE + "/api/chat", data=body.encode("utf-8"), headers=hdrs,
                  impersonate="chrome", proxies=proxies, timeout=args.timeout)
    print("STATUS:", r.status_code, "| %.1fs" % (time.time() - t0))
    txt = r.text or ""
    print("HEAD:", {k: v for k, v in r.headers.items() if k.lower().startswith("x-")})
    print("RESP(%d):" % len(txt), txt[:600].replace("\n", "\\n"))

    with io.open(os.path.join(ROOT, "out", "poc_generate.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(), "model": args.model, "status": r.status_code,
                            "resp": txt[:4000]}, ensure_ascii=False) + "\n")
    return 0 if r.status_code == 200 else 1


if __name__ == "__main__":
    sys.exit(main())
