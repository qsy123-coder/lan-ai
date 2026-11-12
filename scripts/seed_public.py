# scripts/seed_public.py —— 用公开的 card.getById 抓卡片，补 captures/site/cards.json
#
# 不需要登录态：card.getById 匿名可读（实测 200）。
# 单发间隔 GAP 秒（默认 1.5），命中 418 立即停手；每抓一张立即落盘，可断点续跑。
#
#   $env:HTTPS_PROXY='http://127.0.0.1:7897'; python scripts/seed_public.py
#   python scripts/seed_public.py 3821218 3856159
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
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
)
GAP = float(os.environ.get("FETCH_GAP", "1.5"))

# 最近一次请求的观测，供失败行打印状态码（区分「卡片没了」和「被拦」）
LAST = {"status": None, "note": ""}

# 与 engine/server.py 的 CARDS 保持一致
DEFAULT_IDS = [
    3821218, 3856159, 3856830, 3858435, 3859027, 3860041,
    3860611, 3860761, 3861267, 3865272, 3867710,
]


def headers():
    return {
        "accept": "application/json, text/plain, */*",
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
        LAST["status"] = r.status_code
        LAST["note"] = r.text[:160].replace("\n", " ")
        if r.status_code == 200:
            body = json.loads(r.text)
            # tRPC 单条失败也走 200：{"error":{...}} 而不是 {"result":...}
            if isinstance(body, list) and body and "result" in body[0]:
                return body[0]["result"]["data"]["json"]
            err = body[0].get("error") if isinstance(body, list) and body else None
            note = ""
            if isinstance(err, dict):
                j = err.get("json") or {}
                note = "%s %s" % (j.get("message"), (j.get("data") or {}).get("httpStatus"))
            LAST["note"] = "tRPC error: " + note.strip()
            return None
        if "captcha_required" in r.text[:200]:
            return "GATE"
        return None
    except Exception as e:
        LAST["status"] = "EXC"
        LAST["note"] = str(e)
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
    os.makedirs(SITE, exist_ok=True)
    tmp = CARDS + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, CARDS)


def main():
    ids = [int(x) for x in sys.argv[1:]] or DEFAULT_IDS
    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    seen = {str(c["id"]) for c in cards}
    added = fail = 0
    for i, cid in enumerate(ids):
        if str(cid) in seen:
            continue
        c = trpc("card.getById", {"cardId": cid})
        if c == "GATE":
            print("!! 418 在 #%d 命中，已落盘 %d 张，等冷却后再跑" % (i, added))
            break
        if not c or not c.get("name"):
            fail += 1
            print("  - %s 无数据 [%s] %s" % (cid, LAST["status"], LAST["note"]))
            time.sleep(GAP)
            continue
        cards.append(shape(c))
        seen.add(str(cid))
        added += 1
        flush(cards)
        print("  + %s %s" % (cid, c["name"][:24]))
        time.sleep(GAP)
    flush(cards)
    print("done total=%d added=%d fail=%d -> %s" % (len(cards), added, fail, CARDS))


if __name__ == "__main__":
    main()
