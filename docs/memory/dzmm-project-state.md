---
name: dzmm-project-state
description: dzmm.ai 逆向项目的关键结论与可复用攻击面（代理、验证码、注册产线、mgwan 支付签名、会员门、turbo 零扣费）
metadata:
  node_type: memory
  type: project
  modified: 2026-11-24
---

主仓库 `F:\Projects\lan-ai`（原桌面工作区 `C:\Users\WINDOWS11\Desktop\新建文件夹 (7)` 已整体迁入：
`dzmm/`、`recon/`、`tools/`、`sub3/`、`sub_new/`、`sub_new2/`、`PROGRESS-desktop.md`）。
目标 dzmm.ai 无限额度；详细进度见 `PROGRESS-desktop.md`、`dzmm/README.md`、`notes/`。

## 环境（非显然）
- 本机必须走代理：Clash 混合口 `127.0.0.1:7897`，控制口 `127.0.0.1:9097`（secret `set-your-secret`），
  **global 模式**下换出口只能 `PUT /proxies/GLOBAL {"name": "<节点>"}`（`dzmm/clash_api.py` 已封装）。
- `F:` 盘下 `python` 解析到 Python 3.10（无 requests/playwright）；跑 dzmm 工具链要用
  `C:/Users/WINDOWS11/AppData/Local/Programs/Python/Python312/python.exe`。
- Chrome 路径 `C:/Program Files/Google/Chrome/Application/chrome.exe`（Playwright 复用系统 Chrome）。

## 注册产线（2026-11-24 状态）
- 账号池 `dzmm/accounts.json`：**311 个**游客号（列表格式，每号含 access_token / user_id / credit）。
  主仓 `accounts.json` 是另一种「命名账号字典 + cookie」格式（202 条），两套互不覆盖。
- 主路线 `dzmm/register_api.py`：合法 fp（`bw.py` 复刻服务端 `BW()` hash）→ 页面内 fetch
  `POST /api/auth/anonymous-sign-in` → 428 走 `captcha_bridge.py` 过拖拽码 → 200 取 `sb-rls-auth-token`。
- 批量 `dzmm/reg_rotate.py <目标> <每节点个数>`：**v2 直接枚举 Clash GLOBAL 的 43+ 节点**轮换出口，
  遇到 429/428 自动切下一个节点；实测 2 小时 +71 个号。
- 邮箱注册（另一条线）：`POST /api/auth/sign-up {email,password,terms}` → 跳
  `/sign-in?s=otp&email=&type=` → `POST /api/auth/sign-up/otp {email,token,type,next}`。
- 错误码：`emailAlreadyRegistered` / `registerRiskBlocked`（418）/ `weakPassword` / `registrationFailed`。

## 额度与计费
- 新游客号：注册送 75 积分；签到 +5/天（`tasks.initCheckin → tasks.claim`，纯 API）；
  免费额度 5 对话/天、30 画图/天、50 搜图/时、2 图片编辑/天、kagami_trial 10 次终身。
- **turbo 零扣费**：`nalang-turbo-*` 在 web `/api/chat` 上不扣积分（2026-11-19 复测 75.35→75.35；
  12 次压测余额不变）；`x-apex-surge-*` 等正常扣费。落地见 `dzmm/INTEGRATION_WEB.md`。
- 计费口径：1 美元 = 100 积分；turbo 0.1 积分/1k token。
- **API token 门**：`user.getApiToken` 要 `membership_level >= 1`，看「本周期充值」而非积分余额（1 credit≈$0.01）；
  relay `api.sillytraven.dev` 只认该 token，Bearer access_token / `X-MGW-Auth` 一律 `invalid_token`。

## 418 风控
- 账号+设备级，换 IP 不解除；必须用 `dzmm/captcha_bridge.py` 带账号 cookie 过码（拖拽多终点路径）。
  单 IP 约 12~15 个请求再触发；静态 `/assets/*.js` 也受保护。
- 前端拦截链：`ZPe`/`QPe`/`rFe` → 解析 418 JSON → `/api/health?captcha_completed=1` 收口。

## mgwan 支付签名（可复用）
- `md5_sign = MD5(按 key 排序后「值」直接拼接 .trim() + accesskey)`；body=`base64(JSON)`，`Content-Type: text/plain`。
- 游戏常量：`gameid=253`、`gameappid=849480A6CD9C31F47`、`accesskey=ebL8oZNst4WKewa`、`gameurl=https://sdk.ghjwq.com`
  （明文在 `recon/chunks/BIGuN_ky.js`）。
- `h5_pay` 必带 `code`（支付宝=1 / 微信=2 / 银行卡=3），`amount` 单位为分，price 客户端可控，实测下限 1.00 元；
  当前未带用户态时返回 `code=1061`（缺参数/未登录，待接 mgwan 登录态）。
- `get_pay_way` 明文可用；`dzmm mgwan.getOrderStatus` 返回 `amountReceived/amountOrder`，按到账结算。

## 工具索引（dzmm/）
| 文件 | 用途 |
|---|---|
| `client.py` | tRPC/签到/余额/号池/token 解码/代理池 |
| `bw.py` | 服务端指纹 hash `BW()` 的逐字节复刻 |
| `captcha_solver.py` / `captcha_bridge.py` | 拖拽验证码求解 / 418 桥接 |
| `register_api.py` / `reg_rotate.py` / `register.py` | 单号注册 / Clash 节点轮换批量 / 旧 UI 路线 |
| `auto_checkin.py` / `checkin_rotate.py` | 批量签到（纯 API / 换 IP） |
| `mgw_api.py` | mgwan 签名与接口调用 |
| `clash_api.py` | Clash 节点枚举/切换 |
| `unlimited.py` / `chat.py` | turbo 零扣费对话 / 单次对话 |
| `INTEGRATION_WEB.md` | Web 端接入契约（SSE、错误码） |

相关：[[lan-ai-howto]]
