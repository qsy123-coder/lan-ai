# -*- coding: utf-8 -*-
"""木瓜玩 H5 SDK 接口客户端（用站点泄露的 gameappid/accesskey 自签）。

签名：md5_sign = MD5(按 key 排序后的「值」直接拼接 .trim() + accesskey)
传输：POST gameurl + path, Content-Type: text/plain, body = base64(utf8(JSON))

只读接口：/sdk/user/oauth_param, /sdk/user/get_game_price, /sdk/pay/get_pay_way
账号接口：/sdk/User/user_login, /sdk/User/user_register
支付接口：/sdk/pay/h5_pay, /sdk/pay/get_orderno_restart, /sdk/user/game_is_pay
"""
import base64
import hashlib
import json
import sys
import uuid

import requests

GAME = {
    "game_id": "253",
    "game_appid": "849480A6CD9C31F47",
    "game_name": "電子魅魔(H5)",
    "device_name": "H5",
}
ACCESSKEY = "ebL8oZNst4WKewa"
GAMEURL = "https://sdk.ghjwq.com"
PROXY = None  # 复用 client 的代理设置


def _proxies():
    global PROXY
    if PROXY is None:
        sys.path.insert(0, __file__.rsplit("\\", 1)[0])
        try:
            import client as C
            PROXY = C.PROXIES
        except Exception:
            PROXY = None
    return PROXY


def sign(params):
    items = sorted(params.items(), key=lambda kv: kv[0].strip())
    cat = "".join(str(v) for _, v in items).strip()
    return hashlib.md5((cat + ACCESSKEY).encode("utf-8")).hexdigest()


def call(path, params=None, extra=None):
    p = dict(GAME)
    if extra:
        p.update(extra)
    if params:
        p.update(params)
    p["md5_sign"] = sign(p)
    body = base64.b64encode(json.dumps(p, ensure_ascii=False, separators=(",", ":")).encode("utf-8")).decode()
    r = requests.post(GAMEURL + path, data=body,
                      headers={"Content-Type": "text/plain", "User-Agent": "Mozilla/5.0",
                               "Origin": "https://www.dzmm.ai", "Referer": "https://www.dzmm.ai/"},
                      proxies=_proxies(), timeout=30)
    out = {"http": r.status_code, "raw": r.text[:300]}
    try:
        dec = json.loads(base64.b64decode(r.text))
        out["json"] = dec
        out["msg"] = dec.get("msg")
        out["code"] = dec.get("code")
        dec.pop("msg", None)
        out["data"] = json.dumps(dec.get("data"), ensure_ascii=False)[:400]
    except Exception as e:
        out["decode_err"] = str(e)[:80]
    return out


def call_plain(path, extra=None, account=None, token=None, user_id=None):
    """部分端点（game_is_pay）用明文 JSON、不签名。"""
    p = dict(GAME)
    if account:
        p["account"] = account
    if token:
        p["token"] = token
    if user_id:
        p["user_id"] = user_id
    if extra:
        p.update(extra)
    r = requests.post(GAMEURL + path, data=json.dumps(p, ensure_ascii=False),
                      headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0",
                               "Origin": "https://www.dzmm.ai", "Referer": "https://www.dzmm.ai/"},
                      proxies=_proxies(), timeout=30)
    out = {"http": r.status_code}
    try:
        out["json"] = r.json()
    except Exception:
        out["raw"] = r.text[:300]
    return out


if __name__ == "__main__":
    import pprint
    print("== game_is_pay (plain json)")
    pprint.pprint(call_plain("/sdk/user/game_is_pay"))
    print("== get_game_price {}")
    pprint.pprint(call("/sdk/user/get_game_price"))
    print("== game_is_pay_inner {}")
    pprint.pprint(call("/sdk/user/game_is_pay_inner"))
