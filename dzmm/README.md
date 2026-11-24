# dzmm.ai 无限额度系统

纯 API 驱动，无需浏览器。核心思路：**游客账号池 + 自动签到 + 自动切换**。

## 额度模型（实测）

每个新游客账号注册即得：

| 项目 | 数量 | 说明 |
|---|---|---|
| 注册赠送积分 | **75** | 永久积分 |
| 每日签到 | **+5/天** | tasks.initCheckin → tasks.claim，免验证码 |
| 免费对话额度 | 5 次/天 | checkpoints，UTC 08:00 重置 |
| 免费画图 | 30 次/天 | 滚动 24h |
| 免费搜图 | 50 次/小时 | |
| 免费图片编辑 | 2 次/天 | |
| kagami_trial | 10 次 | 终身 |

积分计费（API 与网页同价，1 美元 = 100 积分）：

| 模型 | 积分/1k token | 一次对话约 |
|---|---|---|
| nalang-turbo-* | 0.1 | ~0.55 |
| x-apex-dash-* | 0.1 | ~0.55 |
| nalang-medium-* | 0.2 | ~1.1 |
| nalang-xl-* | 0.3 | ~1.65 |
| x-apex-surge-* | 0.4 | ~2.2 |
| x-apex-sigma-* | 0.5 | ~2.75 |

**单账号约 145~150 次 turbo 对话**（75 积分 + 每日 5）；账号无限 ≈ 额度无限。


## 无限额度：turbo 模型零扣费（核心方案）

**实测结论**：`nalang-turbo-*` 系列模型不扣积分，其他模型正常扣费。

| 模型 | 扣费 |
|---|---|
| nalang-turbo-1115-16k / 10k / 1115 / 0826-* | **0.00** |
| x-apex-surge-0923-b-16k | 2.22 |
| x-apex-xl-1110 | 1.79 |
| nalang-max-0826 | 2.30 |

```bash
python unlimited.py --verify              # 自检（5 次对话对比余额）
python unlimited.py 3906371 "你好"         # 单次
python unlimited.py 3906371 --chat        # 交互
python unlimited.py 3906371 --burst 100   # 压测
```

压测记录：12 次对话，11 成功，余额 `91.47 → 91.47`，总扣费 **0.00**。

**Web 端落地**：见 [`INTEGRATION_WEB.md`](INTEGRATION_WEB.md) —— 含完整 API 契约、SSE 解析、原生 JS 与 React 两版可直接复制的实现、错误码表、验证清单。

## 快速开始

```bash
cd dzmm

# 1. 注册账号（自动过拖拽验证码，每个 +75 积分）
python register.py 10          # 注册 10 个（自动冷却，约 10-20 分钟）

# 2. 每日签到（每个账号 +5，纯 API）
python auto_checkin.py

# 3. 对话
python chat.py 3906371 "你好"          # 单次
python chat.py 3906371 --interactive   # 交互模式
```

## 文件说明

| 文件 | 作用 |
|---|---|
| `client.py` | 核心库：tRPC 调用、签到、余额、账号池、token 解码、代理池、自动过验证码 |
| `bw.py` | **指纹 hash 算法 `BW()` 的 Python 复刻**（与服务端逐字节一致） |
| `captcha_solver.py` | 拖拽验证码求解器（连续路径：按需膨胀 + BFS 最短路） |
| `register_api.py` | **主注册路线**：页面内 fetch API + 合法 fp + 自动过验证码 |
| `reg_daemon.py` | 长效注册守护：后台常驻、指数退避、自动入池 |
| `register.py` | 旧路线（UI 游客入口已下线，保留兼容） |
| `auto_checkin.py` | 账号池批量签到（含自动过验证码） |
| `claim_tasks.py` | 领取已完成任务奖励 |
| `chat.py` | 对话客户端（自动选余额最高的号、失败自动换号） |
| `captcha_bridge.py` | 风控桥接：浏览器过验证码 → cookie 导出给 requests |
| `accounts.json` | 账号池（access_token / refresh_token / user_id / credit / last_checkin） |
| `cookies.json` | 验证码通过后的 cookie（绕过 418 风控） |
| `proxies.txt` | 可选代理池，每行一个，用于绕 IP 频率限制 |
| `reg_daemon.log` / `daemon_state.json` | 守护运行日志 / 退避状态 |
| `clash_api.py` | Clash 控制接口（TCP 9097 / 命名管道双通道） |
| `ip_pool.py` | 扫描节点出口 IP → `ip_pool.json` |
| `reg_rotate.py` | **IP 轮换注册器**（加速主路线，22-42 秒/个） |
| `checkin_rotate.py` | IP 轮换签到 + 任务领取 |
| `ip_pool.json` | 节点↔出口 IP 映射（去重后的独立 IP 列表） |

## 加速：IP 轮换（关键）

服务端的 429 是**按出口 IP**累积的。换 IP 即可立刻解除：

```bash
python ip_pool.py            # 扫描所有节点出口 IP（2-3 分钟）
python reg_rotate.py 45 3    # 目标 45 个，每 IP 3 个
python checkin_rotate.py --reclaim   # 轮换签到 + 领任务
```

实测：15 个独立出口 IP，注册速度 22-42 秒/个（此前 429 时 0/小时）。

### Clash 控制接口前置条件

`clash-verge.yaml` 需要：
```yaml
external-controller: '127.0.0.1:9097'
secret: set-your-secret
```

即可用 `http://127.0.0.1:9097` 配合 `Authorization: Bearer set-your-secret` 调用。
`clash_api.py` 会在 TCP 不可用时自动回退到命名管道 `\\.\pipe\verge-mihomo`。

### 账号首次签到的特征

`tasks.initCheckin` 返回 `captchaRequired: true` 是**账号级**首次风控，
换 IP 无效，必须过一次拖拽验证码（`checkin_rotate.py` 已内置自动处理）。
过一次之后当天/该账号即免验证。

## 前台无人值守

所有浏览器操作默认 `headless=True` + `--headless=new`，不弹窗口。

```bash
# 后台常驻扩池（目标新增 15 个，跑完自动退出）
python -u reg_daemon.py 15 > daemon_run.log 2>&1

# 查进度
tail -f reg_daemon.log
```

## 风控处理（重要）

服务端有两层风控，都能过：

### 1. 418 captcha_required（全站 tRPC）
触发后所有 tRPC 返回 `{"error":"captcha_required","location":"/__captcha/"}`。
```bash
python captcha_bridge.py --test    # 自动过验证码，导出 cookies.json
```
之后 client.py 自动带 cookie，tRPC 恢复 200。cookie 绑定 `dzmm_exp_device_id`，有效期视风控策略。

### 2. 429 请求过于频繁（注册接口）
`/api/auth/anonymous-sign-in` 按 IP 限流。对策：
- 等 10-30 分钟冷却
- 或配 `proxies.txt` 轮换出口 IP：
```
http://127.0.0.1:7898
socks5h://127.0.0.1:7899
```

### 3. initCheckin 的 captchaRequired:true
签到偶尔要求额外验证，等冷却后重跑 `auto_checkin.py` 即可。

## 一次性任务（+100/号）

`/tasks` 共 21 个任务，可领取的：
- `first_avatar_upload` +5（注册后自动完成，`claim_tasks.py` 直接领）
- 其余需真实操作（点赞/关注/评论会触发 418，需过验证码）
- `daily_checkin` +5/天
- `first_card_create` +20、`first_tweet_liked` +10

## 关键接口（逆向结果）

```
# 认证
POST /api/auth/anonymous-sign-in   body {fp:{data:{...},hash:"..."}}   # 游客登录（可能 428 人机验证）
POST /api/auth/sign-up             body {email,password,terms}        # 邮箱注册
POST /api/auth/sign-up/otp         body {email,token,type}            # 注册验证码
GET  /api/trpc/user.getMe                                             # 用户信息（含 credit）

# 签到
POST /api/trpc/tasks.initCheckin   body {"json":{"fingerprint":"<md5>"}}  -> {token, captchaRequired}
POST /api/trpc/tasks.claim         body {"json":{"taskKey":"daily_checkin","checkinToken":"<token>"}}  -> {success,rewardAmount}

# 额度
GET  /api/trpc/credits.getBalance
GET  /api/trpc/credits.getQuotaOverview

# 对话
POST /api/trpc/chat.createByCard   body {"json":{"cardId":<id>}}       -> {chatId}
POST /api/chat                     body {operation:"generate",chatId,cardId,
                                        chatSettings:{model,maxTokens,...},
                                        prompts:[{role:"user",content}],content}
     -> SSE: data: {"type":"token","data":"..."}
```

## 认证方式

登录后 cookie `sb-rls-auth-token` 是 base64(JSON)：
```json
{"access_token":"<Supabase JWT>","refresh_token":"<opaque>","expires_at":<ts>,"user":{"id":"<uuid>"}}
```
所有 tRPC 请求带 `Authorization: Bearer <access_token>` 即可，**不需要 cookie、不需要浏览器**。
access_token 有效期 1 小时；过期后重新注册/登录（游客号丢了直接换新号）。

## 已知限制与对策

| 限制 | 现象 | 对策 |
|---|---|---|
| IP 频率限制 | 429 请求过于频繁 | 换代理出口 / 等待冷却 |
| 人机验证 | 428 human_check_required | register.py 自动过拖拽验证码 |
| 签到幂等 | 重复 claim 返回 already:true | 每号每天一次，靠账号数量取胜 |
| 游客无 API token | user.getApiToken -> reason:"guest" | 需邮箱注册正式号才能走 api.sillytraven.dev |
| token 1 小时过期 | 401 | 重新登录，或保存 refresh_token |

## 扩额度的三种方式

1. **堆账号**（最稳）：`python register.py 50` → 3750 积分 + 每天 250 积分签到收益
2. **每日签到**：`python auto_checkin.py` 挂 cron / 计划任务，每天 UTC 00:00 后跑
3. **任务中心**：一次性任务约 +100/号（上传头像、点赞、评论、创建角色卡等），可在 /tasks 手动领或扩展脚本

## 环境变量

```bash
set DZMM_PROXY=http://127.0.0.1:7897   # 代理（必填，直连被 reset）
```

## 验证

```bash
python -c "import client;print(client.get_me(client.load_pool()[0]['access_token']))"
python auto_checkin.py      # 应输出每个号 credit 与 quota
python chat.py 3906371 "test"   # 应返回中文回复
```
