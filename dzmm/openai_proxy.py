# -*- coding: utf-8 -*-
"""dzmm -> OpenAI 兼容代理（0 成本、无限额度）。

原理
----
`nalang-turbo-*` 系列在 web 端 `/api/chat` 上不扣积分（实测 75.35 -> 75.35），
所以只要复用站点自己的登录态，就能把「网页对话」包装成任意外部程序可用的
OpenAI `/v1/chat/completions`，无需会员、无需 api_token、无需付费。

链路
----
  外部客户端 -> 本代理 -> /api/trpc/chat.createByCard 取 chatId
                        -> POST /api/chat (SSE, turbo 模型, 0 扣费)
                        -> 转成 OpenAI 响应/流

特性
----
- 账号池轮换（accounts.json + real_account.json），401 自动续期，失败自动换号
- 418 风控时返回 503 并给出处理提示（跑 captcha_bridge）
- 支持 stream=true / false、多轮 messages、任意请求 model（映射到 turbo）
- 纯标准库 HTTP 服务，无额外依赖（复用 client.py 的 requests）

用法
----
  set DZMM_PROXY=http://127.0.0.1:7897
  python openai_proxy.py                 # 监听 127.0.0.1:8787
  python openai_proxy.py 9000            # 指定端口

  # 客户端
  curl http://127.0.0.1:8787/v1/chat/completions -H "Content-Type: application/json" \
    -d '{"model":"gpt-4o","messages":[{"role":"user","content":"你好"}]}'

  # OpenAI SDK
  from openai import OpenAI
  c = OpenAI(base_url="http://127.0.0.1:8787/v1", api_key="any")
  print(c.chat.completions.create(model="gpt-4o", messages=[{"role":"user","content":"你好"}]).choices[0].message.content)
"""
import json
import os
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import client as C

DEFAULT_MODEL = os.environ.get("DZMM_MODEL", "nalang-turbo-1115-16k")
DEFAULT_CARD = int(os.environ.get("DZMM_CARD", "3906371"))
FREE_PREFIXES = ("nalang-turbo", "x-apex-dash")
MAX_HISTORY = int(os.environ.get("DZMM_MAX_HISTORY", "20"))
CHAT_TTL = int(os.environ.get("DZMM_CHAT_TTL", "1800"))

_lock = threading.Lock()
_pool = []            # [{'name','token','email','pwd','refresh','dead_until'}]
_rr = [0]
_chats = {}           # conv_key -> {'chatId', 'card', 'at'}
STATS = {"start": time.time(), "requests": 0, "ok": 0, "fail": 0, "tokens_out": 0}
API_KEY = os.environ.get("DZMM_API_KEY", "")   # 非空则要求 Authorization: Bearer <key>


# ---------------- 账号池 ----------------

def _pool_paths():
    return [os.path.join(HERE, "accounts.json"), os.path.join(HERE, "real_account.json")]


def jwt_exp(tok):
    """本地读 JWT 的 exp，零请求判断是否过期"""
    try:
        import base64
        p = tok.split(".")[1]
        d = json.loads(base64.urlsafe_b64decode(p + "==="))
        return int(d.get("exp") or 0)
    except Exception:
        return 0


LIVE_FILE = os.path.join(HERE, "accounts.live.json")


def load_accounts():
    """accounts.live.json（体检后的活号）优先，其余见下。"""
    out = []
    now = int(time.time())

    # 先扫一遍主池，建 email -> 最新 token 映射（续期会写回主池，快照会过期）
    latest = {}
    for p in _pool_paths():
        if not os.path.exists(p):
            continue
        try:
            data = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        for a in (data if isinstance(data, list) else [data]):
            e = a.get("email")
            if e and a.get("access_token"):
                latest[e] = a

    if os.path.exists(LIVE_FILE):
        try:
            for a in json.load(open(LIVE_FILE, encoding="utf-8")):
                e = a.get("email")
                src = latest.get(e) if e else None
                tok = (src or {}).get("access_token") or a.get("access_token")
                if not tok:
                    continue
                out.append({"name": (a.get("user_id") or "live")[:13],
                            "token": tok, "email": e,
                            "pwd": a.get("password") or (src or {}).get("password"),
                            "refresh": (src or {}).get("refresh_token") or a.get("refresh_token"),
                            "credit": a.get("credit"), "credit_at": time.time(),
                            "dead_until": 0, "_pri": -1})
        except Exception:
            pass
    for idx, p in enumerate(_pool_paths()):
        if not os.path.exists(p):
            continue
        try:
            data = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        for a in items:
            tok = a.get("access_token")
            if not tok:
                continue
            has_pwd = bool(a.get("password"))
            exp = jwt_exp(tok)
            if exp and exp < now - 30 and not has_pwd:
                continue          # 已过期且无法续期的游客号，直接丢弃
            out.append({
                "name": (a.get("user_id") or a.get("email") or "acc")[:13],
                "token": tok,
                "email": a.get("email"),
                "pwd": a.get("password"),
                "refresh": a.get("refresh_token"),
                "dead_until": 0,
                "_pri": 0 if idx == 1 else (1 if a.get("password") else 2),
            })
    # 去重（同 token）后按优先级稳定排序
    seen, uniq = set(), []
    for a in out:
        if a["token"] in seen:
            continue
        seen.add(a["token"])
        uniq.append(a)
    uniq.sort(key=lambda x: x["_pri"])
    return uniq


def reload_pool():
    global _pool
    with _lock:
        _pool = load_accounts()
    return len(_pool)


def _save_token(acc, new_token, new_refresh=None):
    """把续期后的 token 写回原池文件"""
    for p in _pool_paths():
        if not os.path.exists(p):
            continue
        try:
            data = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        changed = False
        for a in items:
            if a.get("access_token") == acc["token"] or (
                    acc.get("email") and a.get("email") == acc["email"]):
                a["access_token"] = new_token
                if new_refresh:
                    a["refresh_token"] = new_refresh
                changed = True
        if changed:
            json.dump(data, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def renew(acc):
    """用邮箱密码换新 token；成功返回新 token"""
    if not (acc.get("email") and acc.get("pwd")):
        return None
    try:
        from refresh_accounts import sign_in
        ok, auth, msg = sign_in(acc["email"], acc["pwd"])
        if ok and auth.get("access_token"):
            old = acc["token"]
            acc["token"] = auth["access_token"]
            acc["refresh"] = auth.get("refresh_token") or acc.get("refresh")
            _save_token({"token": old, "email": acc["email"]},
                        acc["token"], acc.get("refresh"))
            log("renew ok: %s" % acc["name"])
            return acc["token"]
        log("renew fail: %s %s" % (acc["name"], msg))
    except Exception as e:
        log("renew err: %s" % str(e)[:80])
    return None


def pick(exclude=None):
    """轮询选一个可用账号（跳过冷却中的）"""
    with _lock:
        if not _pool:
            return None
        now = time.time()
        n = len(_pool)
        for i in range(n):
            acc = _pool[(_rr[0] + i) % n]
            if acc["dead_until"] > now:
                continue
            if exclude and acc["token"] in exclude:
                continue
            _rr[0] = (_rr[0] + i + 1) % n
            return acc
    return None


def cool(acc, sec=60):
    acc["dead_until"] = time.time() + sec


def acc_credit(acc, ttl=300):
    """查账号积分（带缓存），失败返回 None"""
    if acc.get("credit") is not None and time.time() - acc.get("credit_at", 0) < ttl:
        return acc["credit"]
    try:
        st, j = C.get_balance(acc["token"])
        if st == 200:
            acc["credit"] = float(j[0]["result"]["data"]["json"].get("total") or 0)
            acc["credit_at"] = time.time()
            return acc["credit"]
    except Exception:
        pass
    return None


def pick_hot(min_credit=0.0, exclude=None):
    """付费模型专用：按积分从高到低挑号（live 列表已按 credit 排序）。"""
    with _lock:
        snapshot = list(_pool)
    tried = set(exclude or ())
    now = time.time()
    best, best_c = None, -1.0
    for acc in snapshot:
        if acc["dead_until"] > now or acc["token"] in tried:
            continue
        c = acc.get("credit")
        if c is None:
            c = acc_credit(acc)
            if c is None:
                continue
        if c > best_c:
            best, best_c = acc, c
        if c >= max(min_credit, 3.0):
            return acc
    return best if (best is not None and best_c > 0) else None


def create_chat(acc, card):
    st, j = C.trpc_post("chat.createByCard", {"cardId": int(card)}, acc["token"])
    if st == 418:
        raise CaptchaHit()
    if st == 401:
        raise PermissionError("401")
    try:
        return j["result"]["data"]["json"]["chatId"]
    except Exception:
        return None


class CaptchaHit(Exception):
    pass


def build_body(chat_id, card, messages, model, max_tokens):
    msgs = [m for m in messages if m.get("role") in ("user", "assistant") and m.get("content")]
    msgs = msgs[-MAX_HISTORY:]
    if not msgs:
        msgs = [{"role": "user", "content": "你好"}]
    last = msgs[-1]
    # dzmm 的 /api/chat 只吃当前一轮，历史需在客户端合并进本轮文本
    hist = msgs[:-1]
    if hist:
        lines = []
        for m in hist:
            lines.append("用户：" + m["content"] if m["role"] == "user" else "助手：" + m["content"])
        merged = ("【对话历史】\n" + "\n".join(lines) +
                  "\n【本轮】\n" + last["content"])
        last = {"role": "user", "content": merged}
        msgs = [last]
    return {
        "operation": "generate",
        "chatId": chat_id,
        "cardId": int(card),
        "chatSettings": {
            "model": model,
            "style": "standard",
            "maxTokens": max_tokens,
            "randomIndex": -1,
            "deepThinking": False,
            "enableMemoryEnhance": False,
            "voiceSettings": {
                "ignore_parentheses": False,
                "only_quotes": True,
                "ignore_english": False,
                "read_asterisks": False,
            },
        },
        "presetConfig": {"presetIds": []},
        "prompts": msgs,
        "chunkedHistory": True,
        "supportsSuggestions": False,
        "content": last["content"],
    }


def stream_tokens(acc, body):
    """生成器：逐块产出文本；遇 401/418 抛异常"""
    r = C.session().post(C.BASE + "/api/chat", headers=C._headers(acc["token"]),
                         data=json.dumps(body), proxies=C.PROXIES, timeout=300, stream=True)
    if r.status_code == 418:
        raise CaptchaHit()
    if r.status_code == 401:
        raise PermissionError("401")
    if r.status_code != 200:
        raise RuntimeError("HTTP %d %s" % (r.status_code, r.text[:120]))
    for line in r.iter_lines(decode_unicode=True):
        if not line:
            continue
        s = line[5:].strip() if line.startswith("data:") else line.strip()
        if not s or s == "[DONE]":
            continue
        try:
            j = json.loads(s)
        except Exception:
            continue
        if isinstance(j, dict) and j.get("type") == "token" and isinstance(j.get("data"), str):
            yield j["data"]


def run_chat(messages, model=None, max_tokens=1000, conv_key=None, card=None):
    """跑一次完整对话，返回 (text, model_name)；内部处理换号/续期"""
    model = map_model(model)
    card = int(card or DEFAULT_CARD)
    need = 3.0 if (ALLOW_ALL and not model.startswith("nalang-turbo")) else 0.0
    tried = set()
    last_err = None
    for _ in range(8):
        acc = pick_hot(need, exclude=tried) if need else pick(exclude=tried)
        if acc is None:
            break
        tried.add(acc["token"])
        try:
            chat_id = None
            if conv_key:
                with _lock:
                    hit = _chats.get(conv_key)
                if hit and hit["card"] == card and time.time() - hit["at"] < CHAT_TTL:
                    chat_id = hit["chatId"]
            if not chat_id:
                chat_id = create_chat(acc, card)
                if conv_key and chat_id:
                    with _lock:
                        _chats[conv_key] = {"chatId": chat_id, "card": card, "at": time.time()}
            if not chat_id:
                raise RuntimeError("createByCard failed")
            body = build_body(chat_id, card, messages, model, max_tokens)
            out = []
            for piece in stream_tokens(acc, body):
                out.append(piece)
            return "".join(out), model
        except CaptchaHit:
            cool(acc, 300)
            last_err = "captcha_required"
            continue
        except PermissionError:
            if renew(acc):
                tried.discard(acc["token"])
                continue
            cool(acc, 600)
            last_err = "unauthorized"
            continue
        except Exception as e:
            cool(acc, 120)
            last_err = str(e)[:120]
            continue
    raise RuntimeError(last_err or "no available account")


ALLOW_ALL = os.environ.get("DZMM_ALLOW_ALL") == "1"


def map_model(model):
    """默认只走 nalang-turbo-*（0 扣费）。
    DZMM_ALLOW_ALL=1 时任意合法模型名直通，消耗账号池里的免费注册积分。"""
    if not model:
        return DEFAULT_MODEL
    m = str(model).strip()
    if ALLOW_ALL:
        return m
    if m.startswith("nalang-turbo"):
        return m
    if m.startswith("x-apex-dash") and os.environ.get("DZMM_ALLOW_PAID") == "1":
        return m
    return DEFAULT_MODEL


# ---------------- HTTP 层 ----------------

def log(*a):
    print("[%s]" % time.strftime("%H:%M:%S"), *a, flush=True)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _send(self, code, obj, ctype="application/json"):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.end_headers()

    def _auth_ok(self):
        if not API_KEY:
            return True
        h = self.headers.get("Authorization") or ""
        return h.strip() == "Bearer " + API_KEY

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/health", "/"):
            with _lock:
                n = len(_pool)
            live = 0
            if os.path.exists(LIVE_FILE):
                try:
                    live = len(json.load(open(LIVE_FILE, encoding="utf-8")))
                except Exception:
                    live = 0
            return self._send(200, {"ok": True, "accounts": n, "live": live,
                                    "model": DEFAULT_MODEL, "card": DEFAULT_CARD,
                                    "auth_required": bool(API_KEY)})
        if path == "/stats":
            with _lock:
                s = dict(STATS)
            s["uptime_s"] = int(time.time() - s["start"])
            s["accounts"] = len(_pool)
            return self._send(200, s)
        if path == "/v1/models":
            now = int(time.time())
            ids = [DEFAULT_MODEL] + [m for m in
                                     ("nalang-turbo-1115-16k", "nalang-turbo-1115-10k",
                                      "nalang-turbo-0826-16k", "nalang-turbo-0826-10k")
                                     if m != DEFAULT_MODEL]
            return self._send(200, {"object": "list", "data": [
                {"id": m, "object": "model", "created": now, "owned_by": "dzmm-proxy"}
                for m in ids]})
        return self._send(404, {"error": {"message": "not found"}})

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ("/v1/chat/completions", "/chat/completions"):
            return self._send(404, {"error": {"message": "not found"}})
        if not self._auth_ok():
            return self._send(401, {"error": {"message": "invalid api key",
                                              "type": "invalid_request_error"}})
        with _lock:
            STATS["requests"] += 1
        try:
            n = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(n) or b"{}"
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = raw.decode("gbk", "replace")   # 兼容 GBK 客户端
            body = json.loads(text)
        except Exception as e:
            return self._send(400, {"error": {"message": "bad json: %s" % e}})

        messages = body.get("messages") or []
        model = body.get("model") or DEFAULT_MODEL
        stream = bool(body.get("stream"))
        max_tokens = int(body.get("max_tokens") or 1000)
        card = body.get("card_id") or (body.get("metadata") or {}).get("card_id")
        conv = (body.get("user") or (body.get("metadata") or {}).get("conversation_id")
                or self.headers.get("X-Conversation-Id"))
        rid = "chatcmpl-" + uuid.uuid4().hex[:24]

        if stream:
            return self._stream(messages, model, max_tokens, card, conv, rid)

        t0 = time.time()
        try:
            text, used_model = run_chat(messages, model, max_tokens, conv, card)
        except CaptchaHit:
            with _lock:
                STATS["fail"] += 1
            return self._send(503, {"error": {"message": "dzmm 风控要求验证码，请运行 python captcha_bridge.py --test",
                                              "type": "captcha_required"}})
        except Exception as e:
            with _lock:
                STATS["fail"] += 1
            return self._send(502, {"error": {"message": str(e), "type": "upstream_error"}})
        pt = sum(len(str(m.get("content") or "")) for m in messages) // 4
        ct = len(text) // 4
        with _lock:
            STATS["ok"] += 1
            STATS["tokens_out"] += ct
        log("chat ok model=%s in=%d out=%d %.1fs" % (used_model, pt, ct, time.time() - t0))
        return self._send(200, {
            "id": rid, "object": "chat.completion", "created": int(time.time()),
            "model": used_model,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": text},
                         "finish_reason": "stop"}],
            "usage": {"prompt_tokens": pt, "completion_tokens": ct, "total_tokens": pt + ct},
        })

    def _stream(self, messages, model, max_tokens, card, conv, rid):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Transfer-Encoding", "chunked")   # HTTP/1.1 流式必需
        self.end_headers()

        def raw_write(data: bytes):
            self.wfile.write(("%x\r\n" % len(data)).encode() + data + b"\r\n")
            self.wfile.flush()

        def chunk(delta, finish=None):
            payload = {
                "id": rid, "object": "chat.completion.chunk", "created": int(time.time()),
                "model": map_model(model),
                "choices": [{"index": 0, "delta": delta, "finish_reason": finish}],
            }
            raw_write(("data: " + json.dumps(payload, ensure_ascii=False) + "\n\n").encode())

        tried = set()
        last_err = "no available account"
        try:
            chunk({"role": "assistant", "content": ""})
            for _ in range(8):
                acc = (pick_hot(3.0, exclude=tried)
                       if (ALLOW_ALL and not map_model(model).startswith("nalang-turbo"))
                       else pick(exclude=tried))
                if acc is None:
                    break
                tried.add(acc["token"])
                try:
                    chat_id = create_chat(acc, int(card or DEFAULT_CARD))
                    if not chat_id:
                        raise RuntimeError("createByCard failed")
                    body = build_body(chat_id, int(card or DEFAULT_CARD), messages,
                                      map_model(model), max_tokens)
                    for piece in stream_tokens(acc, body):
                        chunk({"content": piece})
                    chunk({}, "stop")
                    raw_write(b"data: [DONE]\n\n")
                    self.wfile.write(b"0\r\n\r\n")
                    self.wfile.flush()
                    with _lock:
                        STATS["ok"] += 1
                    log("stream ok acc=%s" % acc["name"])
                    return
                except CaptchaHit:
                    cool(acc, 300)
                    last_err = "captcha_required"
                    continue
                except PermissionError:
                    if renew(acc):
                        tried.discard(acc["token"])
                    else:
                        cool(acc, 600)
                    last_err = "unauthorized"
                    continue
                except Exception as e:
                    cool(acc, 60)
                    last_err = str(e)[:120]
                    continue
            err = {"error": {"message": last_err, "type": "upstream_error"}}
            raw_write(("data: " + json.dumps(err, ensure_ascii=False) + "\n\n").encode())
            self.wfile.write(b"0\r\n\r\n")
            self.wfile.flush()
        except Exception as e:
            log("stream err:", str(e)[:120])
            try:
                self.wfile.write(b"0\r\n\r\n")
                self.wfile.flush()
            except Exception:
                pass


def check_pool(workers=16):
    """并发体检：确认哪些 token 还有效（只打印，不改文件）"""
    from concurrent.futures import ThreadPoolExecutor
    reload_pool()

    def probe(acc):
        try:
            st, _ = C.get_me(acc["token"])
            return st == 200
        except Exception:
            return False

    with ThreadPoolExecutor(max_workers=workers) as ex:
        res = list(ex.map(probe, _pool))
    good = sum(1 for r in res if r)
    print("有效 %d / %d" % (good, len(res)))
    dead = [a["name"] for a, r in zip(_pool, res) if not r]
    if dead:
        print("失效:", ", ".join(dead[:20]) + (" ..." if len(dead) > 20 else ""))

    # 把活号落盘，代理下次启动优先使用
    live = [{"access_token": a["token"], "user_id": a["name"], "email": a.get("email"),
             "password": a.get("pwd"), "refresh_token": a.get("refresh")}
            for a, r in zip(_pool, res) if r]
    json.dump(live, open(LIVE_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("已写入 %s（%d 个活号）" % (LIVE_FILE, len(live)))
    return good


def main():
    if "--check" in sys.argv:
        check_pool()
        return
    port = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8787
    n = reload_pool()
    log("账号池 %d 个 | 默认模型 %s | 卡 %s" % (n, DEFAULT_MODEL, DEFAULT_CARD))
    if n == 0:
        log("警告：没有可用账号，先跑 register_api.py 或填 accounts.json")
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    log("OpenAI 兼容接口: http://127.0.0.1:%d/v1/chat/completions" % port)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        log("bye")


if __name__ == "__main__":
    main()
