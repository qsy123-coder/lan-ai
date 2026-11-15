# scripts/domain_probe.py —— 在已过闸门的浏览器里逐个域名探「是否被站点拒绝」
#
# 判定（直接读页面文案）：
#   暂不支持注册        → blocked（域名黑名单）
#   s=otp               → accepted（真实受理，继续走收码）
#   暂时无法完成注册     → generic_fail（多半是闸门过期/环境风控）
#   __captcha           → gate_required（闸门失效，需要人工再拖）
#
# 用法:
#   python scripts/domain_probe.py --port 9562 --domains a.com b.com c.com
import argparse
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import new_account as na  # noqa: E402


def js(port, expr):
    out, _ = na.cdp(port, expr)
    return out or ""


def wait_form(port, timeout=25):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if "ready" in js(port, "document.querySelector('input[type=email]')?'ready':'no'"):
            return True
        time.sleep(1)
    return False


FILL = ("(()=>{const set=(e,v)=>{const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),'value');"
        "d.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));"
        "e.dispatchEvent(new Event('change',{bubbles:true}))};"
        "const em=document.querySelector('input[type=email]');const pw=document.querySelector('input[type=password]');"
        "if(!em||!pw)return 'no-input';set(em,'%s');set(pw,'DzProbe12345!9');"
        "const cb=document.querySelector('input[type=checkbox]');if(cb&&!cb.checked)cb.click();"
        "return 'filled'})()")

SUBMIT = ("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^注册$/.test((x.innerText||'').trim()));"
          "if(!b)return 'no-reg';b.click();return 'clicked'})()")

STATE = ("JSON.stringify({u:location.search,t:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,300),"
         "ifr:[...document.querySelectorAll('iframe')].map(f=>f.src||'')})")


def probe(port, domain):
    js(port, "(async()=>{location.href='%s/sign-in?s=signup';return 'nav'})()" % na.BASE)
    time.sleep(3)
    if not wait_form(port):
        return "no_form", ""
    addr = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=14)) + "@" + domain
    js(port, FILL % addr)
    time.sleep(0.6)
    js(port, SUBMIT)
    t0 = time.time()
    while time.time() - t0 < 9:
        time.sleep(1.2)
        st = js(port, STATE)
        if "暂不支持注册" in st:
            return "blocked", st
        if "s=otp" in st:
            return "accepted", st
        if "__captcha" in st:
            return "gate_required", st
        if "暂时无法完成注册" in st:
            return "generic_fail", st
    return "timeout", st


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, required=True)
    ap.add_argument("--domains", nargs="+", required=True)
    ap.add_argument("--gap", type=float, default=2.0)
    args = ap.parse_args()
    rows = []
    for d in args.domains:
        verdict, st = probe(args.port, d)
        rows.append((d, verdict))
        print("%-22s %s" % (d, verdict))
        if verdict == "gate_required":
            print("  !! 闸门失效，停止本轮（需要人工再拖一次）")
            break
        time.sleep(args.gap)
    print("\n汇总:", rows)
    return 0


if __name__ == "__main__":
    sys.exit(main())
