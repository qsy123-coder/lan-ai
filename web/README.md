# 额度池 · 连续生成控制台

把 `accounts.json` 里的账号池变成一个网页应用：**输入一条提示词，自动跨号连续生成，直到所有账号的 credit 见底**。

```
浏览器 ──> Next.js (:3000) ──> 引擎 (:8787) ──> curl_cffi(impersonate chrome) ──> Clash :7897 ──> dzmm.ai
                                    │
                                    └── accounts.json / out/webstate.json / out/web_results.jsonl
```

## 一、启动

```powershell
# 工程根目录
powershell -ExecutionPolicy Bypass -File start.ps1

# 改端口 / 强制重建
powershell -ExecutionPolicy Bypass -File start.ps1 -Port 3001 -Rebuild

# 停止
powershell -ExecutionPolicy Bypass -File stop.ps1
```

首次运行会自动做三件事：把 `web/` 源码同步到 `%LOCALAPPDATA%\dzmm-web` → 安装依赖 → 构建。
（工程在 UNC 共享上，**Next.js 无法在共享路径构建**，所以运行副本放本地，源码仍以工程内 `web/` 为准。）

启动后打开 <http://127.0.0.1:3000>。

## 二、页面怎么用

| 区域 | 作用 |
|---|---|
| 提示词框 | 唯一输入。Ctrl + Enter 直接开跑 |
| 模型 chips | Turbo / Medium / XL / Max（Max 需 trial 名额，用尽即拒） |
| 最大 token | 传给 `chatSettings.maxTokens`，越大扣得越多 |
| 最低余额 | 余额低于此值的号直接弃用，默认 3.4（预扣 3.2 + 余量） |
| 间隔 | 每次生成后等待秒数，默认 2s（规范要求单号 ≤2 rps） |
| 最多条数 | 0 = 一直跑到没号为止 |
| 实时输出 | 逐 token 流式显示，带光标 |
| 本次记录 | 每次完成一条就落一条，可单条复制 / 打包导出 JSONL |
| 账号池 | 每号余额、进度条、当前会话、停用/启用、重置会话、刷新体检 |
| 运行日志 | 建会话、切号、失败原因的滚动日志 |

## 三、轮换逻辑

1. **开跑先体检**：逐号 `user.getMe`，取真实 credit（间隔 1s，防 418）。
2. **挑号按余额升序**：先榨干零头号，再动大额号，不浪费任何一条预扣。
3. **建会话**：账号没会话时，按 `engine/server.py` 里的 `CARDS` 列表逐张 `chat.createByCard`；
   403/404 的卡自动拉黑（记进 `out/webstate.json` 的 `dead_cards`），换下一张，最多 11 张。
4. **生成**：`POST /api/chat`，SSE 流式回传；成功后立刻 `user.getMe` 拿新余额，差值计入本次消耗。
5. **切号条件**：`upgrade_needed / credit`、余额 < 阈值、登录 401、卡池耗尽。
6. **停止条件**：手动停、达到条数上限、全部账号见底、连续失败 >5。

## 四、文件

```
engine/server.py            # 引擎：账号轮换 + 会话 + SSE + 状态（stdlib + curl_cffi）
web/app/page.js             # 界面（客户端组件，手写 SSE 解析）
web/app/api/*/route.js      # 6 个转发路由：pool / run / stop / refresh / account / results
web/app/globals.css         # 设计系统
start.ps1 / stop.ps1        # 一键启停
out/webstate.json           # 运行态：每号余额、chat_id、card_id、拉黑的卡
out/web_results.jsonl       # 每次生成的落盘结果（提示词、账号、正文、扣费）
```

## 五、引擎接口（只监听 127.0.0.1）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 引擎信息、模型表、卡池 |
| GET | `/pool` | 账号池 + 运行态 |
| POST | `/refresh` | 逐号体检（可选 `{"names":[...]}`） |
| POST | `/run` | 开跑，SSE 流：`log/account/chat/delta/complete/switch/stats/end` |
| POST | `/stop` | 置停止位（浏览器断开也会自动置位） |
| POST | `/account` | `{"name","exhausted"/"reset"/"remove"}` |
| GET | `/results` | 最近 200 条落盘结果 |

## 六、排错

| 现象 | 原因 | 处理 |
|---|---|---|
| 页面显示「引擎离线」 | 8787 没起 | `start.ps1`，或看 `python engine/server.py --port 8787` 的报错 |
| 全部账号都是 `no_card` | 请求缺 `sec-fetch-*` → 403 | 已修（`headers_of()`），不要删这几个头 |
| 418 captcha | 出口 IP 被闸门接管 | 切 Clash 节点（`scripts/clash.ps1 -Set "🇯🇵 日本-hy2 02"`）后重试 |
| 生成立刻 `upgrade_needed` | 余额 < 3.2 预扣 | 该号已自动标停用，换号即可 |
| 建会话 404「对话数据异常」 | 该卡片不可用 | 会自动换下一张卡；反复失败就把该号「重置」 |
| 构建报 BOM / JSON 解析错 | 配置文件带 BOM | 用无 BOM 的 UTF-8 保存（本仓库脚本已处理） |
