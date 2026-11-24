import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}
OUT = []

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        async def on_resp(r):
            try:
                rt = r.request.resource_type
            except: rt = ""
            if rt in ("xhr","fetch") and "dzmm" in r.url:
                try:
                    body = (await r.body()).decode('utf-8','replace')[:2000]
                except: body = ""
                OUT.append({"m":r.request.method,"u":r.url[:200],"s":r.status,"b":body})
        page.on("response", on_resp)
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        try:
            await page.get_by_text("登录", exact=True).first.click(timeout=8000)
            await page.wait_for_timeout(3000)
            OUT.append({"m":"DIALOG","u":"buttons","s":0,"b":json.dumps(await page.evaluate("()=>Array.from(document.querySelectorAll('button,a')).map(e=>e.textContent.trim()).filter(t=>t&&t.length<25)"), ensure_ascii=False)})
        except Exception as e:
            OUT.append({"m":"ERR","u":"click login","s":0,"b":str(e)})
        for label in ["继续作为游客","游客登录","游客"]:
            try:
                el = page.get_by_text(label, exact=False).first
                if await el.count() > 0:
                    await el.click(timeout=5000)
                    OUT.append({"m":"CLICK","u":label,"s":0,"b":""})
                    break
            except: pass
        await page.wait_for_timeout(9000)
        OUT.append({"m":"URL","u":page.url,"s":0,"b":""})
        ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))o[k]=localStorage.getItem(k).slice(0,300);return o}")
        OUT.append({"m":"LS","u":"localStorage","s":0,"b":json.dumps(ls, ensure_ascii=False)})
        await browser.close()

asyncio.run(main())
with open("login_guest_out.json","w",encoding="utf-8") as f:
    json.dump(OUT, f, ensure_ascii=False, indent=1)
print("DONE, captured", len(OUT), "items -> login_guest_out.json")
