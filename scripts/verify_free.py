# -*- coding: utf-8 -*-
"""零扣费模型自检（notes/056）。

对池子里的一个号连续用 nalang-turbo-* 生成 N 次，前后各查一次余额；
「每次都出正文 + 余额差额为 0」才算零扣费成立。

用法:
    python scripts/verify_free.py                       # 默认 3 次
    python scripts/verify_free.py --times 5 --model nalang-turbo-1115-16k
    python scripts/verify_free.py --account b020 --card 3821218

产出: out/verify_free.jsonl（每次一行，便于回看）
"""
import argparse
import io
import json
import os
import sys
import time

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "engine"))
os.environ.setdefault("DZMM_ROOT", ROOT)

import server as s  # noqa: E402

LOG_PATH = os.path.join(s.OUT_DIR, "verify_free.jsonl")


def note(rec):
    try:
        os.makedirs(s.OUT_DIR, exist_ok=True)
        with io.open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception as e:
        print("  (写日志失败: %s)" % str(e)[:80])


def pick_account(pool, st, want=""):
    if want:
        if want not in pool:
            return None, "账号 %s 不在池里" % want
        return want, ""
    best = None
    for n in pool:
        a = s.account_state(st, n)
        if a.get("disabled"):
            continue
        c = a.get("credit")
        if c is None:
            continue
        # 零扣费模型零余额也能用；优先挑余额高的号，避免误伤本来就快见底的号
        if best is None or c > best[0]:
            best = (c, n)
    if not best:
        return None, "池子里没有可用账号"
    return best[1], ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--times", type=int, default=3)
    ap.add_argument("--model", default=s.FREE_MODEL)
    ap.add_argument("--account", default="")
    ap.add_argument("--card", type=int, default=0)
    ap.add_argument("--prompt", default="自检：用一句话描述今天的天气")
    args = ap.parse_args()

    if not s.is_free_model(args.model):
        print("FAIL: %s 不是零扣费模型（必须 nalang-turbo-*）" % args.model)
        return 2

    pool = s.load_pool()
    st = s.load_state()
    if not pool:
        print("FAIL: accounts.json 为空")
        return 2
    name, err = pick_account(pool, st, args.account)
    if not name:
        print("FAIL:", err)
        return 2
    cookie = pool[name]["cookie"]

    ok, b0, uid, err = s.get_me(cookie)
    if not ok:
        if "418" in str(err):
            print("FAIL: 出口 IP 命中 418 风控（不是账号问题）。"
                  "先换节点：powershell -File scripts\\clash.ps1 -Set \"<节点名>\"")
            return 3
        print("FAIL: user.getMe 失败（%s）" % err)
        return 2

    card = args.card or (s.card_candidates() or s.FALLBACK_CARDS)[0]
    cid, cerr = s.create_chat(cookie, card)
    if not cid:
        print("FAIL: createByCard 失败（card=%s，%s）" % (card, cerr))
        return 2

    print("账号 %s（uid %s）  card %s  chat %s" % (name, uid, card, str(cid)[:8]))
    print("模型 %s   起始 credit %.2f   共 %d 次" % (args.model, b0, args.times))

    passed = 0
    t0 = int(time.time())
    for i in range(max(1, args.times)):
        prompt = "%s（第 %d 次）" % (args.prompt, i + 1)
        res = s.generate(cookie, cid, card, args.model, 300, prompt,
                         lambda *a, **k: None, want_sug=False)
        # 同一 chatId 上一轮还没在上游收尾时会给 409；等它落库后重试一次。
        if res.get("status") != "ok" and "409" in str(res.get("error") or ""):
            print("  #%d 上游 409（同一会话仍在生成），5s 后重试" % (i + 1))
            time.sleep(5)
            res = s.generate(cookie, cid, card, args.model, 300, prompt,
                             lambda *a, **k: None, want_sug=False)
        status = res.get("status")
        if status != "ok" and "418" in str(res.get("error") or ""):
            print("FAIL: 第 %d 次命中 418 风控（出口 IP 级，不是账号问题）。"
                  "换节点后重试：powershell -File scripts\\clash.ps1 -Set \"<节点名>\"" % (i + 1))
            note({"t": int(time.time()), "account": name, "model": args.model,
                  "card": card, "chatId": cid, "index": i + 1, "status": "gate_418"})
            return 3
        chars = len(res.get("text") or "")
        good = status == "ok" and chars > 0
        if good:
            passed += 1
        print("  #%d %-8s %4d 字%s" % (i + 1, status, chars,
                                       "" if good else "  " + str(res.get("error") or res.get("reason") or "")))
        note({"t": int(time.time()), "account": name, "model": args.model,
              "card": card, "chatId": cid, "index": i + 1, "status": status,
              "chars": chars})
        time.sleep(1.5)

    ok2, b1, _uid, err2 = s.get_me(cookie)
    if not ok2:
        if "418" in str(err2):
            print("FAIL: 结算时命中 418 风控（出口 IP 级）。换节点后重跑本脚本。")
            return 3
        print("FAIL: 结算余额失败（%s）" % err2)
        return 2
    delta = round(b0 - b1, 2)
    verdict = (passed >= max(1, args.times) and delta == 0)
    print("结果：成功 %d/%d，credit %.2f → %.2f，扣费 %.2f，耗时 %ds"
          % (passed, args.times, b0, b1, delta, int(time.time()) - t0))
    print("结论：", "零扣费成立（无限额度）" if verdict else "存在扣费或失败，需复查")
    note({"t": int(time.time()), "account": name, "model": args.model,
          "summary": {"passed": passed, "times": args.times,
                      "credit_before": b0, "credit_after": b1,
                      "spent": delta, "verdict": verdict}})

    # 清理自检会话，别在账号里留一堆测试对话
    try:
        dok, derr = s.delete_chat(cookie, cid)
        print("清理自检会话：%s%s" % ("ok" if dok else "失败", "" if dok else " " + str(derr)))
    except Exception as e:
        print("清理自检会话异常：%s" % str(e)[:80])
    return 0 if verdict else 1


if __name__ == "__main__":
    sys.exit(main())
