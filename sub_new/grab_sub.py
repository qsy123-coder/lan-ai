# -*- coding: utf-8 -*-
"""
轮询 mitce 订阅，等你在控制中心点「激活」后立即抓取
- 每 2 秒请求一次，成功即保存 sub.yaml 并解析节点
- 默认轮询 30 分钟
"""
import json
import re
import sys
import time

import requests

URL = "https://mitce.io/modules/servers/v2Net/subscribe/?sid=959668&token=srvxvyma"
OUT = "sub.yaml"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}

UAS = [
    "clash-verge/v2.0.0",
    "ClashMetaForAndroid/2.11.1.Meta",
    "clash.meta",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0",
]


def try_fetch():
    for ua in UAS:
        try:
            r = requests.get(URL, headers={"User-Agent": ua}, timeout=20, proxies=PROXY)
        except Exception as e:
            return None, "net:" + str(e)[:40]
        if r.status_code == 200 and ("proxies:" in r.text or "proxy-groups:" in r.text):
            return r.text, "ok"
        if r.status_code == 200 and "://" in r.text:
            return r.text, "ok(非clash?)"
        if r.status_code == 403:
            return None, "403 待激活"
        if r.status_code == 404:
            return None, "404"
    return None, "no"


def parse(text):
    names = []
    for line in text.splitlines():
        m = re.match(r"\s*-\s*\{?\s*name:\s*['\"]?([^,'\"}]+)", line)
        if m:
            names.append(m.group(1).strip())
        m2 = re.match(r"\s*-\s*name:\s*(.+)$", line)
        if m2:
            names.append(m2.group(1).strip().strip("'\""))
    # 统计协议
    protos = {}
    for p in ("ss", "vmess", "vless", "trojan", "hysteria2", "hysteria", "tuic", "anytls", "wireguard"):
        n = len(re.findall(r"type:\s*%s\b" % p, text))
        if n:
            protos[p] = n
    return names, protos


def main():
    deadline = time.time() + 1800
    n = 0
    print("开始轮询（每 2 秒）。请现在去 mitce 控制中心点「激活订阅」……", flush=True)
    while time.time() < deadline:
        n += 1
        txt, st = try_fetch()
        if txt:
            open(OUT, "w", encoding="utf-8").write(txt)
            names, protos = parse(txt)
            print("\n✅ 抓取成功！第 %d 次尝试" % n, flush=True)
            print("文件: %s (%d 字节)" % (OUT, len(txt)), flush=True)
            print("协议分布:", json.dumps(protos, ensure_ascii=False), flush=True)
            print("节点数(粗略): %d" % len(names), flush=True)
            for x in names[:20]:
                print("  -", x, flush=True)
            return
        if n % 5 == 0:
            print("[%s] 第 %d 次: %s" % (time.strftime("%H:%M:%S"), n, st), flush=True)
        time.sleep(2)
    print("超时未抓到", flush=True)


if __name__ == "__main__":
    main()
