# -*- coding: utf-8 -*-
"""把外部 dzmm 账号包导入 accounts.json。

输入是账号包的 accounts.json（list，含 access_token/refresh_token/user_id/email/password）
和 cookies.json（浏览器 cookie 模板，取非 auth 部分）。所有 access_token 过期时，
用 email/password 调 /api/auth/sign-in 续期，再用 sb-rls-auth-token 组成池子的 cookie。

用法：
  python -I scripts/import_farm_accounts.py \
    --src "C:\\...\\dzmm\\accounts.json" \
    --cookies "C:\\...\\dzmm\\cookies.json" \
    --pool accounts.json --limit 5 --dry-run

  # 全量、每 5 个落盘一次
  python -I scripts/import_farm_accounts.py --src ... --cookies ... --pool accounts.json --save-every 5

安全：不打印 cookie/token/password；accounts.json 已在 .gitignore。
"""

import argparse
import base64
import io
import json
import os
import shutil
import time
import urllib.parse
import urllib.request

from curl_cffi import requests as creq

BASE = "https://www.dzmm.ai"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
HEADERS = {
    "User-Agent": UA,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Content-Type": "application/json",
    "Origin": BASE,
    "Referer": BASE + "/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-dzmm-client": "web",
    "x-dzmm-locale": "zh-CN",
}


def b64json(s):
    raw = s[7:] if s.startswith("base64-") else s
    try:
        return json.loads(base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)).decode("utf-8", "replace"))
    except Exception:
        return None


def jwt_payload(tok):
    try:
        p = tok.split(".")
        return json.loads(base64.urlsafe_b64decode((p[1] + "===").encode()).decode("utf-8", "replace"))
    except Exception:
        return {}


def trpc_url(proc, payload=None):
    inp = json.dumps({"0": {"json": payload}}, separators=(",", ":"))
    return "%s/api/trpc/%s?batch=1&input=%s" % (BASE, proc, urllib.parse.quote(inp))


def trpc_json(resp):
    try:
        return resp.json()[0]["result"]["data"]["json"]
    except Exception:
        return None


def sign_in(sess, email, password):
    """返回 (auth, jar, error)。"""
    r = sess.post(BASE + "/api/auth/sign-in", headers=HEADERS,
                  data=json.dumps({"email": email, "password": password}), timeout=40)
    if r.status_code == 418:
        return None, None, "stop:418 captcha gate"
    if r.status_code == 429:
        return None, None, "429 %s" % (r.text or "")[:100]
    if r.status_code != 200:
        return None, None, "http %d %s" % (r.status_code, (r.text or "")[:120])
    jar = sess.cookies.get_dict()
    sb = jar.get("sb-rls-auth-token")
    if not sb:
        parts = [k for k in jar if k.startswith("sb-rls-auth-token.")]
        if parts:
            parts.sort(key=lambda x: int(x.rsplit(".", 1)[1]) if x.rsplit(".", 1)[1].isdigit() else 0)
            sb = "".join(jar[k] for k in parts)
    auth = b64json(sb) if sb else None
    if not auth:
        try:
            j = r.json()
            if j.get("access_token"):
                auth = {"access_token": j["access_token"], "refresh_token": j.get("refresh_token"),
                        "user": j.get("user") or {}}
        except Exception:
            pass
    if not auth or not auth.get("access_token"):
        return None, None, "no_token"
    return auth, jar, None


AUTH_KEYS = ("sb-rls-auth-token", "_rid")


def template_from_pool(pool, name):
    """从池内某个已导入号的 cookie 里抽设备/地区/实验组字段作模板。

    账号包自带的 cookies.json 只剩 sb-rls-auth-token 时，直接用它当模板会丢掉
    chosen_language / _geo / _tz / dzmm_exp_* —— 这些决定额度策略与实验组，必须带上。
    """
    entry = pool.get(name) or {}
    ck = entry.get("cookie") or ""
    tpl = {}
    for kv in ck.split(";"):
        kv = kv.strip()
        if not kv or "=" not in kv:
            continue
        k, v = kv.split("=", 1)
        k = k.strip()
        if not k or k.startswith("sb-rls-auth-token") or k in ("_rid", "_login_device"):
            continue
        tpl[k] = v
    return tpl


def build_cookie(template, sb, uid, jar):
    c = {k: v for k, v in template.items() if not k.startswith("sb-rls-auth-token") and k not in ("_rid", "_login_device")}
    c["sb-rls-auth-token"] = sb
    c["_rid"] = uid
    if jar.get("_login_device"):
        c["_login_device"] = jar["_login_device"]
    return "; ".join("%s=%s" % (k, v) for k, v in c.items())


def verify(sess, cookie, uid):
    h = dict(HEADERS)
    h["Cookie"] = cookie
    r = sess.get(trpc_url("user.getMe"), headers=h, timeout=30)
    if r.status_code != 200:
        return None, "getMe http %d" % r.status_code
    me = trpc_json(r) or {}
    if str(me.get("id")) != str(uid):
        return None, "uid mismatch"
    r2 = sess.get(trpc_url("credits.getBalance"), headers=h, timeout=30)
    bal = trpc_json(r2) if r2.status_code == 200 else None
    credit = None
    if isinstance(bal, dict):
        credit = bal.get("total")
        if credit is None:
            credit = bal.get("credit")
    return {"id": me.get("id"), "credit": credit}, None


def save_pool(path, pool):
    tmp = path + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(pool, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def next_name(pool, prefix, number):
    while True:
        name = "%s%03d" % (prefix, number)
        number += 1
        if name not in pool:
            return name, number


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--cookies", required=True)
    ap.add_argument("--pool", default="accounts.json")
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--delay", type=float, default=1.2)
    ap.add_argument("--prefix", default="d")
    ap.add_argument("--save-every", type=int, default=5)
    ap.add_argument("--template-from", default="",
                    help="池内已有号名，用它的 cookie 里非鉴权字段当模板（cookies.json 只剩 sb token 时必用）")
    ap.add_argument("--refresh-existing", action="store_true",
                    help="已在池里的号也重新登录，刷新 cookie/credit（不新建条目）")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--refresh-state", action="store_true")
    args = ap.parse_args()

    src = json.load(io.open(args.src, encoding="utf-8-sig"))
    cookies = json.load(io.open(args.cookies, encoding="utf-8-sig"))
    template = {c["name"]: c["value"] for c in cookies if c.get("name")}
    pool = json.load(io.open(args.pool, encoding="utf-8-sig"))
    existing_uids = set()
    by_uid = {}
    for name, a in pool.items():
        for uid in (a.get("user_id"), (a.get("last") or {}).get("uid")):
            if uid:
                existing_uids.add(str(uid))
                by_uid.setdefault(str(uid), name)
    if args.template_from:
        tpl2 = template_from_pool(pool, args.template_from)
        if not tpl2:
            print("template-from %s: empty, keep cookies.json template" % args.template_from)
        else:
            template = tpl2
    print("source=%d pool=%d existing_uids=%d template_keys=%d%s"
          % (len(src), len(pool), len(existing_uids), len(template),
             " (from %s)" % args.template_from if args.template_from else ""))

    proxies = {"http": args.proxy, "https": args.proxy}
    sess = creq.Session(impersonate="chrome", proxies=proxies)
    for k, v in template.items():
        if k.startswith("sb-rls-auth-token"):
            continue
        try:
            sess.cookies.set(k, v)
        except Exception:
            pass

    items = src[args.offset:]
    if args.limit:
        items = items[:args.limit]
    backup = None
    if not args.dry_run and os.path.exists(args.pool):
        backup = args.pool + ".bak-" + time.strftime("%Y%m%d%H%M%S")
        shutil.copy2(args.pool, backup)
        print("backup", backup)

    added, refreshed, skipped, failed = 0, 0, 0, 0
    name_no = 1
    since_save = 0
    streak_429 = 0
    report = []
    for i, a in enumerate(items, 1):
        uid = str(a.get("user_id") or jwt_payload(a.get("access_token")).get("sub") or "")
        if not uid:
            print("[%d] no uid" % i)
            failed += 1
            continue
        existing = by_uid.get(uid)
        if existing and not args.refresh_existing:
            print("[%d] %s skip (already in pool as %s)" % (i, uid[:8], existing))
            skipped += 1
            continue
        email = a.get("email") or ""
        pwd = a.get("password") or ""
        if not email or not pwd:
            print("[%d] %s no_credentials" % (i, uid[:8]))
            failed += 1
            continue
        auth, jar, err = sign_in(sess, email, pwd)
        if err and err.startswith("stop:"):
            print("[%d] %s %s; stop. switch node and resume --offset %d"
                  % (i, uid[:8], err, args.offset + i - 1))
            break
        if err and err.startswith("429"):
            streak_429 += 1
            print("[%d] %s signin %s (429 streak %d)" % (i, uid[:8], err[:80], streak_429))
            failed += 1
            time.sleep(args.delay * 3)
            if streak_429 >= 3:
                print("3 consecutive 429, stop; switch node and resume --offset %d"
                      % (args.offset + i - 1))
                break
            continue
        if err:
            print("[%d] %s signin %s" % (i, uid[:8], err))
            failed += 1
            time.sleep(args.delay)
            continue
        streak_429 = 0
        sb = jar.get("sb-rls-auth-token") if jar else None
        if not sb:
            parts = [k for k in (jar or {}) if k.startswith("sb-rls-auth-token.")]
            if parts:
                parts.sort(key=lambda x: int(x.rsplit(".", 1)[1]) if x.rsplit(".", 1)[1].isdigit() else 0)
                sb = "".join(jar[k] for k in parts)
        if not sb:
            print("[%d] %s no_sb_cookie" % (i, uid[:8]))
            failed += 1
            time.sleep(args.delay)
            continue
        auth_uid = str((auth.get("user") or {}).get("id") or auth.get("user_id") or uid)
        cookie = build_cookie(template, sb, auth_uid, jar or {})
        checked, verr = verify(sess, cookie, auth_uid)
        if verr:
            print("[%d] %s verify %s" % (i, auth_uid[:8], verr))
            failed += 1
            time.sleep(args.delay)
            continue
        credit = checked.get("credit")
        now = int(time.time())
        if existing:
            name = existing
            entry = dict(pool.get(name) or {})
            entry.update({
                "cookie": cookie,
                "note": "农场导入 · %s · credit=%s" % (email, credit),
                "last": {"uid": auth_uid, "credit": credit, "email": email, "checkedAt": now},
                "user_id": auth_uid,
                "email": email,
                "password": pwd,
                "credit": credit,
            })
            action = "refreshed"
        else:
            name, name_no = next_name(pool, args.prefix, name_no)
            entry = {
                "cookie": cookie,
                "note": "农场导入 · %s · credit=%s" % (email, credit),
                "last": {"uid": auth_uid, "credit": credit, "email": email, "checkedAt": now},
                "user_id": auth_uid,
                "email": email,
                "password": pwd,
                "credit": credit,
                "created_at": a.get("created_at"),
                "last_checkin": a.get("last_checkin"),
            }
            action = "added"
        report.append({"name": name, "uid": auth_uid, "email": email, "credit": credit,
                       "action": action, "verified": True})
        if not args.dry_run:
            pool[name] = entry
            existing_uids.add(auth_uid)
            by_uid[auth_uid] = name
            if action == "added":
                added += 1
            else:
                refreshed += 1
            since_save += 1
            if since_save >= max(1, args.save_every):
                save_pool(args.pool, pool)
                since_save = 0
        else:
            added += 1
        print("[%d] %s %s %s credit=%s" % (i, auth_uid[:8], name,
                                          "DRY" if args.dry_run else action, credit))
        time.sleep(args.delay)

    if not args.dry_run:
        save_pool(args.pool, pool)
    out = os.path.join("out", "farm_import_%s.json" % time.strftime("%Y%m%d-%H%M%S"))
    os.makedirs("out", exist_ok=True)
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"source": args.src, "added": added, "refreshed": refreshed,
                   "skipped": skipped, "failed": failed,
                   "dry_run": args.dry_run, "items": report}, f, ensure_ascii=False, indent=1)
    print("== added=%d refreshed=%d skipped=%d failed=%d report=%s"
          % (added, refreshed, skipped, failed, out))

    if args.refresh_state and not args.dry_run and (added or refreshed):
        names = [r["name"] for r in report if r.get("verified") and r["name"] in pool]
        token_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                  "out", "site_token.txt")
        token = ""
        try:
            token = io.open(token_path, encoding="utf-8-sig").read().strip()
        except Exception:
            pass
        try:
            req = urllib.request.Request(
                "http://127.0.0.1:8787/refresh",
                data=json.dumps({"names": names}).encode("utf-8"), method="POST",
                headers={"content-type": "application/json", "x-site-token": token})
            with urllib.request.urlopen(req, timeout=600) as r:
                print("refresh_state", r.status, r.read().decode("utf-8", "replace")[:200])
        except Exception as e:
            print("refresh_state failed", str(e)[:160])


if __name__ == "__main__":
    main()
