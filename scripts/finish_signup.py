# scripts/finish_signup.py —— 拖完验证码之后的一步到位：收信 → 填 OTP → 抓 cookie → 入池
#
# 用法:
#   python scripts/finish_signup.py --mail out/mail2.json --port 9223 --name mail02
#
# 前提: 浏览器里已经点了「注册」并通过拖拽验证（页面停在 "验证你的邮箱"），
#       且已经用 mail.tm 建好邮箱（out/mail2.json 里有 address/token）。
import argparse
import io
import json
import os
import re
import subprocess
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
MAIL = "https://api.mail.tm"
NODE = os.environ.get("NODE_BIN", r"C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe")
CDP = os.path.join(ROOT, "scripts", "cdp.mjs")
POOL = os.path.join(ROOT, "accounts.json")


def cdp(port, expr, wait=0, timeout=90):
    args = [NODE, CDP, "--port", str(port)]
    if wait:
        args += ["--wait", str(wait)]
    args.append(expr)
    p = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", timeout=timeout)
    return (p.stdout or "").strip(), (p.stderr or "").strip()


def wait_code(token, timeout=180):
    h = {"accept": "application/json", "authorization": "Bearer " + token}
    t0 = time.time()
    while time.time() - t0 < timeout:
        r = creq.get(MAIL + "/messages", headers=h, timeout=25)
        arr = r.json() if r.status_code == 200 else []
        if arr:
            mid = arr[0]["id"]
            full = creq.get(MAIL + "/messages/" + mid, headers=h, timeout=25).json()
            parts = []
            for k in ("text", "html"):
                v = full.get(k)
                parts.append(" ".join(v) if isinstance(v, list) else (v or ""))
            body = re.sub(r"<[^>]+>", " ", " ".join(parts))
            m = re.search(r"\b(\d{8})\b", body)
            if m:
                return m.group(1)
        time.sleep(5)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mail", required=True)
    ap.add_argument("--port", type=int, default=9223)
    ap.add_argument("--name", default="")
    ap.add_argument("--timeout", type=int, default=180)
    args = ap.parse_args()

    m = json.load(io.open(args.mail, encoding="utf-8"))
    token = m.get("token")
    if not token:
        print("mail 文件里没有 token")
        return 2

    print("等邮件…", m["address"])
    code = wait_code(token, args.timeout)
    if not code:
        print("没收到验证码")
        return 3
    print("验证码:", code)

    expr = ("(async()=>{const inp=[...document.querySelectorAll('input')].find(i=>i.maxLength===8)"
            "||document.querySelector('input');if(!inp)return 'no-input';"
            "const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');"
            "d.set.call(inp,'%s');inp.dispatchEvent(new Event('input',{bubbles:true}));"
            "await new Promise(r=>setTimeout(r,600));"
            "const b=[...document.querySelectorAll('button')].find(x=>/验证/.test((x.innerText||'').trim()));"
            "b.click();return 'submitted'})()" % code)
    out, err = cdp(args.port, expr)
    print("填码:", out or err[:120])
    time.sleep(6)

    expr2 = ("(async()=>{const r=await fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A"
             "%7B%22json%22%3Anull%7D%7D',{credentials:'include'});const t=await r.text();"
             "const j=JSON.parse(t)[0].result.data.json;return JSON.stringify({logged:j.isLoggedIn,"
             "uid:j.id,credit:j.credit})})()")
    out2, err2 = cdp(args.port, expr2)
    print("登录态:", out2 or err2[:120])

    # 抓 cookie（走 --cookies 模式）
    p = subprocess.run([NODE, CDP, "--port", str(args.port), "--cookies"],
                       capture_output=True, text=True, encoding="utf-8", timeout=90)
    line = next((l for l in (p.stdout or "").splitlines() if l.startswith("COOKIE_HEADER=")), "")
    if not line:
        print("没抓到 cookie:", (p.stderr or "")[:120])
        return 4
    ck = line[len("COOKIE_HEADER="):]

    name = args.name or ("mail_" + m["address"].split("@")[0][:6])
    pool = {}
    if os.path.exists(POOL):
        pool = json.load(io.open(POOL, encoding="utf-8"))
    info = {}
    try:
        info = json.loads(out2)
    except Exception:
        pass
    pool[name] = {"cookie": ck, "note": "邮箱注册·浏览器", "last": info}
    with io.open(POOL, "w", encoding="utf-8", newline="\n") as f:
        json.dump(pool, f, ensure_ascii=False, indent=1)
    print("入池:", name, "| credit:", info.get("credit"), "| 池内", len(pool), "个号")
    return 0


if __name__ == "__main__":
    sys.exit(main())
