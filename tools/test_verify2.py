import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image, ImageFilter
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}

def channel(img_bytes):
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
    seeds=set()
    for r in range(3,26):
        for ang in range(0,360,2):
            x=int(sx+r*math.cos(math.radians(ang))); y=int(sy+r*math.sin(math.radians(ang)))
            if 0<=x<pw and 0<=y<ph and mp2[x,y]>0: seeds.add((x,y))
    q=collections.deque(); dm={}
    for s in seeds: q.append(s); dm[s]=0
    while q:
        x,y=q.popleft()
        for dx in range(-1,2):
            for dy in range(-1,2):
                nx,ny=x+dx,y+dy
                if 0<=nx<pw and 0<=ny<ph and (nx,ny) not in dm and mp2[nx,ny]>0:
                    dm[(nx,ny)]=dm[(x,y)]+1; q.append((nx,ny))
    if not dm: return None
    end=max(dm.items(),key=lambda kv:kv[1])[0]
    # 通道中心线（每列取中心）
    xs=sorted(set(x for x,y in dm)); line=[]
    for x in range(min(xs),max(xs)+1,3):
        ys=[y for (xx,y) in dm if xx==x]
        if ys: line.append((x,sum(ys)//len(ys)))
    return line, end

def gen_trace(line, steps_each=1):
    tr=[]
    for i,(x,y) in enumerate(line):
        tr.append({"x":round(x,1),"y":round(y,1),"t":i*random.randint(15,30)})
    return tr

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page = await ctx.new_page()
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
        line,end = channel(bytes(ib))
        print(f"通道中心线{len(line)}点 终点{end}")
        # 测试：终点 = 中心线末端（不膨胀的原始通道末端）
        # 候选终点：end(BFS最远) + 中心线最后一个点 + 通道bbox最右
        cands = [end, line[-1], (max(x for x,y in line), [y for x,y in line if x==max(xx for xx,yy in line)][0])]
        seen_endpoints = set()
        for ci,ep in enumerate(cands):
            if ep in seen_endpoints: continue
            seen_endpoints.add(ep)
            # 生成到 ep 的轨迹：截断中心线到 ep
            ex,ey = ep
            subline = [(x,y) for x,y in line if x<=ex]
            if not subline: subline = line
            tr = gen_trace(subline)
            # 用 form.submit 提交
            res = await frame.evaluate("""async ({trace}) => {
                const inp = document.getElementById('dragTrace');
                inp.value = JSON.stringify(trace);
                const form = document.getElementById('captchaForm');
                const r = await fetch(form.action, {method:'POST', body: new URLSearchParams(new FormData(form)), headers:{'Content-Type':'application/x-www-form-urlencoded'}});
                return {status:r.status, ct:r.headers.get('content-type'), body:(await r.text()).slice(0,200)};
            }""", {"trace":tr})
            print(f"候选{ci} 终点{ep}: status={res['status']} {res['body'][:120]}")
            await page.wait_for_timeout(800)
        await b.close()
asyncio.run(main())
