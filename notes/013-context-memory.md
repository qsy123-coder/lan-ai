# 013 长对话记忆增强（P0）

日期：2026-11-13
PRD：`docs/context-memory-prd.md`

## 问题

十几个回合后角色忘记用户中途设定（称呼规则、剧情走向、性格覆盖），回退到卡片作者写的基础人设。
根因是三层滑窗叠加且没有持久记忆层：

1. 前端 `ChatClient` 只发 head 2 条 + 尾部 11000 字；
2. 引擎 `normalize_history` 再按 48 条 / 30000 字裁；
3. 上游按 `maxContext`（16K/32K token）再裁，`maxTokens` 还预留 4000–8000。

卡片人设每轮重新注入，所以基础人格（妹妹叫你哥哥）永远在；用户设定只在 history 里，被裁即消失。

## 方案（四层）

| 层 | 实现 |
|---|---|
| 模型层 | `MODELS` 增加 32K/128K 档与 `ctx`（64K 为 VIP3，未默认开放）；默认 `x-apex-surge-0505`（32K）；旧 label（turbo/medium/xl/max）保留别名 |
| 锚点层 | `engine/memory.py: extract_pins / merge_pins`，从用户消息抽「以后/记住/设定/称呼…」，20 条 / 1500 字上限，manual 优先 |
| 摘要层 | `maybe_summarize`：每 16 条消息把被裁区间压成 300–600 字；模型摘要走该账号的**批处理 chat**，失败降级 `rule_summary`；后台线程，不阻塞 SSE |
| 预算层 | `compose_prompts`：`budget = ctx - maxTokens - 1200`；head → 记忆块 → tail；记忆块预算先扣；超出从最老成对消息丢 |

注入结构：

```
head（卡片开场，最多 6 条）
user: 【长期设定·始终有效】… / 【前情摘要】…
assistant: （已记住…）
tail（预算内最近对话）
user: 当前输入
```

## 改动文件

- 新增 `engine/memory.py`
- 新增 `engine/tests/test_memory.py`（17 项）
- `engine/server.py`：模型表、动态预算、`build_body` 注入记忆、`run_site_chat` 读写记忆、后台摘要、`/site/memory` GET/POST
- `site/components/ChatClient.jsx`：前端不再 head/tail；模型带 ctx 并持久化；记忆面板；`<sug>` 回灌前剥离
- 新增 `site/app/api/memory/route.js`
- `site/app/globals.css`：记忆面板样式

## 运行时数据

`out/memory/<cardId>.json`

```json
{"version":1,"cardId":426322,"pinned":[{"id":"...","text":"...","source":"manual"}],
 "summary":"...","summarizedUpTo":42,"updatedAt":0}
```

已给卡 426322 写入一条示例锚点：`私下叫主人，外人面前叫哥哥`（面板可删）。

## 验证

```powershell
$py = "C:\Users\WINDOWS11\AppData\Local\Programs\Python\Python312\python.exe"
& $py -m unittest discover -s engine\tests -v
# 17 tests OK，含「第 5 轮规则 50 轮后仍在」与「无记忆层时规则丢失」反证

# 前端
$p = Join-Path $env:LOCALAPPDATA 'dzmm-site'
robocopy F:\Projects\lan-ai\site $p /E /XD node_modules .next /NFL /NDL /NJH /NJS /NP
Push-Location $p; node node_modules\next\dist\bin\next build; Pop-Location
# 编译通过，/api/memory 路由存在
```

接口实测：

```text
GET  /site/memory?cardId=426322   -> 200 {"memory":{...}}
POST /site/memory {"pinned":[...]} -> 200，落盘 out/memory/426322.json
Next GET /api/memory?cardId=426322 -> 200 透传成功
POST /site/chat（无账号）          -> event: memory 带自动抽取的锚点，随后 end no_credit
```

## 回滚

1. 删 `out/memory/`；
2. `ChatClient.jsx` 恢复 head/tail 与 4 个模型；
3. `server.py` 恢复 `MODELS` / `build_body`；
4. 无数据库变更，无需迁移。

## P1 增补（同日）

- 摘要分块：`chunk_messages(messages, 6000)`；段数 > 4 时前几段先规则压缩，模型只处理最后 4 段，控制 credit。
- 摘要衔接：`model_summary_prompt(..., recent=...)` 带上窗口后 2 条保留消息，避免摘要“断头”。
- 记忆面板：新增「导出 / 导入」（`memory-<cardId>.json`），用于换设备迁移与备份。
- 摘要刷新：`complete` 后 5s / 15s / 30s 各拉一次 `/api/memory`，覆盖后台摘要完成时间。
- 单测 19 项全过。

## 部署（本机）

```powershell
powershell -ExecutionPolicy Bypass -File start-site.ps1 -NoOpen
# 前台 http://127.0.0.1:3100  口令见 out\site_pass.txt
# 引擎 http://127.0.0.1:8787
# 停止：powershell -File stop.ps1 -Port 3100 -EnginePort 8787
```

实测：`/api/memory?cardId=426322` 200；`/api/pool` 200（`count:0`，本机无 accounts.json）；`/chat?card=3212165` 200。

## 已知限制

- 记忆按 `cardId` 存；同卡开新故事会沿用旧记忆，需手动「清空记忆」（P2 加 sessionId）。
- 模型摘要使用账号池的批处理 chat，会产生一次额外生成费用；余额不足自动降级规则摘要。
- 摘要结果 300–600 字，早期细节会随滚动摘要淡出，属于设计取舍。
