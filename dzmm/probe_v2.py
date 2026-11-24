# -*- coding: utf-8 -*-
"""探测 /api/ai/v2/chat/completions 的鉴权与计费归属。

三组对比：
  A. 完全不带 Authorization，user_id = 我们的 supabase uuid
  B. 带 Bearer access_token（非 api_token），user_id = 我们的 uuid
  C. 不带 Authorization，user_id = 随机字符串（看是否有归属校验）

每组前后各查一次 credits.getBalance，判断扣费落点。
"""
import json
import sys
import time
import uuid

import requests

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

API = "https://api.sillytraven.dev/api/ai/v2/chat/completions"


def balance(tok):
    try:
        st, j = C.get_balance(tok)
        if st == 200:
            return j[0]["result"]["data"]["json"].get("total")
    except Exception as e:
        return "ERR:%s" % str(e)[:40]
    return None


def body(user_name, user_id, max_tokens=40):
    return {
        "model": "x-apex-surge-0505-16k",
        "style": "standard",
        "user_name": user_name,
        "user_id": user_id,
        "conversation_id": "probe_" + uuid.uuid4().hex[:8],
        "request_id": "probe_" + uuid.uuid4().hex[:8],
        "card": {
            "name": "艾琳",
            "description": "温柔但有点毒舌的青梅竹马。",
            "personality": "外冷内热。",
            "scenario": "深夜公寓。",
            "first_message": "怎么这时候还没睡？",
            "system_prompt": "保持人设。",
        },
        "messages": [{"role": "user", "content": "在吗"}],
        "max_tokens": max_tokens,
        "temperature": 0.8,
        "stream": True,
    }


def call(label, headers, user_name, user_id):
    print("\n=== %s ===" % label)
    print("  user_name=%r user_id=%r auth=%s" % (user_name, user_id, "yes" if headers else "none"))
    t0 = time.time()
    try:
        r = requests.post(API, headers={"Content-Type": "application/json", **headers},
                          data=json.dumps(body(user_name, user_id)),
                          proxies=C.PROXIES, timeout=90, stream=True)
        print("  HTTP %d  (%.1fs)" % (r.status_code, time.time() - t0))
        if r.status_code != 200:
            print("  body:", r.text[:400].replace("\n", " "))
            return
        chunks, usage, got = 0, None, []
        for line in r.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data: "):
                continue
            p = line[6:].strip()
            if p == "[DONE]":
                break
            try:
                ev = json.loads(p)
            except Exception:
                continue
            d = (ev.get("choices") or [{}])[0].get("delta") or {}
            if d.get("content"):
                got.append(d["content"])
                chunks += 1
            if ev.get("usage"):
                usage = ev["usage"]
        print("  delta chunks=%d  text=%r" % (chunks, "".join(got)[:60]))
        print("  usage=", json.dumps(usage, ensure_ascii=False) if usage else None)
    except Exception as e:
        print("  EXC:", repr(str(e))[:200])


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]
    import base64
    pay = json.loads(base64.urlsafe_b64decode(tok.split(".")[1] + "==="))
    uid, email = pay["sub"], pay["email"]

    print("account=%s uid=%s" % (email, uid))
    b0 = balance(tok)
    print("balance before = %s" % b0)

    call("A. no-auth, own user_id", {}, email, uid)
    b1 = balance(tok)
    print("balance after A = %s  (delta=%s)" % (b1, (b1 - b0) if isinstance(b0, (int, float)) and isinstance(b1, (int, float)) else "?"))

    call("B. Bearer access_token, own user_id", {"Authorization": "Bearer " + tok}, email, uid)
    b2 = balance(tok)
    print("balance after B = %s  (delta=%s)" % (b2, (b2 - b1) if isinstance(b1, (int, float)) and isinstance(b2, (int, float)) else "?"))

    call("C. no-auth, random user_id", "路人甲", "probe_" + uuid.uuid4().hex[:12])
    b3 = balance(tok)
    print("balance after C = %s  (delta=%s)" % (b3, (b3 - b2) if isinstance(b2, (int, float)) and isinstance(b3, (int, float)) else "?"))

    call("D. no-auth, empty user_id", email, "")


if __name__ == "__main__":
    main()
