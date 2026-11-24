# -*- coding: utf-8 -*-
"""
dzmm.ai IP 轮换注册器（加速主路线） - v2: 直接用 Clash 节点

- 从 Clash GLOBAL 组获取可用节点（约 50 个）
- 每个节点注册若干个账号（默认 1 个），成功即切下一个节点
- 遇到 429/428 立刻换节点
- 结束恢复原节点

用法:
  python reg_rotate.py 60          # 目标 60 个新号
  python reg_rotate.py 100 2       # 目标 100 个，每个节点最多 2 个
"""
import asyncio
import json
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import clash_api as K
import client as C
import register_api as RA

import bw
import requests


def probe_ip(timeout=12):
    """轻量探测：该出口的 anonymous-sign-in 是否被硬限流
    返回 'ok'(428/200) / 'rate'(429) / 'dead'"""
    try:
        fp = RA.make_fp()
        r = requests.post(C.BASE + "/api/auth/anonymous-sign-in",
                          headers=C._headers(), data=json.dumps({"fp": fp}),
                          proxies=C.PROXIES, timeout=timeout)
        if r.status_code == 429:
            return "rate"
        if r.status_code in (200, 428):
            return "ok"
        return "ok"  # 其他错误交给正式流程
    except Exception:
        return "dead"


def get_clash_nodes():
    """获取 GLOBAL 组内所有可用节点（过滤策略/信息项）"""
    gs = K.groups()
    for name, now, alln in gs:
        if name == "GLOBAL":
            bad = ("DIRECT", "REJECT", "REJECT-DROP", "COMPATIBLE", "PASS",
                   "自动选择", "故障转移", "负载均衡", "流量", "到期", "重置",
                   "套餐", "官网", "订阅", "剩余")
            nodes = []
            for n in alln:
                if n in bad:
                    continue
                if any(k in n for k in bad):
                    continue
                nodes.append(n)
            return nodes
    return []


LOG = os.path.join(HERE, "reg_rotate.log")


def log(msg):
    line = "[%s] %s" % (time.strftime("%H:%M:%S"), msg)
    safe = line.encode("ascii", errors="replace").decode("ascii")
    print(safe, flush=True)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def wait_proxy(seconds=2.5):
    time.sleep(seconds)


async def main():
    target = 10
    per_node = 1
    if len(sys.argv) > 1:
        try:
            target = int(sys.argv[1])
        except Exception:
            pass
    if len(sys.argv) > 2:
        try:
            per_node = int(sys.argv[2])
        except Exception:
            pass

    nodes = get_clash_nodes()
    if not nodes:
        log("Clash GLOBAL 无可用节点")
        return

    orig = K.current("GLOBAL")
    log("启动：目标 +%d，每节点 %d 个，可用节点 %d，原节点 %s" % (
        target, per_node, len(nodes), orig))
    pool0 = len(C.load_pool())
    ok = 0
    round_no = 0
    node_idx = 0

    while ok < target:
        round_no += 1
        log("—— 第 %d 轮（已完成 %d/%d）——" % (round_no, ok, target))
        for k in range(per_node):
            if ok >= target:
                break
            # 选下一个节点
            node = nodes[node_idx % len(nodes)]
            node_idx += 1

            code, _ = K.switch("GLOBAL", node)
            wait_proxy()
            st = probe_ip()
            log("[%d/%d] 切到 %s switch=%s probe=%s" % (
                node_idx, len(nodes), node[:24], code, st))
            if st != "ok":
                continue

            t0 = time.time()
            try:
                auth = await RA.register_one()
            except Exception as e:
                auth = None
                log("   异常 %s" % str(e)[:80])
            dt = time.time() - t0
            if auth:
                C.add_account(auth)
                ok += 1
                log("   ✅ %s credit=%s (%.0fs) 池=%d" % (
                    auth.get("user_id", "?")[:13], auth.get("credit"), dt, len(C.load_pool())))
            else:
                log("   ✗ 失败 (%.0fs)，换节点" % dt)
                # 这个节点出问题，直接换下一个

    if orig:
        try:
            K.switch("GLOBAL", orig)
            log("已恢复原节点 %s" % orig)
        except Exception:
            pass
    pool = C.load_pool()
    log("完成：新增 %d，池 %d，总积分 %.2f" % (len(pool) - pool0, len(pool),
                                          sum((a.get("credit") or 0) for a in pool)))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("手动停止")