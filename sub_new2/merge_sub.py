# -*- coding: utf-8 -*-
"""
把新订阅的节点合并进 Clash Verge 运行配置
- 节点名加 M- 前缀避免冲突
- 备份原配置
- 用 mihomo -t 校验后再启用
"""
import os
import shutil
import subprocess
import sys
import time

import yaml

CFG_DIR = r"C:\Users\WINDOWS11\AppData\Roaming\io.github.clash-verge-rev.clash-verge-rev"
CUR = os.path.join(CFG_DIR, "clash-verge.yaml")
SUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sub.yaml")
MIHOMO = r"F:\Clash Verge\verge-mihomo.exe"
PREFIX = "N-"


def main():
    cur = yaml.safe_load(open(CUR, encoding="utf-8"))
    sub = yaml.safe_load(open(SUB, encoding="utf-8"))

    new_proxies = []
    existing = {p.get("name") for p in (cur.get("proxies") or [])}
    for p in (sub.get("proxies") or []):
        name = PREFIX + str(p.get("name"))
        # 已有同名则跳过（幂等）
        if name in existing:
            continue
        p = dict(p)
        p["name"] = name
        p["_merged_from"] = "mitce"
        new_proxies.append(p)

    if not new_proxies:
        print("没有新节点需要合并（可能已合并过）")
        return

    cur.setdefault("proxies", [])
    cur["proxies"].extend(new_proxies)

    # 确保有一个选择器组收拢新节点（便于切换）
    groups = cur.setdefault("proxy-groups", [])
    names = [p["name"] for p in new_proxies]
    grp = {
        "name": "N-Nodes",
        "type": "select",
        "proxies": names + ["DIRECT"],
    }
    # 已存在同名组则替换
    groups = [g for g in groups if g.get("name") != "N-Nodes"]
    groups.insert(0, grp)
    cur["proxy-groups"] = groups

    # 备份
    bak = CUR + ".bak_merge_%s" % time.strftime("%Y%m%d_%H%M%S")
    shutil.copy2(CUR, bak)
    print("已备份 ->", bak)

    # 写临时文件并校验
    tmp = CUR + ".test.yaml"
    yaml.safe_dump(cur, open(tmp, "w", encoding="utf-8"),
                   allow_unicode=True, sort_keys=False, default_flow_style=False)
    r = subprocess.run([MIHOMO, "-t", "-d", CFG_DIR, "-f", tmp],
                       capture_output=True, timeout=60)
    ok = r.returncode == 0
    print("校验:", "OK" if ok else "FAIL")
    if not ok:
        print(r.stdout.decode("utf-8", "replace")[:400])
        print(r.stderr.decode("utf-8", "replace")[:600])
        os.unlink(tmp)
        return

    # 生效
    shutil.move(tmp, CUR)
    print("已写入配置，节点 +%d，共 %d" % (len(new_proxies), len(cur["proxies"])))
    print("需要重启 mihomo 生效")


if __name__ == "__main__":
    main()
