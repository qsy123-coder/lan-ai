
import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.async_api import async_playwright
from PIL import Image
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}
D=(78,105,119); G=(73,119,108); RC=(143,87,98)
def eq(p,c,t=25): return abs(p[0]-c[0])<=t and abs(p[1]-c[1])<=t and abs(p[2]-c[2])<=t

def analyze(img_bytes):
    im=Image.open(_io.BytesIO(img_bytes)).convert("RGB")
    w,h=im.size; px=im.load()
    def isch(p): return eq(p,D) or eq(p,G)
    allch=set((x,y) for y in range(h) for x in range(w) if isch(px[x,y]))
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
            circles.append((sum(p[0] for p in comp)//len(comp), sum(p[1] for p in comp)//len(comp)))
    best=None; bestn=0
    for (cx,cy) in circles:
        n=0
        for r in range(0,10):
            for ang in range(0,360,4):
                x=int(cx+r*math.cos(math.radians(ang))); y=int(cy+r*math.sin(math.radians(ang)))
                if 0<=x<w and 0<=y<h and isch(px[x,y]): n+=1
        if n>bestn: bestn=n; best=(cx,cy)
    return comps, circles, best, bestn

def build_path(comps, target):
    sx,sy=35,90
    def nearest(pt):
        return min(range(len(comps)), key=lambda i: min(math.hypot(p[0]-pt[0],p[1]-pt[1]) for p in comps[i]))
    chain=[nearest((sx,sy))]; used={chain[-1]}
    for _ in range(20):
        cur=chain[-1]
        if any(math.hypot(p[0]-target[0],p[1]-target[1])<22 for p in comps[cur]): break
        cand=(1e9,None)
        for j,c in enumerate(comps):
            if j in used: continue
            mn=min(math.hypot(p[0]-q[0],p[1]-q[1]) for p in comps[cur] for q in c)
            if mn<45 and mn<cand[0]: cand=(mn,j)
        if cand[1] is None: break
        chain.append(cand[1]); used.add(cand[1])
    full=[(sx,sy)]; curpt=(sx,sy)
    for oi in chain:
        c=comps[oi]; cs=set(c)
        start=min(c,key=lambda p: math.hypot(p[0]-curpt[0],p[1]-curpt[1]))
        ex=min(c,key=lambda p: math.hypot(p[0]-target[0],p[1]-target[1]))
        q=collections.deque([start]); par={start:None}
        while q:
            x,y=q.popleft()
            if (x,y)==ex: break
            for dx in range(-1,2):
                for dy in range(-1,2):
                    np=(x+dx,y+dy)
                    if np in cs and np not in par: par[np]=(x,y); q.append(np)
        if ex in par:
            seg=[]; cc=ex
            while cc is not None: seg.append(cc); cc=par[cc]
            seg.reverse(); full.extend(seg); curpt=ex
    full.append(target)
    return full, chain

async def dodrag(page, frame, path):
    stage=await frame.query_selector("#dragStage"); bb=await stage.bounding_box()
    scx=bb["width"]/320.0; scy=bb["height"]/180.0
    def ts(p_): return (bb["x"]+p_[0]*scx, bb["y"]+p_[1]*scy)
    pts=[path[i] for i in range(0,len(path),2)]+[path[-1]]
    s=ts(pts[0]); await page.mouse.move(s[0],s[1]); await page.wait_for_timeout(200)
    await page.mouse.down(); await page.wait_for_timeout(random.randint(80,150))
    for p_ in pts[1:]:
        q=ts(p_); await page.mouse.move(q[0],q[1],steps=1); await page.wait_for_timeout(random.randint(8,20))
    await page.wait_for_timeout(100); await page.mouse.up(); await page.wait_for_timeout(1000)
    return await frame.query_selector("#submitButton")

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
        for attempt in range(8):
            frame=None
            for f in page.frames:
                if "__captcha" in f.url: frame=f
            if not frame:
                print("[%d] 无captcha"%attempt)
                ls=await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|mgwan|guest/i.test(k))o[k]=localStorage.getItem(k).slice(0,150);return o}")
                print("TOKEN:",json.dumps(ls,ensure_ascii=False)); break
            img_src=await (await frame.query_selector("img")).get_attribute("src")
            ib=await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
            comps,circles,target,bn=analyze(bytes(ib))
            if not target or bn<10:
                print("[%d] 终点不明(bestn=%d) 换图"%(attempt,bn))
                try: await frame.get_by_text("换一张").first.click(timeout=3000)
                except: pass
                await page.wait_for_timeout(2500); continue
            path,chain=build_path(comps,target)
            print("[%d] 域%d 链%s 目标%s 路径%d点"%(attempt,len(comps),chain,target,len(path)))
            open("attempt_%d.png"%attempt,"wb").write(bytes(ib))
            btn=await dodrag(page,frame,path)
            stats=await (await frame.query_selector("#dragStatus")).text_content()
            print("  状态: "+stats)
            await btn.click(); await page.wait_for_timeout(5500)
            if not any("__captcha" in f.url for f in page.frames):
                print("=== 验证码通过 ===")
                await page.wait_for_timeout(3000)
                ls=await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|mgwan|guest/i.test(k))o[k]=localStorage.getItem(k).slice(0,200);return o}")
                print("TOKEN:",json.dumps(ls,ensure_ascii=False))
                me=await page.evaluate("fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
                print("getMe:",me[:400])
                break
            print("  verify 失败")
            for f in page.frames:
                if "__captcha" in f.url:
                    try: await f.get_by_text("换一张").first.click(timeout=3000)
                    except: pass
            await page.wait_for_timeout(2500)
        await b.close()
asyncio.run(main())
