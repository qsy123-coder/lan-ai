# 048 · 摘要"迟迟不出现"：不推进水位重试 + 前端 complete 后刷新

日期：2026-11-17
分支：`fix/summary-retry-and-refresh`
触发：用户反馈卡 435777「两个少女出现在你面前…」8 轮、11 轮都没有摘要。

## 1. 现场

服务器 `out/memory/435777/`：

| 会话 | summarizedUpTo | summary |
|---|---|---|
| `a310c0e8-…` | 8 | 206 字，**规则摘要**（「称呼/规则：… 他：… 她：…」碎片） |
| `16f8354b-…` | 0 | 空 |

日志（00:34:55）：

```
[warn] b007 建会话遇瞬时错误（HTTP 418），不拉黑卡片
[warn] 摘要降级为规则摘要（8 条）：no_chat
```

## 2. 为什么"没有摘要"

1. **触发门槛是第 9 轮，不是第 8 轮**：检查用的是「本轮提问之前」的历史条数，
   8 轮 = 14 条 < 16；第 9 轮才是 16 条，首次触发。
2. **撞上 418 风控**：摘要要在账号的批处理会话里生成，`ensure_chat` 建会话被
   `HTTP 418 captcha_required` 拒绝 → `no_chat` → 只能落规则摘要（碎片文本）。
3. **失败也推进水位**：规则摘要写回时 `summarizedUpTo` 从 0 推到 `end`，
   下一次模型摘要要再等 `total - up >= 16`，即 **约 8 轮之后**——一次 418 就把
   模型摘要推迟了 8 轮，看起来就是"永远没有摘要"。
4. **面板不刷新**：摘要由 `emit("complete")` 之后的后台线程生成，引擎不推
   `memory_update`；前端只在挂载/切会话时 `loadMemory()`，所以磁盘上明明有摘要，
   记忆面板还是旧的空值。

## 3. 改动

- `engine/server.py` `maybe_summarize`
  - 新增 `model_ok` 标记：只有模型摘要成功才推进 `summarizedUpTo`；
    降级规则摘要只更新 `summary` 文本，水位不动 → **下一轮自动重试模型**。
  - 降级日志补一句「summarizedUpTo 不前进，下一轮重试」。
- `site/components/ChatClient.jsx`
  - `complete` 分支 `save()` 之后 `setTimeout(..., 4000)` 调一次 `loadMemory()`，
    落实 PRD §5.3「complete 后 5 秒主动刷新记忆面板」。

## 4. 验证

- `py_compile` 零错误；`unittest` 56 tests OK。
- 线上用 `verify_summary.py` 跑一次失败路径（`no_chat` 场景）：
  摘要文本写入、`summarizedUpTo` 保持不变；随后成功路径（d041）仍推进到 `end`。
- 前端：`npm run build` 成功，`/chat?card=435777` 200。
- 真实回归：在 435777 继续聊 1 轮，日志出现 `摘要降级…下一轮重试` 后，
  下一轮应重试并（风控解除时）写入 Pulse 摘要；面板 4 秒后自动刷新。

## 5. 回滚

```bash
cp /opt/lan/backup-summary-20261117/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-site-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
