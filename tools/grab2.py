import asyncio, json, sys, io
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}
OUT = []
async def main():
    async with async_playwright() as p:
        try:
            b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        except Exception as e:
            OUT.append({"e":"launch: "+str(e)}); 
            with open("grab2.json","w",encoding="utf-8") as f: json.dump(OUT,f,ensure_ascii=False,indent=1)
            return
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        async def on_req(r):
            try:
                if 'anonymous-sign-in' in r.url or 'sign-up' in r.url or '/auth/' in r.url:
                    pd = r.post_data
                    h = r.headers
                    OUT.append({"type":"REQ","m":r.method,"u":r.url[:120],"body":(pd or ""),"xmgw":h.get("x-mgw-auth","")[:120]})
            except Exception as e: OUT.append({"e":"onreq "+str(e)})
        async def on_resp(r):
            try:
                if 'anonymous-sign-in' in r.url or 'sign-up' in r.url or '/auth/' in r.url:
                    body = (await r.body()).decode('utf-8','replace')[:2000]
                    OUT.append({"type":"RESP","s":r.status,"u":r.url[:120],"body":body})
            except Exception as e: OUT.append({"e":"onresp "+str(e)})
        page.on("request", on_req); page.on("response", on_resp)
        try:
            await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(5000)
            await page.get_by_text("登录", exact=True).first.click(timeout=8000)
            await page.wait_for_timeout(2500)
            for label in ["以游客模式继续","游客登录","游客"]:
                el = page.get_by_text(label, exact=False).first
                if await el.count() > 0:
                    await el.click(timeout=5000); OUT.append({"type":"CLICK", "label":label}); break
            await page.wait_for_timeout(10000)
            # 等验证码出现，或登录成功
            frames = [f.url[:100] for f in page.frames]
            OUT.append({"type":"FRAMES","frames":frames})
            ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest|mgwan|fp/i.test(k))o[k]=localStorage.getItem(k).slice(0,300);return o}")
            OUT.append({"type":"LS","ls":ls})
        except Exception as e:
            OUT.append({"e":"flow: "+str(e)})
        await b.close()
    with open("grab2.json","w",encoding="utf-8") as f: json.dump(OUT,f,ensure_ascii=False,indent=1)
    print("DONE", len(OUT))
asyncio.run(main())
