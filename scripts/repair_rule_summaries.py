# -*- coding: utf-8 -*-
"""批量重修「规则碎片/拒答」摘要：用快照或上游最长 chat，按 Pulse 逐块滚压。

用法（服务器上）：
    cd /opt/lan && DZMM_PROXY=http://127.0.0.1:7890 \
        /opt/lan/venv/bin/python scripts/repair_rule_summaries.py --dry-run
    ... --apply            # 真正写回（先备份）
    ... --card 426322 --session a9704810   # 只修一条

只处理带 sessionId 的会话记忆；卡级旧文件默认跳过（会话不会读它）。
"""
import argparse
import io
import json
import os
import re
import shutil
import sys
import time

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "engine"))
os.environ.setdefault("DZMM_ROOT", ROOT)

import server as s  # noqa: E402
import memory as m  # noqa: E402

REFUSAL = re.compile(r"(无法完成|无法提供|不能提供|我无法|我不能|作为\s*(AI|人工智能))")


def classify(summary):
    t = (summary or "").strip()
    if not t:
        return "empty"
    if REFUSAL.search(t[:200]):
        return "refusal"
    if t.startswith("称呼/规则") or re.search(r"(^|\n)[他她]：", t[:300]):
        return "rule"
    return "ok"


def pick_account(pool, st):
    best = None
    for n in pool:
        a = s.account_state(st, n)
        if a.get("exhausted") or a.get("disabled"):
            continue
        c = a.get("credit") or 0
        if c < s.MIN_PREPAY:
            continue
        if best is None or c > best[0]:
            best = (c, n)
    return best


def load_messages(card, sid):
    """优先上传快照，其次上游各 chat 取最长。"""
    snap = os.path.join(s.OUT_DIR, "history", str(card), "%s.json" % sid)
    if os.path.exists(snap):
        d = json.load(io.open(snap, encoding="utf-8-sig"))
        msgs = m.sanitize_history(d.get("messages") or [])
        if msgs:
            return msgs, "snapshot"
    pool = s.load_pool()
    st = s.load_state()
    pairs, seen = [], set()
    reg = s.get_session(card, sid)
    if reg and reg.get("account") and reg.get("chatId"):
        pairs.append((reg["account"], reg["chatId"]))
    for key, ent in (st.get("site_chats") or {}).items():
        p = str(key).split(":")
        if len(p) < 4 or p[0] != "site" or p[2] != str(card) or p[3] != sid:
            continue
        if (ent or {}).get("chatId"):
            pairs.append((p[1], ent["chatId"]))
    best = None
    for acct, cid in pairs:
        if acct not in pool or cid in seen:
            continue
        seen.add(cid)
        msgs, err = s.fetch_chat_messages(pool[acct]["cookie"], cid)
        if msgs and (best is None or len(msgs) > len(best[0])):
            best = (msgs, "upstream:%s" % acct)
    return (best if best else (None, "none"))


def summarize(msgs, pins, acct, cid, batch_card, fact_ctx, existing=""):
    body = msgs[:-2] if len(msgs) > 6 else msgs
    chunks = m.chunk_messages(body, 6000)
    # 旧摘要（哪怕是规则碎片）先带上，让模型合并而不是丢掉更早的剧情
    running = m.usable_existing(existing)
    if len(chunks) > 8:
        head = [x for ch in chunks[:-4] for x in ch]
        running = m.rule_summary(head, running, pins)
        chunks = chunks[-4:]
    pool = s.load_pool()
    for i, ch in enumerate(chunks):
        prompt = m.model_summary_prompt(
            ch, running, pins, recent=msgs[-2:] if i == len(chunks) - 1 else None)
        res = s.generate(pool[acct]["cookie"], cid, batch_card, s.SUMMARY_MODEL, 800,
                         prompt, lambda *a, **k: None, want_sug=False)
        piece = m.clean_summary(res.get("text"))
        if res.get("status") != "ok" or not piece or m.looks_like_refusal(piece) \
                or m.looks_like_roleplay(piece) or not m.fact_guard(piece, fact_ctx):
            return None, "chunk %d: %s" % (i, (piece or res.get("error") or "")[:60])
        running = piece
    text = m.ensure_scene(running, msgs[-4:], force=True)
    return (text, len(body)), ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--card", type=int)
    ap.add_argument("--session")
    args = ap.parse_args()
    if not args.dry_run and not args.apply:
        args.dry_run = True

    pool = s.load_pool()
    st = s.load_state()
    pick = pick_account(pool, st)
    if not pick:
        print("no usable account"); return 1
    credit, acct = pick
    print("account=%s credit=%.2f" % (acct, credit))
    chat = s.ensure_chat(st, pool, acct, lambda *a, **k: None)
    if not chat or not chat[0]:
        print("no batch chat:", chat); return 1
    batch_cid, batch_card = chat

    base = os.path.join(s.OUT_DIR, "memory")
    rows = []
    for root, _, files in os.walk(base):
        for fn in files:
            if not fn.endswith(".json"):
                continue
            p = os.path.join(root, fn)
            try:
                d = json.load(io.open(p, encoding="utf-8-sig"))
            except Exception:
                continue
            kind = classify(d.get("summary"))
            if kind not in ("rule", "refusal"):
                continue
            card, sid = d.get("cardId"), d.get("sessionId")
            if args.card and int(card or 0) != args.card:
                continue
            if args.session and str(sid or "") != args.session:
                continue
            rows.append((p, d, card, sid, kind))

    print("targets:", len(rows))
    for p, d, card, sid, kind in rows:
        print(" - card=%s sid=%s %s %s" % (card, str(sid or "-")[:8], kind, p))
        if not sid:
            print("   skip: 卡级旧文件，会话不读它")
            continue
        msgs, src = load_messages(card, sid)
        if not msgs:
            print("   skip: no messages (%s)" % src); continue
        pins = [x.get("text", "") for x in (d.get("pinned") or []) if x.get("text")]
        fact_ctx = " ".join(pins) + " " + (msgs[0].get("content") or "")
        print("   src=%s msgs=%d" % (src, len(msgs)))
        if args.dry_run:
            continue
        text, info = summarize(msgs, pins, acct, batch_cid, batch_card, fact_ctx,
                               existing=d.get("summary") or "")
        if not text:
            print("   FAIL:", info); continue
        backup = os.path.join("/opt/lan", "backup-summary-%s-%s.json"
                              % (card, time.strftime("%Y%m%d-%H%M%S")))
        shutil.copy2(p, backup)
        latest = m.load_memory(s.MEMORY_DIR, card, sid)
        latest["summary"] = text[0]
        latest["summarizedUpTo"] = text[1]
        latest["summaryHash"] = m.msg_id(msgs[len(msgs) - 3]) if len(msgs) >= 3 else ""
        m.save_memory(s.MEMORY_DIR, latest)
        print("   OK %d字 up=%d backup=%s" % (len(text[0]), text[1], backup))
    return 0


if __name__ == "__main__":
    sys.exit(main())
