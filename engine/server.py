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
import re
import sys
import threading
import time
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from curl_cffi import requests as creq

import memory as memlib
import users as userslib

BASE = "https://www.dzmm.ai"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
MIN_PREPAY = 3.2           # 每条预扣，低于此值必被拒

# 实测可用的角色卡（notes/005 §4）；某个号用不了会自动拉黑换下一张。
# 前置的 9 张是 notes/005 实测通过的；DEAD_TAIL 两张在 card.getById 下已返回 json:null
# （2026-11-12 实测，notes/010 §2），对 createByCard 可能仍有效，故只降级不删除。
CARDS = [3821218, 3856830, 3858435, 3859027, 3860041,
         3860611, 3861267, 3865272, 3867710,
         3856159, 3860761]

# ctx = 上游模型上下文（chat.models 实测）。长对话优先选 32K 以上。
MODELS = [
    {"id": "x-apex-surge-0505", "label": "Surge 32K", "ctx": 32000,
     "hint": "默认档，稳定均衡"},
    {"id": "x-apex-pulse-0731-128k", "label": "Pulse 128K", "ctx": 128000,
     "hint": "长对话推荐，0.2 积分/1K"},
    {"id": "x-apex-dash-0826-128k", "label": "Dash 128K", "ctx": 128000,
     "hint": "128K，严格审核，可能拒 NSFW"},
    {"id": "nalang-xl-0826", "label": "XL 32K", "ctx": 32000,
     "hint": "32K，文风偏软"},
    {"id": "nalang-medium-0826", "label": "Medium 32K", "ctx": 32000,
     "hint": "32K，中档"},
    {"id": "nalang-max-0826", "label": "Max 32K", "ctx": 32000,
     "hint": "32K，智力档"},
    {"id": "x-apex-flux-0217-16k", "label": "Flux 16K", "ctx": 16000,
     "hint": "16K，短对话"},
    {"id": "nalang-xl-0826-16k", "label": "XL 16K", "ctx": 16000,
     "hint": "16K，短对话"},
]
# 默认 Turbo(Flux)：上游平台只对它和 nalang-max 下发 suggestedReplies（三建议块）
DEFAULT_MODEL = "x-apex-flux-0217-16k"
# 摘要默认用 Surge（非严格审核档）。旧的 dash 档 strictModeration=true，
# 遇到 NSFW 卡会整段拒答，导致「概览/前情摘要」生成不出来；Surge 与主对话同档。
SUMMARY_MODEL = os.environ.get("MEMORY_SUMMARY_MODEL", "x-apex-surge-0505")
MEMORY_MODEL_SUMMARY = os.environ.get("MEMORY_MODEL_SUMMARY", "1") != "0"

ROOT = os.environ.get("DZMM_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCOUNTS = os.path.join(ROOT, "accounts.json")
OUT_DIR = os.path.join(ROOT, "out")
STATE_PATH = os.path.join(OUT_DIR, "webstate.json")
RESULTS_PATH = os.path.join(OUT_DIR, "web_results.jsonl")
PROXY = os.environ.get("DZMM_PROXY", "http://127.0.0.1:7897")
SITE_TOKEN = os.environ.get("SITE_TOKEN", "")   # 设了就必须带 x-site-token（公网隧道时用）

# —— 本站用户积分（与池子账号分离）：注册送 100，生成前查 ≥3.2，成功后扣 2.1
USERS_PATH = os.path.join(OUT_DIR, "users.json")
USER_PREPAY = 3.2
USER_SETTLE = 2.1

STATE_LOCK = threading.Lock()
RUN_LOCK = threading.Lock()
STOP = threading.Event()

# 会话级串行锁：只锁「同一个号 × 同一张卡」对应的 chatId，避免上游 409「该对话正在生成中」；
# 不同号/不同卡的生成可以并行。全局 RUN_LOCK 只用于 /run 批量任务，不参与站点聊天。
CHAT_LOCKS_GUARD = threading.Lock()
CHAT_LOCKS = {}


def chat_lock_for(name, card_id):
    key = (name, card_id)
    with CHAT_LOCKS_GUARD:
        lock = CHAT_LOCKS.get(key)
        if lock is None:
            lock = threading.Lock()
            CHAT_LOCKS[key] = lock
        return lock
LOG_BUFFER = []

# 上游 418 是出口 IP 级风控：一旦命中就冷却一段时间，期间直接拒绝新请求，
# 避免用户连点重试把 IP 打进更长的封禁。GATE_COOLDOWN 秒后自动放行。
GATE_UNTIL = [0.0]
GATE_COOLDOWN = float(os.environ.get("GATE_COOLDOWN", "120"))


def note_gate():
    GATE_UNTIL[0] = time.time() + GATE_COOLDOWN


def gate_cooldown_left():
    return max(0, int(GATE_UNTIL[0] - time.time()))


# 出口轮换：服务器上跑 mihomo（mixed-port 7890 / external-controller 9090），
# 418 时通过它的 API 换一个节点，再继续换号重试。
MIHOMO_API = os.environ.get("MIHOMO_API", "")
MIHOMO_SECRET = os.environ.get("MIHOMO_SECRET", "")
EGRESS_ROTATE = os.environ.get("EGRESS_ROTATE", "1") != "0"


def rotate_egress():
    """把 mihomo GLOBAL 切到下一个节点；成功返回节点名，不可用返回 None。"""
    if not EGRESS_ROTATE or not MIHOMO_API:
        return None
    h = {}
    if MIHOMO_SECRET:
        h["Authorization"] = "Bearer " + MIHOMO_SECRET
    try:
        r = creq.get(MIHOMO_API + "/proxies/GLOBAL", headers=h, timeout=5)
        j = r.json()
        now = j.get("now")
        cands = [n for n in (j.get("all") or [])
                 if n not in ("DIRECT", "REJECT", "COMPATIBLE", "GLOBAL")]
        if not cands:
            return None
        idx = (cands.index(now) + 1) % len(cands) if now in cands else 0
        nxt = cands[idx]
        creq.put(MIHOMO_API + "/proxies/GLOBAL", headers=h, json={"name": nxt}, timeout=5)
        log("出口切换：%s -> %s" % (now, nxt))
        return nxt
    except Exception as e:
        log("出口切换失败：%s" % str(e)[:120], "warn")
        return None


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


def delete_chat(cookie, chat_id):
    """chat.deleteChat → (ok, err)。真正删除上游会话（连带其完整存档历史）。

    2026-11-15 实测：chat.deleteChat {"chatId": ...} → {"success":true,"message":"会话已经删除"}；
    删除后 createByCard 会返回全新 chatId。这是「删对话即真忘」的关键——
    不删上游会话的话，本地删了消息/记忆，模型仍能从上游存档读到旧剧情。
    """
    url = BASE + "/api/trpc/chat.deleteChat"
    rid = "web-dc-%d" % int(time.time() * 1000)
    try:
        r = creq.post(url, data=json.dumps({"json": {"chatId": str(chat_id)}}).encode(),
                      headers=headers_of(cookie, request_id=rid), impersonate="chrome",
                      proxies=proxies(), timeout=30)
        if r.status_code != 200:
            return False, "HTTP %s" % r.status_code
        j = json.loads(r.text)
        ok = bool(j.get("result", {}).get("data", {}).get("json", {}).get("success"))
        return ok, "" if ok else "no success"
    except Exception as e:
        return False, "%s: %s" % (type(e).__name__, str(e)[:80])


# 仅作硬上限；实际预算由 build_body 按模型 ctx 动态计算。
MAX_HISTORY_MSGS = 200
MAX_HISTORY_CHARS = 120000

TOKEN_MIN = 200
TOKEN_MAX = 8000
TOKEN_DEFAULT = 4000

MEMORY_DIR = os.path.join(OUT_DIR, "memory")


def model_ctx(model_id):
    for m in MODELS:
        if m["id"] == model_id:
            return int(m.get("ctx") or 32000)
    return 32000


def default_tokens_for(ctx):
    ctx = int(ctx or 32000)
    if ctx <= 10000:
        return 2500
    if ctx <= 16000:
        return 4000
    return 6000


def normalize_model(v):
    """前端可能传 label（turbo/medium/xl/max）或旧 id；统一映射到上游真实 model id。"""
    model = v or DEFAULT_MODEL
    id_set = {m["id"] for m in MODELS}
    if model in id_set:
        return model
    low = str(model).lower()
    # 兼容旧前端：原来只有 turbo/medium/xl/max 四个 label
    alias = {
        "turbo": "x-apex-flux-0217-16k",
        "medium": "nalang-medium-0826",
        "xl": "nalang-xl-0826",
        "max": "nalang-max-0826",
        "surge": "x-apex-surge-0505",
        "dash": "x-apex-dash-0826-128k",
    }
    if low in alias:
        return alias[low]
    label_map = {m["label"].lower(): m["id"] for m in MODELS}
    return label_map.get(low, DEFAULT_MODEL)



def _clean_surrogates(t):
    """上游 SSE 会把 emoji 代理对拆到两个 token，拼接后留下孤立 surrogate，
    直接 json.dumps + encode("utf-8") 会抛 UnicodeEncodeError。这里修掉。"""
    if not isinstance(t, str) or not t:
        return t or ""
    # 成对的 high+low 合并为真字符，孤立的直接丢
    out = []
    i, n = 0, len(t)
    while i < n:
        c = t[i]
        o = ord(c)
        if 0xD800 <= o <= 0xDBFF:
            if i + 1 < n and 0xDC00 <= ord(t[i + 1]) <= 0xDFFF:
                out.append(chr(0x10000 + ((o - 0xD800) << 10) + (ord(t[i + 1]) - 0xDC00)))
                i += 2
                continue
            i += 1
            continue
        if 0xDC00 <= o <= 0xDFFF:
            i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


def clamp_tokens(v, ctx=None):
    """按模型上下文钳制输出预留：ctx 越小，越要少预留，多留历史。"""
    try:
        n = int(v)
    except (TypeError, ValueError):
        n = default_tokens_for(ctx)
    hi = TOKEN_MAX
    if ctx:
        hi = min(hi, max(2000, int(ctx) // 4))
    return max(TOKEN_MIN, min(hi, n))


HEAD_ANCHOR_MSGS = 6          # 开场 user+assistant 两对：人设与开场白，永远不丢
HEAD_ANCHOR_CHARS = 14000      # 锚点自身的字数上限


def normalize_history(history):
    """legacy：build_body 已改用 memlib.compose_prompts（含记忆块）。

    保留此函数供回滚与对照，不再参与主链路。
    把多轮历史裁成 prompts[]。策略：**保头 + 保尾**。

    只从尾部回撤会在长对话里把开场整段丢掉，
    上游拿不到人设就会重新开场——这就是「上下文满了人物对话全重置」的根因。
    """
    out = []
    for m in (history or []):
        if not isinstance(m, dict):
            continue
        role, content = m.get("role"), (m.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            out.append({"role": role, "content": content[:6000]})

    if len(out) <= MAX_HISTORY_MSGS:
        trimmed = out
    else:
        trimmed = out[-MAX_HISTORY_MSGS:]

    # —— 头部锚点：只从**未裁剪的原始序列**取，保证开场不丢
    head = []
    if len(out) > HEAD_ANCHOR_MSGS:
        hc = 0
        for m in out[:HEAD_ANCHOR_MSGS]:
            if hc + len(m["content"]) > HEAD_ANCHOR_CHARS and head:
                break
            head.append(m)
            hc += len(m["content"])
        while head and head[0]["role"] != "user":
            head.pop(0)
        while head and head[-1]["role"] != "assistant":
            head.pop()
    else:
        head = []

    head_ids = {id(m) for m in head}
    body_pool = [m for m in trimmed if id(m) not in head_ids]

    # —— 尾部：在剩余预算内从后往前回填
    head_chars = sum(len(m["content"]) for m in head)
    budget = max(MAX_HISTORY_CHARS - head_chars, 6000)
    total, keep = 0, []
    for m in reversed(body_pool):
        if total + len(m["content"]) > budget and keep:
            break
        keep.append(m)
        total += len(m["content"])
    keep.reverse()

    # 接缝修正：尾部剪出来的第一条若是孤立 assistant，
    # 削掉它，否则上游会看到一条无因果的回答。
    while keep and keep[0]["role"] != "user":
        keep.pop(0)
    # 同理：尾部若以 user 结尾而接不上 assistant，丢掉
    while keep and keep[-1]["role"] != "assistant":
        keep.pop()

    merged = head + keep
    # 历史必须以 user 开头
    while merged and merged[0]["role"] != "user":
        merged.pop(0)
    # 只有当已有 assistant 回复时才要求以 assistant 结尾；
    # 否则单条 user（刚开场）会被整条清空，丢失唯一的上下文。
    if any(m["role"] == "assistant" for m in merged):
        while merged and merged[-1]["role"] != "assistant":
            merged.pop()
    return merged


def build_body(chat_id, card_id, model, max_tokens, prompt, history=None, memory=None,
               want_sug=None):
    """head（卡片开场）→ 记忆块（锚点+摘要）→ 预算内 tail → 当前 user。

    裁剪与注入统一在这里做，前端不再自己 head/tail。
    """
    ctx = model_ctx(model)
    prompts, meta = memlib.compose_prompts(
        history, memory, max_context=ctx, max_tokens=max_tokens)
    for m in prompts:
        m["content"] = _clean_surrogates(m["content"])
    # 上游只认 content，记忆必须并进当前消息，否则不进模型视野。
    content = _clean_surrogates(memlib.content_prefix(memory) + prompt)
    # 上游账号资料里的显示名是注册时自动生成的（形如「用户d57640」），
    # 模型会把它当称呼写进正文。明确禁止，统一用「你」/角色习惯称呼。
    content += USER_NAME_RULE
    if want_sug is None:
        want_sug = SUG_INSTR
    if want_sug:
        content += SUG_FORMAT_HINT
    prompts.append({"role": "user", "content": content})
    # 调试：把本次真正发给模型的 content 落盘，便于核对记忆是否注入了
    try:
        os.makedirs(OUT_DIR, exist_ok=True)
        with io.open(os.path.join(OUT_DIR, "last_content.txt"), "w",
                     encoding="utf-8", newline="\n") as _f:
            _f.write(content)
    except Exception:
        pass
    log("prompt 组装：ctx=%d out=%d head=%d mem=%d tail=%d tailChars=%d"
        % (ctx, max_tokens, meta["head"], meta["memory"], meta["tail"], meta["tailChars"]))
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
        "content": content,
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


def generate(cookie, chat_id, card_id, model, max_tokens, prompt, emit, history=None,
             memory=None, want_sug=True, stop_event=None):
    """流式生成。返回 {status: ok|exhausted|card_error|auth_error|error, ...}"""
    stop = stop_event if stop_event is not None else STOP
    url = BASE + "/api/chat"
    rid = "web-%d-%s" % (int(time.time() * 1000), os.urandom(3).hex())
    h = headers_of(cookie, referer=BASE + "/chat?c=" + chat_id, request_id=rid)
    body = json.dumps(build_body(chat_id, card_id, model, max_tokens, prompt, history,
                                 memory, want_sug=want_sug),
                      ensure_ascii=False).encode("utf-8", "replace")

    text_parts = []
    suggest = []
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
            if stop.is_set():
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
                # 不做 per-piece 清洗：emoji 的代理对可能被拆在两个 token 里，
                # 单片 replace 会把合法对也打成 "?"。lone surrogate 由 _emit 用 ensure_ascii 转义兜底。
                text_parts.append(piece)
                emit("delta", {"text": _sanitize_user_names(piece)})
            if t in ("complete", "done", "finish") or obj.get("finishReason"):
                if t == "complete":
                    d = obj.get("data") or {}
                    sr = d.get("suggestedReplies") or {}
                    items = sr.get("items") if isinstance(sr, dict) else None
                    if isinstance(items, list):
                        suggest = [str(x).strip() for x in items if str(x).strip()][:3]
                done = True
                break
    except Exception as e:
        log("stream error: %s" % str(e)[:120], "warn")

    text = _append_sug("".join(text_parts), suggest)
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
            # 只在本轮跳过；不能把本轮门槛写进持久状态（否则一次高 minCredit 会把整池标死）
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
        if err and err.startswith("HTTP 401"):
            log("%s 账号失效（%s）" % (name, err), "warn")
            break
        # 闸门/连接层失败与卡片无关：一次出口抖动就把 11 张卡永久拉黑，
        # 等于整号废掉。这类错误立即停，不写 dead_cards（同源重试也一样失败）。
        if is_gate(err) or is_network(err):
            log("%s 建会话遇瞬时错误（%s），不拉黑卡片" % (name, err), "warn")
            break
        # 明确的卡片级错误（404 卡不存在 / 403 该号不可用）：拉黑换下一张
        dead.add(card)
        a["dead_cards"] = sorted(dead)
        save_state(st)
        log("%s 卡片 %s 不可用（%s），换下一张" % (name, card, err), "warn")
    return None, None


def drop_site_chat(st, name, card_id):
    st.setdefault("site_chats", {}).pop("site:%s:%s" % (name, card_id), None)
    save_state(st)


def drop_chat(st, name):
    a = account_state(st, name)
    if a.get("card_id"):
        a["dead_cards"] = sorted(set(a.get("dead_cards") or []) | {a["card_id"]})
    a["chat_id"] = None
    a["card_id"] = None
    save_state(st)


def drop_site_chats_for_card(card_id):
    """删除某张卡在所有账号上的上游会话，并清掉本地缓存。

    上游 chatId 在 dzmm 服务端保存完整对话历史；只要会话还在，即使本地把
    消息/记忆都删了，模型照样能从上游存档读到旧剧情（2026-11-15 实测）。
    所以这里先调 chat.deleteChat 真正删掉上游会话，再清缓存，下次 createByCard
    会新开一个干净会话（存档为空），模型才真正忘记。
    """
    st = load_state()
    pool = load_pool()
    sc = st.setdefault("site_chats", {})
    suffix = ":%s" % int(card_id)
    keys = [k for k in list(sc.keys()) if k.endswith(suffix)]
    for k in keys:
        ent = sc.get(k) or {}
        acct = ent.get("account")
        cid = ent.get("chatId")
        if acct in pool and cid:
            ok, err = delete_chat(pool[acct]["cookie"], cid)
            log("删除上游会话 %s（%s/%s）-> %s %s" % (
                str(cid)[:8], acct, card_id, ok, err))
        sc.pop(k, None)
    if keys:
        save_state(st)
    return keys


# ---------------------------------------------------------------- 前台站点接入

def is_gate(err):
    """418 / captcha = IP 级风控闸门，跟账号额度无关，不能拿来判账号死活。"""
    e = (err or "").lower()
    return "418" in e or "captcha" in e


def is_network(err):
    """上游连接层失败（节点坏 / TLS 被掐 / 超时）：跟账号无关，绝不能判账号死亡。

    2026-11-15 实测：mihomo 出口节点 HK-N-5 挂掉时，createByCard 抛
    `SSLError ... Connection closed abruptly`，旧逻辑把它当账号问题 → 把池子里
    仅有的两个可用号（b054/b055）一起标成 exhausted，usable 从 2 变 0。
    """
    e = (err or "").lower()
    keys = ("sslerror", "ssl routines", "ssl_connect", "unexpected eof",
            "connection closed", "connection reset", "connection refused",
            "connection aborted", "recv failure", "boringssl",
            "timed out", "timeout", "curl:", "(35)", "(56)", "(7)",
            "temporary failure", "name or service not known", "getaddrinfo",
            "eof occurred")
    return any(k in e for k in keys)


def ensure_chat_for_card(st, pool, name, card_id, emit):
    """为「某个号 × 某张卡」拿到一个 chatId；createByCard 按卡去重，所以缓存即可。
    返回 (chatId, err)：err 非空时上层要区分「闸门」还是「账号问题」。"""
    key = "site:%s:%s" % (name, card_id)
    chats = st.setdefault("site_chats", {})
    ent = chats.get(key)
    if ent and ent.get("chatId"):
        return ent["chatId"], None
    cid, err = create_chat(pool[name]["cookie"], card_id)
    if not cid:
        log("site: %s 无法为卡 %s 建会话（%s）" % (name, card_id, err), "warn")
        return None, err
    chats[key] = {"chatId": cid, "cardId": card_id, "account": name, "at": int(time.time())}
    save_state(st)
    emit("chat", {"account": name, "chatId": cid, "cardId": card_id})
    return cid, None


# ---------------------------------------------------------------- 分段续写
# 上游 /api/chat 对 maxTokens 不敏感（实测 200→16000 输出恒为 4800~5600 字），
# 想让正文更长只能「接着写」：把已生成正文作为 assistant 历史回灌，追加一条续写指令。
CONTINUE_PROMPT = (
    "继续。从上一段的最后一个字直接往下写，不要重复已有内容，不要复述、不要总结、"
    "不要重新开头，保持同样的视角、人称与语气。"
)

SUG_BLOCK_RE = re.compile(r"<sug>[\s\S]*?</sug>", re.I)
SUG_STRAY_RE = re.compile(r"</?sug>", re.I)


def _strip_sug(text):
    """续写回灌前必须剥掉 <sug> 块。

    上游模型看到 assistant 历史里有 <sug>...</sug>，会当成格式样板照抄，
    于是每一轮都再产一个 sug 块；累积正文里就出现多个 sug，
    前端删块后仍会露裸标签，正文也显得重复。首轮输出保持原样给前端解析。
    """
    t = SUG_BLOCK_RE.sub("", text or "")
    return SUG_STRAY_RE.sub("", t).strip()


# 建议回复（每轮末尾的三条快捷句）：
# 上游平台按模型决定是否 armed（实测 Flux/Turbo 会吐 <sug> 与 suggestedReplies，
# Surge/Pulse 不吐）。客户端在 content 末尾追加格式要求，保证各模型都有；
# 再把 complete 事件里的 suggestedReplies 兜底补成 <sug> 块（正文已有则跳过）。
SUG_INSTR = os.environ.get("SUG_INSTR", "1") != "0"
SUG_FORMAT_HINT = (
    "\n\n【格式要求】正文结束后另起一行输出 <sug>建议一|建议二|建议三</sug>："
    "三条建议用竖线分隔，不加引号、不加其它标签。"
)

# 上游账号显示名是注册时自动生成的「用户xxxxx」（如用户d57640），模型会把它当称呼。
USER_NAME_RULE = (
    "\n\n【称呼】对方在账号资料里的显示名（形如「用户xxxxx」）只是自动生成的账号名，"
    "不是称呼，正文里严禁出现；一律用「你」或角色自己的习惯称呼（爸爸/主人/哥哥等）指代对方。"
)
USER_NAME_RE = re.compile(r"用户[A-Za-z0-9_-]{4,}")


def _sanitize_user_names(text):
    """把模型误写进正文的账号显示名（用户xxxxx）替换成「你」。"""
    return USER_NAME_RE.sub("你", text or "")


def _append_sug(text, items):
    """把 suggestedReplies.items 补成 <sug>a|b|c</sug>；正文已有 sug 块则不动。"""
    t = (text or "").rstrip()
    if not items:
        return t
    if SUG_BLOCK_RE.search(t):
        return t
    return t + "\n\n<sug>" + "|".join(items[:3]) + "</sug>"


SUG_MODEL = os.environ.get("SUG_MODEL", "x-apex-flux-0217-16k")
SUG_MODEL_BACKUP = os.environ.get("SUG_MODEL_BACKUP", "nalang-max-0826")


def suggest_followup(pool, st, name, text, stop_event=None):
    """主回复没吐 <sug> 时，用同一账号的通用会话补三条接话建议。

    必须用「平台会 armed 建议块」的模型（实测 Flux / Max 会下发 suggestedReplies，
    Surge / Pulse / Dash 不会）—— 靠模型自觉遵守格式提示只有约 50% 命中率。
    输出很短，按 token 结算的实际扣费远低于一次正常生成。
    """
    cid, card = ensure_chat(st, pool, name, lambda *a, **k: None)
    if not cid:
        return []
    tail = _tail_prompt(_strip_sug(text), 800)
    prompt = (
        "下面是角色对话的最后一段。请给出三条简短的接话建议（每条不超过 20 字）。\n\n"
        + tail
    )
    for m in (SUG_MODEL, SUG_MODEL_BACKUP):
        res = generate(pool[name]["cookie"], cid, card, m, 400, prompt,
                       lambda *a, **k: None, want_sug=False, stop_event=stop_event)
        body = res.get("text") or ""
        hit = SUG_BLOCK_RE.search(body)
        if not hit:
            continue
        inner = hit.group(0)[len("<sug>"):-len("</sug>")]
        items = [x.strip() for x in inner.split('|')]
        items = [x for x in items if x][:3]
        if items:
            log("建议兜底 %s：%d 条" % (m, len(items)))
            return items
    return []


def _tail_prompt(text, limit=1200):
    """给续写轮次一点上下文锚点，避免跑题。"""
    t = (text or "").strip()
    return t[-limit:] if len(t) > limit else t


def generate_long(cookie, chat_id, card_id, model, max_tokens, prompt, emit,
                  history=None, rounds=3, memory=None, stop_event=None):
    """
    多轮续写：首轮用原始 prompt，之后每轮把「累积正文」当 assistant 历史回灌。
    任一环节失败就带着已有正文返回 ok，不丢内容。
    """
    text = ""
    hist = list(history or [])
    stop = stop_event if stop_event is not None else STOP
    for i in range(max(1, int(rounds))):
        if stop.is_set():
            break
        if i == 0:
            this_prompt = prompt
            this_hist = hist
        else:
            this_prompt = CONTINUE_PROMPT
            this_hist = hist + [
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": _clean_surrogates(_tail_prompt(_strip_sug(text), 6000))},
            ]
        emit("round", {"index": i + 1, "rounds": rounds, "chars": len(text)})
        try:
            res = generate(cookie, chat_id, card_id, model, max_tokens, this_prompt, emit,
                           history=this_hist, memory=memory, stop_event=stop_event)
        except Exception as e:
            log("round %d failed: %s" % (i + 1, repr(e)[:200]), "warn")
            if text:
                return {"status": "ok", "text": text, "done": True, "partial": True}
            return {"status": "error", "error": repr(e)[:200]}
        if res.get("status") == "ok":
            piece = _sanitize_user_names((res.get("text") or "").strip())
            if piece:
                if i > 0:
                    text = (text.rstrip() + "\n\n" + piece).strip()
                    emit("delta", {"text": "\n\n" + _sanitize_user_names(piece)})
                else:
                    text = piece
            continue
        # 余额/会话问题：直接返回已有结果，让上层决定是否换号
        if text:
            return {"status": "ok", "text": text, "done": True,
                    "partial": True, "stopped_by": res.get("status")}
        return res
    return {"status": "ok", "text": text, "done": True, "rounds": rounds}


def chat_id_ok(pool, name, chat_id):
    """验证 chatId 属于该号且存在。失败就让下面重新建会话。"""
    try:
        cookie = pool[name]["cookie"]
        url = "%s/api/trpc/chat.getMessages?batch=1&input=%s" % (
            BASE, quote(json.dumps({"0": {"json": {"chatId": chat_id}}})))
        r = creq.get(url, headers=headers_of(cookie), impersonate="chrome",
                     proxies=proxies(), timeout=30)
        return r.status_code == 200
    except Exception:
        return False


def start_summary(pool, name, card_id, mem, history, stop_event=None):
    """把摘要放到后台线程：不占 SSE 连接、不阻塞下一条消息。"""
    def run():
        try:
            st2 = load_state()
            maybe_summarize(pool, name, st2, card_id, mem, history, stop_event=stop_event)
        except Exception as e:
            log("后台摘要失败：%s" % str(e)[:160], "warn")

    t = threading.Thread(target=run, name="memory-summary", daemon=True)
    t.start()


def maybe_summarize(pool, name, st, card_id, mem, history, stop_event=None):
    """压缩旧消息；失败降级为规则摘要，绝不阻塞主流程。"""
    msgs = memlib.sanitize_history(history)
    if not memlib.should_summarize(len(msgs), mem):
        return mem
    window, end = memlib.summary_window(msgs, mem)
    if not window:
        return mem

    pins = [p.get("text", "") for p in (mem.get("pinned") or []) if p.get("text")]
    recent = msgs[end:end + 2]
    existing = mem.get("summary") or ""
    chunks = memlib.chunk_messages(window, 6000)
    if len(chunks) > 4:
        # 段数过多时，前几段用规则摘要压一次，模型只处理最后 4 段，控制成本
        head_msgs = [m for ch in chunks[:-4] for m in ch]
        existing = memlib.rule_summary(head_msgs, existing, pins)
        chunks = chunks[-4:]

    text = ""
    if MEMORY_MODEL_SUMMARY and name in pool and chunks:
        try:
            batch_cid, batch_card = ensure_chat(st, pool, name, lambda *a, **k: None)
            if batch_cid:
                running = existing
                ok_all = True
                for i, ch in enumerate(chunks):
                    prompt = memlib.model_summary_prompt(
                        ch, running, pins,
                        recent=recent if i == len(chunks) - 1 else None)
                    res = generate(pool[name]["cookie"], batch_cid, batch_card,
                                   SUMMARY_MODEL, 800, prompt, lambda *a, **k: None,
                                   want_sug=False, stop_event=stop_event)
                    if res.get("status") != "ok":
                        ok_all = False
                        break
                    piece = memlib.clean_summary(res.get("text"))
                    if not piece or memlib.looks_like_refusal(piece):
                        ok_all = False
                        break
                    running = piece
                if ok_all:
                    text = running
        except Exception as e:
            log("摘要生成失败，降级规则摘要：%s" % str(e)[:160], "warn")

    if not text:
        text = memlib.rule_summary(window, mem.get("summary"), pins)
        log("摘要降级为规则摘要（%d 条）" % len(window), "warn")

    if text:
        # 重新读一次，避免覆盖这期间新写入的锚点
        latest = memlib.load_memory(MEMORY_DIR, card_id)
        latest["summary"] = text
        latest["summarizedUpTo"] = max(int(latest.get("summarizedUpTo") or 0), end)
        memlib.save_memory(MEMORY_DIR, latest)
        mem.update(latest)
    return mem


def run_site_chat(payload, emit, stop_event=None):
    """前台聊天：指定 cardId，自动挑号 → 建会话 → 流式生成 → 结算。"""
    pool = load_pool()
    st = load_state()
    rotated = False   # 本轮是否已经换过出口（最多换一次，避免抖动）
    try:
        card_id = int(payload.get("cardId"))
    except Exception:
        emit("end", {"reason": "bad_request", "message": "cardId 缺失"})
        return
    prompt = (payload.get("prompt") or "").strip()
    if not prompt:
        emit("end", {"reason": "bad_request", "message": "内容为空"})
        return
    model = normalize_model(payload.get("model"))
    ctx = model_ctx(model)
    max_tokens = clamp_tokens(payload.get("maxTokens"), ctx)

    # 上游 418 冷却期内直接拒绝，不再打上游（避免用户连点把封禁拉长）
    left = gate_cooldown_left()
    if left > 0:
        emit("end", {"reason": "gate",
                     "message": "上游风控冷却中（约 %d 秒后再试）。这是出口 IP 级限制，额度和账号都还在。" % left})
        return

    # —— 本站用户（可选）：cookie 里的 token 由 Next 透传；无效/过期按游客处理
    user_token = (payload.get("userToken") or "").strip()
    user = userslib.session_user(USERS_PATH, user_token) if user_token else None
    site_uid = user["id"] if user else None

    history = payload.get("history")
    # —— 长期记忆：磁盘为底，合并「历史 + 本轮新消息」里出现的设定
    mem = memlib.load_memory(MEMORY_DIR, card_id)
    before_ids = [p.get("id") for p in (mem.get("pinned") or [])]
    pin_source = list(history or []) + [{"role": "user", "content": prompt}]
    fresh = memlib.apply_suppression(memlib.extract_pins(pin_source), mem.get("suppressed"))
    merged = memlib.merge_pins(mem.get("pinned"), fresh)
    if [p["id"] for p in merged] != before_ids:
        mem["pinned"] = merged
        memlib.save_memory(MEMORY_DIR, mem)
        log("记忆锚点 +%d（共 %d 条）" % (len(merged) - len(before_ids), len(merged)))
    emit("memory", {"pinned": mem.get("pinned") or [],
                    "summary": mem.get("summary") or "",
                    "summarizedUpTo": mem.get("summarizedUpTo") or 0})

    cands = []
    for name in pool:
        a = account_state(st, name)
        if a.get("exhausted") or a.get("disabled"):
            continue
        if (a.get("credit") or 0) < MIN_PREPAY:
            continue
        cands.append(((a.get("credit") or 0), name))
    # —— 指定会话：前端从上游导出了真实历史，要接着写而不是新开。
    want_chat = (payload.get("chatId") or "").strip() or None
    want_acct = (payload.get("account") or "").strip() or None
    if want_chat and want_acct and want_acct in pool:
        a = account_state(st, want_acct)
        if not a.get("exhausted") and not a.get("disabled") \
                and (a.get("credit") or 0) >= MIN_PREPAY:
            # 优先用原会话所属的号，保证 chatId 与 owner 一致
            cands = [((a.get("credit") or 0), want_acct)] + \
                    [c for c in cands if c[1] != want_acct]
        else:
            emit("note", {"message": "原会话的号已不可用，改用其他号并新建会话"})
            want_chat = None
    elif want_chat:
        want_chat = None

    cands.sort(key=lambda c: (c[1] != want_acct, c[0]))
    if not cands:
        emit("end", {"reason": "no_credit", "message": "池子里没有可用额度"})
        return

    # 用户账本预检查：余额不够就不发起生成，避免白跑上游
    if site_uid and float(user.get("credit") or 0) + 1e-9 < USER_PREPAY:
        emit("end", {"reason": "user_credit",
                     "message": "积分不足（当前 %.2f，至少需要 %.1f），请先充值。" %
                                (float(user.get("credit") or 0), USER_PREPAY)})
        return

    gate_hits = 0
    busy_hits = 0
    for credit, name in cands:
        a = account_state(st, name)
        emit("account", {"name": name, "credit": a.get("credit")})
        if want_chat and name == want_acct and chat_id_ok(pool, name, want_chat):
            cid, chat_err = want_chat, None
            st.setdefault("site_chats", {})["site:%s:%s" % (name, card_id)] = {
                "chatId": want_chat, "account": name}
            save_state(st)
            emit("note", {"message": "接上原会话 %s" % want_chat[:8]})
        else:
            cid, chat_err = ensure_chat_for_card(st, pool, name, card_id, emit)
        if not cid:
            if is_gate(chat_err):
                # 闸门是 IP 级：先换出口节点再重试一次；换不了才进冷却。
                gate_hits += 1
                emit("switch", {"from": name, "reason": "gate", "detail": chat_err})
                if not rotated:
                    rotated = True
                    if rotate_egress():
                        continue
                note_gate()
                emit("end", {"reason": "gate",
                             "message": "上游风控（HTTP 418），出口 IP 被临时限制。冷却约 %d 秒后自动放行，额度和账号都还在。"
                                        % int(GATE_COOLDOWN)})
                return
            if is_network(chat_err):
                # 连接层失败（节点坏/TLS 断）：换出口重试一次，绝不把账号标成耗尽
                emit("switch", {"from": name, "reason": "network", "detail": chat_err})
                if not rotated:
                    rotated = True
                    if rotate_egress():
                        continue
                emit("end", {"reason": "network",
                             "message": "上游连接失败（出口节点异常），请稍后再试。账号额度未受影响。"})
                return
            # 真正的账号/卡片问题才标记
            a["exhausted"] = True
            save_state(st)
            emit("switch", {"from": name, "reason": "card_blocked", "detail": chat_err})
            continue

        try:
            rounds = int(payload.get("rounds") or 0)
        except (TypeError, ValueError):
            rounds = 0
        # 会话级锁：同一 chatId（号×卡）并发生成会被上游 409「该对话正在生成中」。
        # 抢不到就换下一个号：既不上游 409，也不排队干等。
        lock = chat_lock_for(name, card_id)
        if not lock.acquire(blocking=False):
            busy_hits += 1
            emit("switch", {"from": name, "reason": "busy", "detail": "该账号正在生成中"})
            continue
        try:
            if rounds <= 1:
                res = generate(pool[name]["cookie"], cid, card_id, model, max_tokens, prompt,
                               emit, history=history, memory=mem, stop_event=stop_event)
            else:
                res = generate_long(pool[name]["cookie"], cid, card_id, model, max_tokens,
                                    prompt, emit, history=history, memory=mem,
                                    rounds=min(rounds, 8), stop_event=stop_event)
        finally:
            lock.release()
        if res.get("status") == "exhausted" and res.get("reason") == "internal":
            # classification=internal 不扣费；createByCard 幂等去重拿回同一 chatId，直接换号
            emit("switch", {"from": name, "reason": "internal", "detail": "upstream internal"})
            continue
        if res["status"] == "ok":
            # 建议兜底放在结算前：这次短生成的扣费也能体现在 credit 里
            final_text = _sanitize_user_names(res["text"])
            if SUG_INSTR and not SUG_BLOCK_RE.search(final_text):
                try:
                    sug_items = suggest_followup(pool, st, name, final_text, stop_event=stop_event)
                    if sug_items:
                        final_text = _append_sug(final_text, sug_items)
                except Exception as e:
                    log("建议补全失败：%s" % str(e)[:120], "warn")
            ok, credit2, acc_uid, err = get_me(pool[name]["cookie"])
            if ok:
                a["credit"] = round(credit2, 2)
                a["exhausted"] = credit2 < MIN_PREPAY
                save_state(st)
            # —— 本站用户：生成成功才扣费（失败/换号不扣）
            user_credit = None
            if site_uid:
                try:
                    u2 = userslib.charge(USERS_PATH, site_uid, USER_SETTLE,
                                         "生成扣费 · card %s" % card_id)
                    user_credit = u2["credit"] if u2 else None
                except Exception as e:
                    log("用户扣费失败：%s" % str(e)[:120], "warn")
            emit("complete", {"text": final_text, "account": name, "chatId": cid,
                              "cardId": card_id, "credit": a.get("credit"),
                              "userCredit": user_credit})
            # 用户已经拿到正文；摘要丢到后台，失败也不影响这次回复
            try:
                if memlib.should_summarize(len(memlib.sanitize_history(history)), mem):
                    start_summary(pool, name, card_id, mem, history, stop_event=stop_event)
            except Exception as e:
                log("记忆更新失败：%s" % str(e)[:160], "warn")
            return
        if res["status"] == "exhausted":
            if res.get("reason") == "internal":
                emit("switch", {"from": name, "reason": "internal", "detail": "upstream internal"})
                continue
            a["exhausted"] = True
            save_state(st)
            emit("switch", {"from": name, "reason": "credit", "detail": res.get("reason"), "text": (res.get("text") or "")[:120]})
            continue
        if is_gate(res.get("error")):
            gate_hits += 1
            emit("switch", {"from": name, "reason": "gate", "detail": res.get("error")})
            if not rotated:
                rotated = True
                if rotate_egress():
                    continue
            note_gate()
            emit("end", {"reason": "gate",
                         "message": "上游风控（HTTP 418），出口 IP 被临时限制。冷却约 %d 秒后自动放行，额度和账号都还在。"
                                    % int(GATE_COOLDOWN)})
            return
        if is_network(res.get("error")):
            # 生成阶段的连接层失败：换出口重试一次，不换号、不扣费
            emit("switch", {"from": name, "reason": "network", "detail": res.get("error")})
            if not rotated:
                rotated = True
                if rotate_egress():
                    continue
            emit("end", {"reason": "network",
                         "message": "上游连接失败（出口节点异常），请稍后再试。账号额度未受影响。"})
            return
        emit("switch", {"from": name, "reason": res["status"], "detail": res.get("error")})

    if busy_hits >= len(cands):
        emit("end", {"reason": "busy", "message": "当前可用账号都在生成中，请稍等几秒再试"})
    else:
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

    model = normalize_model(payload.get("model"))
    max_tokens = clamp_tokens(payload.get("maxTokens"), model_ctx(model))
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
            # 持久化只按硬阈值判定；本轮 minCredit 由 pick_account 过滤，不能写死成 exhausted
            a["exhausted"] = credit < MIN_PREPAY
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
        res = generate(pool[name]["cookie"], chat_id, card_id, model, max_tokens, prompt, emit,
                       want_sug=False)

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
            if credit < MIN_PREPAY:
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
    # TCP_NODELAY：SSE 每包都很小，关掉 Nagle 免得几十毫秒的粘包/延迟 ACK 造成「一顿一顿」
    disable_nagle_algorithm = True

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
        # 立刻发一个注释心跳并 flush，强制响应头/首包马上出网（降低 TTFT 的协议层等待）
        try:
            self.wfile.write(b": ping\n\n")
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass

    def _emit(self, event, data):
        s = json.dumps(data, ensure_ascii=False)
        try:
            body = s.encode("utf-8")
        except UnicodeEncodeError:
            # 上游 token 可能含 lone surrogate（emoji 拆半），回退全转义
            body = json.dumps(data, ensure_ascii=True).encode("utf-8")
        chunk = ("event: %s\ndata: %s\n\n" % (event, body.decode("utf-8"))).encode("utf-8", "replace")
        try:
            self.wfile.write(chunk)
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            # 浏览器断开 → 立即停掉当前请求，避免继续烧 credit。
            # 站点聊天用各自的 stop_event，批量任务用全局 STOP，互不干扰。
            (getattr(self, "_stop", None) or STOP).set()

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
        if path == "/site/memory":
            qs = parse_qs(urlparse(self.path).query)
            try:
                card_id = int((qs.get("cardId") or ["0"])[0])
            except (TypeError, ValueError):
                card_id = 0
            if not card_id:
                return self._json(400, {"error": "cardId required"})
            mem = memlib.load_memory(MEMORY_DIR, card_id)
            return self._json(200, {"memory": mem})
        if path == "/site/user/me":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            qs = parse_qs(urlparse(self.path).query)
            token = (qs.get("token") or [""])[0]
            user = userslib.session_user(USERS_PATH, token)
            if not user:
                return self._json(401, {"error": "unauthorized"})
            return self._json(200, {"user": user})
        if path == "/site/credits/ledger":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            qs = parse_qs(urlparse(self.path).query)
            token = (qs.get("token") or [""])[0]
            try:
                limit = int((qs.get("limit") or ["50"])[0])
            except (TypeError, ValueError):
                limit = 50
            user, rows = userslib.ledger(USERS_PATH, token, limit)
            if not user:
                return self._json(401, {"error": "unauthorized"})
            return self._json(200, {"user": user, "entries": rows})
        if path == "/site/credits/checkin":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            qs = parse_qs(urlparse(self.path).query)
            token = (qs.get("token") or [""])[0]
            user, state = userslib.checkin_status(USERS_PATH, token)
            if not user:
                return self._json(401, {"error": "unauthorized"})
            return self._json(200, {"user": user, "checkin": state})
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
            self._stop = STOP
            try:
                self._sse_start()
                try:
                    run_job(payload, self._emit)
                except Exception as e:
                    log("job crashed: %s" % traceback.format_exc()[-1800:], "error")
                    try:
                        self._emit("end", {"reason": "crash", "message": str(e)[:200]})
                    except Exception:
                        pass
            finally:
                RUN_LOCK.release()
            return
        if path == "/site/memory":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            try:
                card_id = int(payload.get("cardId"))
            except (TypeError, ValueError):
                return self._json(400, {"error": "cardId required"})
            mem = memlib.load_memory(MEMORY_DIR, card_id)
            if payload.get("clear"):
                # 清空时把现有锚点记入 suppressed：否则下一轮 auto 抽取会从
                # 还留在历史里的原句把它们重新捞回来，表现为「删了又出现」。
                removed = memlib.pin_ids(mem.get("pinned"))
                mem = memlib.default_memory(card_id)
                mem["suppressed"] = sorted(set(removed))[:200]
                memlib.save_memory(MEMORY_DIR, mem)
                drop_site_chats_for_card(card_id)
                return self._json(200, {"memory": mem})
            if payload.get("rebuild"):
                # 前端删了某条消息后触发：manual 锚点保留，auto 从当前历史重抽，
                # 摘要清空待下一轮重新生成——让被删剧情的记忆贡献随之消失。
                history = payload.get("history") or []
                manual = [p for p in mem.get("pinned") if p.get("source") == "manual"]
                fresh = memlib.apply_suppression(memlib.extract_pins(history),
                                                 mem.get("suppressed"))
                mem["pinned"] = memlib.merge_pins(manual, fresh)
                mem["summary"] = ""
                mem["summarizedUpTo"] = 0
                memlib.save_memory(MEMORY_DIR, mem)
                # 删光所有消息 = 用户想从零开始：丢弃上游会话，否则模型仍能从
                # 上游 chatId 的存档里读到被删掉的剧情（实测「删了还记得」的根因）。
                if not history:
                    drop_site_chats_for_card(card_id)
                return self._json(200, {"memory": mem})
            if isinstance(payload.get("pinned"), list):
                old_ids = memlib.pin_ids(mem.get("pinned"))
                pins = []
                for p in payload["pinned"]:
                    if isinstance(p, str):
                        pins.append({"text": p, "source": "manual"})
                    elif isinstance(p, dict) and p.get("text"):
                        # 尊重前端传来的 source：auto 是对话抽取的，改成 manual 会让
                        # 删掉对应消息后 rebuild 也删不掉它（历史 bug）。
                        src = "auto" if p.get("source") == "auto" else "manual"
                        pins.append({"text": p["text"], "source": src})
                mem["pinned"] = memlib.merge_pins([], pins)
                # 用户删掉的那几条（old 有、new 没有）加入抑制，防止复活
                memlib.update_suppressed(mem, old_ids - memlib.pin_ids(mem["pinned"]))
            if isinstance(payload.get("summary"), str):
                mem["summary"] = memlib.clean_summary(payload["summary"])
            if payload.get("summarizedUpTo") is not None:
                try:
                    mem["summarizedUpTo"] = int(payload["summarizedUpTo"])
                except (TypeError, ValueError):
                    pass
            memlib.save_memory(MEMORY_DIR, mem)
            return self._json(200, {"memory": mem})
        if path == "/site/user/register":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            user, token, err = userslib.register(
                USERS_PATH, payload.get("email"), payload.get("password"), payload.get("name"))
            if err:
                return self._json(400, {"error": err})
            return self._json(200, {"user": user, "token": token})
        if path == "/site/user/login":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            user, token, err = userslib.login(
                USERS_PATH, payload.get("email"), payload.get("password"))
            if err:
                return self._json(401, {"error": err})
            return self._json(200, {"user": user, "token": token})
        if path == "/site/user/logout":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            userslib.logout(USERS_PATH, payload.get("token"))
            return self._json(200, {"ok": True})
        if path == "/site/credits/recharge":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            user, entry, err = userslib.recharge(
                USERS_PATH, payload.get("token"), payload.get("amount"),
                payload.get("note") or "演示充值")
            if err:
                return self._json(401 if "登录" in err else 400, {"error": err})
            return self._json(200, {"user": user, "entry": entry})
        if path == "/site/credits/checkin":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            user, entry, err, streak = userslib.checkin(
                USERS_PATH, payload.get("token"))
            if err:
                return self._json(401 if "登录" in err else 400, {"error": err})
            return self._json(200, {"user": user, "entry": entry, "streak": streak})
        if path == "/site/chat":
            if SITE_TOKEN and self.headers.get("x-site-token") != SITE_TOKEN:
                return self._json(401, {"error": "bad token"})
            payload = self._body()
            # 站点聊天不再用全局 RUN_LOCK：并发请求各自持独立的会话锁与 stop_event，
            # 避免第二个用户点进来就吃 409「已有任务在跑」。
            self._stop = threading.Event()
            try:
                self._sse_start()
                run_site_chat(payload, self._emit, stop_event=self._stop)
            except Exception as e:
                log("site chat crashed: %s" % traceback.format_exc()[-1800:], "error")
                try:
                    self._emit("end", {"reason": "crash", "message": str(e)[:200]})
                except Exception:
                    pass
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
