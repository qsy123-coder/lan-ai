# -*- coding: utf-8 -*-
"""
dzmm.ai 并行注册加速器

- 同时开 N 个无头浏览器实例（各自独立 fp / UA / 视口）
- 每个实例独立走 428 → 拖拽验证码 → 200 流程
- 谁先成功谁先入池（asyncio 并发）
- 失败自动补位，直到达到目标数量

用法:
  python reg_parallel.py 8 3      # 目标 8 个新号，并发 3
  python reg_parallel.py 20 4     # 目标 20 个，并发 4
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

LOG = os.path.join(HERE, "reg_parallel.log")


def log(msg):
    line = "[%s] %s" % (time.strftime("%H:%M:%S"), msg)
    print(line, flush=True)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


async def worker(idx, stats, lock, target, sem):
    """一个并发槽位：反复注册直到达成目标"""
    while True:
        async with lock:
            if stats["ok"] >= target:
                return
        async with sem:
            async with lock:
                if stats["ok"] >= target:
                    return
                stats["running"] += 1
            t0 = time.time()
            try:
                auth = await RA.register_one()
            except Exception as e:
                auth = None
                log("  w%d 异常: %s" % (idx, str(e)[:80]))
            dt = time.time() - t0
            async with lock:
                stats["running"] -= 1
                if auth:
                    C.add_account(auth)
                    stats["ok"] += 1
                    stats["times"].append(dt)
                    log("  w%d ✅ +1 (%.0fs) 池=%d credit=%s" % (
                        idx, dt, len(C.load_pool()), auth.get("credit")))
                else:
                    stats["fail"] += 1
                    log("  w%d ✗ (%.0fs) 失败=%d" % (idx, dt, stats["fail"]))
        # 少量错峰，避免完全同步
        await asyncio.sleep(random.uniform(1.5, 4.0))


async def main():
    target = 6
    conc = 3
    if len(sys.argv) > 1:
        try:
            target = int(sys.argv[1])
        except Exception:
            pass
    if len(sys.argv) > 2:
        try:
            conc = int(sys.argv[2])
        except Exception:
            pass
    conc = max(1, min(conc, 6))
    pool0 = len(C.load_pool())
    log("并行注册启动 目标+%d 并发%d 当前池=%d" % (target, conc, pool0))
    stats = {"ok": 0, "fail": 0, "running": 0, "times": []}
    lock = asyncio.Lock()
    sem = asyncio.Semaphore(conc)
    tasks = [asyncio.create_task(worker(i, stats, lock, target, sem)) for i in range(conc)]
    # 监控
    while True:
        done = all(t.done() for t in tasks)
        if done:
            break
        await asyncio.sleep(15)
        async with lock:
            avg = (sum(stats["times"]) / len(stats["times"])) if stats["times"] else 0
            log("进度 %d/%d 失败%d 运行%d 平均%.0fs 池=%d" % (
                stats["ok"], target, stats["fail"], stats["running"], avg, len(C.load_pool())))
        if stats["ok"] >= target:
            for t in tasks:
                t.cancel()
            break
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    pool = C.load_pool()
    tot = sum((a.get("credit") or 0) for a in pool)
    log("结束：新增 %d，池 %d 个，总积分 %.2f" % (len(pool) - pool0, len(pool), tot))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("手动停止")
