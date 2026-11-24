# -*- coding: utf-8 -*-
"""
dzmm.ai 账号池自动签到
- 遍历 accounts.json 中所有账号
- 每个账号跑 tasks.initCheckin -> tasks.claim，+5 积分
- 纯 API，无浏览器，无验证码
- 输出每个账号的余额与额度

用法:
  python auto_checkin.py
"""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C


def fmt_quota(items):
    out = []
    for q in items:
        out.append("%s %s/%s(%s)" % (q.get("id"), q.get("remaining"), q.get("limit"), q.get("period")))
    return ", ".join(out)


def main():
    pool = C.load_pool()
    if not pool:
        print("账号池为空，先跑 register.py")
        return
    today = time.strftime("%Y-%m-%d", time.gmtime())
    total_before = 0
    total_after = 0
    for i, a in enumerate(pool):
        token = a.get("access_token")
        if not token:
            continue
        uid = a.get("user_id", "?")
        # 余额
        st, bal = C.get_balance(token)
        try:
            b = bal[0]["result"]["data"]["json"]
            before = b.get("total", 0)
        except Exception:
            print("[%d] %s 余额查询失败 st=%s" % (i, uid, st))
            continue
        # 签到
        if a.get("last_checkin") == today:
            print("[%d] %s credit=%s 今日已签到" % (i, uid, before))
            total_before += before
            total_after += before
            continue
        ok, detail = C.daily_checkin(token)
        st2, bal2 = C.get_balance(token)
        try:
            after = bal2[0]["result"]["data"]["json"].get("total", before)
        except Exception:
            after = before
        a["last_checkin"] = today if ok else a.get("last_checkin")
        a["credit"] = after
        total_before += before
        total_after += after
        print("[%d] %s 签到%s credit %s -> %s" % (i, uid, "成功" if ok else "失败", before, after))
        if not ok:
            print("    detail:", json.dumps(detail, ensure_ascii=False)[:200])
        # 额度
        st3, q = C.get_quota(token)
        try:
            items = q[0]["result"]["data"]["json"]
            print("    quota:", fmt_quota(items))
        except Exception:
            pass
    C.save_pool(pool)
    print("\n合计积分: %d -> %d (本次 +%d)" % (total_before, total_after, total_after - total_before))


if __name__ == "__main__":
    main()
