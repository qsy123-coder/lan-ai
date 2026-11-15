"""本地广场（论坛）数据：种子在 site/data/forum.json，运行态落 out/forum.json。

只依赖标准库。引擎独占写入，读接口按 topic/tag/sort/q 过滤。
"""

import io
import json
import os
import secrets
import threading
import time

VERSION = 1
LOCK = threading.RLock()


def _now():
    return int(time.time())


def _empty():
    return {"version": VERSION, "topics": [], "groups": [], "hotTags": [], "posts": []}


def _norm(s):
    return str(s or "").strip().lower()


def load(seed_path, data_path):
    if not os.path.exists(data_path):
        try:
            with io.open(seed_path, encoding="utf-8-sig") as f:
                seed = json.load(f)
        except Exception:
            seed = _empty()
        save(data_path, seed)
    try:
        with io.open(data_path, encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception:
        try:
            with io.open(seed_path, encoding="utf-8-sig") as f:
                return json.load(f)
        except Exception:
            return _empty()
    if not isinstance(data, dict):
        return _empty()
    for k in ("topics", "groups", "hotTags", "posts"):
        if not isinstance(data.get(k), list):
            data[k] = []
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


def meta(data):
    return {
        "topics": list(data.get("topics") or []),
        "groups": list(data.get("groups") or []),
        "hotTags": list(data.get("hotTags") or []),
    }


def _comment_public(c):
    return {
        "id": c.get("id"),
        "author": c.get("author") or "匿名",
        "authorLevel": int(c.get("authorLevel") or 1),
        "body": c.get("body") or "",
        "createdAt": int(c.get("createdAt") or 0),
    }


def _post_public(post, uid=None, full=False):
    comments = post.get("comments") or []
    votes = post.get("votes") or {}
    liked = int(votes.get(uid, 0)) if uid else 0
    out = {
        "id": post.get("id"),
        "title": post.get("title") or "",
        "author": post.get("author") or "匿名",
        "authorLevel": int(post.get("authorLevel") or 1),
        "topic": post.get("topic") or "",
        "tags": list(post.get("tags") or []),
        "pinned": bool(post.get("pinned")),
        "createdAt": int(post.get("createdAt") or 0),
        "likes": int(post.get("likes") or 0),
        "dislikes": int(post.get("dislikes") or 0),
        "liked": liked,
        "commentCount": len(comments),
    }
    if full:
        out["body"] = post.get("body") or ""
        out["comments"] = [_comment_public(c) for c in comments]
    else:
        body = (post.get("body") or "").replace("\r", "")
        out["excerpt"] = body[:140].replace("\n", " ")
    return out


def _find(data, post_id):
    for p in data.get("posts") or []:
        if str(p.get("id")) == str(post_id):
            return p
    return None


def _sort_key(post, sort):
    if sort == "hot":
        score = int(post.get("likes") or 0) + len(post.get("comments") or []) * 2
        return (0 if post.get("pinned") else 1, -score, -int(post.get("createdAt") or 0))
    return (0 if post.get("pinned") else 1, -int(post.get("createdAt") or 0))


def list_posts(seed_path, data_path, topic="", tag="", sort="latest", q="", uid=None):
    with LOCK:
        data = load(seed_path, data_path)
        topic = (topic or "").strip()
        tag = _norm(tag)
        q = _norm(q)
        posts = list(data.get("posts") or [])
        if topic and topic not in ("最新", "all", "全部"):
            posts = [p for p in posts if (p.get("topic") or "") == topic]
        if tag:
            posts = [p for p in posts if tag in [_norm(t) for t in (p.get("tags") or [])]]
        if q:
            posts = [p for p in posts if q in _norm(p.get("title")) or q in _norm(p.get("body"))
                     or any(q in _norm(t) for t in (p.get("tags") or []))]
        posts.sort(key=lambda p: _sort_key(p, sort))
        return {
            "posts": [_post_public(p, uid, full=False) for p in posts],
            "meta": meta(data),
        }


def get_post(seed_path, data_path, post_id, uid=None):
    with LOCK:
        data = load(seed_path, data_path)
        p = _find(data, post_id)
        if not p:
            return None
        return _post_public(p, uid, full=True)


def create_post(seed_path, data_path, user, title, body, tags=None, topic=""):
    title = (title or "").strip()
    body = (body or "").strip()
    if len(title) < 2 or len(title) > 80:
        return None, "标题需 2–80 字"
    if len(body) < 2 or len(body) > 4000:
        return None, "正文需 2–4000 字"
    tags = [str(t).strip()[:20] for t in (tags or []) if str(t).strip()][:5]
    with LOCK:
        data = load(seed_path, data_path)
        topics = data.get("topics") or []
        if not topic or (topics and topic not in topics):
            topic = topics[0] if topics else "角色与创作"
        post = {
            "id": "p_%d_%s" % (int(time.time() * 1000), secrets.token_hex(3)),
            "title": title,
            "body": body,
            "author": (user or {}).get("name") or "匿名",
            "authorLevel": max(1, int((user or {}).get("vip") or 1)),
            "topic": topic,
            "tags": tags,
            "pinned": False,
            "createdAt": _now(),
            "likes": 0,
            "dislikes": 0,
            "votes": {},
            "comments": [],
        }
        data.setdefault("posts", []).insert(0, post)
        save(data_path, data)
        return _post_public(post, (user or {}).get("id"), full=True), None


def add_comment(seed_path, data_path, user, post_id, body):
    body = (body or "").strip()
    if len(body) < 1 or len(body) > 1000:
        return None, "评论需 1–1000 字"
    with LOCK:
        data = load(seed_path, data_path)
        post = _find(data, post_id)
        if not post:
            return None, "帖子不存在"
        comment = {
            "id": "c_%d_%s" % (int(time.time() * 1000), secrets.token_hex(3)),
            "author": (user or {}).get("name") or "匿名",
            "authorLevel": max(1, int((user or {}).get("vip") or 1)),
            "body": body,
            "createdAt": _now(),
        }
        post.setdefault("comments", []).append(comment)
        save(data_path, data)
        return {
            "comment": _comment_public(comment),
            "post": _post_public(post, (user or {}).get("id"), full=True),
        }, None


def like(seed_path, data_path, uid, post_id, value):
    try:
        value = int(value)
    except (TypeError, ValueError):
        return None, "value 需为 1/-1/0"
    if value not in (-1, 0, 1):
        return None, "value 需为 1/-1/0"
    with LOCK:
        data = load(seed_path, data_path)
        post = _find(data, post_id)
        if not post:
            return None, "帖子不存在"
        votes = post.setdefault("votes", {})
        old = int(votes.get(uid, 0))
        if old == 1:
            post["likes"] = max(0, int(post.get("likes") or 0) - 1)
        elif old == -1:
            post["dislikes"] = max(0, int(post.get("dislikes") or 0) - 1)
        if value == 1:
            post["likes"] = int(post.get("likes") or 0) + 1
        elif value == -1:
            post["dislikes"] = int(post.get("dislikes") or 0) + 1
        if value == 0:
            votes.pop(uid, None)
        else:
            votes[uid] = value
        save(data_path, data)
        return _post_public(post, uid, full=True), None
