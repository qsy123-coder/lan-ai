# -*- coding: utf-8 -*-
"""诊断验证码页当前状态：抓页面文本、iframe、img src 与图片响应头/前 200 字节。"""
import asyncio
import base64
import json
import time

from playwright.async_api import async_playwright

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = "http://127.0.0.1:7897"
URL = ("https://dzmm.ai/__captcha/?src=ratelimit&embed=1&theme=light"
       "&next=%2Fapi%2Fhealth%3Fcaptcha_completed%3D1")


async def main():
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=CHROME, headless=True,
                                  proxy={"server": PROXY}, args=["--no-sandbox", "--headless=new"])
    ctx = await br.new_context(locale="zh-CN")
    page = await ctx.new_page()

    logs = []
    page.on("console", lambda m: logs.append("console:%s %s" % (m.type, m.text[:120])))
    page.on("response", lambda r: logs.append("resp:%s %s" % (r.status, r.url[:120])) if "__captcha" in r.url else None)

    await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(4000)

    print("== frames ==")
    for f in page.frames:
        print("  ", f.url[:120])

    print("== body text ==")
    try:
        txt = await page.inner_text("body")
        print(repr(txt[:600]))
    except Exception as e:
        print("  err", e)

    print("== imgs ==")
    for fr in page.frames:
        try:
            imgs = await fr.query_selector_all("img")
        except Exception:
            continue
        for im in imgs:
            src = await im.get_attribute("src")
            print("  frame=%s src=%s" % (fr.url[:50], (src or "")[:160]))
            if not src:
                continue
            try:
                info = await fr.evaluate("""async(s)=>{
                    const r = await fetch(s);
                    const b = await r.blob();
                    const ab = await b.arrayBuffer();
                    const u8 = new Uint8Array(ab).slice(0,24);
                    return {status:r.status, ctype:r.headers.get('content-type'),
                            len:ab.byteLength, head:Array.from(u8)};
                }""", src)
                print("    ->", info)
            except Exception as e:
                print("    fetch err", str(e)[:100])

    print("== html head ==")
    try:
        html = await page.content()
        print(html[:800].replace("\n", " "))
    except Exception as e:
        print("  err", e)

    print("== logs ==")
    for l in logs[-25:]:
        print("  ", l)

    await br.close()
    await pw.stop()


asyncio.run(main())
