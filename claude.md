# CLAUDE.md — lan-ai（澜）项目规范与上下文

> 本文件是本工作区的**唯一事实来源**。每次会话先读 §0 速览，再按任务跳读对应章节。
> 与本文件冲突的旧笔记一律作废；新发现的事实当天回写到对应章节，并在 §20 记一行。
> `新建文本文档.txt` 属于另一个项目（WaveMod），与本项目无关，不要混用。

---

## 0. 速览

「澜」（lan-ai）是一个**多账号额度池驱动的 AI 角色对话站**。仓库里跑着三件东西：

| 组件 | 路径 | 端口 | 作用 |
|---|---|---|---|
| 引擎 | `engine/server.py` | `:8787` | stdlib `HTTPServer` + `curl_cffi`；账号池轮换、调上游生成、SSE 结算 |
| 控制台 | `web/` | `:3000` | Next.js 15 自用后台：账号池可视化、一条提示词打穿全池 credit |
| 前台 | `site/` | `:3100` | Next.js 15「澜」站点：首页 / `/card/[id]` / `/chat` / `/about` |

数据流：

```
浏览器 ──> site(:3100, /api/chat) ──(x-site-token)──> engine(:8787, /site/chat)
                                                        │ 挑号 → chat.createByCard → POST /api/chat(SSE) → user.getMe 结算
                                                        └─> 上游 www.dzmm.ai（经 Clash :7897）
```

仓库只存**代码与文档**。`accounts.json` / `captures/` / `out/` / `patches/` / 证书全部在 `.gitignore` 内，不进版本库。

### 文档地图（各司其职，不要重复抄）

| 文件 | 负责 |
|---|---|
| `claude.md`（本文件） | 事实来源 + 作业规范 + 上游知识库 + 排障 |
| `README.md` | 对外简介、启动命令、接口速览 |
| `DEV-GUIDE.md` | 提交前执行清单（部署三步、凭证硬检查、回滚命令） |
| `design.md` | 液态玻璃视觉规范 |
| `docs/context-memory-prd.md` | 长期记忆功能 PRD（对应 `engine/memory.py`） |
| `notes/NNN.md` | 每一轮结论（真实现象 + 判据）；结论必须能指回一次真实抓包 |
| `deploy/` | 云服务器部署脚本（Docker / bare-metal / Caddy / nginx） |

> `notes/` 是历史记录，文中出现的 `claude.md §N` 指写入当时的编号；与本文对不上时以内容为准，不改写旧笔记。

---

## 1. 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前台 `site/` | Next.js 15 App Router，React 19，pnpm | 首页 / 卡详情 / 聊天 / 关于 + `/api/{chat,pool,enter,memory,img}` |
| 控制台 `web/` | Next.js 15 App Router | 账号池可视化、跨号连续生成 |
| 引擎 `engine/server.py` | Python 3.12，stdlib `HTTPServer` + `curl_cffi` | 账号池轮换、上游生成、SSE 透传、结算 |
| 记忆 `engine/memory.py` | 纯标准库 | 锚点抽取 / 摘要降级 / 预算组装，落 `out/memory/<cardId>.json` |
| 脚本 `scripts/` | Python `.py` + Node ESM `.mjs`（只用内置模块） | 抓包 / 重放 / 并发 / 节点切换 / 开号 / 卡库 / 探测 |
| 代理 | Clash/mihomo 混合端口 `127.0.0.1:7897` + mitmproxy `:8081` | 系统代理关闭，所有出站显式走代理 |
| 运行副本 | `%LOCALAPPDATA%\dzmm-site` / `dzmm-web` | Next.js 无法在 UNC 共享上构建；`site/`/`web/` 只存源码 |
| 部署 | scp → `ubuntu@43.135.10.175:/opt/lan`，systemd | GitHub 存源码，服务器只负责构建和运行 |

---

## 2. 目录结构

```
lan-ai/
├── claude.md / README.md / DEV-GUIDE.md / design.md
├── start.ps1 / start-site.ps1 / stop.ps1
├── engine/
│   ├── server.py            # 引擎：账号池 + 上游调用 + SSE
│   ├── memory.py            # 长期记忆：锚点抽取 / 摘要降级 / 预算组装
│   └── tests/test_memory.py # Python 单测（纯标准库）
├── site/                    # 「澜」前台（Next.js 15 App Router）
│   ├── app/
│   │   ├── page.js / globals.css / layout.js
│   │   ├── card/[id]/page.js
│   │   ├── chat/page.js
│   │   ├── about/page.js
│   │   ├── enter/page.js
│   │   └── api/{chat,pool,enter,memory,img}/route.js
│   ├── components/{Card,HomeGrid,Nav,ChatClient,SessionList,ThemeToggle}.jsx
│   └── lib/{cards,gate}.js
├── web/                     # 控制台（Next.js 15）
├── scripts/                 # 见 §12.4，按用途分组
├── notes/                   # 001–013、031，每轮结论一页
├── docs/                    # PRD
├── deploy/                  # 云服务器部署（Docker / Caddy / nginx / systemd）
├── captures/                # 原始 .flow + trpc.jsonl（永不改，不入库）
├── patches/                 # 改包/改头/改 claims 的原值 + 还原命令
└── out/                     # 运行产物（不入库）
    ├── webstate.json        # 账号运行态：credit / chat_id / card_id / dead_cards / disabled / exhausted / site_chats
    ├── web_results.jsonl    # 每次生成：prompt / 账号 / 正文 / 扣费
    ├── memory/<cardId>.json # 每个角色的长期记忆
    ├── site_pass.txt / site_token.txt
    └── cookies/<name>.txt   # 每号 cookie 导出
```

---

## 3. 架构原则（必须严格遵守）

1. **唯一事实来源**：claude.md 是唯一事实来源；任何结论都必须能指回一次真实抓包（`captures/*/trpc.jsonl` 原始 `.flow`），不许凭 bundle 或记忆猜测。
2. **单文件单职责**：一个文件只做一件事；`scripts/` 每脚本单一用途，参数走 `process.argv`（Node）或 `sys.argv`（Python）。
3. **先抓包，再改代码**：对上游 dzmm.ai 的任何结论（额度判定、计费时序、协议存在性等），必须有抓包原始记录支撑。
4. **保持简单**：不引入 §4.1 未列出的运行时或依赖；不做“分析报告”，只交付 `capture / replay / patch / verify` 四件套。
5. **可回滚**：任何改包 / 改 headers / 改 claims 前，先把原值与还原命令写到 `patches/<日期>.md`。
6. **结构与性能分开提交**：前端首页结构改动和 CSS 性能改动永远分开 commit（曾因合并提交导致首页布局全丢）。

---

## 4. 编码规范

### 4.1 运行环境（真实路径，别写裸 `python` / `node`）

```powershell
$PY   = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"   # 3.12
$NODE = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$GIT  = "C:\Program Files\Git\cmd\git.exe"     # 2.56.1，全局已配代理 7897
```

- `curl.exe`：系统自带 `C:\WINDOWS\system32\curl.exe`。
- `mitmproxy 12.x` / `curl_cffi 0.17` 已装；装包走清华源 `-i https://pypi.tuna.tsinghua.edu.cn/simple`。
- mitm 启动入口：`…\python\Scripts\mitmdump.exe`（v12 起 `python -m mitmproxy.tools.main` 不适用）。
- 脚本里的 `$PY/$NODE/$PNPM` 已做三级探测：`$env:LAN_*` → DSH 运行时 → `Get-Command`。

### 4.2 代码规范

- **Python**：3.12，标准库 + `curl_cffi`；单文件单职责；日志用 `logging`，别 `print` 混进 JSON 流。
- **Node**：ESM，只用内置模块；必须能 `node scripts/xxx.mjs` 直接跑，参数走 `process.argv`；不引 npm 依赖。
- 命名：`snake_case.py` / `kebab-case.mjs`；常量全大写放文件头。
- 时间统一 `Asia/Shanghai`（与站点 08:00 重置口径对齐）。
- 所有「请求 → 结论」必须落盘到 `notes/<topic>.md`。

### 4.3 前端专项（事故换来的，改 UI 前必读）

1. **结构与性能分开提交**：为提速换 JSX 树 + 删 400 行 CSS，曾把首页布局整个搞丢。
2. **删 CSS 前先扫引用**：
   ```bash
   for c in $(grep -rho 'className="[a-zA-Z0-9_-]*"' site/components/*.jsx site/app/**/*.js | cut -d'"' -f2 | sort -u); do
     n=$(grep -c "\.$c" site/app/globals.css); [ "$n" = "0" ] && echo "未被引用: $c"
   done
   ```
3. **JSX 里写汉字**：`<span>{"\u89d2\u8272"}</span>` 或直接 `<span>角色</span>`。
   `\uXXXX` 写在 JSX 文本节点里会原样显示。
4. **改完 CSS 查括号平衡**：
   ```bash
   awk '{o+=gsub(/{/,"{"); c+=gsub(/}/,"}")} END{print "braces:", o, c}' site/app/globals.css
   ```
5. **构建通过 ≠ 验证通过**：起来后数结构块。
   ```bash
   curl -sS -H "cookie: lg_pass=$SITE_PASS" http://127.0.0.1:3100/ | grep -o 'home-grid\|zc-title\|zc-foot' | sort | uniq -c
   ```
6. **PowerShell 路径含 `[id]`** 必须 `-LiteralPath`，否则当通配符写出 0 字节文件。
7. **仅在 UNC / 网络共享路径（如 `Z:\project`）下**，`write`/`edit` 工具会报 `EISDIR`：改用 Python `shutil.copy2` 同步回仓库；本仓库在本地盘（`F:\Projects\lan-ai`）时不适用。

---

## 5. 测试策略

- **单元测试**：`engine/tests/test_memory.py`（`unittest`，纯标准库，不依赖 pytest）。每轮对 `engine/memory.py` 改动后跑一次：`& $PY -m unittest discover -s engine/tests -v`。
- **组件测试**：Next.js 前台没有 Playwright；改动后用 `curl` 冒烟 + §4.3 第 5 条结构块计数验证。
- **上游验收判据**（三条全过才算成）：
  1. 连续 N ≥ 20 次调用生成接口，每次 200 且有真实内容；
  2. 期间 `chat.getQuotas.remaining` 不下降（或下降后被回补）；
  3. `credits.getBalance` 账本无对应扣减行。
  只过 1、2 是前端假象，不算。

---

## 6. Git 提交规范

使用 Conventional Commits，`type` ∈ `feat / fix / chore / docs / refactor / perf`：

```
<type>: <中文一句话>

- 具体改了什么
- 为什么这么改
- 验证方式与结果

Refs: notes/NNN
```

- 仓库：`qsy123-coder/lan-ai`（不是 `qsyyq-coder`，后者 404）；以 `git remote -v` 为准。
- 提交前跑 `DEV-GUIDE.md` §5 的凭证硬检查（按**路径匹配**，别用子串，否则 `about/page.js` 会误伤 `out/`）。
- **不主动 `git commit` / `push`，除非明确要求**。
- 部署靠 `scp` 单向推送到服务器，不是 `git push`（见 §11）。

---

## 7. Claude 工作要求（核心）

1. **先读本文再动手**：任何结论必须能指回一次真实抓包，不许凭 bundle 猜。
2. **一次只推一条攻击面**（A–H 依次），跑穿再换；不要同时开五条线导致日志互相污染。
3. **输出格式固定**：
   - 先给**变更计划**（要动/要新建的文件列表）
   - 再给**完整代码或完整命令**（不许省略号、不许“自行补全”）
   - 最后给**自检清单**（判据 + 回滚方式）
4. **永远不要**：
   - 用截图/记忆替代 `trpc.jsonl` 原始记录；
   - 在没跑 `--dry-run` 的情况下批量写库、批量注册、批量发请求；
   - 把并发从 8 直接拉到 200（先 8 → 12 → 16，每次看 429/403 曲线）；
   - 改动 `captures/` 里的原始 flow；
   - 引入 §4.1 未列出的运行时或依赖。

---

## 8. 本机网络与代理（必须知道）

- **系统代理关闭**：Clash/mihomo 只开了混合端口 `127.0.0.1:7897`，git / npm / curl 默认**不会**走代理。访问 GitHub 等外网时显式指定代理。
- **抓包链路**：
  ```
  Chrome(--proxy-server=127.0.0.1:8081)
      └─> mitmproxy :8081 (upstream:http://127.0.0.1:7897)
              └─> Clash :7897 ─> 节点 ─> www.dzmm.ai (Cloudflare)
  ```
- **Node 的 `fetch` 不认 `HTTPS_PROXY`**，需额外设 `NODE_USE_ENV_PROXY=1`（Node 22/26 实测可用）；`vercel` CLI 即使设了也仍 `fetch failed`，直接用 curl 调 API。
- **节点挂了的表现**：端口还在听但返回 `502` / `schannel: failed to receive handshake` / Cloudflare `403 cf-mitigated`。**先切节点再重试，不要对着同一个节点死磕**。
  ```powershell
  powershell -File scripts\clash.ps1 -Status | -List | -Best
  powershell -File scripts\clash.ps1 -Set "🇯🇵 日本-hy2 02"
  ```
- **抓包命令**：
  ```powershell
  & $PY -m pip install -U mitmproxy curl_cffi
  & $PY -m mitmproxy.tools.main mitmweb --listen-port 8081 `
    --mode upstream:http://127.0.0.1:7897 --set connection_strategy=lazy `
    --set upstream_cert=false -s scripts\capture.py --web-port 8666
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    --proxy-server="http://127.0.0.1:8081" --user-data-dir="$env:TEMP\dzmm-prof" `
    --ignore-certificate-errors --no-first-run "https://www.dzmm.ai/"
  ```
- 证书：浏览器访问 `http://mitm.it` 下 Windows 证书 → 导入「受信任的根证书颁发机构」。抓 App 端加 `--set ignore_hosts=''`，并过 SSL pinning。抓 SSE 加 `--set stream_large_bodies=1k`。
- 切完节点必须验证一发：`401 UNAUTHORIZED` = 干净；`418 captcha_required` = 还在闸门；`curl (35) schannel` = 节点坏，换下一个。

---

## 9. 质量检查策略（提交前门禁）

| 时机 | 检查项 | 说明 |
|---|---|---|
| 提交前（Next 站） | `npm run build`（`web/`、`site/`）必须通过 | 只看 build 通过不算验证，还要 §4.3 第 5 条结构块计数 |
| 提交前（Python） | `& $PY -m unittest discover -s engine/tests -v` 零失败 | `engine/memory.py` 改动后必跑 |
| 提交前（凭证） | `DEV-GUIDE.md` §5 路径匹配检查 | 防止 `accounts.json` / `*.env` / `cookies/` / `captures/` 误入库 |
| 任务结束后 | 只做必要检查：确认 `npm run build` 通过（保证网站能打开） | 不要每次都跑全量检查，浪费时间 |
| 开发中 | 改了代码后跑一次对应构建/单测即可 | 不要每改一个文件就跑全量检查 |

**工作流（经用户确认后）**：代码 → 构建/单测 → 自检清单 → Commit → Push → 部署（scp 三步 + 校验 stat） → 告知用户完成。未确认时只做到「自检清单」，不 commit / 不 push / 不部署。

---

## 10. 常用命令

下列命令沿用 §4.1 的 `$PY`。

```powershell
# 启停
powershell -File .\start.ps1        # 控制台：引擎 8787 + web 3000
powershell -File .\start-site.ps1   # 「澜」：引擎 8787 + site 3100（-Port -EnginePort -Rebuild -NoOpen -Tunnel）
powershell -File .\stop.ps1         # 全停

# 只起引擎（调试接口 / 手动重放）
& $PY engine\server.py --port 8787

# 抓包命令见 §8

# 节点切换（418 跟节点走）
powershell -File scripts\clash.ps1 -Status
powershell -File scripts\clash.ps1 -List
powershell -File scripts\clash.ps1 -Set "🇯🇵 日本-hy2 02"
powershell -File scripts\clash.ps1 -Best

# 终端直连（不经 mitm）
$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY=$env:HTTPS_PROXY
curl.exe --proxy http://127.0.0.1:7897 -sS -D - "https://www.dzmm.ai/" -o nul
```

---

## 11. 部署

**GitHub 存源码，服务器只负责构建和跑；两边不互相同步，靠 `scp` 单向推送。**

```
本地 git 仓库 ──scp──> ubuntu@43.135.10.175:/opt/lan/site   （构建与运行副本）
                                     /opt/lan/engine
```

三步（缺一步等于没部署，构建几分钟，用后台任务）：

```powershell
$k = "C:\Users\dsh\lan_key.pem"
$S = "-i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes"

# 1) 传
& scp $S.Split(' ') "F:\Projects\lan-ai\site\app\globals.css" ubuntu@43.135.10.175:/tmp/x.css

# 2) 落位 + 校验（scp 会静默失败，必须看 stat）
& ssh -i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes ubuntu@43.135.10.175 `
   "cp /tmp/x.css /opt/lan/site/app/globals.css && stat -c'%s' /opt/lan/site/app/globals.css"

# 3) 构建 + 重启
& ssh -i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes ubuntu@43.135.10.175 `
   "cd /opt/lan/site && npm run build 2>&1 | tail -4 && sudo systemctl restart lan-site"
```

- `lan-site.service` → `/opt/lan/site`，`next start -p 3100`
- `lan-engine.service` → `/opt/lan/engine/server.py --port 8787`
- 引擎改动单独部署（不用 build，`$k/$S` 同上）：
  ```powershell
  & scp $S.Split(' ') "F:\Projects\lan-ai\engine\server.py" ubuntu@43.135.10.175:/opt/lan/engine/server.py
  & ssh -i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes ubuntu@43.135.10.175 `
     "sudo systemctl restart lan-engine && systemctl is-active lan-engine"
  ```
- 上面代码块里的 `2>&1` 是**远程 bash** 语法；本地 PowerShell 脚本里不要写 `2>&1`（见 §14.4）。
- **别动 `aetouban.cn`**（占 `:3000` 的 `ae-headline.service`）
- 其他部署形态见 `deploy/`（Docker Compose、bare-metal、Caddy、nginx）
- 换机器/换目录后 `accounts.json` 为空（`/site/pool` 返回 0）：先查项目根有没有 `accounts.json`，再把 `accounts.md` / `out/webstate.json` / `out/cookies/` 一起搬过来。桌面旧副本已归档为 `project_ARCHIVED_20261113`，运行数据只认本项目根这一份。

---

## 12. 组件说明

### 12.1 引擎 `engine/server.py`

| 路由 | 方法 | 说明 |
|---|---|---|
| `/health` | GET | 存活 + `root/proxy/running/models/cards` |
| `/site/chat` | POST | `{cardId,prompt,model,maxTokens,history?}` → SSE；服务端设了 `SITE_TOKEN` 时必须带 `x-site-token`；全局 `RUN_LOCK`，忙时 `409` |
| `/site/pool` | GET | `{total, usable, count, accounts:[{name,credit,usable}]}` |
| `/site/memory` | GET/POST | GET `?cardId=` → `{memory}`；POST `{cardId,pinned?,summary?,summarizedUpTo?,clear?}` |
| `/pool` | GET | `{accounts:[{name,note,credit,chatId,cardId,exhausted,disabled,error,uid}], models, stats, running}`（**不含 cookie**） |
| `/refresh` | POST | 体检：`{names?}`，逐号 `user.getMe` 回写 `webstate.json`（21 号约 66s） |
| `/account` | POST | `{name, enabled?, exhausted?, reset?, remove?}`；`enabled:false` = 手动停用 |
| `/run` | POST | 控制台跨号连续生成：`{prompt,model,maxTokens,rounds,minCredit,maxCount,maxPerAccount,mode,account,chatId}` |
| `/stop` | POST | 中止当前任务 |
| `/logs` / `/results` | GET | 日志 / 结果尾部 |

**轮换逻辑**：体检 → 按 credit 升序挑号 → `chat.createByCard` 扫 `CARDS`（坏的自动拉黑）→
SSE 生成 → `user.getMe` 结算 → 余额 < `MIN_PREPAY`（3.2）或 `upgrade_needed/credit` 即换号。
会话按「号 × 卡」缓存 chatId（`webstate.json: site_chats["site:<号>:<cardId>"]`），`ensure_chat_for_card()` 负责复用与失效重试。

**SSE 事件格式**（本站判据，别和上游混）：

```
event: account   {name, credit}
event: chat      {account, chatId, cardId}
event: memory    {pinned, summary, summarizedUpTo}
event: delta     {text}
event: note      {message}
event: log       {msg, level?}
event: switch    {from, reason, detail}
event: round     {index, rounds, chars}
event: stats     {generated, spent}
event: complete  {text, account, chatId, credit, creditBefore, usage...}
event: end       {reason, generated, spent, message?}
```

成功判定 = **`event: complete` + 正文 + `credit`**。上游 `/api/chat` 才是 JSON 里带
`"type":"complete"`，两套格式不同，不可混用。

最小调用示例（`SITE_TOKEN` 未设时可去掉该头）：

```bash
curl -N -X POST http://127.0.0.1:8787/site/chat \
  -H "content-type: application/json" \
  -H "x-site-token: $SITE_TOKEN" \
  -d '{"cardId":426322,"prompt":"你好","model":"x-apex-surge-0505","maxTokens":800}'
```

**多轮与记忆**（2026-11-13 关键修正）：**上游 `/api/chat` 只认 `content`（当前这条消息），
`prompts[]` 里的历史/记忆块会被完全忽略**——会话连续性靠上游按 `chatId` 存的服务端历史，
不是我们传的 `prompts`。所以长期记忆必须通过 `memlib.content_prefix(memory)` 拼进 `content`
才真正进入模型视野（实测：把设定塞进 `prompts` 时模型看不到，塞进 `content` 立刻生效）。
`build_body()` 现在 `content = content_prefix(memory) + prompt`。

`memlib.compose_prompts(history, memory, ...)` 仍保留并计算 head/memory/tail 预算，但其产物只进
`prompts[]`（对上游无效），仅作调试/回退用；`normalize_history()` 为 legacy。`memory.py` 负责：
锚点抽取（`pinned`，上限 20 条 / 单条 1500 字）、摘要降级（`summary` 600 字、`summarizedUpTo`）、
`content_prefix()`（把锚点+摘要压成 ≤900 字前缀并追加“执行要求”，禁止角色装凶/转移话题回避）。
纯标准库，可单测（`ContentPrefixTest`）。

### 12.2 「澜」前台 `site/`

| 路由 | 说明 |
|---|---|
| `/` | 首页：`.zc-head` / `.home-grid` 卡片流 |
| `/card/[id]` | 卡详情 |
| `/chat` | 对话页（无 `card` 参数时 307 到默认卡，属正常路由） |
| `/about` | 关于 |
| `/enter` | 口令页 |

| API | 转发 |
|---|---|
| `/api/chat` | `engine /site/chat`，原样透传 SSE（`text/event-stream`、`x-accel-buffering:no`） |
| `/api/pool` | `engine /site/pool`（引擎不在时返回 `offline:true` 空池） |
| `/api/memory` | `engine /site/memory`（GET/POST） |
| `/api/enter` | 校验 `p` → 写 `lg_pass` cookie；`SITE_PASS` 为空时形同放行（仅本地开发） |
| `/api/img` | 图片代理：仅 `pxlorbit.com` / `assetora.net`；回源用系统 `curl`（Node 直连该源站大响应会卡死，见 `notes/014`）；`w>0` 时走 Supabase `render/image` 缩图端点（320px webp ≈ 20–30KB）；磁盘缓存 `IMG_CACHE`（Windows 默认 `%LOCALAPPDATA%\lan-imgcache`，Linux `/opt/lan/imgcache`），键为 `sha1(v2\|w\|src)` |

`lib/cards.js` 读卡片库 `captures/site/cards.json`（1.4 MB，不入库；新机器用 `scripts/seed_*.py` 重新抓）。

### 12.3 控制台 `web/`

账号池管理 + 跨号连续生成。运行态读 `out/webstate.json`，结果落 `out/web_results.jsonl`。
`disabled`（手动停用，体检不覆盖）与 `exhausted`（体检按余额重算）是两个字段，UI 分开展示。

### 12.4 脚本分组 `scripts/`

| 用途 | 脚本 |
|---|---|
| 抓包 / 重放 / 并发 | `capture.py` `replay.mjs` `replay_cffi.py` `replay_chat.py` `burst.py` `diff-quota.py` `mine_captures.py` |
| 出口节点 | `clash.ps1` `teardown.py` |
| 验证闸门 | `gate_vision.py` `solve_gate.py` |
| 开号入池 | `pool.py` `new_account.py` `signup_email.py` `finish_signup.py` `batch_signup.py` `tg_signup.py` `tdata2session.py` `alias_pool.py` |
| 卡库 | `fetch_cards.py` `seed_cards.py` `seed_feed.py` `seed_hot.py` `seed_more.py` `seed_public.py` `merge_public_cards.py` `backfill_tags.py` `card_scan.py` `card_audit.py` `card_tags_audit.py` `compare_card_shapes.py` |
| 探测 / 逆向 | `probe_api.py` `probe_cards.py` `probe_core.py` `probe_home_min.py` `probe_trpc.py` `analyze_bundle.py` |
| 额度观测 | `credit_watch.py` |
| 截图 | `cdp.mjs` `shot.mjs` `shot-chat.mjs` `shot-full.mjs` `shot-mobile.mjs` `site_shots.mjs` |

---

## 13. 上游站点知识库（www.dzmm.ai）

> 本章是引擎实现依据：账号池、轮换、结算、卡库全部建立在这些实测结论上。
> 只在自己账号与自己的客户端上操作；服务端数据只读，PATCH 只碰自己的行并还原。

### 13.1 基础事实（2026-11-06 起实测）

| 项 | 值 |
|---|---|
| 入口 | `http://dzmm.ai/` → 301 → `https://www.dzmm.ai/` |
| 边缘 | Cloudflare（`cf-ray …-SIN`、`server: cloudflare`、`alt-svc h3`、HSTS 86400） |
| 前端 | Expo / React Native Web，单入口 `/assets/Dq4p9iNB.js`（≈1.78 MB），资源 `assetora.net` |
| 构建标识 | `x-dzmm-build: 38d68fa8…`、`x-dzmm-built-at: 1793962151244` |
| API | tRPC over `/api/trpc`（superjson；batch 用逗号拼 procedure） |
| 认证 | `/api/auth/token`（30 min staleTime）、`/api/auth/sign-in-code/v2`（GET 二维码 / DELETE 解除）、`…/reset`、`…/reset/tg-code` |
| 数据层 | Supabase `https://rls.cheggpt.com`；图片/存储 `https://pxlorbit.com` |
| 额度 procedure | `chat.getQuotas`、`credits.getBalance`、`user.getMe` |
| 自定义头 | `x-dzmm-client`、`x-dzmm-client-refresh`、`x-dzmm-request-id`、`x-dzmm-locale`、`x-dzmm-captcha-*`、`x-dzmm-build`、`x-dzmm-built-at` |
| Cookie | `chosen_language`、`_geo`；登录态另有签名 cookie |
| 埋点 | PostHog（`quota_limited` / feature flags） |
| 风控 | `418 {"error":"captcha_required","location":"/__captcha/"}` |
| 生成接口 | `POST /api/chat`（SSE）：`{operation, chatId, cardId, chatSettings{model,maxTokens}, prompts[], content, parentGenerationId}`，**model / maxTokens 由客户端指定** |
| 计费 | **预扣式**：每条先预扣 3.2 credit，不足则 SSE 返 `{"classification":"upgrade_needed","upgradeReason":"credit"}` 且不扣费；完成后按实际 token 结算（≈2.1/条）。quotas 全程不变；预扣原子，并发无法超发 |
| 会话锁 | 同 chatId 并发生成 → `409 该对话正在生成中`；`chat.createByCard` 按 cardId 去重 |
| 浏览器头 | `/api/*` POST 缺 `referer` / `sec-fetch-*` / `accept` → `403 Forbidden`（空 body） |

### 13.2 额度语义（站内文案归纳）

- `剩余 {{count}} 次`、`已用 {{used}} 次 / 共 {{limit}} 次`。
- **Anime 绘图 / 编辑图片**：从本周期首次使用起**满 24h 整批恢复**（滚动窗口，不是整点）。
- 每日检查点：**北京时间 08:00（UTC 00:00）** 整批重置 quota。
- **credit 不回补**（2026-11-10 实证）：跨 11-08/09/10 三个 08:00，三个号 credit 一位未变；
  free 号 75 credit 是注册一次性赠礼。观测脚本 `scripts/credit_watch.py` → `out/credit_watch.jsonl`。
- **搜索次数**：最近 1 小时滚动累计，满 1h 恢复 1 次。
- **报表导出**：`今日还可导出 {{remaining}} 次（每天 {{quota}} 次）`，超限 `quotaExhausted`。
- 绘图：单次 1 额度，六连抽 6 额度。
- VIP：解锁使用权限，**每次仍扣积分**；`综合积分 = 普通积分 + 限时积分`。

### 13.3 tRPC 错误信封与存在性 oracle

- `401` → `{"message":"UNAUTHORIZED","code":-32001,"data":{"path":…,"authBlock":null,"guestBlocked":false,"blockedDrawIds":null}}`
  —— 服务端有 **authBlock / guestBlocked / blockedDrawIds** 三档封禁，与额度判定是两套逻辑。
- `404` → `No procedure found on path "<PROC>"`。
- `418` → 风控闸门接管，此后真实 procedure 也一律 418。

> oracle：`401` = 存在待登录，`404` = 不存在，`418` = 不可判。
> **bundle 里的 `chat.getSettings` / `credits.getBalance` / `user.getMe` 是 React Query cache key，
> 不是路由路径** —— 实测 `/api/trpc/<它们>` 全部 404。procedure 名单只能从登录态抓包抄。

> 站点是**服务端账本 + 前端展示**双层结构。前端改得再漂亮也没用；判定点在
> `chat.getQuotas` / `credits.getBalance` 背后的计数，以及生成接口的扣减事务。

### 13.4 卡源：`home.getCards` 匿名可读（2026-11-12，详见 `notes/010`、`notes/011`）

| 项 | 事实 |
|---|---|
| 鉴权 | 不带 cookie 也 200 —— 拉卡不消耗 |
| schema | zod **`.strict()`**：多一个未知键就 400。只有 `{"type":"newest"}` 对，`categoryName`/`direction`/`meta` 全是错的（`notes/008` 抄 bundle 害死过 `seed_hot.py`） |
| 分页 | `cursor` 是**页码**（0..1000），一页固定 24 张，`limit` 无效；相邻页重叠，按 `id` 去重 |
| 返回行 | **就是完整卡片对象**，字段同 `card.getById`，不必逐张补请求 |
| type 枚举 | `newest \| highest_rated_1d \| highest_rated_7d \| highest_rated_30d \| highest_rated_all \| games` |
| 下架卡 | `card.getById` 返 **200 + `json:null`**（不是 404） |
| 其他 feed | `home.newbie{}` 200/24；`home.getHotTags{}` 200/**字符串数组**；`home.greenFeatured{}` 200/0 |

oracle 两条：① 喂非法枚举值，zod 回显合法集；② 必填/范围报错文案即 schema 约束。
扩库一律走 feed（1 请求 = 24 卡），单抓才用 `card.getById`（418 闸门按请求数触发，约 15 发）。

### 13.5 代理与抓包链路

见 §8。抓 SSE 加 `--set stream_large_bodies=1k`，否则流被缓冲到结束才落 flow。

### 13.6 攻击面清单（A–H，按 ROI 排序）

| # | 面 | 要点 | 结论 |
|---|---|---|---|
| A | 客户端信任面 | `/api/trpc` 响应里的 `used/limit/remaining/tier` 前端直渲染 | 只影响自己的皮，服务端仍拒；价值是确认字段结构 |
| B | tRPC 入参注入 | `limit/count/quota/maxCount`、`model/tier/plan/vipLevel`、`userId`、`idempotencyKey`、batch 多 procedure | **`model` 客户端可指定**，medium / xl 稳定可用；`max` 属 trial 名额（`notes/005` §3） |
| C | 计费时序 | 断流、复用 `x-dzmm-request-id`、失败重试触发回滚 | 预扣原子，断流照扣（`notes/005`） |
| D | 并发竞态 | 同一 used 并发 N 次找「请求数 > 扣减数」 | 预扣原子，**并发无法超发**（`notes/005`） |
| E | 身份与 claims | JWT 的 `tier/role/vip` 是否验签；Supabase RLS 能否写自己的余额行；存储桶策略 | 见 `notes/006` |
| F | 账号侧回补 | 签到/邀请/分享/每日任务/试用/首充/活动页找可重复领取 | 一天可顶到上限 |
| G | 限制维度错位 | 计数键是 IP / deviceId / UA / `x-dzmm-client`？换维度即重置 | 先抓 `getQuotas` 前后确认键 |
| H | 验证闸门 `/__captcha/` | IP 级：取 `id` → 图 → `POST verify` 带 `id/next/theme/trace`（≥10 点） | 路线 A 换节点；路线 B `solve_gate.py` 全流程通、终点评分未对齐（`notes/002`） |

生成侧已验证：`model` / `maxTokens` 完全由客户端指定，服务端不校验档位额度。
唯一硬边界是 credit 预扣 —— 这就是引擎要「多号轮换」的原因。

### 13.7 验收判据表

| 目标 | 观测点 | 通过标准 | 失败即改 |
|---|---|---|---|
| 每日额度 | `chat.getQuotas` | 20 次调用 remaining 不减 | 判定点在服务端 → C/D |
| 积分余额 | `credits.getBalance` | 账本无扣减行 | RLS 可写 → E |
| 报表导出 | 导出接口 `remaining/quota` | 超 `quota` 仍 200 出文件 | 计数键在 IP → G |
| 六连抽 | batch `count` | 传 60 也照抽 | 服务端 cap → B/D |
| VIP 权限 | `tier` + 高级模型 | 高级模型返回非 402/403 | claims 验签 → F |

---

## 14. 故障排查（按域）

### 14.1 网络 / 抓包

| 现象 | 处理 |
|---|---|
| Cloudflare 403 / 挑战页 | Node 默认 TLS 指纹太假 → 换 `curl_cffi impersonate="chrome"`；H2 优先 |
| 418 闸门 | 无伪装连打约 15 发就锁；枚举 ≤ 1 rps、带 `chosen_language`/`_geo` cookie、锁了立刻换节点 |
| `curl (35) schannel` / `502` | 节点坏，换下一个，别死磕 |
| `_geo` cookie | 出口一变（SG↔HK）额度策略可能不同，切节点后重抓基线 |
| mitm 抓不到 SSE | `--set stream_large_bodies=1k` |

### 14.2 上游接口

| 现象 | 处理 |
|---|---|
| tRPC batch 编码 | `/api/trpc/a,b?batch=1&input={"0":{…},"1":{…}}`；`input` URL 编码且是**对象**；superjson 日期写 `{"$date":…}` |
| `x-dzmm-client` 失效 | 登录后服务端下发新值（`x-dzmm-client-refresh`），旧值 401；以最新抓包为准 |
| `x-dzmm-request-id` 复用 | 可能被当幂等（好事），也可能判重放（403）；两种都记 `notes/` |
| bundle 里全是 `quota` 字样 | 多半是 i18n 文案；接口只有 `chat.getQuotas` / `credits.getBalance` |
| `xx.yy` 形式 404 | 是 React Query cache key，不是 procedure；真名以抓包为准 |
| `cardId` 与 chatId 不匹配 | 一律 `403`（空 body）；建会话必须换卡（`createByCard` 按 cardId 去重），部分卡 `404 对话数据异常`（`notes/004` 的「新会话不放行」归因已作废） |
| 「余额不足」不是 402 | HTTP 200，SSE 里抛 `upgrade_needed/credit`，不扣费；成功必须看到 complete |

### 14.3 引擎 / 前台

| 现象 | 处理 |
|---|---|
| `/api/enter` 一直 401 | 前台进程还是旧口令 → 杀进程重起（§15 口诀） |
| `/site/chat` 401 `bad token` | 前台进程的 `SITE_TOKEN` 与引擎不一致 → 同法杀前台重起 |
| `/site/chat` 409 `已有任务在跑` | 上一条 SSE 未结束 → `POST /stop` 或等它结束 |
| `/site/pool` 全 `credit=0` | `credit` 读 `out/webstate.json`；新机器先 `POST /refresh` 体检 |
| 生成「成功」但没内容 | 引擎 SSE 判 `event: complete`，不是 JSON `"type":"complete"` |
| 长期记忆加了但角色「不认」 | 先确认是本地(`127.0.0.1`)还是生产机，两者 `out/memory/<cardId>.json` 各一份、不互通；再确认记忆走的是 `content_prefix` 注入（上游忽略 `prompts`）。判据：`/site/memory?cardId=` 看 `pinned` 是否有值；暗号注入测试见 `notes/015` |
| `/chat` 307 | 无 `card` 参数时跳默认卡，正常；`/` 无 cookie 的 307 才是跳 `/enter` |
| 首页图片全空 / `/api/img` 502 `upstream error` | Node 直连 pxlorbit.com 的大响应约 320KB 处卡死（fetch/https/http2 都复现，curl/Python 正常）→ 回源改走 `curl`；`w>0` 走 Supabase `render/image` 缩图；详见 `notes/014` |
| 首页广告位空白 | `.zc-ad` 只有 `globals.css` L689 起 10 处样式，JSX 未实现（待补项） |

### 14.4 构建 / 脚本

| 现象 | 处理 |
|---|---|
| 换机器找不到 python/node/pnpm | 三级探测；`$env:LAN_PY` / `LAN_NODE` / `LAN_PNPM` 可覆盖 |
| 脚本莫名崩溃 | PowerShell 5.1 把原生命令 stderr 当终止错误；**不要写 `2>&1`** |
| `[id]` 目录写出 0 字节 | `Copy-Item -LiteralPath` |
| Next.js 构建失败 | 不能在 UNC 共享上 build；用 `%LOCALAPPDATA%` 运行副本或服务器 |
| `scp` 后文件没变 | scp 会静默失败，落位后 `stat -c'%s'` 校验 |

---

## 15. 硬规则

- **占位符先行**：`TARGET` / `PROC` / `COOKIE` / `PATH` / `BODY`；真实值只放 `notes/` 与本地 `.env`，
  不进 git、不进本文件。
- **速率**：单账号 ≤ 2 rps；并发实验单轮 ≤ 16 并发、≤ 30 s；轮间冷却 ≥ 60 s；枚举 ≤ 1 rps。
- **失败即停**：`403 + cf-mitigated`、`x-dzmm-captcha-required: 1`、连续 5 次 `429`
  → 停手，切节点 / 换 profile / 降速。
- **只动自己的账号与自己的客户端**；服务端数据只读，PATCH 只碰自己的行，试完还原。
- **可回滚**：改包 / 改 claims 前，把原值与还原命令写到 `patches/<日期>.md`。

> **口令口诀**：比对「口令文件 mtime」与「:3100 进程 StartTime」，前者更晚就必须杀掉重起。
> 否则 `/api/enter` 一律 `401 口令不对`、所有页面 `307 → /enter`。

---

## 16. 占位符表

| 占位符 | 含义 | 取值方式 |
|---|---|---|
| `TARGET` | 站点根 | `https://www.dzmm.ai` |
| `PROC` | tRPC procedure | `captures/*/trpc.jsonl` 里 `path` 的 `/api/trpc/` 之后 |
| `COOKIE` | 登录态 | DevTools → Application → Cookies，整串粘贴 |
| `CLIENT_HDR` | `x-dzmm-client` | 请求头里最新的那个值 |
| `PATH` | 接口路径 | 含 query，从抓包原样复制 |
| `BODY` | 请求体 | `notes/<proc>.body.json`，脚本读文件 |
| `WORDLIST` | 枚举字典 | `wordlists/procedures.txt` |
| `CONCURRENCY` | 并发数 | 8 / 12 / 16，逐级 |
| `RATE` | 每秒请求 | ≤ 2 |
| `RESULT_LOG` | 结果落盘 | `out/<日期>-<proc>.jsonl` |

---

## 17. 回滚与清理

```powershell
# 停抓包
Get-Process mitmdump,mitmweb -ErrorAction SilentlyContinue | Stop-Process -Force

# 删独立浏览器 profile（不动系统代理）
Remove-Item -Recurse -Force "$env:TEMP\dzmm-prof"

# 卸证书（如装过）
certutil -delstore Root "mitmproxy"

# 清环境变量
Remove-Item Env:HTTPS_PROXY,Env:HTTP_PROXY -ErrorAction SilentlyContinue

# 只保留原始 flow，重跑分析前清产物
Remove-Item -Recurse -Force out\*,notes\*.tmp -ErrorAction SilentlyContinue

# 单文件回退
git checkout -- site/app/page.js
# 整提交回退
git revert <sha> --no-edit

# 已部署未提交回滚
scp backup/page.js ubuntu@43.135.10.175:/opt/lan/site/app/page.js
ssh … "sudo systemctl restart lan-site"
```

---

## 18. 会话开场检查（30 秒）

1. `git status --short` —— 工作区干净？没夹带上轮改动？
2. 要跑应用：`8787` / `3100` 在听？口令文件 mtime 是否晚于 `:3100` 进程的启动时间？
3. 要抓包：`7897` / `8081` 在听？`curl` 一发是 401 还是 418？`accounts.json` 是否存在（池子是否为空）？
4. 本轮要动哪个组件（engine / site / web / 上游）？上一轮结论在 `notes/` 哪一页？

四项齐了再开工。

---

## 19. 可用技能（按需调用）

以下是环境内置技能，lan-ai 相关场景可通过 `/<技能名>` 调用：

| 技能 | 触发场景 |
|---|---|
| `/code-review` | 审查当前 diff / PR 的正确性、bug、复用与简化 |
| `/simplify` | 审查并应用复用/简化/效率清理（只管质量，不找 bug） |
| `/security-review` | 认证/授权/支付等敏感逻辑的安全审查 |
| `/product-requirements` | 新功能需求不清晰，需要产出 PRD |
| `/run` | 启动应用并验证变更在真实环境中生效 |
| `reverse-engineer-anything` | 逆向原生、托管、Electron/JavaScript、打包、固件、浏览器目标 |
| `claude-api` | Anthropic SDK / Messages API、模型 ID、缓存、工具使用等参考 |

---

## 20. 变更日志

| 日期 | 变更 |
|---|---|
| 2026-11-13 | 全文重整：按 wave-mod 结构拆成「项目概述 / 技术栈 / 目录 / 架构原则 / 编码规范 / 测试策略 / Git 规范 / 工作要求 / 代理 / 质量门禁 / 常用命令 / 部署 / 组件 / 上游知识库 / 排障 / 硬规则」，去重并修正编号断档；补全 accounts.json 空池、运行副本、口令口诀等已知坑 |
| 2026-11-13 | `/api/img` 修复：Node 直连 pxlorbit.com 大响应卡死 → 改 curl 回源 + Supabase `render/image` 缩图 + Windows 缓存目录；首页图片与卡片点击恢复（`notes/014`） |
| 2026-11-13 | **长期记忆关键修正**：上游 `/api/chat` 只认 `content`，`prompts[]` 被忽略 → 记忆改走 `memlib.content_prefix()` 拼进 content；暗号实测确认；本地/生产同步（`notes/015`） |
| 2026-11-12 | 卡源 `home.getCards` 分页与 schema 实测（`notes/010`、`notes/011`） |
| 2026-11-11 | 「澜」四屏 + 多轮对话 + 长期记忆（`notes/009`、`013`） |
| 2026-11-10 | credit 不回补实证；批量开号脚本 |

### 评审记录

| 轮次 | 分数 | 主要问题 → 修复 |
|---|---|---|
| 1 | 7.5 → **9.2** | `/site/chat` 误带 `minCredit`、`/pool` 误写“含 cookie”、SSE 事件缺 `chat/memory/note/log/round/stats`、pytest 与 unittest 不符、部署缺引擎步骤、§10 与 §8 重复 → 全部修正；补 `/site/chat` 的 `x-site-token` 与 `RUN_LOCK 409`、`/api/enter` 空口令行为、`notes/004` 作废说明 |
| 2 | 9.2 → **9.4** | `normalize_history()` 已标 legacy，主链路是 `memlib.compose_prompts()`；引擎上限实为 200 条 / 120k 字（24 条 / 16k 是前端裁剪）→ 修正；补 `site_chats` 真实键 `site:<号>:<cardId>`；同步修正 README 的 `/site/enter` 与 24 条表述 |
| 3 | 9.4 → **9.5** | 补 §10 的 `$PY` 出处、`MIN_PREPAY=3.2` 数值、§18 口令 mtime 对比措辞；无事实性遗留问题，停止迭代 |
