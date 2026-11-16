# scripts/crawl_cards.py —— 扩卡库：多 feed 深翻页 + 榜单补抓 + 418 自动换节点续爬
#
# 事实（notes/010、notes/011、notes/019 与本轮实测 2026-11-16）：
#   home.getCards {"type":T}               -> 200，一页 24 张完整卡片对象，tags 恒 []
#   home.getCards {"type":T,"cursor":N}    -> cursor 是页码，0..1000；N>1000 报「小于等于 1000」
#   home.newbie   {} / {"cursor":N}        -> 200，一页 24 张；cursor=2 空 → 只有 2 页
#   competition.awardedCards {}            -> 200，549 行，只有 {cardId, rank}，要 getById 补全
#   home.getHotTags {}                     -> 200，100 条（标签表，不是卡片）
#   418 = {"error":"captcha_required"}，按出口 IP 计；换节点即恢复（scripts/clash.ps1 -Next）
#
# 用法：
#   python -I scripts/crawl_cards.py --dry                     # 只看计划
#   python -I scripts/crawl_cards.py --pages 60 --gap 1.4      # 每个 type 最多翻 60 页
#   python -I scripts/crawl_cards.py --pages 1000 --rotate      # 撞闸门自动换节点续爬
#   python -I scripts/crawl_cards.py --reset                    # 清进度重头爬
#
# 退出码：0 正常；2 撞闸门且未开 --rotate（已落盘，重跑同一条命令续）；
#         3 连续换节点仍被闸门（冷却后再跑）；130 手动中断。
import argparse
import io
import json
import os
import subprocess
import sys
import time
import uuid
from urllib.parse import quote

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "captures", "site")
CARDS = os.path.join(SITE, "cards.json")
STATE = os.path.join(ROOT, "out", "crawl_state.json")
AWARDED = os.path.join(ROOT, "out", "awarded_ids.json")
LOG = os.path.join(ROOT, "out", "crawl_cards.jsonl")
BASE = "https://www.dzmm.ai"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")

FEED_TYPES = ["newest", "highest_rated_1d", "highest_rated_7d",
              "highest_rated_30d", "highest_rated_all", "games"]
PAGE_MAX = 1000
CLASH = os.path.join(ROOT, "scripts", "clash.ps1")


def safe(text):
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or "utf-8"
        print(text.encode(enc, "replace").decode(enc, "replace"), flush=True)


def headers():
    return {
        "accept": "application/json, text/plain, */*",
        "origin": BASE, "referer": BASE + "/", "user-agent": UA,
        "x-dzmm-client": "web", "x-dzmm-locale": "zh-CN",
        "x-dzmm-request-id": uuid.uuid4().hex,
        "sec-fetch-dest": "empty", "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }


class Gate(Exception):
    pass


class FetchError(Exception):
    pass


def call(proc, payload, retries=3):
    url = "%s/api/trpc/%s?batch=1&input=%s" % (
        BASE, proc, quote(json.dumps({"0": {"json": payload}}, ensure_ascii=False), safe=""))
    last = None
    for attempt in range(retries):
        try:
            r = creq.get(url, headers=headers(), impersonate="chrome",
                         proxies=PROXY, timeout=40)
            text = r.text or ""
            if r.status_code in (418, 429) or "captcha_required" in text[:400]:
                raise Gate("%s %s" % (r.status_code, text[:120]))
            if r.status_code != 200:
                last = "HTTP %s" % r.status_code
                time.sleep(3)
                continue
            body = json.loads(text)
            if not (isinstance(body, list) and body):
                return []
            if "error" in body[0]:
                return []
            d = body[0]["result"]["data"]["json"]
            if isinstance(d, list):
                return d
            for k in ("items", "cards", "list", "rows"):
                if isinstance(d, dict) and isinstance(d.get(k), list):
                    return d[k]
            return []
        except Gate:
            raise
        except Exception as e:
            last = "%s: %s" % (type(e).__name__, str(e)[:80])
            time.sleep(4 + attempt * 3)
    raise FetchError("%s %s 失败（%s）" % (
        proc, json.dumps(payload, ensure_ascii=False), last))


def shape(c):
    return {
        "id": c.get("id"),
        "name": c.get("name"),
        "cover": c.get("cardFilename"),
        "images": [x.get("url") for x in (c.get("imageInfo") or []) if isinstance(x, dict)],
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
    if not c.get("name"):
        return False, "no name"
    if c.get("publishStatus") not in (None, "approved"):
        return False, "publishStatus=%s" % c.get("publishStatus")
    if c.get("isPublic") is False:
        return False, "isPublic=false"
    if c.get("isHidden"):
        return False, "isHidden=true"
    return True, ""


def flush(cards, dest=CARDS):
    tmp = dest + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    os.replace(tmp, dest)


def log(rec):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with io.open(LOG, "a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def load_state():
    if os.path.exists(STATE):
        return json.load(io.open(STATE, encoding="utf-8"))
    return {"sources": {}, "updated": None}


def save_state(st):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    st["updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
    tmp = STATE + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(st, f, ensure_ascii=False, indent=1)
    os.replace(tmp, STATE)


def src_state(st, key):
    s = st["sources"].get(key)
    if not s:
        s = {"next": 0, "stale": 0, "done": False, "cardIds": 0, "requests": 0}
        st["sources"][key] = s
    return s


def rotate_node(wait_s):
    """换一个出口节点；返回 True 表示已切换。"""
    try:
        out = subprocess.run(["powershell", "-NoProfile", "-File", CLASH, "-Next"],
                             capture_output=True, text=True, timeout=90)
        safe("   [rotate] %s" % ((out.stdout or out.stderr or "").strip()[:160]))
        ok = out.returncode == 0 and "GLOBAL" in (out.stdout or "")
    except Exception as e:
        safe("   [rotate] 失败 %s" % type(e).__name__)
        return False
    if not ok:
        return False
    if wait_s > 0:
        time.sleep(wait_s)
    return True


def probe_clean():
    """匿名 getQuotas：401 = 干净，418 = 仍被闸门。"""
    try:
        r = creq.get(
            "%s/api/trpc/chat.getQuotas?batch=1&input=%s" % (
                BASE, quote(json.dumps({"0": {"json": {}}}))),
            headers=headers(), impersonate="chrome", proxies=PROXY, timeout=25)
        return r.status_code != 418 and "captcha_required" not in (r.text or "")[:200]
    except Exception:
        return False


def crawl_source(st, key, proc, base_payload, cards, seen, args):
    s = src_state(st, key)
    page = s["next"]
    stale_limit = args.stale
    added_total = 0
    rotations = 0

    while not s["done"] and page <= args.pages:
        payload = dict(base_payload)
        if page > 0:
            payload["cursor"] = page
        try:
            rows = call(proc, payload)
        except FetchError as e:
            # 连接层失败不是「源到头」：保留 next，冷却后重跑续爬
            safe("!! 请求失败 @ %s page=%d：%s" % (key, page, str(e)[:140]))
            save_state(st)
            return added_total, "error"
        except Gate as e:
            safe("!! 418 闸门 @ %s page=%d（%s），已落盘 %d 张" % (key, page, e, len(cards)))
            save_state(st)
            if not args.rotate or rotations >= args.rotations:
                return added_total, "gate"
            rotations += 1
            if not rotate_node(args.rotate_wait) or not probe_clean():
                # 换完还脏：长冷却再试一次
                safe("   [rotate] 出口仍被闸门，冷却 %ds" % args.cooldown)
                time.sleep(args.cooldown)
                if not probe_clean() and not rotate_node(args.rotate_wait):
                    return added_total, "gate"
            continue

        s["requests"] += 1
        if not rows:
            s["done"] = True
            safe("  %-28s page=%-3d 空页 → 该源结束（+%d）" % (key, page, added_total))
            break

        new = 0
        for c in rows:
            cid = c.get("id")
            if not cid or cid in seen:
                continue
            ok, _why = usable(c)
            if not ok:
                continue
            cards.append(shape(c))
            seen.add(cid)
            new += 1
        added_total += new
        s["cardIds"] += new
        s["next"] = page + 1
        s["stale"] = 0 if new else s["stale"] + 1

        safe("  %-28s page=%-3d rows=%-3d new=%-3d total=%d"
             % (key, page, len(rows), new, len(cards)))
        log({"key": key, "page": page, "rows": len(rows), "new": new, "total": len(cards)})
        if new:
            flush(cards)
            save_state(st)
        if s["stale"] >= stale_limit:
            s["done"] = True
            safe("  %-28s 连续 %d 页无新卡 → 该源结束" % (key, stale_limit))
            break
        page += 1
        time.sleep(args.gap)

    if not s["done"] and page > args.pages:
        s["next"] = page
    save_state(st)
    flush(cards)
    return added_total, "done" if s["done"] else "paused"


def fetch_awarded(st, cards, seen, args):
    """competition.awardedCards 只给 cardId；逐张 getById 补全（含 tags）。"""
    s = src_state(st, "competition.awardedCards")
    if s["done"]:
        return 0
    try:
        rows = call("competition.awardedCards", {})
    except FetchError as e:
        safe("!! awardedCards 拉取失败：%s" % str(e)[:140])
        return 0
    ids = [r.get("cardId") for r in rows if isinstance(r, dict) and r.get("cardId")]
    os.makedirs(os.path.dirname(AWARDED), exist_ok=True)
    with io.open(AWARDED, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"ids": ids, "built": time.strftime("%Y-%m-%d %H:%M")},
                  f, ensure_ascii=False, indent=1)
    todo = [i for i in ids if i not in seen]
    safe("awardedCards: %d 行 / %d 张不在库内（本轮最多抓 %d）"
         % (len(ids), len(todo), args.awarded_limit))
    added = 0
    for i, cid in enumerate(todo[:args.awarded_limit]):
        try:
            d = call("card.getById", {"cardId": cid})
        except FetchError as e:
            safe("!! awarded 请求失败 @ %s：%s" % (cid, str(e)[:120]))
            time.sleep(5)
            continue
        except Gate:
            safe("!! 418 闸门 @ awarded %s，已落盘 %d 张" % (cid, len(cards)))
            save_state(st)
            if args.rotate and rotate_node(args.rotate_wait) and probe_clean():
                continue
            return added
        if not d or not d.get("name"):
            time.sleep(args.gap)
            continue
        ok, _why = usable(d)
        if not ok:
            time.sleep(args.gap)
            continue
        cards.append(shape(d))
        seen.add(cid)
        added += 1
        s["cardIds"] += 1
        flush(cards)
        if added % 10 == 0:
            safe("  awarded +%d/%d total=%d" % (added, min(args.awarded_limit, len(todo)), len(cards)))
        time.sleep(args.gap)
    s["done"] = len(todo) <= args.awarded_limit
    save_state(st)
    flush(cards)
    return added


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", type=int, default=40, help="每个源最多翻到第几页（默认 40）")
    ap.add_argument("--gap", type=float, default=1.6, help="每发间隔秒（默认 1.6）")
    ap.add_argument("--stale", type=int, default=10, help="连续多少页无新卡即认为该源到头（默认 10）")
    ap.add_argument("--types", default=",".join(FEED_TYPES))
    ap.add_argument("--no-newbie", action="store_true")
    ap.add_argument("--no-awarded", action="store_true")
    ap.add_argument("--awarded-limit", type=int, default=60)
    ap.add_argument("--rotate", action="store_true", help="撞 418 自动换节点续爬")
    ap.add_argument("--rotations", type=int, default=8, help="单次运行最多换几次节点")
    ap.add_argument("--rotate-wait", type=float, default=6.0)
    ap.add_argument("--cooldown", type=float, default=120.0)
    ap.add_argument("--reset", action="store_true")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    types = [t.strip() for t in args.types.split(",") if t.strip()]
    bad = [t for t in types if t not in FEED_TYPES]
    if bad:
        safe("!! 非法 type: %s\n   合法: %s" % (bad, FEED_TYPES))
        return 1
    args.pages = min(args.pages, PAGE_MAX)

    if args.reset and os.path.exists(STATE):
        os.remove(STATE)

    cards = json.load(io.open(CARDS, encoding="utf-8")) if os.path.exists(CARDS) else []
    seen = {c["id"] for c in cards if c.get("id")}
    safe("库内 %d 张 → %s" % (len(cards), CARDS))

    sources = [("home.getCards:%s" % t, "home.getCards", {"type": t}) for t in types]
    if not args.no_newbie:
        sources.append(("home.newbie", "home.newbie", {}))
    if args.dry:
        n = sum(1 for _ in sources) * (args.pages + 1)
        total = n * args.gap
        safe("would send ≤%d requests, GAP=%.1fs, ~%.0f 分钟" % (n, args.gap, total / 60.0))
        return 0

    # 开工备份一次
    ts = time.strftime("%Y%m%d%H%M%S")
    bak = CARDS + ".bak-" + ts + "-pre-crawl"
    with io.open(bak, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cards, f, ensure_ascii=False, indent=1)
    safe("备份 → %s" % os.path.basename(bak))

    st = load_state()
    total_added = 0
    try:
        for key, proc, payload in sources:
            added, why = crawl_source(st, key, proc, payload, cards, seen, args)
            total_added += added
            safe("== %-28s +%d（%s）库内 %d" % (key, added, why, len(cards)))
            if why == "gate":
                safe("!! 闸门未解除：冷却后重跑同一条命令即可续（进度已存 %s）"
                     % os.path.relpath(STATE, ROOT))
                return 2
        if not args.no_awarded:
            added = fetch_awarded(st, cards, seen, args)
            total_added += added
            safe("== awardedCards +%d，库内 %d" % (added, len(cards)))
    except KeyboardInterrupt:
        flush(cards)
        save_state(st)
        safe("\n中断：库内 %d 张，进度已存" % len(cards))
        return 130

    flush(cards)
    save_state(st)
    safe("done 入库 %d 张，新增 %d 张 → %s" % (len(cards), total_added, CARDS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
