# scripts/teardown.py —— dzmm.ai 站点结构拆解（只读、低速、可重跑）
#
#   python scripts/teardown.py            # 首页 + 前 6 个 js
#   python scripts/teardown.py --all      # 全量 js（82 个 chunk）
#   python scripts/teardown.py --cookie-file out/cookies/g01.txt
#
# 产出:
#   captures/site/index.html, bundle_*.js
#   captures/site/extract.json   procedures / routes / models / strings
import argparse
import io
import json
import os
import re
import sys
import time
from urllib.parse import urljoin

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "captures", "site")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
H = {
    "accept": "*/*",
    "user-agent": UA,
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
}

STR_RE = re.compile(r'[`"\']([^`"\'\n]{2,120})[`"\']')
DOT_RE = re.compile(r'^[a-z][a-zA-Z0-9_]{1,30}\.[a-zA-Z][a-zA-Z0-9_]{1,40}$')


def get(url, timeout=90):
    return creq.get(url, headers=H, impersonate="chrome", proxies=PROXY, timeout=timeout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--cookie-file", default="")
    ap.add_argument("--limit", type=int, default=6)
    args = ap.parse_args()
    if args.cookie_file and os.path.exists(args.cookie_file):
        H["cookie"] = io.open(args.cookie_file, encoding="utf-8-sig").read().strip()

    os.makedirs(OUT, exist_ok=True)

    r = get(BASE + "/")
    io.open(os.path.join(OUT, "index.html"), "wb").write(r.content)
    print("[1] index", r.status_code, len(r.content),
          {k: v for k, v in r.headers.items() if k.lower().startswith("x-dzmm")})

    html = r.text
    assets = re.findall(r'["\']([^"\']*assets/[^"\']+\.js)["\']', html)
    assets += re.findall(r'src="([^"]+\.js[^"]*)"', html)
    assets = [u for u in dict.fromkeys(assets)]
    print("[2] js assets:", len(assets))

    limit = len(assets) if args.all else args.limit
    texts = []
    for i, a in enumerate(assets[:limit]):
        url = urljoin(BASE + "/", a)
        name = "bundle_%03d.js" % i
        path = os.path.join(OUT, name)
        if os.path.exists(path) and not args.all:
            texts.append(io.open(path, encoding="utf-8", errors="ignore").read())
            continue
        try:
            rr = get(url, timeout=150)
            io.open(path, "wb").write(rr.content)
            texts.append(rr.text)
            if i % 10 == 0:
                print("    %d/%d %s %s" % (i + 1, limit, rr.status_code, len(rr.content)))
            time.sleep(0.5)
        except Exception as e:
            print("    ! fail", a[:60], type(e).__name__)

    blob = "\n".join(texts)
    strings = set()
    for s in STR_RE.findall(blob):
        strings.add(s)

    procs = sorted(s for s in strings if DOT_RE.match(s))
    routes = sorted(s for s in strings if s.startswith("/") and " " not in s and len(s) < 60)
    models = sorted(s for s in strings if re.match(
        r'^(nalang-|x-apex-|claude-|gpt-|gemini-|deepseek-|qwen-|glm-|kimi-)', s))
    image_models = sorted(s for s in strings if s in
                          ("anime", "iroha", "z-image", "nalang-dream", "nalang-dream-pro",
                           "kagami", "gemini-2.5-flash"))

    # 中文文案：抽取疑似 UI 文案（含中文、长度 2–24）
    cn = sorted({s for s in strings if re.search(r"[\u4e00-\u9fa5]", s) and 2 <= len(s) <= 24})

    res = {
        "assets": assets,
        "procedures": procs,
        "routes": routes,
        "models": models,
        "image_models": image_models,
        "cn_strings": cn[:1500],
        "counts": {"strings": len(strings), "procs": len(procs), "routes": len(routes)},
    }
    with io.open(os.path.join(OUT, "extract.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)

    print("[3] strings=%d procedures=%d routes=%d models=%d cn=%d"
          % (len(strings), len(procs), len(routes), len(models), len(cn)))
    print("    models:", models[:20])
    print("    image:", image_models)
    print("    procs sample:", procs[:40])
    return 0


if __name__ == "__main__":
    sys.exit(main())
