# scripts/solve_gate.py —— 自动通过 DZMM 的 /__captcha/ 多终点拖拽验证，拿到放行 cookie
#
# 流程:
#   1) GET  /__captcha/                -> 解析 challenge id / next / theme
#   2) GET  /__captcha/image?id=...    -> 下载 320x180 挑战图
#   3) scripts/gate_vision.solve()     -> 生成 {x,y,t} 轨迹
#   4) POST /__captcha/verify          -> id / next / theme / trace
#   5) GET  /                          -> 校验是否已从 418 变 200
#
# 用法:
#   python scripts/solve_gate.py                 # 走 7897 出口
#   python scripts/solve_gate.py --cookie-file cookies.txt
import argparse
import io
import json
import os
import re
import sys

from curl_cffi import requests as creq

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gate_vision import solve  # noqa: E402

BASE = "https://www.dzmm.ai"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")


def find_field(html, name):
    m = re.search(r'name="%s"\s+value="([^"]*)"' % re.escape(name), html)
    if m:
        return m.group(1)
    m = re.search(r'value="([^"]*)"\s+name="%s"' % re.escape(name), html)
    return m.group(1) if m else ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    ap.add_argument("--cookie-file", default="out/gate_cookies.txt")
    ap.add_argument("--keep-image", default="out/captcha.png")
    ap.add_argument("--debug", default="out/gate_solved.png")
    args = ap.parse_args()

    proxies = {"http": args.proxy, "https": args.proxy} if args.proxy else None
    s = creq.Session(impersonate="chrome", proxies=proxies, timeout=40)

    if os.path.exists(args.cookie_file):
        with io.open(args.cookie_file, encoding="utf-8") as f:
            for line in f:
                if "\t" not in line:
                    continue
                parts = line.rstrip("\n").split("\t")
                if len(parts) >= 7:
                    s.cookies.set(parts[5], parts[6], domain=parts[0].lstrip("."))

    r = s.get(BASE + "/__captcha/")
    print("gate page:", r.status_code, len(r.text))
    if r.status_code != 418 and "captcha" not in r.text.lower():
        print("可能没被拦：直接 GET / 看状态")
    cid = find_field(r.text, "id")
    nxt = find_field(r.text, "next") or "/"
    theme = find_field(r.text, "theme") or "light"
    print("challenge:", cid, "next:", nxt, "theme:", theme)
    if not cid:
        print("没解析到 challenge id，页面开头：")
        print(r.text[:400])
        return 1

    img = s.get(BASE + "/__captcha/image", params={"id": cid, **({"theme": theme} if theme == "dark" else {})})
    print("image:", img.status_code, img.headers.get("content-type"), len(img.content))
    if img.status_code != 200 or not img.content.startswith(b"\x89PNG"):
        print("取图失败：", img.text[:200] if img.text else img.content[:80])
        return 1
    os.makedirs(os.path.dirname(args.keep_image) or ".", exist_ok=True)
    with open(args.keep_image, "wb") as f:
        f.write(img.content)

    trace = solve(args.keep_image, args.debug)
    if not trace:
        print("求解失败：没有可用路径")
        return 1
    print("trace points:", len(trace))

    body = {
        "id": cid,
        "next": nxt,
        "theme": theme,
        "trace": json.dumps(trace, ensure_ascii=False, separators=(",", ":")),
    }
    vr = s.post(BASE + "/__captcha/verify", data=body,
                headers={"referer": BASE + "/__captcha/", "origin": BASE})
    print("verify:", vr.status_code, "->", vr.headers.get("location") or "(no redirect)")
    print("set-cookie:", [c.name for c in s.cookies.jar])

    check = s.get(BASE + "/")
    print("homepage after verify:", check.status_code)

    os.makedirs(os.path.dirname(args.cookie_file) or ".", exist_ok=True)
    with io.open(args.cookie_file, "w", encoding="utf-8", newline="\n") as f:
        f.write("# Netscape HTTP Cookie File\n")
        for c in s.cookies.jar:
            f.write("%s\tTRUE\t/\tFALSE\t0\t%s\t%s\n" % (c.domain or "www.dzmm.ai", c.name, c.value))
    print("cookies ->", args.cookie_file)
    return 0 if check.status_code == 200 else 2


if __name__ == "__main__":
    sys.exit(main())
