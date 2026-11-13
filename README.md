# lan-ai

「澜」— 多账号额度池驱动的 AI 对话站。前台四屏（首页 / 卡详情 / 聊天 / 关于）用 Next.js 15 + 液态玻璃视觉；
后端引擎按「号 × 卡」轮换账号池，把一条提示词连续跑穿整池 credit。

本仓库是**代码与文档**，账号池（`accounts.json` / `accounts.md`）、抓包（`captures/`）、运行产物（`out/`）
全部在 `.gitignore` 内，不进版本库。

## 目录

| 路径 | 作用 |
|---|---|
| `engine/server.py` | 引擎：stdlib `HTTPServer` + `curl_cffi`，监听 `127.0.0.1:8787` |
| `web/` | 自用控制台（Next.js 15 App Router，`127.0.0.1:3000`）：账号池可视化管理、跨号连续生成 |
| `site/` | 「澜」前台（Next.js 15，`127.0.0.1:3100`）：首页 / `/card/[id]` / `/chat` / `/about` |
| `scripts/` | 抓包、重放、并发、节点切换、注册、逆向辅助脚本 |
| `notes/` | 每个 procedure / 每轮结论一页（真实现象与判据） |
| `design.md` | 液态玻璃视觉规范 |
| `claude.md` | 项目上下文与作业规范（站点事实、攻击面清单、工作流） |

## 引擎接口

```
GET  /site/pool                          账号池状态 {total, usable, count, accounts[]}
POST /site/chat  {cardId,prompt,model,maxTokens,history?}  -> SSE
GET  /site/memory?cardId=<id>            读记忆
POST /site/memory                        写记忆
```

轮换逻辑：体检 → 按 credit 升序挑号 → `chat.createByCard` 扫卡片（坏的自动拉黑）→ 流式生成 →
`user.getMe` 结算 → 余额不足或 `upgrade_needed/credit` 即换号。会话按「号 × 卡」缓存 chatId，
多轮历史由 `engine/memory.py` 的 `compose_prompts()` 组装（锚点 + 摘要 + 尾巴），前端发送前另做 head/tail 裁剪。

## 启动

```powershell
# 控制台（引擎 8787 + web 3000）
powershell -File .\start.ps1

# 「澜」前台（引擎 8787 + site 3100）
powershell -File .\start-site.ps1

# 停
powershell -File .\stop.ps1
```

首次启动会自动同步源码到 `%LOCALAPPDATA%` 下的运行副本并安装依赖（Next.js 无法在 UNC 共享上构建）。

## 环境

- Python 3.12 + `curl_cffi`
- Node.js 20+ / pnpm
- Windows + Clash/mihomo 混合端口 `127.0.0.1:7897`（出站必须显式走它）

## 抓包链路

```
Chrome --proxy-server=127.0.0.1:8081
   └─> mitmproxy :8081 (upstream -> 127.0.0.1:7897)
          └─> Clash -> 出口节点 -> 目标站
```

`scripts/capture.py` 落 `.flow` 原始流并抽 `/api/*` 成 `captures/<时间>/trpc.jsonl`；
`scripts/replay*.py|mjs` 单发重放；`scripts/burst.py` 并发打点。
