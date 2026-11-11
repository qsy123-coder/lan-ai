# notes/003 — 登录态接管 + /api/chat 生成链路 + 模型越权（2026-11-06 23:37–00:05）

账号: `0c52ffd5-642a-4ea6-8803-795d31685fa8`（free，credit 起始 75，turbo 50/50，max/xl/medium 全 0/0）

## 1. 会话接管（脚本侧）

- 登录态在 **cookie** 里（Supabase SSR 分片）：`sb-rls-auth-token.0` / `.1`，另有 `_rid`、`_login_device`、`dzmm_exp_device_id`。
- mitm 抓到的 `cookie` 头是多条合并的（`, ` 分隔）→ 直接回放会 401 `请先登录`。
  正确做法：用 `flow.request.headers.get_all("cookie")` 逐条取，`"; "` 拼接（已写进 `scripts/capture.py` 与 `replay_chat.py`）。
- **必须带浏览器头**：缺 `referer` / `sec-fetch-*` / `priority` 时 `/api/*` POST 直接 `403 Forbidden`（纯文本，非 JSON）。
  最省事的做法是把抓包的整份 headers 原样抄下来，只替换 cookie 与 body。

## 2. 生成接口 `/api/chat`（实测）

```
POST https://www.dzmm.ai/api/chat
{
  "operation":"generate",
  "chatId":"<uuid>", "cardId":"3478453",          // cardId 在 tRPC 里必须数字，这里字符串也接受
  "chatSettings":{
     "model":"x-apex-flux-0217-16k",               // ★ 客户端完全可控
     "style":"standard","maxTokens":4500,          // ★ 客户端完全可控
     "randomIndex":0,"deepThinking":false,"enableMemoryEnhance":false,
     "voiceSettings":{"ignore_parentheses":false,"only_quotes":true,"ignore_english":false,"read_asterisks":false}
  },
  "presetConfig":{"presetIds":[]},
  "prompts":[{"role":"user","content":"..."},...],  // 整段历史都在客户端
  "chunkedHistory":true,"supportsSuggestions":true,
  "content":"<本轮文本>",
  "parentGenerationId":"<上一条 generationId>"
}
```

响应是 SSE：`data: {"type":"init","data":{"generationId":...}}` → 多条 `{"type":"token","data":"..."}` → `{"type":"complete","data":{...}}`。
`complete.data` 里带 `outcome`（如 `refused`）、`messageIndex`、`chunkId`。

## 3. 已确认的越权（可用）

**模型档位由客户端指定，服务端不校验对应额度。**

```
free 账号：max 0/0、xl 0/0、medium 0/0、turbo 50/50
请求体 model = "nalang-max-0826"（max 档）→ 200，正常吐 token，generationId 各不相同
```

复现：

```powershell
# 1) 用抓到的原始 body 做模板（out/chat_body_exact.json）
# 2) 只改 model
python scripts\replay_chat.py --body-file out\body_max.json     # 200 + SSE token 流
```

对照组（同 body、同 cookie、只换 model 回 turbo）同样 200 —— 差别只在模型档位，说明不是缓存。

## 4. 计费语义（实测，重要）

| 观测 | 结果 |
|---|---|
| 计费货币 | `credit`（user.getMe.credit），**不是** quotas |
| 单条成本 | 短回复 ≈ 2.2 credit；长回复（maxTokens 4500）≈ 5 credit |
| `chat.getQuotas` | 全程不变（turbo 仍 50/50）→ 聊天不扣 quota，quota 只用于绘图类 |
| 客户端断开 | **照扣**：读 600 字节就 close，credit 62.23 → 57.19（delta 5.04）→ §3-C 断流白嫖不成立 |
| 生成中重复请求 | `409 {"error":"该对话正在生成中，请稍后再试"}` —— 单会话串行锁 |
| `chat.createByCard` | **按 cardId 去重**：同一卡片连建 3 次返回同一 chatId → 并发实验必须换不同 cardId |

## 5. 并发/竞态现状

- `scripts/poc_race.py` k=6 跑通：6 个"会话"其实是同一个（去重），只有 1 条 200，其余 409。
- 余额检查是否原子 **尚未验证**：需要 N 个不同 cardId 的会话，再同时打 `/api/chat`。
- 判据：`credit after < 0` 或 `200 条数 × 单价 > 初始余额` 且全部 200。

## 6. 闸门与出口（更新）

- 418 是 **IP 级**：同一 cookie 换 IP 后从 418 → 200；被锁后带登录 cookie 也照样 418。
- 本轮可用节点：`🇯🇵 日本Anytls 03`（404/401 正常）。
  已坏/被锁：`🇸🇬 新加坡Anytls 06`、`05`（418）、`🇯🇵 日本-hy2 02`（先好后被 8 并发打成 418）、`🇯🇵 日本Anytls 01`、`🇨🇳 台湾Hinet-01`（TLS 直接断）。
- **教训**：并发实验会把自己 IP 打进闸门，先切节点再跑，且并发从 4 起。

## 7. 剩余口子（下一步）

1. **竞态超发**：拿 N 个不同 cardId → 同时生成 → 看 credit 能否变负。
2. **额度回补**：`bountyQuest`（2–1000 credit/单，最多 3 个 active claim）、`/api/invite/claim`、`/api/with-auth/dzmm/affiliate/partner*`（201）—— 检查领取是否幂等。
3. **maxTokens 放大**：`maxTokens` 客户端可控，试 10^6 看是否被截断、是否按 token 计费（若是，可反向用于"低价长文"）。
