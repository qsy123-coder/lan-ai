# 016 前端去裁剪 + 锚点精度（PRD P0 收尾）

日期：2026-11-13
分支：`fix/memory-full-history`
PRD：`docs/context-memory-prd.md` §4.3 / §4.5 / §5.4 / §7

## 为什么要做

PRD P0 的代码大部分已落地（模型表、记忆落盘、面板、后台摘要、`content_prefix` 注入），
但有两处没对齐，直接跑 50 轮验收会得到不可信的结果：

1. **前端仍在做 head/tail 裁剪**（`ChatClient.jsx:424-443`，`HEAD_KEEP=2` + `TAIL_BUDGET=11000`）。
   引擎只能收到头 2 条 + 尾部约 1.1 万字，`summary_window()` 永远看不到中段，
   `summarizedUpTo` 的索引随 tail 组合漂移，摘要层等于空转。
2. **锚点抽取误伤日常台词**。原 `PIN_RE` 把 `主人/哥哥/姐姐` 直接当触发词；
   实测 21 条不同日常台词即可把最早下达的真规则挤出 20 条上限（`real_kept=false`）。
   全量 history 上线后扫描面更大，问题只会更严重。

## 改动

| 文件 | 改动 |
|---|---|
| `site/components/ChatClient.jsx` | `send()` 不再 head/tail；改 `slice(-200)`；助手消息回灌前 `splitSug()` 剥 `<sug>` |
| `engine/memory.py` | `PIN_RE` 拆成 `STRONG_RE` / `WEAK_RE` / `DIRECTIVE_RE`；锚点带 `weight`；超限先淘汰弱锚点；切句保留分隔符，问句不再落锚点 |
| `engine/tests/test_memory.py` | 新增 6 项：日常台词不落锚点、弱触发+指令才落、真规则扛住 20 条台词、弱锚点先淘汰、多句追问、带设定词的问句 |
| `scripts/e2e_memory_50.py` | 新增 50 轮验收脚本（标准库，直打 `/site/chat`，落 `out/e2e_memory_50.jsonl`） |

### 锚点分层

```text
强触发（直接落锚点，weight=2）：
  以后/从今以后/从现在起/接下来/记住/设定/规则/约定/不许/必须/永远/一直/剧情都/每次都
弱触发（必须与指令同句，weight=1）：
  称呼/叫我/主人/哥哥/姐姐
指令词：
  叫我/称呼/必须/不许/记住/规则/约定/私下/只有/外人/别人/面前/时候/以后/每次
```

淘汰顺序：弱锚点 → 最旧的强锚点 → 手动锚点（仅在前两者都没有时）；
这样「以后私底下叫我主人」这类早期规则不会被后面的日常台词挤掉。

## 验证

```powershell
python -m unittest discover -s engine\tests
# Ran 28 tests ... OK
```

误抽回归（同一批 21 条日常台词）：

```text
改动前：merged_count=20, real_kept=false
改动后：merged_count=1,  real_kept=true，只剩「以后私底下叫我主人…」
```

12 轮集成冒烟（卡 3821218，真打上游）：

```text
round 01-04  pins=0
round 05    下发「以后私底下叫我主人…」 → pins=1
round 08    下发「接下来剧情走海边旅行」 → pins=2
round 10    追问「现在该怎么称呼我？」 → PROBE PASS
round 11-12 summary 163→600 字，summarizedUpTo=6，无回退
```

同时修正了冒烟脚本的 SSE 解析：原实现收到 `event: complete` 这一行就 break，
没读到后面的 `data:`，导致误判「没有 complete」。`scripts/e2e_memory_50.py` 已按
「读完 data 再 break」实现。

## 50 轮验收结果

命令（2026-11-13 20:37–20:44，卡 `3821218`，真打上游）：

```powershell
python -I scripts\e2e_memory_50.py --card 3821218 --rounds 50 --reset --max-tokens 200 --delay 0.5
```

```text
exit 0 · failures=[] · elapsed 438s
round 05  下发「以后私底下叫我主人…」        → pins=1
round 08  下发「接下来剧情走海边旅行」        → pins=2
round 10/20/30/40/50  追问「现在该怎么称呼我？」 → 5/5 PROBE PASS
全程未出现「初次见面 / 第一次见 / 重新介绍 / 重新开场」
跨号 b009→b010→b011→b012→b014→b016 记忆仍生效
summary 600 字封顶；summarizedUpTo 0→6→…→86 单调不减
最终 pins 仅 2 条（真规则 + 剧情线），追问没有落锚点
```

结论：前端去裁剪后，引擎终于能看到完整中段；摘要从第 9 轮开始滚动，
跨 6 个账号仍保持同一套锚点与摘要，50 轮追问全部正确。

原始记录：`out/e2e_memory_50.jsonl`（`out/` 不入 git）。

## 回滚

```powershell
git checkout -- site/components/ChatClient.jsx engine/memory.py engine/tests/test_memory.py
Remove-Item scripts/e2e_memory_50.py
# 清运行副本后重新构建
Remove-Item "$env:LOCALAPPDATA\dzmm-site\app","$env:LOCALAPPDATA\dzmm-site\components","$env:LOCALAPPDATA\dzmm-site\lib","$env:LOCALAPPDATA\dzmm-site\public" -Recurse -Force
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```

记忆文件无需迁移；`weight` 是可选字段，旧文件按强锚点处理。
