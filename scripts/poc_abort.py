# scripts/poc_abort.py —— 计费时序测试：拿到 token 后立刻断开，看服务端是否仍结算积分
#
# 用法:
#   python scripts/poc_abort.py --model nalang-max-0826 --read-bytes 800
#   python scripts/poc_abort.py --model x-apex-flux-0217-16k --read-bytes 800 --full   # 对照组：读完整条流
#
# 判定: 生成前后各读一次 user.getMe.credit
#   断开后 credit 不变 -> 服务端在"完整结束"时才结算，可白嫖
#   credit 仍被扣      -> 服务端在 init 或首 token 时就预扣，断开无效
import argparse
import glob
import io
import json
import os
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.dzmm.ai"


def latest_flow():
    best = None
    for p in glob.glob(os.path.join(ROOT, "captures", "*", "trpc.jsonl")):
        with io.open(p, encoding="utf-8") as f:
            for line in f:
                r = json.loads(line)
                if r["path"].startswith("/api/chat") and r["method"] == "POST":
                    if best is None or r["t"] > best["t"]:
                        best = r
    return best


def credit_of(sess, proxy, hdrs):
    r = sess.get(BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
                 headers={"cookie": hdrs["cookie"]}, impersonate="chrome", proxies=proxy, timeout=30)
    try:
        return json.loads(r.text)[0]["result"]["data"]["json"]["credit"]
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="nalang-max-0826")
    ap.add_argument("--read-bytes", type=int, default=800)
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--text", default="数一下：从1数到20，只输出数字")
    ap.add_argument("--proxy", default="http://127.0.0.1:7897")
    args = ap.parse_args()

    flow = latest_flow()
    if not flow:
        print("没有 /api/chat 抓包")
        return 2
    if flow.get("req_body"):
        body = json.loads(flow["req_body"])
    else:
        body = json.load(io.open(os.path.join(ROOT, "out", "chat_body_exact.json"), encoding="utf-8-sig"))
    body["chatSettings"]["model"] = args.model
    body["chatSettings"]["maxTokens"] = 300
    body["prompts"] = [{"role": "user", "content": args.text}]
    body["content"] = args.text
    body.pop("parentGenerationId", None)

    hdrs = {k: v for k, v in flow["req_headers"].items()
            if k.lower() not in ("content-length", "host", "connection")}
    hdrs["cookie"] = "; ".join(flow.get("req_cookies") or [])

    proxy = {"http": args.proxy, "https": args.proxy} if args.proxy else None
    sess = creq.Session(impersonate="chrome", proxies=proxy, timeout=120)

    c0 = credit_of(sess, proxy, hdrs)
    print("credit before:", c0)

    r = creq.post(BASE + "/api/chat", data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                  headers=hdrs, impersonate="chrome", proxies=proxy, timeout=120, stream=True)
    print("status:", r.status_code)

    got = bytearray()
    for chunk in r.iter_content():
        if not chunk:
            continue
        got.extend(chunk)
        if not args.full and len(got) >= args.read_bytes:
            break
    r.close()  # 提前断开

    time.sleep(6)  # 给服务端结算留时间
    c1 = credit_of(sess, proxy, hdrs)
    print("credit after:", c1, "| delta:", None if (c0 is None or c1 is None) else round(c0 - c1, 4))
    print("bytes read:", len(got), "| head:", bytes(got[:220]).decode("utf-8", "replace").replace("\n", "\\n"))

    with io.open(os.path.join(ROOT, "out", "poc_abort.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(), "model": args.model, "full": args.full,
                            "credit_before": c0, "credit_after": c1, "bytes": len(got)},
                           ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
