# -*- coding: utf-8 -*-
"""今日任务：真实邮箱账号续期 + user.getApiToken(GET) -> 直连 api.sillytraven.dev"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C
from refresh_accounts import sign_in


def ts():
    return time.strftime("%H:%M:%S")


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    email = real.get("email")
    pwd = real.get("password")
    print("[%s] sign-in email=%s" % (ts(), email))
    ok, auth, msg = sign_in(email, pwd)
    if not ok:
        print("[%s] sign-in FAILED: %s" % (ts(), msg))
        return
    tok = auth["access_token"]
    print("[%s] sign-in OK  user_id=%s  token[:20]=%s" % (ts(), (auth.get("user_id") or "")[:13], tok[:20]))
    # 保存新 token
    real["access_token"] = tok
    real["refresh_token"] = auth.get("refresh_token")
    json.dump(real, open("real_account.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # 1. getMe
    st, j = C.get_me(tok)
    print("[%s] getMe -> %d" % (ts(), st))
    if st == 200:
        try:
            me = j[0]["result"]["data"]["json"]
            print("    role=%s credit=%s is_anonymous=%s" % (
                me.get("role"), me.get("credit"), me.get("is_anonymous")))
            print("    apiToken字段=%s" % json.dumps({k: v for k, v in me.items()
                  if "api" in k.lower() or "token" in k.lower()}, ensure_ascii=False))
        except Exception as e:
            print("    parse err", e)

    # 2. getBalance
    st, j = C.get_balance(tok)
    if st == 200:
        try:
            print("[%s] getBalance total=%s" % (ts(), j[0]["result"]["data"]["json"].get("total")))
        except Exception:
            pass

    # 3. user.getApiToken —— 是 GET(query) 过程，不是 POST
    st, j = C.trpc_get("user.getApiToken", tok)
    print("[%s] user.getApiToken(GET) -> %d" % (ts(), st))
    print("    " + json.dumps(j, ensure_ascii=False)[:800])

    # 4. 若拿到 apiToken，直连 AI API 测 models
    try:
        api_token = j[0]["result"]["data"]["json"].get("token") or \
            j[0]["result"]["data"]["json"].get("apiToken")
    except Exception:
        api_token = None
    if api_token:
        print("[%s] 拿到 API token: %s" % (ts(), str(api_token)[:30]))
        import requests
        r = requests.get("https://api.sillytraven.dev/api/ai/v2/models",
                         headers={"Authorization": "Bearer " + api_token},
                         proxies=C.PROXIES, timeout=30)
        print("[%s] /api/ai/v2/models -> %d %s" % (ts(), r.status_code, r.text[:300]))


if __name__ == "__main__":
    main()
