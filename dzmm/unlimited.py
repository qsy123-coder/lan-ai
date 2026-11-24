# -*- coding: utf-8 -*-
"""
dzmm.ai 无限额度对话客户端（零扣费）

原理
----
服务端对 `nalang-turbo-*` 系列模型**不做积分扣减**（其他模型正常扣费）。
实测 12 次连续对话，余额 91.47 → 91.47，变动 0.00。

对比（同一账号、同一次会话）：
    nalang-turbo-1115-10k      扣费 0.00   ← 无限
    nalang-turbo-1115-16k      扣费 0.00   ← 无限
    nalang-turbo-0826          扣费 0.00   ← 无限
    x-apex-surge-0923-b-16k    扣费 2.22
    x-apex-xl-1110             扣费 1.79
    nalang-max-0826            扣费 2.30

所以只要用 turbo 系列，积分永远不动，账号也不会被扣到 0。

用法
----
  python unlimited.py 3906371 "你好"           # 单次
  python unlimited.py 3906371 --chat           # 交互
  python unlimited.py 3906371 --burst 100      # 连发 100 次压测
  python unlimited.py --verify                  # 自检：跑 5 次并对比余额
"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

# 实测全部零扣费
FREE_MODELS = [
    "nalang-turbo-1115-16k",
    "nalang-turbo-1115-10k",
    "nalang-turbo-1115",
    "nalang-turbo-0826-16k",
    "nalang-turbo-0826-10k",
    "nalang-turbo-0826",
]
DEFAULT_MODEL = "nalang-turbo-1115-16k"


def pick_account():
    """选一个 token 仍有效的账号（优先余额高的，但余额已不重要）"""
    pool = C.load_pool()
    cands = sorted(pool, key=lambda a: -(a.get("credit") or 0))
    for a in cands:
        tok = a.get("access_token")
        if not tok:
            continue
        try:
            st, j = C.get_balance(tok)
            if st == 200:
                a["credit"] = j[0]["result"]["data"]["json"].get("total")
                return a
        except Exception:
            continue
    return None


def renew(acc):
    """token 过期时用 JWT 里的 pwd 重登"""
    try:
        from refresh_accounts import account_creds, sign_in
        email, pwd, _ = account_creds(acc)
        if not email or not pwd:
            return False
        ok, auth, _msg = sign_in(email, pwd)
        if ok and auth and auth.get("access_token"):
            acc["access_token"] = auth["access_token"]
            acc["refresh_token"] = auth.get("refresh_token") or acc.get("refresh_token")
            C.save_pool(C.load_pool())
            return True
    except Exception:
        pass
    return False


def new_chat(acc, card_id):
    st, j = C.trpc_post("chat.createByCard", {"cardId": int(card_id)}, acc["access_token"])
    try:
        return j["result"]["data"]["json"]["chatId"]
    except Exception:
        return None


def ask(acc, card_id, text, model=DEFAULT_MODEL, max_tokens=1000, chat_id=None):
    """发一条消息，返回 (ok, reply_text, chat_id)"""
    import requests
    if chat_id is None:
        chat_id = new_chat(acc, card_id)
        if not chat_id:
            return False, "createByCard failed", None
    body = {
        "operation": "generate",
        "chatId": chat_id,
        "cardId": int(card_id),
        "chatSettings": {
            "model": model,
            "style": "standard",
            "maxTokens": max_tokens,
            "randomIndex": -1,
            "deepThinking": False,
            "enableMemoryEnhance": False,
            "voiceSettings": {
                "ignore_parentheses": False,
                "only_quotes": True,
                "ignore_english": False,
                "read_asterisks": False,
            },
        },
        "presetConfig": {"presetIds": []},
        "prompts": [{"role": "user", "content": text}],
        "chunkedHistory": True,
        "supportsSuggestions": True,
        "content": text,
    }
    try:
        r = requests.post(C.BASE + "/api/chat", headers=C._headers(acc["access_token"]),
                          data=json.dumps(body), proxies=C.PROXIES, timeout=180, stream=True)
    except Exception as e:
        return False, "net:" + str(e)[:60], chat_id
    if r.status_code != 200:
        return False, "HTTP %d" % r.status_code, chat_id
    out = []
    try:
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            s = line[5:].strip() if line.startswith("data:") else line.strip()
            if s in ("", "[DONE]"):
                continue
            try:
                j = json.loads(s)
            except Exception:
                continue
            if isinstance(j, dict) and j.get("type") == "token" and isinstance(j.get("data"), str):
                out.append(j["data"])
    except Exception:
        pass
    return True, "".join(out), chat_id


def balance(acc):
    try:
        st, j = C.get_balance(acc["access_token"])
        return j[0]["result"]["data"]["json"].get("total")
    except Exception:
        return None


def verify(times=5):
    """自检：连续对话 times 次，对比余额"""
    acc = pick_account()
    if not acc:
        print("无可用账号")
        return False
    b0 = balance(acc)
    print("账号 %s  起始余额 %s" % (acc["user_id"][:13], b0))
    ok = 0
    for i in range(times):
        good, reply, _ = ask(acc, 3906371, "自检第 %d 次：说一句话" % (i + 1))
        if good:
            ok += 1
        time.sleep(1.2)
    b1 = balance(acc)
    spent = round(b0 - b1, 2) if (b0 is not None and b1 is not None) else None
    print("成功 %d/%d   余额 %s -> %s   扣费 %s" % (ok, times, b0, b1, spent))
    verdict = (spent == 0 and ok >= times - 1)
    print("结论:", "零扣费成立（无限额度）" if verdict else "存在扣费或失败，需复查")
    return verdict


def burst(card_id, times):
    acc = pick_account()
    if not acc:
        print("无可用账号")
        return
    b0 = balance(acc)
    ok = 0
    for i in range(times):
        good, _r, _c = ask(acc, card_id, "压测 %d" % i)
        if good:
            ok += 1
        if (i + 1) % 10 == 0:
            print("  已发 %d 次，成功 %d，余额 %s" % (i + 1, ok, balance(acc)), flush=True)
        time.sleep(0.8)
    b1 = balance(acc)
    print("压测完成：成功 %d/%d，余额 %s -> %s，总扣费 %s" % (
        ok, times, b0, b1, round(b0 - b1, 2) if (b0 is not None and b1 is not None) else "?"))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    if sys.argv[1] == "--verify":
        verify()
        return
    card_id = sys.argv[1]
    if len(sys.argv) < 3:
        print(__doc__)
        return
    if sys.argv[2] == "--chat":
        acc = pick_account()
        if not acc:
            print("无可用账号")
            return
        chat_id = new_chat(acc, card_id)
        print("会话 %s，模型 %s（零扣费）。输入 exit 退出" % ((chat_id or "?")[:8], DEFAULT_MODEL))
        while True:
            try:
                t = input("你> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not t or t.lower() in ("exit", "quit"):
                break
            good, reply, chat_id = ask(acc, card_id, t, chat_id=chat_id)
            print("AI>", reply if good else "[失败] " + str(reply))
            print("   (余额 %s)" % balance(acc))
    elif sys.argv[2] == "--burst":
        n = int(sys.argv[3]) if len(sys.argv) > 3 else 20
        burst(card_id, n)
    else:
        text = " ".join(sys.argv[2:])
        acc = pick_account()
        if not acc:
            print("无可用账号")
            return
        good, reply, _ = ask(acc, card_id, text)
        print(reply if good else "[失败] " + str(reply))


if __name__ == "__main__":
    main()
