# scripts/burst.py  —— python burst.py <path> <cookie> <bodyFile> <n> <conc>
import sys, json, asyncio
from curl_cffi.requests import AsyncSession

path, cookie, body_file, n, conc = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
body = open(body_file, encoding="utf-8").read()

async def one(sess, i):
    r = await sess.post(
        "https://www.dzmm.ai" + path,
        headers={"cookie": cookie, "content-type": "application/json",
                 "x-dzmm-client": "web", "origin": "https://www.dzmm.ai",
                 "referer": "https://www.dzmm.ai/", "x-dzmm-request-id": f"burst-{i}-{id(sess)}"},
        data=body, impersonate="chrome", proxies={"https": "http://127.0.0.1:7897"}, timeout=60,
    )
    return r.status_code, r.text[:400]

async def main():
    sem = asyncio.Semaphore(conc)
    async with AsyncSession() as sess:
        async def run(i):
            async with sem:
                return await one(sess, i)
        res = await asyncio.gather(*(run(i) for i in range(n)))
    ok = sum(1 for s, _ in res if s == 200)
    lim = sum(1 for s, _ in res if s == 429)
    print(json.dumps({"n": n, "conc": conc, "ok": ok, "429": lim,
                      "other": n - ok - lim}, ensure_ascii=False))
    with open("out/burst.jsonl", "a", encoding="utf-8") as f:
        for s, t in res:
            f.write(json.dumps({"status": s, "body": t}, ensure_ascii=False) + "\n")

asyncio.run(main())
