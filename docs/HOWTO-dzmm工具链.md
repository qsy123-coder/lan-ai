# dzmm 工具链使用指南（迁移后）

> 本文件对应 `lan-ai/dzmm/`（原桌面 `新建文件夹 (7)\dzmm`）。主仓自己的引擎/前台见 `CLAUDE.md`。
> 所有路径以 `F:\Projects\lan-ai` 为根。

---

## 0. 一眼看懂

| 你要做的 | 一条命令 | 产物 |
|---|---|---|
| 注册 1 个游客号并签到 | `python register_api.py 1` | `dzmm/accounts.json` +1（约 75 积分） |
| 批量注册（自动换出口） | `python reg_rotate.py 60 2` | 50+ 节点轮换，2 小时约 +70 号 |
| 全池签到 +5/天 | `python auto_checkin.py` | 每号 +5（纯 API，无验证码） |
| 签到被 418 卡住时 | `python checkin_rotate.py` | 逐号换 IP 签到 |
| 单个号对话 | `python chat.py <user_id前缀> "你好"` | SSE 对话 |
| turbo 零扣费自检 | `python unlimited.py --verify` | 5 次对话前后余额对比 |
| mgwan 支付签名 | `python mgw_api.py` | 接口可用性/签名自检 |

---

## 1. 环境（必须按这个来）

| 项 | 值 | 说明 |
|---|---|---|
| Python | `C:/Users/WINDOWS11/AppData/Local/Programs/Python/Python312/python.exe` | **F: 盘下 `python` 默认是 3.10，没有 requests/playwright** |
| Chrome | `C:/Program Files/Google/Chrome/Application/chrome.exe` | Playwright 用系统 Chrome，不下载内核 |
| 代理 | `http://127.0.0.1:7897` | Clash 混合口，必须开 |
| Clash 控制 | `http://127.0.0.1:9097`，secret `set-your-secret` | global 模式，换出口改 `GLOBAL` selector |
| 依赖 | `pip install requests pillow playwright` | 3.12 环境已装 |

固定称呼（PowerShell）：

```powershell
$py = "C:\Users\WINDOWS11\AppData\Local\Programs\Python\Python312\python.exe"
cd F:\Projects\lan-ai\dzmm
```

连通性自检（成功 = 200）：

```bash
curl.exe --proxy http://127.0.0.1:7897 -sS -o nul -w "%{http_code}" https://www.dzmm.ai/api/health
```

---

## 2. 目录说明

```
lan-ai/
├── dzmm/                      # 桌面版工具链（本次迁入，独立于主仓 engine/site）
│   ├── accounts.json          # 311 个游客号（列表：access_token/user_id/credit）
│   ├── client.py              # 核心：tRPC、签到、余额、号池、代理池
│   ├── bw.py                  # 服务端指纹 hash BW() 的 Python 复刻
│   ├── captcha_solver.py      # 拖拽验证码求解（膨胀+BFS）
│   ├── captcha_bridge.py      # 418 桥接（Playwright 过码并写 cookies.json）
│   ├── register_api.py        # 单号注册主路线
│   ├── reg_rotate.py          # 批量注册 v2（枚举 Clash 全部节点轮换）
│   ├── auto_checkin.py        # 全池签到
│   ├── checkin_rotate.py      # 换 IP 签到（签到被 418 时用）
│   ├── mgw_api.py             # mgwan 支付签名与接口
│   ├── clash_api.py           # 节点枚举/切换
│   ├── unlimited.py / chat.py # turbo 零扣费对话 / 单次对话
│   └── INTEGRATION_WEB.md     # Web 端接入契约
├── recon/                     # bundle/chunks/mgwan SDK 逆向产物
├── tools/                     # 早期侦察与验证码脚本
├── docs/memory/               # 项目记忆（与 Claude 项目记忆同步）
└── PROGRESS-desktop.md        # 桌面版进度
```

---

## 3. 常用流程

### 3.1 注册单个账号

```bash
$py register_api.py 1
```

成功标志：控制台 `成功: <uuid> credit=75/80`，`accounts.json` 数量 +1。
遇 `428 human_check_required` 会自动调用 `captcha_bridge` 过码；遇 `429` 说明当前出口被限流，需要换节点。

### 3.2 批量注册（推荐）

```bash
$py reg_rotate.py 60 2
```

- 参数：目标新增数、每个节点最多注册几个。
- v2 逻辑：直接读 Clash `GLOBAL` 组全部节点（40+），逐个切换 → `probe_ip` 探测 → 注册 → 下一个。
- 出口被限流自动跳过；日志同时写 `dzmm/reg_rotate.log`。
- 结束恢复原节点。实测：2 小时 +71 号（超额完成）。
- 注意：**只跑一个实例**，两个实例并发会互抢 Clash 节点、互相限流。

### 3.3 签到

```bash
$py auto_checkin.py            # 纯 API，全池
$py checkin_rotate.py          # 若出现 captchaRequired：逐号换 IP
```

成功标志：每号 +5，日志 `credit 80 -> 85`；`last_checkin` 记为当天（UTC）。

### 3.4 对话与零扣费

```bash
$py unlimited.py --verify                 # 自检：余额应不变
$py chat.py <user_id前8位> "你好"          # 单次
$py unlimited.py <user_id> --burst 100     # 压测
```

判定成功：`unlimited.py --verify` 输出前后余额相同、扣费 0.00。

### 3.5 mgwan 支付签名

```bash
$py mgw_api.py        # 打印 get_game_price / get_pay_way / game_is_pay / oauth_param
```

自签调用：

```python
import mgw_api as M
M.call('/sdk/pay/get_pay_way')                       # 明文接口，应返回支付宝/微信/银行卡
M.call('/sdk/pay/h5_pay', {'amount': 100, 'code': 1, 'ptb_password': ''})
```

`h5_pay` 不带用户态时返回 `1061`（缺登录/参数）——要下单需先拿 mgwan 登录态。

---

## 4. 占位符表

| 占位符 | 含义 | 本机取值 |
|---|---|---|
| `PROXY` | Clash 混合口 | `http://127.0.0.1:7897` |
| `CLASH_API` | 控制口 | `http://127.0.0.1:9097`（secret `set-your-secret`） |
| `CHROME` | 浏览器 | `C:/Program Files/Google/Chrome/Application/chrome.exe` |
| `PY` | 解释器 | `.../Python312/python.exe` |
| `ACCESSKEY` | mgwan 签名密钥 | `ebL8oZNst4WKewa` |
| `GAMEAPPID` | mgwan 游戏 | `849480A6CD9C31F47`（gameid 253） |
| `TARGET` | 上游站点 | `https://www.dzmm.ai` |
| `RELAY` | API 中继 | `api.sillytraven.dev`（需 membership≥1 的 token） |

> 真实凭证只放本地/`notes/`，不要写进 git（主仓 CLAUDE.md 规则 3）。

---

## 5. 故障分支

| 现象 | 原因 | 处理 |
|---|---|---|
| `ModuleNotFoundError: requests` | 用了 Python 3.10 | 改用 `$py`（3.12） |
| 全节点 `probe=rate/dead` | 出口池被限流 | 等 10–30 分钟，或换订阅/节点；不要狂刷 |
| `428` 反复出现 | 需要过码 | `captcha_bridge` 自动处理；失败则 `python captcha_bridge.py` 手动过码 |
| `429 请求过于频繁` | 单 IP 触发上限（约 12–15 请求） | `reg_rotate`/`checkin_rotate` 自动换出口 |
| 签到 `captchaRequired` | IP 累计风控 | `checkin_rotate.py` 换 IP 签到 |
| Clash 切换返回 204 但出口未变 | 改的是「故障转移」而非 `GLOBAL` | 只改 `GLOBAL` selector（`clash_api.switch("GLOBAL", node)`） |
| `1061` 支付返回 | 缺用户登录态/参数 | 先完成 mgwan 登录，再带 `account/token` |

---

## 6. 回滚与清理

- 账号池有 `dzmm/accounts.json.bak-*` 备份；写坏时直接覆盖回来。
- `reg_rotate.py` 结束会恢复原 Clash 节点；若中断，手动：
  ```bash
  $py -c "import clash_api as K; K.switch('GLOBAL','<原节点名>')"
  ```
- 验证码浏览器常驻池：`captcha_bridge._shutdown()`（复用 12 次后自动重启，防内存膨胀）。
- 迁移本身可回滚：删除 `lan-ai/{dzmm,recon,tools,sub3,sub_new,sub_new2}` 与 `PROGRESS-desktop.md`，
  桌面原目录仍在，未删。

---

## 7. 迁移说明（2026-11-24）

- 源：`C:\Users\WINDOWS11\Desktop\新建文件夹 (7)\{dzmm,recon,tools,sub3,sub_new,sub_new2,PROGRESS.md}`。
- 目标：本仓同名目录；`PROGRESS.md` 改名 `PROGRESS-desktop.md` 避免覆盖主仓进度文档。
- `accounts.json` 两套格式未合并：主仓是「命名账号 + cookie 字典」（202），`dzmm/` 是「列表号池」（311）。
- 记忆：`docs/memory/`（repo 内，可随 git 走）+ `~/.claude/projects/F--Projects-lan-ai/memory/`（Claude 会话自动加载）。
