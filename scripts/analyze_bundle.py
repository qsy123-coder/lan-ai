# scripts/analyze_bundle.py —— 从 captures/site/*.js 里筛出真正的 tRPC procedure / 路由 / 模型
import glob
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "captures", "site")
OUT = os.path.join(SITE, "structure.json")

STR = re.compile(r'[`"\']([^`"\'\n]{2,120})[`"\']')
PROC = re.compile(r'^[a-z][A-Za-z0-9]{1,24}\.[a-zA-Z][A-Za-z0-9]{1,40}$')
BAD_TAIL = {"com", "net", "top", "xyz", "io", "ai", "webp", "png", "jpg", "js", "css", "html",
            "org", "co", "me", "app", "dev", "cn", "site", "info", "cc", "tv", "ru", "de"}
PREFIX = ("chat", "card", "user", "credit", "credits", "preset", "notification", "bounty",
          "draw", "image", "search", "invite", "affiliate", "subscription", "plan", "gift",
          "quest", "story", "character", "message", "report", "feedback", "admin", "config",
          "wallet", "order", "payment", "pricing", "model", "tag", "category", "comment",
          "follow", "like", "share", "referral", "checkin", "signin", "task", "memory",
          "persona", "lore", "world", "scene", "role", "voice", "tts", "export", "ads")

blob = []
for p in sorted(glob.glob(os.path.join(SITE, "*.js"))):
    try:
        blob.append(io.open(p, encoding="utf-8", errors="ignore").read())
    except Exception:
        pass
text = "\n".join(blob)
strings = list(dict.fromkeys(STR.findall(text)))
print("strings", len(strings))

procs = {}
for s in strings:
    if not PROC.match(s):
        continue
    head, tail = s.split(".")
    if tail.lower() in BAD_TAIL or head.lower() in BAD_TAIL:
        continue
    if not head.startswith(PREFIX):
        continue
    procs.setdefault(head, set()).add(tail)

routes = sorted({s for s in strings
                 if s.startswith("/") and " " not in s and len(s) < 70
                 and not s.startswith("//") and not s.endswith((".js", ".css", ".webp", ".png"))})

# Expo Router 的目录式路由：(tabs)/xxx
screens = sorted({s for s in strings if re.search(r"\(tabs\)|\(auth\)|\(drawer\)", s)})

# 中文 UI 文案（按长度过滤掉数据串）
cn = sorted({s for s in strings
             if re.search(r"[\u4e00-\u9fa5]", s) and 2 <= len(s) <= 30
             and not s.startswith("data:") and "http" not in s})

models = sorted({s for s in strings if re.match(
    r"^(nalang-[a-z0-9\-]+|x-apex-[a-z0-9\-]+|gemini-[0-9\.a-z\-]+|claude-[a-z0-9\.\-]+)$", s)})
image_models = sorted({s for s in strings if s in (
    "anime", "iroha", "z-image", "nalang-dream", "nalang-dream-pro", "kagami", "gemini-2.5-flash")})

res = {
    "procedures": {k: sorted(v) for k, v in sorted(procs.items())},
    "procedure_count": sum(len(v) for v in procs.values()),
    "routes": routes,
    "screens": screens,
    "models": models,
    "image_models": image_models,
    "cn_strings": cn,
}
io.open(OUT, "w", encoding="utf-8", newline="\n").write(json.dumps(res, ensure_ascii=False, indent=1))

print("procedures:", res["procedure_count"], "namespaces:", len(procs))
for k, v in sorted(procs.items()):
    print("  %-14s %2d  %s" % (k, len(v), ", ".join(sorted(v))[:120]))
print("routes:", len(routes))
print("screens:", len(screens), screens[:8])
print("models:", models)
print("→", OUT)
