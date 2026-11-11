# scripts/probe_api.py —— 登录态只读探针：把关键 procedure 的真实返回抓下来
#
# 用法: python scripts/probe_api.py [--cookie-from accounts.json:g01]
# 产出: captures/site/api/<proc>.json + summary
import argparse
import io
import json
import os
import time
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "captures", "site", "api")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")

TARGETS = [
    ("category.list", None),
    ("category.listForOnboarding", None),
    ("home.getCards", None),
    ("home.newbie", None),
    ("chatroom.getTags", None),
    ("preset.list", None),
    ("tasks.list", None),
    ("chat.getModelMetrics", None),
    ("chat.getSettings", {"chatId": None}),
    ("featureSwitch.mine", None),
    ("competition.awardedCards", None),
    ("chat.listAll", None),
    ("userPreference.getAll", None),
    ("credits.getBalance", None),
    ("chat.getQuotas", None),
]


def headers(cookie):
    return {
        "accept": "*/*",
        "cookie": cookie,
        "origin": BASE,
        "referer": BASE + "/",
        "user-agent": UA,
        "x-dzmm-client": "web",
        "x-dzmm-locale": "zh-CN",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


def load_cookie(spec):
    if ":" in spec:
        path, name = spec.split(":", 1)
        pool = json.load(io.open(os.path.join(ROOT, path), encoding="utf-8-sig"))
        return pool[name]["cookie"]
    return io.open(os.path.join(ROOT, spec), encoding="utf-8-sig").read().strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cookie-from", default="accounts.json:g01")
    args = ap.parse_args()
    cookie = load_cookie(args.cookie_from)
    os.makedirs(OUT, exist_ok=True)

    summary = {}
    for proc, inp in TARGETS:
        payload = {"0": {"json": inp}}
        url = "%s/api/trpc/%s?batch=1&input=%s" % (BASE, proc, quote(json.dumps(payload)))
        try:
            r = creq.get(url, headers=headers(cookie), impersonate="chrome",
                         proxies=PROXY, timeout=40)
        except Exception as e:
            print("%-32s ERR %s" % (proc, type(e).__name__))
            summary[proc] = {"error": type(e).__name__}
            time.sleep(1.2)
            continue
        body = r.text or ""
        info = {"status": r.status_code, "len": len(body)}
        if r.status_code == 200:
            try:
                j = json.loads(body)
                data = j[0]["result"]["data"]["json"]
                with io.open(os.path.join(OUT, proc + ".json"), "w",
                             encoding="utf-8", newline="\n") as f:
                    json.dump(data, f, ensure_ascii=False, indent=1)
                if isinstance(data, list):
                    info["kind"] = "list[%d]" % len(data)
                    info["keys"] = sorted(data[0].keys())[:22] if data else []
                elif isinstance(data, dict):
                    info["kind"] = "obj"
                    info["keys"] = sorted(data.keys())[:22]
                else:
                    info["kind"] = type(data).__name__
                    info["value"] = str(data)[:80]
            except Exception as e:
                info["parse_err"] = str(e)[:80]
                info["head"] = body[:160]
        else:
            info["head"] = body[:160]
        summary[proc] = info
        print("%-32s %s %s" % (proc, r.status_code, json.dumps(info, ensure_ascii=False)[:220]))
        time.sleep(1.2)

    with io.open(os.path.join(OUT, "_summary.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    print("→", OUT)


if __name__ == "__main__":
    main()
