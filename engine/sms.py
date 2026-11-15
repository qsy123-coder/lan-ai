"""短信发送：mock / webhook / twilio / smsbao。

环境变量：
  SMS_PROVIDER=mock|webhook|twilio|smsbao   （默认 mock）
  SMS_TEMPLATE=【澜】验证码 {code}，5 分钟内有效。
  SMS_DEV_CODE=1|0                           （mock 默认 1，其它默认 0）
  SMS_PROXY=http://127.0.0.1:7897             可选，发送 HTTP 走的代理

  webhook: SMS_WEBHOOK_URL / SMS_WEBHOOK_TOKEN
  twilio : TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM
  smsbao : SMSBAO_USER / SMSBAO_PASS

mock 不真正发短信，把消息写进 out/sms_outbox.jsonl，并把验证码回给前端（演示用）。
"""

import base64
import hashlib
import io
import json
import os
import time
import urllib.parse
import urllib.request

DEFAULT_TEMPLATE = "【澜】验证码 {code}，5 分钟内有效。"


def provider():
    return (os.environ.get("SMS_PROVIDER") or "mock").strip().lower()


def dev_code_enabled():
    default = "1" if provider() == "mock" else "0"
    return (os.environ.get("SMS_DEV_CODE", default) or default) != "0"


def mask_phone(phone):
    s = str(phone or "")
    if len(s) <= 7:
        return s[:2] + "***"
    return s[:3] + "****" + s[-3:]


def _text(code):
    tpl = os.environ.get("SMS_TEMPLATE") or DEFAULT_TEMPLATE
    try:
        return tpl.format(code=code)
    except Exception:
        return DEFAULT_TEMPLATE.format(code=code)


def _opener():
    proxy = os.environ.get("SMS_PROXY")
    if proxy:
        handler = urllib.request.ProxyHandler({"http": proxy, "https": proxy})
        return urllib.request.build_opener(handler)
    return urllib.request.build_opener()


def _http(url, method="GET", data=None, headers=None, timeout=15):
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with _opener().open(req, timeout=timeout) as r:
            body = r.read().decode("utf-8", "replace")
            if 200 <= r.status < 300:
                return True, body[:300]
            return False, "HTTP %s: %s" % (r.status, body[:200])
    except Exception as e:
        return False, "%s: %s" % (type(e).__name__, str(e)[:200])


def send_code(phone, code, out_dir, purpose="login"):
    """发送验证码，返回 (ok, detail)。detail 不含验证码。"""
    text = _text(code)
    p = provider()

    if p == "mock":
        try:
            os.makedirs(out_dir, exist_ok=True)
            path = os.path.join(out_dir, "sms_outbox.jsonl")
            rec = {"ts": int(time.time()), "phone": phone, "code": code,
                   "purpose": purpose, "text": text}
            with io.open(path, "a", encoding="utf-8", newline="\n") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            return True, "mock"
        except Exception as e:
            return False, "mock 写入失败: %s" % (str(e)[:160])

    if p == "webhook":
        url = os.environ.get("SMS_WEBHOOK_URL")
        if not url:
            return False, "SMS_WEBHOOK_URL 未配置"
        headers = {"content-type": "application/json"}
        token = os.environ.get("SMS_WEBHOOK_TOKEN")
        if token:
            headers["authorization"] = "Bearer " + token
        body = json.dumps({"phone": phone, "code": code, "text": text,
                           "purpose": purpose}, ensure_ascii=False).encode("utf-8")
        return _http(url, "POST", body, headers)

    if p == "twilio":
        sid = os.environ.get("TWILIO_ACCOUNT_SID")
        token = os.environ.get("TWILIO_AUTH_TOKEN")
        frm = os.environ.get("TWILIO_FROM")
        if not (sid and token and frm):
            return False, "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM 未配置"
        url = "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json" % sid
        body = urllib.parse.urlencode({"From": frm, "To": phone, "Body": text}).encode("utf-8")
        auth = base64.b64encode(("%s:%s" % (sid, token)).encode("utf-8")).decode("ascii")
        headers = {
            "content-type": "application/x-www-form-urlencoded",
            "authorization": "Basic " + auth,
        }
        return _http(url, "POST", body, headers)

    if p == "smsbao":
        user = os.environ.get("SMSBAO_USER")
        password = os.environ.get("SMSBAO_PASS")
        if not (user and password):
            return False, "SMSBAO_USER / SMSBAO_PASS 未配置"
        q = urllib.parse.urlencode({
            "u": user,
            "p": hashlib.md5(password.encode("utf-8")).hexdigest(),
            "m": str(phone).lstrip("+"),
            "c": text,
        })
        ok, detail = _http("https://api.smsbao.com/sms?" + q, "GET", None, {})
        if ok and detail.strip() == "0":
            return True, "smsbao"
        return False, "smsbao: %s" % (detail or "unknown")

    return False, "未知 SMS_PROVIDER: %s" % p
