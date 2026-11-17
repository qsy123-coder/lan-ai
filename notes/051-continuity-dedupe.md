# 051 · 剧情连续性：发送去重 / 换号补前文 / 摘要哈希水位 / 当前场景

日期：2026-11-17
分支：`fix/continuity-dedupe`
触发：用户上传「夏日,妹妹,同居」会话（120 条 / 61 轮），指出刻晴 cosplay 之后剧情突然跳回
「美羽/更衣室」和「玄关回家」。

## 1. 现象与证据

上传快照（`out/history/426322/93d5e47b….json`）：

```
[113] 用户：你来cos一下原神里的刻晴好吗…
[114] 角色：换刻晴cos服、以玉衡星口吻做爱（完整）
[115] 用户：刻晴！最爱刻晴了，我要把你抱起来操
[116] 用户：（与 115 逐字相同，重复发送）
[117] 角色：突然回到「美羽 / 更衣室 / 躲人」旧线
[118] 用户：伊一帮我口交
[119] 角色：又跳回「放学回家 / 玄关跪下」更早的场景
```

当前摘要（342 字）最后两段正好是：

> …当面向**美羽和玲奈**发出邀约——请她们放学后去**旧校舍储物室**…
> **放学回家途中**…随后她**牵你回家**…

[117] 落在「美羽/储物室」，[119] 落在「回家/玄关」——说明这两次回复是**按摘要续写**，
而不是接着 [114] 的刻晴剧情。原因链：

1. 同一句话发了两次（115/116）：`busy` 是异步 state，双击/重试会重复提交。
2. 每次请求按余额挑号；两次请求可能落到不同账号，上游每个账号的 chat 独立。
3. 引擎只发 `content`（`prompts` 被上游忽略），新 chat 里唯一的“前文”就是摘要。
4. 摘要停在美羽/回家阶段（且 `summarizedUpTo=166` 与客户端 120 条已错位），没有刻晴段。
5. 锚点「从上一段最后一个字往下写」在新 chat 里没有“上一段”，模型只能抓摘要。

## 2. 改动（按优先级）

1. **发送去重**（`site/components/ChatClient.jsx`）
   - `busyRef` 同步锁；2 秒内同文本不重复发送。
2. **换号补前文**（`engine/server.py`）
   - `recent_turns_text()`：取最近 4 条原文（每条 ≤500 字）。
   - `build_body(..., recent_text=)`：在记忆前缀后注入
     `【刚才的对话·原文·用于衔接，不要复述】…`。
   - 触发条件：会话已绑定 chat 但本轮落到别的账号/chat，或新会话但客户端带了历史。
3. **摘要水位改消息指纹**（`engine/memory.py`）
   - 新增 `msg_id()` / `summary_up()`：按 `summaryHash` 在历史里反查截止点；
     找不到（被裁/换会话）回落到 0；老数据无 hash 时校验 `summarizedUpTo` 边界。
   - `should_summarize` / `summary_window` 支持传入 `up`。
   - 只有模型摘要成功才写 `summaryHash`；降级不推进。
4. **摘要强制带当前场景**
   - `ensure_scene()`：摘要末尾没有 `【当前场景】` 就用窗口最后一条 assistant 前 80 字补上。
   - `model_summary_prompt()` 明确要求最后一行写「【当前场景】地点/人物/正在发生/下一步」。
5. **每轮日志**
   - `site: card=… session=… account=… chat=… switched=… recent=…`，割裂时可直接定位换号。

## 3. 验证

- `py_compile` 零错误；`unittest` **59 tests OK**（新增 summaryHash / ensure_scene / up 用例）。
- 离线脚本：`build_body` 注入原文；`ensure_scene` 兜底；`summaryHash` 能定位回 end=8。
- 线上实测（测试会话 `cont-test-…`，卡 3861267）：
  - `/opt/lan/out/last_content.txt` 开头出现
    `【刚才的对话·原文·用于衔接，不要复述】用户：刻晴！…角色：*她换上了刻晴的cos服…*`
  - 日志：`site: card=3861267 session=cont-tes account=b048 chat=c2a18897 switched=False recent=48`
  - 测试会话已清理；页面全 200。

## 4. 已知边界

- 发送去重窗口 2 秒：更慢的重复点击仍可能发出第二条。
- 换号补的是“最近 4 条原文”，更早剧情仍依赖摘要；摘要质量决定长跨度衔接。
- `summaryHash` 找不到时从头摘要，长会话可能重复压缩一次（安全方向）。
- 摘要里若出现错误事实（如「养女」），仍会被注入；事实守卫尚未实现。

## 5. 回滚

```bash
cp /opt/lan/backup-continuity-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-continuity-<ts>/memory.py /opt/lan/engine/memory.py
cp /opt/lan/backup-continuity-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
