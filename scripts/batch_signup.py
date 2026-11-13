# scripts/batch_signup.py —— A 路线批量开号：节点轮换 + IP 账本 + 拖拽提示 + IMAP 收码 + 入池
#
# 为什么是串行而不是并行：Clash 只有一个全局出口，多个浏览器同时开也走同一个 IP，
# 而瓶颈正是"每个 IP 只能注册 1~3 个"。所以正确做法是**按节点串行推进**，
# 每个节点榨干它的注册额度，冷却后再回来。
#
# 用法:
#   $env:IMAP_HOST="imap.gmail.com"; $env:IMAP_USER="qsy55882@gmail.com"; $env:IMAP_PASS="16位应用密码"
#   python scripts/batch_signup.py --target 100 --domain aetouban.cn
#   python scripts/batch_signup.py --target 29 --start 19 --mail-provider mailtm --domain fldubai.com
#   python scripts/batch_signup.py --status
#
# 每个号：挑节点 → 换出口 → 探活 → 新 profile → 填表提交 → 等你拖一次（脚本会把窗口置顶并放大提示）
#          → IMAP 收 8 位码 → 提交 → 抓 cookie → 入池 → 记 IP 账本
import argparse
import io
import json
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import new_account as na  # noqa: E402  复用 launch / cdp / cookie_header / me_of / add_pool / imap_code_for
import signup_email as se  # noqa: E402  复用 mail.tm 建箱与收码（无 IMAP 场景）

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(ROOT, "out", "ip_ledger.json")
STATE = os.path.join(ROOT, "out", "batch_state.json")

NODES = [
    "🇯🇵 日本Anytls 03", "🇯🇵 日本-hy2 02", "🇭🇰 香港Anytls 01", "🇭🇰 香港Anytls 04",
    "🇭🇰 香港Anytls 05", "🇨🇳 台湾Hinet-03", "🇨🇭 瑞士 01", "🇸🇬 新加坡Anytls 01",
    "🇯🇵 日本Anytls 02", "🇯🇵 日本Anytls 04", "🇯🇵 日本Anytls 05", "🇯🇵 日本anytls 07",
    "🇰🇷 韩国 01", "🇰🇷 韩国 02", "🇺🇸 美国Anytls 02", "🇺🇸 美国Anytls 03",
    "🇺🇸 美国Anytls 04", "🇺🇸 美国Anytls 05", "🇩🇪 德国 01", "🇩🇪 德国 02",
    "🇫🇷 法国 01", "🇫🇷 法国 02", "🇬🇧 英国 Anytls 02", "🇹🇷 土耳其 Anytls",
    "🇨🇭 瑞士 02", "🇨🇳 台湾Hinet-02",
]
COOLDOWN_H = 3.0          # 一个节点打过 429 后冷却多少小时
MAX_PER_IP = 4            # 单个 IP 最多尝试几次（含失败）


def probe():
    try:
        r = na.creq.get(na.BASE + "/api/trpc/nope.nothing?batch=1&input=%7B%7D", impersonate="chrome",
                        proxies={"https": na.PROXY}, timeout=15)
        return r.status_code
    except Exception:
        return 0


def load(path, default):
    if os.path.exists(path):
        return json.load(io.open(path, encoding="utf-8"))
    return default


def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, "w", encoding="utf-8", newline="\n").write(json.dumps(obj, ensure_ascii=False, indent=1))


def node_score(node, ledger):
    rec = ledger.get(node, {})
    used = rec.get("uses", 0)
    if used >= MAX_PER_IP:
        return None
    last429 = rec.get("last_429", 0)
    if last429 and time.time() - last429 < COOLDOWN_H * 3600:
        return None
    if rec.get("skip_until", 0) > time.time():
        return None
    return used


def pick_node(ledger):
    cands = [(node_score(n, ledger), n) for n in NODES]
    cands = [(s, n) for s, n in cands if s is not None]
    if not cands:
        return None
    cands.sort()
    return cands[0][1]


def switch_node(node):
    out = na.clash("-Set", node)
    return out


def one_account(node, domain, idx, addr="", provider="imap"):
    mail_token = None
    if provider == "mailtm":
        if not addr:
            addr = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=12)) + "@" + domain
        mt_pwd = "Dz" + "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", k=10)) + "!9"
        mail_token = se.mk_mailbox(addr, mt_pwd)
        if not mail_token:
            print("  mail.tm 建箱失败（限流或域名失效）")
            return "mailbox_fail"
    if not addr:
        addr = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=10)) + "@" + domain
    pwd = "Dz" + "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", k=10)) + "!9"
    print("\n[%03d] 节点=%s 邮箱=%s" % (idx, node, addr))

    port = random.randint(9400, 9599)
    profile = os.path.join(os.environ.get("TEMP", "."), "dzmm-b%d" % port)
    if not na.launch(port, profile, na.BASE + "/sign-in?s=signup"):
        return "launch_fail"
    time.sleep(3)

    # 分步执行：每步都是短 evaluate，避免页面跳转把连接打断
    time.sleep(2)
    # /sign-in?s=signup 直接就是注册表单，不需要点"创建账号"（点了反而切回登录）
    na.cdp(port, "(()=>{const b=[...document.querySelectorAll('button')].find(e=>/接受全部|Accept all|接受/.test((e.innerText||'').trim()));if(b)b.click();return 'cookie-ok'})()")
    time.sleep(2)
    # 等表单 hydration（最多 25 秒）
    ready = False
    for _ in range(25):
        chk, _e = na.cdp(port, "document.querySelector('input[type=email]')?'ready':'no'")
        if "ready" in chk:
            ready = True
            break
        time.sleep(1)
    if not ready:
        page, _ = na.cdp(port, "JSON.stringify({u:location.href,c:!!document.querySelector('iframe')})")
        if "__captcha" in page or '"c":true' in page:
            print("  ⚠️ 该节点被闸门拦住 —— 请在弹出的窗口里拖一次验证码（最多等 180 秒）")
            na.cdp(port, "(()=>{window.focus();return 1})()")
            t1 = time.time()
            while time.time() - t1 < 180:
                time.sleep(5)
                st, _ = na.cdp(port, "JSON.stringify({u:location.href,c:!!document.querySelector('iframe')})")
                if "__captcha" not in st and '"c":true' not in st:
                    break
            na.cdp(port, "(async()=>{location.href='/sign-in?s=signup';return 1})()")
            time.sleep(6)
            for _ in range(15):
                chk, _e = na.cdp(port, "document.querySelector('input[type=email]')?'ready':'no'")
                if "ready" in chk:
                    ready = True
                    break
                time.sleep(1)
        if not ready:
            return "no_form"
    step2 = ("(()=>{const set=(e,v)=>{const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),'value');"
             "d.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));"
             "e.dispatchEvent(new Event('change',{bubbles:true}))};"
             "const em=document.querySelector('input[type=email]');const pw=document.querySelector('input[type=password]');"
             "if(!em||!pw)return 'no-input';set(em,'%s');set(pw,'%s');"
             "const cb=document.querySelector('input[type=checkbox]');if(cb&&!cb.checked)cb.click();"
             "return JSON.stringify({email:em.value,pwdlen:pw.value.length})})()" % (addr, pwd))
    out2, _ = na.cdp(port, step2)
    print("  填表:", out2[:120])
    if "no-input" in out2 or out2.strip() in ("", '""'):
        return "form_fail"
    time.sleep(1)
    out, err = na.cdp(port, "(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^注册$/.test((x.innerText||'').trim()));if(!b)return 'no-reg';b.click();return 'clicked'})()")
    print("  提交:", (out or err)[:200])
    if "no-reg" in out or not out:
        return "form_fail"

    # 置顶窗口，方便你拖
    na.cdp(port, "(()=>{window.focus();return 'ok'})()")

    status = "timeout"
    t0 = time.time()
    gate_seen = False
    while time.time() - t0 < 300:
        time.sleep(2)
        st, _ = na.cdp(port, "JSON.stringify({u:location.search,"
                             "ifr:[...document.querySelectorAll('iframe')].map(f=>f.src||''),"
                             "t:(document.body.innerText||'').slice(0,240)})")
        if "s=otp" in st:
            status = "otp"
            break
        if "REGISTER_RISK" in st:
            return "risk_429"
        if "__captcha" in st:
            if not gate_seen:
                gate_seen = True
                print("  ⚠️ 人机校验弹窗已出现 —— 请在窗口里拖一次（最多等 300 秒）")
                na.cdp(port, "(()=>{window.focus();return 1})()")
            continue
        if "暂不支持注册" in st:
            return "domain_reject"
        if "暂时无法完成注册" in st:
            print("  ✗ 服务端判定当前出口环境不可注册（captchaError）")
            return "gate_failed"
    if status != "otp":
        return "timeout"

    print("  ✅ 验证码已发，等邮件…")
    code = se.wait_code(mail_token, 180) if provider == "mailtm" else na.imap_code_for(addr, 180)
    if not code:
        return "no_code"
    print("  码:", code)
    submit = ("(async()=>{const inp=[...document.querySelectorAll('input')].find(i=>i.maxLength===8)"
              "||document.querySelector('input');if(!inp)return 'no-input';"
              "const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');"
              "d.set.call(inp,'%s');inp.dispatchEvent(new Event('input',{bubbles:true}));"
              "await new Promise(r=>setTimeout(r,600));"
              "const b=[...document.querySelectorAll('button')].find(x=>/验证/.test((x.innerText||'').trim()));"
              "if(!b)return 'no-btn';b.click();return 'ok'})()" % code)
    na.cdp(port, submit)
    time.sleep(7)

    ck = na.cookie_header(port)
    if not ck:
        return "no_cookie"
    info = na.me_of(ck)
    if not info.get("logged"):
        return "not_logged"
    name = "b%03d" % idx
    info["note"] = "批量·%s" % node
    na.add_pool(name, ck, info)
    print("  🎉 %s 入池 | credit=%s" % (name, info.get("credit")))
    return "ok"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", type=int, default=100)
    ap.add_argument("--alias-pool", default="", help="out/aliases.json，从别名池取地址")
    ap.add_argument("--domain", default=os.environ.get("MAIL_DOMAIN", "aetouban.cn"),
                    help="可逗号分隔多个域名，每个号随机选一个")
    ap.add_argument("--mail-provider", choices=["imap", "mailtm"], default="imap",
                    help="imap=自有域名 catch-all 转发；mailtm=api.mail.tm 临时邮箱（不需要 IMAP 口令）")
    ap.add_argument("--start", type=int, default=-1,
                    help="从第几号继续编号（已有 b001-b019 时传 19，避免覆盖）")
    ap.add_argument("--status", action="store_true")
    args = ap.parse_args()

    ledger = load(LEDGER, {})
    state = load(STATE, {"done": 0, "started": int(time.time())})
    if args.start >= 0:
        state["done"] = args.start

    if args.status:
        print("已完成:", state.get("done", 0), "| 目标:", args.target)
        for n in NODES:
            r = ledger.get(n, {})
            if r:
                print("  %-22s uses=%s last429=%s" % (n, r.get("uses", 0),
                      time.strftime("%m-%d %H:%M", time.localtime(r["last_429"])) if r.get("last_429") else "-"))
        return 0

    if args.mail_provider == "imap" and not (na.IMAP_USER and na.IMAP_PASS):
        print("缺 IMAP 凭据：写 out/imap.json {\"host\":\"imap.gmail.com\",\"user\":\"...\",\"pass\":\"应用密码\"}，")
        print("或设 IMAP_USER / IMAP_PASS 环境变量；不想用 IMAP 就加 --mail-provider mailtm")
        return 2

    idx = state.get("done", 0)
    while idx < args.target:
        node = pick_node(ledger)
        if not node:
            print("\n所有节点都在冷却（每个 IP 上限 %d 次，冷却 %.1fh）" % (MAX_PER_IP, COOLDOWN_H))
            print("等 %.1f 小时后再跑，或加新节点" % COOLDOWN_H)
            return 0
        switch_node(node)
        time.sleep(3)
        code = probe()
        print("\n=== 节点 %s (probe=%s) ===" % (node, code))
        if code not in (404, 401, 418):
            ledger.setdefault(node, {})["uses"] = MAX_PER_IP
            save(LEDGER, ledger)
            continue

        idx += 1
        doms = [d.strip() for d in args.domain.split(",") if d.strip()]
        addr_from_pool = ""
        if args.alias_pool and args.mail_provider == "imap":
            import io as _io
            pool = json.load(_io.open(args.alias_pool, encoding="utf-8"))
            free = [a for a in pool if not a.get("used")]
            if not free:
                print("别名池已空，先跑 scripts/alias_pool.py 建新别名")
                return 0
            pick = free[0]
            addr_from_pool = pick["email"]
            pick["used"] = False
            pick["reserved_at"] = int(time.time())
            json.dump(pool, _io.open(args.alias_pool, "w", encoding="utf-8", newline="\n"),
                      ensure_ascii=False, indent=1)
            print("取别名:", addr_from_pool)
        res = one_account(node, random.choice(doms), idx, addr=addr_from_pool,
                          provider=args.mail_provider)
        rec = ledger.setdefault(node, {"uses": 0})
        # 只有真正提交到服务端（或触发风控）才消耗该 IP 的注册额度
        if res in ("otp", "risk_429", "domain_reject", "no_code", "not_logged",
                   "no_cookie", "ok", "gate_failed"):
            rec["uses"] = rec.get("uses", 0) + 1
        rec["last"] = int(time.time())
        if res == "risk_429":
            rec["last_429"] = int(time.time())
        if res in ("timeout", "gate_failed"):
            rec["skip_until"] = int(time.time()) + 1800
        # 建号成功才真正消耗别名；失败退回池子
        if addr_from_pool and res == "ok":
            import io as _io
            pool = json.load(_io.open(args.alias_pool, encoding="utf-8"))
            for a in pool:
                if a.get("email") == addr_from_pool:
                    a["used"] = True
                    a["used_at"] = int(time.time())
            json.dump(pool, _io.open(args.alias_pool, "w", encoding="utf-8", newline="\n"),
                      ensure_ascii=False, indent=1)
        if res == "domain_reject":
            print("!! 域名被拒，换域名再试")
            save(LEDGER, ledger)
            return 3
        save(LEDGER, ledger)
        if res == "ok":
            state["done"] = idx
            save(STATE, state)
        else:
            print("   失败:", res)
    print("\n完成 %d 个" % state.get("done", 0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
