# 对话页流式输出提速 PRD

日期：2026-11-13
组件：`site/components/ChatClient.jsx`、`engine/server.py`、nginx（`/etc/nginx/conf.d/lan.conf`）

## 背景与问题

用户反馈：对话页流式输出「出字一顿一顿」，主要在线上（`https://43-135-10-175.sslip.io`）复现。

**实测基线**（同 prompt「写 300 字雨夜街景」、`x-apex-surge-0505`、maxTokens=600、卡 3861267）：

| 环境 | deltas | chars | TTFT | chars/sec | gap median | p90 | max |
|---|---|---|---|---|---|---|---|
| 线上 | 76 | 582 | 4.46s | 72.3 | 83ms | 175ms | 763ms |
| 本地 | 123 | 810 | 19.2s | 70.1 | 81ms | 157ms | 665ms |

**关键判据**：本地与线上 chars/sec、间隔分布几乎一致（70 vs 72），说明瓶颈不在网络/网关：
- 引擎 `_emit` 每个 delta 都 `wfile.flush()`；
- nginx `lan.conf` 已有 `proxy_buffering off; proxy_cache off;`，`gzip_types` 默认只含 `text/html`，不压缩 `text/event-stream`；
- 站点 `/api/chat` 直通上游流并带 `x-accel-buffering: no`。

结论：**上游模型自身 token 产出速率（≈70 字/秒、≈80ms 一小包、偶发 0.7s 停顿）是主因**；我们的栈只是把这节奏原样透传。

## 目标 / 非目标

- 目标：**消除「一顿一顿」（感知平滑）**；降低 max gap；合并小包减少开销；降低首字延迟；浏览器端不丢帧。
- 非目标（本轮）：不改模型/参数；不承诺「真·2 倍 token 产出」（受上游模型速率硬限）。

## 用户故事

- 作为用户，我希望字连续、平稳地出来，而不是每 0.1~0.7s 蹦一坨。
- 作为用户，我希望点发送后尽快看到第一个字。
- 作为用户，我希望长回复时页面滚动不掉帧。

## 方案设计（三层）

### 1) 前端平滑渲染（`ChatClient.jsx`）——感知平滑的主战场
- delta 只累加到 `ref`，用 `requestAnimationFrame`（或 16–33ms 节流）批量 `setState`，**不再每包重渲染**。
- 流式阶段只做「剥离尾部未闭合 `<sug>`」，**不再对整段累积文本每包跑全量 `splitSug` 正则**（当前 O(n²)）；完成时再完整解析一次。
- 取舍：不用「假打字机」把已有文本慢慢吐（只掩盖不加速，断流会露馅）。

### 2) 引擎 SSE（`engine/server.py`）
- `Handler.disable_nagle_algorithm = True`（TCP_NODELAY），减少小包被 Nagle/延迟 ACK 拖慢。
- delta 合并：40–50ms 窗口内的多个小 delta 合并成一个 `event: delta`；或按累计 ≥24 字触发。降低事件/写次数，减少 max gap。
- `_sse_start` 后立刻写一个注释心跳（`: ok\n\n`）并 flush，强制首包出网。
- 取舍：合并带来 ~40ms 粒度延迟，可接受；窗口过大（>100ms）会显卡，取 40–50ms。

### 3) 代理/网关（nginx）
- 现状已 `proxy_buffering off; proxy_cache off;`，保持。
- 补：`proxy_request_buffering off;`、显式 `tcp_nodelay on;`；确认 `gzip` 不覆盖 `text/event-stream`（现状 OK，可加 `gzip off` 仅对 `/api/chat` 保险）。
- 取舍：已基本到位，改动小、低风险。

## 数据与接口变更

- SSE 协议不变（仍是 `event: delta/...`），只是**合并频率**变化；前端解析兼容。
- 无外部接口/数据变更。

## 边界与异常

- 断流/停止：合并缓冲需在 `stop`/连接断开时立即丢弃，避免残留半包。
- 多段续写（rounds>1）：轮间 `\n\n` 拼接保持；合并逻辑对每轮独立。
- 首包心跳不参与正文。

## 验收标准（可勾选）

- [ ] 浏览器端主观：字连续平稳，无「一坨一坨」。
- [ ] max inter-delta gap：由 ~700ms 降到 **< 250ms**。
- [ ] raw chars/sec：由 ~70 提升到接近上游上限（预计 **+10~25%**，非翻倍）。
- [ ] TTFT 不劣化（尽量下降）。
- [ ] 长回复（≥800 字）滚动不掉帧；停止/断流无残留。
- [ ] 线上（sslip.io）与本地表现一致。

## 测试计划

- 单测：引擎 delta 合并逻辑（窗口/阈值、stop 清理、多轮拼接）——`engine/tests/`。
- 基准：用 `http.client read1` 脚本测 TTFT / chars/s / gap（本地 + 线上），前后对比。
- 组件：`npm run build` 通过；浏览器 DevTools 观察渲染帧率与网络 chunk。
- E2E：真实一轮生成，确认正文完整、`<sug>` 不含裸标签。

## 分期

- P0（本轮）：前端平滑渲染 + 引擎 TCP_NODELAY + delta 合并 + nginx 微调。
- P1（若需真·更高流速）：换更快模型/参数（**需放开「模型与参数」这一项**，用户本轮已排除）。

## 风险与回滚

- 风险：合并窗口过大导致体感延迟 → 固定 40–50ms 并实测调。
- 回滚：
  ```powershell
  git checkout -- site/components/ChatClient.jsx engine/server.py
  # 生产：scp 回旧文件 + systemctl restart lan-engine lan-site
  ssh … "cp /opt/lan/backup-*/server.py /opt/lan/engine/server.py && sudo systemctl restart lan-engine"
  ```

## 关键取舍（需你拍板）

**「流速翻倍」在不换模型的前提下不可达**（实测上游 ≈70 字/秒，本地线上一致）。两条路：
1. 只做本轮栈优化 → 消除卡顿、max gap 大降、raw +10~25%、TTFT 优化（**推荐先做**）。
2. 要真·翻倍 → 需允许换更快模型/参数（例如 Pulse 128K 或更快的 nalang 档），需你放开该限制。
