# scripts/probe_trpc.py —— 通用 tRPC 单发探针
#
# 一条命令打一个 procedure，结果原样落 out/trpc_probe.jsonl（UTF-8，控制台不参与解码）。
# 取代之前的一次性探针（probe_home_anon / probe_home_types / probe_home_raw）。
#
#   python -I scripts/probe_trpc.py <PROC> ['<JSON 入参>' | @payload.json] [--cookie NAME] [--dry]
#
#   --cookie NAME   accounts.json 存在时取该号 cookie；缺省匿名
#   --dry           只打印将要发的 URL，不发
#   --raw           打印完整 body（默认只打印状态 + 前 400 字）
#
# 入参写法：PowerShell 5.1 会吃掉内联 JSON 的内层双引号，长入参一律走 @文件。
#   python -I scripts/probe_trpc.py home.getCards @out\payload.json
#
# 入参形状：--json 统一包成 {"0":{"json":<payload>}}，batch=1。
# 命中 418 captcha_required 立即 exit 2，绝不硬顶（claude.md §9）。
import argparse
import io
import json
import os
import sys
import time
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "trpc_probe.jsonl")
ACCOUNTS = os.path.join(ROOT, "accounts.json")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
)
GAP = float(os.environ.get("FETCH_GAP", "1.5"))


def headers(cookie):
    h = {
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
    if cookie:
        h["cookie"] = cookie
    return h


def load_cookie(name):
    if not name:
        return None
    if not os.path.exists(ACCOUNTS):
        print("!! accounts.json 不存在，退回匿名", file=sys.stderr)
        return None
    pool = json.load(io.open(ACCOUNTS, encoding="utf-8-sig"))
    if name not in pool:
        print("!! 账号池里没有 %s（有：%s）" % (name, ", ".join(sorted(pool))), file=sys.stderr)
        return None
    return pool[name].get("cookie")


def build_url(proc, payload):
    return "%s/api/trpc/%s?batch=1&input=%s" % (
        BASE, proc, quote(json.dumps({"0": {"json": payload}}, ensure_ascii=False), safe=""))


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("proc")
    ap.add_argument("payload", nargs="?", default="{}")
    ap.add_argument("--cookie", default=None)
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--raw", action="store_true")
    args = ap.parse_args()

    proc = args.proc
    if args.payload.startswith("@"):
        path = args.payload[1:]
        payload = json.load(io.open(path, encoding="utf-8"))
    else:
        payload = json.loads(args.payload)
    cookie = load_cookie(args.cookie)
    url = build_url(proc, payload)

    if args.dry:
        print("GET", url)
        print("cookie:", "yes" if cookie else "anonymous")
        return 0

    rec = {
        "t": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "proc": proc,
        "payload": payload,
        "cookie": "yes" if cookie else None,
    }
    try:
        r = creq.get(url, headers=headers(cookie), impersonate="chrome",
                     proxies=PROXY, timeout=30)
    except Exception as e:
        rec["status"] = "EXC"
        rec["error"] = "%s: %s" % (type(e).__name__, e)
        append(rec)
        print("EXC", rec["error"])
        return 1

    rec["status"] = r.status_code
    text = r.text or ""
    try:
        body = json.loads(text)
        rec["body"] = body
    except Exception:
        rec["body_text"] = text[:4000]
        body = None

    # 把 tRPC 信封拆成可读摘要
    if isinstance(body, list) and body:
        if "error" in body[0]:
            e = body[0]["error"].get("json") or {}
            rec["trpc"] = {
                "message": e.get("message"),
                "code": e.get("code"),
                "http": (e.get("data") or {}).get("httpStatus"),
            }
        elif "result" in body[0]:
            rec["data"] = body[0]["result"]["data"]["json"]
    append(rec)

    gated = "captcha_required" in text[:400] or r.status_code == 418
    print("%-28s %s  len=%d%s" % (proc, r.status_code, len(text), "  [GATE]" if gated else ""))
    if rec.get("trpc"):
        safe("   trpc: " + json.dumps(rec["trpc"], ensure_ascii=False))
    if args.raw:
        safe(text[:4000])
    elif rec.get("data") is not None:
        d = rec["data"]
        n = len(d) if isinstance(d, list) else "-"
        print("   data: %s  list_len=%s" % (type(d).__name__, n))
    else:
        safe("   body: " + text[:400].replace("\n", " "))

    if gated:
        print("!! 418 已触发闸门，停手换节点（claude.md §2.2）")
        return 2
    time.sleep(GAP)
    return 0


def append(rec):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def safe(text):
    """Windows 控制台是 cp936，卡片名里的 emoji/生僻字直接 print 会 UnicodeEncodeError。
    数据早已落盘（append 在前），所以这里只要别崩。"""
    try:
        print(text)
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or "utf-8"
        print(text.encode(enc, "replace").decode(enc, "replace"))


if __name__ == "__main__":
    sys.exit(main())
