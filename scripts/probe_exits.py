# scripts/probe_exits.py —— 逐个探活 mihomo 实例里的代理节点（不改 GLOBAL，用 delay API）
#
# 用法:
#   python scripts/probe_exits.py --api http://127.0.0.1:9191 --out out/mitce2/delays.json
#   python scripts/probe_exits.py --api http://127.0.0.1:9191 --only 住宅 --url https://www.dzmm.ai/
#
# 说明:
#   - 只探 type 为真实代理的条目（跳过 Selector/URLTest/Fallback/LoadBalance/DIRECT/REJECT）
#   - delay API: GET /proxies/<name>/delay?url=...&timeout=4000，返回 {"delay": ms} 或 {"message": ...}
#   - 并发 6，避免把节点打到限速；任何异常都记进结果，不抛
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

SKIP_TYPES = {"Selector", "URLTest", "Fallback", "LoadBalance", "Direct", "Reject", "Compatible"}


def api(api_base, path, timeout=10):
    req = urllib.request.Request(api_base.rstrip("/") + path)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def list_proxies(api_base):
    data = api(api_base, "/proxies")
    out = []
    for name, meta in (data.get("proxies") or {}).items():
        if meta.get("type") in SKIP_TYPES:
            continue
        if name in ("DIRECT", "REJECT", "GLOBAL"):
            continue
        out.append((name, meta.get("type")))
    return out


def delay(api_base, name, url, timeout_ms=4000):
    q = urllib.parse.urlencode({"url": url, "timeout": timeout_ms})
    p = "/proxies/" + urllib.parse.quote(name, safe="") + "/delay?" + q
    try:
        d = api(api_base, p, timeout=timeout_ms / 1000 + 6)
        return d.get("delay"), None
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", "replace")
        except Exception:
            body = ""
        return None, "HTTP %s %s" % (e.code, body[:120])
    except Exception as e:
        return None, str(e)[:160]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://127.0.0.1:9191")
    ap.add_argument("--url", default="https://www.gstatic.com/generate_204")
    ap.add_argument("--only", default="", help="名字包含该子串才测（例如 住宅）")
    ap.add_argument("--out", default="")
    ap.add_argument("--timeout-ms", type=int, default=4000)
    ap.add_argument("--conc", type=int, default=6)
    args = ap.parse_args()

    items = list_proxies(args.api)
    if args.only:
        items = [x for x in items if args.only in x[0]]
    if not items:
        print("没有可测节点")
        return 1

    rows = []
    with ThreadPoolExecutor(max_workers=args.conc) as ex:
        futs = {ex.submit(delay, args.api, n, args.url, args.timeout_ms): (n, t) for n, t in items}
        for f in futs:
            n, t = futs[f]
            ms, err = f.result()
            rows.append({"name": n, "type": t, "delay": ms, "err": err})
            print("%-8s %-26s %s" % ("OK" if ms else "FAIL", n, ("%dms" % ms) if ms else (err or "")[:60]))

    ok = sum(1 for r in rows if r["delay"])
    print("\n%d/%d 可用" % (ok, len(rows)))
    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8", newline="\n") as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
        print("写入", args.out)
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
