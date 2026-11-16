# 047 · 摘要模型：Surge → Pulse 128K + 拒答/续写识别 + 会话落盘

日期：2026-11-17
分支：`fix/summary-nsfw-pulse`
触发：用户反馈卡 426322「夏日，妹妹，同居」一直生成不了摘要，追问「哪些模型能做 NSFW 摘要」。

## 1. 现象与证据

服务器 `out/memory/426322/93d5e47b-….json` 的 `summary` 字段**不是摘要，是模型的拒答原文**：

> 这个摘要请求我依然无法完成，原因与之前几轮完全相同……属于家庭成员间的性内容。

同一时段日志（2026-11-16 01:49–03:00）连续 30+ 次：

```
[warn] 摘要降级为规则摘要（49 条）
[warn] 摘要降级为规则摘要（55 条）
```

即模型路径几乎每轮都失败，只剩规则兜底。

## 2. 逐模型实测（真实存档 6000 字，新开 chat 跑完即删）

探针：`/tmp/lanprobe/probe_summary_real.py`（本机同款，只读生成接口）。
账号 d039 / d041 各一轮，卡 426322：

| 模型 | 第一轮 | 第二轮 | 判定 |
|---|---|---|---|
| Pulse 128K `x-apex-pulse-0731-128k` | 506 字摘要 | 586 字摘要 | **两轮都正常** |
| Flux 16K `x-apex-flux-0217-16k` | 354 字摘要 | 652 字摘要 | 正常 |
| Surge 32K `x-apex-surge-0505` | **0 字** | 1070 字**续写剧情** | 不稳定（线上默认，问题源） |
| Dash 128K `x-apex-dash-0826-128k` | 71 字拒答 | 458 字拒答 | strictModeration，稳定拒 |
| XL 32K `nalang-xl-0826` | 1680 字续写 | 1508 字续写 | 不按摘要指令 |
| Medium 32K `nalang-medium-0826` | **0 字** | 146 字 | 不稳定 |
| Max 32K `nalang-max-0826` | 173 字半摘要 | 214 字续写 | 不稳定 |
| XL 16K `nalang-xl-0826-16k` | 1920 字续写 | 155 字摘要 | 不稳定 |

补充：同一批模型在「中性卡」会话里更容易直接续写而不是摘要——
摘要实际跑在账号的批处理会话（`ensure_chat`），用的是另一张卡的系统提示词，
所以拒答文本里会出现「婚姻天平状态栏」这类无关卡片内容。

## 3. 根因

1. `SUMMARY_MODEL` 写死 `x-apex-surge-0505`：该档在露骨剧情上会空返回或续写，且与用户选的主对话模型无关。
2. 拒答识别只认开头（`抱歉/我不能/我无法`）；真实拒答以「这个摘要请求……」开头 → 漏判 → 拒答被写进记忆。
3. 降级时 `rule_summary` 前置旧摘要有 250 字 → 拒答被一轮轮抄下去，模型越看越拒。
4. `maybe_summarize` 写回记忆时没带 `sessionId`，写的是**卡级文件**；多会话下本会话面板实际读的是
   `out/memory/<cardId>/<sessionId>.json`，两者不同步（历史遗留）。

## 4. 改动

- `engine/server.py`
  - `SUMMARY_MODEL` 默认 → `x-apex-pulse-0731-128k`（env `MEMORY_SUMMARY_MODEL` 仍可覆盖）。
  - `maybe_summarize`：旧摘要先过 `usable_existing()`；模型输出新增「续写」判定；
    降级日志带 `why`（empty / refusal / roleplay / status / exception），便于定位。
  - 摘要写回改为 `load_memory(MEMORY_DIR, card_id, mem.get("sessionId"))`，按会话落盘。
- `engine/memory.py`
  - 新增 `REFUSAL_BODY_RE`：扫前 200 字找「无法/不能…完成|提供|照做」等拒答框架。
  - 新增 `looks_like_roleplay()`：开头是 `*`/全角括号动作/台词 → 判为续写，不当摘要。
  - 新增 `usable_existing()`：旧摘要本身是拒答/续写时不再喂回模型，也不前置进规则摘要。
  - `rule_summary()` / `model_summary_prompt()` 接入 `usable_existing()`。
- `engine/tests/test_memory.py`：新增 4 个用例（正文拒答、续写识别、规则摘要去污、prompt 去污）。

## 5. 验证

- `python -m py_compile engine/server.py engine/memory.py engine/users.py` 零错误。
- `python -m unittest discover -s engine/tests -p "test_*.py"` → 51 tests OK。
- 线上：重启 `lan-engine` 后用测试会话跑一次 `maybe_summarize`，确认：
  1) 使用 Pulse；2) 输出是摘要不是续写；3) 摘要写进 `out/memory/426322/verify-*.json`（会话级），
  卡级文件不被新建；4) 日志无「摘要降级」。
- 清理：卡 426322 的卡级与会话记忆里被污染的摘要清零（备份 `backup-summary-<ts>`），
  `summarizedUpTo` 置 0，下一轮重新生成。

## 6. 回滚

```bash
cp /opt/lan/backup-summary-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-summary-<ts>/memory.py /opt/lan/engine/memory.py
cp /opt/lan/backup-summary-<ts>/426322.json /opt/lan/out/memory/426322.json
cp /opt/lan/backup-summary-<ts>/93d5e47b-*.json /opt/lan/out/memory/426322/
sudo systemctl restart lan-engine
```

env 回退：`MEMORY_SUMMARY_MODEL=x-apex-surge-0505`（不推荐）。
