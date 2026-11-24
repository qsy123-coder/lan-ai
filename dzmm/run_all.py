# -*- coding: utf-8 -*-
"""
dzmm.ai 一键总控

用法:
  python run_all.py status          # 看账号池/积分/IP 状态
  python run_all.py refresh         # 续期全部 token
  python run_all.py checkin         # 签到 + 领任务（IP 轮换）
  python run_all.py ips             # 重扫出口 IP 池
  python run_all.py grow 20         # 扩池 20 个（IP 轮换注册）
  python run_all.py daily           # = refresh + checkin（每日例行）
"""
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import client as C

PY = sys.executable


def status():
    pool = C.load_pool()
    tot = sum((a.get("credit") or 0) for a in pool)
    today = time.strftime("%Y-%m-%d", time.gmtime())
    signed = sum(1 for a in pool if a.get("last_checkin") == today)
    print("=" * 46)
    print("账号池        : %d 个" % len(pool))
    print("总积分        : %.2f" % tot)
    print("≈ turbo 对话  : %d 次 (0.55/次)" % int(tot / 0.55))
    print("今日已签到    : %d / %d" % (signed, len(pool)))
    print("每日签到收益  : +%d" % (len(pool) * 5))
    print("-" * 46)
    ips = []
    if os.path.exists(os.path.join(HERE, "ip_pool.json")):
        try:
            ips = json.load(open(os.path.join(HERE, "ip_pool.json"), encoding="utf-8")).get("unique") or []
        except Exception:
            pass
    print("出口 IP 池    : %d 个" % len(ips))
    try:
        import clash_api as K
        print("当前节点      : %s" % K.current("GLOBAL"))
    except Exception:
        pass
    # 前 5 名
    top = sorted(pool, key=lambda a: -(a.get("credit") or 0))[:5]
    print("-" * 46)
    print("余额前 5:")
    for a in top:
        print("  %s  %s" % ((a.get("user_id") or "?")[:13], a.get("credit")))
    print("=" * 46)


def run(script, *args):
    cmd = [PY, "-u", os.path.join(HERE, script)] + list(args)
    print(">>", " ".join(cmd))
    return subprocess.call(cmd)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    act = sys.argv[1]
    if act == "status":
        status()
    elif act == "refresh":
        run("refresh_accounts.py")
    elif act == "checkin":
        run("checkin_rotate.py", "--reclaim")
    elif act == "ips":
        run("ip_pool.py")
    elif act == "grow":
        n = sys.argv[2] if len(sys.argv) > 2 else "20"
        run("reg_rotate.py", n, "1")
    elif act == "daily":
        run("refresh_accounts.py")
        run("checkin_rotate.py", "--reclaim")
        status()
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
