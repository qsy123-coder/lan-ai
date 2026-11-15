# scripts/seed_categories.py —— 拉 dzmm.ai 的 category.list，写成 site/data/categories.json
#
#   python -I scripts/seed_categories.py
#   python -I scripts/seed_categories.py --out site/data/categories.json
#
# category.list 匿名可读（实测 2026-11-15，21 条）；走 Clash 7897。
# 418/401 直接报错退出，不覆盖现有数据。
import argparse
import io
import json
import os
import sys
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
PROXY = os.environ.get("DZMM_PROXY") or "http://127.0.0.1:7897"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ROOT, "site", "data", "categories.json"))
    ap.add_argument("--proxy", default=PROXY)
    args = ap.parse_args()

    payload = {"0": {"json": {}}}
    url = "%s/api/trpc/category.list?batch=1&input=%s" % (
        BASE, quote(json.dumps(payload, ensure_ascii=False), safe=""))
    headers = {
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
    r = creq.get(url, headers=headers, impersonate="chrome",
                 proxies={"http": args.proxy, "https": args.proxy}, timeout=40)
    if r.status_code != 200:
        print("HTTP %s: %s" % (r.status_code, (r.text or "")[:300]), file=sys.stderr)
        return 2
    try:
        body = r.json()
        cats = body[0]["result"]["data"]["json"]
    except Exception as e:
        print("解析失败：%s / %s" % (e, (r.text or "")[:300]), file=sys.stderr)
        return 3
    if not isinstance(cats, list) or not cats:
        print("返回为空，不覆盖", file=sys.stderr)
        return 4

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    tmp = args.out + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cats, f, ensure_ascii=False, indent=1)
    os.replace(tmp, args.out)
    print("wrote %d categories -> %s" % (len(cats), args.out))
    for c in cats:
        print("  %-3s %-18s %s" % (c.get("id"), c.get("name"), c.get("displayName")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
