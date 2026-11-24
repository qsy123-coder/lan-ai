import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.async_api import async_playwright

CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}

async def main():
    dump = json.load(open("session_dump.json", encoding="utf-8"))
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY,
                                    args=["--no-sandbox", "--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
                                  viewport={"width": 1280, "height": 900})
        await ctx.add_cookies([{"name": c["n"], "value": c["v"], "domain": c["d"], "path": "/"} for c in dump["cookies"]])
        page = await ctx.new_page()
        reqs = []
        async def on_req(r):
            if "/api/" in r.url and r.method in ("POST", "PUT", "PATCH"):
                try:
                    reqs.append(("REQ", r.method, r.url[:180], (r.post_data or "")[:400]))
                except Exception:
                    pass
        async def on_resp(r):
            if "/api/" in r.url and r.request.method in ("POST", "PUT", "PATCH"):
                try:
                    body = (await r.body()).decode("utf-8", "replace")[:800]
                except Exception:
                    body = ""
                reqs.append(("RESP", str(r.status), r.url[:180], body))
        page.on("request", on_req)
        page.on("response", on_resp)
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(2000)
        for k, v in dump["localStorage"].items():
            try:
                await page.evaluate("([k,v])=>{try{localStorage.setItem(k,v)}catch(e){}}", [k, v])
            except Exception:
                pass
        await page.goto("https://dzmm.ai/tasks", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        # 点击「去签到」
        try:
            el = page.get_by_text("去签到", exact=False).first
            if await el.count() > 0:
                await el.click(timeout=6000)
                print("clicked 去签到")
                await page.wait_for_timeout(4000)
                # 可能弹窗需要再点
                for t in ["签到", "确认", "领取"]:
                    e2 = page.get_by_role("button", name=t).first
                    if await e2.count() > 0:
                        try:
                            await e2.click(timeout=3000); print("clicked", t); await page.wait_for_timeout(3000)
                        except Exception:
                            pass
        except Exception as e:
            print("去签到 err:", e)
        # 点击所有「领取」按钮
        for i in range(6):
            try:
                btn = page.get_by_role("button", name="领取", exact=True)
                n = await btn.count()
                if n == 0: break
                await btn.first.click(timeout=4000)
                print("clicked 领取 #%d" % i)
                await page.wait_for_timeout(3000)
            except Exception as e:
                print("领取 err:", e); break
        # 点击「领取奖励」
        for i in range(4):
            try:
                btn = page.get_by_role("button", name="领取奖励", exact=False)
                n = await btn.count()
                if n == 0: break
                await btn.first.click(timeout=4000)
                print("clicked 领取奖励 #%d" % i)
                await page.wait_for_timeout(3000)
            except Exception:
                break
        await page.wait_for_timeout(3000)
        print("\n=== 所有 POST 请求 ===")
        for r in reqs:
            print(r[0], r[1], r[2])
            if r[3]:
                print("   ", r[3][:500])
        # 查当前余额
        bal = await page.evaluate("fetch('/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n=== 当前余额 ===\n", bal[:400])
        tasks = await page.evaluate("fetch('/api/trpc/tasks.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        try:
            td = json.loads(tasks)
            arr = td[0]["result"]["data"]["json"]["tasks"]
            print("\n=== 任务状态 ===")
            for t in arr:
                print("  %-22s reward=%-4s status=%-12s claimed=%s canClaim=%s progress=%s/%s" % (
                    t.get("key"), t.get("reward"), t.get("status"), t.get("claimed"), t.get("canClaim"), t.get("progress"), t.get("targetValue")))
        except Exception as e:
            print("tasks parse err", e, tasks[:400])
        await page.screenshot(path="tasks_after.png", full_page=True)
        await b.close()

asyncio.run(main())
