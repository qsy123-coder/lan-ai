# scripts/seed_cards.py —— 抓种子卡片（榜单 → card.getById），产出 captures/site/cards.json
import io
import json
import os
import time
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "captures", "site")
OUT = os.path.join(SITE, "cards.json")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")

pool = json.load(io.open(os.path.join(ROOT, "accounts.json"), encoding="utf-8-sig"))
COOKIE = pool["g01"]["cookie"]
H = {"accept": "*/*", "cookie": COOKIE, "origin": BASE, "referer": BASE + "/",
     "user-agent": UA, "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
     "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin"}


def trpc(proc, inp):
    url = "%s/api/trpc/%s?batch=1&input=%s" % (BASE, proc, quote(json.dumps({"0": {"json": inp}})))
    return creq.get(url, headers=H, impersonate="chrome", proxies=PROXY, timeout=25)


def flush(cards):
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)


def main():
    n = int(os.environ.get("SEED_N", "24"))
    ranked = json.load(io.open(os.path.join(SITE, "api", "competition.awardedCards.json"),
                               encoding="utf-8"))
    ids = [r["cardId"] for r in ranked][:n]
    print("targets:", len(ids))

    have = []
    if os.path.exists(OUT):
        have = json.load(io.open(OUT, encoding="utf-8"))
    seen = {c["id"] for c in have}
    cards = have[:]

    for i, cid in enumerate(ids):
        if cid in seen:
            continue
        try:
            r = trpc("card.getById", {"cardId": cid})
            if r.status_code != 200:
                print("  ! %s HTTP %s" % (cid, r.status_code))
                time.sleep(1.5)
                continue
            c = json.loads(r.text)[0]["result"]["data"]["json"]
            cards.append({
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
            })
            print("  + [%d/%d] %s %s" % (i + 1, len(ids), cid, (c["name"] or "")[:26]))
            flush(cards)
        except Exception as e:
            print("  ! %s %s" % (cid, type(e).__name__))
        time.sleep(1.0)

    flush(cards)
    print("cards:", len(cards), "→", OUT)


if __name__ == "__main__":
    main()
