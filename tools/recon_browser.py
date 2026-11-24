import asyncio, json, sys
from playwright.async_api import async_playwright

CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME, headless=False, proxy=PROXY,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        reqs = []
        async def on_req(r):
            if r.resource_type in ("xhr","fetch","document"):
                try:
                    u = r.url
                    m = r.method
                    h = r.headers
                    auth = h.get("x-mgw-auth","")[:80] or h.get("authorization","")[:80]
                    reqs.append({"m":m,"u":u[:200],"auth":auth})
                except: pass
        page.on("request", on_req)
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(6000)
        print("=== TITLE ===", await page.title())
        print("=== URL ===", page.url)
        # dump 按钮/链接文本
        txt = await page.evaluate("()=>Array.from(document.querySelectorAll('a,button')).map(e=>e.textContent.trim()).filter(t=>t&&t.length<30).slice(0,80)")
        print("=== 可点击元素 ===", json.dumps(txt, ensure_ascii=False))
        # localStorage keys
        ls = await page.evaluate("()=>Object.keys(localStorage)")
        print("=== localStorage keys ===", ls)
        # 打印网络请求
        print("=== 网络请求(%d) ===" % len(reqs))
        for r in reqs:
            print(r["m"], r["u"], ("AUTH:"+r["auth"] if r["auth"] else ""))
        await browser.close()

asyncio.run(main())
