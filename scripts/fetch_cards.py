# scripts/fetch_cards.py —— 慢速、断点续抓卡片正文
#
# 策略：
#   1) 一次性把候选 id 写入 captures/site/id_pool.json（不重复探测）
#   2) 正文按 id 逐个抓，每抓到一个立刻落盘（断点续抓）
#   3) 单发之间 2.5s 间隔；命中 418 立刻退出（不硬顶），等冷却后再跑同一条命令
#
#   $env:HTTPS_PROXY='http://127.0.0.1:7897'; python scripts/fetch_cards.py 60
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
IDPOOL = os.path.join(SITE, "id_pool.json")
API = os.path.join(SITE, "api")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
)
GAP = float(os.environ.get("FETCH_GAP", "2.5"))

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


def trpc(proc, payload=None):
    url = "%s/api/trpc/%s?batch=1&input=%s" % (
        BASE, proc, quote(json.dumps({"0": {"json": payload or {}}})))
    try:
        r = creq.get(url, headers=headers(), impersonate="chrome",
                     proxies=PROXY, timeout=30)
        if r.status_code == 200:
            return json.loads(r.text)[0]["result"]["data"]["json"]
        if "captcha_required" in r.text[:200]:
            return "GATE"
        return None
    except Exception:
        return None


def load_ids():
    """候选 id 池：榜单 + 已抓 home 流，落盘后不再重复探测。"""
    if os.path.exists(IDPOOL):
        d = json.load(io.open(IDPOOL, encoding="utf-8"))
        return d["ids"]

    ids = []
    rf = os.path.join(API, "competition.awardedCards.json")
    if os.path.exists(rf):
        for r in json.load(io.open(rf, encoding="utf-8")):
            cid = r.get("cardId")
            if isinstance(cid, int) and cid not in ids:
                ids.append(cid)
    with io.open(IDPOOL, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"ids": ids, "built": time.strftime("%Y-%m-%d %H:%M")},
                  f, ensure_ascii=False, indent=1)
    print("id_pool built: %d" % len(ids))
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
    want = int(sys.argv[1]) if len(sys.argv) > 1 else 60
    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    seen = {c["id"] for c in cards}
    ids = load_ids()
    todo = [i for i in ids if i not in seen]
    print("have %d, pool %d, todo %d, target +%d" % (len(cards), len(ids), len(todo), want))

    added = fail = 0
    for idx, cid in enumerate(todo):
        if added >= want:
            break
        c = trpc("card.getById", {"cardId": cid})
        if c == "GATE":
            print("!! 418 在 #%d 命中，已落盘 %d 张，等冷却后再跑" % (idx, added))
            break
        if not c or not c.get("name"):
            fail += 1
            time.sleep(GAP)
            continue
        cards.append(shape(c))
        seen.add(cid)
        added += 1
        flush(cards)                      # 每张都落盘，断点续抓
        if added % 10 == 0:
            print("  +%d/%d total %d (fail %d)" % (added, want, len(cards), fail))
        time.sleep(GAP)

    flush(cards)
    print("done total=%d added=%d fail=%d" % (len(cards), added, fail))


if __name__ == "__main__":
    main()
