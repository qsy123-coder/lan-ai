# -*- coding: utf-8 -*-
"""在 payweld 收银页自动选 ¥10 套餐 + 支付宝通道并进入付款，抓二维码。

用法: python pw_pay.py [amount] [channel]
  amount  默认 10
  channel 默认 "支付宝 通道 1"
"""
import asyncio
import re
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"


async def click_text(page, text, exact=False):
    """按可见文本点击（先精确，再包含）"""
    for el in await page.query_selector_all("div,button,span,a,li"):
        try:
            t = (await el.inner_text()).strip()
        except Exception:
            continue
        ok = (t == text) if exact else (text in t)
        if ok and len(t) < 40:
            try:
                await el.click(timeout=2500)
                return t
            except Exception:
                continue
    return None


async def main():
    url = open("payweld_url.txt").read().strip()
    amount = sys.argv[1] if len(sys.argv) > 1 else "10"
    channel = sys.argv[2] if len(sys.argv) > 2 else "支付宝 通道 1"

    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1100, "height": 1500})
    page = await ctx.new_page()
    page.on("dialog", lambda d: asyncio.create_task(d.dismiss()))
    await page.goto(url, wait_until="domcontentloaded", timeout=90000)
    await page.wait_for_timeout(7000)

    # 1) 选金额：优先点套餐卡，没有就用自定义输入框
    clicked = await click_text(page, "¥" + amount, exact=False)
    print("选套餐:", clicked)
    if not clicked:
        for inp in await page.query_selector_all("input[type=number]"):
            await inp.fill(amount)
            print("自定义金额:", amount)
            break
    await page.wait_for_timeout(1200)

    # 2) 选支付通道
    got = await click_text(page, channel)
    print("选通道:", got)
    await page.wait_for_timeout(1200)

    # 3) 提交：优先点 button，文本形如 "支付 ¥10"
    submitted = None
    for b in await page.query_selector_all("button"):
        try:
            t = (await b.inner_text()).strip()
            dis = await b.get_attribute("disabled")
        except Exception:
            continue
        if re.match(r"^支付\s*¥", t) and not dis:
            await b.click(timeout=4000)
            submitted = t
            break
    if not submitted:
        for label in ["选择套餐和支付方式", "立即支付", "确认支付"]:
            r = await click_text(page, label)
            if r:
                submitted = r
                break
    print("提交:", submitted)
    await page.wait_for_timeout(11000)

    print("\n=== 页面文本 ===")
    try:
        print((await page.inner_text("body"))[:1200])
    except Exception:
        pass
    print("\n=== 图片/二维码 ===")
    for im in await page.query_selector_all("img,canvas"):
        src = await im.get_attribute("src")
        print(" -", (src or "")[:160])
    for f in page.frames:
        print("frame:", f.url[:120])
    # 保存内嵌二维码
    import base64
    saved = 0
    for im in await page.query_selector_all("img"):
        src = (await im.get_attribute("src")) or ""
        if src.startswith("data:image/png;base64,"):
            data = base64.b64decode(src.split(",", 1)[1])
            if len(data) > 800:
                saved += 1
                open("pay_qr_payweld.png", "wb").write(data)
    print("二维码已保存:", saved, "-> pay_qr_payweld.png")

    # 尝试取支付链接（复制按钮 -> 剪贴板）
    try:
        await ctx.grant_permissions(["clipboard-read", "clipboard-write"],
                                    origin="https://payweld.com")
        if await click_text(page, "复制支付链接"):
            await page.wait_for_timeout(800)
            txt = await page.evaluate("navigator.clipboard.readText()")
            print("支付链接:", txt)
            open("payweld_paylink.txt", "w", encoding="utf-8").write(txt or "")
    except Exception as e:
        print("读取链接失败:", str(e)[:120])

    await page.screenshot(path="pw_pay.png", full_page=True)
    print("screenshot -> pw_pay.png")
    html = await page.content()
    m = re.findall(r"https?://[^\"'\s<>]{20,160}", html)
    qr = [u for u in m if any(k in u for k in ("qr.", "alipay", "weixin", "qrcode", "pay.cashier"))]
    print("候选支付链接:", qr[:6])
    await br.close()
    await pw.stop()


asyncio.run(main())
