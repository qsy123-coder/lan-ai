import asyncio, json, sys, io, math, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.async_api import async_playwright
from PIL import Image
import io as _io

CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PROXY = {"server": "socks5://127.0.0.1:7897"}
D = (78, 105, 119); G = (73, 119, 108); RC = (143, 87, 98)

def eq(p, c, t=25):
    return abs(p[0]-c[0]) <= t and abs(p[1]-c[1]) <= t and abs(p[2]-c[2]) <= t

def analyze(img_bytes):
    im = Image.open(_io.BytesIO(img_bytes)).convert("RGB")
    w, h = im.size; px = im.load()
    def isch(p): return eq(p, D) or eq(p, G)
    allch = set((x, y) for y in range(h) for x in range(w) if isch(px[x, y]))
    seen = set(); comps = []
    for p in allch:
        if p in seen: continue
        q = collections.deque([p]); seen.add(p); comp = []
        while q:
            x, y = q.popleft(); comp.append((x, y))
            for dx in range(-1, 2):
                for dy in range(-1, 2):
                    np = (x+dx, y+dy)
                    if np in allch and np not in seen:
                        seen.add(np); q.append(np)
        if len(comp) > 25: comps.append(comp)
    reds = [(x, y) for y in range(h) for x in range(w) if eq(px[x, y], RC)]
    rs = set(); circles = []
    for p in reds:
        if p in rs: continue
        q = collections.deque([p]); rs.add(p); comp = []
        while q:
            x, y = q.popleft(); comp.append((x, y))
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    np = (x+dx, y+dy)
                    if np in reds and np not in rs:
                        rs.add(np); q.append(np)
        if len(comp) > 200:
            circles.append((sum(p[0] for p in comp)//len(comp), sum(p[1] for p in comp)//len(comp)))
    sx, sy = 35, 90
    start_i = min(range(len(comps)), key=lambda i: min(math.hypot(p[0]-sx, p[1]-sy) for p in comps[i]))
    chain = [start_i]; used = {start_i}
    for _ in range(30):
        cur = chain[-1]; best = (1e9, None)
        for j in range(len(comps)):
            if j in used: continue
            mn = min(math.hypot(p[0]-q[0], p[1]-q[1]) for p in comps[cur] for q in comps[j])
            if mn < 50 and mn < best[0]: best = (mn, j)
        if best[1] is None: break
        chain.append(best[1]); used.add(best[1])
    last = comps[chain[-1]]; cs = set(last)
    entry = min(last, key=lambda p: math.hypot(p[0]-sx, p[1]-sy))
    qq = collections.deque([entry]); dm = {entry: 0}
    while qq:
        x, y = qq.popleft()
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                np = (x+dx, y+dy)
                if np in cs and np not in dm:
                    dm[np] = dm[(x, y)]+1; qq.append(np)
    far = max(dm.items(), key=lambda kv: kv[1])[0] if dm else entry
    tgt = None; bestd = 1e9
    for (cx, cy) in circles:
        d = math.hypot(far[0]-cx, far[1]-cy)
        if d < bestd: bestd = d; tgt = (cx, cy)
    return comps, chain, far, tgt, bestd

def build_path(comps, chain, tgt):
    sx, sy = 35, 90
    full = [(sx, sy)]; curpt = (sx, sy)
    for oi in chain:
        c = comps[oi]; cs = set(c)
        start = min(c, key=lambda p: math.hypot(p[0]-curpt[0], p[1]-curpt[1]))
        ex = min(c, key=lambda p: math.hypot(p[0]-tgt[0], p[1]-tgt[1]))
        q = collections.deque([start]); par = {start: None}
        while q:
            x, y = q.popleft()
            if (x, y) == ex: break
            for dx in range(-1, 2):
                for dy in range(-1, 2):
                    np = (x+dx, y+dy)
                    if np in cs and np not in par:
                        par[np] = (x, y); q.append(np)
        if ex in par:
            seg = []; cc = ex
            while cc is not None:
                seg.append(cc); cc = par[cc]
            seg.reverse(); full.extend(seg); curpt = ex
    full.append(tgt)
    return full

async def dodrag(page, frame, path):
    stage = await frame.query_selector("#dragStage")
    bb = await stage.bounding_box()
    scx = bb["width"]/320.0; scy = bb["height"]/180.0
    def ts(p_): return (bb["x"]+p_[0]*scx, bb["y"]+p_[1]*scy)
    pts = [path[i] for i in range(0, len(path), 2)]+[path[-1]]
    s = ts(pts[0])
    await page.mouse.move(s[0], s[1]); await page.wait_for_timeout(200)
    await page.mouse.down(); await page.wait_for_timeout(random.randint(90, 160))
    for p_ in pts[1:]:
        q = ts(p_)
        await page.mouse.move(q[0], q[1], steps=1)
        await page.wait_for_timeout(random.randint(8, 18))
    await page.wait_for_timeout(120); await page.mouse.up()
    await page.wait_for_timeout(1000)
    return await frame.query_selector("#submitButton")

async def solve_captcha_if_present(page, tries=12):
    for attempt in range(tries):
        frame = None
        for f in page.frames:
            if "__captcha" in f.url: frame = f
        if not frame:
            return True
        img_src = await (await frame.query_selector("img")).get_attribute("src")
        ib = await frame.evaluate("async(s)=>{const r=await fetch(s);const b=await r.blob();return Array.from(new Uint8Array(await b.arrayBuffer()));}", img_src)
        comps, chain, far, tgt, bd = analyze(bytes(ib))
        print("  [captcha %d] 域%d 末端%s tgt%s d=%.0f" % (attempt, len(comps), far, tgt, bd))
        if not tgt or bd > 40:
            try:
                await frame.get_by_text("换一张").first.click(timeout=3000)
            except Exception:
                pass
            await page.wait_for_timeout(2000); continue
        path = build_path(comps, chain, tgt)
        btn = await dodrag(page, frame, path)
        await btn.click(); await page.wait_for_timeout(5000)
        if not any("__captcha" in f.url for f in page.frames):
            print("  CAPTCHA OK")
            return True
        for f in page.frames:
            if "__captcha" in f.url:
                try:
                    await f.get_by_text("换一张").first.click(timeout=3000)
                except Exception:
                    pass
        await page.wait_for_timeout(2000)
    return False

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=False, proxy=PROXY,
                                    args=["--no-sandbox", "--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36", viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()
        await page.goto("https://dzmm.ai/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4500)
        await page.get_by_text("登录", exact=True).first.click(timeout=8000)
        await page.wait_for_timeout(2000)
        for label in ["以游客模式继续", "游客登录", "游客"]:
            el = page.get_by_text(label, exact=False).first
            if await el.count() > 0:
                await el.click(timeout=5000); break
        await page.wait_for_timeout(5000)
        ok = await solve_captcha_if_present(page)
        print("captcha solve:", ok)
        await page.wait_for_timeout(3000)

        # dump cookies
        cookies = await ctx.cookies()
        print("\n=== COOKIES ===")
        for c in cookies:
            if "dzmm" in c["domain"]:
                print("  %s = %s" % (c["name"], c["value"][:80]))
        # dump localStorage
        ls = await page.evaluate("()=>{let o={};for(let k of Object.keys(localStorage))o[k]=localStorage.getItem(k).slice(0,300);return o}")
        print("\n=== LOCALSTORAGE ===")
        for k, v in ls.items():
            print("  %s = %s" % (k, v))
        # getMe
        me = await page.evaluate("fetch('/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n=== getMe ===\n", me[:900])
        # quota overview
        q1 = await page.evaluate("fetch('/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n=== credits.getBalance ===\n", q1[:600])
        q2 = await page.evaluate("fetch('/api/trpc/credits.getQuotaOverview?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n=== credits.getQuotaOverview ===\n", q2[:1500])
        # api token
        q3 = await page.evaluate("fetch('/api/trpc/user.getApiToken?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D').then(r=>r.text())")
        print("\n=== user.getApiToken ===\n", q3[:800])
        # save everything
        dump = {"cookies": [{"n": c["name"], "v": c["value"], "d": c["domain"]} for c in cookies],
                "localStorage": ls, "getMe": me, "balance": q1, "quota": q2, "apiToken": q3}
        open("session_dump.json", "w", encoding="utf-8").write(json.dumps(dump, ensure_ascii=False, indent=1))
        print("\n=== saved session_dump.json ===")
        # keep browser open a bit
        await page.wait_for_timeout(2000)
        await b.close()

asyncio.run(main())
