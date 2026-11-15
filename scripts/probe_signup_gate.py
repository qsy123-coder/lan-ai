# scripts/probe_signup_gate.py —— 用一次性 sign-up 探针给出口分级（不建邮箱、不完成注册）
#
# 每个出口发一次 POST /api/auth/sign-up（随机地址、不存在的收件箱）：
#   428 human_check_required  → 出口干净，可进人工拖闸门流程
#   418 captcha_required      → 出口已被风控闸门接管
#   429 REGISTER_RISK_BLOCKED → 出口的注册额度已被消耗/判风险，拉黑
#   403                        → 缺浏览器头（脚本自身问题）
#   200                        → 服务端直接受理（极少见）
#
# 用法:
#   python scripts/probe_signup_gate.py --api http://127.0.0.1:9191 --proxy http://127.0.0.1:7901 \
#       --nodes JP-N-1 KR-N-4 SG-N-1 --out out/mitce2/gate_probe.json
#
# 注意: 每个节点只打一发，间隔 3s；结果直接写 exits 账本可用的形态。
import argparse
import json
import os
import random
import string
import sys
import time
import urllib.request

from curl_cffi import requests as creq

BASE = "https://www.dzmm.ai"
ORACLE = BASE + "/api/trpc/nope.nothing?batch=1&input=%7B%7D"
SIGNUP = BASE + "/api/auth/sign-up"

HDR = {
    "content-type": "application/json",
    "origin": BASE,
    "referer": BASE + "/sign-in?s=signup",
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "user-agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"),
    "x-dzmm-client": "web",
}


def set_global(api, node, timeout=8):
    body = json.dumps({"name": node})
    r = creq.put(api.rstrip("/") + "/proxies/GLOBAL", data=body,
                 headers={"Content-Type": "application/json"}, timeout=timeout)
    if r.status_code >= 400:
        raise RuntimeError("HTTP %s %s" % (r.status_code, (r.text or "")[:80]))


def _proxies(proxy):
    return {"http": proxy, "https": proxy}


def exit_meta(proxy, timeout=12):
    """走目标出口取真实 IP / 地区；失败返回空。"""
    try:
        r = creq.get("https://www.cloudflare.com/cdn-cgi/trace", impersonate="chrome",
                     proxies=_proxies(proxy), timeout=timeout)
        d = dict(line.split("=", 1) for line in r.text.splitlines() if "=" in line)
        return d.get("ip", ""), d.get("loc", "")
    except Exception:
        return "", ""


def rand_mail():
    s = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
    return s + "@fldubai.com"


def post_signup(proxy, email, timeout=20):
    body = json.dumps({"email": email, "password": "Dz" + "".join(
        random.choices(string.ascii_letters + string.digits, k=10)) + "!9", "terms": True})
    try:
        r = creq.post(SIGNUP, data=body, headers=HDR, impersonate="chrome",
                      proxies=_proxies(proxy), timeout=timeout)
        return r.status_code, (r.text or "")[:300]
    except Exception as e:
        return 0, str(e)[:200]


def probe_oracle(proxy, timeout=15):
    try:
        r = creq.get(ORACLE, impersonate="chrome", proxies=_proxies(proxy), timeout=timeout)
        return r.status_code
    except Exception:
        return 0


def classify(status, body):
    if status == 428:
        return "clean"
    if status == 418:
        return "gated"
    if status == 429:
        return "risk_blocked"
    if status == 403:
        return "header_403"
    if status == 200:
        return "accepted"
    if status == 404:
        return "proc_404"
    return "unknown"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://127.0.0.1:9191")
    ap.add_argument("--proxy", default="http://127.0.0.1:7901")
    ap.add_argument("--nodes", nargs="+", required=True)
    ap.add_argument("--gap", type=float, default=3.0)
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    rows = []
    for n in args.nodes:
        try:
            set_global(args.api, n)
        except Exception as e:
            print("%-10s SET_FAIL %s" % (n, str(e)[:60]))
            rows.append({"node": n, "verdict": "set_fail", "err": str(e)[:120]})
            continue
        time.sleep(1.0)
        ip, loc = exit_meta(args.proxy)
        oracle = probe_oracle(args.proxy)
        st, body = post_signup(args.proxy, rand_mail())
        verdict = classify(st, body)
        rows.append({"node": n, "ip": ip, "loc": loc, "oracle": oracle,
                     "signup_status": st, "verdict": verdict, "body": body[:160]})
        print("%-10s %-15s %-3s oracle=%-4s signup=%-4s -> %s" % (n, ip or "-", loc or "-", oracle, st, verdict))
        time.sleep(args.gap)

    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8", newline="\n") as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
        print("写入", args.out)
    clean = sum(1 for r in rows if r["verdict"] == "clean")
    print("\n干净出口 %d/%d" % (clean, len(rows)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
