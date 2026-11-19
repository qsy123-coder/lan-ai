# 063 · 上游注入 <system-reminder> 场景追踪块，漏进网页聊天

日期：2026-11-20
分支：`fix/scene-reminder-strip`
触发：用户反馈 card 435777「两个少女」的正文中间出现一段
`<system-reminder>```yaml 当前场景要素 …```</system-reminder>` 标签。

## 1. 证据

上游存档 `b033/2c6b6ebe` 的 assistant 消息 [14] / [16] 里，正文中间夹着：

```
*…像被看不见的磁场操控的星屑。*  <system-reminder>
```yaml
当前场景要素:
- 在场人物: 你(用户64288e), 望海(…), 宁音(…)
- 当前动作: 你正在舔舐/吮吸…
- 当前姿势: …
- 场景细节: …
- 建议行动方向: 继续性行为…
```
</system-reminder>
你的拇指在宁音湿润的嘴唇上缓缓滑动…
```

定位方法：grep `engine/` + `site/` 全部源码，`场景要素 / system-reminder / 建议行动` 零命中；
再逐条拉 card 435777 的 24 条上游 chat，命中都在 **assistant** 消息里。
结论：这个块是**上游 dzmm 自己注入的场景追踪**（并非澜站代码），随正文一起流式返回、
一起存进上游存档。澜站原样转发，于是以字面标签漏进网页。

## 2. 修复

- `engine/server.py`
  - 新增 `SYSTEM_REMINDER_RE` / `SYSTEM_REMINDER_STRAY_RE` + `_strip_system_reminder()`
    （对齐前端 `splitSug`：闭合块整删，未闭合尾部从开标签砍到结尾，再清裸标签）。
  - `generate()`：拼接完正文后先剥一次，`complete` 事件出去的正文干净。
  - `fetch_chat_messages()`：回读存档时同样剥，`/site/history` 返回的历史不带这个块。
- `site/components/ChatClient.jsx`
  - `splitSug()` 增加 `stripSystemReminder()`，流式揭示 + 历史回放 + localStorage 落地
    三层都干净（与 `<sug>`/`<StatusBlocks>` 同一套处理）。

## 3. 验证

- `py_compile` 通过；`unittest` **90 tests OK**（新增 `SystemReminderStripTest` 3 例）。
- `next build` 通过（BUILD_EXIT=0）。
- 单测断言：`星屑。* <system-reminder>…</system-reminder> 你的拇指` → 剥掉块后保留
  「星屑」与「你的拇指」；未闭合 `正文 <system-reminder> 未闭合` → `正文 `。

## 4. 已知边界

- 上游仍会把块写进它自己的存档（dzmm 侧），澜站只能做到「转发/回读时剥掉」。
- 流式过程中，块在 `</system-reminder>` 闭合前会短暂露在 `accRef` 里；`complete` 事件
  用剥干净的正文覆盖，前端 `splitSug` 也即时剥，最终不显示。

## 5. 回滚

```bash
cp /opt/lan/backup-scene-strip-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-scene-strip-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
