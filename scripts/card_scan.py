# scripts/card_scan.py —— 扫描哪些卡片能新建会话并成功生成（403/404 = 不可用）
#
# 用法:
#   python scripts/card_scan.py --cards 3774387,3821218,... --max-tokens 100 --gap 1.5
# 产出: out/card_scan.jsonl（每张卡的 createByCard / generate 状态），可用的 cardId 打到 stdout
import argparse
import glob
import io
import json
import os
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
OUT = os.path.join(ROOT, "out", "card_scan.jsonl")


def latest_flow():
    best = None
    for p in glob.glob(os.path.join(ROOT, "captures", "*", "trpc.jsonl")):
        with io.open(p, encoding="utf-8") as f:
            for line in f:
                r = json.loads(line)
                if r["path"].startswith("/api/chat") and r["method"] == "POST":
                    if best is None or r["t"] > best["t"]:
                        best = r
    return best


def headers_of(flow):
    h = {k: v for k, v in flow["req_headers"].items()
         if k.lower() not in ("content-length", "host", "connection")}
    h["cookie"] = "; ".join(flow.get("req_cookies") or [])
    return h


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cards", required=True)
    ap.add_argument("--max-tokens", type=int, default=100)
    ap.add_argument("--model", default="nalang-max-0826")
    ap.add_argument("--gap", type=float, default=1.5)
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    args = ap.parse_args()

    flow = latest_flow()
    if not flow:
        print("没有 /api/chat 抓包")
        return 2
    h = headers_of(flow)
    proxy = {"http": args.proxy, "https": args.proxy}
    tpl = json.load(io.open(os.path.join(ROOT, "out", "chat_body_exact.json"), encoding="utf-8-sig"))

    ok_cards = []
    for raw in args.cards.split(","):
        card = int(raw.strip())
        try:
            r = creq.post(BASE + "/api/trpc/chat.createByCard",
                          data=json.dumps({"json": {"cardId": card}}),
                          headers={**h, "content-type": "application/json"},
                          impersonate="chrome", proxies=proxy, timeout=40)
            cid = json.loads(r.text)["result"]["data"]["json"]["chatId"]
        except Exception as e:
            print("card %-8s create ERR %s" % (card, str(e)[:60]))
            continue

        b = json.loads(json.dumps(tpl))
        b["chatId"] = cid
        b["cardId"] = str(card)
        b["chatSettings"]["model"] = args.model
        b["chatSettings"]["maxTokens"] = args.max_tokens
        b["prompts"] = [{"role": "user", "content": "一句话"}]
        b["content"] = "一句话"
        b.pop("parentGenerationId", None)
        try:
            g = creq.post(BASE + "/api/chat", data=json.dumps(b, ensure_ascii=False).encode(),
                          headers={**h, "content-type": "application/json", "referer": BASE + "/chat?c=" + cid},
                          impersonate="chrome", proxies=proxy, timeout=90)
            ok = g.status_code == 200 and '"type":"init"' in (g.text or "")
            note = (g.text or "")[:80].replace("\n", " ")
        except Exception as e:
            g, ok, note = None, False, "ERR " + str(e)[:60]

        print("card %-8s chat %s -> %s %s" % (card, cid[:8], getattr(g, "status_code", "ERR"), note))
        if ok:
            ok_cards.append(card)
        with io.open(OUT, "a", encoding="utf-8") as f:
            f.write(json.dumps({"t": time.time(), "card": card, "chat": cid,
                                "status": getattr(g, "status_code", None), "ok": ok},
                               ensure_ascii=False) + "\n")
        time.sleep(args.gap)

    print("USABLE:", ",".join(str(c) for c in ok_cards))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
