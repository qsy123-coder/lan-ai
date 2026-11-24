# -*- coding: utf-8 -*-
"""在 payweld 收银页填自定义金额，读取最终应付，验证最小金额。

用法: python pw_custom.py <url> [amount]
"""
import asyncio
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"


async def main():
    url = sys.argv[1]
    amount = sys.argv[2] if len(sys.argv) > 2 else "1"
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1100, "height": 1400})
    page = await ctx.new_page()
    await page.goto(url, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(8000)

    # 找金额输入框
    cand = []
    for inp in await page.query_selector_all("input"):
        t = (await inp.get_attribute("type")) or ""
        ph = (await inp.get_attribute("placeholder")) or ""
        cand.append((t, ph, inp))
    print("inputs:", [(t, p) for t, p, _ in cand])

    target = None
    for t, p, inp in cand:
        if t in ("number", "text", "tel") and ("金额" in p or not p):
            target = inp
            break
    if not target and cand:
        target = cand[-1][2]
    if not target:
        print("没找到金额输入框")
        await br.close()
        return

    await target.click()
    await target.fill("")
    await target.type(amount, delay=80)
    await page.wait_for_timeout(2500)

    print("\n=== 按钮 ===")
    for b in await page.query_selector_all("button,[role=button]"):
        try:
            t = (await b.inner_text()).strip().replace("\n", " / ")
        except Exception:
            continue
        if t:
            print(" -", t[:70])

    txt = await page.inner_text("body")
    import re
    m = re.findall(r"支付\s*¥\s*[0-9.]+", txt)
    print("\n支付按钮文本:", m)
    m2 = re.findall(r"到账[^\n]{0,20}", txt)
    print("到账提示:", m2[:4])
    await target.screenshot(path="pw_amount.png")
    await page.screenshot(path="pw_custom.png", full_page=True)
    print("screenshot -> pw_custom.png")
    await br.close()
    await pw.stop()


asyncio.run(main())
