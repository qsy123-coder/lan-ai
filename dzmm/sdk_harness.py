# -*- coding: utf-8 -*-
"""mgwan SDK 真实流程捕获器。

在 dzmm 页面里加载官方 /mgwan-sdk/sdk.js，用站点自己的配置 setup()，
观察 iframe 发出的每个请求（含 h5_pay 的完整参数），据此确定最小可用付费请求。

用法: python sdk_harness.py [stage]
  stage=1 (默认) 只做 setup + 登录界面探测 + 请求转储
  stage=2 额外尝试用 mgw 账号登录
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"
CFG = {
    "gameid": "253", "gamename": "電子魅魔(H5)",
    "gameappid": "849480A6CD9C31F47", "accesskey": "ebL8oZNst4WKewa",
    "gameurl": "https://sdk.ghjwq.com", "device_name": "H5",
}

LOG = []


async def main():
    stage = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  proxy={"server": PROXY},
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1280, "height": 900})
    try:
        for c in json.load(open("cookies.json", encoding="utf-8")):
            await ctx.add_cookies([{"name": c["name"], "value": c["value"],
                                    "domain": c["domain"], "path": c.get("path", "/")}])
    except Exception as e:
        print("cookie inject:", e)

    page = await ctx.new_page()
    page.on("console", lambda m: LOG.append("console:%s %s" % (m.type, m.text[:160])))

    async def on_req(req):
        if "ghjwq" in req.url or "mgwan-sdk" in req.url:
            body = ""
            try:
                body = req.post_data or ""
            except Exception:
                pass
            LOG.append("REQ %s %s\n     body=%s" % (req.method, req.url[:110], body[:600]))

    async def on_resp(resp):
        if "ghjwq" in resp.url:
            try:
                t = await resp.text()
            except Exception:
                t = "<n/a>"
            LOG.append("RESP %d %s\n     %s" % (resp.status, resp.url[:110], t[:400]))

    page.on("request", lambda r: asyncio.create_task(on_req(r)))
    page.on("response", lambda r: asyncio.create_task(on_resp(r)))

    print("goto dzmm ...")
    await page.goto("https://www.dzmm.ai/", wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(6000)

    print("inject sdk.js ...")
    ok = await page.evaluate("""async (cfg) => {
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = '/mgwan-sdk/sdk.js?v=' + Date.now();
            s.onload = res; s.onerror = () => rej(new Error('load fail'));
            document.head.appendChild(s);
        });
        if (!window.H5SDK) return 'no H5SDK';
        window.__sdk = new window.H5SDK();
        window.__sdk.setup(cfg, {
          login_succ: (d) => console.log('[harness] login_succ', JSON.stringify(d).slice(0,300)),
          login_fail: (d) => console.log('[harness] login_fail', JSON.stringify(d).slice(0,300)),
          pay_succ: (d) => console.log('[harness] pay_succ', JSON.stringify(d).slice(0,300)),
          pay_fail: (d) => console.log('[harness] pay_fail', JSON.stringify(d).slice(0,300)),
        });
        return 'setup ok';
    }""", CFG)
    print("setup ->", ok)
    await page.wait_for_timeout(8000)

    frames = page.frames
    print("frames:", [f.url[:100] for f in frames])
    for f in frames:
        if "mgwan-sdk" in f.url:
            try:
                txt = await f.inner_text("body")
                print("iframe text:", repr(txt[:400]))
                inputs = await f.query_selector_all("input")
                print("inputs:", len(inputs))
                for i, inp in enumerate(inputs[:6]):
                    print("  input[%d] type=%s name=%s placeholder=%s" % (
                        i, await inp.get_attribute("type"), await inp.get_attribute("name"),
                        await inp.get_attribute("placeholder")))
                btns = await f.query_selector_all("button")
                print("buttons:", [await b.inner_text() for b in btns[:8]])
            except Exception as e:
                print("iframe probe err", e)

    if stage >= 2:
        mgw = json.load(open("mgw_acct.json", encoding="utf-8"))

        async def post_to_iframe(msg):
            return await page.evaluate("""(m) => {
                const f = document.getElementById('h5sdk_iframe');
                const diag = {
                    hasIframe: !!f,
                    hasSdk: !!window.__sdk,
                    src: f ? f.src.slice(0, 60) : null,
                    title: document.title,
                };
                try {
                    if (window.__sdk && window.__sdk._call) {
                        window.__sdk._call(m);
                        diag.via = 'sdk._call';
                    } else if (f && f.contentWindow) {
                        f.contentWindow.postMessage(JSON.stringify(m), window.location.origin);
                        diag.via = 'raw';
                    }
                } catch (e) { diag.err = String(e); }
                return JSON.stringify(diag);
            }""", msg)

        fr = None
        for f in page.frames:
            if "mgwan-sdk" in f.url:
                fr = f
        # 1) 打开登录
        print("post login ->", await post_to_iframe({"type": "login", "data": {}}))
        await page.wait_for_timeout(4000)
        print("iframe text:", repr((await fr.inner_text("body"))[:300]))
        ins = await fr.query_selector_all("input")
        print("inputs:", [(await i.get_attribute("type"), await i.get_attribute("placeholder")) for i in ins])
        if len(ins) >= 2:
            await ins[0].fill(mgw["account"])
            await ins[1].fill(mgw["password"])
            clicked = False
            for b in await fr.query_selector_all("button, div[role=button], .btn, span"):
                try:
                    t = (await b.inner_text()).strip()
                except Exception:
                    continue
                if t in ("登录", "登入", "立即登录") or (t and "登录" in t and len(t) < 8):
                    await b.click()
                    print("clicked:", t)
                    clicked = True
                    break
            if not clicked:
                try:
                    await fr.press("input[type=password]", "Enter")
                    print("pressed Enter")
                except Exception as e:
                    print("enter err", e)
            await page.wait_for_timeout(6000)
            print("after login text:", repr((await fr.inner_text("body"))[:400]))

        # 2) 发起支付（看 h5_pay 参数）
        oid = sys.argv[2] if len(sys.argv) > 2 else "d28bb87c-124c-4468-8b7e-46bd6127903e"
        price = float(sys.argv[3]) if len(sys.argv) > 3 else 30
        print("post pay ->", await post_to_iframe({
            "type": "pay",
            "data": {"title": "充值", "body": "充值%d元" % int(price),
                     "price": price, "order_sn": oid}}))
        await page.wait_for_timeout(6000)
        print("pay view text:", repr((await fr.inner_text("body"))[:400]))

        # 3) 选支付宝并提交
        async def click_by_text(txts):
            for sel in ["div", "span", "button", "li"]:
                for el in await fr.query_selector_all(sel):
                    try:
                        t = (await el.inner_text()).strip()
                    except Exception:
                        continue
                    if t and t in txts:
                        try:
                            await el.click(timeout=3000)
                            return t
                        except Exception:
                            continue
            return None

        payway = sys.argv[4] if len(sys.argv) > 4 else "支付宝"
        got = await click_by_text({payway, "支付宝", "支付寶", "AliPay"} if payway == "支付宝" else {payway})
        print("clicked payway:", got)
        await page.wait_for_timeout(1500)
        for t in ["立即支付", "确认支付", "支付", "立即充值", "确认"]:
            got2 = await click_by_text({t})
            if got2:
                print("clicked submit:", got2)
                break
        await page.wait_for_timeout(8000)
        print("final text:", repr((await fr.inner_text("body"))[:400]))

    print("\n===== network log =====")
    for l in LOG:
        print(l[:900])

    await br.close()
    await pw.stop()


asyncio.run(main())
