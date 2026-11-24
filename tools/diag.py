import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        print("1. 首页URL:", page.url)
        try:
            await page.get_by_text("登录", exact=True).first.click(timeout=8000)
            print("2. 点击登录成功")
        except Exception as e:
            print("2. 登录点击失败:", e)
        await page.wait_for_timeout(3000)
        btns = await page.evaluate("()=>Array.from(document.querySelectorAll('button,a')).map(e=>e.textContent.trim()).filter(t=>t&&t.length<30)")
        print("3. dialog按钮:", json.dumps(btns, ensure_ascii=False))
        # 尝试点游客
        clicked = False
        for label in ["以游客模式继续","游客登录","游客","继续"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); clicked=True; print("4. 点击:", label); break
        if not clicked: print("4. 未找到游客按钮")
        await page.wait_for_timeout(6000)
        frames = [f.url[:80] for f in page.frames]
        print("5. frames:", json.dumps(frames, ensure_ascii=False))
        print("6. URL:", page.url)
        # 抓 anonymous-sign-in 响应
        await browser.close()
asyncio.run(main())
