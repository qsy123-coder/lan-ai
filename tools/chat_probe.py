import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.async_api import async_playwright
import os

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
            u = r.url
            if "/api/chat" in u or "/api/ai" in u or "completion" in u or "/api/trpc/chat" in u:
                try:
                    reqs.append(("REQ", r.method, u[:170], (r.post_data or "")[:600]))
                except Exception:
                    pass
        async def on_resp(r):
            u = r.url
            if "/api/chat" in u or "/api/ai" in u or "/api/trpc/chat" in u:
                try:
                    body = (await r.body()).decode("utf-8", "replace")[:400]
                except Exception:
                    body = ""
                reqs.append(("RESP", str(r.status), u[:170], body))
        page.on("request", on_req)
        page.on("response", on_resp)

        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(3000)
        me = await page.evaluate("fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        logged = '"isLoggedIn":true' in me
        print("已登录:", logged)
        # 余额前
        bal0 = await page.evaluate("fetch('/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("余额前:", bal0[:200])
        # 打开一张角色卡
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4000)
        # 点第一张卡
        try:
            card = page.locator("a[href*='/chat'], a[href*='/card']").first
            if await card.count() > 0:
                await card.click(timeout=8000)
                print("clicked card")
            else:
                # 用文本
                await page.get_by_text("靠近你", exact=False).first.click(timeout=6000)
                print("clicked card by text")
        except Exception as e:
            print("card click err:", e)
        await page.wait_for_timeout(5000)
        print("URL:", page.url)
        # 找输入框发消息
        try:
            ta = page.locator("textarea").first
            if await ta.count() > 0:
                await ta.fill("你好")
                await page.wait_for_timeout(500)
                await ta.press("Enter")
                print("sent message")
                await page.wait_for_timeout(12000)
        except Exception as e:
            print("send err:", e)
        print("\n=== 请求 ===")
        for r in reqs:
            print(r[0], r[1], r[2])
            if r[3]:
                print("   ", r[3][:400])
        bal1 = await page.evaluate("fetch('/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n余额后:", bal1[:250])
        await page.screenshot(path="chat_shot.png")
        await page.wait_for_timeout(1000)
        await b.close()

asyncio.run(main())
