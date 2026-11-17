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

- 离线：`fetch_chat_messages` 假响应验证 chunks 拆平/去 sug；`site_sessions_of_card` 验证多账号合并。
- 线上（2026-11-17 12:35，US-N-1 出口）：
  - 「夏日,妹妹,同居」`93d5e47b` → 49 条（账号 b054）；`a9704810` → 7 条。
  - 「两个少女…」`16f8354b` → 5 条（b021）；`a310c0e8` → 9 条（b055）。
  - `/api/sessions` 经站点代理返回同样的会话列表。
- 构建：`npm run build` 成功，`lan-engine` / `lan-site` 均 active，页面 200。
- 踩坑：同一 session 换号会留下多份上游存档，长度不同（9 / 17 / 49 条）；
  只取第一份会拿到残档。改成最多试 24 份、取最长。
- 踩坑：代理节点 SSL 抖动会让部分存档读不到；`fetch_chat_messages` 失败后直连重试一次。
- 出口：mihomo 原 `SG-N-3` 已失效（SG/JP 节点全 000），GLOBAL 切到 `US-N-1`
  （3/3 稳定；`DIRECT` 也可用，留作兜底）。

## 5. 使用方式（手机 → PC）

1. PC 打开站点后 **Ctrl+F5 硬刷新**（拿到新前端）。
2. 左侧「对话」列表会自动补上服务器侧登记过的**全部卡的会话**（带卡名/封面/摘要预览），
   不只是当前这张卡；`diag-/sessA-/sessB-/verify-` 等测试会话已过滤。
3. 点开某个会话：前端自动拉 `/api/history` 回填，正文与手机一致；云端比本地更全时会覆盖。
4. 也可以直接在手机复制地址栏 `?card=…&s=…` 的链接，在 PC 打开，效果相同。

## 6. 回滚

```bash
cp /opt/lan/backup-history-sync-<ts>/server.py /opt/lan/engine/server.py
rm -rf /opt/lan/site/app/api/history /opt/lan/site/app/api/sessions
cp /opt/lan/backup-history-sync-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
