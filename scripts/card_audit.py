# scripts/card_audit.py —— 卡库体检：数量、唯一性、关键字段缺失、重复名
#
#   python -I scripts/card_audit.py [cards.json]
import io
import json
import os
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT = os.path.join(ROOT, "captures", "site", "cards.json")


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
    cards = json.load(io.open(path, encoding="utf-8"))
    ids = [c.get("id") for c in cards]
    uniq = {i for i in ids if i}
    print("path      %s" % path)
    print("rows      %d" % len(cards))
    print("unique id %d  (dup %d)" % (len(uniq), len(ids) - len(uniq)))

    for key, label in (("name", "name"), ("cover", "cover"),
                       ("tags", "tags"), ("creator", "creator"),
                       ("creatorNotes", "creatorNotes"), ("likes", "likes")):
        missing = sum(1 for c in cards if not c.get(key))
        print("missing %-13s %d" % (label, missing))

    dup_names = [n for n, k in Counter(c.get("name") for c in cards).items() if k > 1]
    print("dup names %d" % len(dup_names))
    for n in dup_names[:5]:
        print("   %s" % n[:50])

    bad_ids = [i for i in ids if not isinstance(i, int) or i <= 0]
    print("bad ids   %d %s" % (len(bad_ids), bad_ids[:5]))


if __name__ == "__main__":
    main()
