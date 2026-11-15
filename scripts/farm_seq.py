# scripts/farm_seq.py —— 串行批量开号：每号一个独立 profile + 指定出口 + 指定邮箱域
#
# 每个号：启浏览器 → signup_via_browser 填表/过闸/收码/入池 → 下一个
# 人工只在「验证页出现」时拖一次（脚本会把窗口置顶并打印 READY）
#
# 用法:
#   python scripts/farm_seq.py --count 3 --domain d1.jjlnlnl.dpdns.org --start 57 \
#       --exit http://127.0.0.1:7902 --base-port 9630
import argparse
import os
import random
import string
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import new_account as na  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIGNUP = os.path.join(ROOT, "scripts", "signup_via_browser.py")


def rand_addr(domain):
    s = "".join(random.choices(string.ascii_lowercase + string.digits, k=13))
    return s + "@" + domain


def kill_profile(profile):
    ps = ("Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | "
          "Where-Object { $_.CommandLine -like '*%s*' } | "
          "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" % profile)
    try:
        subprocess.run(["powershell", "-NoProfile", "-Command", ps],
                       capture_output=True, text=True, timeout=40)
    except Exception:
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=3)
    ap.add_argument("--domain", required=True)
    ap.add_argument("--start", type=int, default=57)
    ap.add_argument("--exit", default="http://127.0.0.1:7902")
    ap.add_argument("--base-port", type=int, default=9630)
    ap.add_argument("--imap-proxy", default="socks5h://127.0.0.1:1082")
    ap.add_argument("--timeout", type=int, default=420)
    args = ap.parse_args()

    py = sys.executable
    ok = 0
    for i in range(args.count):
        idx = args.start + i
        name = "b%03d" % idx
        port = args.base_port + i
        profile = os.path.join(os.environ.get("TEMP", "."), "dzmm-farm-%d" % port)
        addr = rand_addr(args.domain)
        print("\n=== [%d/%d] %s  %s  exit=%s ===" % (i + 1, args.count, name, addr, args.exit), flush=True)
        if not na.launch(port, profile, na.BASE + "/sign-in?s=signup", use_proxy=True, proxy=args.exit):
            print("  launch fail", flush=True)
            continue
        cmd = [py, "-u", SIGNUP, "--port", str(port), "--name", name, "--addr", addr,
               "--standalone-gate", "--imap-curl", "--imap-proxy", args.imap_proxy,
               "--verify-proxy", args.exit]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                               errors="replace", timeout=args.timeout,
                               env=dict(os.environ, PYTHONIOENCODING="utf-8",
                                        NODE_BIN=os.environ.get("NODE_BIN", na.NODE_BIN)))
        except subprocess.TimeoutExpired:
            print("  timeout", flush=True)
            kill_profile(profile)
            continue
        out = (p.stdout or "") + (p.stderr or "")
        for line in out.strip().splitlines()[-6:]:
            print("   ", line, flush=True)
        if p.returncode == 0:
            ok += 1
        elif "状态2: toast" in out or "状态: toast" in out:
            print("  ✗ 服务端拒绝（429/额度），停止本轮", flush=True)
            kill_profile(profile)
            break
        kill_profile(profile)
        time.sleep(1.5)
    print("\n完成 %d/%d" % (ok, args.count))
    return 0


if __name__ == "__main__":
    sys.exit(main())
