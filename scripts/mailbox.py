# scripts/mailbox.py —— 统一邮箱抽象：temp-mail.io / mail.tm / CF mail-hub
#
# 为什么抽一层：站点会按「域名」标记（aetouban.cn、fldubai.com 都已被判），
# 换域名要能一行切换，而不是改注册脚本。
#
# 用法:
#   python scripts/mailbox.py --provider tmio
#   python scripts/mailbox.py --provider tmio --wait 120
#   python scripts/mailbox.py --provider mailtm
#
# 代码里:
#   mb = provision("tmio")            # {"provider","addr","token",...}
#   code = wait_code(mb, timeout=180)
import argparse
import io
import json
import os
import random
import re
import string
import sys
import time

from curl_cffi import requests as creq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
TMIO = "https://api.internal.temp-mail.io/api/v3"
MAILTM = "https://api.mail.tm"
CODE_RE = re.compile(r"\b(\d{8})\b")


def _px():
    return {"http": PROXY, "https": PROXY}


def _rand(n=12):
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))


# ---------- temp-mail.io（免鉴权内部 API） ----------
def tmio_domains():
    r = creq.get(TMIO + "/domains", impersonate="chrome", proxies=_px(), timeout=20)
    d = r.json()
    items = d.get("domains") or d
    return [x["name"] for x in items if isinstance(x, dict) and x.get("type", "public") == "public"]


def tmio_new(domain=None, name=None):
    body = {}
    if domain:
        body["domain"] = domain
    if name:
        body["name"] = name
    r = creq.post(TMIO + "/email/new", json=body, impersonate="chrome", proxies=_px(), timeout=25)
    if r.status_code != 200:
        raise RuntimeError("tmio new: HTTP %s %s" % (r.status_code, (r.text or "")[:120]))
    j = r.json()
    return {"provider": "tmio", "addr": j["email"], "token": j.get("token"), "password": None}


def tmio_messages(addr):
    r = creq.get(TMIO + "/email/%s/messages" % addr, impersonate="chrome", proxies=_px(), timeout=25)
    if r.status_code != 200:
        return []
    return r.json() or []


def _text_of(msg):
    parts = []
    for k in ("body_text", "body_html", "body", "text", "html"):
        v = msg.get(k)
        if isinstance(v, str):
            parts.append(v)
    return re.sub(r"<[^>]+>", " ", " ".join(parts))


# ---------- mail.tm ----------
def mailtm_new(domain=None, password=None):
    doms = creq.get(MAILTM + "/domains", impersonate="chrome", proxies=_px(), timeout=20).json()
    rows = doms.get("hydra:member") or doms.get("data") or []
    dom = domain or next((x["domain"] for x in rows if x.get("isActive")), None)
    if not dom:
        raise RuntimeError("mail.tm 没有可用域名")
    addr = _rand() + "@" + dom
    pwd = password or ("Dz" + _rand(10) + "!9")
    h = {"content-type": "application/json", "accept": "application/json"}
    r = creq.post(MAILTM + "/accounts", json={"address": addr, "password": pwd},
                  headers=h, impersonate="chrome", proxies=_px(), timeout=25)
    if r.status_code not in (200, 201):
        raise RuntimeError("mailtm new: HTTP %s %s" % (r.status_code, (r.text or "")[:120]))
    t = creq.post(MAILTM + "/token", json={"address": addr, "password": pwd},
                  headers=h, impersonate="chrome", proxies=_px(), timeout=25)
    if t.status_code != 200:
        raise RuntimeError("mailtm token: HTTP %s" % t.status_code)
    return {"provider": "mailtm", "addr": addr, "token": t.json().get("token"), "password": pwd}


def mailtm_messages(mb):
    h = {"accept": "application/json", "authorization": "Bearer " + (mb.get("token") or "")}
    r = creq.get(MAILTM + "/messages", headers=h, impersonate="chrome", proxies=_px(), timeout=25)
    if r.status_code != 200:
        return []
    out = []
    for m in r.json()[:5]:
        full = creq.get(MAILTM + "/messages/" + m["id"], headers=h, impersonate="chrome",
                        proxies=_px(), timeout=25).json()
        out.append(full)
    return out


# ---------- 统一入口 ----------
def provision(provider="tmio", domain=None):
    if provider == "tmio":
        return tmio_new(domain)
    if provider == "mailtm":
        return mailtm_new(domain)
    raise ValueError("未知 provider: %s" % provider)


def fetch_all(mb):
    if mb["provider"] == "tmio":
        return tmio_messages(mb["addr"])
    if mb["provider"] == "mailtm":
        return mailtm_messages(mb)
    return []


def _curl_imap(proxy, user, pwd, mailbox, command, timeout=40):
    import subprocess
    mbox = mailbox.replace("[", "%5B").replace("]", "%5D").replace(" ", "%20").replace("/", "/")
    url = "imaps://imap.gmail.com/" + mbox
    p = subprocess.run(["curl.exe", "-sS", "--max-time", str(timeout), "--proxy", proxy,
                        "--user", "%s:%s" % (user, pwd), url, "-X", command],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return p.stdout or ""


def imap_max_uid(proxy, user, pwd):
    out = _curl_imap(proxy, user, pwd, "[Gmail]/All Mail", "UID SEARCH ALL")
    nums = [int(x) for x in re.findall(r"\d+", out.split("* SEARCH")[-1] if "* SEARCH" in out else "")]
    return max(nums) if nums else 0


def code_from_raw(raw):
    """只从解码后的正文里抽 8 位码：优先「验证码/code 后 8 位」，否则取正文最后一个 8 位数字。
    绝对不能扫整个原文——ARC/DKIM 头里有 s=arc-20260327 这种 8 位串，会误命中。"""
    import email
    from email.header import decode_header, make_header
    try:
        msg = email.message_from_string(raw)
    except Exception:
        return None
    parts = []
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() in ("text/plain", "text/html"):
                try:
                    parts.append(part.get_payload(decode=True).decode("utf-8", "replace"))
                except Exception:
                    pass
    else:
        try:
            parts.append((msg.get_payload(decode=True) or b"").decode("utf-8", "replace"))
        except Exception:
            pass
    text = re.sub(r"<[^>]+>", " ", " ".join(parts))
    text = re.sub(r"=\r?\n", "", text)
    m = re.search(r"(?:验证码|校验码|code)[^\d]{0,12}(\d{8})", text, re.I)
    if m:
        return m.group(1)
    nums = re.findall(r"\b\d{8}\b", text)
    return nums[-1] if nums else None


def imap_wait_code(proxy, user, pwd, since_uid=0, timeout=180, interval=5):
    """用 curl 走 SOCKS 读 Gmail：取 since_uid 之后来自 dianzimeimo 的最新邮件，抽 8 位码。"""
    t0 = time.time()
    while time.time() - t0 < timeout:
        out = _curl_imap(proxy, user, pwd, "[Gmail]/All Mail", 'UID SEARCH FROM "dianzimeimo"')
        tail = out.split("* SEARCH")[-1] if "* SEARCH" in out else ""
        uids = sorted(int(x) for x in re.findall(r"\d+", tail))
        for uid in reversed(uids):
            if uid <= since_uid:
                break
            body = _curl_imap(proxy, user, pwd, "[Gmail]/All Mail", "UID FETCH %d (BODY.PEEK[])" % uid, timeout=50)
            code = code_from_raw(body)
            if code:
                return code
        time.sleep(interval)
    return None


def wait_code(mb, timeout=180, interval=4):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            msgs = fetch_all(mb)
        except Exception:
            msgs = []
        for m in msgs:
            m = re.sub(r"<[^>]+>", " ", " ".join(str(x) for x in m.values() if isinstance(x, (str, int, float))))
            hit = CODE_RE.search(m)
            if hit:
                return hit.group(1)
        time.sleep(interval)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", choices=["tmio", "mailtm"], default="tmio")
    ap.add_argument("--domain", default="")
    ap.add_argument("--wait", type=int, default=0)
    args = ap.parse_args()
    mb = provision(args.provider, args.domain or None)
    print(json.dumps(mb, ensure_ascii=False))
    if args.wait:
        code = wait_code(mb, timeout=args.wait)
        print("code=", code)
        return 0 if code else 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
