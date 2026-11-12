# scripts/seed_more.py —— 扩充卡片库：从榜单 id 池补抓，去重合并，增量落盘
#
#   SEED_ADD=90 python scripts/seed_more.py
import io, json, os, time
from urllib.parse import quote
from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "captures", "site")
CARDS = os.path.join(SITE, "cards.json")
RANKED = os.path.join(SITE, "api", "competition.awardedCards.json")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")

pool = json.load(io.open(os.path.join(ROOT, "accounts.json"), encoding="utf-8-sig"))
COOKIE = pool["g01"]["cookie"]
H = {"accept": "*/*", "cookie": COOKIE, "origin": BASE, "referer": BASE + "/",
     "user-agent": UA, "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
     "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin"}


def get_card(cid):
    url = "%s/api/trpc/card.getById?batch=1&input=%s" % (
        BASE, quote(json.dumps({"0": {"json": {"cardId": cid}}})))
    for attempt in range(3):
        try:
            r = creq.get(url, headers=H, impersonate="chrome", proxies=PROXY, timeout=25)
            if r.status_code != 200:
                time.sleep(1.5 + attempt)
                continue
            return json.loads(r.text)[0]["result"]["data"]["json"]
        except Exception:
            time.sleep(2.0 + attempt)
    return None


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
    with io.open(CARDS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)


def main():
    want = int(os.environ.get("SEED_ADD", "80"))
    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    seen = {c["id"] for c in cards}
    ranked = json.load(io.open(RANKED, encoding="utf-8"))
    ids = []
    for r in ranked:
        cid = r.get("cardId")
        if cid and cid not in ids:
            ids.append(cid)
    print("have %d, want +%d, pool %d" % (len(cards), want, len(ids)))

    added = 0
    fail = 0
    for cid in ids:
        if added >= want:
            break
        if cid in seen:
            continue
        c = get_card(cid)
        if not c or not c.get("name"):
            fail += 1
            time.sleep(0.8)
            if fail % 10 == 0:
                print("  skip fail=%d" % fail)
            continue
        cards.append(shape(c))
        seen.add(cid)
        added += 1
        if added % 10 == 0:
            flush(cards)
            print("  +%d/%d total %d" % (added, want, len(cards)))
        time.sleep(1.0)

    flush(cards)
    print("done total=%d fail=%d" % (len(cards), fail))


if __name__ == "__main__":
    main()
