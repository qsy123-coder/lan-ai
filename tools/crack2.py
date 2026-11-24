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
    def isch(p): return (abs(p[0]-D[0])<=40 and abs(p[1]-D[1])<=40 and abs(p[2]-D[2])<=40) or (abs(p[0]-G[0])<=40 and abs(p[1]-G[1])<=40 and abs(p[2]-G[2])<=40)
    sx,sy=35,90
    seeds=set()
    for r in range(3,22):
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
    # 中心线：每 4px 取通道 y 中心
    xs=sorted(set(x for x,y in seen))
    line=[]
    for x in range(min(xs), max(xs)+1, 4):
        ys=[y for (xx,y) in seen if xx==x]
        if ys: line.append((x, sum(ys)//len(ys)))
    return line

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0: await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        frame = None
        for f in page.frames:
            if '__captcha' in f.url: frame = f
        if not frame: print("NO_CAPTCHA"); return
        img_src = await (await frame.query_selector('img')).get_attribute('src')
        img_bytes = await frame.evaluate("async(src)=>{const r=await fetch(src);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        line = channel_centerline(bytes(img_bytes))
        print("通道中心线点数:", len(line), "起点", line[0] if line else None, "终点", line[-1] if line else None)
        if not line: print("通道追踪失败"); return
        stage = await frame.query_selector('#dragStage')
        bb = await stage.bounding_box()
        pw,ph = Image.open(_io.BytesIO(bytes(img_bytes))).size
        scale_x = bb['width']/pw; scale_y = bb['height']/ph
        def to_stage(px_,py_): return (bb['x']+px_*scale_x, bb['y']+py_*scale_y)
        # 从起点拖拽沿中心线
        start = to_stage(line[0][0], line[0][1])
        await page.mouse.move(start[0], start[1])
        await page.wait_for_timeout(200)
        await page.mouse.down()
        await page.wait_for_timeout(random.randint(80,150))
        # 沿中心线移动，带抖动
        for (px_,py_) in line[1:]:
            st = to_stage(px_, py_)
            st = (st[0]+random.uniform(-1,1), st[1]+random.uniform(-1,1))
            await page.mouse.move(st[0], st[1], steps=1)
            await page.wait_for_timeout(random.randint(8,30))
        await page.wait_for_timeout(random.randint(60,120))
        await page.mouse.up()
        await page.wait_for_timeout(1500)
        # 检查提交按钮状态
        btn = await frame.query_selector('#submitButton')
        disabled = await btn.get_attribute('disabled')
        status = await (await frame.query_selector('#dragStatus')).text_content()
        print("状态:", status, "按钮disabled:", disabled)
        # 监听 verify 响应
        resp_cap = []
        async def on_resp(r):
            if '/__captcha/verify' in r.url:
                resp_cap.append(r.status)
        page.on("response", on_resp)
        if not disabled:
            await btn.click()
        await page.wait_for_timeout(5000)
        print("verify 响应:", resp_cap)
        print("当前URL:", page.url)
        has_cap = any('__captcha' in f.url for f in page.frames)
        print("仍有captcha:", has_cap)
        if not has_cap:
            # 检查是否登录成功
            await page.wait_for_timeout(3000)
            ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest|mgwan/i.test(k))o[k]=localStorage.getItem(k).slice(0,200);return o}")
            print("localStorage:", json.dumps(ls, ensure_ascii=False))
        await browser.close()
asyncio.run(main())
