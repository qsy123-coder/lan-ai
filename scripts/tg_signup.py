# scripts/tg_signup.py —— 用接码号注册 Telegram 账号，产出可复用的 StringSession
#
# 用法:
#   python scripts/tg_signup.py --phone +56991786765 --send
#   python scripts/tg_signup.py --phone +56991786765 --code 12345
#   python scripts/tg_signup.py --phone +56991786765 --code 12345 --password <2FA密码>
#   python scripts/tg_signup.py --phone +56991786765 --wait-file out/tg_code.txt --timeout 600
#   python scripts/tg_signup.py --phone +56991786765 --code 12345 --sms-key <sms-activate key> --sms-id 12345678
#
# 产出: out/tg_<phone>.session（StringSession 文本），后续 scripts/tg_login_dzmm.py 直接吃这个文件。
import argparse
import asyncio
import io
import os
import sys
import time

from telethon import TelegramClient
from telethon.errors import (
    FloodWaitError,
    PhoneCodeInvalidError,
    PhoneCodeExpiredError,
    PhoneNumberBannedError,
    PhoneNumberInvalidError,
    SessionPasswordNeededError,
)
from telethon.sessions import StringSession
from telethon.network.connection import ConnectionTcpFull, ConnectionTcpMTProxyRandomizedIntermediate  # noqa: F401

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_ID = int(os.environ.get("TG_API_ID", "2040"))
API_HASH = os.environ.get("TG_API_HASH", "b18441a1ff607e10a989891a5462e627")  # Telegram Desktop 公开参数
PROXY = os.environ.get("TG_PROXY", "127.0.0.1:7897")  # 本地 Clash 混合口，HTTP 代理


def session_path(phone):
    safe = phone.replace("+", "").replace(" ", "")
    return os.path.join(ROOT, "out", "tg_%s.session" % safe)


def load_session(phone):
    p = session_path(phone)
    if os.path.exists(p):
        with io.open(p, encoding="utf-8") as f:
            return StringSession(f.read().strip())
    return StringSession()


def save_session(phone, sess):
    p = session_path(phone)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(sess.save())
    return p


def make_proxy():
    if not PROXY:
        return None
    try:
        from python_socks import ProxyType
        host, port = PROXY.rsplit(":", 1)
        return (ProxyType.HTTP, host, int(port))
    except Exception:
        return None


def sms_code_from_api(key, order_id):
    """从 sms-activate 拉验证码（可选）。"""
    import json
    import urllib.request
    url = ("https://api.sms-activate.org/stubs/handler_api.php?api_key=%s&action=getStatus&id=%s"
           % (key, order_id))
    with urllib.request.urlopen(url, timeout=20) as r:
        raw = r.read().decode("utf-8", "replace")
    if raw.startswith("STATUS_OK:"):
        return raw.split(":", 1)[1].strip()
    return None


def wait_code_from_file(path, timeout):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if os.path.exists(path):
            v = io.open(path, encoding="utf-8-sig").read().strip()
            if v:
                return v
        time.sleep(3)
    return None


async def run(args):
    sess = load_session(args.phone)
    client = TelegramClient(sess, API_ID, API_HASH, proxy=make_proxy(),
                            connection_retries=3, timeout=30)
    await client.connect()

    if await client.is_user_authorized():
        me = await client.get_me()
        print("已登录:", me.id, me.first_name, "| session:", session_path(args.phone))
        await client.disconnect()
        return 0

    if args.send or args.code or args.wait_file:
        try:
            sent = await client.send_code_request(args.phone, force_sms=args.force_sms)
            tname = type(sent.type).__name__
            print("验证码已请求 | 投递方式:", tname)
            if tname == "SentCodeTypeApp" and not args.force_sms:
                print("!! 该号码【已经注册过 Telegram】，验证码发到对方 App，不会进接码面板。")
                print("!! 这条号不能用来注册新号，取消订单退款，换一个号。")
                await client.disconnect()
                return 9
        except PhoneNumberInvalidError:
            print("号码格式非法（要带国家码，如 +56991786765）")
            await client.disconnect(); return 2
        except PhoneNumberBannedError:
            print("该号码已被 Telegram 封禁，换号")
            await client.disconnect(); return 3
        except FloodWaitError as e:
            print("触发 FloodWait，需等 %d 秒" % e.seconds)
            await client.disconnect(); return 4

    if not args.code and not args.wait_file and not args.sms_key:
        save_session(args.phone, sess)
        print("已保存会话阶段状态:", session_path(args.phone), "（拿到验证码后加 --code 继续）")
        await client.disconnect()
        return 0

    code = args.code
    if not code and args.sms_key:
        print("轮询 sms-activate 取码…")
        for _ in range(100):
            code = sms_code_from_api(args.sms_key, args.sms_id)
            if code:
                break
            time.sleep(6)
    if not code and args.wait_file:
        print("等待验证码写入", args.wait_file, "（最长 %ds）" % args.timeout)
        code = wait_code_from_file(args.wait_file, args.timeout)
    if not code:
        print("没拿到验证码")
        await client.disconnect(); return 5

    try:
        await client.sign_in(args.phone, code)
    except SessionPasswordNeededError:
        if not args.password:
            print("该号已设 2FA，需要 --password")
            await client.disconnect(); return 6
        await client.sign_in(password=args.password)
    except PhoneCodeInvalidError:
        print("验证码错误")
        await client.disconnect(); return 7
    except PhoneCodeExpiredError:
        print("验证码过期，重新 --send")
        await client.disconnect(); return 8

    me = await client.get_me()
    p = save_session(args.phone, client.session)
    print("注册成功:", me.id, me.first_name or "", "| session 已存:", p)
    print("SESSION_STRING=" + client.session.save())
    await client.disconnect()
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--phone", required=True)
    ap.add_argument("--send", action="store_true")
    ap.add_argument("--force-sms", action="store_true", help="强制要求短信验证码（对已注册号也可能生效）")
    ap.add_argument("--code", default="")
    ap.add_argument("--password", default="")
    ap.add_argument("--wait-file", default="")
    ap.add_argument("--timeout", type=int, default=600)
    ap.add_argument("--sms-key", default="")
    ap.add_argument("--sms-id", default="")
    args = ap.parse_args()
    return asyncio.run(run(args))


if __name__ == "__main__":
    sys.exit(main())
