# -*- coding: utf-8 -*-
"""
dzmm.ai 账号池自动领取「已完成但未领取」的任务奖励
- 匹配 canClaim=true 且 claimed=false 的任务
- 纯 API（tasks.claim 不触发验证码）
- 典型收益: first_avatar_upload +5/号

用法: python claim_tasks.py
"""
import sys
import time

sys.path.insert(0, __file__.rsplit("\\", 1)[0])
sys.path.insert(0, __file__.rsplit("/", 1)[0])
import client as C


def main():
    pool = C.load_pool()
    if not pool:
        print("账号池为空")
        return
    total_gain = 0
    for i, a in enumerate(pool):
        tok = a.get("access_token")
        if not tok:
            continue
        uid = a.get("user_id", "?")
        st, j = C.trpc_get("tasks.list", tok)
        try:
            tasks = j[0]["result"]["data"]["json"]["tasks"]
        except Exception:
            print("[%d] %s 任务查询失败 st=%s" % (i, uid, st))
            continue
        todo = [t for t in tasks if t.get("canClaim") and not t.get("claimed")]
        if not todo:
            print("[%d] %s 无可领取任务" % (i, uid))
            continue
        for t in todo:
            key = t["key"]
            reward = t.get("reward", 0)
            st2, j2 = C.claim_task(tok, key)
            ok = False
            try:
                ok = bool(j2["result"]["data"]["json"].get("success"))
            except Exception:
                pass
            if ok:
                total_gain += reward
                print("[%d] %s 领取 %-24s +%s" % (i, uid, key, reward))
            else:
                print("[%d] %s 领取 %-24s 失败 %s" % (i, uid, key, str(j2)[:120]))
            time.sleep(1)
        st3, bal = C.get_balance(tok)
        try:
            a["credit"] = bal[0]["result"]["data"]["json"].get("total")
        except Exception:
            pass
    C.save_pool(pool)
    print("\n本次合计 +%s 积分" % total_gain)


if __name__ == "__main__":
    main()
