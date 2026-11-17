# -*- coding: utf-8 -*-
"""线上真实测试：摘要账号回退 / 空会话 / 换号接续 / 全站记忆体检。

在服务器上运行（需要 accounts.json + out/webstate.json + 上游可达）：
    cd /opt/lan && DZMM_PROXY= /opt/lan/venv/bin/python scripts/test_memory_live.py
会真实调用一次生成和一次摘要，消耗少量 credit；结束自动清理测试会话。
"""
import argparse
import io
import json
import os
import re
import sys
import time

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "engine"))
os.environ.setdefault("DZMM_ROOT", ROOT)

import server as s  # noqa: E402
import memory as m  # noqa: E402

REFUSAL = re.compile(r"(无法完成|无法提供|不能提供|我无法|我不能|作为\s*(AI|人工智能))")


def fail(msg):
    print("FAIL:", msg)
    return 1


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


def audit_memory():
    base = os.path.join(s.OUT_DIR, "memory")
    bad, rule, total = [], 0, 0
    for root, _, files in os.walk(base):
        for fn in files:
            if not fn.endswith(".json"):
                continue
            total += 1
            try:
                d = json.load(io.open(os.path.join(root, fn), encoding="utf-8-sig"))
            except Exception:
                continue
            t = (d.get("summary") or "").strip()
            if t and REFUSAL.search(t[:200]):
                bad.append(os.path.join(root, fn))
            if t.startswith("称呼/规则"):
                rule += 1
            if t:
                out = m.content_prefix(d)
                if "【前情摘要】" in out:
                    inj = len(out.split("【前情摘要】", 1)[1])
                    if len(t) >= 300 and inj < 300:
                        bad.append("%s (摘要仅注入 %d/%d)" % (fn, inj, len(t)))
    print("memory files=%d rule=%d refusal/truncated=%d" % (total, rule, len(bad)))
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--card", type=int, default=426322)
    args = ap.parse_args()
    errors = 0

    pool = s.load_pool()
    st = s.load_state()
    pick = pick_account(pool, st)
    if not pick:
        return fail("no usable account")
    credit, acct = pick
    print("account=%s credit=%.2f" % (acct, credit))

    ts = str(int(time.time()))
    sid = "live-test-" + ts
    cookie = pool[acct]["cookie"]
    cid = None
    try:
        # 1) 新会话必须是空 chat
        cid, err = s.fresh_chat_for_card(cookie, args.card, session_id=sid)
        print("fresh chat=%s err=%s" % (str(cid)[:8], err))
        if not cid:
            return fail("fresh_chat_for_card: %s" % err)
        n = s.fetch_chat_count(cookie, cid)
        has_hist, herr = s.chat_has_history(cookie, cid)
        print("fresh chat msgs=%s has_history=%s" % (n, has_hist))
        # 新建会话自带一条卡片开场（assistant），不能按 0 条判空
        if has_hist is not False:
            errors += fail("fresh chat has history: %s %s" % (has_hist, herr))

        # 2) 换号接续：把上一场「刻晴 cos」原文塞进 recent_text，看回复是否接得上
        recent = ("用户：刻晴！最爱刻晴了，我要把你抱起来操\n"
                  "角色：*她换上了刻晴的cos服，紫色的长发垂在肩上，正抬眼看你。*")
        res = s.generate(cookie, cid, args.card, "x-apex-flux-0217-16k", 300,
                         "继续。", lambda *a, **k: None, recent_text=recent,
                         want_sug=False)
        text = res.get("text") or ""
        # last_content.txt 是全局调试文件，线上并发会互相覆盖；直接检查 build_body
        body = s.build_body(cid, args.card, "x-apex-flux-0217-16k", 300, "继续。",
                            recent_text=recent, want_sug=False)
        content = body.get("content") or ""
        injected = "【刚才的对话" in content and "刻晴" in content
        print("continuity status=%s chars=%d injected=%s"
              % (res.get("status"), len(text), injected))
        if not injected:
            errors += fail("recent_text was not injected into content")
        keys = ("刻晴", "cos", "cos服", "玉衡", "紫色")
        if res.get("status") != "ok" or not any(k in text for k in keys):
            errors += fail("continuity reply did not reference the 刻晴 scene: %s" % text[:120])

        # 3) 摘要账号回退：故意用「0 额度」的号名，必须换成有额度的号并写入摘要
        #    中性卡更稳（剧情卡在摘要模型上偶发空响应）
        sum_card = 3861267
        mem = m.default_memory(sum_card)
        mem["sessionId"] = "live-sum-" + ts
        hist = [{"role": "user" if i % 2 == 0 else "assistant",
                 "content": "第%d条：伊一在玄关跪下，称呼主人，门外有脚步声。" % i}
                for i in range(20)]
        broke = "nobody-" + ts
        out = s.maybe_summarize(pool, broke, st, sum_card, mem, hist)
        text2 = out.get("summary") or ""
        saved = m.load_memory(s.MEMORY_DIR, sum_card, mem["sessionId"])
        print("summary chars=%d hash=%s" % (len(text2), saved.get("summaryHash")))
        if not saved.get("summaryHash"):
            errors += fail("summary did not advance (account fallback failed)")
        if REFUSAL.search(text2[:200]):
            errors += fail("summary is a refusal")
        if "【当前场景】" not in text2:
            errors += fail("summary missing 【当前场景】")

        # 4) 全站体检
        bad = audit_memory()
        if bad:
            errors += fail("memory audit: %s" % bad[:5])
    finally:
        # 清理：删上游 chat + 会话注册 + 测试记忆
        try:
            if cid:
                s.delete_chat(cookie, cid)
        except Exception:
            pass
        try:
            s.drop_session_chat(args.card, sid)
        except Exception:
            pass
        for c in {args.card, 3861267}:
            d = os.path.join(s.MEMORY_DIR, str(c))
            if not os.path.isdir(d):
                continue
            for fn in os.listdir(d):
                if fn.startswith("live-"):
                    os.remove(os.path.join(d, fn))
        print("cleaned", sid)

    print("RESULT:", "PASS" if errors == 0 else "FAIL(%d)" % errors)
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
