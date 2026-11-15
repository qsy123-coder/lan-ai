# scripts/mail_api.py —— 走 Cloudflare mail-hub Worker 收验证码（替代 IMAP）
#
# 配置 out/mail_api.json: {"base_url":"https://mail-hub.xxx.workers.dev","token":"...","domain":"example.com"}
#
# 用法:
#   python scripts/mail_api.py --health
#   python scripts/mail_api.py --addr abc@example.com --wait 180
import argparse
import io
import json
import os
import random
import string
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONF = os.path.join(ROOT, "out", "mail_api.json")


def load_conf():
    if not os.path.exists(CONF):
        raise SystemExit("缺 %s：{\"base_url\":\"https://mail-hub.<sub>.workers.dev\","
                         "\"token\":\"...\",\"domain\":\"example.com\"}" % CONF)
    with io.open(CONF, encoding="utf-8") as f:
        return json.load(f)


def _headers(token):
    h = {"accept": "application/json"}
    if token:
        h["authorization"] = "Bearer " + token
    return h


def health():
    c = load_conf()
    r = creq.get(c["base_url"].rstrip("/") + "/health", impersonate="chrome", timeout=15)
    return r.status_code, r.text[:200]


def provision(domain=None, k=None):
    """catch-all 不需要预注册：生成一个本地部分即可。"""
    c = load_conf()
    dom = domain or c.get("domain")
    if not dom:
        raise SystemExit("mail_api.json 缺 domain")
    k = k or random.choice((10, 11, 12))
    local = "".join(random.choices(string.ascii_lowercase + string.digits, k=k))
    return "%s@%s" % (local, dom)


def fetch_code(addr, since=0):
    c = load_conf()
    r = creq.get(c["base_url"].rstrip("/") + "/code",
                 params={"addr": addr, "since": int(since)},
                 headers=_headers(c.get("token")), impersonate="chrome", timeout=15)
    if r.status_code != 200:
        return None, "HTTP %s %s" % (r.status_code, (r.text or "")[:80])
    try:
        j = r.json()
    except Exception:
        return None, "bad json"
    return j.get("code"), None


def wait_code(addr, since=None, timeout=180, interval=3):
    """轮询直到拿到 8 位码；返回 (code, err)。since 默认取开始时刻，避免读到上一单的旧码。"""
    since = int(time.time() * 1000) if since is None else int(since)
    t0 = time.time()
    while time.time() - t0 < timeout:
        code, err = fetch_code(addr, since)
        if code:
            return code, None
        time.sleep(interval)
    return None, "timeout"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--health", action="store_true")
    ap.add_argument("--addr", default="")
    ap.add_argument("--wait", type=int, default=0)
    args = ap.parse_args()
    if args.health:
        st, body = health()
        print(st, body)
        return 0 if st == 200 else 1
    if args.addr:
        if args.wait:
            code, err = wait_code(args.addr, timeout=args.wait)
            print("code=%s err=%s" % (code, err))
            return 0 if code else 2
        code, err = fetch_code(args.addr)
        print("code=%s err=%s" % (code, err))
        return 0 if code else 2
    print("provision:", provision())
    return 0


if __name__ == "__main__":
    sys.exit(main())
