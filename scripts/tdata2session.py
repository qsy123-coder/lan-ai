# scripts/tdata2session.py —— 成品号 tdata → Telethon StringSession
#
# 用法:
#   python scripts/tdata2session.py --src out/tdata --name tg01
#   python scripts/tdata2session.py --src out/tg_tdata.zip --name tg01
#   python scripts/tdata2session.py --src out/tdata --name tg01 --passcode 12345
#
# 产出: out/tg_<name>.session（StringSession 文本），可直接给 scripts/tg_login_dzmm.py 用。
# 依赖: opentele + PyQt5 + cryptg（本机已装；tgcrypto 用 shim 顶替，见 site-packages/tgcrypto.py）
import argparse
import asyncio
import io
import os
import sys
import zipfile

from opentele.api import API, UseCurrentSession
from opentele.td import TDesktop
from telethon.sessions import StringSession

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def prepare(src):
    """接受 tdata 目录或压缩包；压缩包解到 out/_tdata_tmp。"""
    if os.path.isdir(src):
        return src
    if src.lower().endswith(".zip"):
        dest = os.path.join(ROOT, "out", "_tdata_tmp")
        os.makedirs(dest, exist_ok=True)
        with zipfile.ZipFile(src) as z:
            z.extractall(dest)
        for root, dirs, files in os.walk(dest):
            if "key_datas" in files or any(f.startswith("D877") for f in files):
                return root
            if "tdata" in dirs:
                return os.path.join(root, "tdata")
        return dest
    raise SystemExit("src 既不是目录也不是 zip: %s" % src)


async def main_async(args):
    path = prepare(args.src)
    print("tdata:", path)
    tdesk = None
    try:
        tdesk = TDesktop(path, passcode=args.passcode or None)
    except TypeError:
        tdesk = TDesktop(path)
    except Exception as e:
        print("TDesktop 打开失败:", str(e)[:160])
        return 2

    if tdesk is None or not tdesk.isLoaded():
        print("tdata 没加载成功（可能需要 passcode，或文件不完整）")
        return 3

    api = API.TelegramDesktop
    sess = StringSession()
    try:
        client = await tdesk.ToTelethon(session=sess, flag=UseCurrentSession, api=api)
    except Exception as e:
        print("转 Telethon 失败:", str(e)[:200])
        return 4

    me = None
    try:
        await client.connect()
        if await client.is_user_authorized():
            me = await client.get_me()
        s = client.session.save()
    finally:
        await client.disconnect()

    if not me:
        print("转换出的 session 未授权（号可能被踢 / 需要重新登录）")
        return 5

    out = os.path.join(ROOT, "out", "tg_%s.session" % args.name)
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)
    print("OK uid=%s name=%s phone=%s" % (me.id, me.first_name or "", me.phone or ""))
    print("session 已存:", out)
    print("SESSION_STRING=" + s)
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="tdata 目录或 zip")
    ap.add_argument("--name", default="tg01")
    ap.add_argument("--passcode", default="")
    args = ap.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    sys.exit(main())
