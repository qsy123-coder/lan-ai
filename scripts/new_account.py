# scripts/new_account.py —— 开号调度器：冷却 + 节点轮换 + 新 profile + 拖拽等待 + 自动收尾
#
# 两种模式:
#   --mode email    邮箱注册（免费）：建临时邮箱 → 填表 → 等你在弹窗里拖一次 → 自动收信填码 → 入池
#   --mode google   买来的 Gmail 号：打开 Google 登录 → 你完成登录 → 自动抓 cookie → 入池
#
# 用法:
#   python scripts/new_account.py --mode email               # 冷却到点才动，否则只打印剩余时间
#   python scripts/new_account.py --mode email --force       # 无视冷却强制来一发
#   python scripts/new_account.py --mode google --name g01   # 用买来的 Google 号
#   python scripts/new_account.py --status                   # 看冷却状态与历史
#
# 冷却逻辑：同一出口 IP 短时间连续注册会触发 429 REGISTER_RISK_BLOCKED，
#          默认每成功一个号冷却 60 分钟；429 命中后额外冷却 30 分钟。
import argparse
import io
import json
import os
import random
import re
import string
import subprocess
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
MAIL = "https://api.mail.tm"
NODE_BIN = os.environ.get("NODE_BIN", r"C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe")
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
CLASH = os.path.join(ROOT, "scripts", "clash.ps1")
CDP = os.path.join(ROOT, "scripts", "cdp.mjs")
STATE = os.path.join(ROOT, "out", "signup_state.json")
POOL = os.path.join(ROOT, "accounts.json")
PROXY = "http://127.0.0.1:7897"

NODES = ["🇯🇵 日本Anytls 03", "🇨🇬 刚果", "🇨🇭 瑞士 01", "🇭🇰 香港Anytls 05",
         "🇨🇳 台湾Hinet-03", "🇯🇵 日本Anytls 02", "🇸🇬 新加坡Anytls 01"]


# ---------- 状态 ----------
def load_state():
    if os.path.exists(STATE):
        return json.load(io.open(STATE, encoding="utf-8"))
    return {"last_success": 0, "last_429": 0, "history": [], "bad_nodes": []}


def save_state(s):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    io.open(STATE, "w", encoding="utf-8", newline="\n").write(json.dumps(s, ensure_ascii=False, indent=1))


# ---------- 代理/节点 ----------
def clash(*args):
    try:
        p = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", CLASH] + list(args),
                           capture_output=True, text=True, encoding="utf-8", timeout=60)
        return (p.stdout or "").strip()
    except Exception as e:
        return "ERR " + str(e)


def probe():
    try:
        r = creq.get(BASE + "/api/trpc/nope.nothing?batch=1&input=%7B%7D", impersonate="chrome",
                     proxies={"https": PROXY}, timeout=15)
        return r.status_code
    except Exception:
        return 0


def pick_node(state):
    for n in NODES:
        if n in state.get("bad_nodes", []):
            continue
        clash("-Set", n)
        time.sleep(3)
        code = probe()
        if code in (404, 401):
            return n, code
    return None, 0


# ---------- 浏览器 ----------
def launch(port, profile, url):
    os.makedirs(profile, exist_ok=True)
    subprocess.Popen([EDGE, "--proxy-server=http://127.0.0.1:7897", "--user-data-dir=" + profile,
                      "--ignore-certificate-errors", "--remote-debugging-port=%d" % port,
                      "--no-first-run", "--no-default-browser-check", url])
    for _ in range(30):
        try:
            creq.get("http://127.0.0.1:%d/json/version" % port, timeout=2)
            return True
        except Exception:
            time.sleep(1)
    return False


def cdp(port, expr, timeout=120):
    p = subprocess.run([NODE_BIN, CDP, "--port", str(port), expr],
                       capture_output=True, text=True, encoding="utf-8", timeout=timeout)
    return (p.stdout or "").strip(), (p.stderr or "").strip()


def cookie_header(port):
    p = subprocess.run([NODE_BIN, CDP, "--port", str(port), "--cookies"],
                       capture_output=True, text=True, encoding="utf-8", timeout=90)
    for line in (p.stdout or "").splitlines():
        if line.startswith("COOKIE_HEADER="):
            return line[len("COOKIE_HEADER="):]
    return None


# ---------- 邮箱 ----------
def _load_imap_conf():
    """优先 out/imap.json（{"host","user","pass"}），否则读环境变量。"""
    p = os.path.join(ROOT, "out", "imap.json")
    if os.path.exists(p):
        try:
            j = json.load(io.open(p, encoding="utf-8"))
            if j.get("user") and j.get("pass"):
                return (j.get("host") or "imap.gmail.com"), j["user"], j["pass"]
        except Exception as e:
            print("  [imap] out/imap.json 解析失败:", str(e)[:80])
    return (os.environ.get("IMAP_HOST", "imap.gmail.com"),
            os.environ.get("IMAP_USER", ""), os.environ.get("IMAP_PASS", ""))


IMAP_HOST, IMAP_USER, IMAP_PASS = _load_imap_conf()


def imap_code_for(addr, timeout=180):
    """读转发到 IMAP 邮箱的验证码：INBOX / Spam / All Mail 都扫。"""
    import email as _email
    import imaplib
    if not (IMAP_USER and IMAP_PASS):
        print("  [imap] 缺 IMAP_USER / IMAP_PASS")
        return None
    t0 = time.time()
    boxes = ["INBOX", "[Gmail]/Spam", "[Gmail]/All Mail"]
    while time.time() - t0 < timeout:
        try:
            m = imaplib.IMAP4_SSL(IMAP_HOST, timeout=30)
            m.login(IMAP_USER, IMAP_PASS)
            for box in boxes:
                try:
                    if m.select(box) [0] != "OK":
                        continue
                    typ, data = m.search(None, 'TO', '"%s"' % addr)
                    ids = (data[0] or b"").split()
                    for mid in reversed(ids[-3:]):
                        typ, msgdata = m.fetch(mid, "(RFC822)")
                        msg = _email.message_from_bytes(msgdata[0][1])
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() in ("text/plain", "text/html"):
                                    try:
                                        body += part.get_payload(decode=True).decode(
                                            part.get_content_charset() or "utf-8", "replace")
                                    except Exception:
                                        pass
                        else:
                            body = msg.get_payload(decode=True).decode("utf-8", "replace")
                        body = re.sub(r"<[^>]+>", " ", body)
                        mm = re.search(r"\b(\d{8})\b", body)
                        if mm:
                            m.logout()
                            return mm.group(1)
                except Exception:
                    continue
            m.logout()
        except Exception as e:
            print("  [imap] ERR", str(e)[:80])
        time.sleep(6)
    return None


def mk_mailbox(domain=""):
    """domain 非空则用自有域名（随机前缀），收信走 IMAP；否则退回 Guerrilla。"""
    if domain:
        addr = "".join(random.choices(string.ascii_lowercase + string.digits, k=10)) + "@" + domain
        return addr, None, "imap"
    return mk_mailbox_guerrilla()


def mk_mailbox_guerrilla():
    """Guerrilla Mail 兜底（注意：guerrillamail 系域名会被 dzmm 判为一次性邮箱）。"""
    G = "https://api.guerrillamail.com/ajax.php"
    try:
        r = creq.get(G, params={"f": "get_email_address", "domain": "sharklasers.com"},
                     impersonate="chrome", proxies={"https": PROXY}, timeout=20)
        j = r.json()
        addr, sid = j.get("email_addr"), j.get("sid_token")
        if addr and sid:
            return addr, None, sid
    except Exception as e:
        print("  [mail] guerrilla ERR", str(e)[:80])
    return None


def wait_code(token, timeout=180, addr=None):
    if token == "imap":
        return imap_code_for(addr or "", timeout)
    """token 就是 guerrilla 的 sid_token。"""
    G = "https://api.guerrillamail.com/ajax.php"
    seen = set()
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            r = creq.get(G, params={"f": "get_email_list", "sid_token": token, "offset": "0"},
                         impersonate="chrome", proxies={"https": PROXY}, timeout=25)
            mails = (r.json() or {}).get("list") or []
            for m in mails:
                mid = str(m.get("mail_id"))
                if mid in seen:
                    continue
                seen.add(mid)
                d = creq.get(G, params={"f": "fetch_email", "sid_token": token, "email_id": mid},
                             impersonate="chrome", proxies={"https": PROXY}, timeout=25).json()
                body = (d.get("mail_body") or "")
                body = re.sub(r"<[^>]+>", " ", body)
                m8 = re.search(r"\b(\d{8})\b", body)
                if m8:
                    return m8.group(1)
        except Exception:
            pass
        time.sleep(6)
    return None


# ---------- 入池 ----------
def add_pool(name, cookie, info):
    pool = {}
    if os.path.exists(POOL):
        pool = json.load(io.open(POOL, encoding="utf-8"))
    pool[name] = {"cookie": cookie, "note": info.pop("note", ""), "last": info}
    io.open(POOL, "w", encoding="utf-8", newline="\n").write(json.dumps(pool, ensure_ascii=False, indent=1))
    return len(pool)


def me_of(cookie):
    r = creq.get(BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                 headers={"cookie": cookie}, impersonate="chrome", proxies={"https": PROXY}, timeout=30)
    try:
        j = json.loads(r.text)[0]["result"]["data"]["json"]
        return {"uid": j.get("id"), "credit": j.get("credit"), "logged": j.get("isLoggedIn")}
    except Exception:
        return {"logged": False}


# ---------- 模式 ----------
def mode_email(args, state):
    addr, pwd, tok = mk_mailbox(args.mail_domain or "")
    if not addr:
        print("临时邮箱建不出来（mail.tm 429），等几分钟再试")
        return 1
    print("邮箱:", addr)

    port = random.randint(9300, 9399)
    profile = os.path.join(os.environ.get("TEMP", "."), "dzmm-g%d" % port)
    if not launch(port, profile, BASE + "/sign-in"):
        print("浏览器没起来")
        return 1
    time.sleep(3)

    fill = ("(async()=>{const el=[...document.querySelectorAll('button,a,span,div')]"
            ".filter(e=>/创建账号/.test(e.innerText||'')&&(e.innerText||'').length<12);"
            "if(el.length)el[el.length-1].click();await new Promise(r=>setTimeout(r,1600));"
            "const set=(e,v)=>{const d=Object.getOwnPropertyDescriptor(e.constructor.prototype,'value').set;"
            "d.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}))};"
            "set(document.querySelector('input[type=email]'),'%s');"
            "set(document.querySelector('input[type=password]'),'%s');"
            "const cb=document.querySelector('input[type=checkbox]');if(cb&&!cb.checked)cb.click();"
            "await new Promise(r=>setTimeout(r,500));"
            "const reg=[...document.querySelectorAll('button')].find(x=>/^注册$/.test((x.innerText||'').trim()));"
            "if(!reg)return 'no-reg';reg.click();await new Promise(r=>setTimeout(r,6000));"
            "return JSON.stringify({url:location.href,captcha:!!document.querySelector('iframe'),"
            "txt:(document.body.innerText||'').slice(0,120)})})()" % (addr, pwd))
    out, err = cdp(port, fill)
    print("提交:", out or err[:160])
    if "no-reg" in out:
        print("页面没进注册态，可能被风控跳转")
        return 1

    print(">>> 现在请在弹窗里拖一次验证码（最多等 5 分钟）")
    t0, code_sent, blocked = time.time(), False, False
    while time.time() - t0 < 300:
        time.sleep(5)
        st, _ = cdp(port, "JSON.stringify({u:location.search, f:!!document.querySelector('iframe'),"
                          "t:(document.body.innerText||'').slice(0,120)})")
        if "s=otp" in st:
            code_sent = True
            break
        if "REGISTER_RISK" in st or "暂时无法完成注册" in st:
            blocked = True
            break
    if blocked:
        print("!! 429 风控拦截，节点记黑名单，冷却 30 分钟后再来")
        state["last_429"] = int(time.time())
        node = None
        save_state(state)
        return 2
    if not code_sent:
        print("等超时：没进到 OTP 页（可能拖拽未通过）")
        return 1

    print("邮件等码…")
    code = wait_code(tok, addr=addr)
    if not code:
        print("没收到验证码")
        return 1
    print("验证码:", code)

    submit = ("(async()=>{const inp=[...document.querySelectorAll('input')].find(i=>i.maxLength===8)"
              "||document.querySelector('input');if(!inp)return 'no-input';"
              "const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');"
              "d.set.call(inp,'%s');inp.dispatchEvent(new Event('input',{bubbles:true}));"
              "await new Promise(r=>setTimeout(r,600));"
              "const b=[...document.querySelectorAll('button')].find(x=>/验证/.test((x.innerText||'').trim()));"
              "if(!b)return 'no-btn';b.click();return 'ok'})()" % code)
    cdp(port, submit)
    time.sleep(7)

    ck = cookie_header(port)
    if not ck:
        print("没抓到 cookie")
        return 1
    info = me_of(ck)
    if not info.get("logged"):
        print("登录态无效:", info)
        return 1
    name = args.name or ("mail_%s" % addr.split("@")[0][:5])
    info["note"] = "邮箱注册·调度器"
    n = add_pool(name, ck, info)
    print("✅ 入池 %s | credit=%s | 池内 %d 个" % (name, info.get("credit"), n))
    state["last_success"] = int(time.time())
    state.setdefault("history", []).append({"ts": int(time.time()), "mode": "email", "name": name})
    save_state(state)
    return 0


def mode_google(args, state):
    port = random.randint(9300, 9399)
    profile = os.path.join(os.environ.get("TEMP", "."), "dzmm-g%d" % port)
    if not launch(port, profile, BASE + "/sign-in"):
        print("浏览器没起来")
        return 1
    time.sleep(4)
    cdp(port, "(()=>{const a=[...document.querySelectorAll('a,button')]"
              ".find(e=>/Google/.test(e.innerText||''));if(a){a.click();return 'clicked'}return 'no-google'})()")
    print(">>> 请在弹窗里完成 Google 登录（最多等 5 分钟）")
    t0 = time.time()
    while time.time() - t0 < 300:
        time.sleep(5)
        st, _ = cdp(port, "JSON.stringify({u:location.pathname})")
        if '"u":"/"' in st or "profile" in st:
            break
    ck = cookie_header(port)
    if not ck:
        print("没抓到 cookie")
        return 1
    info = me_of(ck)
    if not info.get("logged"):
        print("还没登录成功:", info)
        return 1
    name = args.name or "g01"
    info["note"] = "Google 号"
    n = add_pool(name, ck, info)
    print("✅ 入池 %s | credit=%s | 池内 %d 个" % (name, info.get("credit"), n))
    state["last_success"] = int(time.time())
    save_state(state)
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["email", "google"], default="email")
    ap.add_argument("--name", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--cooldown", type=int, default=3600)
    ap.add_argument("--mail-domain", default=os.environ.get("MAIL_DOMAIN", ""),
                    help="自有域名（catch-all 转发到 IMAP 邮箱），留空则用 Guerrilla")
    args = ap.parse_args()

    state = load_state()
    if args.status:
        now = int(time.time())
        for k, label in (("last_success", "上次成功"), ("last_429", "上次 429")):
            ts = state.get(k, 0)
            print("%s: %s" % (label, time.strftime("%H:%M:%S", time.localtime(ts)) if ts else "无"))
        left = max(0, args.cooldown - (now - state.get("last_success", 0)))
        print("冷却剩余: %d 分 %d 秒" % (left // 60, left % 60))
        print("历史:", state.get("history", [])[-5:])
        return 0

    left = args.cooldown - (int(time.time()) - state.get("last_success", 0))
    if left > 0 and not args.force:
        print("冷却中，还需 %d 分 %d 秒（--force 可跳过）" % (left // 60, left % 60))
        return 0

    node, code = pick_node(state)
    if not node:
        print("没有可用节点")
        return 1
    print("节点:", node, "| probe:", code)

    return mode_email(args, state) if args.mode == "email" else mode_google(args, state)


if __name__ == "__main__":
    sys.exit(main())
