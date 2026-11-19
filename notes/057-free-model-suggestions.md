# 057 免费模型（∞ 无限）无底部提示词卡片：修复

日期：2026-11-19
分支：`fix/free-model-suggestions`
相关：`engine/server.py`（`_free_sug` / `_strip_status_blocks` / `suggest_followup` / `run_site_chat`）；前端零改动

## 现象

对话页选「∞ 无限」档（`nalang-turbo-*`）生成完一轮后，底部三个提示词胶囊
（`.sug-chip`）不出现；付费档（Turbo/Flux、Max）正常。

## 根因

- 上游只给 `x-apex-flux-0217-16k`（Turbo/Flux）与 `nalang-max-0826` armed 并下发
  `suggestedReplies`；其余模型（Surge/Pulse/Dash/XL/Medium、`nalang-turbo-*`）都不下
  （notes/018 §3）。
- 付费档靠 `suggest_followup()`（Flux/Max 兜底）补建议；notes/056 落地时给免费档加了
  `not free`，把零扣费模型排除在兜底之外 → 免费模型每轮都没有卡片。
- 实测免费模型对 `SUG_INSTR` 的响应**格式不稳定**：有时吐「建议一/二/三：…」自由文本，
  有时吐「- / 1.」项目符号，有时把 `<StatusBlocks>/<details>` 状态面板写进 `<sug>`，
  有时干脆不吐。

## 修复（只动引擎，前端零改动）

`engine/server.py`：

1. `_strip_status_blocks(text)`：剥 `<StatusBlocks>/<details>` 状态面块（含未闭合尾部），
   与前端 `splitSug.stripStatusBlocks` 对齐；`suggest_followup` 取 tail 前也先剥状态面板。
2. `_free_sug(text)`：免费模型专用。剥状态面板与 `<sug>` 后，把正文尾的「建议X： / - / 1.」
   建议行抠出来（`SUG_ADVICE_RE` / `SUG_BULLET_RE`），`SUG_JUNK_RE` 过滤状态面板垃圾
   （【】、档案、阶段、Mode、天平 等），返回 `(clean_body, items)`。
3. `run_site_chat`：免费分支 `final_text, advice = _free_sug(final_text)`，有建议就
   `_append_sug` 补成 `<sug>a|b|c</sug>`；付费分支原样 `suggest_followup`（Flux/Max）。

零扣费不变：全程只用主生成的既有文本，**零额外模型调用、零扣费、零额外延迟**；
付费链路行为不变。

## 自检

- `python -m py_compile engine/server.py engine/memory.py engine/users.py` 通过；
- `python -m unittest discover engine/tests` 84 项全过。

## 验证（生产，免费模型 `nalang-turbo-1115-16k`，卡 3821218）

`POST /site/chat`，`event: complete` 的 `text` 末尾出现干净 `<sug>` 块：

```
<sug>跟她聊聊天，问问最近工作怎么样，看看她心情如何。|提醒她明天记得早起上班，不要耽误了重要的会议或者客户接待。</sug>
```

`free: true`、`credit` 前后不变（0.02 → 0.02，零扣费）。

## 已知限制

- 免费模型格式不稳定，`_free_sug` 只覆盖「建议X： / - / 1.」三类前缀；模型偶尔吐
  状态面板垃圾或干脆不吐建议时，宁可不显示卡片也不显示垃圾（graceful 降级）。
- 「建议一」常被免费模型漏掉，实际多为 2 条而非 3 条，可接受。

## 回滚

```powershell
git revert <本次提交>
# 或临时关掉建议处理：systemd 里设 SUG_INSTR=0 后重启引擎
```
