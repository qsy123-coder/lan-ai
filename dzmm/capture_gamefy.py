# -*- coding: utf-8 -*-
"""打开游戏卡页面，抓所有 /api/ 请求（找游戏内 AI 调用端点）。

用法: python capture_gamefy.py /character/3930328 [等待秒]
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"


async def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "/character/3930328"
    wait_s = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  proxy={"server": PROXY},
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1280, "height": 1000})
    try:
        for c in json.load(open("cookies.json", encoding="utf-8")):
            await ctx.add_cookies([{"name": c["name"], "value": c["value"],
                                    "domain": c["domain"], "path": c.get("path", "/")}])
    except Exception:
        pass
    page = await ctx.new_page()
    reqs = []

    async def on_req(req):
        u = req.url
        if "/api/" in u and "trpc" not in u:
            reqs.append((req.method, u, (req.post_data or "")[:200]))

    page.on("request", lambda r: asyncio.create_task(on_req(r)))
    print("goto", path)
    await page.goto("https://www.dzmm.ai" + path, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(wait_s * 1000)
    try:
        txt = await page.inner_text("body")
        print("\n=== 页面文本(前 600) ===")
        print(txt[:600])
    except Exception as e:
        print("text err", e)
    print("\n=== 非 tRPC 的 /api 请求 ===")
    seen = set()
    for m, u, b in reqs:
        k = (m, u.split("?")[0])
        if k in seen:
            continue
        seen.add(k)
        print("%-5s %-70s %s" % (m, u[:70], b[:80]))
    print("\n=== frames ===")
    for f in page.frames:
        print(" ", f.url[:120])
    await br.close()
    await pw.stop()


asyncio.run(main())
