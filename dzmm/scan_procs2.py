# -*- coding: utf-8 -*-
"""第二轮：带节流的程序存在性扫描（避开 418），定位会员/支付/API token 面。"""
import json
import sys
import time
import urllib.parse

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

CANDS = [
    "subscription.get", "subscription.list", "subscription.cancel", "subscription.manage",
    "billing.getPlans", "billing.plans", "billing.createOrder", "billing.getOrderStatus",
    "mgwan.createOrder", "mgwan.getOrderStatus", "mgwan.refreshSession",
    "mgwan.prepareAccountSwitch", "mgwan.loginCallback", "mgwan.getApiToken",
    "account.topup", "account.orders", "account.giftCard", "account.profileCard",
    "order.list", "order.create", "order.status", "order.markPaid",
    "pointsCard.plans", "pointsCard.purchase", "pointsCard.status",
    "tasks.list", "tasks.initCheckin", "tasks.claim",
    "bountyQuest.myQuests", "bountyQuest.claim",
    "admin.updateStatus", "admin.updateSettings",
    # 参考：真实存在的对照项
    "user.getMe", "credits.getBalance", "chat.listAll",
]


def probe(proc, token):
    inp = '{"0":{"json":null}}'
    url = "%s/api/trpc/%s?batch=1&input=%s" % (C.BASE, proc, urllib.parse.quote(inp))
    r = C.session().get(url, headers=C._headers(token), proxies=C.PROXIES, timeout=25)
    if "No procedure found" in r.text:
        return 404, "NOT_EXIST"
    if r.status_code == 418:
        return 418, "CAPTCHA"
    return r.status_code, r.text[:140].replace("\n", " ")


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]
    print("%-30s %-4s %s" % ("proc", "st", "body"))
    for p in CANDS:
        try:
            st, body = probe(p, tok)
        except Exception as e:
            st, body = -1, str(e)[:80]
        print("%-30s %-4s %s" % (p, st, body))
        time.sleep(1.6)


if __name__ == "__main__":
    main()
