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
- `python -m unittest discover -s engine/tests -p "test_*.py"` → 52 tests OK。
- 线上验证（`/tmp/lanprobe/verify_summary.py`，卡 426322，会话 `verify-20261117`）：
  - d041：`SUMMARY_MODEL=x-apex-pulse-0731-128k`，`ctx=128000`，输出 371 字正经摘要
    （称呼/主奴规则/结衣线都在），`refusal=False roleplay=False`，写入
    `out/memory/426322/verify-20261117.json`，`summarizedUpTo=8`。
  - d038：同一段内容返回 `status=exhausted/model_refused`（上游把拒答放在 SSE
    classification 里），降级规则摘要；说明**摘要账号也可能被拒**，降级日志现在会带
    `status=exhausted/model_refused` 便于识别。
  - `clean_summary` 已剥掉「好的，明白，我将按您的要求…」+ `***` 客套前缀
    （`test_clean_strips_preamble`）。
- 清理：卡 426322 的卡级 `426322.json`（up=188）与会话 `93d5e47b-….json`（up=133）
  的拒答摘要已清零（备份 `/opt/lan/backup-summary-20261117/`），全局扫描 `(none)`。
- 部署：`server.py` 90097B / `memory.py` 21668B 上送 `/opt/lan/engine/`，
  `systemctl restart lan-engine`，`/health` 200；`/` `/chat?card=426322` `/enter` `/about`
  `/site/pool` 全 200。

## 5.1 已知边界

- 摘要仍跑在账号的**批处理会话**（`ensure_chat`，卡 3821218），不是用户这张卡；
  模型可能带上那张卡的语气，但已用 `looks_like_roleplay` 挡掉「直接续写」。
- `model_refused` 是账号级偶发；引擎当前不换号重试摘要，直接降级规则摘要。
  若后续要提升覆盖率，可在 `maybe_summarize` 里失败后换第二个号重试一次。

## 6. 回滚

```bash
cp /opt/lan/backup-summary-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-summary-<ts>/memory.py /opt/lan/engine/memory.py
cp /opt/lan/backup-summary-<ts>/426322.json /opt/lan/out/memory/426322.json
cp /opt/lan/backup-summary-<ts>/93d5e47b-*.json /opt/lan/out/memory/426322/
sudo systemctl restart lan-engine
```

env 回退：`MEMORY_SUMMARY_MODEL=x-apex-surge-0505`（不推荐）。
