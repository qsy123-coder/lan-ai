# -*- coding: utf-8 -*-
"""从 mgwan 下单返回的 payUrl 里解出最终支付宝二维码内容并生成图片。

链路会变（gzsykjgs / dingqin / ahmzwlyxgs ...），这里自动跟随每一层
window.location.replace，直到拿到 `var code_url` 或 qr.alipay.com 链接。

用法:
  python qr_from_order.py                    # 用 membership_order.json 里的 payUrl
  python qr_from_order.py <payUrl>           # 指定链接
  python qr_from_order.py --png out.png
"""
import json
import re
import sys

import requests

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
# 支付域名均为国内直连，显式禁用代理
NO_PROXY = {"http": None, "https": None}
MAX_HOPS = 8


def follow(url):
    """逐跳跟随页面里的 location.replace，返回最终 HTML 与最终 URL"""
    sess = requests.Session()
    sess.trust_env = False
    cur = url
    for hop in range(MAX_HOPS):
        r = sess.get(cur, headers={"User-Agent": UA, "Referer": cur},
                     proxies=NO_PROXY, timeout=25, allow_redirects=True)
        html = r.text
        print("[%d] %d %s  (%d B)" % (hop, r.status_code, r.url, len(html)))
        m = re.search(r"var\s+code_url\s*=\s*'([^']+)'", html)
        if m:
            return m.group(1), r.url, html
        m = re.search(r"location\.replace\(\s*'([^']+)'\s*\)", html)
        if not m:
            m = re.search(r'window\.location\.replace\("([^"]+)"\)', html)
        if not m:
            return None, r.url, html
        nxt = m.group(1)
        if nxt.startswith("/"):
            base = "/".join(r.url.split("/")[:3])
            nxt = base + nxt
        cur = nxt
    return None, cur, ""


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    png = "pay_qr_1yuan.png"
    if "--png" in sys.argv:
        png = sys.argv[sys.argv.index("--png") + 1]
    if args:
        url = args[0]
    else:
        st = json.load(open("membership_order.json", encoding="utf-8"))
        url = st["payUrl"]
        print("订单:", st["orderId"], "| mgwan:", st.get("orderno"))
    print("入口:", url)
    code_url, final_url, _ = follow(url)
    if not code_url:
        print("未找到 code_url，最终页:", final_url)
        print("可手工打开该页扫码")
        return
    print("二维码内容:", code_url)
    try:
        import qrcode
    except ImportError:
        print("缺 qrcode 库: python -m pip install qrcode")
        return
    qrcode.make(code_url).resize((420, 420)).save(png)
    print("已生成:", png)


if __name__ == "__main__":
    main()
