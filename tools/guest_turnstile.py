import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2500)
        # 点击游客
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); print("clicked", label); break
        # 等待并观察 turnstile / human check
        for i in range(6):
            await page.wait_for_timeout(4000)
            iframes = await page.evaluate("()=>Array.from(document.querySelectorAll('iframe')).map(f=>({src:f.src.slice(0,120),name:f.name,title:f.title}))")
            dialogs = await page.evaluate("()=>Array.from(document.querySelectorAll('[class*=turnstile],[class*=captcha],[class*=challenge],[class*=verify]')).map(e=>e.className)")
            ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest|user/i.test(k))o[k]=localStorage.getItem(k).slice(0,120);return o}")
            print(f"--- t={i*4}s iframes={json.dumps(iframes,ensure_ascii=False)} cap={json.dumps(dialogs,ensure_ascii=False)} ls={json.dumps(ls,ensure_ascii=False)}")
            await page.screenshot(path=f"shot_{i}.png")
        await browser.close()

asyncio.run(main())
