import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright
from PIL import Image
import io as _io
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:1080"}

def channel_path(img_bytes):
    pimg = Image.open(_io.BytesIO(img_bytes)).convert('RGB')
    pw,ph = pimg.size; px = pimg.load()
    D=(78,105,119); G=(73,119,108)
    def dist(a,b): return abs(a[0]-b[0])+abs(a[1]-b[1])+abs(a[2]-b[2])
    from PIL import ImageFilter
    mask=Image.new('L',(pw,ph),0); mp=mask.load()
    for y in range(ph):
        for x in range(pw):
            p=px[x,y]
            if dist(p,D)<55 or dist(p,G)<55: mp[x,y]=255
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
    end=max(dm.items(), key=lambda kv: kv[1])[0]
    path=[]; cur=end
    while cur in dm and dm[cur]>0:
        path.append(cur); x,y=cur; nxt=None
        for dx in range(-1,2):
            for dy in range(-1,2):
                nx,ny=x+dx,y+dy
                if (nx,ny) in dm and dm[(nx,ny)]==dm[cur]-1:
                    nxt=(nx,ny); break
            if nxt: break
        if not nxt: break
        cur=nxt
    path.append(cur); path.reverse()
    sampled=[(sx,sy)]+[path[i] for i in range(0,len(path),2)]
    return sampled, end, len(dm)

async def one(page):
    await page.get_by_text("登录", exact=True).first.click(timeout=8000)
    await page.wait_for_timeout(2000)
    for label in ["以游客模式继续","游客登录","游客"]:
        el = page.get_by_text(label, exact=False).first
        if await el.count()>0: await el.click(timeout=5000); break
    await page.wait_for_timeout(5000)
    frame=None
    for f in page.frames:
        if '__captcha' in f.url: frame=f
    if not frame: return "NO_CAPTCHA"
    img_src=await (await frame.query_selector('img')).get_attribute('src')
    ib=await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
    res=channel_path(bytes(ib))
    if not res: return "NO_CHANNEL"
    path,end,n=res
    print(f"  路径点数{len(path)} 终点{end} 通道像素{n}")
    stage=await frame.query_selector('#dragStage'); bb=await stage.bounding_box()
    pw,ph=Image.open(_io.BytesIO(bytes(ib))).size
    sxx=bb['width']/pw; syy=bb['height']/ph
    def ts(px_,py_): return (bb['x']+px_*sxx, bb['y']+py_*syy)
    st=ts(path[0][0],path[0][1]); await page.mouse.move(st[0],st[1]); await page.wait_for_timeout(150)
    await page.mouse.down(); await page.wait_for_timeout(random.randint(60,140))
    for (px_,py_) in path[1:]:
        p2=ts(px_,py_)
        await page.mouse.move(p2[0]+random.uniform(-1,1), p2[1]+random.uniform(-1,1), steps=1)
        await page.wait_for_timeout(random.randint(6,26))
    await page.wait_for_timeout(random.randint(50,120)); await page.mouse.up(); await page.wait_for_timeout(1200)
    btn=await frame.query_selector('#submitButton')
    status=await (await frame.query_selector('#dragStatus')).text_content()
    dis=await btn.get_attribute('disabled')
    print(f"  状态:{status} dis:{dis}")
    if dis: return "BTN_DISABLED"
    caps=[]
    async def onr(r):
        if '/__captcha/verify' in r.url: caps.append(r.status)
    page.on("response",onr)
    await btn.click(); await page.wait_for_timeout(6000)
    print(f"  verify:{caps}")
    return "PASS" if not any('__captcha' in f.url for f in page.frames) else "FAIL"

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME,headless=False,proxy=PROXY,args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width":1280,"height":900})
        page=await ctx.new_page()
        await page.goto("https://dzmm.ai/",wait_until="domcontentloaded",timeout=60000)
        await page.wait_for_timeout(4500)
        for i in range(4):
            print(f"=== 尝试{i+1} ===")
            r=await one(page); print("结果:",r)
            if r=="PASS":
                await page.wait_for_timeout(3000)
                ls=await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))if(/token|auth|guest|mgwan/i.test(k))o[k]=localStorage.getItem(k).slice(0,200);return o}")
                print("TOKEN:",json.dumps(ls,ensure_ascii=False))
                me=await page.evaluate("fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
                print("getMe:",me[:400])
                break
            await page.wait_for_timeout(2000)
            for f in page.frames:
                if '__captcha' in f.url:
                    try: await f.get_by_text("换一张").first.click(timeout=3000)
                    except: pass
                    break
            await page.wait_for_timeout(2500)
        await b.close()
asyncio.run(main())
