# 061 付费兜底建议不相关（串到别的卡）：改用当前卡

日期：2026-11-19
分支：`fix/suggest-wrong-card`
相关：`engine/server.py`（`suggest_followup` / `run_site_chat`）

## 现象

付费档（Surge/Pulse/Dash 等不 armed 的模型）底部的三条建议和当前剧情不相关，
「感觉是别的卡片里的内容」。

## 根因

`suggest_followup` 用 `ensure_chat(st, pool, name)` 拿**账号级通用会话**
（`a["chat_id"]/a["card_id"]`，账号第一次建会话时选中的卡）。这个会话：
- 卡 ≠ 当前对话的卡；
- 服务端历史里还混着摘要产物（摘要也共用 `ensure_chat`）。

建议兜底要「基于当前卡剧情给出接话建议」，却发到这个「别的卡 + 摘要」的会话，
上游加载它的服务端历史，模型自然生成偏「别的卡」的建议。

## 修复（只动引擎）

`suggest_followup` 增加 `card_id` 参数，用 `ensure_chat_for_card(st, pool, name,
card_id, ...)` 拿**当前对话卡的会话**（复用当前对话的 chatId）；`run_site_chat`
调用时传 `card_id`。

代价（已接受）：建议请求会写入当前 chat 的服务端历史，下次续写时模型会看到
这条极短的「建议请求 + 建议回复」，属轻微污染；换取建议与当前剧情相关。

## 自检

- `python -m py_compile engine/server.py` 通过；
- `python -m unittest discover engine/tests` 87 项全过。

## 验证

付费档（如 Surge）生成后，底部三条建议应基于当前卡的角色/剧情，不再串卡。

## 回滚

```powershell
git revert <本次提交>
# 生产：/opt/lan/backup-* 覆盖回 engine/server.py 后 systemctl restart lan-engine
```
