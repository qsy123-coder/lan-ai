# scripts/card_tags_audit.py —— 查有多少卡没有 tags，并按 id 区间/名称特征抽样
#
#   python -I scripts/card_tags_audit.py
import io
import json
import os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, "captures", "site", "cards.json")


def main():
    cards = json.load(io.open(CARDS, encoding="utf-8"))
    with_tags = [c for c in cards if c.get("tags")]
    without = [c for c in cards if not c.get("tags")]
    print("total %d  with tags %d  without %d" % (len(cards), len(with_tags), len(without)))

    print("\n-- 有 tags 的卡（前 30 个 tag）--")
    cnt = Counter(t for c in with_tags for t in c.get("tags") or [])
    for t, n in cnt.most_common(30):
        print("   %-16s %d" % (t, n))

    print("\n-- 无 tags 抽样 8 张 --")
    for c in without[:8]:
        print("   %-9s %-42s likes=%s" % (c.get("id"), (c.get("name") or "")[:40], c.get("likes")))

    print("\n-- 两个集合的 id 区间 --")
    wi = sorted(c["id"] for c in with_tags)
    wo = sorted(c["id"] for c in without)
    if wi:
        print("   with tags:    %d .. %d" % (wi[0], wi[-1]))
    if wo:
        print("   without tags: %d .. %d" % (wo[0], wo[-1]))

    # 落一份无 tag 清单，供后续决定是否补 card.getById
    out = os.path.join(ROOT, "out", "cards_without_tags.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump([c["id"] for c in without], f, ensure_ascii=False, indent=1)
    print("\n-> %s" % out)


if __name__ == "__main__":
    main()
