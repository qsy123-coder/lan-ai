# -*- coding: utf-8 -*-
"""打开首页/探索页，抓 tRPC 请求与响应，筛出 isGamefy=true 的游戏卡。

用法: python find_gamefy.py [/] [等待秒]
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"


async def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "/"
    wait_s = int(sys.argv[2]) if len(sys.argv) > 2 else 12
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
    trpc, games = [], []

    async def on_resp(resp):
        u = resp.url
        if "/api/trpc/" not in u:
            return
        name = u.split("/api/trpc/")[1].split("?")[0]
        trpc.append((name, u.split("input=")[-1][:700]))
        try:
            body = await resp.text()
        except Exception:
            return
        if '"isGamefy":true' in body:
            # 粗略抽出 id/name
            import re
            for m in re.finditer(r'"id":"?(\d+)"?[^{}]{0,200}?"isGamefy":true', body):
                games.append(m.group(1))
            for m in re.finditer(r'"isGamefy":true[^{}]{0,300}?"id":"?(\d+)"?', body):
                games.append(m.group(1))

    page.on("response", lambda r: asyncio.create_task(on_resp(r)))
    await page.goto("https://www.dzmm.ai" + path, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(wait_s * 1000)

    print("=== tRPC 调用 ===")
    seen = set()
    for n, q in trpc:
        if n in seen:
            continue
        seen.add(n)
        print("  %-40s %s" % (n, q[:600]))

    print("\n=== isGamefy 卡 id ===")
    print(sorted(set(games))[:20] or "(未发现)")

    await br.close()
    await pw.stop()


asyncio.run(main())
