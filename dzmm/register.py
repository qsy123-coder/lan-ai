# -*- coding: utf-8 -*-
"""
dzmm.ai 游客账号批量注册
- 自动过「多终点拖拽路径」验证码
- 成功后提取 sb-rls-auth-token 存入 accounts.json
- 每个新游客账号: 75 积分 + 每日免费额度

用法:
  python register.py            # 注册 1 个
  python register.py 5          # 注册 5 个
"""
import asyncio
import collections
import io as _io
import json
import math
import random
import sys
import time

from PIL import Image

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C
import captcha_solver as SOLVER

CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
def _pw():
    p = C.proxy_list()[0] if C.proxy_list() else "http://127.0.0.1:7897"
    # playwright 用 socks5:// 前缀
    return p.replace("socks5h://", "socks5://").replace("http://", "http://")

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
    return comps, chain, far, tgt, bestd


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


async def _drag(page, frame, path):
    stage = await frame.query_selector("#dragStage")
    bb = await stage.bounding_box()
    scx = bb["width"] / 320.0
    scy = bb["height"] / 180.0

    def ts(p_):
        return (bb["x"] + p_[0] * scx, bb["y"] + p_[1] * scy)

    pts = path if len(path) <= 70 else [path[i] for i in range(0, len(path), 2)] + [path[-1]]
    s = ts(pts[0])
    await page.mouse.move(s[0], s[1])
    await page.wait_for_timeout(180)
    await page.mouse.down()
    await page.wait_for_timeout(random.randint(90, 150))
    for p_ in pts[1:]:
        q = ts(p_)
        await page.mouse.move(q[0], q[1], steps=1)
        await page.wait_for_timeout(random.randint(6, 14))
    await page.wait_for_timeout(120)
    await page.mouse.up()
    await page.wait_for_timeout(900)
    return await frame.query_selector("#submitButton")


async def solve_captcha(page, tries=7):
    """支持 iframe 内嵌 / 顶层页面两种验证码；路径连续贴通道"""
    for i in range(tries):
        frame = None
        for f in page.frames:
            if "__captcha" in f.url:
                frame = f
        target = frame if frame else page
        has_cap = frame is not None or "/__captcha" in page.url
        if not has_cap:
            return True
        try:
            img = await target.query_selector("img[src*='__captcha/image']")
            if not img:
                await page.wait_for_timeout(1200)
                continue
            src = await img.get_attribute("src")
            ib = await target.evaluate(
                "async(s)=>{const r=await fetch(s);const b=await r.blob();"
                "return Array.from(new Uint8Array(await b.arrayBuffer()));}", src)
            path, meta = SOLVER.solve(bytes(ib), prefer_idx=i)
            if not path:
                print("    solver fail:", meta.get("err"))
                try:
                    await target.get_by_text("换一张").first.click(timeout=2500)
                except Exception:
                    pass
                await page.wait_for_timeout(1800)
                continue
            print("    路径 %d 点 终点%s inside=%s dilate=%s" % (
                len(path), meta.get("goal"), meta.get("goal_inside"), meta.get("dilate")))
            btn = await _drag(page, target, path)
            await btn.click()
            await page.wait_for_timeout(4500)
            gone = (not any("__captcha" in f.url for f in page.frames)) and ("/__captcha" not in page.url)
            if gone:
                return True
            try:
                await target.get_by_text("换一张").first.click(timeout=2500)
            except Exception:
                pass
            await page.wait_for_timeout(1800)
        except Exception as e:
            print("    captcha err:", str(e)[:70])
            await page.wait_for_timeout(1200)
    return False


async def _is_logged(page):
    try:
        me = await page.evaluate(
            "fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D')"
            ".then(r=>r.text())")
        return '"isLoggedIn":true' in me
    except Exception:
        return False


async def register_one(headless=True):
    """单页面流程：过全站验证 -> 游客登录 -> 过登录验证 -> 取 token"""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        b = await p.chromium.launch(
            executable_path=CHROME, headless=headless,
            proxy={"server": _pw()},
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled", "--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-extensions", "--disable-background-networking", "--disable-renderer-backgrounding", "--disable-background-timer-throttling", "--renderer-process-limit=1", "--js-flags=--max-old-space-size=192", "--no-zygote"])
        ctx = await b.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/%d.0.0.0 Safari/537.36" % random.randint(126, 133),
            viewport={"width": random.choice([1366, 1440, 1536, 1920]),
                      "height": random.choice([768, 900, 864, 1080])},
            locale="zh-CN", timezone_id="Asia/Shanghai")
        page = await ctx.new_page()
        try:
            await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(4000)

            # 1) 全站验证码
            if "/__captcha" in page.url or any("__captcha" in f.url for f in page.frames):
                print("  全站验证")
                if not await solve_captcha(page):
                    print("  全站验证失败")
                    return None
                await page.wait_for_timeout(2500)

            # 1.5) 点击"登录"前再次确认没有全站验证
            if "/__captcha" in page.url or any("__captcha" in f.url for f in page.frames):
                print("  再次遇全站验证")
                await solve_captcha(page)
                await page.wait_for_timeout(2500)

            # 2) 已登录？
            if not await _is_logged(page):
                try:
                    await page.get_by_text("登录", exact=True).first.click(timeout=8000)
                except Exception:
                    pass
                await page.wait_for_timeout(1800)
                clicked = False
                for label in ["以游客模式继续", "游客登录", "游客"]:
                    el = page.get_by_text(label, exact=False).first
                    if await el.count() > 0:
                        try:
                            await el.click(timeout=6000)
                            clicked = True
                            break
                        except Exception:
                            pass
                if not clicked:
                    # 可能是全站验证插入
                    if "/__captcha" in page.url or any("__captcha" in f.url for f in page.frames):
                        print("  游客入口处遇验证码，先解")
                        if await solve_captcha(page):
                            await page.wait_for_timeout(2500)
                            try:
                                await page.get_by_text("登录", exact=True).first.click(timeout=8000)
                                await page.wait_for_timeout(1800)
                            except Exception:
                                pass
                            for label in ["以游客模式继续", "游客登录", "游客"]:
                                el = page.get_by_text(label, exact=False).first
                                if await el.count() > 0:
                                    try:
                                        await el.click(timeout=6000)
                                        clicked = True
                                        break
                                    except Exception:
                                        pass
                if not clicked:
                    print("  未找到游客入口")
                    return None
                # 3) 等登录 或 验证码（最多 40 秒）
                for _ in range(40):
                    await page.wait_for_timeout(1000)
                    if await _is_logged(page):
                        break
                    frame = None
                    for f in page.frames:
                        if "__captcha" in f.url:
                            frame = f
                    if frame is not None or "/__captcha" in page.url:
                        print("  登录验证码")
                        if not await solve_captcha(page):
                            print("  登录验证码失败")
                            return None
                        break
            # 4) 再确认
            for _ in range(15):
                if await _is_logged(page):
                    break
                await page.wait_for_timeout(1000)
            if not await _is_logged(page):
                print("  登录未生效")
                return None

            cookies = await ctx.cookies()
            auth = None
            for c in cookies:
                if c["name"] == "sb-rls-auth-token":
                    auth = C.decode_sb_cookie(c["value"])
            if not auth or not auth.get("access_token"):
                print("  未取到 token")
                return None
            st, me3 = C.get_me(auth["access_token"])
            try:
                prof = me3[0]["result"]["data"]["json"]
                auth["user_id"] = prof.get("id", auth.get("user_id"))
                auth["credit"] = prof.get("credit")
                print("  注册成功: %s credit=%s" % (auth["user_id"], auth["credit"]))
            except Exception:
                print("  getMe 解析失败")
            return auth
        except Exception as e:
            print("  register err:", str(e)[:90])
            return None
        finally:
            try:
                await b.close()
            except Exception:
                pass


async def main():
    n = 1
    if len(sys.argv) > 1:
        try:
            n = int(sys.argv[1])
        except Exception:
            pass
    ok = 0
    for i in range(n):
        print("[%d/%d] 注册中..." % (i + 1, n))
        auth = await register_one()
        if auth:
            C.add_account(auth)
            ok += 1
        else:
            print("  失败，等待冷却")
        if i < n - 1:
            wait = random.randint(45, 120)
            print("  冷却 %ds" % wait)
            await asyncio.sleep(wait)
    print("\n完成: %d/%d 成功" % (ok, n))
    pool = C.load_pool()
    print("账号池总计: %d" % len(pool))


if __name__ == "__main__":
    asyncio.run(main())
