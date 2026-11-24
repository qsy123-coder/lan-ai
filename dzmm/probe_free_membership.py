# -*- coding: utf-8 -*-
"""0 成本拿会员/会员等价的候选路径排查（网络恢复后一键跑）。

检查项：
  1. giftcard 兑换接口的 uuid 校验强度 + 是否泄露可用的 giftcard 来源
  2. 邀请佣金（U）余额 —— 能否 0 成本换 giftcard
  3. bountyQuest 奖励是否计入「本周期充值」
  4. credits.getStatement 里是否存在非支付类入账（活动/补偿）
  5. mgwan.loginCallback 同步会员的可行性（需要已付费渠道号）

用法: python probe_free_membership.py
"""
import json
import sys
import time
import uuid

import requests

HERE = __file__.rsplit("\\", 1)[0]
sys.path.insert(0, HERE)
import client as C


def ts():
    return time.strftime("%H:%M:%S")


def get(path, tok, label):
    h = C._headers(tok)
    h["Accept"] = "application/json"
    try:
        r = C.session().get(C.BASE + path, headers=h, proxies=C.PROXIES, timeout=25)
        print("[%s] GET  %-46s %d %s" % (ts(), label, r.status_code, r.text[:220].replace("\n", " ")))
        return r
    except Exception as e:
        print("[%s] GET  %-46s ERR %s" % (ts(), label, str(e)[:80]))
        return None
    finally:
        time.sleep(1.2)


def post(path, tok, body, label):
    h = C._headers(tok)
    h["Accept"] = "application/json"
    try:
        r = C.session().post(C.BASE + path, headers=h, data=json.dumps(body),
                             proxies=C.PROXIES, timeout=25)
        print("[%s] POST %-46s %d %s" % (ts(), label, r.status_code, r.text[:220].replace("\n", " ")))
        return r
    except Exception as e:
        print("[%s] POST %-46s ERR %s" % (ts(), label, str(e)[:80]))
        return None
    finally:
        time.sleep(1.2)


def main():
    real = json.load(open("real_account.json", encoding="utf-8"))
    tok = real["access_token"]

    print("=== 0. 基线 ===")
    st, j = C.trpc_get("user.getVipStatus", tok)
    if st == 200:
        print("   vip:", json.dumps(j[0]["result"]["data"]["json"], ensure_ascii=False))
    st, j = C.trpc_get("user.getApiToken", tok)
    if st == 200:
        print("   apiToken:", json.dumps(j[0]["result"]["data"]["json"], ensure_ascii=False))

    print("\n=== 1. 邀请 / 佣金（U）===")
    get("/api/with-auth/dzmm/invite-info", tok, "invite-info")
    get("/api/with-auth/dzmm/get-user-invite-codes", tok, "get-user-invite-codes")
    get("/api/with-auth/dzmm/affiliate/dashboard-overview", tok, "affiliate/dashboard-overview")

    print("\n=== 2. giftcard 来源与兑换校验 ===")
    get("/api/with-auth/dzmm/giftcard-conversion-logs", tok, "giftcard-conversion-logs")
    get("/api/with-auth/dzmm/recent-payment-records", tok, "recent-payment-records")
    # 合法 v4 uuid 但不存在 -> 判断是否有「不存在」与「已使用」的区分
    probe = str(uuid.uuid4())
    post("/api/with-auth/dzmm/redeem-giftcard", tok, {"uuid": probe},
         "redeem-giftcard(候选 uuid %s)" % probe[:8])

    print("\n=== 3. 积分流水类目（找非支付入账）===")
    st, j = C.trpc_get("credits.getStatement", tok, {"limit": 50})
    if st == 200:
        try:
            rows = j[0]["result"]["data"]["json"]
            items = rows.get("items") if isinstance(rows, dict) else rows
            kinds = {}
            for it in (items or []):
                k = it.get("kind") or it.get("type") or it.get("source") or "?"
                kinds[k] = kinds.get(k, 0) + 1
            print("   类目统计:", json.dumps(kinds, ensure_ascii=False))
        except Exception as e:
            print("   解析失败:", str(e)[:80])
    else:
        print("   credits.getStatement ->", st)

    print("\n=== 4. 赏金任务（奖励性质）===")
    st, j = C.trpc_get("bountyQuest.myQuests", tok)
    if st == 200:
        print("   myQuests:", json.dumps(j, ensure_ascii=False)[:400])
    st, j = C.trpc_get("bountyQuest.myClaims", tok)
    if st == 200:
        print("   myClaims:", json.dumps(j, ensure_ascii=False)[:300])

    print("\n=== 5. 结论提示 ===")
    print("   - 若 giftcard 兑换对「不存在」和「已使用」返回不同错误，可做 uuid 批量试；")
    print("     但 uuid 为随机 v4，枚举不可行，唯一来源是他人分享/活动发放。")
    print("   - 若 invite-info 的 U 余额 > 0，可 convert-u-to-giftcard 换成兑换码再 redeem。")
    print("   - 若 statement 出现非支付类目且计入 recharge，则可用该途径刷 membership_level。")
    print("   - 以上任一可行即 0 成本拿 apiToken；否则用 openai_proxy.py（已交付）。")


if __name__ == "__main__":
    main()
