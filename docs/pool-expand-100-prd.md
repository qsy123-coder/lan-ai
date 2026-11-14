# 号池扩展 b054+ PRD（目标 100 号）

日期：2026-11-14
分支：`docs/pool-expand-100-prd`
相关：`notes/033`（人机校验 + IMAP 隧道）、`notes/034`（注册两段式风控 + 出口矩阵）、`scripts/batch_signup.py`、`scripts/new_account.py`

## 背景与问题

### 现状

| 项 | 数值 |
|---|---|
| 号池 | 46 号（`main` 2.25 / `g01` 72.53 / `mail01` 75 / `b015` 35 / 其余 42 号各 75） |
| 总 credit | ≈ 3338 |
| 单号产能 | 75 credit ≈ 35 条 turbo（预扣 3.2，结算 ≈2.1/条） |
| credit 回补 | **无**（11-08 至 11-10 跨 3 个 08:00 检查点实测不变），75 是注册一次性赠礼 |
| 现有产线 | `batch_signup.py`：串行 → 切全局节点 → 开一个 Edge → 填表 → 人工拖 → IMAP 收码 → 入池 |
| 账本 | `out/ip_ledger.json`，只记「节点名 / uses / last_429 / skip_until」 |

### 三个真瓶颈（按影响排序）

1. **出口 IP 数量**。notes/034 实测：每个出口 IP 约只放行 1 个注册，过闸后服务端二次裁决（429 `REGISTER_RISK_BLOCKED`）。
   当前 FG 订阅 42 个节点，账本里 39 个真实节点全部用过 1–4 次。
2. **收码通道**。IMAP 可达性跟出口节点强相关（b027：节点 TLS `UNEXPECTED_EOF`，连试 6 分钟 → `no_code`），
   Gmail 还把验证码大量丢进 Spam，`TO <别名>` 搜不到，只能 `FROM dianzimeimo`。
3. **串行吞吐**。全局节点切换意味着同一时刻只有一个出口、一个浏览器；
   单号 4–6 分钟，54 个号要 4–6 小时，且中途任何一次 429 都要停下来换节点。

### 本轮已确认的输入

- 目标规模：**100 号（+54）**
- 单号成本：**≤ ¥1**（不含人工）
- 自动化：**半自动**——人工拖 `/__captcha/`，其余全自动
- 出口来源：修复 mitce 订阅 + 复用 FG 39 节点（用户提供的 FG 订阅与现用 Clash 同源，节点名完全一致，不构成新 IP）
- 收码：**Cloudflare Email Routing catch-all → Worker + HTTP API**
- 执行形态：**并行，多端口多出口**

## 目标 / 非目标

### 目标

1. 补到 **100 号**，入池成功 ≥ 54 个，`user.getMe` 校验 `credit=75`。
2. 出口池化：至少 **6 个并发可用出口**（端口 7901–7906），每个出口独立选节点、独立健康检查、独立冷却。
3. 收码去 IMAP：新链路不再依赖 Gmail IMAP 与节点可达性；`no_code` 失败率 < 10%。
4. 并行产线：`--concurrency 3` 稳定运行，单号 p50 ≤ 6 分钟，54 个号 ≤ 3 个工作日跑完。
5. 失败可恢复：`no_code` / `not_logged` 落 `pending` 队列，48h 内可补收或明确放弃。
6. 成本 ≤ ¥54（实际预期：域名 ¥10/年 + 0 代理费，约 ¥0.19/号）。

### 非目标（本轮明确不做）

- 不做全自动求解器（用户已选人工拖；`gate_vision.py` 终点评分仍未对齐）。
- 不买 Gmail / TG 成品号（成本 ¥10–23/号，超出 ≤¥1 预算）。
- 不改站点前端、不写服务端数据、不做 RLS / claims 方向。
- 不做养号与长期存活率优化（另立 PRD）。
- 不引入 npm 依赖；Python 仍只用标准库 + `curl_cffi`。

## 用户故事

- 作为运营者，我希望一次开 3 个窗口、依次拖三次，而不是等一个跑完再开下一个。
- 作为运营者，我希望脚本自己告诉我「现在该拖哪个窗口」，拖完不用管收码。
- 作为运营者，我希望某个出口被 429 后自动冷却并换下一个，而不是整批停住。
- 作为运营者，我希望看到「今天产了几个号、每个号用的哪个出口 IP、花了多少时间」。
- 作为运营者，我希望失败但已提交的号（比如收不到码）不会静默丢掉 75 credit。

## 方案设计

### 总览

```
                    ┌─ 7901 → mihomo#1 (全局=节点 A) ─┐
                    ├─ 7902 → mihomo#2 (全局=节点 B) ─┤
out/exits.json ──── ├─ 7903 → mihomo#3 (全局=节点 C) ─┤──> www.dzmm.ai
  (出口账本)         └─ 7904 ...                      ┘
                                 │
farm.py（asyncio，3 worker）─┬─> Edge profile + CDP（每 worker 独立）
                            ├─> mail_api.py（CF Worker 收码）
                            └─> accounts.json / out/farm_ledger.jsonl
```

### 1. 出口层：多实例 mihomo + 端口池

**为什么不用现成的全局切换**：`clash.ps1 -Set` 改的是主实例 GLOBAL，一次只能一个出口；
浏览器 `--proxy-server` 可以指向不同端口，所以正确做法是**每个出口一个独立 mihomo 实例**。

**实现**：

- 复用现成 core：`F:\Clash Verge\verge-mihomo.exe`（v1.19.19，已经在跑两个实例，证明可多开）。
- 新增 `scripts/exit_pool.ps1`：
  - 输入：FG 订阅 YAML（`out/fg_sub.yaml`）+ mitce 配置（`out/mitce/config.yaml`，若修复）。
  - 合并 `proxies` 段，去掉 `rules` / `rule-providers` / `tun`。
  - 为每个槽位 `i` 生成 `out/exits/mihomo-<i>.yaml`：`mixed-port: 790<i>`、`external-controller: 127.0.0.1:919<i>`、`mode: global`、`ipv6: false`。
  - 启动命令：`verge-mihomo.exe -f out/exits/mihomo-<i>.yaml -d out/exits/data-<i>`。
  - 停止：`scripts/exit_pool.ps1 -Stop`（按端口找 PID，不动 7897/7999 两个现役实例）。
- 选节点：`PUT http://127.0.0.1:919<i>/proxies/GLOBAL`，body 必须 **UTF-8 无 BOM 文件 + curl --data-binary**（PowerShell 直接 `Invoke-RestMethod -Body` 会把中文节点名发成 `?`，返回 `proxy not exist`——本轮已踩）。
- 出口探测（每个槽位用一次）：
  1. `GET http://127.0.0.1:790<i>/__ping__` 无意义，改用目标站点 oracle：
     `https://www.dzmm.ai/api/trpc/nope.nothing?batch=1&input=%7B%7D`
     - `404` / `401` = 干净可用
     - `418` = 闸门，冷却 30 min
     - `000` / 502 = 节点坏，换
  2. 出口真实 IP：`https://www.cloudflare.com/cdn-cgi/trace` 取 `ip=`、`loc=`，写进账本。
     **同一 IP 出现两次即判重复**（同机场不同节点可能共用 NAT 出口，这是并行最容易踩的坑）。

**账本 `out/exits.json`**（新）：

```json
{
  "7901": {
    "instance": 1,
    "node": "🇯🇵 日本Anytls 03",
    "exit_ip": "203.0.113.7",
    "region": "JP",
    "health": "ok",            // ok | gated | dead | cooling
    "uses": 2,
    "ok": 1,
    "fail": 1,
    "last_ok": 1794600000,
    "last_429": 0,
    "cooldown_until": 1794610800
  }
}
```

**选出口规则**（`scripts/exits.py:pick()`）：

1. 过滤 `health != ok`、`cooldown_until > now`、`uses >= 3`（单出口最多成功 2 个，第 3 次只允许在成功率 ≥ 50% 时）。
2. 住宅出口优先（mitce `*-住宅-*`）。
3. 其余按 `uses` 升序、`last_ok` 降序。
4. 选不到 → 打印「出口耗尽，建议：换订阅 / 换服务器 IP / 等冷却」，退出码 5（不硬顶）。

**容量测算**（写进验收，不写进承诺）：

- 可用出口 ≈ FG 39 + mitce 住宅 14（当前仅 `nhk1` / `ntw8` TCP 通）+ mitce 云 25（历史 429）。
- 54 个号需要平均 1.4 次成功/出口；当前账本已证明复用可行（39 节点产出 40+ 号），但成功率会随使用次数下降。
- **止损线**：连续 10 次尝试成功率 < 40% → 停止扩号，走「升级出口」预案（见 §边界与异常）。

### 2. 注册编排：并行 worker

新脚本 `scripts/farm.py`（asyncio + 线程池混合：CDP 调用是阻塞子进程，放 `to_thread`）。

状态机（每号）：

```
acquire_exit → mail_provision → launch(profile, port=exit_port)
  → dismiss_cookie → wait_form → fill → submit
  → [人工拖闸门 ≤180s] → otp_page
  → wait_code(≤180s) → submit_otp → cookie_header → getMe
  → add_pool(name, exit_ip) → release_exit(ok) → ledger
```

关键点：

- **每个 worker 一个 Edge profile**：`%TEMP%\dzmm-farm-<slot>`，端口 `96xx` 独立（CDP 端口与出口端口分开）。
- **窗口置顶**：进入闸门时执行 `window.focus()`，控制台打印 `[W1] 请拖 #1 窗口（剩余 180s）`。
  拖拽完成信号沿用现有判定：`location.search` 出现 `s=otp` 或 iframe 消失。
- **提交后轮询**（每 2s）判：`s=otp` / `REGISTER_RISK` / `__captcha` / `暂不支持注册` / `暂时无法完成注册`。
- **每号失败只影响本 worker**，出口照常释放并记账；不打断其他 worker。
- **并发上限**：默认 3，`--concurrency 3`；人工拖是瓶颈，超过 4 个弹窗会拖错。
- **人工节奏保护**：同一窗口两次置顶间隔 ≥ 5s；拖拽超时先置顶再等 30s，仍无动作才判 `gate_timeout`。

复用：`new_account.py` 的 `launch()` / `cdp()` / `cookie_header()` / `me_of()` / `add_pool()`；
`batch_signup.py` 的填表与 OTP 提交 JS 片段原样搬过来（已验证 `set + input/change` 对 React 生效）。

### 3. 邮箱层：CF catch-all + Worker API

**拓扑**：

```
xxx@NEWDOMAIN  --MX--> Cloudflare Email Routing (catch-all) --Email Worker--> KV
                                                                    ↑
                                              GET /code?addr=... ---┘
```

- 域名：新注册一枚（或复用未被标记的域名），¥10/年；`aetouban.cn` 已标记，**不再使用**。
- Cloudflare 侧（一次性人工配置，写进 `notes/`）：
  1. 域名 NS 托管到 CF → Email Routing → 启用 → 目标邮箱验证。
  2. Catch-all → 发送到 Worker `mail-hub`。
  3. Worker 解析 MIME（`postal-mime` 或手写 `text/html` 提取），正则 `\b(\d{8})\b`，写 KV：
     `key = 收件地址`, `value = {code, subject, from, ts}`，TTL 7 天。
  4. Worker 路由：
     - `GET /code?addr=<地址>&since=<ts>` → `{code, ts}` 或 `{code:null}`
     - `GET /health` → `{ok:true}`
- 脚本 `scripts/mail_api.py`：
  - `provision()`：生成本地部分（10–12 位随机）+ 域名，返回地址（catch-all 不需要预注册）。
  - `wait_code(addr, timeout=180)`：每 3s 轮询，命中 8 位码即返回。
  - 配置在 `out/mail_api.json`：`{base_url, token}`（token 放本地，不进 git）。
- **降级**：Worker 不可用时自动回落到 mail.tm（`signup_email.py` 的 `mk_mailbox` / `wait_code`），
  但 mail.tm 建箱有限流（第 3 个即 429），只作为单号兜底。

**为什么不用自建 mail server**：CF Email Routing 免费、无需 25 端口、无需维护 TLS；
Worker + KV 的查询延迟 < 200ms，比 IMAP 隧道稳定一个数量级。

### 4. 失败恢复（pending）

`out/pending_signups.json` 扩展字段：

```json
{"email":"...","password":"...","exit":"7902","node":"...","stage":"no_code",
 "attempts":1,"ts":1794600000,"deadline":1794772800}
```

- `scripts/resume_pending.py`：
  1. 先测「重复 POST /api/auth/sign-up 是否给未验证邮箱重发 8 位码」——**这是 P0 待验证项**，
     若是，则走「重发码 → OTP → 入池」；若返回 409/邮箱已存在，则改走 `sign-in` + 密码。
  2. 两条都不通 → `stage=abandoned`，从队列移除并在日志里记明原因（不静默丢）。
- `no_cookie` / `not_logged` 同理：cookie 拿不到时先重试一次 `getMe`，再判 pending。

### 5. 入池与同步

- `add_pool()` 沿用现有逻辑，`note` 写成 `farm·<节点·区域>·<exit_ip 后两段>`。
- 同步线上：`scp -i ~/.ssh/wavemod_server accounts.json ubuntu@43.135.10.175:/opt/lan/accounts.json`，
  然后 `ssh ... "sudo systemctl restart lan-engine"`（按 `notes/009` §部署）。
- 本机 Web 控制台：`POST /refresh` 体检后 `webstate.json` 才有 credit（CLAUDE.md §11-17）。

## 数据与接口变更

| 文件 | 变更 | 说明 |
|---|---|---|
| `out/exits.json` | 新增 | 出口账本（端口 / 节点 / 真实 IP / 健康 / 冷却） |
| `out/farm_state.json` | 新增 | 队列：`pending / running / done / failed`，含每号 stage 与耗时 |
| `out/farm_ledger.jsonl` | 新增 | 一行一次尝试：`ts, worker, exit, node, email, stage, ms` |
| `out/fg_sub.yaml` | 新增 | FG 订阅落地（避免每次联网拉） |
| `out/mail_api.json` | 新增 | Worker 地址 + token（git 忽略） |
| `out/pending_signups.json` | 扩展 | 追加 `exit/node/stage/attempts/deadline` |
| `accounts.json` | 结构不变 | `note` 增加出口信息；`last` 仍为 `getMe` 结果 |
| `out/ip_ledger.json` | 保留 | 旧链路仍可跑；新链路以 `exits.json` 为准 |

接口：不新增对外接口；Worker 的 `/code`、`/health` 属于自建辅助服务。

## 边界与异常

| 情况 | 处理 |
|---|---|
| 出口探测 418 | 该出口 `health=gated`，冷却 30 min，换下一个 |
| 注册 429 `REGISTER_RISK_BLOCKED` | 出口 `last_429` + 冷却 3h；域名不动；连续 3 个出口 429 → 暂停 2h |
| 域名被拒（`domain_reject` / 「暂不支持注册」） | 整批停，换域名；旧域名记 `out/bad_domains.json` |
| 人工拖超时（180s） | 先置顶再等 30s；仍无动作 → `gate_timeout`，关窗口、释放出口、不消耗 uses |
| 收码超时（180s） | 落 pending；出口记 `fail`；**不**立刻重试同一出口 |
| 浏览器崩溃 / CDP 断 | 关进程、重开一次；第二次失败 → `launch_fail` |
| 出口 IP 与其他出口重复 | 判 `dead`，该节点拉黑（`out/exits.json: duplicate_of`） |
| 连续 10 次成功率 < 40% | 触发升级预案：①重拉 mitce 订阅 ②腾讯云换公网 IP ③新买一份机场订阅（需用户批准） |
| 站点 build 变更（`x-dzmm-build` 变） | 立即停批，重抓一次基线，再决定是否继续 |

**升级预案的成本/收益**（写清，供决策）：

| 预案 | 成本 | 产能 | 副作用 |
|---|---|---|---|
| 重拉 mitce 订阅 | ¥0（已付） | +14 住宅（当前仅 2 个 TCP 通） | 需用户的订阅链接 |
| 腾讯云换公网 IP | ¥0 | +1 号/次 | 站点停机 1–2 min，`sslip.io` 域名失效 |
| 新机场订阅 | ¥10–20/月 | +20–50 节点 | 需用户提供链接 |
| 住宅代理按流量 | ≈¥0.03/号 | 理论无限 | 需供应商账号，IP 质量参差 |

## 验收标准（可逐条勾选）

- [ ] 号池 ≥ 100，`accounts.json` 中 `last.credit=75` 的号 ≥ 95 个。
- [ ] 最近 20 个号的注册成功率 ≥ 70%（`farm_ledger.jsonl` 统计）。
- [ ] 并发 3 时，单号 p50 ≤ 6 min、p90 ≤ 12 min。
- [ ] 6 个出口同时可用（`exits.json` 中 ≥6 个 `health=ok` 且 `exit_ip` 互不相同）。
- [ ] `no_code` 失败率 < 10%；所有 `no_code` 号都进入 pending 且 48h 内有结论。
- [ ] 单号现金成本 ≤ ¥1（本批实际 ≤ ¥54，只含域名）。
- [ ] `main` / `g01` / `mail01` 三个老号在整个过程中不出现 418/429。
- [ ] `POST /refresh` 后可用号 ≥ 95、可用 credit ≥ 7100。
- [ ] 线上 `/site/pool` 与本机一致（count 相同）。

## 测试计划

- **单测 / 脚本级**：
  - `exit_pool.ps1 -DryRun`：只生成配置不启动，校验端口/控制口无冲突。
  - `exits.py` 选路：给定账本样本，断言不会选出 `duplicate_of`、冷却中、uses≥3 的出口。
  - `mail_api.wait_code`：Worker 返回空 → 超时退出码；返回多封 → 取最新。
  - `resume_pending.py --dry`：只打印计划，不发请求。
- **集成（小批）**：
  - 先 3 并发跑 6 个号，检查：出口 IP 互不重复、每号 credit=75、pending 为空。
  - 再 3 并发跑 12 个号，观察 429 曲线与成功率。
- **验收**：按 20 个号一批跑到 100，每批结束 `POST /refresh` 并记录。
- **回滚**：停 `farm.py` → `exit_pool.ps1 -Stop` → 删 `%TEMP%\dzmm-farm-*` → 用 `accounts.before-<日期>.json` 还原 → 重启引擎。

## 分期

| 期 | 内容 | 产出 | 预计 |
|---|---|---|---|
| P0 | 出口池 + 探测 + 账本；Worker 收码；单号跑通新链路 | `exit_pool.ps1`、`exits.py`、`mail_api.py`、`farm.py --concurrency 1` | 0.5–1 天 |
| P1 | 并行 3 worker + pending 落盘 + 置顶提示 | 6 号小批验收 | 1 天 |
| P2 | 批量扩号到 100；止损线；线上同步 | `farm_ledger.jsonl`、`accounts.json`、`notes/037` | 2–3 天 |
| P3 | pending 补收实测（P0 待验证项）+ 出口复用曲线 | `resume_pending.py`、notes | 0.5 天 |

## 风险与回滚

- **不可逆操作**：写 `accounts.json`（凭证）→ 每次批量前备份 `accounts.<日期>.json`。
- **对外副作用**：向 dzmm 发注册请求、向 CF Worker 收信；无第三方账号变更。
- **人工风险**：拖错窗口会把两个号的验证串号 → 每个窗口标题带 `[W1]` 标记（`document.title` 改写）。
- **回滚命令**：

```powershell
# 停产线
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*python*" } | Stop-Process -Force
powershell -File scripts\exit_pool.ps1 -Stop
Remove-Item -Recurse -Force "$env:TEMP\dzmm-farm-*" -ErrorAction SilentlyContinue

# 还原号池
Copy-Item accounts.before-20261114.json accounts.json -Force
```

## 待确认 / 待验证

1. **mitce 订阅链接**：当前 `out/mitce/config.yaml` 里 14 个住宅只有 `nhk1`、`ntw8` TCP 可达，云节点 reality 握手失败 → 需要从 Clash Verge 里取订阅 URL 重拉一次。
2. **重复 sign-up 是否重发 OTP**：决定 `resume_pending.py` 的上限（P0 实测，5 分钟）。
3. **新域名**：需要用户提供（或授权注册）一枚未被标记的域名，并完成 CF Email Routing 配置。
4. **Worker 部署方式**：`wrangler deploy` 或 CF 控制台粘贴；KV namespace 需先建。
