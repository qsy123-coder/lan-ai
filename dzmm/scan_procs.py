# -*- coding: utf-8 -*-
"""tRPC 过程存在性扫描：404=不存在，401=需登录，200=可调。
区分「存在但被拦」与「根本不存在」，用于定位会员/API token 的可攻击面。
"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C

CANDS = [
    # 已知
    "user.getMe", "user.getVipStatus", "user.getApiToken", "credits.getBalance",
    "credits.getQuotaOverview", "credits.getStatement",
    # 会员 / 订阅
    "user.getMembership", "user.getMembershipStatus", "user.upgrade", "user.setVip",
    "membership.get", "membership.getStatus", "membership.upgrade", "membership.activate",
    "membership.redeem", "vip.getStatus", "vip.upgrade",
    "subscription.get", "subscription.list", "subscription.cancel", "subscription.manage",
    "billing.getPlans", "billing.plans", "billing.createOrder", "billing.getOrderStatus",
    # mgwan（支付/账号系统）
    "mgwan.createOrder", "mgwan.getOrderStatus", "mgwan.refreshSession",
    "mgwan.prepareAccountSwitch", "mgwan.loginCallback", "mgwan.getApiToken",
    "mgwan.syncSubscription", "mgwan.grantSubscription",
    # 订单 / 充值
    "account.topup", "account.orders", "account.giftCard", "account.profileCard",
    "order.list", "order.create", "order.status", "order.markPaid",
    # 积分卡
    "pointsCard.plans", "pointsCard.purchase", "pointsCard.status",
    # 管理（多半 404）
    "admin.updateStatus", "admin.updateSettings", "admin.quotaOverride",
    "admin.gameStudio.quotaOverride", "admin.rateGuard.listOverrides",
    # 任务/赏金（赚积分）
    "tasks.list", "tasks.initCheckin", "tasks.claim", "bountyQuest.myQuests",
    "bountyQuest.claim", "invite.info", "invitations.info",
]

tok = None


def probe(proc, auth):
    inp = '{"0":{"json":null}}'
    url = "%s/api/trpc/%s?batch=1&input=%s" % (C.BASE, proc, __import__("urllib.parse", fromlist=["quote"]).quote(inp))
    h = C._headers(auth)
    try:
        r = C.session().get(url, headers=h, proxies=C.PROXIES, timeout=25)
    except Exception as e:
        return -1, str(e)[:60]
    if r.status_code == 404 and "No procedure found" in r.text:
        return 404, "NOT_EXIST"
    body = r.text[:160].replace("\n", " ")
    return r.status_code, body


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]
    print("%-34s %-5s %-5s %s" % ("proc", "anon", "auth", "note"))
    for p in CANDS:
        sa, _ = probe(p, None)
        sb, body = probe(p, tok)
        note = "" if sb != 404 else "不存在"
        if sa == 418 or sb == 418:
            note = "captcha_required"
        print("%-34s %-5s %-5s %s" % (p, sa, sb, note))
        time.sleep(0.25)


if __name__ == "__main__":
    main()
