# -*- coding: utf-8 -*-
"""渲染 payweld 收银页，列出可选档位/价格，并截图。

用法: python pw_probe.py <url>
"""
import asyncio
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"


async def main():
    url = sys.argv[1]
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1100, "height": 1400})
    page = await ctx.new_page()
    logs = []
    page.on("console", lambda m: logs.append("%s %s" % (m.type, m.text[:120])))
    await page.goto(url, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(9000)
    try:
        txt = await page.inner_text("body")
    except Exception as e:
        txt = "err %s" % e
    print("=== page text ===")
    print(txt[:2500])
    print("\n=== buttons ===")
    for b in await page.query_selector_all("button,[role=button]"):
        try:
            t = (await b.inner_text()).strip().replace("\n", " / ")
        except Exception:
            continue
        if t:
            print(" -", t[:80])
    await page.screenshot(path="pw_page.png", full_page=True)
    print("\nscreenshot -> pw_page.png")
    print("logs:", logs[-6:])
    await br.close()
    await pw.stop()


asyncio.run(main())
