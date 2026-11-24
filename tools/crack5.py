import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image, ImageFilter
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}

def bfs_path(img_bytes):
    pimg = Image.open(_io.BytesIO(img_bytes)).convert('RGB')
    pw,ph = pimg.size; px = pimg.load()
    D=(78,105,119); G=(73,119,108)
    def dist(a,b): return abs(a[0]-b[0])+abs(a[1]-b[1])+abs(a[2]-b[2])
    mask=Image.new('L',(pw,ph),0); mp=mask.load()
    for y in range(ph):
        for x in range(pw):
            p=px[x,y]
            if dist(p,D)<50 or dist(p,G)<50: mp[x,y]=255
    mask2=mask.filter(ImageFilter.MaxFilter(3)); mp2=mask2.load()
    sx,sy=35,90
    # 从起点开始 BFS（起点本身可能不在通道上，找最近通道点）
    start=None
    for r in range(0,30):
        for ang in range(0,360,5):
            x=int(sx+r*math.cos(math.radians(ang))); y=int(sy+r*math.sin(math.radians(ang)))
            if 0<=x<pw and 0<=y<ph and mp2[x,y]>0: start=(x,y); break
        if start: break
    if not start: return None
    q=collections.deque([start]); par={start:None}; dm={start:0}
    while q:
        x,y=q.popleft()
        for dx in range(-1,2):
            for dy in range(-1,2):
                nx,ny=x+dx,y+dy
                if 0<=nx<pw and 0<=ny<ph and (nx,ny) not in dm and mp2[nx,ny]>0:
                    dm[(nx,ny)]=dm[(x,y)]+1; par[(nx,ny)]=(x,y); q.append((nx,ny))
    if not dm: return None
    end=max(dm.items(),key=lambda kv:kv[1])[0]
    # 回溯完整路径
    path=[]; cur=end
    while cur is not None:
        path.append(cur); cur=par[cur]
    path.reverse()
    return [(sx,sy)]+path, end

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        caps=[]
        async def on_resp(r):
            if '/__captcha/verify' in r.url:
                try: body=(await r.body()).decode('utf-8','replace')[:150]
                except: body=''
                caps.append((r.status, r.headers, body))
        page.on("response", on_resp)
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count()>0: await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        frame=None
        for f in page.frames:
            if '__captcha' in f.url: frame=f
        if not frame: print("NO_CAPTCHA"); return
        img_src = await (await frame.query_selector('img')).get_attribute('src')
        ib = await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        res = bfs_path(bytes(ib))
        if not res: print("NO_PATH"); return
        path,end = res
        print(f"像素级路径 {len(path)} 点, 终点 {end}")
        stage=await frame.query_selector('#dragStage'); bb=await stage.bounding_box()
        pw,ph=Image.open(_io.BytesIO(bytes(ib))).size
        scx=bb['width']/pw; scy=bb['height']/ph
        def ts(p_): return (bb['x']+p_[0]*scx, bb['y']+p_[1]*scy)
        # 真实鼠标拖拽，每 2 像素一点
        pts=[path[i] for i in range(0,len(path),2)]
        if pts[-1]!=path[-1]: pts.append(path[-1])
        s=ts(pts[0]); await page.mouse.move(s[0],s[1]); await page.wait_for_timeout(200)
        await page.mouse.down(); await page.wait_for_timeout(random.randint(80,150))
        for p_ in pts[1:]:
            q=ts(p_)
            await page.mouse.move(q[0],q[1],steps=1)
            await page.wait_for_timeout(random.randint(8,22))
        await page.wait_for_timeout(random.randint(60,120)); await page.mouse.up(); await page.wait_for_timeout(1200)
        btn=await frame.query_selector('#submitButton')
        st=await (await frame.query_selector('#dragStatus')).text_content()
        print("状态:",st,"disabled:",await btn.get_attribute('disabled'))
        await btn.click(); await page.wait_for_timeout(6000)
        for c in caps:
            print("VERIFY:", c[0], "| len(headers)", len(c[1]), "| body", c[2][:100])
            for k in ['set-cookie','location','x-dzmm-captcha']:
                if k in c[1]: print("   ", k, "=", c[1][k][:150])
        print("仍有captcha:", any('__captcha' in f.url for f in page.frames))
        await b.close()
asyncio.run(main())
