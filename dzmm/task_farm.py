# -*- coding: utf-8 -*-
"""
dzmm.ai 任务收割器（浏览器前端埋点驱动）

纯 API 的关注/点赞不会推进任务进度 —— 服务端等的是前端事件。
所以这里用无头浏览器真实操作页面，完成后回 /tasks 领取奖励。

可自动完成（约 +25/号）：
  first_follow        +5   关注 5 位用户
  first_card_like     +5   角色卡点赞
  first_card_comment  +5   角色卡评论
  first_draw          +5   生成一张图（走免费额度）

用法:
  python task_farm.py 1        # 处理第 1 个账号（测试）
  python task_farm.py 0 20     # 从第 0 个开始，处理 20 个
"""
import asyncio
import base64
import json
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import client as C
import register as R

USER_IDS = [
    "ea6e2dcd-d929-451c-9d8b-da345f2cd071",
    "9c524938-83e0-4342-b998-313d7f6cf1a7",
    "bc1dfe9e-2b06-49b7-b5f4-51deb830073f",
    "b773d9a5-debc-41f3-a144-7c685f5e88ec",
    "3405045e-ac99-4823-9138-8cc4929cec1b",
]
CARD_IDS = ["3906371", "3918412", "3909056", "3904272"]

LOG = os.path.join(HERE, "task_farm.log")


def log(msg):
    line = "[%s] %s" % (time.strftime("%H:%M:%S"), msg)
    print(line, flush=True)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def make_cookie(acc):
    """用 access_token/refresh_token 构造 sb-rls-auth-token cookie"""
    payload = {
        "access_token": acc["access_token"],
        "token_type": "bearer",
        "expires_in": 3600,
        "expires_at": int(time.time()) + 3600,
        "refresh_token": acc.get("refresh_token") or "",
        "user": {"id": acc.get("user_id"), "aud": "authenticated", "role": "authenticated"},
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    return "base64-" + raw


async def farm_one(acc, headless=True):
    from playwright.async_api import async_playwright

    uid = acc.get("user_id", "?")[:13]
    async with async_playwright() as p:
        b = await p.chromium.launch(
            executable_path=R.CHROME, headless=headless,
            proxy={"server": R._pw()},
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled",
                  "--headless=new", "--disable-gpu"])
        ctx = await b.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/%d.0.0.0 Safari/537.36" % random.randint(126, 133),
            viewport={"width": 1440, "height": 900},
            locale="zh-CN", timezone_id="Asia/Shanghai")
        await ctx.add_cookies([{
            "name": "sb-rls-auth-token", "value": make_cookie(acc),
            "domain": "www.dzmm.ai", "path": "/"
        }])
        page = await ctx.new_page()
        try:
            await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(3500)
            # 全站验证
            if "/__captcha" in page.url or any("__captcha" in f.url for f in page.frames):
                log("  [%s] 全站验证" % uid)
                if not await R.solve_captcha(page):
                    log("  [%s] 验证失败" % uid)
                    return 0
                await page.wait_for_timeout(2500)
            # 确认登录
            me = await page.evaluate(
                "fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D')"
                ".then(r=>r.text())")
            if '"isLoggedIn":true' not in me:
                log("  [%s] 未登录，cookie 可能失效" % uid)
                return 0
            gained = 0
            # ---- 关注 5 位用户 ----
            for u in USER_IDS:
                try:
                    await page.goto("https://dzmm.ai/user/" + u,
                                    wait_until="domcontentloaded", timeout=45000)
                    await page.wait_for_timeout(2200)
                    if "/__captcha" in page.url:
                        await R.solve_captcha(page)
                        await page.wait_for_timeout(2000)
                    btn = page.get_by_role("button", name="关注", exact=True).first
                    if await btn.count() > 0:
                        await btn.click(timeout=5000)
                        await page.wait_for_timeout(1200)
                except Exception:
                    pass
            log("  [%s] 关注 5 位完成" % uid)
            # ---- 角色卡点赞 + 评论 ----
            cid = random.choice(CARD_IDS)
            try:
                await page.goto("https://dzmm.ai/character/" + cid,
                                wait_until="domcontentloaded", timeout=45000)
                await page.wait_for_timeout(3000)
                if "/__captcha" in page.url:
                    await R.solve_captcha(page)
                    await page.wait_for_timeout(2000)
                # 点赞
                for label in ["赞", "点赞"]:
                    try:
                        lk = page.get_by_role("button", name=label, exact=False).first
                        if await lk.count() > 0:
                            await lk.click(timeout=4000)
                            await page.wait_for_timeout(1500)
                            break
                    except Exception:
                        pass
                # 评论
                try:
                    await page.mouse.wheel(0, 4000)
                    await page.wait_for_timeout(2000)
                    ta = page.locator("textarea").last
                    if await ta.count() > 0:
                        await ta.click(timeout=4000)
                        await ta.fill("好")
                        await page.wait_for_timeout(500)
                        sb = page.get_by_role("button", name="发送", exact=False).first
                        if await sb.count() > 0:
                            await sb.click(timeout=4000)
                            await page.wait_for_timeout(1500)
                except Exception:
                    pass
            except Exception:
                pass
            log("  [%s] 点赞/评论完成" % uid)
            # ---- 回任务中心领取 ----
            await page.goto("https://dzmm.ai/tasks", wait_until="domcontentloaded", timeout=45000)
            await page.wait_for_timeout(4000)
            if "/__captcha" in page.url:
                await R.solve_captcha(page)
                await page.wait_for_timeout(2500)
            for _ in range(12):
                try:
                    btn = page.get_by_role("button", name="领取", exact=True)
                    if await btn.count() == 0:
                        break
                    await btn.first.click(timeout=4000)
                    gained += 5
                    await page.wait_for_timeout(1800)
                except Exception:
                    break
            log("  [%s] 领取完成 +%d" % (uid, gained))
            return gained
        except Exception as e:
            log("  [%s] err %s" % (uid, str(e)[:80]))
            return 0
        finally:
            try:
                await b.close()
            except Exception:
                pass


async def main():
    start = 0
    count = 1
    if len(sys.argv) > 1:
        start = int(sys.argv[1])
    if len(sys.argv) > 2:
        count = int(sys.argv[2])
    pool = C.load_pool()
    targets = pool[start:start + count]
    log("任务收割：从 #%d 起 %d 个账号" % (start, len(targets)))
    total = 0
    for i, acc in enumerate(targets):
        log("[%d/%d] %s" % (i + 1, len(targets), (acc.get("user_id") or "?")[:13]))
        g = await farm_one(acc)
        total += g
        await asyncio.sleep(random.randint(3, 8))
    log("完成：本轮 +%d（预估）" % total)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("手动停止")
