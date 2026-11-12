# scripts/probe_core.py —— 抓核心数据结构：模型表 / 消息 / 卡定义 / 语音 / 任务
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
CHAT = "e5a278ec-432f-47a3-95af-7cd398e03044"
CARD = 3821218

H = {"accept": "*/*", "cookie": COOKIE, "origin": BASE, "referer": BASE + "/",
     "user-agent": UA, "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
     "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin"}

TARGETS = [
    ("chat.models", {"service": "chat"}),
    ("chat.getMessages", {"chatId": CHAT}),
    ("card.getForChat", {"cardId": CARD, "chatId": CHAT}),
    ("studio.getVoices", None),
    ("bountyQuest.myClaims", None),
    ("chat.cardRefusalNotice", {"cardId": str(CARD)}),
    ("chat.getSettings", {"chatId": CHAT}),
]


def call(proc, inp):
    payload = {"0": {"json": inp}}
    url = "%s/api/trpc/%s?batch=1&input=%s" % (BASE, proc, quote(json.dumps(payload)))
    r = creq.get(url, headers=H, impersonate="chrome", proxies=PROXY, timeout=45)
    return r


os.makedirs(OUT, exist_ok=True)
for proc, inp in TARGETS:
    try:
        r = call(proc, inp)
    except Exception as e:
        print("%-24s ERR %s" % (proc, type(e).__name__))
        continue
    print("%-24s %s %d bytes" % (proc, r.status_code, len(r.text or "")))
    if r.status_code == 200:
        try:
            data = json.loads(r.text)[0]["result"]["data"]["json"]
            with io.open(os.path.join(OUT, proc + ".json"), "w", encoding="utf-8", newline="\n") as f:
                json.dump(data, f, ensure_ascii=False, indent=1)
            if isinstance(data, list):
                print("    list[%d] keys=%s" % (len(data), sorted(data[0].keys())[:18] if data else []))
            elif isinstance(data, dict):
                print("    obj keys=%s" % sorted(data.keys())[:18])
        except Exception as e:
            print("    parse err", str(e)[:80], (r.text or "")[:120])
    else:
        print("    head:", (r.text or "")[:120])
    time.sleep(1.3)
