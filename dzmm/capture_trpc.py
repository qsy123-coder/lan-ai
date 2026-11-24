# -*- coding: utf-8 -*-
"""打开指定页面，抓取它实际调用的 tRPC 过程名与响应（用于定位邀请/收益/兑换接口）。

用法: python capture_trpc.py /invitations/ [等待秒数]
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"


async def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "/invitations/"
    wait_s = int(sys.argv[2]) if len(sys.argv) > 2 else 12
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  proxy={"server": PROXY},
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1280, "height": 1000})
    for c in json.load(open("cookies.json", encoding="utf-8")):
        await ctx.add_cookies([{"name": c["name"], "value": c["value"],
                                "domain": c["domain"], "path": c.get("path", "/")}])
    page = await ctx.new_page()
    hits = []

    async def on_resp(resp):
        u = resp.url
        if "/api/trpc/" in u:
            name = u.split("/api/trpc/")[1].split("?")[0]
            body = ""
            try:
                body = (await resp.text())[:400]
            except Exception:
                pass
            hits.append((resp.status, name, body))

    page.on("response", lambda r: asyncio.create_task(on_resp(r)))
    print("goto", path)
    await page.goto("https://www.dzmm.ai" + path, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(wait_s * 1000)
    try:
        txt = await page.inner_text("body")
        print("\n=== 页面文本(前 1200) ===")
        print(txt[:1200])
    except Exception as e:
        print("text err", e)

    print("\n=== tRPC 调用 (%d) ===" % len(hits))
    seen = set()
    for st, name, body in hits:
        if (st, name) in seen:
            continue
        seen.add((st, name))
        print("%-4s %-46s %s" % (st, name, body.replace("\n", " ")[:220]))

    await br.close()
    await pw.stop()


asyncio.run(main())
