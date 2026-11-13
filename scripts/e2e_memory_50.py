# -*- coding: utf-8 -*-
"""PRD §7 验收：50 轮长对话记忆保持。

直接打本地引擎 `POST /site/chat`（与前端同一条链路），不依赖浏览器。

用法：
    python scripts/e2e_memory_50.py --card 3821218 --reset
    python scripts/e2e_memory_50.py --card 3821218 --rounds 12      # 冒烟

判据：
    1. 第 5 轮下达称呼规则，第 10/20/30/40/50 轮追问，回复必须含「主人」；
    2. 全程不出现「初次见面 / 第一次见 / 重新介绍 / 重新开场」；
    3. out/memory/<cardId>.json 的 summary ≤ 600 字，summarizedUpTo 单调不减。

只依赖标准库。请求速率默认 0.8s/轮（≤2 rps）。
"""
import argparse
import io
import json
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULE = "以后私底下叫我主人，有别人在叫哥哥。"
PLOT = "接下来剧情走海边旅行。"
PROBE = "现在该怎么称呼我？我们约定了什么？用一句话回答。"

CHATTER = [
    "我推开门走进屋里。",
    "屋里有点暗，我把灯打开。",
    "你坐在沙发上抬头看我。",
    "我在你旁边坐下。",
    "外面开始下雨了。",
    "你把杯子递给我。",
    "我喝了一口，是温的。",
    "我伸手摸了摸你的头发。",
    "你靠过来了一点。",
    "我低声问你今天过得怎么样。",
    "你说有点累。",
    "我让你靠在我肩上休息。",
]

REOPEN = ["初次见面", "第一次见", "重新介绍", "重新开场"]


def http_json(method, url, body=None, headers=None, timeout=180):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def get_memory(base, token, card):
    h = {"x-site-token": token}
    return http_json("GET", "%s/site/memory?cardId=%d" % (base, card), None, h)["memory"]


def post_memory(base, token, card, body):
    h = {"x-site-token": token, "content-type": "application/json"}
    body = dict(body, cardId=card)
    return http_json("POST", base + "/site/memory", body, h)


def chat(base, token, card, prompt, history, model, max_tokens, timeout=300):
    """返回 (complete_text, account, credit, events)。end 时抛 RuntimeError。"""
    body = json.dumps({"cardId": card, "prompt": prompt, "history": history,
                       "model": model, "maxTokens": max_tokens},
                      ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        base + "/site/chat", data=body, method="POST",
        headers={"content-type": "application/json", "x-site-token": token})
    ev, events = None, []
    with urllib.request.urlopen(req, timeout=timeout) as r:
        for raw in r:
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if line.startswith("event:"):
                ev = line[6:].strip()
                continue
            if not line.startswith("data:"):
                continue
            try:
                d = json.loads(line[5:].strip())
            except Exception:
                continue
            if ev == "complete":
                events.append(("complete", d.get("account")))
                return d.get("text") or "", d.get("account"), d.get("credit"), events
            if ev == "end":
                events.append(("end", d.get("reason")))
                raise RuntimeError("end: %s %s" % (d.get("reason"), d.get("message")))
            if ev == "switch":
                events.append(("switch", d.get("reason")))
            elif ev == "memory":
                events.append(("memory", len(d.get("pinned") or [])))
    raise RuntimeError("SSE 提前结束，未收到 complete/end")


def prompt_for(i, rounds):
    if i == 5:
        return RULE
    if i == 8:
        return PLOT
    if i in (10, 20, 30, 40, 50) and i <= rounds:
        return PROBE
    return CHATTER[(i - 1) % len(CHATTER)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--card", type=int, required=True)
    ap.add_argument("--rounds", type=int, default=50)
    ap.add_argument("--base", default="http://127.0.0.1:8787")
    ap.add_argument("--token-file", default=os.path.join(ROOT, "out", "site_token.txt"))
    ap.add_argument("--model", default="x-apex-surge-0505")
    ap.add_argument("--max-tokens", type=int, default=240)
    ap.add_argument("--delay", type=float, default=0.8)
    ap.add_argument("--reset", action="store_true", help="先清空该卡的长期记忆")
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "e2e_memory_50.jsonl"))
    args = ap.parse_args()

    with io.open(args.token_file, encoding="utf-8-sig") as f:
        token = f.read().strip()

    if args.reset:
        post_memory(args.base, token, args.card, {"clear": True})
    mem0 = get_memory(args.base, token, args.card)
    print("start: card=%d rounds=%d pins=%d summary=%d"
          % (args.card, args.rounds, len(mem0.get("pinned") or []),
             len(mem0.get("summary") or "")), flush=True)

    history, failures, last_up = [], [], -1
    probe_rounds = [i for i in (10, 20, 30, 40, 50) if i <= args.rounds]
    t0 = time.time()
    with io.open(args.out, "w", encoding="utf-8", newline="\n") as log:
        for i in range(1, args.rounds + 1):
            prompt = prompt_for(i, args.rounds)
            reply = account = credit = None
            try:
                reply, account, credit, events = chat(
                    args.base, token, args.card, prompt, history,
                    args.model, args.max_tokens)
            except Exception as e:
                failures.append({"round": i, "error": str(e)[:240]})
                print("  round %02d FAIL %s" % (i, str(e)[:160]), flush=True)
                break

            history += [{"role": "user", "content": prompt},
                        {"role": "assistant", "content": reply}]
            mem = get_memory(args.base, token, args.card)
            up = int(mem.get("summarizedUpTo") or 0)
            if up < last_up:
                failures.append({"round": i, "error": "summarizedUpTo 回退 %d→%d" % (last_up, up)})
            last_up = up
            if len(mem.get("summary") or "") > 600:
                failures.append({"round": i, "error": "summary 超 600 字"})

            rec = {"round": i, "prompt": prompt, "reply": reply,
                   "account": account, "credit": credit,
                   "pins": len(mem.get("pinned") or []),
                   "summaryLen": len(mem.get("summary") or ""),
                   "summarizedUpTo": up, "events": events,
                   "at": int(time.time())}
            log.write(json.dumps(rec, ensure_ascii=False) + "\n")
            log.flush()

            flag = ""
            if i in probe_rounds:
                ok = "主人" in (reply or "")
                flag = " PROBE " + ("PASS" if ok else "FAIL")
                if not ok:
                    failures.append({"round": i, "error": "追问回复未含「主人」",
                                     "reply": (reply or "")[:300]})
            for word in REOPEN:
                if word in (reply or ""):
                    failures.append({"round": i, "error": "出现重新开场词：%s" % word})
            print("  round %02d %-4s credit=%-7s pins=%d sum=%d up=%d%s"
                  % (i, account, credit, len(mem.get("pinned") or []),
                     len(mem.get("summary") or ""), up, flag), flush=True)
            time.sleep(args.delay)

    # 后台摘要可能还在跑：给它 15 秒落盘
    time.sleep(15)
    mem = get_memory(args.base, token, args.card)
    final = {
        "card": args.card,
        "rounds": args.rounds,
        "elapsedSec": round(time.time() - t0, 1),
        "failures": failures,
        "pins": [p.get("text") for p in (mem.get("pinned") or [])],
        "summaryLen": len(mem.get("summary") or ""),
        "summarizedUpTo": int(mem.get("summarizedUpTo") or 0),
    }
    print(json.dumps(final, ensure_ascii=False, indent=1), flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
