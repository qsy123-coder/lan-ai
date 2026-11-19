# 059 换号链 session_bound_elsewhere 死锁：修复

日期：2026-11-19
分支：`fix/session-rebind-deadlock`
相关：`engine/server.py`（`run_site_chat`）；与 notes/058（空壳会话）同一条「继续」链路

## 现象

card 435777 连点「继续」时，free 模型空响应一多，报「可用账号上的会话都被其它
对话占用」（`no_clean_chat`），其实池子里有可用号。

## 根因（与 lan-ai-c7 交叉核对确认）

`run_site_chat` 循环外只取一次 `active_chat = prev_sess.chatId`（请求开头的绑定）。
循环里第一个号换号成功时，`ensure_chat_for_card` 的 fresh 路径 `bind_session` 把
session 改绑到新号新 chat；该号随后生成失败（free 空响应）`continue` 换下一个号。
下一个号进 `ensure_chat_for_card` 时：

- `cur = get_session(...)` 已变成「上一个号的新 chat」；
- `cur.chatId != active_chat`（active_chat 还是请求开头的旧值）→ 真；
- `cur.account != name` → 真；
- 返回 `session_bound_elsewhere`，`stale_hits++`。

从第三个号起没人再 rebind，cur 停在「上一个号」，全部命中 `session_bound_elsewhere`，
`stale_hits` 累计到 `>= len(cands)` → `no_clean_chat`。

## 修复（方案 A，最小）

`run_site_chat` 每次成功拿到 cid 并 bind 后，把局部 `active_chat/active_acct` 推进到
当前 `cid/name`。这样下一轮换号时 `ensure_chat_for_card` 的 `active_chat` 传的是
「上一次绑定」，`cur.chatId == active_chat` 成立，不再误报 `session_bound_elsewhere`，
只在真并发改绑时才触发。

```python
switched = bool(prev_chat) and (prev_chat != cid or prev_acct != name)
# 推进当前会话绑定，下一轮换号才有正确基准
active_chat = cid
active_acct = name
fresh_chat = bool(not prev_chat or switched or cid_empty)
```

reuse 分支不受影响：reuse 时 `cid == want_chat == active_chat`，赋值是无操作。

## 自检

- `python -m py_compile engine/server.py` 通过；
- `python -m unittest discover engine/tests` 87 项全过。

## 验证

逻辑审查 + 队友生产验收（free 空响应 → 换号链不再报 no_clean_chat）。

## 回滚

```powershell
git revert <本次提交>
# 生产：/opt/lan/backup-* 覆盖回 engine/server.py 后 systemctl restart lan-engine
```
