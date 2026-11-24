import asyncio, json, sys, io, math, random
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image
import io as _io, collections
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

def trace_json(sx,sy,tx,ty,steps=40):
    pts=[]
    for i in range(steps+1):
        t=i/steps
        e=1-(1-t)**3
        x=sx+(tx-sx)*e; y=sy+(ty-sy)*e
        if 3<i<steps-3:
            x+=random.uniform(-1,1); y+=random.uniform(-1,1)
        pts.append({"x":round(x,1),"y":round(y,1),"t":i*random.randint(8,25)})
    return pts

async def analyze_channel(img_bytes):
    pimg = Image.open(_io.BytesIO(img_bytes)).convert('RGB')
    pw,ph = pimg.size; px = pimg.load()
    D=(78,105,119); G=(73,119,108)
    def isch(p): return (abs(p[0]-D[0])<=40 and abs(p[1]-D[1])<=40 and abs(p[2]-D[2])<=40) or (abs(p[0]-G[0])<=40 and abs(p[1]-G[1])<=40 and abs(p[2]-G[2])<=40)
    sx,sy=35,90
    seeds=set()
    for r in range(3,20):
        for ang in range(0,360,3):
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
    xs=[p[0] for p in seen]; ys=[p[1] for p in seen]
    return (max(xs), sum(y for x,y in seen if x==max(xs))//max(1,len([1 for x,y in seen if x==max(xs)])), len(seen))

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
        imgid = img_src.split('id=')[1]
        img_bytes = await frame.evaluate("async(src)=>{const r=await fetch(src);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        tx,ty,n = await analyze_channel(bytes(img_bytes))
        print(f"图片分析: 终点({tx},{ty}) 像素{n}")
        # 测试多个终点：正确终点 + 右侧其他位置
        candidates = [(tx,ty), (tx,40), (tx,150), (tx,90), (300,90), (300,ty)]
        for ci,(cx,cy) in enumerate(candidates):
            tr = trace_json(35,90,cx,cy)
            # 直接在 iframe 内 fetch verify
            res = await frame.evaluate("""async ({id,next,embed,theme,trace}) => {
                const fd = new URLSearchParams();
                fd.append('id', id); fd.append('next', next); fd.append('embed', embed);
                fd.append('theme', theme); fd.append('trace', JSON.stringify(trace));
                const r = await fetch('/__captcha/verify', {method:'POST', body: fd, headers:{'Content-Type':'application/x-www-form-urlencoded'}});
                return {status: r.status, body: (await r.text()).slice(0,300), url: r.url};
            }""", {"id":imgid,"next":"/api/health?captcha_completed=1","embed":"1","theme":"light","trace":tr})
            print(f"候选{ci} 终点({cx},{cy}):", json.dumps(res, ensure_ascii=False))
            await page.wait_for_timeout(500)
        await browser.close()
asyncio.run(main())
