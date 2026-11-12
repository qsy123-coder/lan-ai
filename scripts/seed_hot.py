# 扩展卡库：本机走 Clash 抓，落 Z:\project\captures\site\cards.json
#
#   $env:HTTPS_PROXY='http://127.0.0.1:7897'
#   SEED_HOT=200 python scripts/seed_hot.py
import io
import json
import os
import time
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "captures", "site")
CARDS = os.path.join(SITE, "cards.json")
API = os.path.join(SITE, "api")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
)

pool = json.load(io.open(os.path.join(ROOT, "accounts.json"), encoding="utf-8-sig"))
COOKIE = pool["g01"]["cookie"]


def headers():
    return {
        "accept": "application/json, text/plain, */*",
        "cookie": COOKIE,
        "origin": BASE,
        "referer": BASE + "/",
        "user-agent": UA,
        "x-dzmm-client": "web",
        "x-dzmm-locale": "zh-CN",
        "x-dzmm-request-id": uuid.uuid4().hex,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


GATED = {"hit": False}


def trpc(proc, payload=None):
    """单发 trpc；遇到 418 立即置位并放弃，绝不硬顶。"""
    if GATED["hit"]:
        return None
    url = "%s/api/trpc/%s?batch=1&input=%s" % (
        BASE, proc, quote(json.dumps({"0": {"json": payload or {}}})))
    try:
        r = creq.get(url, headers=headers(), impersonate="chrome",
                     proxies=PROXY, timeout=30)
        if r.status_code == 200:
            return json.loads(r.text)[0]["result"]["data"]["json"]
        if "captcha_required" in r.text[:200]:
            GATED["hit"] = True
            print("!! 418 captcha_required on %s —— 立刻停手" % proc)
            return None
        print("   %s -> %s %s" % (proc, r.status_code, r.text[:100]))
    except Exception as e:
        print("   %s EXC %s" % (proc, type(e).__name__))
    return None


def items_of(d):
    if isinstance(d, list):
        return d
    if isinstance(d, dict):
        for k in ("items", "cards", "list", "rows", "data"):
            v = d.get(k)
            if isinstance(v, list):
                return v
    return []


def harvest_ids(limit_pages=6):
    ids = []

    def push(v):
        if isinstance(v, int) and 1000 < v < 10**9 and v not in ids:
            ids.append(v)

    rf = os.path.join(API, "competition.awardedCards.json")
    if os.path.exists(rf):
        for r in json.load(io.open(rf, encoding="utf-8")):
            push(r.get("cardId"))
        print("awarded: %d" % len(ids))

    # 首页卡片流。入参只认 {"type": ...}，多传 categoryName/direction/meta 一律 400。
    # 合法值见 notes/010 §1（zod 报文泄出）。
    types = ["newest", "highest_rated_1d", "highest_rated_7d",
             "highest_rated_30d", "highest_rated_all", "games"]
    for typ in types:
        if GATED["hit"]:
            return ids
        d = trpc("home.getCards", {"type": typ})
        batch = items_of(d)
        before = len(ids)
        for it in batch:
            push(it.get("id") or it.get("cardId"))
        print("home.getCards type=%-20s -> +%d (total %d)" % (
            typ, len(ids) - before, len(ids)))
        time.sleep(1.6)

    return ids


def shape(c):
    return {
        "id": c["id"],
        "name": c["name"],
        "cover": c.get("cardFilename"),
        "images": [x["url"] for x in (c.get("imageInfo") or [])],
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


def flush(cards):
    tmp = CARDS + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, CARDS)


def main():
    want = int(os.environ.get("SEED_HOT", "200"))
    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    seen = {c["id"] for c in cards}
    print("have %d, want +%d" % (len(cards), want))

    ids = harvest_ids()
    todo = [i for i in ids if i not in seen]
    print("candidates %d (%d new)" % (len(ids), len(todo)))

    added = fail = 0
    for cid in todo:
        if added >= want or GATED["hit"]:
            break
        c = trpc("card.getById", {"cardId": cid})
        if not c or not c.get("name"):
            fail += 1
            time.sleep(1.0)
            continue
        cards.append(shape(c))
        seen.add(cid)
        added += 1
        if added % 10 == 0:
            flush(cards)
            print("  +%d/%d total %d (fail %d)" % (added, want, len(cards), fail))
        time.sleep(1.3)

    flush(cards)
    print("done total=%d added=%d fail=%d gated=%s" % (
        len(cards), added, fail, GATED["hit"]))


if __name__ == "__main__":
    main()
