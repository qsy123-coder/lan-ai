# -*- coding: utf-8 -*-
"""
dzmm.ai 验证码桥接
- tRPC 返回 418 captcha_required 时调用
- 用 Playwright 打开站点，自动过「多终点拖拽路径」验证码
- 导出 cookie 供 requests 使用（写入 cookies.json）

用法:
  python captcha_bridge.py          # 过一次验证码并保存 cookie
  python captcha_bridge.py --test   # 过完立即测试 tRPC
"""
import asyncio
import collections
import io as _io
import json
import math
import os
import random
import sys
import time
import base64

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import client as C

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"

# ---- 浏览器复用池（避免每次 bridge 都起新 Chrome 导致内存泄漏）----
_PW = None
_BROWSER = None
_CTX = None
_USE_COUNT = [0]
MAX_REUSE = 12          # 每复用 12 次重启一次浏览器，防止内存膨胀


async def _get_ctx(headless=True):
    """获取（或新建）常驻 context"""
    global _PW, _BROWSER, _CTX
    from playwright.async_api import async_playwright
    if _CTX is not None and _USE_COUNT[0] < MAX_REUSE:
        return _CTX
    await _shutdown()
    _PW = await async_playwright().start()
    _BROWSER = await _PW.chromium.launch(
        executable_path=CHROME, headless=headless,
        proxy={"server": PROXY_SERVER},
        args=["--no-sandbox", "--disable-blink-features=AutomationControlled",
              "--headless=new", "--disable-gpu", "--disable-dev-shm-usage",
              "--disable-extensions", "--disable-background-networking",
              "--renderer-process-limit=1", "--js-flags=--max-old-space-size=192",
              "--no-zygote", "--single-process"])
    _CTX = await _BROWSER.new_context(
        user_agent=C.UA, viewport={"width": 1280, "height": 900},
        locale="zh-CN", timezone_id="Asia/Shanghai")
    _USE_COUNT[0] = 0
    return _CTX


async def _shutdown():
    global _PW, _BROWSER, _CTX
    try:
        if _CTX is not None:
            await _CTX.close()
    except Exception:
        pass
    try:
        if _BROWSER is not None:
            await _BROWSER.close()
    except Exception:
        pass
    try:
        if _PW is not None:
            await _PW.stop()
    except Exception:
        pass
    _CTX = _BROWSER = _PW = None


async def close_browser():
    await _shutdown()

PROXY_SERVER = "socks5://127.0.0.1:7897"
COOKIE_FILE = os.path.join(HERE, "cookies.json")

D = (78, 105, 119)
G = (73, 119, 108)
RC = (143, 87, 98)


def eq(p, c, t=25):
    return abs(p[0] - c[0]) <= t and abs(p[1] - c[1]) <= t and abs(p[2] - c[2]) <= t


def analyze(img_bytes):
    im = Image.open(_io.BytesIO(img_bytes)).convert("RGB")
    w, h = im.size
    px = im.load()

    def isch(p):
        return eq(p, D) or eq(p, G)

    allch = set((x, y) for y in range(h) for x in range(w) if isch(px[x, y]))
    seen = set()
    comps = []
    for p in allch:
        if p in seen:
            continue
        q = collections.deque([p])
        seen.add(p)
        comp = []
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for dx in range(-1, 2):
                for dy in range(-1, 2):
                    np = (x + dx, y + dy)
                    if np in allch and np not in seen:
                        seen.add(np)
                        q.append(np)
        if len(comp) > 25:
            comps.append(comp)
    reds = [(x, y) for y in range(h) for x in range(w) if eq(px[x, y], RC)]
    rs = set()
    circles = []
    for p in reds:
        if p in rs:
            continue
        q = collections.deque([p])
        rs.add(p)
        comp = []
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    np = (x + dx, y + dy)
                    if np in reds and np not in rs:
                        rs.add(np)
                        q.append(np)
        if len(comp) > 200:
            circles.append((sum(p[0] for p in comp) // len(comp),
                            sum(p[1] for p in comp) // len(comp)))
    if not comps:
        return None
    sx, sy = 35, 90
    start_i = min(range(len(comps)),
                  key=lambda i: min(math.hypot(p[0] - sx, p[1] - sy) for p in comps[i]))
    chain = [start_i]
    used = {start_i}
    for _ in range(30):
        cur = chain[-1]
        best = (1e9, None)
        for j in range(len(comps)):
            if j in used:
                continue
            mn = min(math.hypot(p[0] - q[0], p[1] - q[1]) for p in comps[cur] for q in comps[j])
            if mn < 50 and mn < best[0]:
                best = (mn, j)
        if best[1] is None:
            break
        chain.append(best[1])
        used.add(best[1])
    last = comps[chain[-1]]
    cs = set(last)
    entry = min(last, key=lambda p: math.hypot(p[0] - sx, p[1] - sy))
    qq = collections.deque([entry])
    dm = {entry: 0}
    while qq:
        x, y = qq.popleft()
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                np = (x + dx, y + dy)
                if np in cs and np not in dm:
                    dm[np] = dm[(x, y)] + 1
                    qq.append(np)
    far = max(dm.items(), key=lambda kv: kv[1])[0] if dm else entry
    tgt = None
    bestd = 1e9
    for (cx, cy) in circles:
        d = math.hypot(far[0] - cx, far[1] - cy)
        if d < bestd:
            bestd = d
            tgt = (cx, cy)
    return comps, chain, tgt, bestd


def build_path(comps, chain, tgt):
    sx, sy = 35, 90
    full = [(sx, sy)]
    curpt = (sx, sy)
    for oi in chain:
        c = comps[oi]
        cs = set(c)
        start = min(c, key=lambda p: math.hypot(p[0] - curpt[0], p[1] - curpt[1]))
        ex = min(c, key=lambda p: math.hypot(p[0] - tgt[0], p[1] - tgt[1]))
        q = collections.deque([start])
        par = {start: None}
        while q:
            x, y = q.popleft()
            if (x, y) == ex:
                break
            for dx in range(-1, 2):
                for dy in range(-1, 2):
                    np = (x + dx, y + dy)
                    if np in cs and np not in par:
                        par[np] = (x, y)
                        q.append(np)
        if ex in par:
            seg = []
            cc = ex
            while cc is not None:
                seg.append(cc)
                cc = par[cc]
            seg.reverse()
            full.extend(seg)
            curpt = ex
    full.append(tgt)
    return full


async def _drag(page, frame, path):
    stage = await frame.query_selector("#dragStage")
    bb = await stage.bounding_box()
    scx = bb["width"] / 320.0
    scy = bb["height"] / 180.0

    def ts(p_):
        return (bb["x"] + p_[0] * scx, bb["y"] + p_[1] * scy)

    pts = [path[i] for i in range(0, len(path), 2)] + [path[-1]]
    s = ts(pts[0])
    await page.mouse.move(s[0], s[1])
    await page.wait_for_timeout(200)
    await page.mouse.down()
    await page.wait_for_timeout(random.randint(90, 160))
    for p_ in pts[1:]:
        q = ts(p_)
        await page.mouse.move(q[0], q[1], steps=1)
        await page.wait_for_timeout(random.randint(8, 18))
    await page.wait_for_timeout(120)
    await page.mouse.up()
    await page.wait_for_timeout(1000)
    return await frame.query_selector("#submitButton")


async def solve(page, tries=20):
    for _round in range(tries):
        tries_left = tries - _round
        frame = None
        for f in page.frames:
            if "__captcha" in f.url:
                frame = f
        if not frame:
            return True
        img_src = await (await frame.query_selector("img")).get_attribute("src")
        ib = await frame.evaluate(
            "async(s)=>{const r=await fetch(s);const b=await r.blob();"
            "return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        res = analyze(bytes(ib))
        path = None
        if res:
            comps, chain, tgt, bd = res
            if tgt and bd <= 40:
                path = build_path(comps, chain, tgt)
        if path is None and tries_left > 4:
            # 前几轮只等旧格式（深青灰通道），旧算法稳定性最高
            try:
                await frame.get_by_text("换一张").first.click(timeout=3000)
            except Exception:
                pass
            await page.wait_for_timeout(1500)
            continue
        if path is None:
            # 新版验证码（米白通道 + 深青灰轮廓 + 红环干扰）：用轮廓 BFS 兜底
            try:
                import cap_solve2 as S2
                im2 = Image.open(_io.BytesIO(bytes(ib))).convert("RGB")
                mask = S2.build_mask(im2, dilate=2)
                sp = S2.start_point(im2)
                far, raw = S2.bfs_far(mask, sp, im2.size[0], im2.size[1])
                w2, h2 = im2.size
                # 终点必须在右半区（通道由左向右），否则视为解错，换一张
                if raw and len(raw) > 40 and far[0] > w2 * 0.55:
                    step = max(1, len(raw) // 60)
                    path = [(sp[0], sp[1])] + raw[::step] + [raw[-1]]
                    print("    新版验证码：轮廓路径 %d 点 -> %s" % (len(path), far))
                elif raw:
                    print("    新版解算终点可疑 %s，换一张" % (far,))
            except Exception as e:
                print("    新版解算失败:", str(e)[:80])
        if path is None:
            try:
                await frame.get_by_text("换一张").first.click(timeout=3000)
            except Exception:
                pass
            await page.wait_for_timeout(2000)
            continue
        btn = await _drag(page, frame, path)
        await btn.click()
        await page.wait_for_timeout(5000)
        if not any("__captcha" in f.url for f in page.frames):
            return True
        for f in page.frames:
            if "__captcha" in f.url:
                try:
                    await f.get_by_text("换一张").first.click(timeout=3000)
                except Exception:
                    pass
        await page.wait_for_timeout(2000)
    return False


async def bridge(token=None, headless=True, acc=None, ctx=None):
    """过验证码；acc 传入时注入该账号 cookie，使验证对该账号生效"""
    own_ctx = ctx is None
    if own_ctx:
        ctx = await _get_ctx(headless)
        _USE_COUNT[0] += 1
    page = await ctx.new_page()
    # 复用 ctx 时先清掉上一个账号的 cookie，避免串号
    try:
        await ctx.clear_cookies()
    except Exception:
        pass
    # 关键：先注入账号 cookie，让服务端把验证码绑定到该账号
    if acc and acc.get("access_token"):
        try:
            payload = {
                "access_token": acc["access_token"],
                "token_type": "bearer",
                "expires_in": 3600,
                "expires_at": int(time.time()) + 3600,
                "refresh_token": acc.get("refresh_token") or "",
                "user": {"id": acc.get("user_id"), "aud": "authenticated", "role": "authenticated"},
            }
            raw = base64.urlsafe_b64encode(
                json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
            await ctx.add_cookies([{
                "name": "sb-rls-auth-token", "value": "base64-" + raw,
                "domain": "www.dzmm.ai", "path": "/"}])
        except Exception as e:
            print("注入账号 cookie 失败:", str(e)[:80])
        page = await ctx.new_page()
    # 省流量：只拦图片/字体/媒体（样式表和验证码图必须保留）
    async def _route(route):
        try:
            req = route.request
            if "__captcha/image" in req.url:
                await route.continue_()
            elif req.resource_type in ("image", "font", "media"):
                await route.abort()
            else:
                await route.continue_()
        except Exception:
            try:
                await route.continue_()
            except Exception:
                pass
    await page.route("**/*", _route)
    # 关键省流：直接打开独立验证码页，不加载整个 SPA（省 ~10MB/次）
    await page.goto("https://dzmm.ai/__captcha/?src=ratelimit&embed=1&theme=light&next=%2Fapi%2Fhealth%3Fcaptcha_completed%3D1",
                    wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(2500)
    ok = await solve(page)
    print("验证码:", "通过" if ok else "失败")
    await page.wait_for_timeout(2500)
    cookies = await ctx.cookies()
    keep = []
    for c in cookies:
        if "dzmm" in c["domain"]:
            keep.append({"name": c["name"], "value": c["value"], "domain": c["domain"], "path": c["path"]})
    json.dump(keep, open(COOKIE_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("已保存 %d 个 cookie -> %s" % (len(keep), COOKIE_FILE))
    for c in keep:
        print("  ", c["name"], "=", c["value"][:60])
    return ok


def load_cookies_into(sess):
    if not os.path.exists(COOKIE_FILE):
        return False
    try:
        for c in json.load(open(COOKIE_FILE, encoding="utf-8")):
            sess.cookies.set(c["name"], c["value"], domain=c["domain"], path=c.get("path", "/"))
        return True
    except Exception:
        return False


if __name__ == "__main__":
    tok = None
    pool = C.load_pool()
    if pool:
        tok = pool[0].get("access_token")
    asyncio.run(bridge(tok))
    if "--test" in sys.argv:
        import requests
        s = requests.Session()
        load_cookies_into(s)
        r = s.get(C.BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                  headers=C._headers(tok), proxies=C.PROXIES, timeout=30)
        print("\n带 cookie 测试:", r.status_code, r.text[:300])
