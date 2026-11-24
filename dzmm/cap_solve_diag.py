# -*- coding: utf-8 -*-
"""抓当前验证码图，用 captcha_bridge.analyze 解算并输出路径信息。"""
import asyncio
import sys

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
URL = ("https://dzmm.ai/__captcha/?src=ratelimit&embed=1&theme=light"
       "&next=%2Fapi%2Fhealth%3Fcaptcha_completed%3D1")


async def main():
    sys.path.insert(0, __file__.rsplit("\\", 1)[0])
    import captcha_bridge as B

    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  proxy={"server": "http://127.0.0.1:7897"},
                                  args=["--no-sandbox", "--headless=new", "--disable-gpu"])
    ctx = await br.new_context(locale="zh-CN", viewport={"width": 1280, "height": 900})
    page = await ctx.new_page()
    await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)
    fr = page.frames[-1]
    img = await fr.query_selector("img")
    src = await img.get_attribute("src")
    data = await fr.evaluate("""async(s)=>{const r=await fetch(s);const b=await r.blob();
        return Array.from(new Uint8Array(await b.arrayBuffer()));}""", src)
    open("cap_now.png", "wb").write(bytes(data))
    print("saved cap_now.png", len(data))

    res = B.analyze(bytes(data))
    if not res:
        print("analyze -> None")
    else:
        comps, chain, tgt, bd = res
        print("components=%s chain(len)=%s target=%s bd=%s" % (
            len(comps), len(chain) if chain else None, tgt, bd))
        if chain and tgt:
            path = B.build_path(comps, chain, tgt)
            print("path points=%d" % len(path))
            print("first=%s last=%s" % (path[0], path[-1]))
    await br.close()
    await pw.stop()


asyncio.run(main())
