# -*- coding: utf-8 -*-
"""探测 relay 接受的鉴权形式：X-MGW-Auth / Bearer access_token / Bearer base64 / cookie。

relay 不在 dzmm.ai 的 418 风控后面，可自由测试。
"""
import base64
import json
import sys

import requests

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

BASE = "https://api.sillytraven.dev/api/ai"


def b64(s):
    return base64.b64encode(s.encode()).decode()


def card_body():
    return {
        "model": "x-apex-surge-0505-16k",
        "style": "standard",
        "user_name": "probe",
        "user_id": "probe_uid",
        "conversation_id": "c1",
        "request_id": "r1",
        "card": {"name": "A", "description": "d", "personality": "p",
                 "scenario": "s", "first_message": "hi", "system_prompt": "stay"},
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 8,
        "temperature": 0.8,
        "stream": False,
    }


def v1_body():
    return {"model": "x-apex-surge-0505-16k",
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 8, "stream": False}


def trial(label, path, headers, body, cookies=None):
    try:
        r = requests.post(BASE + path, headers={"Content-Type": "application/json", **headers},
                          data=json.dumps(body), proxies=C.PROXIES, timeout=45, cookies=cookies)
        txt = r.text.replace("\n", " ")[:220]
        print("%-42s %-3d %s" % (label, r.status_code, txt))
    except Exception as e:
        print("%-42s ERR %s" % (label, str(e)[:90]))


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    at, rt = real["access_token"], real.get("refresh_token", "")
    blob = b64(json.dumps({"access_token": at, "refresh_token": rt}, separators=(",", ":")))

    print("== v2 chat/completions ==")
    trial("v2 no-auth", "/v2/chat/completions", {}, card_body())
    trial("v2 X-MGW-Auth: b64(json)", "/v2/chat/completions", {"X-MGW-Auth": blob}, card_body())
    trial("v2 X-MGW-Auth: raw jwt", "/v2/chat/completions", {"X-MGW-Auth": at}, card_body())
    trial("v2 Authorization: b64 blob", "/v2/chat/completions", {"Authorization": "Bearer " + blob}, card_body())
    trial("v2 Authorization: jwt", "/v2/chat/completions", {"Authorization": "Bearer " + at}, card_body())
    trial("v2 cookie sb-rls-auth-token",
          "/v2/chat/completions", {},
          card_body(), cookies={"sb-rls-auth-token": "base64-" + base64.urlsafe_b64encode(
              json.dumps({"access_token": at, "refresh_token": rt}).encode()).decode().rstrip("=")})

    print("== v1 chat/completions ==")
    trial("v1 X-MGW-Auth: b64(json)", "/v1/chat/completions", {"X-MGW-Auth": blob}, v1_body())
    trial("v1 Authorization: jwt", "/v1/chat/completions", {"Authorization": "Bearer " + at}, v1_body())

    print("== models ==")
    for path in ["/v1/models", "/v2/models"]:
        for hname, hv in [("none", None), ("jwt", at), ("blob", blob)]:
            h = {} if hv is None else {"Authorization": "Bearer " + hv}
            try:
                r = requests.get(BASE + path, headers=h, proxies=C.PROXIES, timeout=30)
                print("%-12s %-6s %-3d %s" % (path, hname, r.status_code, r.text[:90].replace("\n", " ")))
            except Exception as e:
                print(path, hname, "ERR", str(e)[:60])


if __name__ == "__main__":
    main()
