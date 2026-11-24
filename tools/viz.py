import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME,headless=False,proxy=PROXY,args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page=await ctx.new_page()
        await page.goto("https://dzmm.ai/",wait_until="domcontentloaded",timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录",exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el=page.get_by_text(label,exact=False).first
            if await el.count()>0: await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        frame=None
        for f in page.frames:
            if '__captcha' in f.url: frame=f
        if not frame: print("NO_CAPTCHA"); return
        img_src=await (await frame.query_selector('img')).get_attribute('src')
        ib=await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        open('latest.png','wb').write(bytes(ib))
        stage=await frame.query_selector('#dragStage')
        print("start:", await stage.get_attribute('data-start-x'), await stage.get_attribute('data-start-y'))
        # 也把 captcha 页 HTML 存下来
        html=await frame.evaluate("()=>document.documentElement.outerHTML")
        open('latest_captcha.html','w',encoding='utf-8').write(html)
        print("saved latest.png / latest_captcha.html")
        await b.close()
asyncio.run(main())
