# scripts/probe_node.py —— 用 curl_cffi 打一发 tRPC，判断当前出口是否被 418 闸门接管
#
# 判读：401 = 干净（可登录）；418 = 闸门；其它/异常 = 节点坏。
# 用法: python scripts/probe_node.py [标签]
import sys

from curl_cffi import requests as creq

URL = "https://www.dzmm.ai/api/trpc/chat.getQuotas?batch=1&input=%7B%7D"
PROXY = "http://127.0.0.1:7897"


def main():
    tag = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        r = creq.get(URL, impersonate="chrome",
                     proxies={"https": PROXY}, timeout=15)
        code = r.status_code
        why = "clean" if code == 401 else ("gate" if code == 418 else "other")
        print("%-22s %s %s" % (tag, code, why))
    except Exception as e:
        print("%-22s ERR %s" % (tag, str(e)[:80]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
