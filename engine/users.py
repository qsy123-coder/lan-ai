"""本地用户与积分账本（演示站用，单文件 JSON，引擎独占写入）。

结构（out/users.json）：
{
  "version": 1,
  "users": {"u_x": {"id","email","name","salt","hash","credit","createdAt"}},
  "sessions": {"<token>": {"uid","exp"}},
  "ledger": {"u_x": [{"ts","type","amount","balance","note"}]}
}

只依赖标准库。注册送 100 credit；生成按预扣 3.2 / 结算 2.1 记账。
"""

import hashlib
import hmac
import io
import json
import os
import re
import secrets
import threading
import time

VERSION = 1
INITIAL_CREDIT = 100.0
SESSION_TTL = 30 * 24 * 3600
LEDGER_KEEP = 200
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

LOCK = threading.RLock()


def _now():
    return int(time.time())


def _empty():
    return {"version": VERSION, "users": {}, "sessions": {}, "ledger": {}}


def load(path):
    try:
        with io.open(path, encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception:
        return _empty()
    if not isinstance(data, dict):
        return _empty()
    for k in ("users", "sessions", "ledger"):
        if not isinstance(data.get(k), dict):
            data[k] = {}
    data["version"] = VERSION
    return data


def save(path, data):
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    tmp = path + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def _public(user):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name") or user["email"].split("@")[0],
        "credit": round(float(user.get("credit") or 0), 2),
        "createdAt": int(user.get("createdAt") or 0),
    }


def _hash(password, salt):
    return hashlib.scrypt(password.encode("utf-8"), salt=salt,
                          n=2 ** 14, r=8, p=1, dklen=32).hex()


def _add_entry(data, uid, kind, amount, note=""):
    user = data["users"].get(uid)
    if not user:
        return None
    user["credit"] = round(float(user.get("credit") or 0) + float(amount), 2)
    entry = {
        "ts": _now(),
        "type": kind,
        "amount": round(float(amount), 2),
        "balance": user["credit"],
        "note": (note or "")[:120],
    }
    rows = data["ledger"].setdefault(uid, [])
    rows.append(entry)
    if len(rows) > LEDGER_KEEP:
        data["ledger"][uid] = rows[-LEDGER_KEEP:]
    return entry


def _prune_sessions(data):
    now = _now()
    dead = [t for t, s in data["sessions"].items() if int(s.get("exp") or 0) <= now]
    for t in dead:
        data["sessions"].pop(t, None)


def _make_session(data, uid):
    token = secrets.token_urlsafe(32)
    data["sessions"][token] = {"uid": uid, "exp": _now() + SESSION_TTL}
    return token


def register(path, email, password, name=""):
    """返回 (user, token, error)。"""
    email = (email or "").strip().lower()
    password = password or ""
    if not EMAIL_RE.match(email):
        return None, None, "邮箱格式不对"
    if len(password) < 8:
        return None, None, "密码至少 8 位"
    with LOCK:
        data = load(path)
        for u in data["users"].values():
            if u.get("email") == email:
                return None, None, "这个邮箱已注册"
        uid = "u_" + secrets.token_hex(6)
        salt = secrets.token_bytes(16)
        user = {
            "id": uid,
            "email": email,
            "name": (name or "").strip()[:24] or email.split("@")[0],
            "salt": salt.hex(),
            "hash": _hash(password, salt),
            "credit": 0.0,
            "createdAt": _now(),
        }
        data["users"][uid] = user
        _add_entry(data, uid, "grant", INITIAL_CREDIT, "注册赠礼")
        token = _make_session(data, uid)
        save(path, data)
        return _public(user), token, None


def login(path, email, password):
    email = (email or "").strip().lower()
    with LOCK:
        data = load(path)
        user = next((u for u in data["users"].values() if u.get("email") == email), None)
        if not user:
            return None, None, "邮箱或密码不对"
        try:
            salt = bytes.fromhex(user.get("salt") or "")
            want = user.get("hash") or ""
            got = _hash(password or "", salt)
        except Exception:
            return None, None, "账号数据损坏"
        if not hmac.compare_digest(want, got):
            return None, None, "邮箱或密码不对"
        token = _make_session(data, user["id"])
        save(path, data)
        return _public(user), token, None


def session_user(path, token):
    if not token:
        return None
    with LOCK:
        data = load(path)
        _prune_sessions(data)
        s = data["sessions"].get(token)
        if not s:
            save(path, data)
            return None
        user = data["users"].get(s.get("uid"))
        save(path, data)
        return _public(user) if user else None


def logout(path, token):
    if not token:
        return
    with LOCK:
        data = load(path)
        data["sessions"].pop(token, None)
        save(path, data)


def get_user(path, uid):
    with LOCK:
        data = load(path)
        user = data["users"].get(uid)
        return _public(user) if user else None


def ledger(path, token, limit=50):
    with LOCK:
        data = load(path)
        _prune_sessions(data)
        s = data["sessions"].get(token)
        if not s:
            return None, None
        user = data["users"].get(s.get("uid"))
        if not user:
            return None, None
        rows = list(data["ledger"].get(user["id"]) or [])[-max(1, min(200, int(limit))):]
        rows.reverse()
        return _public(user), rows


def recharge(path, token, amount, note="演示充值"):
    try:
        amount = round(float(amount), 2)
    except (TypeError, ValueError):
        return None, None, "金额不对"
    if amount <= 0 or amount > 20000:
        return None, None, "金额需在 1–20000 之间"
    with LOCK:
        data = load(path)
        _prune_sessions(data)
        s = data["sessions"].get(token)
        if not s:
            return None, None, "请先登录"
        user = data["users"].get(s.get("uid"))
        if not user:
            return None, None, "请先登录"
        entry = _add_entry(data, user["id"], "recharge", amount, note)
        save(path, data)
        return _public(user), entry, None


def charge(path, uid, amount, note="生成扣费"):
    """生成成功后按实际额度扣一次（预览/失败不调用）。"""
    amount = round(float(amount), 2)
    with LOCK:
        data = load(path)
        user = data["users"].get(uid)
        if not user:
            return None
        _add_entry(data, uid, "charge", -amount, note)
        save(path, data)
        return _public(user)


def prepay(path, uid, amount, note="生成预扣"):
    """扣预扣额度；返回 (ok, balance, error)。"""
    amount = round(float(amount), 2)
    with LOCK:
        data = load(path)
        user = data["users"].get(uid)
        if not user:
            return False, 0.0, "用户不存在"
        if float(user.get("credit") or 0) + 1e-9 < amount:
            return False, round(float(user.get("credit") or 0), 2), "积分不足"
        _add_entry(data, uid, "prepay", -amount, note)
        save(path, data)
        return True, round(float(user.get("credit") or 0), 2), None


def settle(path, uid, reserved, actual, note="生成结算"):
    """预扣转实际：退回 reserved-actual（正数）。"""
    diff = round(float(reserved) - float(actual), 2)
    if abs(diff) < 0.001:
        return get_user(path, uid)
    with LOCK:
        data = load(path)
        if uid in data["users"]:
            _add_entry(data, uid, "settle", diff, note)
            save(path, data)
        user = data["users"].get(uid)
        return _public(user) if user else None


def refund(path, uid, amount, note="生成失败退款"):
    amount = round(float(amount), 2)
    if amount <= 0:
        return get_user(path, uid)
    with LOCK:
        data = load(path)
        if uid in data["users"]:
            _add_entry(data, uid, "refund", amount, note)
            save(path, data)
        user = data["users"].get(uid)
        return _public(user) if user else None
