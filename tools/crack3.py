import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

def channel_centerline(img_bytes):
    pimg = Image.open(_io.BytesIO(img_bytes)).convert('RGB')
    pw,ph = pimg.size; px = pimg.load()
    D=(78,105,119); G=(73,119,108)
    def isch(p): return (abs(p[0]-D[0])<=45 and abs(p[1]-D[1])<=45 and abs(p[2]-D[2])<=45) or (abs(p[0]-G[0])<=45 and abs(p[1]-G[1])<=45 and abs(p[2]-G[2])<=45)
    sx,sy=35,90
    seeds=set()
    for r in range(3,24):
        for ang in range(0,360,2):
            x=int(sx+r*math.cos(math.radians(ang))); y=int(sy+r*math.sin(math.radians(ang)))
            if 0<=x<pw and 0<=y<ph and isch(px[x,y]): seeds.add((x,y))
    q=collections.deque(seeds); seen=set(seeds)
    while q:
        x,y=q.popleft()
        for dx in range(-1,2):
            for dy in range(-1,2):
                nx,ny=x+dx,y+dy
                if 0<=nx<pw and 0<=ny<ph and (nx,ny) not in seen and isch(px[nx,ny]):
                    seen.add((nx,ny)); q.append((nx,ny))
    xs=sorted(set(x for x,y in seen))
    line=[]
    for x in range(min(xs), max(xs)+1, 4):
        ys=[y for (xx,y) in seen if xx==x]
        if ys: line.append((x, sum(ys)//len(ys)))
    return line, len(seen)

async def one_attempt(page):
    # 确保在首页并打开登录
    await page.get_by_text("登录", exact=True).first.click(timeout=8000)
    await page.wait_for_timeout(2000)
    for label in ["以游客模式继续","游客登录","游客"]:
        el = page.get_by_text(label, exact=False).first
        if await el.count() > 0:
            await el.click(timeout=5000); break
    await page.wait_for_timeout(5000)
    frame = None
    for f in page.frames:
        if '__captcha' in f.url: frame = f
    if not frame: return "NO_CAPTCHA"
    img_src = await (await frame.query_selector('img')).get_attribute('src')
    img_bytes = await frame.evaluate("async(src)=>{const r=await fetch(src);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
    line, n = channel_centerline(bytes(img_bytes))
    if not line: return "NO_CHANNEL"
    print(f"  通道点数{len(line)} 像素{n} 终点{line[-1]}")
    stage = await frame.query_selector('#dragStage')
    bb = await stage.bounding_box()
    pw,ph = Image.open(_io.BytesIO(bytes(img_bytes))).size
    sx_=bb['x']/1; scale_x=bb['width']/pw; scale_y=bb['height']/ph
    def to_stage(px_,py_): return (bb['x']+px_*scale_x, bb['y']+py_*scale_y)
    start = to_stage(line[0][0], line[0][1])
    await page.mouse.move(start[0], start[1]); await page.wait_for_timeout(150)
    await page.mouse.down(); await page.wait_for_timeout(random.randint(60,140))
    for (px_,py_) in line[1:]:
        st = to_stage(px_,py_)
        await page.mouse.move(st[0]+random.uniform(-1,1), st[1]+random.uniform(-1,1), steps=1)
        await page.wait_for_timeout(random.randint(6,26))
    await page.wait_for_timeout(random.randint(50,120))
    await page.mouse.up(); await page.wait_for_timeout(1200)
    btn = await frame.query_selector('#submitButton')
    status = await (await frame.query_selector('#dragStatus')).text_content()
    disabled = await btn.get_attribute('disabled')
    print(f"  状态:{status} disabled:{disabled}")
    if disabled: return "BTN_DISABLED"
    # 捕获 verify 响应
    caps=[]
    async def on_resp(r):
        if '/__captcha/verify' in r.url:
            caps.append((r.status, r.url[:120]))
    page.on("response", on_resp)
    await btn.click()
    await page.wait_for_timeout(6000)
    print(f"  verify响应:{caps}")
    still = any('__captcha' in f.url for f in page.frames)
    if still: return "VERIFY_FAIL"
    return "PASS"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4500)
        for i in range(3):
            print(f"=== 尝试 {i+1} ===")
            r = await one_attempt(page)
            print("结果:", r)
            if r == "PASS":
                print("=== 成功！捕获状态 ===")
                await page.wait_for_timeout(3000)
                ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest|mgwan/i.test(k))o[k]=localStorage.getItem(k).slice(0,200);return o}")
                print("localStorage:", json.dumps(ls, ensure_ascii=False))
                # 查 getMe
                try:
                    me = await page.evaluate("fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
                    print("getMe:", me[:500])
                except Exception as e: print("getMe err", e)
                break
            # 失败后刷新验证码
            await page.wait_for_timeout(2000)
            try:
                for f in page.frames:
                    if '__captcha' in f.url:
                        await f.get_by_text("换一张").first.click(timeout=3000)
                        break
            except: pass
            await page.wait_for_timeout(2500)
        await browser.close()
asyncio.run(main())
