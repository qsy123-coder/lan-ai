# scripts/exit_pool.py —— 多实例出口池：合并订阅 → 生成本地 mihomo 槽位 → 启停 → 选路 → 探活
#
# 为什么这样做：Clash 主实例只有一个 GLOBAL，切一次全局只能一个出口。
# 浏览器支持 --proxy-server 指向任意端口，所以给每个槽位起一个独立 mihomo 实例
# （mixed-port 7901/7902/…，控制口 9191/9192/…），就能 N 个出口并行，互不干扰。
#
# 用法:
#   python scripts/exit_pool.py build --fg out/fg.sub --mitce out/mitce2/sub_ok.txt
#   python scripts/exit_pool.py start --slots 3
#   python scripts/exit_pool.py assign --slot 1 --node JP-N-1
#   python scripts/exit_pool.py probe --slot 1
#   python scripts/exit_pool.py status
#   python scripts/exit_pool.py stop
#
# 依赖: F:\Clash Verge\verge-mihomo.exe（可用 MIHOMO_EXE 覆盖）、curl_cffi
import argparse
import io
import json
import os
import re
import subprocess
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXIT_DIR = os.path.join(ROOT, "out", "exits")
BASE_YAML = os.path.join(EXIT_DIR, "base.yaml")
INSTANCES = os.path.join(EXIT_DIR, "instances.json")
LEDGER = os.path.join(EXIT_DIR, "ledger.json")
MIHOMO = os.environ.get("MIHOMO_EXE", r"F:\Clash Verge\verge-mihomo.exe")
BASE_PORT = 7901
API_PORT = 9191
ORACLE = "https://www.dzmm.ai/api/trpc/nope.nothing?batch=1&input=%7B%7D"
TRACE = "https://www.cloudflare.com/cdn-cgi/trace"

HEAD = [
    "allow-lan: false",
    "bind-address: 127.0.0.1",
    "mode: global",
    "log-level: warning",
    "ipv6: false",
]


def load(path, default):
    if os.path.exists(path):
        return json.load(io.open(path, encoding="utf-8"))
    return default


def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, "w", encoding="utf-8", newline="\n").write(json.dumps(obj, ensure_ascii=False, indent=1))


def extract_proxies(text):
    """从 mihomo/clash 配置里抠出 proxies 列表块（含缩进），返回行列表。"""
    lines = text.splitlines()
    out = []
    inside = False
    for ln in lines:
        if re.match(r"^proxies:\s*$", ln):
            inside = True
            continue
        if inside:
            if re.match(r"^[A-Za-z][A-Za-z0-9-]*:", ln):
                break
            out.append(ln)
    return out


ITEM_RE = re.compile(r"^(\s*)-\s*(.*)$")


def split_items(block_lines):
    """把 proxies 块切成条目；每条保留首行与后续行。"""
    items, cur = [], None
    for ln in block_lines:
        m = ITEM_RE.match(ln)
        if m:
            if cur:
                items.append(cur)
            cur = [ln]
        elif cur is not None:
            cur.append(ln)
    if cur:
        items.append(cur)
    return items


def normalize_items(items):
    """统一成 2 空格 '-' + 4 空格续行，避免两种订阅缩进不同导致 YAML 结构错乱。"""
    out = []
    for it in items:
        first = it[0]
        m = ITEM_RE.match(first)
        rest = m.group(2)
        out.append("  - " + rest.rstrip())
        cont = [x for x in it[1:] if x.strip()]
        if cont:
            base = min(len(x) - len(x.lstrip()) for x in cont)
            for c in cont:
                ind = len(c) - len(c.lstrip())
                out.append("    " + " " * (ind - base) + c.lstrip())
    return out


def item_name(it):
    for ln in it:
        m = re.search(r"name:\s*[\"']?([^\"',}]+)", ln)
        if m:
            return m.group(1).strip()
    return ""


def proxy_names(block_lines):
    return [item_name(it) for it in split_items(block_lines)]


PSEUDO = ("剩余流量", "距离下次", "套餐到期")


def render_item(it, newname=None):
    first, cont = it[0], it[1:]
    m = ITEM_RE.match(first)
    rest = m.group(2)
    if newname:
        if re.search(r"name:\s*'[^']*'", rest):
            rest = re.sub(r"name:\s*'[^']*'", "name: '%s'" % newname, rest, count=1)
        elif re.search(r"name:\s*\"[^\"]*\"", rest):
            rest = re.sub(r'name:\s*"[^"]*"', 'name: "%s"' % newname, rest, count=1)
        elif rest.startswith("{"):
            rest = re.sub(r"name:\s*[^,}]+", "name: '%s'" % newname, rest, count=1)
        else:
            rest = "name: '%s'" % newname
    out = ["  - " + rest.rstrip()]
    cont = [x for x in cont if x.strip()]
    if cont:
        base = min(len(x) - len(x.lstrip()) for x in cont)
        for c in cont:
            ind = len(c) - len(c.lstrip())
            out.append("    " + " " * (ind - base) + c.lstrip())
    return out


def build(fg_path, mitce_path):
    os.makedirs(EXIT_DIR, exist_ok=True)
    merged, seen = [], set()
    for tag, path in (("fg", fg_path), ("mitce", mitce_path)):
        if not path or not os.path.exists(path):
            print("跳过（不存在）:", path)
            continue
        txt = io.open(path, encoding="utf-8", errors="replace").read()
        items = split_items(extract_proxies(txt))
        kept = 0
        for it in items:
            name = item_name(it)
            if not name or any(p in name for p in PSEUDO):
                continue
            newname = None
            if name in seen:
                newname = name + "@" + tag
            seen.add(newname or name)
            merged.extend(render_item(it, newname))
            kept += 1
        print("%-6s proxies=%d" % (tag, kept))
    head = HEAD + ["proxies:"]
    io.open(BASE_YAML, "w", encoding="utf-8", newline="\n").write("\n".join(head + merged) + "\n")
    print("写入", BASE_YAML, "总计", len(seen), "个节点")
    return 0


def slot_yaml(i):
    p = os.path.join(EXIT_DIR, "mihomo-%d.yaml" % i)
    txt = io.open(BASE_YAML, encoding="utf-8").read()
    head = ["mixed-port: %d" % (BASE_PORT + i - 1),
            "external-controller: 127.0.0.1:%d" % (API_PORT + i - 1)] + HEAD
    lines = txt.splitlines()
    # 去掉 base 里的重复头部（保留 proxies: 及其后）
    idx = next((k for k, ln in enumerate(lines) if re.match(r"^proxies:", ln)), 0)
    io.open(p, "w", encoding="utf-8", newline="\n").write("\n".join(head + lines[idx:]) + "\n")
    return p


def wait_api(port, timeout=12):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            r = creq.get("http://127.0.0.1:%d/version" % port, timeout=2)
            if r.status_code == 200:
                return True
        except Exception:
            time.sleep(0.5)
    return False


def start(slots, start_from=1):
    if not os.path.exists(BASE_YAML):
        print("缺 base.yaml，先跑 build")
        return 2
    inst = load(INSTANCES, {})
    for i in range(start_from, slots + 1):
        key = str(i)
        if key in inst and inst[key].get("pid"):
            try:
                os.kill(inst[key]["pid"], 0)
                print("槽位 %d 已在运行 pid=%s" % (i, inst[key]["pid"]))
                continue
            except Exception:
                pass
        cfg = slot_yaml(i)
        ddir = os.path.join(EXIT_DIR, "data-%d" % i)
        os.makedirs(ddir, exist_ok=True)
        log = open(os.path.join(EXIT_DIR, "slot-%d.log" % i), "ab")
        p = subprocess.Popen([MIHOMO, "-f", cfg, "-d", ddir], stdout=log, stderr=log,
                             creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        ok = wait_api(API_PORT + i - 1)
        inst[key] = {"pid": p.pid, "proxy_port": BASE_PORT + i - 1, "api_port": API_PORT + i - 1,
                     "config": cfg, "started": int(time.time())}
        save(INSTANCES, inst)
        print("槽位 %d pid=%s proxy=%d api=%d %s" % (i, p.pid, BASE_PORT + i - 1, API_PORT + i - 1,
                                                     "OK" if ok else "API_TIMEOUT"))
    return 0


def stop():
    inst = load(INSTANCES, {})
    for key, rec in inst.items():
        pid = rec.get("pid")
        if not pid:
            continue
        try:
            os.kill(pid, 15)
            print("停止槽位", key, "pid", pid)
        except Exception as e:
            print("槽位", key, "停止失败:", str(e)[:60])
    save(INSTANCES, {})
    return 0


def set_global(api_port, node):
    r = creq.put("http://127.0.0.1:%d/proxies/GLOBAL" % api_port,
                 data=json.dumps({"name": node}),
                 headers={"Content-Type": "application/json"}, timeout=8)
    if r.status_code >= 400:
        raise RuntimeError("HTTP %s %s" % (r.status_code, (r.text or "")[:100]))


def probe_slot(i, node=None, timeout=20):
    inst = load(INSTANCES, {}).get(str(i))
    if not inst:
        print("槽位 %d 未启动" % i)
        return None
    api, proxy = inst["api_port"], "http://127.0.0.1:%d" % inst["proxy_port"]
    if node:
        set_global(api, node)
        time.sleep(0.5)
    now = creq.get("http://127.0.0.1:%d/proxies/GLOBAL" % api, timeout=5).json().get("now")
    px = {"http": proxy, "https": proxy}
    ip = loc = ""
    try:
        t = creq.get(TRACE, impersonate="chrome", proxies=px, timeout=timeout).text
        d = dict(x.split("=", 1) for x in t.splitlines() if "=" in x)
        ip, loc = d.get("ip", ""), d.get("loc", "")
    except Exception:
        pass
    try:
        oracle = creq.get(ORACLE, impersonate="chrome", proxies=px, timeout=timeout).status_code
    except Exception:
        oracle = 0
    rec = {"slot": i, "node": now, "proxy": proxy, "api": api, "ip": ip, "loc": loc,
           "oracle": oracle, "ts": int(time.time())}
    ledger = load(LEDGER, {})
    ledger[str(i)] = dict(ledger.get(str(i), {}), **rec)
    save(LEDGER, ledger)
    print(json.dumps(rec, ensure_ascii=False))
    return rec


def status():
    inst = load(INSTANCES, {})
    ledger = load(LEDGER, {})
    for key in sorted(inst, key=lambda x: int(x)):
        rec = inst[key]
        try:
            now = creq.get("http://127.0.0.1:%d/proxies/GLOBAL" % rec["api_port"], timeout=3).json().get("now")
        except Exception:
            now = "DEAD"
        l = ledger.get(key, {})
        print("槽位 %s pid=%-6s proxy=%d now=%-22s ip=%-15s oracle=%s" % (
            key, rec.get("pid"), rec["proxy_port"], now, l.get("ip", "-"), l.get("oracle", "-")))
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("build")
    b.add_argument("--fg", default=os.path.join(ROOT, "out", "fg.sub"))
    b.add_argument("--mitce", default=os.path.join(ROOT, "out", "mitce2", "sub_ok.txt"))

    s = sub.add_parser("start")
    s.add_argument("--slots", type=int, default=3)
    s.add_argument("--from", dest="start_from", type=int, default=1,
                   help="从第几个槽位开始起（槽位 1 被手工实例占用时用 2）")

    sub.add_parser("stop")
    sub.add_parser("status")

    a = sub.add_parser("assign")
    a.add_argument("--slot", type=int, required=True)
    a.add_argument("--node", required=True)

    p = sub.add_parser("probe")
    p.add_argument("--slot", type=int, required=True)
    p.add_argument("--node", default="")

    args = ap.parse_args()
    if args.cmd == "build":
        return build(args.fg, args.mitce)
    if args.cmd == "start":
        return start(args.slots, args.start_from)
    if args.cmd == "stop":
        return stop()
    if args.cmd == "status":
        return status()
    if args.cmd == "assign":
        probe_slot(args.slot, node=args.node)
        return 0
    if args.cmd == "probe":
        probe_slot(args.slot, node=args.node or None)
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
