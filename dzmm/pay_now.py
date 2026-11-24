# -*- coding: utf-8 -*-
"""一条命令：建单 -> 出支付宝码 -> 打印图片与收银台链接。

支付宝预下单二维码只有几分钟有效期，过期重跑本脚本即可（旧单可复用）。

用法:
  python pay_now.py                # 新建 1 元单并出码
  python pay_now.py --reuse        # 复用 membership_order.json 里的单，只重出码
  python pay_now.py --price 30     # 指定金额（默认 1.00）
  python pay_now.py --open         # 出码后用系统默认浏览器打开收银台
"""
import json
import os
import sys
import time
import urllib.parse
import webbrowser

HERE = __file__.rsplit("\\", 1)[0]
sys.path.insert(0, HERE)
import client as C
import buy_membership as B
import qr_from_order as Q

STATE = os.path.join(HERE, "membership_order.json")
PNG = os.path.join(HERE, "pay_qr_1yuan.png")


def renew_token(real):
    """401 时用邮箱密码换新 access_token"""
    from refresh_accounts import sign_in
    ok, auth, msg = sign_in(real["email"], real["password"])
    if not ok:
        raise SystemExit("续期失败: %s" % msg)
    real["access_token"] = auth["access_token"]
    real["refresh_token"] = auth.get("refresh_token")
    json.dump(real, open(os.path.join(HERE, "real_account.json"), "w",
                         encoding="utf-8"), ensure_ascii=False, indent=1)
    print("token 已续期")
    return real["access_token"]


def main():
    args = sys.argv[1:]
    price = float(args[args.index("--price") + 1]) if "--price" in args else 1.0
    reuse = "--reuse" in args and os.path.exists(STATE)

    real = json.load(open(os.path.join(HERE, "real_account.json"), encoding="utf-8"))
    tok = real["access_token"]

    if reuse:
        st = json.load(open(STATE, encoding="utf-8"))
        order_id, pay_url, orderno = st["orderId"], st["payUrl"], st.get("orderno")
        print("复用订单:", order_id)
    else:
        acct = B.load_mgw()
        print("mgwan:", acct["account"], "| user_id:", acct["login"]["data"]["user_id"])
        try:
            order_id = B.create_dzmm_order(tok)
        except SystemExit:
            tok = renew_token(real)
            order_id = B.create_dzmm_order(tok)
        print("dzmm 订单:", order_id)
        r = B.mgw_pay(acct, order_id, price, "ali")
        if r.get("code") != 200:
            # mgwan token 可能被浏览器登录轮换，重登后重试一次
            acct = B.load_mgw()
            r = B.mgw_pay(acct, order_id, price, "ali")
        if r.get("code") != 200:
            raise SystemExit("h5_pay 失败: %s %s" % (r.get("code"), r.get("msg")))
        data = r["json"]["data"]
        pay_url = urllib.parse.unquote(data["payUrl"])
        orderno = data.get("orderno")
        json.dump({"orderId": order_id, "orderno": orderno, "payUrl": pay_url,
                   "price": price, "at": int(time.time())},
                  open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print("mgwan 订单号:", orderno)
    print("入口链接:", pay_url)

    code_url, final_url, _ = Q.follow(pay_url)
    if not code_url:
        print("未取到二维码，请直接用浏览器打开入口链接")
        if "--open" in args:
            webbrowser.open(pay_url)
        return

    import qrcode
    # 用收银台地址做码：每次打开都会生成新的支付宝码，不受单张码时效影响。
    # 若 code_url 本身就是 qr.alipay.com 的官方码，则优先用它（扫了直接付）。
    target = code_url if "qr.alipay.com" in code_url else final_url
    qrcode.make(target).resize((420, 420)).save(PNG)
    print("\n应付金额: %.2f 元" % price)
    print("支付宝码:", code_url)
    print("二维码内容:", target)
    print("二维码图:", PNG)
    print("收银台(手机可直接打开，自动出新码):", final_url)
    if "--open" in args:
        webbrowser.open(final_url)
    print("\n付款后: python buy_membership.py --verify")


if __name__ == "__main__":
    main()
