# scripts/probe_sse_shape.py —— 直连上游 /api/chat，打印原始 SSE 事件形状
#
# 用途：确认建议回复（<sug>/<lug>）到底是正文里的标签，还是独立事件。
# 只读本机 accounts.json 的 cookie，不写任何文件。
#
# 用法:
#   python scripts/probe_sse_shape.py <account> <cardId> <chatId> [prompt] [model]
import io
import json
import os
import sys

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"
PROXY = "http://127.0.0.1:7897"


def load(p):
    with io.open(p, encoding="utf-8") as f:
        return json.load(f)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 2
    acct, card, chat = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    prompt = sys.argv[4] if len(sys.argv) > 4 else "你好"
    model = sys.argv[5] if len(sys.argv) > 5 else "x-apex-surge-0505"

    acc = load(os.path.join(ROOT, "accounts.json"))[acct]
    cookie = acc["cookie"]
    if chat in ("new", "-"):
        cb = creq.post(
            BASE + "/api/trpc/chat.createByCard",
            data=json.dumps({"json": {"cardId": card}}).encode("utf-8"),
            headers={
                "content-type": "application/json",
                "cookie": cookie,
                "x-dzmm-client": "web",
                "origin": BASE,
                "referer": BASE + "/",
                "accept": "*/*",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            },
            impersonate="chrome",
            proxies={"http": PROXY, "https": PROXY},
            timeout=40,
        )
        print("createByCard", cb.status_code, cb.text[:160])
        if cb.status_code != 200:
            return 1
        chat = json.loads(cb.text)["result"]["data"]["json"]["chatId"]
        print("chatId", chat)
    body = {
        "operation": "generate",
        "chatId": chat,
        "cardId": str(card),
        "chatSettings": {
            "model": model,
            "style": "standard",
            "maxTokens": 1200,
            "randomIndex": 0,
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
        "prompts": [{"role": "user", "content": prompt}],
        "content": prompt,
        "chunkedHistory": True,
        "supportsSuggestions": True,
    }
    hdrs = {
        "content-type": "application/json",
        "cookie": cookie,
        "x-dzmm-client": "web",
        "origin": BASE,
        "referer": BASE + "/",
        "accept": "*/*",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    }
    r = creq.post(
        BASE + "/api/chat",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers=hdrs,
        impersonate="chrome",
        proxies={"http": PROXY, "https": PROXY},
        timeout=180,
        stream=True,
    )
    print("STATUS", r.status_code, "| x-:", {k: v for k, v in r.headers.items() if k.lower().startswith("x-")})
    types = {}
    shown = 0
    for raw in r.iter_lines():
        if not raw:
            continue
        line = raw.decode("utf-8", "ignore") if isinstance(raw, bytes) else raw
        if line.startswith("data:"):
            line = line[5:].strip()
        if not line or line == "[DONE]":
            continue
        try:
            obj = json.loads(line)
        except Exception:
            print("NONJSON", line[:100])
            continue
        t = obj.get("type")
        types[t] = types.get(t, 0) + 1
        s = json.dumps(obj, ensure_ascii=False)
        if shown < 160:
            print("[%s] keys=%s %s" % (t, ",".join(obj.keys()), s[:170]))
            shown += 1
        if t == "complete":
            d = obj.get("data") or {}
            print("COMPLETE keys:", ",".join(d.keys()))
            for k, v in d.items():
                if "sug" in k.lower() or "recommend" in k.lower():
                    print("COMPLETE field %s = %s" % (k, json.dumps(v, ensure_ascii=False)[:500]))
        if "sug" in s.lower() and t != "complete":
            print("!!! SUG HIT:", s[:300])
    print("TYPES", json.dumps(types, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
