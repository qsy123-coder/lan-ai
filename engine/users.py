"""本地用户与积分账本（演示站用，单文件 JSON，引擎独占写入）。

结构（out/users.json）：
{
  "version": 1,
  "users": {"u_x": {"id","email","name","salt","hash","credit","createdAt"}},
  "sessions": {"<token>": {"uid","exp"}},
  "ledger": {"u_x": [{"ts","type","amount","balance","note"}]},
  "pending_signups": {"<email>": {"salt","hash","name","code","exp","tries"}},
  "reset_codes": {"<email>": {"code","exp","tries"}},
  "phone_codes": {"<phone>": {"code","exp","tries","lastSent"}}
}

只依赖标准库。注册送 100 credit；生成按预扣 3.2 / 结算 2.1 记账。
"""

import datetime
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
OTP_TTL = 600
OTP_TRIES = 5
PHONE_TTL = 300
PHONE_COOLDOWN = 60
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+\d{8,15}$")

# 北京时间固定 UTC+8（不依赖 tzdata，Windows 也能跑）
TZ = datetime.timezone(datetime.timedelta(hours=8))
VIP_LEVELS = ((10958.0, 3), (2055.0, 2), (1.0, 1))
CHECKIN_BASE = 5.0
CHECKIN_BONUS = 20.0

LOCK = threading.RLock()


def _now():
    return int(time.time())


def _today(now=None):
    if now is None:
        dt = datetime.datetime.now(TZ)
    elif isinstance(now, (int, float)):
        dt = datetime.datetime.fromtimestamp(now, TZ)
    else:
        dt = now
    return dt.date().isoformat()


def _empty():
    return {"version": VERSION, "users": {}, "sessions": {}, "ledger": {},
            "pending_signups": {}, "reset_codes": {}, "phone_codes": {}}


def load(path):
    try:
        with io.open(path, encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception:
        return _empty()
    if not isinstance(data, dict):
        return _empty()
    for k in ("users", "sessions", "ledger", "pending_signups", "reset_codes", "phone_codes"):
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


def _public(user, vip=0):
    email = user.get("email") or ""
    name = (user.get("name") or (email.split("@")[0] if email else "") or "用户")
    return {
        "id": user["id"],
        "email": email,
        "phone": user.get("phone") or "",
        "name": name,
        "credit": round(float(user.get("credit") or 0), 2),
        "vip": int(vip),
        "createdAt": int(user.get("createdAt") or 0),
    }


def vip_level(data, uid, now=None):
    """近 30 天累计充值（credit）决定 VIP：>0 VIP1，≥2055 VIP2，≥10958 VIP3。"""
    cutoff = (now if isinstance(now, (int, float)) else _now()) - 30 * 24 * 3600
    total = 0.0
    for e in data["ledger"].get(uid, []):
        if e.get("type") != "recharge":
            continue
        if int(e.get("ts") or 0) < cutoff:
            continue
        total += float(e.get("amount") or 0)
    for need, level in VIP_LEVELS:
        if total >= need:
            return level
    return 0


def _checkin_days(data, uid):
    return {e.get("day") for e in data["ledger"].get(uid, [])
            if e.get("type") == "checkin" and e.get("day")}


def _streak_ending(days, end_day):
    """从 end_day 往前数连续签到天数。"""
    n = 0
    d = datetime.date.fromisoformat(end_day)
    while d.isoformat() in days:
        n += 1
        d -= datetime.timedelta(days=1)
    return n


def _hash(password, salt):
    return hashlib.scrypt(password.encode("utf-8"), salt=salt,
                          n=2 ** 14, r=8, p=1, dklen=32).hex()


def _add_entry(data, uid, kind, amount, note="", day=None):
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
    if day:
        entry["day"] = day
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


def _new_code():
    return "%08d" % secrets.randbelow(100000000)


def _create_user(data, email, salt_hex, hash_hex, name="", phone=""):
    uid = "u_" + secrets.token_hex(6)
    fallback = (email.split("@")[0] if email else ("用户" + phone[-4:] if phone else "用户"))
    user = {
        "id": uid,
        "email": email,
        "phone": phone,
        "name": (name or "").strip()[:24] or fallback,
        "salt": salt_hex,
        "hash": hash_hex,
        "credit": 0.0,
        "createdAt": _now(),
    }
    data["users"][uid] = user
    _add_entry(data, uid, "grant", INITIAL_CREDIT, "注册赠礼")
    token = _make_session(data, uid)
    return user, token


def _check_code(record, code, now):
    if not record:
        return "验证码已过期，请重新获取"
    if int(record.get("exp") or 0) <= now:
        return "验证码已过期，请重新获取"
    if int(record.get("tries") or 0) >= OTP_TRIES:
        return "验证码次数过多，请重新获取"
    if not hmac.compare_digest(str(record.get("code") or ""), str(code or "")):
        record["tries"] = int(record.get("tries") or 0) + 1
        return "验证码不对"
    return None


def _prune_codes(mapping, now):
    for key in [k for k, v in mapping.items() if int(v.get("exp") or 0) <= now]:
        mapping.pop(key, None)


def register(path, email, password, name=""):
    """返回 (user, token, error)。保留即时注册，给旧接口兼容。"""
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
        salt = secrets.token_bytes(16)
        user, token = _create_user(data, email, salt.hex(), _hash(password, salt), name)
        save(path, data)
        return _public(user, 0), token, None


def signup_request(path, email, password, name=""):
    """创建待验证注册，返回 (payload, error)；payload 带演示用 code。"""
    email = (email or "").strip().lower()
    password = password or ""
    if not EMAIL_RE.match(email):
        return None, "邮箱格式不对"
    if len(password) < 8:
        return None, "密码至少 8 位"
    with LOCK:
        data = load(path)
        for u in data["users"].values():
            if u.get("email") == email:
                return None, "这个邮箱已注册"
        now = _now()
        _prune_codes(data["pending_signups"], now)
        salt = secrets.token_bytes(16)
        code = _new_code()
        data["pending_signups"][email] = {
            "salt": salt.hex(),
            "hash": _hash(password, salt),
            "name": (name or "").strip()[:24],
            "code": code,
            "exp": now + OTP_TTL,
            "tries": 0,
            "createdAt": now,
        }
        save(path, data)
        return {"email": email, "code": code}, None


def signup_verify(path, email, code):
    """验证注册码并建号，返回 (user, token, error)。"""
    email = (email or "").strip().lower()
    with LOCK:
        data = load(path)
        now = _now()
        rec = data["pending_signups"].get(email)
        err = _check_code(rec, code, now)
        if err:
            if rec and int(rec.get("exp") or 0) <= now:
                data["pending_signups"].pop(email, None)
            save(path, data)
            return None, None, err
        for u in data["users"].values():
            if u.get("email") == email:
                data["pending_signups"].pop(email, None)
                save(path, data)
                return None, None, "这个邮箱已注册"
        user, token = _create_user(data, email, rec["salt"], rec["hash"], rec.get("name"))
        data["pending_signups"].pop(email, None)
        save(path, data)
        return _public(user, 0), token, None


def reset_request(path, email):
    """发送重设密码验证码，返回 (payload, error)。"""
    email = (email or "").strip().lower()
    with LOCK:
        data = load(path)
        user = next((u for u in data["users"].values() if u.get("email") == email), None)
        if not user:
            return None, "邮箱未注册"
        now = _now()
        _prune_codes(data["reset_codes"], now)
        code = _new_code()
        data["reset_codes"][email] = {"code": code, "exp": now + OTP_TTL, "tries": 0}
        save(path, data)
        return {"email": email, "code": code}, None


def reset_verify(path, email, code, password):
    """验证重置码并改密码，返回 (user, error)。"""
    email = (email or "").strip().lower()
    password = password or ""
    if len(password) < 8:
        return None, "密码至少 8 位"
    with LOCK:
        data = load(path)
        now = _now()
        rec = data["reset_codes"].get(email)
        err = _check_code(rec, code, now)
        if err:
            if rec and int(rec.get("exp") or 0) <= now:
                data["reset_codes"].pop(email, None)
            save(path, data)
            return None, err
        user = next((u for u in data["users"].values() if u.get("email") == email), None)
        if not user:
            data["reset_codes"].pop(email, None)
            save(path, data)
            return None, "邮箱未注册"
        salt = secrets.token_bytes(16)
        user["salt"] = salt.hex()
        user["hash"] = _hash(password, salt)
        for token in [t for t, s in data["sessions"].items() if s.get("uid") == user["id"]]:
            data["sessions"].pop(token, None)
        data["reset_codes"].pop(email, None)
        save(path, data)
        return _public(user, vip_level(data, user["id"])), None


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
        return _public(user, vip_level(data, user["id"])), token, None


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
        return _public(user, vip_level(data, user["id"])) if user else None


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
        return _public(user, vip_level(data, uid)) if user else None


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
        return _public(user, vip_level(data, user["id"])), rows


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
        return _public(user, vip_level(data, user["id"])), entry, None


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
        return _public(user, vip_level(data, uid))


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
        return _public(user, vip_level(data, uid)) if user else None


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
        return _public(user, vip_level(data, uid)) if user else None


def checkin(path, token, now=None):
    """每日签到（北京时间）：基础 5 credit，连续第 7 天额外 +20。

    返回 (user, entry, error, streak)。
    """
    today = _today(now)
    with LOCK:
        data = load(path)
        _prune_sessions(data)
        s = data["sessions"].get(token)
        if not s:
            return None, None, "请先登录", 0
        user = data["users"].get(s.get("uid"))
        if not user:
            return None, None, "请先登录", 0
        uid = user["id"]
        days = _checkin_days(data, uid)
        if today in days:
            return None, None, "今天已经签到", _streak_ending(days, today)
        yesterday = (datetime.date.fromisoformat(today)
                     - datetime.timedelta(days=1)).isoformat()
        streak = _streak_ending(days, yesterday) + 1
        reward = CHECKIN_BASE + (CHECKIN_BONUS if streak % 7 == 0 else 0)
        entry = _add_entry(data, uid, "checkin", reward,
                           "每日签到 · 第%d天" % streak, day=today)
        save(path, data)
        return _public(user, vip_level(data, uid)), entry, None, streak


def checkin_status(path, token, now=None):
    """返回 (user, {today, checkedToday, streak, rewardNext}) 或 (None, None)。"""
    today = _today(now)
    with LOCK:
        data = load(path)
        _prune_sessions(data)
        s = data["sessions"].get(token)
        if not s:
            return None, None
        user = data["users"].get(s.get("uid"))
        if not user:
            return None, None
        uid = user["id"]
        days = _checkin_days(data, uid)
        checked = today in days
        if checked:
            streak = _streak_ending(days, today)
            reward = CHECKIN_BASE
        else:
            yesterday = (datetime.date.fromisoformat(today)
                         - datetime.timedelta(days=1)).isoformat()
            streak = _streak_ending(days, yesterday)
            nxt = streak + 1
            reward = CHECKIN_BASE + (CHECKIN_BONUS if nxt % 7 == 0 else 0)
        return _public(user, vip_level(data, uid)), {
            "today": today,
            "checkedToday": checked,
            "streak": streak,
            "rewardNext": round(reward, 2),
        }


# ---------------------------------------------------------------- 手机号短信登录

def normalize_phone(raw):
    s = re.sub(r"[^\d+]", "", str(raw or ""))
    if s.startswith("00"):
        s = "+" + s[2:]
    if not s.startswith("+"):
        s = "+" + s
    return s if PHONE_RE.match(s) else None


def phone_request(path, phone, now=None):
    """生成 6 位短信码；同一号码 60 秒内不重复发。"""
    phone = normalize_phone(phone)
    if not phone:
        return None, "手机号格式不对（需 E.164，如 +8613800138000）"
    now = int(now or _now())
    with LOCK:
        data = load(path)
        _prune_codes(data["phone_codes"], now)
        rec = data["phone_codes"].get(phone)
        if rec:
            wait = PHONE_COOLDOWN - (now - int(rec.get("lastSent") or 0))
            if wait > 0:
                return None, "请 %d 秒后再试" % wait
        code = "%06d" % secrets.randbelow(1000000)
        data["phone_codes"][phone] = {
            "code": code, "exp": now + PHONE_TTL, "tries": 0, "lastSent": now,
        }
        save(path, data)
        return {"phone": phone, "code": code}, None


def phone_clear(path, phone):
    phone = normalize_phone(phone) or phone
    with LOCK:
        data = load(path)
        data["phone_codes"].pop(phone, None)
        save(path, data)


def phone_verify(path, phone, code, name=""):
    """验证短信码；老号登录，新号自动建号并送 100 credit。"""
    phone = normalize_phone(phone)
    if not phone:
        return None, None, "手机号格式不对"
    with LOCK:
        data = load(path)
        now = _now()
        rec = data["phone_codes"].get(phone)
        err = _check_code(rec, code, now)
        if err:
            if rec and int(rec.get("exp") or 0) <= now:
                data["phone_codes"].pop(phone, None)
            save(path, data)
            return None, None, err
        user = next((u for u in data["users"].values() if u.get("phone") == phone), None)
        if user:
            token = _make_session(data, user["id"])
        else:
            user, token = _create_user(
                data, "", "", "", (name or "").strip()[:24], phone=phone)
        data["phone_codes"].pop(phone, None)
        save(path, data)
        return _public(user, vip_level(data, user["id"])), token, None
