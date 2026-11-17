# 054 · 摘要事实守卫 + 批量重修规则碎片 + 测试残留清理

日期：2026-11-17
分支：`fix/fact-guard-repair`
触发：用户确认继续做剩下三项（批量重修 / 事实守卫 / 清理测试残留）。

## 1. 事实守卫

- `memory.fact_guard(summary, context)`：
  - 上下文（锚点 + 卡片开场）里出现「妹妹/哥哥」，而摘要里出现
    `养女/义妹/干妹妹/亲女儿/继女/童养媳` → 判定为关系漂移，拒收。
  - 卡片本身就是该关系（上下文里出现这些词）→ 放行，避免误杀。
- `maybe_summarize` 接入守卫：命中后走规则兜底、**不推进水位**，日志记
  `fact_guard: 养女`。

## 2. 批量重修规则碎片摘要

新增 `scripts/repair_rule_summaries.py`：

- 扫描 `out/memory` 里 `rule/refusal` 摘要；
- 取消息：优先 `out/history/<card>/<sid>.json` 快照，其次上游各 chat 取最长；
- 旧摘要（哪怕是碎片）作为【已有摘要】一起喂，避免丢掉更早剧情；
- 分块 6000 字逐块 Pulse 滚压，校验拒答/续写/事实守卫；
- 写回 `summary` + `summarizedUpTo` + `summaryHash`，改前备份到
  `/opt/lan/backup-summary-<card>-<ts>.json`；
- 卡级旧文件（无 sessionId）默认跳过（会话不读它）。

执行结果：

```
card=430690 a80379bc  7 条 → 353 字  up=5  hasHash=True
card=426322 a9704810  7 条 → 403 字  up=5  hasHash=True
card=435777 卡级       跳过（legacy）
```

## 3. 测试残留清理

删除 3 个空测试记忆：`3861267/aff-test-*`、`aff-rw-*`、`cont-test-*`。

## 4. 全站体检（修复后）

```
摘要类型：empty 22 / ok 5 / rule 1
拒答：0    摘要被预算截断：0
```

剩下的 1 份 `rule` 是 `435777.json` 卡级旧文件（无 sessionId，会话不读它）。

## 5. 测试

- 本地 `unittest` **79 tests OK**（fact_guard 3 例 + 摘要漂移拒收 1 例）。
- 线上真实测试 `scripts/test_memory_live.py`：
  `fresh has_history=False`、接续 `injected=True`、摘要自动换号、
  26 份记忆 `rule=1 refusal/truncated=0`、`RESULT: PASS`。

## 6. 回滚

```bash
cp /opt/lan/backup-fact-guard-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-fact-guard-<ts>/memory.py /opt/lan/engine/memory.py
sudo systemctl restart lan-engine
# 单条摘要回滚：/opt/lan/backup-summary-<card>-<ts>.json
```
