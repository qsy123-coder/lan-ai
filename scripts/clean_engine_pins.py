# -*- coding: utf-8 -*-
"""清理被误抽成锚点的引擎块（【长期设定】/【执行要求】/【称呼】等）。

用法（服务器上）：
    cd /opt/lan && /opt/lan/venv/bin/python scripts/clean_engine_pins.py --dry-run
    ... --apply      # 改了才备份并写回
"""
import argparse
import io
import json
import os
import shutil
import sys
import time

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "engine"))
os.environ.setdefault("DZMM_ROOT", ROOT)

import memory as m  # noqa: E402

BASE = os.path.join(ROOT, "out", "memory")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    if not args.dry_run and not args.apply:
        args.dry_run = True

    changed = 0
    for root, _, files in os.walk(BASE):
        for fn in files:
            if not fn.endswith(".json"):
                continue
            p = os.path.join(root, fn)
            try:
                d = json.load(io.open(p, encoding="utf-8-sig"))
            except Exception:
                continue
            pins = d.get("pinned") or []
            kept = m.clean_pins(pins)
            if len(kept) == len(pins) and [x.get("text") for x in kept] == \
                    [x.get("text") for x in pins]:
                continue
            changed += 1
            print("%s: %d -> %d" % (p.replace(BASE + "/", ""), len(pins), len(kept)))
            kept_texts = [x.get("text") for x in kept]
            for x in pins:
                t = (x.get("text") or "")
                if t not in kept_texts:
                    print("   drop/normalize:", t[:60])
            if args.apply:
                backup = os.path.join("/opt/lan", "backup-memory-pins-%s.json"
                                      % time.strftime("%Y%m%d-%H%M%S"))
                shutil.copy2(p, backup)
                d["pinned"] = kept
                d["updatedAt"] = int(time.time())
                tmp = p + ".tmp"
                with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
                    json.dump(d, f, ensure_ascii=False, indent=1)
                os.replace(tmp, p)
                print("   saved (backup %s)" % backup)
    print("files changed:", changed, "mode:", "apply" if args.apply else "dry-run")
    return 0


if __name__ == "__main__":
    sys.exit(main())
