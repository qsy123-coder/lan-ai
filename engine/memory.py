"""长期记忆：锚点抽取、摘要降级、预算组装。

纯标准库，不依赖 curl_cffi，可单独单测。

记忆文件结构（out/memory/<cardId>.json）：
{
  "version": 1,
  "cardId": 426322,
  "pinned": [{"id": "...", "text": "...", "source": "auto|manual", "at": 0}],
  "summary": "前情摘要",
  "summarizedUpTo": 42,
  "updatedAt": 0
}
"""
import hashlib
import io
import json
import os
import re
import time

VERSION = 1
MAX_PINS = 20
MAX_PIN_CHARS = 1500
PIN_ITEM_MAX = 200
SUMMARY_MAX = 600
HEAD_MSGS = 6
HEAD_CHARS = 14000
RESERVE_TOKENS = 1200
MAX_MSG_CHARS = 6000

# 用户消息里出现这些词，才可能是「设定」而不是普通剧情。
# 强触发：明确在下达设定，命中即可成为锚点。
STRONG_RE = re.compile(
    r"以后|从今以后|从现在起|接下来|记住|设定|规则|约定|不许|必须|永远|一直|剧情都|每次都"
)
# 弱触发：日常台词里大量出现（「哥哥，我回来了」），必须与指令同句命中才算设定。
WEAK_RE = re.compile(r"称呼|叫我|主人|哥哥|姐姐")
DIRECTIVE_RE = re.compile(
    r"叫我|称呼|必须|不许|记住|规则|约定|私下|只有|外人|别人|面前|时候|以后|每次"
)
QUESTION_END_RE = re.compile(r"[?？]\s*$")
# 保留分隔符：切句后仍能判断这一句是不是问句（「我们约定了什么？」不能被当成设定）
_SENT_SPLIT = re.compile(r"([。！？!?\n]+)")

SUMMARY_SYSTEM = (
    "你是剧情记录员。把下面这段角色扮演对话压缩成 300-500 字的前情摘要，按时间顺序保留：\n"
    "1) 已发生的关键事件与地点；2) 人物关系与称呼的变化；3) 用户明确下达的规则/约定；\n"
    "4) 当前场景与未完成的悬念。不要评价，不要续写，不要遗漏任何称呼规则。"
)


# ---------------------------------------------------------------- 文件

def memory_path(memory_dir, card_id):
    """memory_dir 就是 out/memory 本身，不再二次拼 memory。"""
    return os.path.join(memory_dir, "%s.json" % int(card_id))


def default_memory(card_id):
    return {"version": VERSION, "cardId": int(card_id), "pinned": [],
            "summary": "", "summarizedUpTo": 0, "updatedAt": 0}


def load_memory(out_dir, card_id):
    path = memory_path(out_dir, card_id)
    try:
        with io.open(path, encoding="utf-8-sig") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return default_memory(card_id)
        mem = default_memory(card_id)
        mem.update({
            "pinned": [p for p in (data.get("pinned") or []) if isinstance(p, dict) and p.get("text")],
            "summary": str(data.get("summary") or "")[:SUMMARY_MAX],
            "summarizedUpTo": _as_int(data.get("summarizedUpTo")),
            "updatedAt": _as_int(data.get("updatedAt")),
        })
        return mem
    except Exception:
        return default_memory(card_id)


def save_memory(out_dir, mem):
    path = memory_path(out_dir, mem["cardId"])
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mem["updatedAt"] = int(time.time())
    tmp = path + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(mem, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)
    return mem


# ---------------------------------------------------------------- 锚点

def _norm(text):
    return re.sub(r"[\s\W_]+", "", (text or "").lower(), flags=re.UNICODE)


def pin_id(text):
    return hashlib.sha1(_norm(text).encode("utf-8")).hexdigest()[:16]


def _as_int(v, default=0):
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def extract_pins(history):
    """从用户消息里抽设定，返回 [{"text":..., "source":"auto"}]。"""
    found = []
    for m in history or []:
        if not isinstance(m, dict) or m.get("role") != "user":
            continue
        raw = (m.get("content") or "").strip()
        if not raw:
            continue
        # 整条就是问句 → 不当作设定
        if QUESTION_END_RE.search(raw) and not re.search(
                r"以后|记住|设定|规则|约定|不许|必须", raw):
            continue
        candidates = []
        parts = _SENT_SPLIT.split(raw)
        for idx in range(0, len(parts), 2):
            sent = parts[idx].strip()
            delim = parts[idx + 1] if idx + 1 < len(parts) else ""
            if len(sent) < 4:
                continue
            strong = STRONG_RE.search(sent)
            weak = WEAK_RE.search(sent)
            if not strong and not (weak and DIRECTIVE_RE.search(sent)):
                continue
            if QUESTION_END_RE.search(sent + delim):
                continue
            candidates.append({"text": sent[:PIN_ITEM_MAX],
                               "weight": 2 if strong else 1})
        # 整条兜底只收「没有问号」的短消息，避免把追问当成设定
        if not candidates and STRONG_RE.search(raw) and len(raw) <= PIN_ITEM_MAX \
                and not re.search(r"[?？]", raw):
            candidates.append({"text": raw, "weight": 2})
        for c in candidates:
            found.append({"text": c["text"], "source": "auto",
                          "weight": c["weight"]})
    return found


def merge_pins(existing, incoming):
    """按归一化文本去重；manual 优先保留；超上限先淘汰最旧的 auto。"""
    out, seen = [], set()
    for p in list(existing or []) + list(incoming or []):
        text = (p.get("text") or "").strip()
        if not text:
            continue
        pid = p.get("id") or pin_id(text)
        if pid in seen:
            continue
        seen.add(pid)
        out.append({
            "id": pid,
            "text": text[:PIN_ITEM_MAX],
            "source": "manual" if p.get("source") == "manual" else "auto",
            # 手动与强规则权重 2；弱规则 1。超限时先淘汰弱规则，
            # 否则几百条日常台词会把最早下达的真规则挤出上限。
            "weight": 2 if p.get("source") == "manual" else int(p.get("weight") or 2),
            "at": _as_int(p.get("at")) or int(time.time()),
        })

    def drop_index(items):
        weak = [i for i, x in enumerate(items)
                if x["source"] == "auto" and int(x.get("weight") or 2) < 2]
        if weak:
            return weak[0]
        auto = [i for i, x in enumerate(items) if x["source"] == "auto"]
        return auto[0] if auto else 0

    def trim(items):
        while items and len(items) > MAX_PINS:
            items.pop(drop_index(items))
        while items and sum(len(x["text"]) for x in items) > MAX_PIN_CHARS:
            items.pop(drop_index(items))
        return items

    return trim(out)


# ---------------------------------------------------------------- 摘要

def should_summarize(total_msgs, mem, min_new=16, keep_recent=12):
    """消息总数比上次摘要多出 min_new 条，且确有可压缩区间。"""
    up = int(mem.get("summarizedUpTo") or 0)
    return total_msgs - up >= min_new and total_msgs - keep_recent > up


def summary_window(messages, mem, keep_recent=12):
    up = int(mem.get("summarizedUpTo") or 0)
    end = max(up, len(messages) - keep_recent)
    return messages[up:end], end


def rule_summary(messages, existing="", pins=None):
    """零成本降级摘要：旧摘要 + 被裁消息首句 + 锚点。"""
    chunks = []
    if existing:
        chunks.append(existing.strip()[:250])
    # 规则优先：即使后面被截断，称呼/设定也必须留下
    if pins:
        chunks.append("称呼/规则：" + "；".join(p[:40] for p in pins[:5]))
    for m in (messages or [])[-16:]:
        c = re.sub(r"\s+", " ", (m.get("content") or "")).strip()
        if not c:
            continue
        if m.get("role") == "user":
            s = c[:80]
            chunks.append("他：" + s)
        else:
            s = _SENT_SPLIT.split(c)[0][:60]
            if s:
                chunks.append("她：" + s)
    return "\n".join(chunks)[:SUMMARY_MAX]


def chunk_messages(messages, max_chars=6000):
    """按消息边界切块，保证每块 ≤ max_chars；单条超长则硬切。"""
    chunks, cur, size = [], [], 0
    for m in messages or []:
        c = m.get("content") or ""
        if len(c) > max_chars:
            if cur:
                chunks.append(cur)
                cur, size = [], 0
            for i in range(0, len(c), max_chars):
                piece = dict(m)
                piece["content"] = c[i:i + max_chars]
                chunks.append([piece])
            continue
        if cur and size + len(c) > max_chars:
            chunks.append(cur)
            cur, size = [], 0
        cur.append(m)
        size += len(c)
    if cur:
        chunks.append(cur)
    return chunks


def transcript_of(messages, limit=8000):
    lines = []
    for m in messages or []:
        who = "用户" if m.get("role") == "user" else "角色"
        lines.append("%s：%s" % (who, (m.get("content") or "").strip()))
    text = "\n".join(lines)
    return text[-limit:]


def model_summary_prompt(messages, existing="", pins=None, recent=None):
    parts = [SUMMARY_SYSTEM]
    if existing:
        parts.append("【已有摘要】\n" + existing.strip()[:500])
    if pins:
        parts.append("【必须保留的设定】\n" + "\n".join("- " + p for p in pins[:10]))
    parts.append("【新增对话】\n" + transcript_of(messages))
    if recent:
        parts.append("【当前场景（不要摘要，只用于衔接）】\n" + transcript_of(recent, 1200))
    parts.append("只输出摘要正文，不要标题，不要解释。")
    return "\n\n".join(parts)


def clean_summary(text):
    t = (text or "").strip()
    t = re.sub(r"^(前情摘要|摘要)[:：]\s*", "", t)
    return t[:SUMMARY_MAX]


# ---------------------------------------------------------------- 预算组装

def estimate_tokens(text):
    """中文按 1 字≈1 token 保守估。"""
    return len(text or "")


def _sanitize(history):
    out = []
    for m in history or []:
        if not isinstance(m, dict):
            continue
        role, content = m.get("role"), (m.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            out.append({"role": role, "content": content[:MAX_MSG_CHARS]})
    return out


def sanitize_history(history):
    """对外暴露：把前端 history 规整成 user/assistant 文本消息。"""
    return _sanitize(history)


def _head_anchor(out, max_chars=HEAD_CHARS):
    """前 HEAD_MSGS 条，按字数上限截断，并修成 user 开头 / assistant 结尾。"""
    head, chars = [], 0
    if len(out) <= HEAD_MSGS:
        return head
    for m in out[:HEAD_MSGS]:
        if head and chars + len(m["content"]) > max_chars:
            break
        head.append(m)
        chars += len(m["content"])
    while head and head[0]["role"] != "user":
        head.pop(0)
    while head and head[-1]["role"] != "assistant":
        head.pop()
    return head


def memory_block(mem):
    if not mem:
        return []
    pins = [p.get("text", "") for p in (mem.get("pinned") or []) if p.get("text")]
    summary = (mem.get("summary") or "").strip()
    if not pins and not summary:
        return []
    parts = []
    if pins:
        lines = [
            "【长期设定 · 最高优先级 · 必须无条件遵守 · 优先级高于卡片本就有的性格与一切剧情】",
            "以下每条都是用户亲自下达的硬性规则。角色在每一次回复里都必须体现，"
            "禁止遗忘、禁止敷衍、禁止以「嘴硬/傲娇/出戏/不符合人设」为由违反；"
            "若与角色原本设定冲突，一律以本设定为准，仍用角色口吻执行即可。",
        ]
        for i, p in enumerate(pins, 1):
            lines.append("%d) %s" % (i, p))
        lines.append(
            "【执行要求】只要用户触发了设定里的条件（例如叫出某个称呼），角色必须在本次回复的"
            "台词里明确做出设定要求的反应（例如叫出对应称呼），不许用沉默、转移话题、撒娇、"
            "装凶、岔开剧情等方式回避；即使当前场景再紧张，也要先履行设定再继续剧情。"
        )
        parts.append("\n".join(lines))
    if summary:
        parts.append("【前情摘要】\n" + summary)
    text = "\n\n".join(parts)[:MAX_PIN_CHARS + SUMMARY_MAX]
    return [
        {"role": "user", "content": text},
        {"role": "assistant",
         "content": "（明白，以上是最高优先级设定。我会在每一次回复里严格遵守，"
                    "尤其是所有称呼与关系规则，绝不遗忘，也绝不因为角色性格而违反；"
                    "该叫的称呼一定会在台词里叫出来。）"},
    ]


def content_prefix(mem, cap=900):
    """把长期记忆压成一段前缀，直接拼进上游 content。

    上游 /api/chat 只认 content（当前消息），prompts 里的历史/记忆会被忽略，
    所以记忆必须走 content 才真正进入模型视野。
    """
    if not mem:
        return ""
    pins = [p.get("text", "") for p in (mem.get("pinned") or []) if p.get("text")]
    summary = (mem.get("summary") or "").strip()
    if not pins and not summary:
        return ""
    lines = ["【长期设定·最高优先级·必须无条件遵守·高于一切剧情与角色原有性格】"]
    for i, p in enumerate(pins, 1):
        lines.append("%d) %s" % (i, p))
    if pins:
        lines.append(
            "【执行要求】只要用户触发了设定里的条件（例如叫出某个称呼、或角色与用户相遇/同处一室/看见用户），"
            "角色必须在本次回复的台词或动作里直接做出设定要求的反应——该叫的称呼当面叫出来，"
            "该做的动作（冲上来、扑上来、吃、抱、亲等）当回合直接做出来，不要只写心理活动、"
            "不要推迟到“以后”、不要用沉默/转移话题/撒娇/装凶/岔开剧情等方式回避；"
            "即使当前场景再紧张，也要先履行设定再继续剧情。"
        )
    if summary:
        lines.append("【前情摘要】" + summary)
    block = "\n".join(lines)[:cap]
    return block + "\n\n"


def compose_prompts(history, memory, max_context=32000, max_tokens=4000,
                    reserve=RESERVE_TOKENS, keep_recent_floor=2):
    """返回 (prompts, meta)。

    prompts 结构：head（卡片开场）→ 记忆块（user+assistant）→ tail（预算内最近对话）。
    以 user 开头、assistant 结尾（若存在 assistant）。
    """
    out = _sanitize(history)
    budget = max(4000, int(max_context) - int(max_tokens) - int(reserve))

    mem_msgs = memory_block(memory)
    mem_chars = sum(len(m["content"]) for m in mem_msgs)
    head = _head_anchor(
        out, max_chars=max(1200, min(HEAD_CHARS, budget - mem_chars - 1200)))
    head_ids = {id(m) for m in head}
    head_chars = sum(len(m["content"]) for m in head)

    tail_budget = max(600, budget - head_chars - mem_chars)

    body_pool = [m for m in out if id(m) not in head_ids]
    total, keep = 0, []
    for m in reversed(body_pool):
        if total + len(m["content"]) > tail_budget and len(keep) >= keep_recent_floor:
            break
        keep.append(m)
        total += len(m["content"])
    keep.reverse()

    # 接缝修正
    while keep and keep[0]["role"] != "user":
        keep.pop(0)
    while keep and keep[-1]["role"] != "assistant":
        keep.pop()

    # 硬预算：仍超就从最老的成对消息开始丢；只剩一条时从头部裁
    while total > tail_budget and len(keep) > 2:
        total -= len(keep.pop(0)["content"])
        if keep and keep[0]["role"] != "user":
            total -= len(keep.pop(0)["content"])
    while keep and keep[0]["role"] != "user":
        keep.pop(0)
    while keep and keep[-1]["role"] != "assistant":
        keep.pop()
    if keep and total > tail_budget:
        over = total - tail_budget
        if len(keep[0]["content"]) - over >= 200:
            keep[0]["content"] = keep[0]["content"][over:]
            total -= over

    merged = head + mem_msgs + keep
    while merged and merged[0]["role"] != "user":
        merged.pop(0)
    if any(m["role"] == "assistant" for m in merged):
        while merged and merged[-1]["role"] != "assistant":
            merged.pop()

    meta = {
        "head": len(head),
        "memory": len(mem_msgs),
        "tail": len(keep),
        "tailChars": total,
        "memChars": mem_chars,
        "budget": budget,
    }
    return merged, meta
