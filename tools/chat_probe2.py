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
        await ctx.add_cookies([{"name": c["n"], "value": c["v"], "domain": c["d"], "path": "/"} for c in dump["cookies"]])
        page = await ctx.new_page()
        reqs = []
        async def on_req(r):
            u = r.url
            if "/api/chat" in u or "/api/ai/" in u or "stream" in u:
                try:
                    reqs.append(("REQ", r.method, u[:170], (r.post_data or "")[:800]))
                except Exception:
                    pass
        async def on_resp(r):
            u = r.url
            if "/api/chat" in u or "/api/ai/" in u:
                try:
                    body = (await r.body()).decode("utf-8", "replace")[:300]
                except Exception:
                    body = ""
                reqs.append(("RESP", str(r.status), u[:170], body))
        page.on("request", on_req)
        page.on("response", on_resp)
        await page.goto("https://dzmm.ai/character/3906371", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(6000)
        print("URL:", page.url)
        btns = await page.evaluate("()=>Array.from(document.querySelectorAll('button,a')).map(b=>b.innerText.trim()).filter(t=>t&&t.length<20).slice(0,30)")
        print("按钮:", json.dumps(btns, ensure_ascii=False))
        # 点开始聊天
        for label in ["开始聊天", "开始对话", "聊天", "开始"]:
            try:
                el = page.get_by_text(label, exact=False).first
                if await el.count() > 0:
                    await el.click(timeout=6000)
                    print("clicked", label)
                    break
            except Exception:
                pass
        await page.wait_for_timeout(8000)
        print("URL2:", page.url)
        # 发消息
        try:
            ta = page.locator("textarea").first
            if await ta.count() > 0:
                await ta.click()
                await ta.fill("你好，测试一下")
                await page.wait_for_timeout(600)
                await ta.press("Enter")
                print("sent")
                await page.wait_for_timeout(15000)
            else:
                print("no textarea")
        except Exception as e:
            print("send err:", e)
        print("\n=== 请求 ===")
        for r in reqs:
            print(r[0], r[1], r[2])
            if r[3]:
                print("   ", r[3][:500])
        bal = await page.evaluate("fetch('/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n余额:", bal[:250])
        await page.screenshot(path="chat2.png", full_page=False)
        await page.wait_for_timeout(1000)
        await b.close()

asyncio.run(main())
