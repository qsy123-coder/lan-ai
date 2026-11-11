# notes/001 — tRPC 接口存在性 oracle 与风控闸门（2026-11-06 23:05–23:10）

环境：出口 Clash 7897，出口地区 SG，未登录，无 cookie jar（除服务端下发 `chosen_language` / `_geo`）。

## 1. 存在性 oracle（GET，`?batch=1&input=%7B%7D`）

| 响应 | 含义 | 证据 |
|---|---|---|
| `401` + `UNAUTHORIZED / code -32001` | **procedure 存在**，但需登录 | `chat.getQuotas` |
| `404` + `No procedure found on path …` | procedure 路径不存在 | `chat.getSettings`、`credits.getBalance`、`user.me`、`preset.list`、`nope.nothing` |
| `418` + `{"error":"captcha_required","location":"/__captcha/"}` | 触发风控闸门，此时 401/404 差异全部消失 | 连打约 15 次后出现 |

```bash
curl.exe --proxy http://127.0.0.1:7897 -sS -D - \
  "https://www.dzmm.ai/api/trpc/chat.getQuotas?batch=1&input=%7B%7D" \
  -H "origin: https://www.dzmm.ai" -H "x-dzmm-client: web"
```

## 2. 真实错误信封（401 原文）

```json
[{"error":{"json":{"message":"UNAUTHORIZED","code":-32001,
 "data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"chat.getQuotas","stack":null,
 "authBlock":null,"authBlockUserId":null,"authBlockDeletedAt":null,
 "guestBlocked":false,"blockedDrawIds":null}},
 "meta":{"values":{"data.stack":["undefined"],"data.blockedDrawIds":["undefined"]},"v":1}}}]
```

要点：

- 服务端有 **`authBlock` / `guestBlocked` / `blockedDrawIds`** 三个封禁维度 → 说明存在"账号级封禁 / 游客封禁 / 单作品封禁"，
  额度判定和封禁判定是分开的两套逻辑，**先确认自己落在哪一档**。
- `x-request-id`（服务端发）与 `x-dzmm-request-id`（客户端发）是两回事，前者不能伪造复用。
- 响应头 `Vary: Cookie, Authorization` → **Bearer 也是合法身份载体**，抓包时两种都要抄。

## 3. bundle 里的名字 ≠ 路由路径

`chat.getSettings`、`credits.getBalance`、`user.getMe` 在 bundle 里反复出现，但 `/api/trpc/<name>` 一律 404。
它们是 **React Query 的 cache key**，服务端 procedure 名是另一套（`chat.getQuotas` 恰好撞名）。
→ 结论：**procedure 名单只能从登录态的真实抓包里抄，不能从 bundle 猜**。claude.md §3-B 的枚举改走抓包，不走字典。

## 4. 风控闸门（新增坑，必须记）

- 触发：同一出口 IP 约 15 次 `/api/trpc` 请求（含 404），无 UA 伪装、无 cookie。
- 表现：`418` + `{"error":"captcha_required","location":"/__captcha/"}`，**之后连真实 procedure 也一律 418**。
- 对应客户端机制：bundle 里的 `x-dzmm-captcha-required` / `x-dzmm-captcha-location` 两个头 + `captchaGate.*` 文案。
- 处置：停手 → 换节点（换出口 IP）→ 带 `_geo`/`chosen_language` cookie → 单账号 ≤ 0.5 rps 复测；必要时走 `/__captcha/` 拿 token。
- 教训：**枚举类请求必须限速 1 rps 以内并抓响应头**，不然 15 发就把自己关门外。

## 5. 下一步（等登录态）

1. 用户登录后抓一轮：聊天 1 次、六连抽 1 次、导出报表 1 次。
2. `python scripts/diff-quota.py captures/<时间>/trpc.jsonl` 出扣减表。
3. 扣减表出来才知道真正的扣费 procedure 名 —— 再回填 claude.md §1 与 §3-B。
