# -*- coding: utf-8 -*-
"""
dzmm.ai 长效注册守护（后台常驻，无头）
- 循环尝试注册游客账号
- 429 限流 → 指数退避（5 → 10 → 20 → 30 分钟封顶）
- 成功后入池，冷却 60~150 秒继续
- 全程无窗口

用法:
  python reg_daemon.py              # 无限循环
  python reg_daemon.py 20           # 目标 20 个新号后退出
"""
import asyncio
import json
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import client as C
import register_api as RA

LOG = os.path.join(HERE, "reg_daemon.log")
STATE = os.path.join(HERE, "daemon_state.json")


def log(msg):
    line = "[%s] %s" % (time.strftime("%m-%d %H:%M:%S"), msg)
    print(line, flush=True)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def load_state():
    if os.path.exists(STATE):
        try:
            return json.load(open(STATE, encoding="utf-8"))
        except Exception:
            pass
    return {"added": 0, "backoff": 300, "last_ok": 0}


def save_state(st):
    json.dump(st, open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


async def attempt():
    """一次注册尝试，返回 (auth|None, reason)"""
    try:
        auth = await RA.register_one()
        return auth, None if auth else "fail"
    except Exception as e:
        s = str(e)
        if "429" in s or "过于频繁" in s:
            return None, "429"
        return None, s[:120]


async def main():
    target = 10 ** 9
    if len(sys.argv) > 1:
        try:
            target = int(sys.argv[1])
        except Exception:
            pass
    st = load_state()
    log("守护启动 target=%s 已入池新增=%d" % (target if target < 10 ** 9 else "∞", st.get("added", 0)))
    rounds = 0
    while st.get("added", 0) < target:
        rounds += 1
        before = len(C.load_pool())
        log("第 %d 轮注册尝试" % rounds)
        auth, reason = await attempt()
        after = len(C.load_pool())
        if auth and after > before:
            st["added"] = st.get("added", 0) + 1
            st["backoff"] = 300
            st["last_ok"] = int(time.time())
            save_state(st)
            log("成功 +1（本次会话新增 %d，池 %d）credit=%s" % (
                st["added"], after, auth.get("credit")))
            wait = random.randint(60, 150)
            log("冷却 %ds" % wait)
            await asyncio.sleep(wait)
        else:
            st["backoff"] = min(st.get("backoff", 300) * 2, 1800)
            save_state(st)
            wait = st["backoff"] + random.randint(0, 120)
            log("未成功(%s)，退避 %ds" % (reason or "unknown", wait))
            await asyncio.sleep(wait)
    log("达到目标，退出。池内 %d" % len(C.load_pool()))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("手动停止")
