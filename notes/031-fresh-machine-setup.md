# 031 · 另一台 Windows 11 从零搭建（可移植性验证）

**时间**：2026-11-12 22:0x–22:3x
**目的**：验证仓库在**干净机器**上能否独立跑起来，暴露出哪些硬编码与隐式依赖。
**机器**：Windows 11，`C:\Users\dsh`，项目根 `%ROOT%` = `C:\Users\dsh\lan-ai`。

---

## 1. 仓库地址纠正

任务书写 `https://github.com/qsyyq-coder/lan-ai.git`，实际 **404**。
真实仓库 `https://github.com/qsy123-coder/lan-ai.git`（public，29 repos）。

```powershell
git remote -v
# origin  https://github.com/qsy123-coder/lan-ai.git (fetch)
```

---

## 2. 可移植性补丁（本次唯一必须改的代码）

两个启动脚本里三行硬编码 DSH 运行时路径，换机器直接挂：

```powershell
# 改前
$PY   = "C:\Users\dsh\.dsh\...\python.exe"
$NODE = "C:\Users\dsh\.dsh\...\node.exe"
$PNPM = "C:\Users\dsh\.dsh\...\pnpm.mjs"
```

改为三级探测（`$env:LAN_*` → 已知 DSH 路径 → `Get-Command`），并把
`& $NODE $PNPM install … 2>&1` / `next build 2>&1` 的 **` 2>&1` 全部删掉**。

**为什么要删 `2>&1`**：PowerShell 5.1 把原生命令的 stderr 包成 `NativeCommandError`。
`git clone` 打 `Cloning into 'lan-ai'...`、`next build` 打 `⚠ Compiled with warnings`
都会走 stderr —— 保留 `2>&1` 时脚本会中止，删掉才正常。

实测：`start-site.ps1` 5414 → 6389 bytes，`start.ps1` 3994 → 4780 bytes，`2>&1` 残留 0。

---

## 3. 依赖

| 项 | 结果 |
|---|---|
| Python | 3.12.14（DSH 运行时） |
| curl_cffi | 0.17.0 已装 |
| Node | v24.21.0 |
| pnpm | 经 DSH 运行时 `pnpm.mjs` 调用 |
| 代理 7897 | 在听，`pool.py list` 21 号全 `✅` 证明通路正常 |

---

## 4. 账号池与卡片库

从既有服务器 `/opt/lan` scp 回本地（方式 A）：

```
accounts.json          78649 B   21 号
cards.json           1402019 B  522 卡  → captures/site/cards.json
```

`python scripts/pool.py list` → 21 个全部 `✅`，实时体检（credit 与服务器快照不同，
证明是本机现打的 `getMe`，不是读缓存）。

**坑**：`GET /site/pool` 返回 `count=21 usable=0 total=0.0`。
原因 —— `/site/pool` 读的是 `out/webstate.json`，新机器上该文件不存在，
`account_state()` 的 `credit` 默认 `None` → `0` → 全部 `usable=false`。
`accounts.json` 里的 `last.credit` 不参与这个计算。

**修法**：`POST /refresh`（需 `x-site-token`），21 号约 66s，写回 `webstate.json`。
之后 `count=21 usable=16 total=1150.52`。

---

## 5. 验收结果

| # | 判据 | 结果 |
|---|---|---|
| 1 | `GET /health` | `ok:true`，`root=C:\Users\dsh\lan-ai`，`proxy=http://127.0.0.1:7897` |
| 2 | `GET /site/pool` | `count=21 usable=16 total=1150.52` ✅ |
| 3 | `POST /site/chat` SSE | `account → chat → 18×delta → complete`，16.9s，正文完整 ✅ |
| 4 | credit 差值 | `1150.52 → 1148.86` = **Δ1.66**（区间 1.7–2.1，接近下限，属正常） |
| 5 | 前台状态码 | 带 cookie：`/ /about /card/:id /chat?card= : 200`；无 cookie `/` : `307` ✅ |
| 6 | 前台透传 `/api/chat` | `account → 5×delta → complete`，20.7s，多轮 history 生效（答出延续内容）✅ |

**SSE 判据修正**：任务书说判 `"type":"complete"`，实际引擎用 `event: complete` 行表类型，
data 里没有 `type` 字段。

```
event: complete
data: {"text": "我是电子魅魔的专属AI…", "account": "b003",
       "chatId": "288b4163-…", "cardId": 3821218, "credit": 40.21}
```

`credit` 是结算后的余额 —— 它出现就说明扣费事务已经落库。

---

## 6. 陷阱：口令竞态（最耗时的一个）

第一次跑 `start-site.ps1` 后 `/api/enter` 一律 `401 口令不对`，所有页面 `307 → /enter`。

排查链：

1. 读 `out/site_pass.txt` → `lan-8263`，8 字节，无 BOM，UTF-8 正常。
2. `POST /api/enter` 试 `p` / `pass` / `password` 三个字段 → 全 401。
3. 看 `app/api/enter/route.js` → **字段名是 `p`**，`process.env.SITE_PASS` 比对。
4. 查进程启动时间 → `:3100` PID 3900 **启动于 22:01:43**，
   而 `site_pass.txt` **mtime 22:17:06** —— 口令文件比进程新 15 分钟。
5. 结论：前台是更早那次跑起的老进程，它的环境变量 `SITE_PASS` 是那时的旧口令。
   `start-site.ps1` 的 `Test-Port` 只判断端口在听，在听就跳过启动，**不会重读口令文件**。

**修法**：杀干净 → 删口令文件 → 用脚本重起（让脚本在干净环境里重新生成并注入）。

```python
# 杀端口占用
Get-NetTCPConnection -State Listen -LocalPort 3100 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
# 删 out/site_pass.txt out/site_token.txt
# 再跑 start-site.ps1 -NoOpen
```

重启后一次通过：`{"ok":true}` / 全页面 200 / 无 cookie 307。

**教训**：`Test-Port` 跳过启动是性能优化，但也让「改了口令/改了源码却以为重启了」变成静默失败。
以后改口令或改服务端代码，先杀进程再起。

---

## 7. 另一处误判：`/chat` 的 307

中途看到 `/chat` 返回 `307` 且 `bytes=11499`，一度当成登录拦截。
看 `location` 头才发现是 **`/chat?card=430690`** —— 缺 `card` 参数时的默认跳转，正常行为。

判据修正：`location: /enter` 才是拦；`location: /chat?card=…` 是路由。

---

## 8. 遗留

- **`.zc-ad` 广告位只有 CSS（globals.css L689 起 10 处样式），JSX 未实现。**
  服务器版 HTML 里数到 12 个 `zc-ad`，是旧 chunk 缓存残留，源码里同样是 0。
  参考图有广告位，属于待补项。
- `sharp` 未装 → `/api/img` 退回原图，构建警告可忽略。
- 本机 `web/` 控制台（:3000）未启动，本次只验「澜」前台。

---

## 9. 完整启动命令（本机复现）

```powershell
$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY=$env:HTTPS_PROXY
cd C:\Users\dsh\lan-ai
powershell -ExecutionPolicy Bypass -File .\start-site.ps1 -NoOpen
```

首次会自动 `pnpm install` + `next build`（本次 16s，因为依赖已缓存）；
运行副本在 `%LOCALAPPDATA%\dzmm-site`。
