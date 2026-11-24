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
        # 注入 cookie
        cookies = []
        for c in dump["cookies"]:
            cookies.append({"name": c["n"], "value": c["v"], "domain": c["d"], "path": "/"})
        await ctx.add_cookies(cookies)
        # 注入 localStorage
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(2000)
        for k, v in dump["localStorage"].items():
            try:
                await page.evaluate("([k,v])=>{try{localStorage.setItem(k,v)}catch(e){}}", [k, v])
            except Exception:
                pass
        reqs = []
        async def on_req(r):
            if "/api/" in r.url and ("task" in r.url or "checkin" in r.url.lower() or "credit" in r.url or "sign" in r.url or "reward" in r.url):
                try:
                    reqs.append(("REQ", r.method, r.url[:160], (r.post_data or "")[:300]))
                except Exception:
                    pass
        async def on_resp(r):
            if "/api/" in r.url and ("task" in r.url or "checkin" in r.url.lower() or "credit" in r.url or "sign" in r.url or "reward" in r.url):
                try:
                    body = (await r.body()).decode("utf-8", "replace")[:600]
                except Exception:
                    body = ""
                reqs.append(("RESP", str(r.status), r.url[:160], body))
        page.on("request", on_req)
        page.on("response", on_resp)
        await page.goto("https://dzmm.ai/tasks", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(6000)
        print("URL:", page.url)
        # 页面文本
        txt = await page.evaluate("()=>document.body.innerText.slice(0,1500)")
        print("=== PAGE TEXT ===\n", txt)
        print("\n=== REQUESTS ===")
        for r in reqs:
            print(r[0], r[1], r[2])
            if r[3]:
                print("   ", r[3][:400])
        # 找签到按钮
        btns = await page.evaluate("()=>Array.from(document.querySelectorAll('button')).map(b=>b.innerText.trim()).filter(t=>t).slice(0,40)")
        print("\n=== BUTTONS ===", json.dumps(btns, ensure_ascii=False))
        await page.screenshot(path="tasks.png", full_page=True)
        await page.wait_for_timeout(1000)
        await b.close()

asyncio.run(main())
