# -*- coding: utf-8 -*-
"""
枚举 Clash 节点出口 IP，建立可用的「节点→IP」池
- 过滤失效节点
- 记录每个节点对应的出口 IP（去重后可并行/轮换）
- 结果写入 ip_pool.json

用法:
  python ip_pool.py           # 全量扫描（约 2-3 分钟）
  python ip_pool.py --fast    # 只测前 20 个
"""
import json
import os
import sys
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import clash_api as K
import client as C

OUT = os.path.join(HERE, "ip_pool.json")


def exit_ip(timeout=10):
    try:
        r = requests.get("https://api.ipify.org", proxies=C.PROXIES, timeout=timeout)
        if r.status_code == 200 and r.text.strip():
            return r.text.strip()
    except Exception:
        pass
    return None


def main():
    fast = "--fast" in sys.argv
    grp = "GLOBAL"
    for i, a in enumerate(sys.argv):
        if a == "--group" and i + 1 < len(sys.argv):
            grp = sys.argv[i + 1]
    ns = K.nodes(grp)
    print("扫描组:", grp)
    if fast:
        ns = ns[:20]
    print("待测节点 %d 个" % len(ns))
    rows = []
    for i, n in enumerate(ns):
        code, _ = K.switch("GLOBAL", n)
        time.sleep(2.2)
        ip = exit_ip()
        tag = "OK " if ip else "DEAD"
        print("[%2d/%d] %-26s %s %s" % (i + 1, len(ns), n[:26], tag, ip or ""))
        if ip:
            rows.append({"node": n, "ip": ip})
    # 按 IP 去重，保留每个 IP 的第一个节点
    seen = {}
    for r in rows:
        if r["ip"] not in seen:
            seen[r["ip"]] = r
    uniq = list(seen.values())
    # 与已有池合并（按 IP 去重），保留旧节点
    old = {"all": [], "unique": []}
    if os.path.exists(OUT):
        try:
            old = json.load(open(OUT, encoding="utf-8"))
        except Exception:
            pass
    merged = list(old.get("unique") or [])
    have = {x["ip"] for x in merged}
    for u in uniq:
        if u["ip"] not in have:
            merged.append(u)
            have.add(u["ip"])
    json.dump({"all": rows + (old.get("all") or []), "unique": merged,
               "scanned_at": int(time.time())},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    uniq = merged
    print("\n可用节点 %d，独立出口 IP %d" % (len(rows), len(uniq)))
    for u in uniq:
        print("  %-16s <- %s" % (u["ip"], u["node"][:28]))
    print("已保存", OUT)


if __name__ == "__main__":
    main()
