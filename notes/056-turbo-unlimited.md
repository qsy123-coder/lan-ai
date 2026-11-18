# 056 · turbo 零扣费（无限额度）接入 Web

日期：2026-11-19
分支：`feat/turbo-unlimited`
来源：本机 `C:\Users\WINDOWS11\Desktop\新建文件夹 (7)\dzmm\`
（`INTEGRATION_WEB.md` / `unlimited.py` / `README.md`）——外部实测稿，
本仓库只负责把结论落到「澜」的引擎与前台，不改动账号池方案。

## 1. 结论

上游对 `nalang-turbo-*` 系列**不做积分扣减**。外部稿件给的对照（同一账号、同一分钟）：

| 模型 | 扣费 |
|---|---|
| `nalang-turbo-1115-16k` / `1115-10k` / `1115` / `0826-*` | 0.00 |
| `x-apex-surge-0923-b-16k` | 2.22 |
| `x-apex-xl-1110` | 1.79 |
| `nalang-max-0826` | 2.30 |

外部压测：12 次对话、11 次成功，余额 `91.47 → 91.47`，总扣费 0.00。

> 这是外部的实测数字，本仓库的账号没有逐号复验。落地时加了两道保险：
> ① `scripts/verify_free.py` 可随时自检；② 引擎在每次免费生成后比对 `getMe`
> 的 credit，一旦发现扣费立即写 `warn` 日志（`零扣费模型出现扣费`）。

## 2. 与账号池方案的关系

两条链路并行，互不污染：

| 模式 | 模型 | 账号要求 | 本站积分 | 后台摘要 |
|---|---|---|---|---|
| 无限模式（新） | `nalang-turbo-*` | 任意未停用号，**不看余额** | 不扣 | turbo（零扣费） |
| 额度池（原样） | apex / nalang 付费档 | `credit ≥ 3.2` | 生成成功扣 2.1 | Pulse 128K |

免费模式下的关键差异（`engine/server.py: run_site_chat`）：

- 候选账号只过滤 `disabled`，**不过滤 `exhausted` 与 `< MIN_PREPAY`**；
- 不做站内积分预检查，成功后也不扣站内积分；
- **不做建议兜底**（`suggest_followup` 会额外打 Flux/Max，属于付费请求）；
  主生成本身仍带 `SUG_INSTR`，模型自己吐 `<sug>` 块时照常展示；
- `upgrade_needed` 不落 `exhausted`，避免把零余额号写脏、影响付费链路；
- 后台摘要切到 `MEMORY_SUMMARY_MODEL_FREE`（默认 `nalang-turbo-1115-16k`），
  候选账号同样不看余额。

## 3. 代码改动

| 文件 | 改动 |
|---|---|
| `engine/server.py` | `FREE_MODELS` / `FREE_MODEL_PREFIX`；`is_free_model()` / `model_meta()`；`SUMMARY_MODEL_FREE`；`summary_accounts(..., free=)` / `maybe_summarize(..., free=)` / `start_summary(..., free=)`；`run_site_chat` 免费分支；`complete` 事件新增 `free` / `model` 字段 |
| `site/components/ChatClient.jsx` | 模型列表前置 3 个 `∞ 无限` 档；`isFreeModel()`；完成提示显示「无限模型零扣费」；号池见底提示在无限模式下不再显示；头部徽标显示「∞ 零扣费」 |
| `scripts/verify_free.py` | 零扣费自检：连续 N 次 turbo 生成，前后比 credit，结束删测试会话 |

引擎侧 `MODELS` 现在包含 `free: true` 的条目，`/health` / `/pool` 会一并返回，
将来 Web 控制台想读模型列表也能直接识别。

## 4. 用法

```powershell
$PY = "C:\Users\WINDOWS11\AppData\Local\Programs\Python\Python312\python.exe"

# 单次自检（3 次对话，零扣费才返回 0）
& $PY scripts\verify_free.py

# 指定号 / 卡 / 次数
& $PY scripts\verify_free.py --account b020 --card 3821218 --times 5
```

自检通过的标准（与 `CLAUDE.md` 的 verify 三判据对齐）：

1. 每次生成 `status=ok` 且正文非空；
2. `credit` 前后相等（差额 0.00）；
3. `out/verify_free.jsonl` 里有对应记录，`verdict: true`。

站点侧：模型下拉选「∞ 无限 16K（0 积分）」，完成提示应为
`完成 · 无限模型零扣费`；号池余额不会变化。

## 5. 回滚

```powershell
# 代码
git checkout -- engine/server.py site/components/ChatClient.jsx
git rm --cached scripts/verify_free.py   # 或直接删除该文件

# 运行态：把前端模型切回任意付费档即可（免费档只是列表里的额外选项）
```

如果线上发现 turbo 开始扣费（引擎日志出现 `零扣费模型出现扣费`）：

1. 立即把前台模型切回 `Turbo 16K`（Flux）或其它付费档；
2. 跑 `scripts/verify_free.py` 确认；
3. 需要彻底关掉时，把 `FREE_MODELS` 置空 / 从 `MODELS` 移除即可，
   `is_free_model()` 不会命中任何 id，所有请求回到原付费链路。

## 6. 已知限制

- turbo 是最低档模型，长文与复杂推理弱于 apex；需要强模型时仍走额度池。
- 上游随时可能修复这档「零扣费」，所以引擎侧保留了扣费告警日志。
- 同一 `chatId` 并发生成仍会被上游 409，原有会话锁不变。
- **`nalang-turbo-0826-16k` 偶发空正文**：实测两次里有一次「HTTP 200 + complete 但 0 字」。
  引擎侧已加兜底（免费模式空正文 → 换号重试），前台下拉只暴露
  `1115-16k` / `1115-10k` 两档，0826 仍留在引擎 `FREE_MODELS` 供 API 显式指定。
- `scripts/verify_free.py` 遇到 409 会自动等 5s 重试一次；两轮之间也留 1.5s 冷却。

## 7. 本机实测（2026-11-19）

出口：`🇭🇰 香港Anytls 05`（7897）。

```
账号 b020（uid 脱敏）  credit 0.71（低于 3.2 的常规门槛，付费链路本不可用）
模型 nalang-turbo-1115-16k   #1 ok 679 字
结果：成功 1/1，credit 0.71 → 0.71，扣费 0.00 → 零扣费成立
清理自检会话：ok
```

第二档 `0826-16k`：`credit 0.71 → 0.71`，扣费 0.00；两轮里一轮空正文，
按上面第 6 条处理。

第三档 `1115-10k`：`#1 482 字 / #2 167 字`，credit 仍 `0.71 → 0.71`；
`#3` 时出口 IP 命中 `418 captcha_required`（跟节点走，不是账号问题），
按 `CLAUDE.md` 换节点即可。`verify_free.py` 已把 418 单独识别并提示换节点。

> 空正文与 418 都不是「模型扣费」：三次运行的 credit 前后都是 `0.71`。
