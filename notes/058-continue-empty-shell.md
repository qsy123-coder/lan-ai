# 058 · 「继续」跳回卡片开场：复用的会话是空壳

日期：2026-11-19
分支：`fix/continue-empty-shell`
触发：用户反馈 card 435777「两个少女…」又出现对话割裂，具体是连发两个
「继续」后回复跳回卡片开场。

## 1. 证据

会话 `16f8354b…`（card 435777）当前绑定 b050 / chat `f31a17a1`。上游存档：

```
[0] assistant  卡片开场（病房，len 756）
[1] user       【长期设定…】+「继续」（len 375，无摘要、无最近原文）
[2] assistant  「主人，你刚醒过来…」病房（len 529）
[3] user       【长期设定…】+「继续。从上一段…」（len 432，无摘要、无最近原文）
[4] assistant  「主人想说什么…」病房（len 1097）
```

两个「继续」的回复都落在**病房/刚醒**（卡片开场），而记忆摘要的【当前场景】是
「空教室/望海愤怒流泪/宁音双腿之间红肿」。说明这两个回复**没有拿到摘要和最近原文**，
模型只剩卡片开场 + 「继续」，自然从头演。

引擎日志（free 模型空响应 → 频繁换号）：

```
22:09:27 b048/651e73eb fresh=True  recent=2178
22:09:40 b050/9759f334 fresh=True  recent=2178
22:10:40 b050/9759f334 fresh=False recent=0
22:10:42 b052/ec06c8ad fresh=True  recent=2178
22:10:59 b052/ec06c8ad fresh=False recent=0
22:11:01 b050/f31a17a1 fresh=True  recent=2178
22:11:46 b050/f31a17a1 fresh=False recent=0   ← 第一次真正成功，但没带剧情
22:17:16 b050/f31a17a1 fresh=False recent=0
22:17:17 b052/4d71eabf fresh=True  recent=0
```

## 2. 根因

零扣费（turbo）模型偶发返回空正文（notes/056），引擎换号重试。`ensure_chat_for_card`
会在**生成之前**建好空会话并 `bind_session`。若这一发随后空响应，会话就停留在
「绑定了一个只有卡片开场的空壳 chat」上。

下一次「继续」进来：`reuse` 判定只看「名字 == 绑定号 且 chatId 可读」→ True；
`fresh_chat = not prev_chat or switched` 里 `prev_chat` 就是这条空壳 chat，既不换号、
也不是首次 → `fresh_chat=False` → **不注入摘要、不注入最近原文**。模型上下文里
只有卡片开场，于是「继续」从头演。

## 3. 修复

`run_site_chat` 的 `reuse` 分支加一条 `chat_has_history()`：

- 复用的 chat **没有一条 user 消息**（只有卡片开场）→ `cid_empty=True`；
- `fresh_chat = not prev_chat or switched or cid_empty` → 空壳也按 fresh 处理，
  注入摘要 + 最近原文（【当前场景】是当下的空教室，不再是病房）。
- 日志增加 `empty=` 字段；note 区分「接上原会话」与「原会话为空，重新带入剧情」。

## 4. 验证

- `py_compile` 通过；`unittest` **87 tests OK**（新增 `ChatHasHistoryTest` 3 例：
  只有开场→False、有 user→True、读取失败→None）。
- 上线后看日志：空壳续写会打出 `empty=True fresh=True recent>0`（或 recent=0 但
  摘要已注入）；回复不再跳回病房。

## 5. 已知边界 / 附带

- **前缀泄漏**：`content = 前缀 + prompt` 被上游当成用户消息存进存档（上面 [1][3]
  的「【长期设定…】」就是这么来的）。这是「上游只认 content」的设计副作用，
  notes/055 只治了「引擎块被抽成锚点」的症状，本次不处理泄漏本身。
- `chat_has_history` 读取失败（网络抖动）时返回 None → 保守按「有历史」处理，
  不强行注入，避免正常续写被误判为空壳多注入一次。

## 6. 回滚

```bash
cp /opt/lan/backup-empty-shell-<ts>/server.py /opt/lan/engine/server.py
sudo systemctl restart lan-engine
```
