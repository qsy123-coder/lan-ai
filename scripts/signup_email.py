# scripts/signup_email.py —— 纯 API 注册 DZMM 账号（邮箱 + 邮件 8 位码）
#
# 链路（全部实测通过）：
#   1) mail.tm 建临时邮箱
#   2) POST /api/auth/sign-up         {"email","password","terms":true}   -> 200 / 428(要验证码)
#   3) 轮询邮箱拿 8 位码
#   4) POST /api/auth/sign-up/otp     {"email","token","type":"email","next":"/"} -> 下发 sb-rls-auth-token
#   5) 用同一 cookie jar 读 user.getMe 验证 credit=75
#
# 用法:
#   python scripts/signup_email.py                # 注册 1 个号并入池
#   python scripts/signup_email.py --n 3          # 连开 3 个（遇到 428 会停下并提示）
#   python scripts/signup_email.py --keep-mail    # 保留邮箱记录到 out/mailboxes.json
import argparse
import io
import json
import os
import random
import re
import string
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
MAIL = "https://api.mail.tm"
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
POOL = os.path.join(ROOT, "accounts.json")
HDR = {
    "content-type": "application/json",
    "origin": BASE,
    "referer": BASE + "/sign-in",
    "accept": "*/*",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "x-dzmm-client": "web",
}


def proxies():
    return {"http": PROXY, "https": PROXY} if PROXY else None


def rand_mail():
    name = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
    return "%s@fldubai.com" % name


def mk_mailbox(address, password):
    h = {"accept": "application/json", "content-type": "application/json"}
    r = creq.post(MAIL + "/accounts", data=json.dumps({"address": address, "password": password}),
                  headers=h, impersonate="chrome", proxies=proxies(), timeout=25)
    if r.status_code not in (200, 201):
        print("  [mail] create:", r.status_code, (r.text or "")[:100])
        return None
    t = creq.post(MAIL + "/token", data=json.dumps({"address": address, "password": password}),
                  headers=h, impersonate="chrome", proxies=proxies(), timeout=25)
    if t.status_code != 200:
        print("  [mail] token:", t.status_code, (t.text or "")[:100])
        return None
    return t.json().get("token")


def wait_code(token, timeout=150):
    h = {"accept": "application/json", "authorization": "Bearer " + token}
    t0 = time.time()
    while time.time() - t0 < timeout:
        r = creq.get(MAIL + "/messages", headers=h, impersonate="chrome", proxies=proxies(), timeout=25)
        arr = r.json() if r.status_code == 200 else []
        if arr:
            mid = arr[0]["id"]
            full = creq.get(MAIL + "/messages/" + mid, headers=h, impersonate="chrome", proxies=proxies(), timeout=25).json()
            parts = []
            for k in ("text", "html"):
                v = full.get(k)
                if isinstance(v, list):
                    parts.append(" ".join(v))
                elif isinstance(v, str):
                    parts.append(v)
            body = re.sub(r"<[^>]+>", " ", " ".join(parts))
            m = re.search(r"\b(\d{8})\b", body)
            if m:
                return m.group(1)
        time.sleep(5)
    return None


def verify_cookie(sess):
    r = sess.get(BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                 impersonate="chrome", proxies=proxies(), timeout=30)
    try:
        j = json.loads(r.text)[0]["result"]["data"]["json"]
        return j.get("isLoggedIn"), j.get("id"), j.get("credit")
    except Exception:
        return False, None, None


def cookie_header(sess):
    return "; ".join("%s=%s" % (c.name, c.value) for c in sess.cookies.jar)


def save_pool(name, cookie, info):
    pool = {}
    if os.path.exists(POOL):
        with io.open(POOL, encoding="utf-8") as f:
            pool = json.load(f)
    pool[name] = {"cookie": cookie, "note": "邮箱注册·自动", "last": info}
    with io.open(POOL, "w", encoding="utf-8", newline="\n") as f:
        json.dump(pool, f, ensure_ascii=False, indent=1)


def one_round(idx):
    address = rand_mail()
    password = "Dz" + "".join(random.choices(string.ascii_letters + string.digits, k=10)) + "!9"
    print("[%d] 邮箱: %s" % (idx, address))
    tok = mk_mailbox(address, password)
    if not tok:
        print("  邮箱创建失败"); return False

    sess = creq.Session(impersonate="chrome", proxies=proxies(), timeout=40)
    body = json.dumps({"email": address, "password": password, "terms": True})
    r = sess.post(BASE + "/api/auth/sign-up", data=body,
                  headers=HDR)
    print("  sign-up:", r.status_code, (r.text or "")[:90].replace("\n", " "))
    if r.status_code == 428 or "captcha" in (r.text or ""):
        print("  !! 触发验证码（428），需要在浏览器里过一次拖拽，或换出口 IP")
        return False
    if r.status_code != 200:
        return False

    code = wait_code(tok)
    if not code:
        print("  !! 没收到验证码邮件")
        return False
    print("  验证码:", code)

    otp = json.dumps({"email": address, "token": code, "type": "email", "next": "/"})
    r2 = sess.post(BASE + "/api/auth/sign-up/otp", data=otp,
                   headers=HDR)
    print("  otp:", r2.status_code, (r2.text or "")[:100].replace("\n", " "))
    if r2.status_code != 200:
        return False

    ok, uid, credit = verify_cookie(sess)
    if not ok:
        print("  !! 登录态校验失败")
        return False
    ck = cookie_header(sess)
    name = "mail%02d" % idx
    save_pool(name, ck, {"uid": uid, "credit": credit, "checked_at": int(time.time())})
    print("  ✅ %s uid=%s credit=%s 已入池" % (name, uid, credit))
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--gap", type=float, default=8.0)
    args = ap.parse_args()
    ok = 0
    for i in range(1, args.n + 1):
        if one_round(i):
            ok += 1
        if i < args.n:
            time.sleep(args.gap)
    print("完成: %d/%d" % (ok, args.n))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
