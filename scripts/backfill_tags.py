# scripts/backfill_tags.py —— 给 feed 拉来的卡补 tags（feed 不填 tags，getById 才有）
#
# 事实（notes/010 §1.1、notes/011）：
#   home.getCards  {"type":T}                  -> 200，一页 24 张，tags 恒为 []
#   card.getById   {"cardId":N}                -> 200，tags 完整（同一张卡 20 个标签）
#   card.getById   已下架                      -> 200 + json:null
#
# 418 闸门按请求数触发（约 15 发），所以：
#   - 默认 --limit 12（一轮不超过闸门阈值）
#   - --gap 2.0s
#   - 命中 418 立即落盘退出（码 2），冷却 / 换节点后重跑同一条命令即可续
#
#   python -I scripts/backfill_tags.py --dry                  # 看还差多少张
#   python -I scripts/backfill_tags.py --limit 12             # 补 12 张
#   python -I scripts/backfill_tags.py --limit 12 --loop      # 补完再补，直到补满或撞闸门
import argparse
import io
import json
import os
import sys
import time
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, "captures", "site", "cards.json")
LOG = os.path.join(ROOT, "out", "backfill_tags.jsonl")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")


def safe(text):
    try:
        print(text)
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or "utf-8"
        print(text.encode(enc, "replace").decode(enc, "replace"))


def headers():
    return {
        "accept": "application/json, text/plain, */*",
        "origin": BASE, "referer": BASE + "/", "user-agent": UA,
        "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
        "x-dzmm-request-id": uuid.uuid4().hex,
        "sec-fetch-dest": "empty", "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


class Gate(Exception):
    pass


def get_by_id(cid):
    url = "%s/api/trpc/card.getById?batch=1&input=%s" % (
        BASE, quote(json.dumps({"0": {"json": {"cardId": cid}}}), safe=""))
    r = creq.get(url, headers=headers(), impersonate="chrome", proxies=PROXY, timeout=40)
    text = r.text or ""
    if r.status_code in (418, 429) or "captcha_required" in text[:400]:
        raise Gate("%s %s" % (r.status_code, text[:120]))
    if r.status_code != 200:
        return None, "HTTP %s" % r.status_code
    body = json.loads(text)
    if not (isinstance(body, list) and body):
        return None, "bad body"
    if "error" in body[0]:
        e = body[0]["error"].get("json") or {}
        return None, "tRPC %s" % e.get("message")
    d = body[0]["result"]["data"]["json"]
    if d is None:
        return None, "null(已下架)"
    return d, "ok"


def flush(cards):
    tmp = CARDS + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, CARDS)


def log(rec):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with io.open(LOG, "a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def pending(cards):
    return [c for c in cards if not c.get("tags") and c.get("id")]


def run_batch(cards, limit, gap):
    """返回 (added, gated, dead)"""
    todo = pending(cards)
    added = gated = dead = 0
    idx = {c["id"]: c for c in cards}
    for i, c in enumerate(todo[:limit]):
        cid = c["id"]
        try:
            d, note = get_by_id(cid)
        except Gate as e:
            safe("!! 418 闸门：%s" % e)
            return added, True, dead
        if d and d.get("tags"):
            idx[cid]["tags"] = d["tags"]
            # 顺手把 feed 没给全的字段补齐
            for src, dst in (("weightedRating", "rating"), ("popularityScore", "popularity")):
                if d.get(src) is not None:
                    idx[cid][dst] = d[src]
            added += 1
            safe("[%2d/%2d] +%s  tags=%d" % (i + 1, min(limit, len(todo)), cid, len(d["tags"])))
        elif d is None:
            dead += 1
            safe("[%2d/%2d] -%s  %s" % (i + 1, min(limit, len(todo)), cid, note))
        else:
            # 200 但 tags 为空：真实无标签卡，记下来别反复重试
            idx[cid]["tags"] = []
            c["_tags_checked"] = True
            safe("[%2d/%2d] =%s  无标签" % (i + 1, min(limit, len(todo)), cid))
        log({"cardId": cid, "note": note, "tags": len(d["tags"]) if d and d.get("tags") else 0})
        time.sleep(gap)
    return added, False, dead


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=12, help="本轮最多补几张（默认 12，低于闸门阈值）")
    ap.add_argument("--gap", type=float, default=2.0, help="每发间隔秒（默认 2.0）")
    ap.add_argument("--loop", action="store_true", help="补完一轮继续补，直到补满或撞闸门")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    cards = json.load(io.open(CARDS, encoding="utf-8"))
    todo = pending(cards)
    safe("total %d，待补 tags %d" % (len(cards), len(todo)))

    if args.dry:
        safe("would send up to %d requests (~%.0fs)" % (min(args.limit, len(todo)),
                                                        min(args.limit, len(todo)) * args.gap))
        return 0

    if not todo:
        safe("没有待补的卡")
        return 0

    round_no = 0
    total_added = 0
    while True:
        round_no += 1
        added, gated, dead = run_batch(cards, args.limit, args.gap)
        flush(cards)
        total_added += added
        safe("本轮 +%d（累计 +%d，剩余待补 %d）" % (added, total_added, len(pending(cards))))
        if gated:
            safe("!! 已停手。冷却 / 换节点后重跑同一条命令即可续")
            return 2
        if not args.loop or not pending(cards) or added == 0:
            break
        time.sleep(max(30.0, args.gap * 15))

    safe("done 累计补 %d 张，剩余待补 %d" % (total_added, len(pending(cards))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
