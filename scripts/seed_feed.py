# scripts/seed_feed.py —— 用匿名 feed 接口重建卡库 captures/site/cards.json
#
# 已核实的事实（2026-11-12 实测，全部匿名可读）：
#   home.getCards {"type": <T>}                   -> 200，一页 24 张，且**行就是完整卡片对象**
#   home.getCards {"type": <T>, "limit": 100}      -> 200，仍只给 24（服务端封顶）
#   home.getCards {"type": <T>, "cursor": N}       -> N > 1000 报「小于等于 1000」=> cursor 是页码，0..1000
#   home.newbie {}                                 -> 200，24 张
#   home.getHotTags {}                             -> 200，100 条
#   home.getCards 的 schema 是 zod .strict()：多一个未知键直接 400（categoryName/direction/meta 都是错的）
#
# 因此：一页 1 个请求拿 24 张完整卡，不必再逐张 card.getById。请求数降 24 倍，
# 对 418 闸门（约 15 发触发）更友好。
#
#   $env:HTTPS_PROXY='http://127.0.0.1:7897'
#   python -I scripts/seed_feed.py --pages 3                  # 试跑
#   python -I scripts/seed_feed.py --pages 40 --types newest  # 正式扩库
#   --dry 只打印计划不发请求
#
# 退出码：0 正常；2 命中 418 闸门（已落盘，冷却后重跑即可续）。
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
SITE = os.path.join(ROOT, "captures", "site")
CARDS = os.path.join(SITE, "cards.json")
LOG = os.path.join(ROOT, "out", "seed_feed.jsonl")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
TYPES = ["newest", "highest_rated_1d", "highest_rated_7d",
         "highest_rated_30d", "highest_rated_all", "games"]
GAP = float(os.environ.get("FETCH_GAP", "1.6"))
PAGE_MAX = 1000


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


def call(proc, payload):
    url = "%s/api/trpc/%s?batch=1&input=%s" % (
        BASE, proc, quote(json.dumps({"0": {"json": payload}}, ensure_ascii=False), safe=""))
    r = creq.get(url, headers=headers(), impersonate="chrome", proxies=PROXY, timeout=40)
    text = r.text or ""
    if r.status_code in (418, 429) or "captcha_required" in text[:400]:
        raise Gate("%s %s" % (r.status_code, text[:160]))
    if r.status_code != 200:
        return []
    body = json.loads(text)
    if not (isinstance(body, list) and body and "result" in body[0]):
        return []
    d = body[0]["result"]["data"]["json"]
    return d if isinstance(d, list) else []


def shape(c):
    """与 cards.json 既有结构保持一致；缺字段一律 None，别写空 dict 进去。"""
    return {
        "id": c.get("id"),
        "name": c.get("name"),
        "cover": c.get("cardFilename"),
        "images": [x.get("url") for x in (c.get("imageInfo") or []) if isinstance(x, dict)],
        "tags": c.get("tags") or [],
        "creator": c.get("creator") or c.get("creatorFullName"),
        "creatorAvatar": c.get("creatorAvatarUrl"),
        "creatorNotes": c.get("creatorNotes") or "",
        "likes": c.get("likesCount"),
        "comments": c.get("commentsCount"),
        "popularity": c.get("popularityScore"),
        "rating": c.get("weightedRating"),
        "isSensitive": c.get("isSensitive"),
        "publishedAt": c.get("publishedAt"),
    }


def flush(cards, dest):
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    tmp = dest + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, dest)


def log(rec):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with io.open(LOG, "a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", type=int, default=3, help="每个 type 翻多少页（0 号页不计）")
    ap.add_argument("--types", default=",".join(TYPES))
    ap.add_argument("--out", default=CARDS,
                    help="输出文件；给别的路径可先落暂存，避免与并发写者抢 cards.json")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    types = [t.strip() for t in args.types.split(",") if t.strip()]
    bad = [t for t in types if t not in TYPES]
    if bad:
        print("!! 非法 type: %s\n   合法: %s" % (bad, TYPES))
        return 1
    if args.pages > PAGE_MAX:
        args.pages = PAGE_MAX

    dest = os.path.abspath(args.out)
    cards = []
    if os.path.exists(dest):
        cards = json.load(io.open(dest, encoding="utf-8"))
    seen = {c["id"] for c in cards if c.get("id")}
    print("have %d cards  ->  %s" % (len(cards), dest))

    jobs = [(t, p) for t in types for p in range(args.pages + 1)]
    if args.dry:
        print("would send %d requests (%d types x %d pages), GAP=%.1fs, ~%.0fs"
              % (len(jobs), len(types), args.pages + 1, GAP, len(jobs) * GAP))
        return 0

    added = fetched = 0
    try:
        for i, (typ, page) in enumerate(jobs):
            payload = {"type": typ}
            if page > 0:
                payload["cursor"] = page
            rows = call("home.getCards", payload)
            fetched += len(rows)
            new = [c for c in rows if c.get("id") and c["id"] not in seen]
            for c in new:
                cards.append(shape(c))
                seen.add(c["id"])
            added += len(new)
            log({"type": typ, "page": page, "rows": len(rows), "new": len(new)})
            print("[%3d/%3d] %-18s page=%-3d rows=%-3d new=%-3d total=%d"
                  % (i + 1, len(jobs), typ, page, len(rows), len(new), len(cards)))
            if new:
                flush(cards, dest)
            if not rows:
                print("   空页，该 type 到此为止")
            time.sleep(GAP)
    except Gate as e:
        flush(cards, dest)
        print("!! 418 闸门：%s" % e)
        print("   已落盘 %d 张，冷却 / 换节点后重跑同一条命令即可续" % len(cards))
        return 2
    except KeyboardInterrupt:
        flush(cards, dest)
        print("\n中断，已落盘 %d 张" % len(cards))
        return 130

    flush(cards, dest)
    print("done total=%d added=%d fetched=%d -> %s"
          % (len(cards), added, fetched, dest))
    return 0


if __name__ == "__main__":
    sys.exit(main())
