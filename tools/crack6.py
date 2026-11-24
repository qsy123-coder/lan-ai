import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}

D=(78,105,119); G=(73,119,108); RC=(143,87,98)
def eq(p,c,t=25): return abs(p[0]-c[0])<=t and abs(p[1]-c[1])<=t and abs(p[2]-c[2])<=t

def solve(img_bytes):
    im = Image.open(_io.BytesIO(img_bytes)).convert('RGB')
    w,h = im.size; px = im.load()
    def isch(p): return eq(p,D) or eq(p,G)
    allch = set((x,y) for y in range(h) for x in range(w) if isch(px[x,y]))
    # 连通域
    seen=set(); comps=[]
    for p in allch:
        if p in seen: continue
        q=collections.deque([p]); seen.add(p); comp=[]
        while q:
            x,y=q.popleft(); comp.append((x,y))
            for dx in range(-1,2):
                for dy in range(-1,2):
                    np=(x+dx,y+dy)
                    if np in allch and np not in seen: seen.add(np); q.append(np)
        if len(comp)>25: comps.append(comp)
    # 红圆
    reds=[(x,y) for y in range(h) for x in range(w) if eq(px[x,y],RC)]
    rs=set(); circles=[]
    for p in reds:
        if p in rs: continue
        q=collections.deque([p]); rs.add(p); comp=[]
        while q:
            x,y=q.popleft(); comp.append((x,y))
            for dx in range(-2,3):
                for dy in range(-2,3):
                    np=(x+dx,y+dy)
                    if np in reds and np not in rs: rs.add(np); q.append(np)
        if len(comp)>200:
            cx=sum(p[0] for p in comp)//len(comp); cy=sum(p[1] for p in comp)//len(comp)
            circles.append((cx,cy))
    # 唯一真终点：圆内有通道像素
    target=None
    for (cx,cy) in circles:
        n=0
        for r in range(0,10):
            for ang in range(0,360,4):
                x=int(cx+r*math.cos(math.radians(ang))); y=int(cy+r*math.sin(math.radians(ang)))
                if 0<=x<w and 0<=y<h and isch(px[x,y]): n+=1
        if n>10: target=(cx,cy)
    if not target: return None
    # 域端点
    def endpoints(comp):
        cs=set(comp)
        def bfs(s):
            q=collections.deque([s]); dist={s:0}; far=s
            while q:
                x,y=q.popleft()
                if dist[(x,y)]>dist[far]: far=(x,y)
                for dx in range(-1,2):
                    for dy in range(-1,2):
                        np=(x+dx,y+dy)
                        if np in cs and np not in dist: dist[np]=dist[(x,y)]+1; q.append(np)
            return far,dist
        a,_=bfs(comp[0]); b,dist=bfs(a)
        return a,b,dist
    eps=[endpoints(c) for c in comps]
    # 起点最近的域
    sx,sy=35,90
    def nearest_comp(pt):
        best=(1e9,None)
        for i,c in enumerate(comps):
            for p in c:
                d=math.hypot(p[0]-pt[0],p[1]-pt[1])
                if d<best[0]: best=(d,i)
        return best[1]
    order=[nearest_comp((sx,sy))]
    # 贪心链接到目标
    cur=order[0]; used={cur}
    while True:
        # 当前域离目标最近的端点
        ci=comps[cur]; a,b,dist=eps[cur]
        # 找当前域中离上一个点近的端点
        # 计算当前域所有点中离目标最近距离
        bestnext=(1e9,None)
        for j,c in enumerate(comps):
            if j in used: continue
            # 域间最小距离
            mn=1e9
            for p in ci:
                for q in c:
                    dd=math.hypot(p[0]-q[0],p[1]-q[1])
                    if dd<mn: mn=dd
            if mn<40 and mn<bestnext[0]: bestnext=(mn,j)
        if not bestnext[1]: break
        order.append(bestnext[1]); used.add(bestnext[1]); cur=bestnext[1]
        if any(math.hypot(p[0]-target[0],p[1]-target[1])<25 for p in comps[cur]): break
    # 生成路径：逐域 BFS 最短路
    full=[(sx,sy)]
    curpt=(sx,sy)
    for oi in order:
        c=comps[oi]; cs=set(c)
        # 进入点 = 离 curpt 最近
        start=min(c, key=lambda p: math.hypot(p[0]-curpt[0],p[1]-curpt[1]))
        # 出口 = 域内离目标(或下一域/红圆)最近
        exitp=min(c, key=lambda p: math.hypot(p[0]-target[0],p[1]-target[1]))
        # BFS start->exitp
        q=collections.deque([start]); par={start:None}
        while q:
            x,y=q.popleft()
            if (x,y)==exitp: break
            for dx in range(-1,2):
                for dy in range(-1,2):
                    np=(x+dx,y+dy)
                    if np in cs and np not in par: par[np]=(x,y); q.append(np)
        if exitp in par:
            seg=[]; cur2=exitp
            while cur2 is not None: seg.append(cur2); cur2=par[cur2]
            seg.reverse()
            full.extend(seg)
            curpt=exitp
    full.append(target)
    return full, target, len(comps)

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME,headless=False,proxy=PROXY,args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page=await ctx.new_page()
        await page.goto("https://dzmm.ai/",wait_until="domcontentloaded",timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录",exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续","游客登录","游客"]:
            el=page.get_by_text(label,exact=False).first
            if await el.count()>0: await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        frame=None
        for f in page.frames:
            if '__captcha' in f.url: frame=f
        if not frame: print("NO_CAPTCHA"); return
        img_src=await (await frame.query_selector('img')).get_attribute('src')
        ib=await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        res=solve(bytes(ib))
        if not res: print("SOLVE_FAIL"); return
        path,target,ncomp=res
        print(f"路径{len(path)}点 目标{target} 域数{ncomp}")
        open('latest.png','wb').write(bytes(ib))
        stage=await frame.query_selector('#dragStage'); bb=await stage.bounding_box()
        pw,ph=Image.open(_io.BytesIO(bytes(ib))).size
        scx=bb['width']/pw; scy=bb['height']/ph
        def ts(p_): return (bb['x']+p_[0]*scx, bb['y']+p_[1]*scy)
        pts=[path[i] for i in range(0,len(path),2)]+[path[-1]]
        s=ts(pts[0]); await page.mouse.move(s[0],s[1]); await page.wait_for_timeout(200)
        await page.mouse.down(); await page.wait_for_timeout(random.randint(80,150))
        for p_ in pts[1:]:
            q=ts(p_); await page.mouse.move(q[0],q[1],steps=1); await page.wait_for_timeout(random.randint(8,22))
        await page.wait_for_timeout(100); await page.mouse.up(); await page.wait_for_timeout(1200)
        btn=await frame.query_selector('#submitButton')
        print("状态:", await (await frame.query_selector('#dragStatus')).text_content())
        await btn.click(); await page.wait_for_timeout(6000)
        still=any('__captcha' in f.url for f in page.frames)
        print("仍有captcha:", still)
        if not still:
            ls=await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|mgwan|guest/i.test(k))o[k]=localStorage.getItem(k).slice(0,150);return o}")
            print("TOKEN:", json.dumps(ls, ensure_ascii=False))
        await b.close()
asyncio.run(main())
