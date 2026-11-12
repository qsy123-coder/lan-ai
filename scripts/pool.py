# scripts/pool.py —— 多账号池管理（增/查/续/切换）
#
# 账号来源：每个号在浏览器里登录一次，把 Cookie 整串抄下来（DevTools → Network → 任意 /api 请求 → cookie）。
# 网站按 Google / Telegram 身份建号，一个身份 = 一个新号 = 75 credit 起。
#
# 用法:
#   python scripts/pool.py add --name a1 --cookie "chosen_language=...; sb-rls-auth-token.0=..."
#   python scripts/pool.py add --name a2 --from-file out/cookie_a2.txt
#   python scripts/pool.py list                 # 查每个号的 credit / plan / quotas
#   python scripts/pool.py use a1               # 把 a1 写成 out/session.json（供其它脚本用）
#   python scripts/pool.py rm a2
#
# 说明:
#   - 池文件 accounts.json 存明文 cookie，只在本地，别提交。
#   - check 走 user.getMe + chat.getQuotas，两发请求，1 rps 以下，避免 418。
import argparse
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL = os.path.join(ROOT, "accounts.json")
BASE = "https://www.dzmm.ai"
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
HEADERS = {
    "origin": BASE,
    "referer": BASE + "/",
    "user-agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"),
}


def load():
    if not os.path.exists(POOL):
        return {}
    with io.open(POOL, encoding="utf-8") as f:
        return json.load(f)


def save(pool):
    with io.open(POOL, "w", encoding="utf-8", newline="\n") as f:
        json.dump(pool, f, ensure_ascii=False, indent=1)


def proxies():
    return {"http": PROXY, "https": PROXY} if PROXY else None


def check(cookie):
    """返回 (ok, info)：info 含 credit / planName / quotas / isLoggedIn。"""
    h = dict(HEADERS)
    h["cookie"] = cookie
    try:
        r = creq.get(BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                     headers=h, impersonate="chrome", proxies=proxies(), timeout=30)
        if r.status_code != 200:
            return False, {"status": r.status_code, "body": (r.text or "")[:120]}
        me = json.loads(r.text)[0]["result"]["data"]["json"]
        if not me.get("isLoggedIn"):
            return False, {"status": 200, "body": "not logged in"}
        time.sleep(1.0)
        q = creq.get(BASE + "/api/trpc/chat.getQuotas?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                     headers=h, impersonate="chrome", proxies=proxies(), timeout=30)
        quotas = {}
        if q.status_code == 200:
            quotas = json.loads(q.text)[0]["result"]["data"]["json"].get("quotas", {})
        return True, {
            "uid": me.get("id"),
            "name": me.get("fullName"),
            "credit": me.get("credit"),
            "level": me.get("membershipLevel"),
            "plan": (quotas.get("turbo") or {}).get("planName"),
            "turbo": "%s/%s" % ((quotas.get("turbo") or {}).get("remaining"),
                                (quotas.get("turbo") or {}).get("total")),
            "checked_at": int(time.time()),
        }
    except Exception as e:
        return False, {"status": "ERR", "body": str(e)[:120]}


def cmd_add(args):
    cookie = args.cookie
    if args.from_file:
        cookie = io.open(args.from_file, encoding="utf-8-sig").read().strip()
    if not cookie:
        print("缺少 --cookie 或 --from-file")
        return 2
    cookie = "; ".join(p.strip() for p in cookie.replace(", ", "; ").split("; ") if p.strip())
    ok, info = check(cookie)
    print(("OK  " if ok else "FAIL"), info)
    pool = load()
    pool[args.name] = {"cookie": cookie, "note": args.note or "", "last": info}
    save(pool)
    print("已写入 accounts.json:", args.name, "| 共", len(pool), "个号")
    return 0 if ok else 1


def cmd_list(args):
    pool = load()
    if not pool:
        print("池是空的")
        return 0
    for name, acc in pool.items():
        ok, info = check(acc["cookie"])
        acc["last"] = info
        flag = "✅" if ok else "❌"
        if ok:
            print("%s %-8s credit=%-7s plan=%-5s turbo=%-8s uid=%s"
                  % (flag, name, info["credit"], info["plan"], info["turbo"], (info["uid"] or "")[:8]))
        else:
            print("%s %-8s %s" % (flag, name, info))
        time.sleep(1.2)
    save(pool)
    return 0


def cmd_use(args):
    pool = load()
    acc = pool.get(args.name)
    if not acc:
        print("没有这个号:", args.name)
        return 2
    session_path = os.path.join(ROOT, "out", "session.json")
    os.makedirs(os.path.dirname(session_path), exist_ok=True)
    s = {}
    if os.path.exists(session_path):
        with io.open(session_path, encoding="utf-8") as f:
            s = json.load(f)
    s["cookie"] = acc["cookie"]
    with io.open(session_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(s, f, ensure_ascii=False, indent=1)
    print("out/session.json 已切到", args.name)
    return 0


def cmd_rm(args):
    pool = load()
    pool.pop(args.name, None)
    save(pool)
    print("已删除", args.name, "| 剩", len(pool))
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("add"); a.add_argument("--name", required=True)
    a.add_argument("--cookie", default=""); a.add_argument("--from-file", default="")
    a.add_argument("--note", default=""); a.set_defaults(func=cmd_add)

    l = sub.add_parser("list"); l.set_defaults(func=cmd_list)
    u = sub.add_parser("use"); u.add_argument("name"); u.set_defaults(func=cmd_use)
    r = sub.add_parser("rm"); r.add_argument("name"); r.set_defaults(func=cmd_rm)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
