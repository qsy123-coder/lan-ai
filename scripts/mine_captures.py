# scripts/mine_captures.py —— 从历史抓包里汇总真实 API 面（路径 / 入参 / 返回结构）
import glob
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "captures", "api_surface.json")

rows = []
for p in glob.glob(os.path.join(ROOT, "captures", "*", "trpc.jsonl")):
    for line in io.open(p, encoding="utf-8"):
        try:
            r = json.loads(line)
        except Exception:
            continue
        rows.append(r)

rows.sort(key=lambda r: r.get("t", 0))
print("captured requests:", len(rows))

by_path = {}
for r in rows:
    path = r.get("path", "")
    key = re.sub(r"\?.*$", "", path)
    slot = by_path.setdefault(key, {"hits": 0, "status": {}, "req": None, "resp": None})
    slot["hits"] += 1
    st = r.get("status")
    slot["status"][st] = slot["status"].get(st, 0) + 1
    if slot["req"] is None and r.get("req_body"):
        slot["req"] = r["req_body"][:600]
    if slot["resp"] is None and r.get("resp_body"):
        slot["resp"] = r["resp_body"][:1200]

# 响应结构骨架（字段名 + 类型），帮助还原数据模型
def skeleton(s):
    try:
        j = json.loads(s)
    except Exception:
        return s[:120]
    def walk(x, d=0):
        if d > 4:
            return "…"
        if isinstance(x, dict):
            return {k: walk(v, d + 1) for k, v in list(x.items())[:26]}
        if isinstance(x, list):
            return [walk(x[0], d + 1)] if x else []
        if isinstance(x, str):
            return x[:40]
        return x
    return walk(j)

res = {}
for k, v in sorted(by_path.items()):
    res[k] = {
        "hits": v["hits"],
        "status": v["status"],
        "req_sample": v["req"],
        "resp_shape": skeleton(v["resp"]) if v["resp"] else None,
    }

os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(json.dumps(res, ensure_ascii=False, indent=1))
print("unique endpoints:", len(res))
for k in sorted(res):
    print("  %-58s hits=%-3d %s" % (k[:58], res[k]["hits"], res[k]["status"]))
print("→", OUT)
