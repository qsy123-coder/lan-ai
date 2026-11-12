# scripts/merge_public_cards.py —— 把 out/home_min.json 的匿名榜单卡片合并进卡库
#
# 不发任何网络请求：只读已落盘的抓包产物，规避 418。
# 合并规则：按 id 去重；已存在的卡保留原记录（原地不动），只追加新卡；
#           追加前剔除下架/隐藏/非公开的行（publishStatus != approved / isPublic false / isHidden true）。
#
#   python -I scripts/merge_public_cards.py            # 试运行，只打印
#   python -I scripts/merge_public_cards.py --write     # 真正写 captures/site/cards.json
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def say(msg):
    """Windows 控制台是 cp936，卡片名里有 emoji/生僻字，直接 print 会 UnicodeEncodeError。"""
    try:
        print(msg)
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or "utf-8"
        print(msg.encode(enc, "replace").decode(enc, "replace"))
SRC = os.path.join(ROOT, "out", "home_min.json")
CARDS = os.path.join(ROOT, "captures", "site", "cards.json")
BACKUP = os.path.join(ROOT, "out", "cards.before-merge.json")


def shape(c):
    return {
        "id": c["id"],
        "name": c["name"],
        "cover": c.get("cardFilename"),
        "images": [x["url"] for x in (c.get("imageInfo") or [])],
        "tags": c.get("tags") or [],
        "creator": c.get("creator") or c.get("creatorFullName"),
        "creatorAvatar": c.get("creatorAvatarUrl"),
        "creatorNotes": c.get("creatorNotes") or "",
        "likes": c.get("likesCount"),
        "comments": c.get("commentsCount"),
        "popularity": c.get("popularityScore"),
        "rating": c.get("weightedRating"),
        "isSensitive": c.get("isSensitive"),
        "publishedAt": c.get("publishedAt"),
    }


def usable(c):
    if c.get("publishStatus") != "approved":
        return False, "publishStatus=%s" % c.get("publishStatus")
    if c.get("isPublic") is False:
        return False, "isPublic=false"
    if c.get("isHidden"):
        return False, "isHidden=true"
    if not c.get("name"):
        return False, "no name"
    return True, ""


def flush(cards):
    os.makedirs(os.path.dirname(CARDS), exist_ok=True)
    tmp = CARDS + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, CARDS)


def main():
    write = "--write" in sys.argv

    reports = json.load(io.open(SRC, encoding="utf-8"))
    rows = {}
    for r in reports:
        for c in r.get("cards") or []:
            if c.get("id"):
                rows[c["id"]] = c

    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    have = {str(c["id"]) for c in cards}
    before = len(cards)

    skipped = []
    added = []
    for cid, c in sorted(rows.items()):
        if str(cid) in have:
            continue
        ok, why = usable(c)
        if not ok:
            skipped.append((cid, why))
            continue
        cards.append(shape(c))
        have.add(str(cid))
        added.append((cid, (c.get("name") or "")[:30]))

    say("候选 %d / 已有 %d / 新增 %d / 跳过 %d" % (len(rows), before, len(added), len(skipped)))
    for cid, why in skipped:
        say("  跳过 %s  %s" % (cid, why))
    for cid, name in added[:10]:
        say("  + %s  %s" % (cid, name))
    if len(added) > 10:
        say("  ... 另有 %d 张" % (len(added) - 10))

    if not write:
        print("\n[试运行] 未写盘。加 --write 落盘。")
        return

    if os.path.exists(CARDS):
        os.makedirs(os.path.dirname(BACKUP), exist_ok=True)
        with io.open(CARDS, encoding="utf-8") as f:
            data = f.read()
        with io.open(BACKUP, "w", encoding="utf-8", newline="\n") as f:
            f.write(data)
        print("备份 ->", BACKUP)

    flush(cards)
    print("写入 %d 张 -> %s" % (len(cards), CARDS))


if __name__ == "__main__":
    main()
