# 020 线上 409「已有任务在跑」：全局锁改会话锁

日期：2026-11-15
分支：`fix/chat-409-concurrency`（基于 `main` 276138b 切出）
相关：`engine/server.py`

## 现象

公网多个用户同时发消息时，第二个请求直接 `409 {"error":"已有任务在跑"}`；
前端只显示 `HTTP 409`，用户感知为「点发送没反应 / 卡住」。

## 根因

`engine/server.py` 用一把**全局** `RUN_LOCK` 同时保护 `/run`（批量）和
`/site/chat`（站点聊天）。一次生成 10–60s（多段续写更久），期间任何第二个请求
都抢不到锁，直接 409。

而上游 dzmm 的 409（`该对话正在生成中`）是**按 chatId（号 × 卡）**串行的，不是全局。
所以真正的互斥粒度应该是「同一个 chatId」，不是「全站同一时刻只有一条」。

## 修

1. `/run` 批量任务仍用全局 `RUN_LOCK`（它本来就是单任务、靠 `/stop` 停，语义不变）。
2. `/site/chat` 去掉全局锁，改用 `chat_lock_for(name, card_id)` 会话锁：
   - 同一个号 × 同一张卡（同一 chatId）并发生成 → `acquire(blocking=False)` 抢不到就
     `switch {reason:"busy"}` 换下一个号，既不上游 409 也不排队干等；
   - 不同号 / 不同卡 → 完全并行。
3. 每个 `/site/chat` 请求持独立的 `threading.Event` 作为 stop_event：
   - `_emit` 断流时只 `self._stop.set()`，不再动全局 `STOP`，避免一个用户点「停止」
     把其他用户的流一起掐掉。
   - `generate` / `generate_long` / `start_summary` / `maybe_summarize` 全部透传
     `stop_event`，默认回退全局 `STOP`（`/run` 与后台摘要不受影响）。
4. 新增 `is_network()`：出口节点坏（SSL / 连接被掐 / 超时 / curl 35·56·7）
   只提示「出口节点异常」并停，**绝不**把账号标成 `exhausted`。
5. 全号 busy 时给更友好的提示：`end {reason:"busy"}`。

## 验证（2026-11-15 线上实测）

先起一个真实生成占住「号×卡」会话锁，再每秒打一个空 prompt `/site/chat` 探针，共 8 发：

```
probe1..8  http=200  "reason":"bad_request"   ← 全部 200，无一 409（旧版必 409）
generation http=200  event:complete           ← 真实生成正常
```

同时实测暴露：出口节点 HK-N-5 挂掉时 `createByCard` 抛
`SSLError ... Connection closed abruptly`，旧逻辑把它当账号问题，把可用号全标
`exhausted`（usable 2→0）。已由 `is_network()` 修掉；该次把节点轮换到 US-N-2 后恢复。

## 回滚

```bash
git revert <本提交>
# 或服务器上还原 engine/server.py 后：sudo systemctl restart lan-engine
```
