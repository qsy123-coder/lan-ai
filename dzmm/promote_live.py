# -*- coding: utf-8 -*-
"""把 accounts.json 里新注册的号并进 accounts.live.json（带积分），供付费模型使用。

用法:
  python promote_live.py            # 扫描最近 30 个号
  python promote_live.py 80         # 扫描最近 80 个号
  python promote_live.py --all      # 全池（慢，可能触发风控）
"""
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor

HERE = __file__.rsplit("\\", 1)[0]
sys.path.insert(0, HERE)
import client as C

POOL = "accounts.json"
LIVE = "accounts.live.json"


def probe(a):
    tok = a.get("access_token")
    if not tok:
        return None
    try:
        st, j = C.get_balance(tok)
        if st == 200:
            return {"access_token": tok, "user_id": a.get("user_id"),
                    "email": a.get("email"), "password": a.get("password"),
                    "refresh_token": a.get("refresh_token"),
                    "credit": float(j[0]["result"]["data"]["json"].get("total") or 0)}
    except Exception:
        pass
    return None


def main():
    n = 30
    if "--all" in sys.argv:
        n = 10 ** 9
    elif len(sys.argv) > 1 and sys.argv[1].isdigit():
        n = int(sys.argv[1])

    pool = json.load(open(POOL, encoding="utf-8"))
    pool.sort(key=lambda a: -(a.get("created_at") or 0))
    cand = pool[:n]

    try:
        live = json.load(open(LIVE, encoding="utf-8"))
    except Exception:
        live = []
    known = {(x.get("email") or x.get("user_id")) for x in live}

    todo = [a for a in cand if (a.get("email") or a.get("user_id")) not in known]
    print("候选 %d，新增待测 %d" % (len(cand), len(todo)))

    with ThreadPoolExecutor(max_workers=8) as ex:
        res = [r for r in ex.map(probe, todo) if r]

    live.extend(res)
    live.sort(key=lambda x: -(x.get("credit") or 0))
    json.dump(live, open(LIVE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    total = sum(x.get("credit") or 0 for x in live)
    print("活号 %d 个，总积分 %.2f" % (len(live), total))
    for x in live[:8]:
        print("  %-14s %8.2f" % ((x.get("user_id") or "?")[:13], x.get("credit") or 0))


if __name__ == "__main__":
    main()
