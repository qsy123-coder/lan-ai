# CLAUDE.md — 项目上下文与工程规范

> 本文件是本工作区的**唯一事实来源**。每次会话开始先读完它，再动手。
> 与本文件冲突的旧笔记一律作废；新发现的事实当天回写进「站点事实」与「分支台账」。
> 原 `新建文本文档.txt` 是另一个项目（WaveMod）的规范，与本项目无关，不要混用。

---

## 项目概述

- **项目名称**：lan-ai（「澜」）
- **两条主线**：
  1. **额度池**：把 `https://www.dzmm.ai` 的付费边界打平（会员等级、每日额度 quota、积分 credits、
     导出/搜索/绘图次数、六连抽），手段固定为一条链：**本地代理全量抓包 → 定位额度判定点 →
     重放 / 改包 / 并发 / 头部错位 → 固化成脚本**。不做"分析报告"，只交付能跑的
     `capture / replay / patch / verify` 四件套。
  2. **「澜」前台**：按 `notes/008` 拆解做的同类站（角色卡聊天），额度直连上面的号池。
- **两个进程**：`engine`（Python，`:8787`）+ `site`（Next.js，`:3100`）。引擎只监听回环，Next 转发。

## 技术栈

- **前端**：Next.js 15（App Router），React 18，**原生 CSS**（无 Tailwind / shadcn）。
- **引擎**：Python 3.12，标准库 `HTTPServer` + `curl_cffi`（`impersonate="chrome"`）。
- **上游**：dzmm.ai —— tRPC over `/api/trpc`（superjson）+ `/api/chat`（SSE）。
- **出口**：Clash / mihomo 混合端口 `127.0.0.1:7897`（本机）/ `7890`（服务器）。
- **部署**：腾讯云 Ubuntu `43.135.10.175`，systemd（`lan-site` / `lan-engine` / `mihomo`），
  公网入口 `https://43-135-10-175.sslip.io`（口令 `lan-4006`）。
- **持久化**：JSON 文件为主（`accounts.json` / `out/webstate.json` / `out/users.json` / `out/memory/*.json`）。

## 架构原则（必须严格遵守）

1. **服务端账本为准**：前端展示层好改但没用；真正的判定点在 `chat.getQuotas` / `credits.getBalance`
   背后的服务端计数，以及生成类接口的扣减事务。
2. **引擎单职责**：`engine/` 只做号池轮换 / 建会话 / 流式 / 结算；`site/` 只做界面与转发（`/api/chat` 透传 SSE）。
3. **占位符先行**：真实凭证只进 `notes/` 与本地 `.env`，**不进 git、不进本文件**。
4. **原始 flow 不可变**：`captures/` 只读，任何分析基于 `.flow`，不许只看截图。
5. **一次只推一条攻击面**（A→G 依次），跑穿再换；不要同时开五条线导致日志互相污染。
6. **速率约束**：单账号 ≤ 2 rps；并发实验单轮 ≤ 16 并发、≤ 30 s，轮间冷却 ≥ 60 s。
7. **可回滚**：改包 / 改 claims / 部署前先存原值与还原命令到 `patches/<日期>.md` 或备份目录。

## 目录结构（重要）

```
project/
├── CLAUDE.md                  # 本文件（唯一事实来源）
├── accounts.md                # 账号登记簿（人读）
├── accounts.json              # 账号池 + cookie（机器读，凭证，勿外发）
├── engine/                    # 额度池引擎（Python）
│   ├── server.py              # stdlib HTTPServer + curl_cffi，127.0.0.1:8787
│   ├── memory.py              # 长期记忆（锚点/摘要/content 注入）
│   ├── users.py               # 站内用户 + 积分账本（注册/登录/签到/充值）
│   └── tests/                 # 单测（pytest/unittest）
├── site/                      # 「澜」前台（Next.js 15，:3100）
│   ├── app/                   # App Router：首页 / card/[id] / chat / me / pricing / about
│   ├── app/api/               # Route Handlers（enter / chat / auth / credits / memory / img / pool）
│   ├── components/            # ChatClient / SessionList / Nav / ThemeToggle ...
│   └── lib/                   # session / pool / engine / cards / gate
├── web/                       # 账号池可视化控制台（Next.js，:3000）
├── scripts/                   # 抓包/重放/并发/开号/出口探测/求解 等工具
├── workers/                   # Cloudflare Worker（mail-hub 邮件中心）
├── docs/                      # PRD / 方案
├── deploy/                    # 部署说明
├── captures/                  # mitmproxy 原始流（.flow，永不改）+ site 卡片库
├── notes/                     # 每个 procedure / 每轮结论一页
├── patches/                   # 改包/改头/改 claims 的配置 + 还原命令
└── out/                       # 运行态与产物（webstate/users/memory/日志/截图）
```

> `scripts/` 里 `*.ps1`（`clash.ps1` / `start*.ps1`）与 `*.py` / `*.mjs` 各司其职；
> `workers/` 不参与 Next 构建。

## 编码规范

- **Python**：3.12，标准库 + `curl_cffi`；单文件单职责；日志用 `logging` / `log()`，别 `print` 到
  stdout 混进 JSON。
- **Node**：ESM，只用内置模块；脚本必须能 `node scripts/xxx.mjs` 直接跑，参数走 `process.argv`。
- **命名**：`snake_case.py` / `kebab-case.mjs`；常量全大写放文件头。
- **落盘**：一切"请求 → 结论"必须落盘：`notes/<procedure>.md` 写清入参、返回码、扣减行为、结论一句话。
- **时间**：统一 `Asia/Shanghai`，与站点 08:00 重置口径对齐。

## 测试策略

- **引擎单测**：`python -m pytest engine/tests`（无 pytest 则 `python -m unittest discover engine/tests`），
  重点覆盖 `memory.py`（锚点/摘要/抑制）与 `users.py`（账本/签到）。
- **站点构建**：`npm run build` 必须成功（能打开页面）。
- **冒烟**：`/health`、`/site/pool`、`/site/chat`（判成功看 `event: complete`，见常见坑 #17）。
- **TDD 优先**：改引擎核心逻辑（记忆/账本/锁）先补单测。

## Git 提交规范

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` Bug 修复
- `refactor:` 重构
- `chore:` 构建/依赖/配置
- `docs:` 文档
- `perf:` 性能

提交信息：`type: 中文一句话`，正文写清 **改了什么 / 为什么 / 怎么验的**，末尾 `Refs: notes/NNN`。

## Claude 工作要求（核心）

1. **每次任务必须新建分支，且从 `main` 切出**（最高优先级）：
   - 开工第一件事：`git checkout -b <type>/<slug>`，**不许在 `main` 上改代码**；
   - 分支名 `feat/` `fix/` `chore/` `docs/` 前缀 + 短横线 slug；
   - **不要基于其它未合并分支再切新分支**（曾因此把别的分支提交一起合并进 main）；
   - 同一任务的后续提交都留在该分支；分支名与要点当天回写「分支台账」；
   - 例外：纯读取/调查（不改任何文件）不需要开分支。
2. **先读「站点事实」再动手**：任何结论必须能指回一次真实抓包，不许凭 bundle 猜。
3. **一次只推一条攻击面**（A→G 依次），跑穿再换。
4. **输出格式固定**：
   - 先给**变更计划**（要动 / 要新建的文件列表）；
   - 再给**完整代码或完整命令**（不许省略号、不许"自行补全"）；
   - 最后给**自检清单**（判据 + 回滚方式）。
5. **永远不要**：
   - 用截图/记忆替代 `trpc.jsonl` 原始记录；
   - 在没跑 `--dry-run` 的情况下批量写库、批量注册、批量发请求；
   - 把并发从 8 直接拉到 200（先 8 → 12 → 16，每次看 429/403 曲线）；
   - 改动 `captures/` 里的原始 flow；
   - 引入未在「工具与运行环境」列出的运行时或依赖；
   - **先部署后提交**（顺序必须是：提交 → 推送 → 部署，见「提交前质量门禁」）。

---

## 站点事实（2026-11-06 实测，代理 7897 出口 SG）

| 项 | 值 |
|---|---|
| 入口 | `http://dzmm.ai/` → 301 → `https://www.dzmm.ai/` |
| 边缘 | Cloudflare（`cf-ray ...-SIN`、`server: cloudflare`、`alt-svc h3`、HSTS 86400） |
| 前端 | Expo / React Native Web，单入口 `/assets/Dq4p9iNB.js`（≈1.78 MB），资源 `assetora.net` |
| 构建标识 | 响应头 `x-dzmm-build: 90a5ceae8974d04e1bf6bd5819ebccc0f99ffb3f`、`x-dzmm-built-at: 1794384986591`（11-13 更新；旧值 `38d68fa8…` / `1793962151244`） |
| API | tRPC over `/api/trpc`（superjson transformer，batch 用逗号拼 procedure） |
| 认证 | `/api/auth/token`（30 min staleTime）、`/api/auth/sign-in-code/v2`（GET 取二维码 / DELETE 解除）、`/api/auth/sign-in-code/reset`、`.../reset/tg-code` |
| 数据层 | Supabase `https://rls.cheggpt.com`（`EXPO_PUBLIC_SUPABASE_URL`）；图片/存储 `https://pxlorbit.com`（`EXPO_PUBLIC_PUBLIC_IMAGE_HOST`） |
| 额度 procedure | `chat.getQuotas`、`credits.getBalance`；预取清单含 `chat.listAll`、`chat.getSettings`、`preset.list`、`notification.*`、`user.relations.*` |
| 自定义头 | `x-dzmm-client`、`x-dzmm-client-refresh`、`x-dzmm-request-id`、`x-dzmm-locale`、`x-dzmm-captcha-required`、`x-dzmm-captcha-location`、`x-dzmm-build`、`x-dzmm-built-at` |
| Cookie | `chosen_language`、`_geo`；登录态另有签名 cookie |
| 埋点 | PostHog（bundle 内 `quota_limited` / feature flags） |
| 风控 | 418 `{"error":"captcha_required","location":"/__captcha/"}`；响应头 `x-request-id`、`Vary: Cookie, Authorization` |
| 注册风控 | 两段式：先 `428 {"code":"human_check_required"}` 过 `/__captcha/`；过闸后服务端二次裁决，失败 `429 REGISTER_RISK_BLOCKED`（带请求 ID）。**11-14 深夜修正：额度单位是「域名」不是「IP」——每个根域每天约 2–3 个**。WARP 每次重注册给新 IPv6（无限免费 IP），但换 IP 不换域名额度；`fldubai.com` 3 个后、`aetouban.cn` 2–3 个后、`jjlnlnl.dpdns.org` 3 个后均 429。aetouban.cn 没有全局封（WARP 上通过 b051–b053）。一次性域（Guerrilla）走另一档「该邮箱暂不支持注册」黑名单。Cloudflare 子域收件不通（三种方式实测 Missing email）。详见 notes/034、notes/037 |
| 注册邮件 | 验证码邮件发件人 `noreply@send.dianzimeimo.com`（**不是** dzmm 域），标题「你的魔法链接」，基本进 **Gmail 垃圾邮件**；IMAP 按 `TO <别名>` 搜不到，要 `FROM dianzimeimo` 取最新一条。Gmail 加号别名会被规范化成主邮箱 → 变成「登录已有账号」而非注册 |
| 出口依赖 | 同一站点换节点即可脱离 418：`🇯🇵 日本-hy2 02` 出口正常返回 401；新加坡出口已被锁（见 notes/002） |
| 生成接口 | `POST /api/chat`（SSE）：`{operation, chatId, cardId, chatSettings{model,maxTokens,...}, prompts[], content, parentGenerationId}`，**model / maxTokens 完全由客户端指定** |
| 计费 | **预扣式**：每条先预扣 3.2 credit，不足则 SSE 返 `{"classification":"upgrade_needed","upgradeReason":"credit"}` 且不扣费；完成后按实际 token 结算（≈2.1/条）。quotas 全程不变。预扣原子，**并发无法超发** |
| 会话锁 | 同一 chatId 并发生成 → `409 该对话正在生成中`；`chat.createByCard` 按 cardId 去重 |
| 浏览器头 | `/api/*` POST 缺 `referer`/`sec-fetch-*` 直接 `403 Forbidden`（纯文本） |

### 额度语义（站内文案原文归纳，改文案即为线上变更信号）

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

### tRPC 错误信封（实测）

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

## 代理与抓包链路（固定，不许换）

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

### 一键起飞

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
抓 App 端时加 `--set ignore_hosts=''`，并额外过 SSL pinning（见攻击面 E）。

### 出口节点切换（必备，418 跟节点走）

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

## 攻击面清单（按 ROI 排序，逐个跑穿再谈别的）

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
骨架见「标准工作流」的 `burst.py`，**起始并发 8、步进 4**，先小后大，记录每次返回的
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

- **路线 A（推荐，已验证）**：换出口节点（见「出口节点切换」），日本-hy2 02 干净，直接 401。
- **路线 B（备用）**：`scripts/solve_gate.py` 全流程已通（取题→取图→求解→提交），
  `gate_vision.py` 已能分割通道并生成轨迹，**终点评分尚未对齐**（提交回「轨迹没有通过」）。
  题目语义与色值表见 `notes/002-gate-and-exit-nodes.md` §2。

---

## 工具与运行环境（真实路径，别写 `python` / `node`）

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

## 标准工作流（capture → diff → replay → patch → verify，每步必须有产出物）

### ① capture — 抓全
`scripts/capture.py`（mitmproxy addon）把 `/api/trpc`、`/api/auth` 落成 `captures/<时间>/trpc.jsonl`。
**原始 `.flow` 同时保留，任何分析都基于它，不许只看截图。**

### ② diff — 定位判定点
把一次"正常扣费"的前后两次 `chat.getQuotas` + `credits.getBalance` 拉出来对比，
列成表：`procedure | 入参 | 返回 quota | 返回 credits | 扣减额`。
**扣减发生在哪个响应之后，判定点就在它前面的那个 handler。**

### ③ replay — 单发复现
`scripts/replay.mjs`（node 内置 fetch）/ `scripts/replay_cffi.py`（Cloudflare 判 TLS 指纹时用
`impersonate="chrome"`）。Node 直连显式给代理：`$env:NODE_USE_ENV_PROXY='1'; $env:HTTPS_PROXY='http://127.0.0.1:7897'`。

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
`scripts/burst.py`（`curl_cffi.AsyncSession`），参数 `<path> <cookie> <bodyFile> <n> <conc>`，
起始并发 8 逐级加，结果落 `out/burst.jsonl`。

---

## 硬规则

- **占位符先行**：目标写 `TARGET`、路径写 `PATH`、cookie 写 `COOKIE`、procedure 写 `PROC`，
  真实值只放 `notes/` 与本地 `.env`，**不进 git、不进 CLAUDE.md**。
- **速率**：单账号 ≤ 2 rps；并发实验单轮 ≤ 16 并发、≤ 30 s，轮间冷却 ≥ 60 s。
- **失败即停**：出现 403 + `cf-mitigated`、`x-dzmm-captcha-required: 1`、或连续 5 次 429，
  立刻停手，切节点/换 profile/降速，别硬顶。
- **只动自己的账号与自己的客户端**；服务端数据只读，PATCH 只在自己的行上试，试完还原。
- **可回滚**：任何改包/改 claims 前先存原值与还原命令到 `patches/<日期>.md`。

---

## 部署与运维（提交 · 推送 · 部署）

> 这条流程是踩出来的：SSH 用错密钥、scp 被 `[id]` 当通配符、构建用完不重启、
> 两份克隆共用 `%LOCALAPPDATA%\dzmm-site` 互相覆盖。**顺序：提交 → 推送 → 部署。**

### 事实

| 项 | 值 |
|---|---|
| 服务器 | `ubuntu@43.135.10.175`（OpenSSH 8.9p1 Ubuntu） |
| 私钥 | `~/.ssh/wavemod_server`（**不是** `lan_key.pem`，那台机器上没有） |
| 站点目录 | `/opt/lan/site`（**不是 git 仓库**，靠 scp 单推） |
| 引擎目录 | `/opt/lan/engine`（`server.py` / `memory.py` / `users.py`） |
| 服务 | `lan-site`（next start -p 3100）、`lan-engine`（python server.py --port 8787） |
| 卡库 | `/opt/lan/cards.json`（`CARDS_FILE` 环境变量指向它） |
| 缓存 | `/opt/lan/imgcache` |
| 出口代理 | `mihomo.service`：mixed-port `127.0.0.1:7890`、API `127.0.0.1:9090`（config `/opt/lan/mihomo/config.yaml`，global 模式）；`lan-engine` 有 `direct-egress.conf` drop-in 可切直连 |
| 公网入口 | `https://43-135-10-175.sslip.io`，口令 `lan-4006` |

> 服务器只认 publickey：`lan_key.pem` 与本机 `wavemod_hk` 都被拒，
> **只有 `wavemod_server` 能登**。不要再换用户名试。

### 提交

```powershell
git config user.name  "qsy123-coder"          # 新克隆必做一次
git config user.email "qsy123-coder@users.noreply.github.com"

git checkout main && git checkout -b <type>/<slug>   # 从 main 切，不许在 main 上改

# 提交前硬检查（路径匹配，别用子串）
git ls-files | ForEach-Object {
  if ($_ -match 'accounts\.json$|accounts\.md$|\.env$|\.(pem|key|p12|pfx)$|^captures/|^out/|node_modules/') { "!! $_" }
}
```

### 推送

```powershell
git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push -u origin <branch>
```

> `schannel: failed to receive handshake` = TLS 后端问题，**不是节点坏了**，加 `-c http.sslBackend=openssl` 直接过。

### 部署（scp 单推 + 远端构建）

**① 文件名去特殊字符**：`site/app/card/[id]/page.js` 的 `[id]` 会被 scp 当 glob 展开，
先 `Copy-Item -LiteralPath ... "$tmp\card_page.js"` 绕开。

**② 传 + 核对字节**：`scp` 后一定 `wc -c` 对本地大小（scp 会静默成功但传旧文件）。

**③ 落位写成 `.sh` 再 `bash`**：PowerShell 会吃掉 `'` `"` `<` `$(`，导致 `unexpected EOF`。
先 `cp` 备份到 `/opt/lan/backup-<时间戳>/`。

**④ 构建 + 重启**：`cd /opt/lan/site && npm run build && sudo systemctl restart lan-site`；
**改了 `engine/server.py` 要单独 `sudo systemctl restart lan-engine`**。
`Can't resolve 'sharp'` 是既有告警，`api/img` 有回退路径，不影响。

**⑤ 验收（缺一不可）**：

```bash
C="lg_pass=lan-4006"; B="http://127.0.0.1:3100"
for p in "/" "/card/430690" "/chat?card=430690" "/enter" "/about"; do
  printf "  %-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' -b "$C" "$B$p")"
done
curl -s http://127.0.0.1:8787/health
curl -s http://127.0.0.1:8787/site/pool | head -c 120
```

### 回滚

```bash
ls -dt /opt/lan/backup-* | head -1        # 服务器：找最近备份还原后重建
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
```powershell
git checkout -- <file>; git revert <sha> --no-edit   # 本机
```

### 高频坑

| 现象 | 原因 | 解法 |
|---|---|---|
| `Permission denied (publickey)` | 用了 `lan_key.pem` 或 `wavemod_hk` | 只用 `~/.ssh/wavemod_server` |
| `schannel: failed to receive handshake` | TLS 后端 | 加 `-c http.sslBackend=openssl` |
| scp 成功但字节数没变 | 目标未覆盖 | 换新文件名重传，`wc -c` 核对 |
| `unexpected EOF` / `RedirectionNotSupported` | PowerShell 吃了引号 | 写 `.sh` 再 `bash` |
| 改完页面没变化 | 没 build 或没重启 | `npm run build && systemctl restart lan-site` |
| 改完引擎没变化 | 没重启引擎 | `sudo systemctl restart lan-engine` |
| 两份工程改动互相覆盖 | 共用 `%LOCALAPPDATA%\dzmm-site` | 构建前清源码目录，或各自独立 `$RT` |

---

## 验收判据表

| 目标 | 观测点 | 通过标准 | 失败即改 |
|---|---|---|---|
| 每日额度 | `chat.getQuotas` | 20 次调用 remaining 不减 | 判定点在服务端 → 转 C/D |
| 积分余额 | `credits.getBalance` | 账本无扣减行 | RLS 可写 → 走 E |
| 报表导出 | 导出接口 `remaining/quota` | 超 `quota` 仍 200 出文件 | 计数键在 IP → 走 G |
| 六连抽 | batch `count` | 传 60 也照抽 | 服务端 cap → 走 B/D |
| VIP 权限 | `tier` 展示 + 高级模型可用 | 高级模型返回非 402/403 | claims 要验签 → 走 F |

---

## 常见坑（踩过的，别再踩）

1. **Cloudflare 403 / 挑战页**：Node 默认 TLS 指纹太假，换 `curl_cffi` `impersonate="chrome"`；H2 优先，别强制 HTTP/1.1。
2. **tRPC batch 编码**：`/api/trpc/a,b?batch=1&input={"0":{...},"1":{...}}`，`input` 必须 URL 编码且是**对象**不是数组；superjson 日期写成 `{"$date":...}`。
3. **`x-dzmm-client` 会轮换**：登录后服务端下发新值（`x-dzmm-client-refresh`），旧值直接 401；每次抓包以最新为准。
4. **`x-dzmm-request-id` 复用**：可能被当幂等（好事），也可能被判重放（403）；两种结果都要记 `notes/`。
5. **滚动窗口不是整点**：Anime 绘图按"首次使用 +24h"，08:00 只是检查点；按整点等会白等一天。
6. **`_geo` cookie**：代理出口一变（SG↔HK），额度策略可能不同，切节点后重抓基线。
7. **mitmproxy 抓不到 SSE**：加 `--set stream_large_bodies=1k`，否则生成流被缓冲到结束才落 flow。
8. **bundle 里的 `quota` 字样多半是 i18n 文案**：`chat.getQuotas` / `credits.getBalance` 才是接口，别在文案里找逻辑。
9. **418 captcha 闸门**：无 UA 伪装、无 cookie 连打约 15 发 `/api/trpc` 就被锁，锁后真实接口也 418。枚举必须 ≤1 rps、先带 `chosen_language`/`_geo` cookie、锁了立刻换出口节点。
10. **cache key ≠ procedure 路径**：bundle 里 `xx.yy` 形式字符串大多是 React Query key，`/api/trpc/` 下 404；真实 procedure 名以抓包为准。
11. **418 跟出口节点走**：同一站点换节点就能从 418 变回 401；先切节点再排查。`curl (35) schannel` = 节点坏，直接换。
12. **`cardId` 必须与 chatId 属主卡片一致**，否则一律 `403`（空 body）；建会话必须换卡片
    （`createByCard` 按 cardId 去重），部分卡片会报 `404 对话数据异常`；可用卡片清单见 `notes/005` §4。
    （notes/004 把 403 归因于"新会话不放行"，已作废。）
13. **余额不足不是 402**：HTTP 仍是 200，SSE 里才抛 `upgrade_needed/credit`，且不扣费。
14. **仓库名是 `qsy123-coder/lan-ai`**（不是 `qsyyq-coder`，后者 404）。`git remote -v` 为准。
15. **`out/` 下的 `site_pass.txt` / `site_token.txt` 是每次生成的新随机值**。若前台进程是上一次跑起的
    （`start-site.ps1` 只判断端口是否在听），它的 `SITE_PASS` 还是旧值 → `/api/enter` 一律 `401 口令不对`、
    所有页面 `307 → /enter`。**排查口诀**：比对「口令文件 mtime」与「:3100 进程 StartTime」，前者更晚就杀进程重起。
16. **`/site/pool` 的 `credit` 读 `out/webstate.json`，不是 `accounts.json` 的 `last.credit`**。
    新机器上 `webstate.json` 不存在 → 全 `credit=0`、`usable=0`。必须先 `POST /refresh` 体检写状态，
    `GET /site/pool` 只读不体检。
17. **引擎 SSE 用 `event:` 行表类型，不是 JSON 里带 `"type"`**。本站判成功看 `event: complete` + 正文 + `credit`，
    **不是** `"type":"complete"`（那是上游 dzmm 原生 `/api/chat` 的格式，两套别混）。
18. **`/chat` 返回 307 不一定是登录拦截**。无 `card` 参数时 307 到 `/chat?card=<默认卡>` 是正常路由；
    `/` 无 cookie 的 307 才是跳 `/enter`。看 `location` 头再下结论。
19. **`/api/enter` 的字段名是 `p`**，不是 `pass`/`password`（`app/api/enter/route.js`）。
20. **可移植性**：`start.ps1` / `start-site.ps1` 里的 `$PY/$NODE/$PNPM` 三级探测
    （`$env:LAN_*` → DSH 运行时 → `Get-Command`）。脚本里的 ` 2>&1` 已全部删除（PowerShell 5.1 会把
    原生命令 stderr 当终止错误）。
21. **引擎 409「已有任务在跑」**：`/site/chat` 不能用全局 `RUN_LOCK` 串行化，否则第二个用户必 409。
    正确做法是「号×卡」会话锁 `chat_lock_for(name, card_id)` + 每请求独立 `stop_event`（见 `notes/020`）。
22. **连接层失败不能判账号死亡**：出口节点坏时 `createByCard` 抛 `SSLError`，旧逻辑把可用号全标
    `exhausted`（usable 2→0）。必须用 `is_network()` 分流，只提示节点异常，不标耗尽。

---

## 占位符表

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

## 回滚与清理

```powershell
Get-Process mitmdump,mitmweb -ErrorAction SilentlyContinue | Stop-Process -Force   # 停抓包
Remove-Item -Recurse -Force "$env:TEMP\dzmm-prof"                                  # 删独立 profile
certutil -delstore Root "mitmproxy"                                                # 还原证书
Remove-Item Env:HTTPS_PROXY,Env:HTTP_PROXY -ErrorAction SilentlyContinue            # 清环境变量
Remove-Item -Recurse -Force out\*,notes\*.tmp -ErrorAction SilentlyContinue         # 清产物（保留 flow）
```

---

## 会话开场检查（30 秒）

1. `Get-NetTCPConnection -State Listen | ? LocalPort -in 7897,8081` —— 代理与抓包都在听？
2. `curl.exe --proxy http://127.0.0.1:7897 -sS -o nul -w "%{http_code}" https://www.dzmm.ai/` —— 200？
3. `captures/` 里最新目录的 `trpc.jsonl` 是否是**本次**的（不是上周的）？
4. 当前要打的是 A–H 哪一条？上一轮的结论写在 `notes/` 哪一页？
四项齐了再开工。

---

## Web 控制台 & 同款站「澜」

### Web 控制台（账号池可视化，:3000）

一条提示词 → 自动跨号连续生成 → 打光全部 credit。

| 组件 | 路径 | 说明 |
|---|---|---|
| 引擎 | `engine/server.py` | stdlib HTTPServer + curl_cffi，`:8787` |
| 界面 | `web/` | Next.js 15 App Router，`:3000` |
| 启停 | `start.ps1` / `stop.ps1` | 首次自动同步源码 → 本地运行副本、装依赖、构建 |
| 运行态 | `out/webstate.json` | 每号 credit / chat_id / card_id / dead_cards / exhausted |
| 结果 | `out/web_results.jsonl` | 每次生成的 prompt / 账号 / 正文 / 扣费 |

轮换：体检 → 按 **credit 升序**挑号 → `chat.createByCard` 扫 `CARDS`（坏的自动拉黑）→
`POST /api/chat` SSE 流式 → `user.getMe` 结算 → 余额见底或 `upgrade_needed/credit` 即切号。
`/api/trpc` 与 `/api/chat` 缺 `sec-fetch-dest/mode/site` + `accept` 时一律 `403`；`headers_of()` 已固化，别删。
构建副本放 `%LOCALAPPDATA%\dzmm-web`（UNC 共享无法构建），`web/` 只存源码。

### 同款站「澜」（:3100）

| 组件 | 路径 | 说明 |
|---|---|---|
| 前台 | `site/` | Next.js 15，`:3100`；首页 / 卡详情 / 聊天 / 我的 / 会员 / 关于 |
| 启动 | `start-site.ps1` | 同步 → 构建 → 起引擎(:8787) + 前台(:3100) |
| 卡片库 | `captures/site/cards.json` | `scripts/seed_cards.py` 从榜单抓 `card.getById` |
| 引擎接口 | `POST /site/chat` | `{cardId,prompt,model,maxTokens}` → 挑号→createByCard→SSE→结算 |

`ensure_chat_for_card()` 按「号 × 卡」缓存 chatId（`webstate.json: site_chats`），卡不可用/余额不足/401 自动换号；
会话与消息存浏览器 localStorage。**长期记忆**（`engine/memory.py`）：上游 `/api/chat` 只认 `content`，
记忆走 `memlib.content_prefix()` 拼进当前消息（`content = 长期设定 + 前情摘要 + 执行要求 + 用户正文`），
锚点 `pinned` + 摘要 `summary` 落 `out/memory/<cardId>.json`，前端记忆面板走 `/api/memory`。

---

## MCP 服务

- **rea**（逆向工具集）：反编译 / 字符串 / 抓包 / 浏览器页面 / 固件等分析。优先用能直接回答问题的工具，
  需要时才探索目标；结果带 Evidence 与 coverage。
- 第三方库 API 用法不确定时，优先查官方文档/仓库，别凭记忆写。

---

## 可用技能（Skills）

遇到相关场景用 `/skill-name` 调用（列表以 harness 提供的为准），常用：

- `/reverse-engineer-anything` — 逆向原生/托管/Electron/固件/浏览器目标（配合 rea）。
- `/code-review` — 提交前 diff 级代码审查（correctness + 质量）。
- `/security-review` — 涉及认证/支付等敏感逻辑时。
- `/product-requirements` — 新功能需求不清晰、要先出 PRD 时。
- `/run` — 启动本项目 app（`start-site.ps1` / `start.ps1`）验证改动。
- `/simplify` — 变更后的复用/简化/效率清理。
- `/update-config` / `/fewer-permission-prompts` — harness 配置与权限。

---

## 本机网络与代理（必须知道）

- **Claude 必须自己加代理，不要问用户、不要让用户去开系统代理。** 本机一直有可用的
  `127.0.0.1:7897`（Clash 混合端口）。任何访问 GitHub / 外网的动作（`git push/pull`、`curl`、
  `npm install`、`node` 里的 `fetch`、网页抓取）**默认直接带上代理**，这是既定环境。
- Node 的 `fetch` **不认** `HTTPS_PROXY`，要额外 `$env:NODE_USE_ENV_PROXY='1'`。
- 代理 `502` / `schannel: failed to receive handshake` ⇒ **节点挂了，不是网络断了**：
  `powershell -File scripts\clash.ps1 -Best` 切节点后重试，不要停下来问用户。
- git push 若 `schannel` 握手失败，加 `-c http.sslBackend=openssl`。
- 直连国内站正常、GitHub 超时/握手失败 ⇒ 先怀疑节点，切完再重试。

---

## 质量检查策略（重要）

- **提交前**：跑必要门禁（引擎 `py_compile` / 单测 + 站点 `npm run build`），有 error 必须修复。
- **每次任务结束后**：只做必要检查——确认 `npm run build` 通过、`py_compile` 通过即可（保证能开/能跑）。
- **开发过程中**：改完代码跑一次对应构建/编译验证即可，不要每改一个文件就跑全量。
- **部署后**：按「部署 ⑤ 验收」的 curl 清单确认。

## 提交前质量门禁（强制）

**每次提交/部署前必须执行，缺一不可：**

1. **引擎**：`python -m py_compile engine/server.py engine/memory.py engine/users.py` 零错误；
   涉及记忆/账本逻辑改动跑 `python -m pytest engine/tests`。
2. **站点**：`cd site && npm run build` 必须成功（改前端时）。
3. **提交前硬检查**：`git ls-files` 里不含 `accounts.json` / `.env` / `*.pem` / `captures/` / `out/`。
4. **部署后验收**：`/health` 200 + 关键页面 200 + `/site/chat` 出 `event: complete`。

**工作流**：

```
代码 → 自检(编译/构建/单测) → 自检清单 → Commit → Push → 部署(scp+重启) → 验收(curl) → 合并 main
```

**Claude 执行规范**：

- **已授权自行 commit / push / 部署**（用户 2026-11-15 明确要求按此工作流执行）：自检通过后直接提交、推送、部署，
  不必每次先问；只有用户明说「先别提交 / 先别部署」，或涉及删数据、改库、改 `.env.production`、`force-push`
  这类不可逆操作时，才停下来确认。
- **合并 main**：分支自检通过后可合并；`main` 保持可部署状态。合并前确认工作区干净、无残留未提交改动。
- **顺序不可颠倒**：必须先提交（代码进 git）再部署（scp 到服务器），不允许「先部署后补提交」。
- **失败即查**：构建/部署失败先看日志、修复、重跑，直到通过再报「完成」。

---

## 分支台账（每次任务追加一行）

| 日期 | 分支 | 任务 | 状态 |
|---|---|---|---|
| 2026-11-13 | `feat/mobile-drawers` | 手机端三抽屉 + 去渐变 + 主题切换 | 开发中 |
| 2026-11-13 | `chore/branch-policy` | 把「每次任务新建分支」写进 claude.md | 开发中 |
| 2026-11-13 | `fix/memory-full-history` | 前端去 head/tail + 锚点精度 + 50 轮 E2E | 已完成（50 轮 E2E 通过） |
| 2026-11-13 | `docs/e2e-50-acceptance` | 回填 50 轮验收结果 + 模型/降级验证 + PRD 勾选 | 已完成 |
| 2026-11-13 | `feat/pool-expand-imap` | 号池扩容：IMAP 代理隧道 + /__captcha/ 等待 + no_code 待补落盘；b020→b029 | 已入池，待合并 |
| 2026-11-14 | `feat/pool-expand-imap` | 注册风控摸清：域名标记 / 单 IP 额度 / 出口矩阵 / 验证码邮件；b047 入池 | 已入池并同步线上 |
| 2026-11-14 | `feat/exit-pool-farm` | 扩号产线：WARP IP 工厂 + DigitalPlat/Cloudflare 域名工厂；b048–b055 入池（notes/037） | 已入池并同步线上 |
| 2026-11-13 | `fix/sug-replies` | 建议回复消失：补格式要求 + 未命中时短生成兜底（notes/018） | 已部署生产 |
| 2026-11-13 | `feat/me-and-pricing` | 我的 + 会员与价格（notes/008 §2.4/§5）；消息 tab 接到 /chat | 已完成 |
| 2026-11-13 | `feat/account-ledger` | 邮箱登录 + 用户积分账本（notes/008 §7）；注册 100、生成扣 2.1、演示充值 | 已完成 |
| 2026-11-13 | `feat/checkin-vip` | 每日签到 + VIP 等级（notes/008 §7 运营） | 已完成 |
| 2026-11-15 | `fix/memory-delete` | 记忆删除不生效：删会话清记忆 + 锚点抑制防复活 + 摘要拒答降级 + seeds 删除墓碑 | 已完成（41 单测过） |
| 2026-11-15 | `fix/chat-409-concurrency` | 线上 409：全局 RUN_LOCK → 「号×卡」会话锁 + 每请求 stop_event；is_network 防误判耗尽（从 main 切） | 已推送 |
| 2026-11-15 | `fix/chat-409-live` | 给线上 62196 版打 409 会话锁（保留记忆/建议/direct-egress） | 已部署并验证 |
| 2026-11-15 | `docs/claude-md-wave-workflow` | 按 WaveMod 工程规范重写 CLAUDE.md（技术栈/架构原则/测试/Git规范/质量门禁/工作流/授权） | 进行中 |
| 2026-11-15 | `feat/category-page` | 分类页：按 dzmm `category.list` 复刻 21 个分类 + 首页 `?cat=` 筛选 + 封面代理（notes/038） | 已上线 |
| 2026-11-15 | `feat/forum` | 广场/论坛：三栏 + 发帖/评论/赞踩 + 分区/标签/搜索（notes/039） | 已上线 |
| 2026-11-15 | `feat/signin-otp` | 登录逆向 + 邮箱 OTP 注册/重置 + `/sign-in` + Nav 登录入口（notes/040/041） | 已上线（生产 UI 点测，备份 backup-signin-20261115220642） |
| 2026-11-15 | `feat/sms-login` | 短信服务抽象（mock/webhook/twilio/smsbao）+ 手机号 OTP 登录/注册 + 手机号 tab（notes/042/043） | 已上线（mock provider；生产 UI 点测；备份 backup-sms-20261115230726） |
| 2026-11-16 | `feat/import-farm-accounts` | 农场账号包入池：`--template-from` / `--refresh-existing`；+109 新号、40 个 d 号换过期 cookie，池 53→202，线上同步 202（notes/044） | 已上线 |
| 2026-11-17 | `feat/card-pool-expand` | 卡片池扩容：6 个 feed 深翻页 + 首页 120 张/页分页；838→25723 张，0 次 418（notes/045） | 已上线 |
| 2026-11-17 | `feat/engine-card-pool` | 引擎建会话卡池改读 cards.json：热度 70% + 最新 30%，上限 80，11 张兜底（notes/046） | 待部署 |
| 2026-11-17 | `fix/summary-nsfw-pulse` | 摘要模型 Surge→Pulse 128K + 拒答/续写识别 + 摘要按会话落盘；清卡 426322 脏摘要（notes/047） | 已上线（备份 backup-summary-20261117） |
| 2026-11-17 | `fix/summary-retry-and-refresh` | 摘要失败不推进水位（下一轮重试）+ 前端 complete 后 4s 刷记忆面板（notes/048） | 开发中 |

> 规矩：分支从 `main` 切出；质量门禁通过后可自行 commit / push / 部署 / 合并（见上「Claude 执行规范」）。
> 不可逆操作（删数据 / 改库 / `.env.production` / force-push）前先确认。
