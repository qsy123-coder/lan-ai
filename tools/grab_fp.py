import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        async def on_req(r):
            if 'anonymous-sign-in' in r.url or 'auth' in r.url:
                try: pd = r.post_data
                except: pd = None
                print(f"\n=== REQ {r.method} {r.url[:100]}")
                if pd: print("BODY:", pd[:1500])
        page.on("request", on_req)
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); break
        await page.wait_for_timeout(8000)
        await b.close()
asyncio.run(main())
