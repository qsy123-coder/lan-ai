# scripts/signup_via_browser.py —— 在「已存在的 CDP 浏览器」里完成一次注册
#
# 用途：闸门已经人工过掉（或刚过），复用同一个 profile 继续：
#   开注册页 → 填表 → 提交 → 若弹 428 则切「独立验证页」让人工拖 → 回注册页重提
#   → 等到 s=otp → 收码 → 提交 → 抓 cookie → getMe → 入池
#
# 用法:
#   python scripts/signup_via_browser.py --port 9527 --name b040 --provider mailtm --domain fldubai.com
#   python scripts/signup_via_browser.py --port 9527 --name b040 --provider mailtm --domain fldubai.com --standalone-gate
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import new_account as na  # noqa: E402
import signup_email as se  # noqa: E402
from curl_cffi import requests as creq  # noqa: E402

GETME = na.BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"


def verify_me(ck, proxy):
    try:
        r = creq.get(GETME, headers={"cookie": ck}, impersonate="chrome",
                     proxies={"http": proxy, "https": proxy}, timeout=30)
        j = json.loads(r.text)[0]["result"]["data"]["json"]
        return {"logged": j.get("isLoggedIn"), "uid": j.get("id"), "credit": j.get("credit")}
    except Exception:
        return {"logged": False}

CAPTCHA_URL = (na.BASE + "/__captcha/?src=ratelimit&theme=light"
               "&next=%2Fapi%2Fhealth%3Fcaptcha_completed%3D1")

FILL_JS = ("(()=>{const set=(e,v)=>{const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),'value');"
           "d.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));"
           "e.dispatchEvent(new Event('change',{bubbles:true}))};"
           "const em=document.querySelector('input[type=email]');const pw=document.querySelector('input[type=password]');"
           "if(!em||!pw)return 'no-input';set(em,'%s');set(pw,'%s');"
           "const cb=document.querySelector('input[type=checkbox]');if(cb&&!cb.checked)cb.click();"
           "return JSON.stringify({email:em.value,pwdlen:pw.value.length})})()")

SUBMIT_JS = ("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^注册$/.test((x.innerText||'').trim()));"
             "if(!b)return 'no-reg';b.click();return 'clicked'})()")

STATE_JS = ("JSON.stringify({href:location.href,search:location.search,"
            "ifr:[...document.querySelectorAll('iframe')].map(f=>f.src||''),"
            "t:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,300)})")


def js(port, expr):
    out, err = na.cdp(port, expr)
    return (out or "") + ((" [stderr]" + err) if err else "")


def wait_form(port, timeout=30):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if "ready" in js(port, "document.querySelector('input[type=email]')?'ready':'no'"):
            return True
        time.sleep(1)
    return False


def submit_once(port, addr, pwd):
    out = js(port, FILL_JS % (addr, pwd))
    if "no-input" in out:
        return "no_form"
    time.sleep(0.8)
    out = js(port, SUBMIT_JS)
    if "no-reg" in out:
        return "no_button"
    return "submitted"


def wait_state(port, timeout=40):
    """等提交结果：返回 otp / risk / captcha / toast / timeout。"""
    t0 = time.time()
    gate_seen = False
    while time.time() - t0 < timeout:
        time.sleep(1.5)
        st = js(port, STATE_JS)
        if "s=otp" in st:
            return "otp", st
        if "REGISTER_RISK" in st:
            return "risk", st
        if "__captcha" in st:
            gate_seen = True
            return "captcha", st
        if "暂时无法完成注册" in st and not gate_seen:
            return "toast", st
    return "timeout", st


def standalone_gate(port, timeout=300):
    """顶层打开验证页，等人工拖完；返回 True/False。"""
    print("  → 打开独立验证页，请在窗口里拖拽并点「继续访问 DZMM」（最多 %ds）" % timeout)
    js(port, "(()=>{window.focus();return 1})()")
    js(port, "(async()=>{location.href='%s';return 'nav'})()" % CAPTCHA_URL)
    t0 = time.time()
    while time.time() - t0 < timeout:
        time.sleep(3)
        href = js(port, "location.href")
        if "__captcha" not in href and href.startswith("http"):
            print("  ✓ 验证页已跳转:", href[:90])
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--provider", choices=["mailtm"], default="mailtm")
    ap.add_argument("--domain", default="fldubai.com")
    ap.add_argument("--standalone-gate", action="store_true")
    ap.add_argument("--addr", default="", help="指定收件地址（给了就不建临时邮箱）")
    ap.add_argument("--probe-only", action="store_true", help="到达 OTP 页即停，不收码")
    ap.add_argument("--imap-curl", action="store_true", help="用 curl 走 SOCKS 读 Gmail 收码")
    ap.add_argument("--imap-proxy", default="socks5h://127.0.0.1:1082")
    ap.add_argument("--verify-proxy", default="http://127.0.0.1:7902",
                    help="校验 getMe 用的出口（不能用写死的 7897）")
    args = ap.parse_args()

    if args.addr:
        addr = args.addr
        pwd = "Dz" + "".join(__import__("random").choices(
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", k=10)) + "!9"
        print("邮箱(指定):", addr)
        token = None
    else:
        addr = "".join(__import__("random").choices("abcdefghijklmnopqrstuvwxyz0123456789", k=12)) + "@" + args.domain
        pwd = "Dz" + "".join(__import__("random").choices(
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", k=10)) + "!9"
        print("邮箱:", addr)
        token = se.mk_mailbox(addr, pwd)
        if not token:
            print("mailbox_fail")
            return 2

    base_uid = 0
    if args.imap_curl:
        import mailbox as mbx
        base_uid = mbx.imap_max_uid(args.imap_proxy, na.IMAP_USER, na.IMAP_PASS)
        print("IMAP baseline uid:", base_uid)

    js(args.port, "(async()=>{location.href='%s/sign-in?s=signup';return 'nav'})()" % na.BASE)
    time.sleep(4)
    if not wait_form(args.port):
        print("no_form")
        return 2

    res = submit_once(args.port, addr, pwd)
    print("提交:", res)
    if res != "submitted":
        return 2

    state, st = wait_state(args.port)
    print("状态:", state)
    if state == "captcha" and args.standalone_gate:
        if not standalone_gate(args.port):
            print("gate_timeout")
            return 3
        # 回注册页重提
        js(args.port, "(async()=>{location.href='%s/sign-in?s=signup';return 'nav'})()" % na.BASE)
        time.sleep(4)
        if not wait_form(args.port):
            print("no_form_after_gate")
            return 3
        res = submit_once(args.port, addr, pwd)
        print("重提:", res)
        state, st = wait_state(args.port)
        print("状态2:", state)
    if state != "otp":
        print("body:", st[:300])
        return 3
    if args.probe_only:
        print("★ 已到 OTP 页（域名被受理，未被拒）")
        return 0

    if not args.imap_curl and not token:
        print("没有可用收码通道：指定 --addr 时必须配 --imap-curl")
        return 4
    print("等邮件…")
    if args.imap_curl:
        import mailbox as mbx
        code = mbx.imap_wait_code(args.imap_proxy, na.IMAP_USER, na.IMAP_PASS,
                                  since_uid=base_uid, timeout=180)
    else:
        code = se.wait_code(token, 180)
    if not code:
        print("no_code")
        return 4
    print("码:", code)
    submit = ("(async()=>{const inp=[...document.querySelectorAll('input')].find(i=>i.maxLength===8)"
              "||document.querySelector('input');if(!inp)return 'no-input';"
              "const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');"
              "d.set.call(inp,'%s');inp.dispatchEvent(new Event('input',{bubbles:true}));"
              "await new Promise(r=>setTimeout(r,600));"
              "const b=[...document.querySelectorAll('button')].find(x=>/验证/.test((x.innerText||'').trim()));"
              "if(!b)return 'no-btn';b.click();return 'ok'})()" % code)
    js(args.port, submit)
    time.sleep(7)

    ck = na.cookie_header(args.port)
    if not ck:
        print("no_cookie")
        return 5
    info = verify_me(ck, args.verify_proxy)
    print("getMe:", {k: info.get(k) for k in ("logged", "uid", "credit")})
    if not info.get("logged"):
        return 5
    info["note"] = "独立验证页·%s" % args.domain
    na.add_pool(args.name, ck, info)
    print("🎉 入池 %s credit=%s" % (args.name, info.get("credit")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
