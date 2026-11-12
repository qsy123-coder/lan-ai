# scripts/probe_cards.py —— 抓首页卡片流 + 卡片完整字段 + 卡详情
import io, json, os, time
from urllib.parse import quote
from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "captures", "site", "api")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
pool = json.load(io.open(os.path.join(ROOT, "accounts.json"), encoding="utf-8-sig"))
COOKIE = pool["g01"]["cookie"]
H = {"accept": "*/*", "cookie": COOKIE, "origin": BASE, "referer": BASE + "/",
     "user-agent": UA, "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
     "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin"}


def trpc_get(proc, inp):
    url = "%s/api/trpc/%s?batch=1&input=%s" % (BASE, proc, quote(json.dumps({"0": {"json": inp}})))
    r = creq.get(url, headers=H, impersonate="chrome", proxies=PROXY, timeout=45)
    return r


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    with io.open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


# 入参只认 {"type": ...}。合法值见 notes/010 §1；多传字段会 400。
for t in ("highest_rated_7d", "highest_rated_30d", "highest_rated_all", "games"):
    inp = {"type": t}
    r = trpc_get("home.getCards", inp)
    print("home.getCards", t, r.status_code, len(r.text))
    if r.status_code == 200:
        data = json.loads(r.text)[0]["result"]["data"]["json"]
        cards = data if isinstance(data, list) else data.get("cards", [])
        print("   cards:", len(cards))
        if cards:
            save("home.getCards_%s.json" % t, cards)
            print("   fields:", sorted(cards[0].keys()))
            c0 = cards[0]
            print("   sample:", json.dumps({k: (str(v)[:60]) for k, v in list(c0.items())[:18]},
                                           ensure_ascii=False))
    time.sleep(1.2)

# 卡片详情：试几个可能的 procedure
CARD = 3821218
for proc, inp in [
    ("card.getById", {"cardId": CARD}),
    ("card.get", {"id": CARD}),
    ("card.detail", {"cardId": CARD}),
    ("card.getForChat", {"chatId": None}),
    ("chatroom.getPreview", {"chatId": None}),
]:
    try:
        r = trpc_get(proc, inp)
        head = (r.text or "")[:180].replace("\n", " ")
        print("%-22s %s %s" % (proc, r.status_code, head))
        if r.status_code == 200:
            try:
                save(proc.replace(".", "_") + ".json", json.loads(r.text)[0]["result"]["data"]["json"])
            except Exception:
                pass
    except Exception as e:
        print(proc, "ERR", type(e).__name__)
    time.sleep(1.2)
