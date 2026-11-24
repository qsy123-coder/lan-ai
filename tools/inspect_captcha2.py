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
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        # 找 captcha frame
        target = None
        for f in page.frames:
            if '__captcha' in f.url:
                target = f
        if not target:
            print("未找到 captcha frame"); await browser.close(); return
        print("frame url:", target.url)
        info = await target.evaluate("""() => {
            const out = {datasets:[], images:[], vars:[]};
            document.querySelectorAll('[data-]').forEach(e=>{
                const d={tag:e.tagName,id:e.id};
                for(const a of e.attributes) if(a.name.startsWith('data-')) d[a.name]=a.value;
                out.datasets.push(d);
            });
            document.querySelectorAll('img').forEach(e=>out.images.push({src:e.src, alt:e.alt}));
            document.querySelectorAll('input,form').forEach(e=>out.vars.push({tag:e.tagName,id:e.id,name:e.name,value:(e.value||'').slice(0,80),action:e.action||''}));
            for(const k of ['__captcha','captchaData','target','challenge']) if(window[k]) out.vars.push({global:k, val:JSON.stringify(window[k]).slice(0,200)});
            return out;
        }""")
        print(json.dumps(info, ensure_ascii=False, indent=1))
        await browser.close()
asyncio.run(main())
