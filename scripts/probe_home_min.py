# scripts/probe_home_min.py —— 用已验证可用的最小入参 {"type": ...} 拉首页卡片
#
# 事实（2026-11-12 实测）：
#   {"type":"newest"}                                    -> 200，返回卡片数组
#   {"type":"newest","categoryName":null,...}            -> 400 必填/非法
#   seed_hot.py / probe_cards.py 里的 categoryName/direction/meta 是错的，别再加。
#
#   $env:HTTPS_PROXY='http://127.0.0.1:7897'; python -I scripts/probe_home_min.py
import io
import json
import os
import time
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "home_min.json")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
GAP = float(os.environ.get("FETCH_GAP", "1.5"))

TYPES = ["newest", "highest_rated_1d", "highest_rated_7d",
         "highest_rated_30d", "highest_rated_all", "games"]


def headers():
    return {
        "accept": "application/json, text/plain, */*",
        "origin": BASE, "referer": BASE + "/", "user-agent": UA,
        "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
        "x-dzmm-request-id": uuid.uuid4().hex,
        "sec-fetch-dest": "empty", "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


def get_cards(typ):
    payload = {"type": typ}
    url = "%s/api/trpc/home.getCards?batch=1&input=%s" % (
        BASE, quote(json.dumps({"0": {"json": payload}}), safe=""))
    r = creq.get(url, headers=headers(), impersonate="chrome", proxies=PROXY, timeout=30)
    if r.status_code != 200:
        return [], "HTTP %s" % r.status_code
    body = json.loads(r.text)
    if not (isinstance(body, list) and body and "result" in body[0]):
        e = body[0].get("error", {}).get("json", {}) if body else {}
        return [], "tRPC %s" % e.get("message")
    d = body[0]["result"]["data"]["json"]
    rows = d if isinstance(d, list) else []
    if not rows and isinstance(d, dict):
        for k in ("items", "cards", "list"):
            if isinstance(d.get(k), list):
                rows = d[k]
                break
    return rows, "ok"


def main():
    recs = []
    for typ in TYPES:
        rows, note = get_cards(typ)
        ids = [x.get("id") for x in rows]
        print("%-20s %-10s n=%-3d" % (typ, note, len(rows)))
        recs.append({"type": typ, "note": note, "n": len(rows),
                     "ids": ids,
                     "row0_keys": sorted(rows[0].keys()) if rows else [],
                     "cards": rows})
        time.sleep(GAP)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(recs, f, ensure_ascii=False, indent=1)

    all_ids = sorted({i for r in recs for i in r["ids"] if i})
    print("unique ids across types: %d" % len(all_ids))
    print("->", OUT)


if __name__ == "__main__":
    main()
