# 018 建议回复（每轮三条快捷句）消失：定位与恢复

日期：2026-11-13
分支：`fix/sug-replies`
相关：`engine/server.py`（`build_body` / `generate`）、`site/components/ChatClient.jsx`（`splitSug`，未改）

## 现象

线上对话页每轮结束时原本出现的三个建议胶囊（`.sug-chip`）消失，正文正常。

## 判据链（全部来自真实请求）

### 1) 前端没变

`diff` 生产备份 `/opt/lan/backup-20261113213347/components/ChatClient.jsx`
与当前 `/opt/lan/site/components/ChatClient.jsx`：唯一差异是 rAF 平滑渲染，
`sug` 的解析（`splitSug`）与渲染（`parsed.sug`）一行未动。

### 2) 引擎没吞 sug

`engine/server.py` 只在**回灌**时 `_strip_sug`，对前端 SSE 透传原样。

### 3) 是模型决定的：同卡同问，换模型即无 sug

用 `scripts/probe_sse_shape.py` 直连 `POST /api/chat`，读原始 SSE（同一张卡 3861267、
同一个号 b024、同一句「你好」）：

| 模型 | `sugArmed` | 正文 `<sug>`/`<lug>` | complete.`suggestedReplies` |
|---|---|---|---|
| `x-apex-flux-0217-16k`（旧默认 Turbo） | true | 有 | **有（3 条）** |
| `nalang-max-0826`（Max 32K） | true | 无 | **有（3 条）** |
| `nalang-xl-0826`（XL 32K） | true | 无 | 无 |
| `x-apex-surge-0505`（新默认 Surge 32K） | false | 无 | 无 |
| `x-apex-pulse-0731-128k` | false | 无 | 无 |
| `x-apex-dash-0826-128k` | false | 无 | 无 |
| `nalang-medium-0826` | false | 无 | 无 |
| `nalang-xl-0826-16k` | 未测（同 XL 系推测 same） | — | — |

即：**只有 Flux(Turbo) 与 nalang-max 两个模型会被平台 armed 并下发三建议**；
其余模型即使 `sugArmed=true`（XL）也拿不到 items。

结论：5bd275c（11-13）把默认模型从 `x-apex-flux-0217-16k` 换成 `x-apex-surge-0505`，
Surge 平台侧不 armed 建议块 → 新会话（或没存过模型选择的浏览器）自然没有三胶囊。

### 4) 追加格式要求可强制产出

同一 Surge、同一张卡，content 末尾追加
「正文结束后另起一行输出 `<sug>建议一|建议二|建议三</sug>`」：
流式 token 里出现完整 `<sug>…|…</sug>`，模型按格式照做。

## 修复（只动引擎，前端零改动）

`engine/server.py`：

1. `build_body(..., want_sug=None)`：默认按 `SUG_INSTR`（环境变量，默认开）在 content 末尾追加
   `SUG_FORMAT_HINT`（一行格式要求）；摘要生成与后台批量任务传 `want_sug=False`，避免污染摘要和结果文本。
2. `generate()` 解析 complete 事件：
   `data.suggestedReplies.items` → `_append_sug(text, items)` 兜底补 `<sug>a|b|c</sug>`；
   正文已有 sug 块则跳过（Flux 这类原生吐标签的模型不会重复）。
3. 新增 `_append_sug()`，只保留前 3 条。
4. 格式要求只是「提高概率」，实测模型遵守率约 50%（Surge：5 次里 2 次没吐）。
   因此 `run_site_chat` 在 emit complete 前补一步 `suggest_followup()`：
   主回复没有 `<sug>` 时，用同一账号的**通用会话**（`ensure_chat`，与摘要共用、不污染卡片会话）
   再发一次极短生成（maxTokens=400，`want_sug=False`），prompt 只要求输出三建议；
   拿到 `<sug>` 后拼回正文。**兜底模型固定用会 armed 的 Flux，失败再试 nalang-max**
   （`SUG_MODEL` / `SUG_MODEL_BACKUP` 可覆盖），不再依赖主模型自觉。
   短输出按 token 结算，约 0.1~0.3 credit/次，只在未命中时触发；失败只记 warn，不影响正文。
5. **默认模型改回 Turbo(Flux)**：`engine DEFAULT_MODEL` 与前端 `MODELS[0]` 都改回
   `x-apex-flux-0217-16k`（标签 Turbo 16K）。前端另加一次性迁移
   `lg.model.migrated.v3`：浏览器里仍是旧默认 `x-apex-surge-0505` 的，第一次加载自动切回 Turbo；
   之后用户手动选 Surge 会写回，不再覆盖。
   理由：Flux 是唯一「每轮稳定 armed + 3 条」的默认档；Surge/Pulse/Dash 平台不产建议块。

前端 `splitSug()` 本就把 `<sug>` 段从正文剔除、按 `|` 拆成胶囊（上限 4），无需改动。

## 追加：正文出现登录名「用户d57640」

现象：模型把对方写成「身体微微向用户d57640靠近」。
根因：上游账号资料 `user.getMe.fullName` 是注册时自动生成的 `"用户" + id 前 5 位`
（实测 b024：`fullName = "用户d57640"`，`id = d57640a3-…`），模型把它当称呼用了。

修（`engine/server.py`）：

1. `build_body()` 的 content 末尾固定追加【称呼】规则：显示名只是账号名，正文严禁出现，
   一律用「你」或角色习惯称呼；
2. `_sanitize_user_names()`：`用户[A-Za-z0-9_-]{4,}` → `你`，作用于
   `delta` 事件、`generate_long` 的轮间文本、`run_site_chat` 的 complete 正文。
   正则只匹配「用户 + 4 位以上 ASCII」，不误伤正常文案。

验证（生产）：`complete=1`、`sug=2`、`bad_name_hits=0`，
`/opt/lan/out/last_content.txt` 中 `【称呼】` 规则命中 1 次。

## 验证

- 本机另起引擎 :8790（`DZMM_ROOT=F:\Projects\lan-ai`），`POST /site/chat`
  `{cardId:3861267, model:"x-apex-surge-0505", prompt:"你好", maxTokens:1200}`：
  `event: complete` 的 `text` 末尾出现
  `<sug>把龟头慢慢顶进去，感受肉壁一层层裹上来的紧致|让她自己往后坐，把整根肉棒吞到底|先只进一个龟头，然后停下来问她痒不痒</sug>`。
- 只加格式要求、没有兜底时：5 次里 2 次没吐（4000 tokens 时 1/3），不可用。
- 加上 `suggest_followup` 兜底后，生产机连续 3 次：`sug=1 / 1 / 1`，每次都带 3 条。
- 公网链路（`https://43-135-10-175.sslip.io/api/chat`，cookie `lg_pass=…`）实测
  `event: complete` 的 `text` 末尾同样带 `<sug>…|…|…</sug>`。
- `python -m py_compile engine/server.py` 通过；`unittest discover -s engine/tests` 34 项全过。

## 回滚

```powershell
git checkout -- engine/server.py          # 本地
# 生产：
scp 备份 server.py 回 /opt/lan/engine/server.py && sudo systemctl restart lan-engine
# 或临时关掉注入：systemd 里设 SUG_INSTR=0 后重启引擎
```
