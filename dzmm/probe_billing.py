# -*- coding: utf-8 -*-
"""计费探针：逐模型发一次极小请求（max_tokens=8），看余额变化，定位扣费规则。

用法:
  python probe_billing.py                 跑默认模型组
  python probe_billing.py <model> ...     只测指定模型
"""
import json
import sys
import time

HERE = __file__.rsplit("\\", 1)[0]
sys.path.insert(0, HERE)
import client as C
import unlimited as U

MODELS = [
    "nalang-turbo-1115-16k",     # 已知 0
    "x-apex-dash-0826-16k",      # 0.1
    "nalang-medium-0826-16k",    # 0.2
    "x-apex-surge-0923-b-16k",   # 0.4
]


def bal(acc):
    try:
        st, j = C.get_balance(acc["access_token"])
        if st == 200:
            return float(j[0]["result"]["data"]["json"].get("total") or 0)
        return None
    except Exception:
        return None


def quota(acc):
    try:
        st, j = C.get_quota(acc["access_token"])
        if st == 200:
            rows = j[0]["result"]["data"]["json"]
            for r in rows:
                if r.get("id") == "checkpoints":
                    return r.get("used")
    except Exception:
        pass
    return None


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    acc = {"access_token": real["access_token"], "user_id": real.get("user_id")}
    models = sys.argv[1:] or MODELS
    card = 3906371

    b0 = bal(acc)
    q0 = quota(acc)
    print("baseline balance=%s checkpoints_used=%s" % (b0, q0))
    print("%-26s %-8s %-8s %-10s %s" % ("model", "before", "after", "delta", "checkpoints"))

    prev = b0
    prevq = q0
    for m in models:
        ok, txt, cid = U.ask(acc, card, "1", model=m, max_tokens=8)
        time.sleep(1.2)
        b = bal(acc)
        q = quota(acc)
        d = None if (b is None or prev is None) else round(b - prev, 4)
        dq = None if (q is None or prevq is None) else q - prevq
        print("%-26s %-8s %-8s %-10s %s  ok=%s len=%d" % (
            m, prev, b, d, dq, ok, len(txt or "")))
        prev, prevq = b, q
        time.sleep(1.5)


if __name__ == "__main__":
    main()
