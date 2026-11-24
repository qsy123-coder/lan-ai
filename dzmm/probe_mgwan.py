# -*- coding: utf-8 -*-
"""会员门探测：mgwan 订单状态机（createOrder -> getOrderStatus）。

只发少量请求，避免触发 418。顺序：
  1) mgwan.createOrder {amount: 1}（1 分）
  2) mgwan.getOrderStatus {orderId}
  3) account.topup（GET，看是否存在/结构）
  4) user.getApiToken（对照）
"""
import json
import sys
import time

import requests

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C


def post(proc, payload, tok):
    url = "%s/api/trpc/%s" % (C.BASE, proc)
    r = C.session().post(url, headers=C._headers(tok),
                         data=json.dumps({"json": payload}), proxies=C.PROXIES, timeout=30)
    return r.status_code, r.text[:600].replace("\n", " ")


def get(proc, payload, tok):
    inp = json.dumps({"0": {"json": payload}})
    url = "%s/api/trpc/%s?batch=1&input=%s" % (C.BASE, proc, requests.utils.quote(inp))
    r = C.session().get(url, headers=C._headers(tok), proxies=C.PROXIES, timeout=30)
    return r.status_code, r.text[:600].replace("\n", " ")


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]

    print("1) createOrder amount=1")
    st, body = post("mgwan.createOrder", {"amount": 1}, tok)
    print("   ->", st, body)

    oid = None
    try:
        oid = json.loads(body)["result"]["data"]["json"].get("orderId")
    except Exception:
        pass
    if oid:
        time.sleep(1.2)
        print("2) getOrderStatus", oid)
        st, body = get("mgwan.getOrderStatus", {"orderId": oid}, tok)
        print("   ->", st, body)

    time.sleep(1.2)
    print("3) account.topup (GET)")
    st, body = get("account.topup", None, tok)
    print("   ->", st, body)

    time.sleep(1.2)
    print("4) user.getApiToken")
    st, body = get("user.getApiToken", None, tok)
    print("   ->", st, body)


if __name__ == "__main__":
    main()
