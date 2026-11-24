# -*- coding: utf-8 -*-
"""探测直连 AI API 的 token 门槛 + admin 端点是否可用（只读优先）。"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C
import requests


def ts():
    return time.strftime("%H:%M:%S")


def call(method, path, tok, body=None):
    url = C.BASE + path
    h = C._headers(tok)
    h["Accept"] = "application/json"
    try:
        if method == "GET":
            r = C.session().get(url, headers=h, proxies=C.PROXIES, timeout=30)
        else:
            r = C.session().post(url, headers=h, data=json.dumps(body or {}),
                                 proxies=C.PROXIES, timeout=30)
        txt = r.text[:300].replace("\n", " ")
        return r.status_code, txt
    except Exception as e:
        return -1, str(e)[:120]


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real.get("access_token")
    uid = real.get("user_id") or real.get("user", {}).get("id") or "1af4cf04-9d98-4797-a947-961fe7ad44ce"

    probes = [
        # 直连 AI API 的 token 生成端点（UI 实际用的）
        ("POST", "/api/with-auth/dzmm/generate-api-token", {}),
        # 管理员 relay apikeys（只读列表）
        ("GET", "/api/admin/game-studio/relay/apikeys?page=1&pageSize=20", None),
        ("GET", "/api/admin/rate-guard/overrides", None),
        ("GET", "/api/admin/game-studio/quota/override?userId=" + uid, None),
        ("GET", "/api/admin/game-studio/quota/policy", None),
        # tRPC 管理过程（只读）
        ("GET", "/api/trpc/admin.gameStudio.listRelayApiKeys?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22page%22%3A1%2C%22pageSize%22%3A20%7D%7D%7D", None),
        ("GET", "/api/trpc/admin.rateGuard.listOverrides?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D", None),
    ]
    for m, p, b in probes:
        st, txt = call(m, p, tok, b)
        print("[%s] %s %s -> %d %s" % (ts(), m, p, st, txt))
        time.sleep(0.4)


if __name__ == "__main__":
    main()
