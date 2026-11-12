# scripts/diff-quota.py —— python diff-quota.py captures/YYYYMMDD-HHMM/trpc.jsonl
# 把一次会话里 chat.getQuotas / credits.getBalance 的返回抽成前后对比表，
# 用来定位"扣减发生在哪个响应之后"（判定点 = 它前面那个 handler）。
import io
import json
import os
import sys


def walk(node, key):
    """在任意嵌套结构里找第一个同名 key（superjson 的 json 字段已展开）。"""
    if isinstance(node, dict):
        if key in node:
            return node[key]
        for v in node.values():
            got = walk(v, key)
            if got is not None:
                return got
    elif isinstance(node, list):
        for v in node:
            got = walk(v, key)
            if got is not None:
                return got
    return None


def main(path):
    rows = []
    if not os.path.exists(path):
        print("file not found:", path)
        print("先跑 capture.py 抓一轮，再指向 captures/<时间>/trpc.jsonl")
        return
    with io.open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            p = rec.get("path", "")
            if "getQuotas" not in p and "getBalance" not in p:
                continue
            try:
                data = json.loads(rec.get("resp_body") or "{}")
            except json.JSONDecodeError:
                continue
            rows.append(
                {
                    "status": rec.get("status"),
                    "proc": "getQuotas" if "getQuotas" in p else "getBalance",
                    "used": walk(data, "used"),
                    "limit": walk(data, "limit"),
                    "remaining": walk(data, "remaining"),
                    "credits": walk(data, "credits") or walk(data, "balance"),
                }
            )

    if not rows:
        print("no getQuotas/getBalance in", path)
        return

    w = "{:<10} {:>4} {:>6} {:>6} {:>10} {:>10}"
    print(w.format("proc", "st", "used", "limit", "remaining", "credits"))
    prev = None
    for r in rows:
        delta = ""
        if prev is not None and prev["proc"] == r["proc"] and prev["used"] != r["used"]:
            delta = "  <- used {} -> {}".format(prev["used"], r["used"])
        print(
            w.format(
                r["proc"],
                r["status"],
                r["used"],
                r["limit"],
                r["remaining"],
                r["credits"],
            )
            + delta
        )
        prev = r


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "captures/latest/trpc.jsonl")
