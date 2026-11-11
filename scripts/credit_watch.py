# scripts/credit_watch.py —— 额度回补观测
#
# 目的：验证 credit 会不会在每日 08:00（北京时间）检查点被回补。
# 做法：每 N 分钟对每个号打一次 user.getMe，把 credit 落盘；发生变化立刻打印差值。
#
# 用法:
#   python scripts/credit_watch.py                    # 默认 10 分钟一轮，一直跑
#   python scripts/credit_watch.py --interval 300 --rounds 40
#   python scripts/credit_watch.py --once             # 只采一次
#
# 产出:
#   out/credit_watch.jsonl   每条 {"ts","name","credit","delta"}
#   out/credit_watch.log     stdout（有变化才写关键行）
import argparse
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL = os.path.join(ROOT, "accounts.json")
OUT_DIR = os.path.join(ROOT, "out")
JSONL = os.path.join(OUT_DIR, "credit_watch.jsonl")
LOG = os.path.join(OUT_DIR, "credit_watch.log")

BASE = "https://www.dzmm.ai"
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")


def hhmm(ts=None):
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ts or time.time()))


def note(line):
    print(line, flush=True)
    try:
        os.makedirs(OUT_DIR, exist_ok=True)
        with io.open(LOG, "a", encoding="utf-8") as f:
            f.write(hhmm() + "  " + line + "\n")
    except Exception:
        pass


def headers(cookie):
    return {
        "accept": "*/*",
        "content-type": "application/json",
        "cookie": cookie,
        "origin": BASE,
        "referer": BASE + "/",
        "user-agent": UA,
        "x-dzmm-client": "web",
        "x-dzmm-locale": "zh-CN",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


def get_me(cookie):
    url = BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"
    r = creq.get(url, headers=headers(cookie), impersonate="chrome",
                 proxies={"http": PROXY, "https": PROXY} if PROXY else None, timeout=30)
    if r.status_code != 200:
        return None, "HTTP %s" % r.status_code
    data = json.loads(r.text)[0]["result"]["data"]["json"]
    if not data.get("isLoggedIn"):
        return None, "not logged in"
    return float(data.get("credit") or 0), ""


def sample(prev):
    pool = json.load(io.open(POOL, encoding="utf-8-sig"))
    rows = []
    for name, acc in pool.items():
        try:
            credit, err = get_me(acc["cookie"])
        except Exception as e:
            credit, err = None, "%s: %s" % (type(e).__name__, str(e)[:60])
        rec = {"ts": int(time.time()), "name": name, "credit": credit, "err": err}
        old = prev.get(name)
        if credit is not None and old is not None and abs(credit - old) > 0.005:
            rec["delta"] = round(credit - old, 2)
        rows.append(rec)
        if credit is not None:
            prev[name] = credit
        time.sleep(1.2)   # 防 418
    os.makedirs(OUT_DIR, exist_ok=True)
    with io.open(JSONL, "a", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=int, default=600, help="秒，默认 600")
    ap.add_argument("--rounds", type=int, default=0, help="0 = 一直跑")
    ap.add_argument("--once", action="store_true")
    args = ap.parse_args()

    prev = {}
    note("=== credit_watch 启动 interval=%ss ===" % args.interval)
    n = 0
    while True:
        n += 1
        try:
            rows = sample(prev)
        except Exception as e:
            note("采样异常: %s" % str(e)[:120])
            rows = []
        brief = " ".join(
            "%s=%s%s" % (r["name"],
                         "-" if r["credit"] is None else ("%.2f" % r["credit"]),
                         ("(%+.2f)" % r["delta"]) if "delta" in r else "")
            for r in rows
        )
        note("#%d %s" % (n, brief or "无数据"))
        for r in rows:
            if "delta" in r:
                note("  ⚠️ 变化: %s %+.2f → %.2f" % (r["name"], r["delta"], r["credit"]))
        if args.once or (args.rounds and n >= args.rounds):
            break
        time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
