# 055 · 重启切断 SSE + 引擎块被误抽成锚点

日期：2026-11-17
分支：`fix/graceful-restart-prefix`
触发：用户反馈「让护士脱下制服露出身体」只流式输出一半就停了
（`card=435777&s=16f8354b-…`）。

## 1. 半截流的原因：部署重启

日志（14:16–14:17）：

```
14:16:47 site: card=435777 session=16f8354b account=b047 chat=9c20ad79 switched=True fresh=True recent=2155
14:16:47 prompt 组装：ctx=16000 out=4000 …
14:17:35 systemd: Stopping Lan engine …
14:17:35 systemd: Started Lan engine …
```

生成进行到一半，引擎被重启（我这边部署 fact_guard），SSE 被直接切断。
上游存档 `b047/9c20ad79` 里只有 3 条：卡片开场、用户消息、**半截 assistant**——
完整正文没有生成完，无法从上游补回。

### 修复

- 引擎处理 SIGTERM/SIGINT：置 `SHUTTING_DOWN`，等待活跃站点生成归零（最多 **100s**），
  然后退出；期间新 `/site/chat` 返回 `engine_restarting`。
- `/health` 增加 `active` 计数，部署前可确认没有在跑的生成。
- systemd drop-in `TimeoutStopSec=120`（默认 30s 会 SIGKILL，第一次测试就是这样被杀的）。

### 真实测试

```
active before restart: 1
收到信号 15：等待 1 个活跃生成结束（最多 100s）
引擎退出（未完成生成 0）
curl exit=0 / complete events: 1 / bytes: 8954
```

在生成中途重启，SSE 仍然完整收到 `event: complete`。

## 2. 附带发现：引擎块被误抽成锚点

该会话的 4 条 auto 锚点是：

```
【长期设定·最高优先级·必须无条件遵守·高于一切剧情与角色原有性格】
1) 私下叫我主人，外人面前叫哥哥
【执行要求】只要用户触发了设定里的条件……
【称呼】对方在账号资料里的显示名……
```

这些是**引擎自己拼进 content 的块**，经历史同步回灌后被 `extract_pins` 当成用户设定，
再注入时出现重复标题、编号错乱（上游 user 消息里能看到
`1) 【长期设定…】 2) 1) 私下叫我主人…`）。

### 修复

- `memory.looks_like_engine_block()`：含引擎标记（【长期设定/【执行要求】/【称呼】/
  【格式要求】/【前情摘要】/【刚才的对话/【接续要求】）的 user 消息不参与锚点抽取。
- `memory.clean_pins()`：读取记忆时过滤这些块，并去掉编号前缀；
  `load_memory` 已接入，下轮保存时自动落盘。
- `scripts/clean_engine_pins.py`：批量清理既有脏锚点（改前备份）。
  线上执行结果：`435777/16f8354b 4 -> 1`，只留
  「私下叫我主人，外人面前叫哥哥」；备份
  `/opt/lan/backup-memory-pins-20261117-142606.json`。

## 3. 用户的恢复方式

半截回复已经在上游会话里，直接在该会话发一句「继续」即可从断点接着写完；
不需要清空会话。

## 4. 测试

- `unittest` **83 tests OK**（新增引擎块抽取/清洗/load 清洗/活跃计数）。
- 线上重启真实测试通过（见 §1）。
- 清理了 2 个 stop-test 会话与临时记忆。
