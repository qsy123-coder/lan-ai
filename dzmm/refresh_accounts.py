# -*- coding: utf-8 -*-
"""
dzmm.ai 账号续期（token 1 小时过期后恢复）

原理：游客账号的真实凭证藏在 access_token JWT 的 user_metadata.pwd：
  email = "<user_id>@anon.com"
  pwd   = user_metadata.pwd
调用 POST /api/auth/sign-in 可随时换新的 access_token/refresh_token。

用法:
  python refresh_accounts.py          # 续期池内全部失效账号
  python refresh_accounts.py --check  # 仅检查有效性
"""
import base64
import json
import sys
import time

import requests

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C


def jwt_payload(tok):
    try:
        p = tok.split(".")
        return json.loads(base64.urlsafe_b64decode((p[1] + "===").encode()).decode("utf-8", "replace"))
    except Exception:
        return {}


def account_creds(acc):
    """从 access_token 提取 email / pwd"""
    pay = jwt_payload(acc.get("access_token") or "")
    uid = pay.get("sub") or acc.get("user_id")
    pwd = (pay.get("user_metadata") or {}).get("pwd")
    email = pay.get("email") or ("%s@anon.com" % uid if uid else None)
    return email, pwd, uid


def sign_in(email, pwd):
    """返回 (ok, auth_dict, msg)"""
    h = C._headers()
    h["Accept"] = "application/json"
    try:
        s = C.session()
        r = s.post(C.BASE + "/api/auth/sign-in", headers=h,
                   data=json.dumps({"email": email, "password": pwd}),
                   proxies=C.PROXIES, timeout=30)
    except Exception as e:
        return False, None, str(e)[:100]
    if r.status_code != 200:
        return False, None, "%d %s" % (r.status_code, r.text[:120])
    # 新 token 在响应 cookie 里
    auth = None
    for c in s.cookies:
        if c.name == "sb-rls-auth-token":
            auth = C.decode_sb_cookie(c.value)
    if not auth:
        # 兜底：响应体里找
        try:
            j = r.json()
            if j.get("access_token"):
                auth = {"access_token": j["access_token"], "refresh_token": j.get("refresh_token"),
                        "user_id": (j.get("user") or {}).get("id")}
        except Exception:
            pass
    return (True, auth, "ok") if auth and auth.get("access_token") else (False, None, "no_token")


def is_valid(token):
    try:
        st, j = C.get_balance(token)
        return st == 200
    except C.CaptchaRequired:
        return True  # 风控不算失效
    except Exception:
        return False


def main():
    check_only = "--check" in sys.argv
    pool = C.load_pool()
    print("池内 %d 个账号" % len(pool))
    ok = refreshed = dead = 0
    for i, a in enumerate(pool):
        uid = a.get("user_id", "?")[:13]
        if is_valid(a.get("access_token") or ""):
            ok += 1
            print("[%d] %s 有效" % (i, uid))
            continue
        if check_only:
            print("[%d] %s 失效" % (i, uid))
            dead += 1
            continue
        email, pwd, _ = account_creds(a)
        if not email or not pwd:
            print("[%d] %s 缺凭证，跳过" % (i, uid))
            dead += 1
            continue
        success, auth, msg = sign_in(email, pwd)
        if success:
            a["access_token"] = auth["access_token"]
            a["refresh_token"] = auth.get("refresh_token")
            a["user_id"] = auth.get("user_id") or a.get("user_id")
            a["email"] = email
            a["password"] = pwd
            # 顺手查余额
            try:
                st, bal = C.get_balance(a["access_token"])
                a["credit"] = bal[0]["result"]["data"]["json"].get("total")
            except Exception:
                pass
            refreshed += 1
            print("[%d] %s 续期成功 credit=%s" % (i, uid, a.get("credit")))
        else:
            dead += 1
            print("[%d] %s 续期失败: %s" % (i, uid, msg))
        time.sleep(1.2)
    C.save_pool(pool)
    print("\n有效 %d / 续期 %d / 失效 %d" % (ok, refreshed, dead))
    tot = sum((a.get("credit") or 0) for a in pool)
    print("总积分 %.2f" % tot)


if __name__ == "__main__":
    main()
