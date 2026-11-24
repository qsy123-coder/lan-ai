import asyncio, json, sys, io, math, random
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

def gen_trace(sx, sy, tx, ty, steps=40):
    """生成从(sx,sy)到(tx,ty)的拟人轨迹（带加速减速+抖动），返回像素点列表"""
    pts=[]
    for i in range(steps+1):
        t = i/steps
        # 缓动：先慢后快再慢
        e = 1-(1-t)**3
        x = sx + (tx-sx)*e
        y = sy + (ty-sy)*e
        # 抖动
        if 3<i<steps-3:
            x += random.uniform(-1.5,1.5)
            y += random.uniform(-1.5,1.5)
        pts.append((round(x,1), round(y,1)))
    return pts

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        # 找 captcha frame
        frame = None
        for f in page.frames:
            if '__captcha' in f.url: frame = f
        if not frame:
            print("NO_CAPTCHA_FRAME"); await browser.close(); return
        # 获取 stage 元素和图片
        stage = await frame.query_selector('#dragStage')
        img = await frame.query_selector('img')
        bb = await stage.bounding_box()
        img_bb = await img.bounding_box()
        print("stage bb:", bb, "img bb:", img_bb)
        # 读取图片并分析通道终点
        img_src = await img.get_attribute('src')
        # 下载图片分析
        import urllib.request, ssl
        # 通过 playwright 拿图片字节
        img_bytes = await frame.evaluate("""async (src) => {
            const r = await fetch(src); const b = await r.blob();
            return Array.from(new Uint8Array(await b.arrayBuffer()));
        }""", img_src)
        from PIL import Image
        import io as _io
        pimg = Image.open(_io.BytesIO(bytes(img_bytes))).convert('RGB')
        pw, ph = pimg.size
        ppx = pimg.load()
        # 分析通道终点（深青灰追踪）
        D=(78,105,119); G=(73,119,108)
        def isch(p):
            return (abs(p[0]-D[0])<=40 and abs(p[1]-D[1])<=40 and abs(p[2]-D[2])<=40) or (abs(p[0]-G[0])<=40 and abs(p[1]-G[1])<=40 and abs(p[2]-G[2])<=40)
        # 起点（从 stage data 或默认）
        sx = int(await stage.get_attribute('data-start-x') or 35)
        sy = int(await stage.get_attribute('data-start-y') or 90)
        # 追踪通道
        import collections
        seeds=set()
        for r in range(3,20):
            for ang in range(0,360,3):
                x=int(sx+r*math.cos(math.radians(ang))); y=int(sy+r*math.sin(math.radians(ang)))
                if 0<=x<pw and 0<=y<ph and isch(ppx[x,y]): seeds.add((x,y))
        q=collections.deque(seeds); seen=set(seeds)
        while q:
            x,y=q.popleft()
            for dx in range(-1,2):
                for dy in range(-1,2):
                    nx,ny=x+dx,y+dy
                    if 0<=nx<pw and 0<=ny<ph and (nx,ny) not in seen and isch(ppx[nx,ny]):
                        seen.add((nx,ny)); q.append((nx,ny))
        xs=[p[0] for p in seen]; ys=[p[1] for p in seen]
        tx=max(xs)
        tys=[y for (x,y) in seen if x==tx]
        ty=sum(tys)//len(tys)
        print(f"通道: 起点({sx},{sy}) 终点({tx},{ty}) 像素数{len(seen)}")
        # 映射到 stage 显示坐标
        scale_x = bb['width']/pw
        scale_y = bb['height']/ph
        def to_stage(px,py):
            return (bb['x']+px*scale_x, bb['y']+py*scale_y)
        # 生成轨迹（图片坐标）并拖拽
        trace_pts = gen_trace(sx, sy, tx, ty)
        # 拖拽：mouse move 到起点，按下，沿轨迹移动，释放
        start_stage = to_stage(sx, sy)
        await page.mouse.move(start_stage[0], start_stage[1])
        await page.mouse.down()
        for (px_,py_) in trace_pts[1:]:
            st = to_stage(px_, py_)
            await page.mouse.move(st[0], st[1], steps=1)
            await page.wait_for_timeout(random.randint(5,15))
        await page.mouse.up()
        await page.wait_for_timeout(1500)
        # 检查提交按钮是否 enabled，点击提交
        btn = await frame.query_selector('#submitButton')
        btn_text = await btn.text_content()
        disabled = await btn.get_attribute('disabled')
        print("提交按钮:", btn_text, "disabled=", disabled)
        if not disabled:
            await btn.click()
        await page.wait_for_timeout(6000)
        # 检查结果
        print("=== 当前 URL:", page.url)
        ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest/i.test(k))o[k]=localStorage.getItem(k).slice(0,150);return o}")
        print("=== localStorage(token):", json.dumps(ls, ensure_ascii=False))
        # 检查是否还有 captcha iframe
        has_cap = any('__captcha' in f.url for f in page.frames)
        print("=== 仍有 captcha:", has_cap)
        await browser.close()

asyncio.run(main())
