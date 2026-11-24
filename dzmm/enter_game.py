# -*- coding: utf-8 -*-
"""进入游戏卡并抓 AI 相关请求。

用法: python enter_game.py /character/3929962
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"


async def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "/character/3929962"
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
    hits = []

    async def on_req(req):
        u = req.url
        if "/api/" in u and any(k in u for k in ("chat", "gamefy", "completion", "ai/", "llm")):
            hits.append((req.method, u[:110], (req.post_data or "")[:150]))

    page.on("request", lambda r: asyncio.create_task(on_req(r)))
    await page.goto("https://www.dzmm.ai" + path, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(8000)

    labels = []
    for b in await page.query_selector_all("button,[role=button],a"):
        try:
            t = (await b.inner_text()).strip().replace("\n", " ")
        except Exception:
            continue
        if t and len(t) < 24:
            labels.append(t)
    print("=== 按钮 ===")
    print(sorted(set(labels))[:25])

    clicked = None
    for kw in ("开始游戏", "开始游玩", "进入游戏", "Play", "开始"):
        for b in await page.query_selector_all("button,[role=button],a"):
            try:
                t = (await b.inner_text()).strip()
            except Exception:
                continue
            if kw in t:
                try:
                    await b.click(timeout=3000)
                    clicked = t
                    await page.wait_for_timeout(9000)
                except Exception:
                    pass
                break
        if clicked:
            break
    print("clicked:", clicked)

    print("\n=== AI 相关请求 ===")
    for h in hits[-10:]:
        print(h)
    print("\n=== frames ===")
    for f in page.frames:
        print(" ", f.url[:120])
    try:
        txt = await page.inner_text("body")
        print("\n=== 页面文本(前 400) ===")
        print(txt[:400])
    except Exception:
        pass
    await br.close()
    await pw.stop()


asyncio.run(main())
