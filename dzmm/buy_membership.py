# -*- coding: utf-8 -*-
"""dzmm 会员（VIP1）→ API token 最低成本链路。

原理
----
- `user.getApiToken` 的门槛是 membership_level >= 1，而等级由「本周期充值」决定：
  getVipStatus 返回 next_level_threshold_credits=1（≈$0.01），has_ever_recharged=false。
- 充值走 mgwan（木瓜玩）H5 支付：dzmm 用 `mgwan.createOrder({amount})` 生成本地订单
  （档位只允许 3000/6800/12800/32800 分），返回 orderId（UUID）。
- 客户端再用 `/sdk/pay/h5_pay` 向 mgwan 下单，**price 由客户端传入**。支付宝通道
  最小金额为 1.00 元（0.1/0.01 被拒：「建议更换金额或其他支付方式」）。
- mgwan 侧对 dzmm 订单号只作为 `extend` 透传，dzmm 用 `mgwan.getOrderStatus` 回查，
  返回 {status, amountReceived, amountOrder}。

因此最低成本路径是：dzmm 建 30 元档订单 → mgwan 侧只支付 1 元 → dzmm 回查到账后
按 amountReceived 结算，并把本周期充值额推到阈值以上 → membership_level=1 → 可领 apiToken。

用法
----
  python buy_membership.py                 # 建单 + 生成 1.00 元支付宝链接
  python buy_membership.py --price 1       # 指定金额
  python buy_membership.py --verify        # 轮询订单状态 + 查会员 + 取 apiToken
  python buy_membership.py --verify --order <orderId>
"""
import json
import sys
import time
import urllib.parse

import requests

HERE = __file__.rsplit("\\", 1)[0]
sys.path.insert(0, HERE)
import client as C
import mgw_api as M

STATE = "membership_order.json"
DZMM_AMOUNT = 3000      # dzmm 允许的最小档位（30 元）
PRICE = 1.0             # 支付宝通道实测最小可用金额
PAYWAY = {"ali": "1", "wx": "2", "yhk": "3"}   # code = get_pay_way 的通道序号


def load_mgw():
    """读取并刷新 mgwan 账号 token（token 每次登录轮换）"""
    d = json.load(open("mgw_acct.json", encoding="utf-8"))
    r = M.call("/sdk/User/user_login", {"account": d["account"], "password": d["password"]})
    if r.get("code") != 200:
        raise SystemExit("mgwan 登录失败: %s %s" % (r.get("code"), r.get("msg")))
    data = r["json"]["data"]
    d["login"] = {"data": data}
    d["token"] = data["token"]
    json.dump(d, open("mgw_acct.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return d


def create_dzmm_order(tok, amount=DZMM_AMOUNT):
    st, j = C.trpc_post("mgwan.createOrder", {"amount": amount}, tok)
    if st != 200:
        raise SystemExit("createOrder 失败 %s %s" % (st, str(j)[:200]))
    return j["result"]["data"]["json"]["orderId"]


def mgw_pay(acct, order_id, price=PRICE, pay_way="ali"):
    tok = acct["token"]
    uid = str(acct["login"]["data"]["user_id"])
    acc = acct["account"]
    p = {
        "device_name": "H5", "equipment_num": "",
        "game_id": "253", "server_id": "253",
        "game_name": "電子魅魔(H5)", "server_name": "電子魅魔(H5)",
        "promote_id": "0", "sdk_version": "3",
        "game_appid": "849480A6CD9C31F47",
        "account": acc, "game_player_name": acc, "game_player_id": uid,
        "role_level": uid, "small_id": uid, "user_id": uid,
        "extend": order_id, "extra_param": "",
        "body": "充值", "title": "充值", "price": price,
        "token": tok, "pay_way": pay_way, "code": PAYWAY.get(pay_way, "1"),
    }
    r = M.call("/sdk/pay/h5_pay", p)
    return r


def dzmm_status(tok, order_id):
    inp = json.dumps({"0": {"json": {"orderId": order_id}}})
    url = "%s/api/trpc/mgwan.getOrderStatus?batch=1&input=%s" % (
        C.BASE, requests.utils.quote(inp))
    r = C.session().get(url, headers=C._headers(tok), proxies=C.PROXIES, timeout=30)
    if r.status_code != 200:
        return r.status_code, {"raw": r.text[:200]}
    return 200, r.json()[0]["result"]["data"]["json"]


def vip(tok):
    st, j = C.trpc_get("user.getVipStatus", tok)
    if st == 200:
        return j[0]["result"]["data"]["json"]
    return {"status": st}


def api_token(tok):
    st, j = C.trpc_get("user.getApiToken", tok)
    if st == 200:
        return j[0]["result"]["data"]["json"]
    return {"status": st}


def main():
    args = sys.argv[1:]
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]

    if "--verify" in args:
        oid = None
        if "--order" in args:
            oid = args[args.index("--order") + 1]
        elif __import__("os").path.exists(STATE):
            oid = json.load(open(STATE, encoding="utf-8"))["orderId"]
        if not oid:
            raise SystemExit("没有订单号：先跑一次建单，或用 --order 指定")
        print("订单:", oid)
        for i in range(12):
            st, s = dzmm_status(tok, oid)
            print("[%s] getOrderStatus -> %s %s" % (time.strftime("%H:%M:%S"), st,
                                                   json.dumps(s, ensure_ascii=False)))
            if st == 200 and s.get("status") in ("paid", "processed"):
                break
            time.sleep(10)
        print("\ngetVipStatus ->", json.dumps(vip(tok), ensure_ascii=False))
        print("getApiToken  ->", json.dumps(api_token(tok), ensure_ascii=False))
        return

    price = PRICE
    if "--price" in args:
        price = float(args[args.index("--price") + 1])
    pay_way = "ali"
    if "--payway" in args:
        pay_way = args[args.index("--payway") + 1]

    acct = load_mgw()
    print("mgwan 账号:", acct["account"], "user_id:", acct["login"]["data"]["user_id"])
    oid = create_dzmm_order(tok)
    print("dzmm 订单:", oid, "（档位 amount=%d 分）" % DZMM_AMOUNT)

    r = mgw_pay(acct, oid, price, pay_way)
    print("h5_pay ->", r.get("code"), r.get("msg"))
    data = (r.get("json") or {}).get("data") or {}
    if r.get("code") != 200:
        print("raw:", str(r.get("json"))[:300])
        return
    url = urllib.parse.unquote(data.get("payUrl", ""))
    print("mgwan 订单号:", data.get("orderno"))
    print("支付链接:", url)
    print("应付: %.2f 元" % price)
    json.dump({"orderId": oid, "orderno": data.get("orderno"), "payUrl": url,
               "price": price, "at": int(time.time())},
              open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\n付款后执行: python buy_membership.py --verify")


if __name__ == "__main__":
    main()
