# 057 免费模型（∞ 无限）无底部提示词卡片：修复

日期：2026-11-19
分支：`fix/free-model-suggestions`
相关：`engine/server.py`（`suggest_followup` / `run_site_chat`）；前端零改动

## 现象

对话页选「∞ 无限」档（`nalang-turbo-*`）生成完一轮后，底部三个提示词胶囊
（`.sug-chip`）不出现；付费档（Turbo/Flux、Max）正常。

## 根因

- 上游只给 `x-apex-flux-0217-16k`（Turbo/Flux）与 `nalang-max-0826` 两个模型
  armed 并下发 `suggestedReplies`；其余模型（Surge/Pulse/Dash/XL/Medium、
  `nalang-turbo-*`）都不下（notes/018 §3 实测表）。
- 引擎兜底：主回复没吐 `<sug>` 时调用 `suggest_followup()` 用 Flux/Max 补三条建议。
  但 `run_site_chat` 的调用条件是 `if SUG_INSTR and not free and ...` ——
  `not free` 把零扣费的 `nalang-turbo-*` 排除在外（notes/056 落地时为了不把「无限」
  变成「每轮偷偷打一次付费 Flux/Max」刻意跳过）。
- 于是免费模型只剩 `SUG_FORMAT_HINT` 让模型自觉吐 `<sug>`（约 50% 命中率），
  命中率之外的那一半自然没有卡片。

## 修复（只动引擎，前端零改动）

`engine/server.py`：

1. 新增 `SUG_MODEL_FREE`（默认 `nalang-turbo-1115-16k`）与
   `SUG_MODEL_FREE_BACKUP`（默认 `nalang-turbo-0826-16k`），环境变量可覆盖。
2. `suggest_followup(pool, st, name, text, stop_event=None, free=False)`：
   - 付费模式走原逻辑（Flux → Max，靠 `suggestedReplies` armed）；
   - 免费模式改用零扣费模型，prompt 显式要求只输出一行
     `<sug>建议一|建议二|建议三</sug>`（`want_sug=False`，自带格式要求）；
   - 免费模型偶发不带 `<sug>` 标签时，把整段按 `|` / 换行拆成候选兜底，
     每条 `len ≤ 40` 过滤，最多取 3 条。
3. `run_site_chat` 调用条件去掉 `not free`，改为
   `if SUG_INSTR and not SUG_BLOCK_RE.search(final_text)`，并传 `free=free`。

零扣费保障不变：免费建议兜底用零扣费模型，不额外打付费 Flux/Max；
若上游哪天把 turbo 也改扣费，结算前的 `getMe` + `free_watch` 照常告警
（建议兜底仍排在结算前）。

## 自检

- `python -m py_compile engine/server.py engine/memory.py engine/users.py` 通过；
- `python -m unittest discover engine/tests` 84 项全过。

## 验证判据（部署后）

`POST /site/chat` 选免费模型，`event: complete` 的 `text` 末尾带
`<sug>…|…|…</sug>` 且 `free: true`；付费档行为不变。

## 回滚

```powershell
git revert <本次提交>
# 或临时关掉建议注入：systemd 里设 SUG_INSTR=0 后重启引擎
# 免费模式退回「只靠主生成 SUG_INSTR 自觉吐 <sug>」的老行为
```
