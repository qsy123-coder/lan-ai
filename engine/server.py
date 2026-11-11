# engine/server.py —— 额度池引擎（标准库 HTTP + curl_cffi）
#
# 职责：账号轮换、建会话（扫卡池）、串行生成、实时流式回传、余额结算、状态落盘。
# 只监听 127.0.0.1，不对外暴露；Next.js 只做界面与转发。
#
# 启动:
#   $PY engine/server.py --port 8787
#
# 环境变量:
#   DZMM_ROOT   工程根（默认 engine 的上一级，可指向 UNC 路径）
#   DZMM_PROXY  代理（默认 http://127.0.0.1:7897）
import argparse
import io
import json
import os
import queue
import sys
import threading
import time
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from curl_cffi import requests as creq

BASE = "https://www.dzmm.ai"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
MIN_PREPAY = 3.2           # 每条预扣，低于此值必被拒

# 实测可用的角色卡（notes/005 §4）；某个号用不了会自动拉黑换下一张
CARDS = [3821218, 3856159, 3856830, 3858435, 3859027, 3860041,
         3860611, 3860761, 3861267, 3865272, 3867710]

MODELS = [
    {"id": "x-apex-flux-0217-16k", "label": "Turbo", "hint": "默认档，≈2.1 credit/条"},
    {"id": "nalang-medium-0826", "label": "Medium", "hint": "中档，免费号可用"},
    {"id": "nalang-xl-0826-16k", "label": "XL", "hint": "长上下文，免费号可用"},
    {"id": "nalang-max-0826", "label": "Max", "hint": "需 trial 名额，用尽即拒"},
]
DEFAULT_MODEL = MODELS[0]["id"]

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCOUNTS = os.path.join(ROOT, "accounts.json")
OUT_DIR = os.path.join(ROOT, "out")
STATE_PATH = os.path.join(OUT_DIR, "webstate.json")
RESULTS_PATH = os.path.join(OUT_DIR, "web_results.jsonl")
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
SITE_TOKEN = os.environ.get("SITE_TOKEN", "")   # 设了就必须带 x-site-token（公网隧道时用）

STATE_LOCK = threading.Lock()
RUN_LOCK = threading.Lock()
STOP = threading.Event()
LOG_BUFFER = []


# ---------------------------------------------------------------- 基础工具

def proxies():
    return {"http": PROXY, "https": PROXY} if PROXY else None


def log(msg, level="info"):
    rec = {"t": int(time.time()), "level": level, "msg": msg}
    LOG_BUFFER.append(rec)
    del LOG_BUFFER[:-400]
    sys.stderr.write("[%s] %s\n" % (level, msg))


def read_json(path, default):
    try:
        with io.open(path, encoding="utf-8-sig") as f:
            return json.load(f)
    except Exception:
        return default


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def default_state():
    return {"accounts": {}, "stats": {"generated": 0, "spent": 0.0}}


def load_state():
    with STATE_LOCK:
        st = read_json(STATE_PATH, None)
        if not isinstance(st, dict):
            st = default_state()
        st.setdefault("accounts", {})
        st.setdefault("stats", {"generated": 0, "spent": 0.0})
        return st


def save_state(st):
    with STATE_LOCK:
        write_json(STATE_PATH, st)


def account_state(st, name):
    a = st["accounts"].setdefault(name, {})
    a.setdefault("credit", None)
    a.setdefault("chat_id", None)
    a.setdefault("card_id", None)
    a.setdefault("dead_cards", [])
    a.setdefault("exhausted", False)   # 自动判定：余额不足
    a.setdefault("disabled", False)    # 手动停用：体检不会覆盖
    a.setdefault("last_error", "")
    return a


def load_pool():
    pool = read_json(ACCOUNTS, {})
    return pool if isinstance(pool, dict) else {}


def headers_of(cookie, referer=None, request_id=None):
    # 实测：缺 sec-fetch-* 时 /api/trpc 一律 403 Forbidden（CLAUDE.md §11.1）
    h = {
        "accept": "*/*",
        "content-type": "application/json",
        "cookie": cookie,
        "origin": BASE,
        "referer": referer or (BASE + "/"),
        "user-agent": UA,
        "x-dzmm-client": "web",
        "x-dzmm-locale": "zh-CN",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }
    if request_id:
        h["x-dzmm-request-id"] = request_id
    return h


# ---------------------------------------------------------------- 站点调用

def get_me(cookie):
    """返回 (ok, credit, uid, err)"""
    url = BASE + "/api/trpc/user.getMe?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"
    try:
        r = creq.get(url, headers=headers_of(cookie), impersonate="chrome",
                     proxies=proxies(), timeout=30)
        if r.status_code != 200:
            return False, None, None, "HTTP %s" % r.status_code
        data = json.loads(r.text)[0]["result"]["data"]["json"]
        if not data.get("isLoggedIn"):
            return False, None, None, "not logged in"
        return True, float(data.get("credit") or 0), data.get("id"), ""
    except Exception as e:
        return False, None, None, "%s: %s" % (type(e).__name__, str(e)[:80])


def create_chat(cookie, card_id):
    """createByCard → (chat_id, err)。403/404 = 这张卡不可用。"""
    url = BASE + "/api/trpc/chat.createByCard"
    rid = "web-cb-%d" % int(time.time() * 1000)
    try:
        r = creq.post(url, data=json.dumps({"json": {"cardId": int(card_id)}}).encode(),
                      headers=headers_of(cookie, request_id=rid), impersonate="chrome",
                      proxies=proxies(), timeout=40)
        if r.status_code != 200:
            return None, "HTTP %s" % r.status_code
        j = json.loads(r.text)
        cid = j["result"]["data"]["json"].get("chatId")
        return (cid, "") if cid else (None, "no chatId")
    except Exception as e:
        return None, "%s: %s" % (type(e).__name__, str(e)[:80])


MAX_HISTORY_MSGS = 24
MAX_HISTORY_CHARS = 16000


def normalize_history(history):
    """把前端传来的多轮历史裁成可发送的 prompts[]：只留 user/assistant，从尾部回撤到预算内。"""
    out = []
    for m in (history or []):
        if not isinstance(m, dict):
            continue
        role, content = m.get("role"), (m.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            out.append({"role": role, "content": content[:6000]})
    out = out[-MAX_HISTORY_MSGS:]
    total, keep = 0, []
    for m in reversed(out):
        total += len(m["content"])
        if total > MAX_HISTORY_CHARS and keep:
            break
        keep.append(m)
    keep.reverse()
    # 历史必须以 user 开头，否则服务端可能把它当开场白
    while keep and keep[0]["role"] != "user":
        keep.pop(0)
    return keep


def build_body(chat_id, card_id, model, max_tokens, prompt, history=None):
    prompts = normalize_history(history)
    prompts.append({"role": "user", "content": prompt})
    return {
        "operation": "generate",
        "chatId": chat_id,
        "cardId": str(card_id),
        "chatSettings": {
            "model": model,
            "style": "standard",
            "maxTokens": int(max_tokens),
            "randomIndex": 0,
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
        "prompts": prompts,
        "content": prompt,
        "chunkedHistory": True,
        "supportsSuggestions": True,
    }


def extract_text(obj):
    """从各种 SSE 事件形状里抠出增量文本。"""
    t = obj.get("type")
    if t not in ("token", "delta", "chunk", "content", "append", "text", "message"):
        return ""
    d = obj.get("data", obj)
    if isinstance(d, str):
        return d
    if isinstance(d, dict):
        for k in ("content", "text", "delta", "token", "value"):
            v = d.get(k)
            if isinstance(v, str):
                return v
            if isinstance(v, dict):
                for kk in ("content", "text"):
                    if isinstance(v.get(kk), str):
                        return v[kk]
    for k in ("content", "text"):
        if isinstance(obj.get(k), str):
            return obj[k]
    return ""


def generate(cookie, chat_id, card_id, model, max_tokens, prompt, emit, history=None):
    """流式生成。返回 {status: ok|exhausted|card_error|auth_error|error, ...}"""
    url = BASE + "/api/chat"
    rid = "web-%d-%s" % (int(time.time() * 1000), os.urandom(3).hex())
    h = headers_of(cookie, referer=BASE + "/chat?c=" + chat_id, request_id=rid)
    body = json.dumps(build_body(chat_id, card_id, model, max_tokens, prompt, history),
                      ensure_ascii=False).encode("utf-8")

    text_parts = []
    classification = None
    done = False
    try:
        r = creq.post(url, data=body, headers=h, impersonate="chrome",
                      proxies=proxies(), timeout=180, stream=True)
    except Exception as e:
        return {"status": "error", "error": "%s: %s" % (type(e).__name__, str(e)[:100])}

    if r.status_code != 200:
        try:
            snippet = (r.text or "")[:200]
        except Exception:
            snippet = ""
        status = "auth_error" if r.status_code in (401, 403) else (
            "card_error" if r.status_code == 404 else "error")
        return {"status": status, "error": "HTTP %s %s" % (r.status_code, snippet)}

    buf = []
    try:
        for raw in r.iter_lines():
            if STOP.is_set():
                break
            line = raw.decode("utf-8", "ignore") if isinstance(raw, bytes) else raw
            if not line:
                continue
            if line.startswith("data:"):
                line = line[5:].strip()
            elif line.startswith(":") or line.startswith("event:") or line.startswith("id:"):
                continue
            if not line or line == "[DONE]":
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            t = obj.get("type")
            if t == "error" or obj.get("classification"):
                classification = (obj.get("data") or {}).get("classification") or obj.get("classification")
                reason = (obj.get("data") or {}).get("upgradeReason") or obj.get("upgradeReason")
                if classification:
                    break
            piece = extract_text(obj)
            if piece:
                text_parts.append(piece)
                emit("delta", {"text": piece})
            if t in ("complete", "done", "finish") or obj.get("finishReason"):
                done = True
                break
    except Exception as e:
        log("stream error: %s" % str(e)[:120], "warn")

    text = "".join(text_parts)
    if classification:
        return {"status": "exhausted", "reason": classification, "text": text}
    if not done and not text:
        return {"status": "error", "error": "空响应（无 token 且无 complete）"}
    return {"status": "ok", "text": text, "done": done}


def mark_result(rec):
    try:
        os.makedirs(OUT_DIR, exist_ok=True)
        with io.open(RESULTS_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception as e:
        log("写结果失败: %s" % e, "warn")


# ---------------------------------------------------------------- 轮换逻辑

def pick_account(st, pool, min_credit, per_account, max_per_account):
    """按余额升序挑号：先榨干零头，再换大额号。"""
    cands = []
    for name in pool:
        a = account_state(st, name)
        if a.get("exhausted") or a.get("disabled"):
            continue
        if per_account.get(name, 0) >= max_per_account:
            continue
        credit = a.get("credit")
        if credit is None:
            continue
        if credit < min_credit:
            a["exhausted"] = True
            continue
        cands.append((credit, name))
    if not cands:
        return None
    cands.sort()
    return cands[0][1]


def ensure_chat(st, pool, name, emit):
    a = account_state(st, name)
    if a.get("chat_id") and a.get("card_id"):
        return a["chat_id"], a["card_id"]
    cookie = pool[name]["cookie"]
    dead = set(a.get("dead_cards") or [])
    for card in CARDS:
        if card in dead:
            continue
        cid, err = create_chat(cookie, card)
        if cid:
            a["chat_id"], a["card_id"] = cid, card
            save_state(st)
            emit("chat", {"account": name, "chatId": cid, "cardId": card})
            log("%s 建会话成功 card=%s chat=%s" % (name, card, cid[:8]))
            return cid, card
        dead.add(card)
        a["dead_cards"] = sorted(dead)
        save_state(st)
        log("%s 卡片 %s 不可用（%s），换下一张" % (name, card, err), "warn")
        if err and err.startswith("HTTP 401"):
            break
    return None, None


def drop_chat(st, name):
    a = account_state(st, name)
    if a.get("card_id"):
        a["dead_cards"] = sorted(set(a.get("dead_cards") or []) | {a["card_id"]})
    a["chat_id"] = None
    a["card_id"] = None
    save_state(st)


# ---------------------------------------------------------------- 前台站点接入

def ensure_chat_for_card(st, pool, name, card_id, emit):
    """为「某个号 × 某张卡」拿到一个 chatId；createByCard 按卡去重，所以缓存即可。"""
    key = "site:%s:%s" % (name, card_id)
    chats = st.setdefault("site_chats", {})
    ent = chats.get(key)
    if ent and ent.get("chatId"):
        return ent["chatId"]
    cid, err = create_chat(pool[name]["cookie"], card_id)
    if not cid:
        log("site: %s 无法为卡 %s 建会话（%s）" % (name, card_id, err), "warn")
        return None
    chats[key] = {"chatId": cid, "cardId": card_id, "account": name, "at": int(time.time())}
    save_state(st)
    emit("chat", {"account": name, "chatId": cid, "cardId": card_id})
    return cid


def run_site_chat(payload, emit):
    """前台聊天：指定 cardId，自动挑号 → 建会话 → 流式生成 → 结算。"""
    pool = load_pool()
    st = load_state()
    try:
        card_id = int(payload.get("cardId"))
    except Exception:
        emit("end", {"reason": "bad_request", "message": "cardId 缺失"})
        return
    prompt = (payload.get("prompt") or "").strip()
    if not prompt:
        emit("end", {"reason": "bad_request", "message": "内容为空"})
        return
    model = payload.get("model") or DEFAULT_MODEL
    max_tokens = int(payload.get("maxTokens") or 400)

    cands = []
    for name in pool:
        a = account_state(st, name)
        if a.get("exhausted") or a.get("disabled"):
            continue
        if (a.get("credit") or 0) < MIN_PREPAY:
            continue
        cands.append(((a.get("credit") or 0), name))
    cands.sort()
    if not cands:
        emit("end", {"reason": "no_credit", "message": "池子里没有可用额度"})
        return

    for credit, name in cands:
        a = account_state(st, name)
        emit("account", {"name": name, "credit": a.get("credit")})
        cid = ensure_chat_for_card(st, pool, name, card_id, emit)
        if not cid:
            a["exhausted"] = True
            save_state(st)
            emit("switch", {"from": name, "reason": "card_blocked"})
            continue

        res = generate(pool[name]["cookie"], cid, card_id, model, max_tokens, prompt, emit,
                      history=payload.get("history"))
        if res["status"] == "ok":
            ok, credit2, uid, err = get_me(pool[name]["cookie"])
            if ok:
                a["credit"] = round(credit2, 2)
                a["exhausted"] = credit2 < MIN_PREPAY
                save_state(st)
            emit("complete", {"text": res["text"], "account": name, "chatId": cid,
                              "cardId": card_id, "credit": a.get("credit")})
            return
        if res["status"] == "exhausted":
            a["exhausted"] = True
            save_state(st)
            emit("switch", {"from": name, "reason": "credit"})
            continue
        emit("switch", {"from": name, "reason": res["status"], "detail": res.get("error")})

    emit("end", {"reason": "all_failed", "message": "所有账号都没能完成这次生成"})


def run_job(payload, emit):
    pool = load_pool()
    st = load_state()
    if not pool:
        emit("end", {"reason": "empty_pool", "message": "账号池是空的"})
        return

    prompt = (payload.get("prompt") or "").strip()
    if not prompt:
        emit("end", {"reason": "empty_prompt", "message": "提示词为空"})
        return

    model = payload.get("model") or DEFAULT_MODEL
    max_tokens = int(payload.get("maxTokens") or 400)
    min_credit = float(payload.get("minCredit") or (MIN_PREPAY + 0.2))
    gap = float(payload.get("gap") if payload.get("gap") is not None else 2.0)
    mode = payload.get("mode") or "exhaust"          # exhaust=打到全部号见底
    max_count = int(payload.get("maxCount") or 0)    # 0 = 不限
    max_per_account = int(payload.get("maxPerAccount") or 9999)

    per_account = {}
    generated = 0
    spent_total = 0.0
    failures = 0

    # 先体检一遍，避免用过期余额决策
    emit("log", {"msg": "开始体检 %d 个账号…" % len(pool)})
    for name in list(pool):
        ok, credit, uid, err = get_me(pool[name]["cookie"])
        a = account_state(st, name)
        if ok:
            a["credit"] = round(credit, 2)
            a["exhausted"] = credit < min_credit
            a["last_error"] = ""
        else:
            a["last_error"] = err
            if "401" in err or "logged" in err:
                a["exhausted"] = True
        save_state(st)
        emit("account", {"name": name, "credit": a.get("credit"),
                         "exhausted": a.get("exhausted"), "error": err})
        time.sleep(1.0)
    emit("stats", {"generated": generated, "spent": round(spent_total, 2)})

    while not STOP.is_set():
        if max_count and generated >= max_count:
            emit("end", {"reason": "max_count", "generated": generated, "spent": round(spent_total, 2)})
            return
        name = pick_account(st, pool, min_credit, per_account, max_per_account)
        if not name:
            emit("end", {"reason": "no_credit", "generated": generated,
                         "spent": round(spent_total, 2),
                         "message": "所有账号余额都不足一次预扣"})
            return

        a = account_state(st, name)
        emit("account", {"name": name, "credit": a.get("credit"), "active": True})
        chat_id, card_id = ensure_chat(st, pool, name, emit)
        if not chat_id:
            emit("switch", {"from": name, "reason": "no_card"})
            a["exhausted"] = True
            save_state(st)
            continue

        before = a.get("credit") or 0.0
        emit("log", {"msg": "%s 生成中（card=%s，余额 %.2f）" % (name, card_id, before)})
        res = generate(pool[name]["cookie"], chat_id, card_id, model, max_tokens, prompt, emit)

        if res["status"] == "exhausted":
            emit("switch", {"from": name, "reason": "credit", "detail": res.get("reason")})
            a["exhausted"] = True
            a["chat_id"] = a["card_id"] = None
            save_state(st)
            failures = 0
            continue

        if res["status"] == "card_error":
            emit("log", {"msg": "%s 会话不可用（%s），换卡重建" % (name, res.get("error"))}, )
            drop_chat(st, name)
            failures += 1
            if failures > 8:
                emit("end", {"reason": "card_exhausted", "generated": generated,
                             "spent": round(spent_total, 2)})
                return
            continue

        if res["status"] == "auth_error":
            emit("switch", {"from": name, "reason": "auth", "detail": res.get("error")})
            a["exhausted"] = True
            a["last_error"] = res.get("error", "")
            save_state(st)
            continue

        if res["status"] != "ok":
            failures += 1
            a["last_error"] = res.get("error", "")
            save_state(st)
            emit("log", {"msg": "%s 失败：%s" % (name, res.get("error")), "level": "error"})
            if failures > 5:
                emit("end", {"reason": "too_many_errors", "generated": generated,
                             "spent": round(spent_total, 2)})
                return
            time.sleep(gap)
            continue

        failures = 0
        generated += 1
        per_account[name] = per_account.get(name, 0) + 1

        ok, credit, uid, err = get_me(pool[name]["cookie"])
        if ok:
            a["credit"] = round(credit, 2)
            delta = max(0.0, before - credit)
            spent_total += delta
            if credit < min_credit:
                a["exhausted"] = True
        save_state(st)

        st["stats"]["generated"] = st["stats"].get("generated", 0) + 1
        st["stats"]["spent"] = round(st["stats"].get("spent", 0.0) + max(0.0, before - (a.get("credit") or before)), 2)
        save_state(st)

        emit("complete", {
            "account": name, "model": model, "text": res["text"],
            "creditBefore": before, "credit": a.get("credit"),
            "index": generated,
        })
        mark_result({"t": int(time.time()), "account": name, "model": model,
                     "maxTokens": max_tokens, "prompt": prompt, "text": res["text"],
                     "credit_before": before, "credit_after": a.get("credit")})
        emit("stats", {"generated": generated, "spent": round(spent_total, 2)})

        if a.get("exhausted"):
            emit("switch", {"from": name, "reason": "credit"})
        time.sleep(gap)

    emit("end", {"reason": "stopped", "generated": generated, "spent": round(spent_total, 2)})


# ---------------------------------------------------------------- HTTP 层

class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "dzmm-engine/1.0"

    def log_message(self, fmt, *args):
        pass

    def _json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        try:
            n = int(self.headers.get("content-length") or 0)
            raw = self.rfile.read(n) if n else b"{}"
            return json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return {}

    def _sse_start(self):
        self.send_response(200)
        self.send_header("content-type", "text/event-stream; charset=utf-8")
        self.send_header("cache-control", "no-cache, no-transform")
        self.send_header("connection", "close")
        self.send_header("x-accel-buffering", "no")
        self.end_headers()
        self.close_connection = True

    def _emit(self, event, data):
        chunk = ("event: %s\ndata: %s\n\n" % (event, json.dumps(data, ensure_ascii=False))).encode("utf-8")
        try:
            self.wfile.write(chunk)
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            # 浏览器断开 → 立即停跑，避免继续烧 credit
            STOP.set()

    # ---- 路由
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            return self._json(200, {"ok": True, "root": ROOT, "proxy": PROXY,
                                    "running": RUN_LOCK.locked(),
                                    "models": MODELS, "cards": CARDS})
        if path == "/site/pool":
            pool = load_pool()
            st = load_state()
            total, usable, rows = 0.0, 0, []
            for name in pool:
                a = account_state(st, name)
                c = a.get("credit") or 0
                total += c
                ok = (not a.get("exhausted")) and (not a.get("disabled")) and c >= MIN_PREPAY
                if ok:
                    usable += 1
                rows.append({"name": name, "credit": round(c, 2), "usable": ok})
            rows.sort(key=lambda r: -r["credit"])
            return self._json(200, {"total": round(total, 2), "usable": usable,
                                    "count": len(pool), "accounts": rows})
        if path == "/pool":
            pool = load_pool()
            st = load_state()
            rows = []
            for name, acc in pool.items():
                a = account_state(st, name)
                rows.append({
                    "name": name,
                    "note": acc.get("note", ""),
                    "credit": a.get("credit"),
                    "chatId": a.get("chat_id"),
                    "cardId": a.get("card_id"),
                    "exhausted": a.get("exhausted"),
                    "disabled": a.get("disabled"),
                    "error": a.get("last_error"),
                    "uid": (acc.get("last") or {}).get("uid"),
                })
            rows.sort(key=lambda r: (r["credit"] if r["credit"] is not None else 1e9))
            return self._json(200, {"accounts": rows, "models": MODELS,
                                    "stats": st.get("stats", {}),
                                    "running": RUN_LOCK.locked()})
        if path == "/logs":
            return self._json(200, {"logs": LOG_BUFFER[-120:]})
        if path == "/results":
            rows = []
            try:
                with io.open(RESULTS_PATH, encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            rows.append(json.loads(line))
            except Exception:
                pass
            return self._json(200, {"results": rows[-200:][::-1]})
        return self._json(404, {"error": "not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/stop":
            STOP.set()
            return self._json(200, {"ok": True})
        if path == "/refresh":
            payload = self._body()
            names = payload.get("names") or list(load_pool().keys())
            pool = load_pool()
            st = load_state()
            out = []
            for name in names:
                if name not in pool:
                    continue
                ok, credit, uid, err = get_me(pool[name]["cookie"])
                a = account_state(st, name)
                if ok:
                    a["credit"] = round(credit, 2)
                    a["exhausted"] = credit < MIN_PREPAY + 0.2
                    a["last_error"] = ""
                    out.append({"name": name, "credit": a["credit"], "uid": uid, "exhausted": a["exhausted"]})
                else:
                    a["last_error"] = err
                    out.append({"name": name, "error": err})
                save_state(st)
                time.sleep(1.1)
            return self._json(200, {"accounts": out})
        if path == "/account":
            payload = self._body()
            name = payload.get("name")
            st = load_state()
            a = account_state(st, name)
            if "enabled" in payload:
                a["disabled"] = not bool(payload["enabled"])
            if "exhausted" in payload:
                a["exhausted"] = bool(payload["exhausted"])
            if payload.get("reset"):
                a["chat_id"] = None
                a["card_id"] = None
                a["dead_cards"] = []
                a["exhausted"] = False
                a["disabled"] = False
            if payload.get("remove"):
                st["accounts"].pop(name, None)
                pool = load_pool()
                pool.pop(name, None)
                write_json(ACCOUNTS, pool)
            save_state(st)
            return self._json(200, {"ok": True})
        if path == "/run":
            if not RUN_LOCK.acquire(blocking=False):
                return self._json(409, {"error": "已有任务在跑"})
            payload = self._body()
            STOP.clear()
            try:
                self._sse_start()
                try:
                    run_job(payload, self._emit)
                except Exception as e:
                    log("job crashed: %s" % traceback.format_exc()[:400], "error")
                    try:
                        self._emit("end", {"reason": "crash", "message": str(e)[:200]})
                    except Exception:
                        pass
            finally:
                RUN_LOCK.release()
            return
        if path == "/site/chat":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            if not RUN_LOCK.acquire(blocking=False):
                return self._json(409, {"error": "已有任务在跑"})
            payload = self._body()
            STOP.clear()
            try:
                self._sse_start()
                try:
                    run_site_chat(payload, self._emit)
                except Exception as e:
                    log("site chat crashed: %s" % traceback.format_exc()[:400], "error")
                    try:
                        self._emit("end", {"reason": "crash", "message": str(e)[:200]})
                    except Exception:
                        pass
            finally:
                RUN_LOCK.release()
            return
        return self._json(404, {"error": "not found"})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8787)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    os.makedirs(OUT_DIR, exist_ok=True)
    srv = ThreadingHTTPServer((args.host, args.port), Handler)
    srv.daemon_threads = True
    log("engine on http://%s:%d  root=%s" % (args.host, args.port, ROOT))
    srv.serve_forever()


if __name__ == "__main__":
    main()
