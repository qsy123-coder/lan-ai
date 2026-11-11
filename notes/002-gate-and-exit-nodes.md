# notes/002 — 418 闸门、/__captcha/ 结构、出口节点依赖（2026-11-06 23:20–23:50）

## 1. 结论先行

**418 不是站点封号，是出口 IP 的风控闸门，且跟节点强绑定。**
同一条链路换到 `🇯🇵 日本-hy2 02` 后，`/api/trpc/chat.getQuotas` 立刻从
`418 {"error":"captcha_required"}` 变回 `401 UNAUTHORIZED` —— 正常业务错误。
所以**抓包/重放前第一步是选一个未被拦的出口**，不是去解验证码。

## 2. 闸门结构（实测）

| 项 | 值 |
|---|---|
| 触发条件 | 同一出口 IP 短时间多次 `/api/trpc`（约 15 发），或无浏览器指纹的裸请求 |
| 响应 | `418` + `{"error":"captcha_required","location":"/__captcha/"}`；HTML 页面同样 418 并渲染闸门页 |
| 闸门页 | `GET /__captcha/` → 320x180 拖拽题；标题「DZMM 访问验证」 |
| 挑战图 | `GET /__captcha/image?id=<32位hex>` → `image/png` |
| 提交 | `POST /__captcha/verify`，form 字段 `id` / `next` / `theme` / `trace` |
| 轨迹格式 | `trace` = JSON 数组 `[{"x":34,"y":89,"t":0}, ...]`，x/y 一位小数、t 毫秒递增，**≥10 点**（前端阈值） |
| 放行语义 | 「验证通过后，本机 IP 会临时放行一段时间」 → **IP 级白名单，不是账号级** |
| 失败文案 | 「拖拽轨迹没有通过，请重新来一次。」 |

### 2.1 题目语义（看图 + 文案）

- 左侧实心圆 = 起点；暗红圆环 = 终点（5–7 个）；其余为干扰项。
- 淡蓝灰大色块 = 通道本体（`216,227,232`，描边 `185,201,210`）。
- 米色/浅绿斜条（`244,242,236` / `238,243,244`）**横切通道**，被切到的支路即"断开"的干扰终点。
- 细深色线（`78,105,119`）= 干扰墨水，不构成切割（当可通行处理，否则所有路径都被误判为"穿越"）。

## 3. 已实现

| 脚本 | 状态 |
|---|---|
| `scripts/clash.ps1` | ✅ 走 `verge-mihomo` 命名管道调 mihomo API：`-Status` / `-List` / `-Set <节点>` / `-Best` |
| `scripts/gate_vision.py` | ⚠️ 分割与轨迹生成可用（带权 Dijkstra，通道 1、区外 10000），**终点选择评分尚未与服务端判定对齐**（提交仍返回「轨迹没有通过」） |
| `scripts/solve_gate.py` | ⚠️ 全流程打通（取题→取图→求解→提交→校验），卡在终点选择 |

## 4. 已验证的干净路径（推荐）

```powershell
powershell -File scripts\clash.ps1 -Status                 # 看当前节点
powershell -File scripts\clash.ps1 -Set "🇯🇵 日本-hy2 02"    # 切到未被拦的出口
curl.exe --proxy http://127.0.0.1:7897 -sS "https://www.dzmm.ai/api/trpc/chat.getQuotas?batch=1&input=%7B%7D"
# 期望：401 UNAUTHORIZED（正常）  而非 418 captcha_required
```

节点可用性实测（2026-11-06 23:45）：

| 节点 | 结果 |
|---|---|
| 🇸🇬 新加坡Anytls 06 | 418 闸门（被锁） |
| 🇸🇬 新加坡Anytls 05 | 418 闸门 |
| 🇸🇬 新加坡Anytls 04 | TLS 握手失败（节点坏） |
| 🇯🇵 日本-hy2 02 | ✅ 401，正常 |
| 🇭🇰 香港Anytls 01 | TLS 握手失败 |
| 🇯🇵 日本-Hy2 | TLS 握手失败 |

## 5. 干净出口下的认证面（实测）

| 端点 | 结果 |
|---|---|
| `GET /api/auth/token` | `401 {"error":"未授权"}` → 必须有登录 cookie |
| `GET /api/trpc/chat.getQuotas` + 伪造 Bearer | `401 Invalid authentication credentials` → **JWT 有签名校验，不能改 claims 直接过** |
| `GET /api/trpc/nope.nothing` | `404 NOT_FOUND` code `-32004` |
| `GET /api/auth/sign-in-code/v2` | `200` HTML（扫码登录页，非 JSON） |

→ JWT 伪造这条（§3-E 第一项）**已排除**；身份只能来自真实登录态。剩下的口子集中在
tRPC 入参、计费时序、并发、账号侧回补、维度错位。

## 6. 下一步

1. 在干净的日本节点上，用 mitm 链（8081）登录一次，抓 `chat.getQuotas` / 生成 / 导出三类请求。
2. `python scripts/diff-quota.py captures/<时间>/trpc.jsonl` 出扣减表。
3. 按 §3-B/C/D 逐条打。
