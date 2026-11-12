# scripts/alias_pool.py —— 用 addy.io 免费版批量建别名（零成本、多域名）
#
# 用法:
#   python scripts/alias_pool.py --key <API_KEY> --n 100
#   python scripts/alias_pool.py --key <API_KEY> --n 20 --domain anonaddy.me
#   python scripts/alias_pool.py --list
#
# 产出: out/aliases.json  [{email, id, domain, used, created}]
# 别名全部转发到 qsy55882@gmail.com，收信仍走现有 IMAP 逻辑（按 To: 搜索）。
import argparse
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL = os.path.join(ROOT, "out", "aliases.json")
API = "https://app.addy.io/api/v1/aliases"
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")

# 免费版可用的共享域名（拿不到的会自动跳过）
DOMAINS = ["anonaddy.me", "anonaddy.com"]   # 实测这两个可用，其余对免费账号无效


def proxies():
    return {"http": PROXY, "https": PROXY} if PROXY else None


def load():
    if os.path.exists(POOL):
        return json.load(io.open(POOL, encoding="utf-8"))
    return []


def save(items):
    os.makedirs(os.path.dirname(POOL), exist_ok=True)
    io.open(POOL, "w", encoding="utf-8", newline="\n").write(json.dumps(items, ensure_ascii=False, indent=1))


def create(key, domain, desc):
    h = {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    }
    body = {"domain": domain, "description": desc, "format": "random_characters"}
    r = creq.post(API, headers=h, json=body, impersonate="chrome", proxies=proxies(), timeout=30)
    if r.status_code in (200, 201):
        d = (r.json() or {}).get("data") or {}
        if d.get("email"):
            return d
    return {"error": r.status_code, "body": (r.text or "")[:160]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=os.environ.get("ADDY_KEY", ""))
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--domain", default="")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    items = load()
    if args.list:
        used = sum(1 for x in items if x.get("used"))
        print("别名总数: %d | 已用: %d | 可用: %d" % (len(items), used, len(items) - used))
        from collections import Counter
        print("域名分布:", dict(Counter(x.get("domain") for x in items)))
        return 0

    if not args.key:
        print("缺 --key（addy.io → Settings → API Keys → Create）")
        return 2

    made = 0
    for i in range(args.n):
        dom = args.domain or DOMAINS[i % len(DOMAINS)]
        d = create(args.key, dom, "dzmm-%03d" % (len(items) + 1))
        if d.get("email"):
            items.append({"email": d["email"], "id": d.get("id"), "domain": dom,
                          "used": False, "created": int(time.time())})
            made += 1
            print("  +", d["email"])
        else:
            print("  ! %s -> %s" % (dom, d))
        if (i + 1) % 10 == 0:
            save(items)
            print("  ... 已保存 %d 个" % len(items))
        time.sleep(0.8)
    save(items)
    print("完成: 新建 %d 个别名，池内 %d 个 → %s" % (made, len(items), POOL))
    return 0


if __name__ == "__main__":
    sys.exit(main())
