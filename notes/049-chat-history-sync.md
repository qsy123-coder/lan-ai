# 049 · 手机 ↔ PC 对话同步（上游存档回放）

日期：2026-11-17
分支：`feat/chat-history-sync`
触发：手机上玩的对话，PC 浏览器看不到（消息只存在各自浏览器的 localStorage）。

## 1. 事实

- 站点消息**只存浏览器 localStorage**（`lg.msgs.v3.<cardId>[:<sessionId>]`），
  会话索引 `lg.sessions.v3` 也在本地；换设备就是空的。
- 真正跨设备共用的是**上游 dzmm 会话存档**：每个 session 的 chatId 记在
  `out/webstate.json` 的 `site_chats` 与 `out/sessions.json` 注册表里。
- 上游 `chat.getMessages` 返回 `[{chunkId, messages:[{role,content}]}]`，实测可取回整段对话。

## 2. 方案

- 引擎新增：
  - `fetch_chat_messages(cookie, chatId)`：拆平 chunks、去掉 `<sug>` 建议块、只留 user/assistant。
  - `site_sessions_of_card(st, cardId)`：从 `site_chats` 聚合 session 维度。
  - `GET /site/history?cardId=&sessionId=`：优先查会话注册表，其次 `site_chats`，
    逐个账号尝试上游存档，返回 `{messages, account, chatId, count}`。
  - `GET /site/sessions?cardId=`（改造原有接口）：注册表 + `site_chats` 合并，
    带 `updatedAt` 与 `summary` 预览。
- 站点新增两个只读代理：`/api/history`、`/api/sessions`（透传 `x-site-token`）。
- 前端 `ChatClient`：
  - 打开某个 session 且本地无消息时，先拉 `/api/history` 回填 localStorage，再走 seeds 兜底。
  - 进卡时拉 `/api/sessions`，把服务器侧有、本地没有的会话补进左侧列表（显示摘要预览）。
  - 从列表点开即回填正文，手机与 PC 共用同一份上游存档。

## 3. 边界

- 只同步「引擎记录过 chatId」的会话；纯游客直连 dzmm 的会话不在内。
- `/api/sessions` 按卡列出所有会话，依赖站点口令隔离；多用户部署需按 uid 隔离。
- 回填的是上游存档原文，`<sug>` 建议块会去掉；时间戳按顺序生成（上游不存 ts）。
- 只读：不写上游、不改记忆。

## 4. 验证

- 离线：`fetch_chat_messages` 用假响应验证 chunks 拆平/去 sug；`site_sessions_of_card` 验证多账号合并。
- 线上：`/site/history` 对两张卡的真实 session 返回消息；PC 打开 `/chat?card=…&s=…` 能看到手机对话。
- 构建：`npm run build` + 引擎重启 + 页面 200。

## 5. 回滚

```bash
cp /opt/lan/backup-history-sync-<ts>/server.py /opt/lan/engine/server.py
rm -rf /opt/lan/site/app/api/history /opt/lan/site/app/api/sessions
cp /opt/lan/backup-history-sync-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
