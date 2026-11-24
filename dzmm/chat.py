# -*- coding: utf-8 -*-
"""
dzmm.ai 无限额度对话客户端
- 账号池自动选择（余额最高优先）
- 积分不足自动切换账号
- 纯 API，无浏览器

用法:
  python chat.py 3906371 "你好"
  python chat.py 3906371 --interactive
"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

# 便宜模型（0.1 积分/1k token）
CHEAP_MODEL = "nalang-turbo-1115-10k"
MID_MODEL = "nalang-xl-0826-16k"


def pick_account(min_credit=1.0):
    """选余额最高的账号"""
    pool = C.load_pool()
    best = None
    for a in pool:
        tok = a.get("access_token")
        if not tok:
            continue
        st, bal = C.get_balance(tok)
        try:
            b = bal[0]["result"]["data"]["json"]
            total = b.get("total", 0)
        except Exception:
            continue
        a["credit"] = total
        if total >= min_credit and (best is None or total > best[1]):
            best = (a, total)
    C.save_pool(pool)
    return best


def create_chat(token, card_id):
    st, j = C.trpc_post("chat.createByCard", {"cardId": int(card_id)}, token)
    try:
        return j["result"]["data"]["json"]["chatId"]
    except Exception:
        return None


def send_message(token, chat_id, card_id, text, model=CHEAP_MODEL, max_tokens=1000):
    """POST /api/chat，返回 (ok, reply_text, raw)"""
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
    import requests
    r = requests.post(C.BASE + "/api/chat", headers=C._headers(token),
                      data=json.dumps(body), proxies=C.PROXIES, timeout=180, stream=True)
    if r.status_code != 200:
        return False, None, {"status": r.status_code, "text": r.text[:300]}
    chunks = []
    try:
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            chunks.append(line)
    except Exception as e:
        return False, None, {"err": str(e)}
    raw = "\n".join(chunks)
    return True, _extract_reply(raw), raw[:2000]


def _extract_reply(raw):
    """从 SSE 流里提取回复文本"""
    out = []
    for line in raw.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("data:"):
            line = line[5:].strip()
        if line in ("[DONE]", ""):
            continue
        try:
            j = json.loads(line)
        except Exception:
            out.append(line)
            continue
        if not isinstance(j, dict):
            continue
        # dzmm SSE: {"type":"token","data":"..."}
        if j.get("type") == "token" and isinstance(j.get("data"), str):
            out.append(j["data"])
            continue
        # OpenAI 兼容
        if isinstance(j.get("choices"), list):
            try:
                d = j["choices"][0].get("delta") or {}
                if isinstance(d.get("content"), str):
                    out.append(d["content"])
            except Exception:
                pass
            continue
        # 兜底
        for k in ("content", "text", "delta"):
            if isinstance(j.get(k), str):
                out.append(j[k])
                break
    return "".join(out) if out else None


def chat_once(card_id, text, model=CHEAP_MODEL):
    """完整流程：选号 -> 建会话 -> 发消息 -> 积分不足换号"""
    for attempt in range(6):
        picked = pick_account(min_credit=0.5)
        if not picked:
            return False, "账号池无可用账号（余额不足或为空）"
        acc, credit = picked
        tok = acc["access_token"]
        chat_id = create_chat(tok, card_id)
        if not chat_id:
            # 可能限流或账号失效，换下一个
            acc["credit"] = 0
            C.save_pool(C.load_pool())
            continue
        ok, reply, raw = send_message(tok, chat_id, card_id, text, model=model)
        if ok:
            st, bal = C.get_balance(tok)
            try:
                acc["credit"] = bal[0]["result"]["data"]["json"].get("total")
            except Exception:
                pass
            pool = C.load_pool()
            for a in pool:
                if a.get("user_id") == acc.get("user_id"):
                    a["credit"] = acc["credit"]
            C.save_pool(pool)
            return True, reply or raw
        # 失败重试
        print("  尝试 %d 失败: %s" % (attempt + 1, str(raw)[:150]))
        time.sleep(2)
    return False, "多次尝试失败"


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return
    card_id = sys.argv[1]
    if sys.argv[2] == "--interactive":
        print("交互模式，输入 exit 退出")
        while True:
            try:
                t = input("你> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not t or t.lower() in ("exit", "quit"):
                break
            ok, reply = chat_once(card_id, t)
            print("AI> %s" % (reply if ok else "[失败] " + str(reply)))
    else:
        text = " ".join(sys.argv[2:])
        ok, reply = chat_once(card_id, text)
        print(reply if ok else "[失败] " + str(reply))


if __name__ == "__main__":
    main()
