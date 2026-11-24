# -*- coding: utf-8 -*-
"""探测工具：遇到 418 自动过一次验证码再重试。"""
import asyncio
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
import client as C

TOK = [None]
ACC = [None]


def init():
    real = json.load(open("real_account.json", encoding="utf-8"))
    TOK[0] = real["access_token"]
    ACC[0] = {"access_token": real["access_token"],
              "user_id": "1af4cf04-9d98-4797-a947-961fe7ad44ce"}
    return TOK[0]


def bridge():
    import captcha_bridge as B
    try:
        ok = asyncio.run(B.bridge(TOK[0], headless=True, acc=ACC[0]))
        print("  [bridge]", ok)
        return ok
    except Exception as e:
        print("  [bridge err]", str(e)[:80])
        return False


def renew():
    from refresh_accounts import sign_in
    real = json.load(open("real_account.json", encoding="utf-8"))
    ok, auth, msg = sign_in(real["email"], real["password"])
    if ok:
        real["access_token"] = auth["access_token"]
        real["refresh_token"] = auth.get("refresh_token")
        json.dump(real, open("real_account.json", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        TOK[0] = real["access_token"]
        ACC[0]["access_token"] = TOK[0]
        print("  [renew] ok")
        return True
    print("  [renew fail]", msg)
    return False


def call(proc, payload=None, method="get", retries=2):
    """返回 (status, body)；自动处理 418 / 401"""
    last = (-1, None)
    for i in range(retries + 1):
        try:
            if method == "get":
                return C.trpc_get(proc, TOK[0], payload)
            return C.trpc_post(proc, payload, TOK[0])
        except C.CaptchaRequired:
            if i < retries:
                bridge()
                continue
            return 418, "captcha"
        except Exception as e:
            last = (-1, str(e)[:80])
            if "401" in str(e) or i >= retries:
                if renew():
                    continue
            return last
    return last


def show(proc, payload=None, method="get"):
    st, j = call(proc, payload, method)
    if st == 404:
        msg = "NOT_EXIST"
    elif st == 418:
        msg = "CAPTCHA"
    else:
        try:
            msg = j[0]["error"]["json"]["message"][:60]
        except Exception:
            msg = json.dumps(j, ensure_ascii=False)[:100]
    print("%-40s %-4s %s" % (proc, st, msg))
    time.sleep(0.8)
    return st, j
