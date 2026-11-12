# scripts/compare_card_shapes.py —— 对比 card.getById 与 home.getCards 的字段差异
#
# 结论用途：确认 feed 到底缺哪些字段，决定新卡是否必须补 card.getById。
# 不联网：只读 out/probe_card.json（card.getById 原文）与 out/home_min.json（feed 原文）。
#
#   python -I scripts/compare_card_shapes.py
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BYID = os.path.join(ROOT, "out", "probe_card.json")
FEED = os.path.join(ROOT, "out", "home_min.json")


def main():
    byid = json.load(io.open(BYID, encoding="utf-8"))
    card = byid[0]["result"]["data"]["json"]

    feed_cards = []
    if os.path.exists(FEED):
        for r in json.load(io.open(FEED, encoding="utf-8")):
            feed_cards.extend(r.get("cards") or [])

    print("card.getById 字段 (%d):" % len(card))
    for k in sorted(card):
        v = card[k]
        print("   %-20s %s" % (k, json.dumps(v, ensure_ascii=False)[:60]))

    if not feed_cards:
        print("\n没有 feed 样本（out/home_min.json 缺失）")
        return

    fk = set(feed_cards[0].keys())
    bk = set(card.keys())
    print("\nfeed 样本字段数 %d" % len(fk))
    print("只有 getById 有: %s" % sorted(bk - fk))
    print("只有 feed 有:     %s" % sorted(fk - bk))

    # tags 在 feed 里的实际值分布
    vals = [c.get("tags") for c in feed_cards]
    empty = sum(1 for v in vals if not v)
    print("\nfeed 样本 %d 张，tags 为空 %d 张" % (len(feed_cards), empty))
    print("tags 键是否存在: %s" % ("tags" in fk))


if __name__ == "__main__":
    main()
