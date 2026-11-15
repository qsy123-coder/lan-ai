# scripts/recover_reset.py —— 对「已注册但没拿到 cookie」的号走忘记密码重设，重新拿到登录态
#
# 流程: 开浏览器 → /sign-in?s=reset → 填邮箱发送 → 读 Gmail 重置码 → 验证 → 设新密码 → 抓 cookie → 入池
#
# 用法:
#   python scripts/recover_reset.py --items b058:<alias>@<domain> b059:<alias>@<domain> \
#       --exit http://127.0.0.1:7902 --base-port 9640
#   （新密码走环境变量 DZMM_RESET_PASSWORD，不写进源码）
import argparse
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import new_account as na  # noqa: E402
import mailbox as mbx  # noqa: E402
from curl_cffi import requests as creq  # noqa: E402

PASSWORD = os.environ.get("DZMM_RESET_PASSWORD", "")


def js(port, expr):
    return na.cdp(port, expr)[0] or ""


def wait_el(port, sel, timeout=25):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if "ready" in js(port, "document.querySelector('%s')?'ready':'no'" % sel):
            return True
        time.sleep(1)
    return False


def set_input(port, selector, value):
    return js(port, "(function(){var e=document.querySelector('%s');if(!e)return 'no';"
                    "var d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),'value');"
                    "d.set.call(e,'%s');e.dispatchEvent(new Event('input',{bubbles:true}));"
                    "e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'})()"
              % (selector, value))


def click_text(port, text):
    return js(port, "(function(){var e=[].slice.call(document.querySelectorAll('button,a')).filter("
                    "function(x){return new RegExp('%s').test((x.innerText||'').trim())})[0];"
                    "if(!e)return 'no';e.click();return 'ok'})()" % text)


def cookie_header(port):
    p = subprocess.run([na.NODE_BIN, os.path.join(os.path.dirname(os.path.abspath(__file__)), "cdp.mjs"),
                        "--port", str(port), "--cookies"],
                       capture_output=True, text=True, encoding="utf-8", timeout=90)
    for line in (p.stdout or "").splitlines():
        if line.startswith("COOKIE_HEADER="):
            return line[len("COOKIE_HEADER="):]
    return None


def getme(proxy, ck):
    r = creq.get(na.BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                 headers={"cookie": ck}, impersonate="chrome",
                 proxies={"http": proxy, "https": proxy}, timeout=30)
    try:
        j = json.loads(r.text)[0]["result"]["data"]["json"]
        return j
    except Exception:
        return {}


def recover(name, addr, exit_proxy, port, imap_proxy):
    print("\n===", name, addr, flush=True)
    base = mbx.imap_max_uid(imap_proxy, na.IMAP_USER, na.IMAP_PASS)
    profile = os.path.join(os.environ.get("TEMP", "."), "dzmm-re-%d" % port)
    if not na.launch(port, profile, na.BASE + "/sign-in", use_proxy=True, proxy=exit_proxy):
        print(" launch fail")
        return False
    time.sleep(4)
    if not wait_el(port, "input[type=email]"):
        print(" no email input")
        return False
    # 必须从「忘记密码」入口进，直接开 ?s=reset 时发送按钮不会触发重置 mutation
    print(" forgot:", click_text(port, "忘记密码"))
    time.sleep(2)
    if not wait_el(port, "input[type=email]"):
        print(" no reset form")
        return False
    set_input(port, "input[type=email]", addr)
    time.sleep(0.8)
    print(" send:", click_text(port, "发送"))
    # 等 OTP 页（出现 8 位输入框）再收码
    t0 = time.time()
    while time.time() - t0 < 20:
        if "ready" in js(port, "document.querySelector('input[maxlength=\"8\"]')?'ready':'no'"):
            break
        time.sleep(1.5)
    print(" url:", js(port, "location.href")[:120])
    code = mbx.imap_wait_code(imap_proxy, na.IMAP_USER, na.IMAP_PASS, since_uid=base, timeout=180)
    print(" code:", code)
    if not code:
        return False
    if not wait_el(port, "input[maxlength='8'], input"):
        return False
    js(port, "(async()=>{const i=[...document.querySelectorAll('input')].find(x=>x.maxLength===8)||document.querySelector('input');"
             "const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(i),'value');d.set.call(i,'%s');"
             "i.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,500));return 'ok'})()" % code)
    print(" verify:", click_text(port, "验证"))
    time.sleep(4)
    if not wait_el(port, "input[type=password]"):
        print(" no password input; url:", js(port, "location.href"))
        return False
    set_input(port, "input[type=password]", PASSWORD)
    print(" reset:", click_text(port, "重设密码"))
    time.sleep(6)
    ck = cookie_header(port)
    if not ck:
        print(" no cookie")
        return False
    j = getme(exit_proxy, ck)
    print(" me:", {k: j.get(k) for k in ("isLoggedIn", "id", "credit", "email")})
    if not j.get("isLoggedIn"):
        return False
    na.add_pool(name, ck, {"uid": j.get("id"), "credit": j.get("credit"),
                           "note": "d1 子域·SG·ImprovMX→Gmail（重置密码补入）"})
    print(" 入池", name, "credit=", j.get("credit"))
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--items", nargs="+", required=True, help="name:email")
    ap.add_argument("--exit", default="http://127.0.0.1:7902")
    ap.add_argument("--base-port", type=int, default=9640)
    ap.add_argument("--imap-proxy", default="socks5h://127.0.0.1:1082")
    args = ap.parse_args()
    ok = 0
    for i, it in enumerate(args.items):
        name, addr = it.split(":", 1)
        if recover(name, addr, args.exit, args.base_port + i, args.imap_proxy):
            ok += 1
    print("\n完成 %d/%d" % (ok, len(args.items)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
