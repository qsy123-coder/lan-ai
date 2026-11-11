# notes/009 — 同类站「澜」实现记录（2026-11-11）

## 1. 定位

按 `notes/008` 的拆解结果，做一个**四屏核心**的同类站：卡片流 / 卡详情 / 聊天 / 会话列表。
额度不落地到本站——所有生成请求转发到现有「额度池」引擎（`engine/server.py`），由引擎负责挑号、
建会话、预扣与结算。设计语言采用 `design.md` 的**液态玻璃**（纸面 `#F3F2ED` / 场景 `#25414A` / 焦点 `#557B79`）。

## 2. 目录

```
site/
├── app/
│   ├── layout.js            场景层（等高线 + SVG 位移滤镜 #glass-warp）+ 全局样式
│   ├── page.js              首页：卡片网格 / 标签筛选 / 搜索（?q=&tag=）
│   ├── card/[id]/page.js    卡详情：封面 / 标签 / 创作者说明 / 多图 / 开始对话
│   ├── chat/page.js         聊天（server 包装）→ components/ChatClient.jsx
│   ├── about/page.js
│   └── api/chat/route.js    POST → 引擎 :8787/site/chat（SSE 透传）
├── components/
│   ├── Nav.jsx              悬浮玻璃胶囊导航（角色 / 对话 / 关于 + 搜索）
│   └── ChatClient.jsx       三栏聊天：会话列表 / 消息流 / 设置
└── lib/cards.js             卡片库读取（CARDS_FILE，每次读取，热更新）
```

启动：`powershell -ExecutionPolicy Bypass -File start-site.ps1`（前台 `:3100`，引擎 `:8787`）。

## 3. 引擎新增

`POST /site/chat`：`{cardId, prompt, model, maxTokens}`

1. 按 `credit` 升序遍历可用账号（跳过 `exhausted` / `disabled`）
2. `ensure_chat_for_card()`：对「号 × 卡」调 `createByCard(cardId)` 拿 `chatId`，缓存到
   `webstate.json` 的 `site_chats["site:<账号>:<cardId>"]`
3. `generate()` 流式回传 `delta`，完成后 `user.getMe` 结算，`complete` 带 `text / account / credit`
4. 卡不可用 / 余额不足 / 401 → 自动换号继续，全部失败才 `end`

## 4. 数据

- 卡片库：`captures/site/cards.json`（`scripts/seed_cards.py`，从榜单 `competition.awardedCards` 取 id，
  再 `card.getById` 逐张抓：名称 / 封面 / 多图 / 标签 / 创作者 / creatorNotes / 点赞评论）
- 会话与消息：**浏览器 localStorage**（`lg.sessions.v1`、`lg.msgs.v1.<cardId>`），不上服务器

## 5. 验证（2026-11-11 00:30）

| 项 | 结果 |
|---|---|
| 首页 | `200`，渲染 22 张卡 + 标签筛选，见 `out/site/site-home3.png` |
| 卡详情 | `200`，封面/标签/说明完整，见 `out/site/site-card2.png` |
| 聊天 | 通过 UI 发出「在加班，你敲门进来，说一句话。」→ 收到角色长回复，`complete` 带账号 `g01`、余额 69.05，见 `out/site/site-chat2.png` |
| 引擎 | `/site/chat` 首次即通，无需改造既有 `/run` |

## 6. 已知限制

- `chat.getMessages` 未接：刷新后消息只来自 localStorage，不读服务器历史
- 未做登录/多用户：单机自用，鉴权在局域网内视为可信
- 未做搜索后端：首页搜索仅前端过滤（`?q=` 走 server 端过滤同一批卡）
- 卡详情页未展示 `rawdata` 角色本体（接口返回为空，需登录态编辑页）


## 7. 对话质量升级（2026-11-11 01:0x）

对齐 dzmm 聊天体验的六项改造：

| 项 | 做法 |
|---|---|
| **多轮记忆** | 引擎 `normalize_history()`：只留 user/assistant，按 24 条 / 16000 字回撤裁剪，保证以 user 开头；`build_body()` 把历史拼进 `prompts[]`，`content` 仍是最新一句 |
| **建议回复** | 前端解析 `<sug>a｜b｜c</sug>`，正文剔除该段，渲染成可点胶囊；点击即发送 |
| **消息操作** | 悬停出现「复制 / 重生成 / 删除」；重生成会截断到最后一条用户消息并带历史重发 |
| **会话列表** | 按 今天 / 昨天 / 本周 / 更早 分组，带缩略图、末句预览、时间 |
| **模型切换** | 顶栏胶囊下拉（与 dzmm 同位置），右栏保留详细设置 |
| **中断与状态** | 生成中发送键变「■ 停止」（Esc 同效）；顶部实时显示 账号 / 余额 / 切换原因 |

**验证**（真实扣费两轮）：
- UI 连发两轮（"记住我叫阿泽" → "我叫什么"），回复内出现 `<sug>` 三选项并渲染为胶囊
- 直连 `/site/chat` 带 `history` 验证：历史含「我叫阿泽」时，问「我叫什么」→ 回答「阿泽。」（此前无历史时只会答非所问）
- 生成过程自动换号：`g01` 余额不足后切到 `b001`，`complete` 事件带新余额 72.40


## 8. 手机访问与「额度用完为止」（2026-11-11 00:50）

**通路**：手机 → Cloudflare 隧道（HTTPS）→ 本机 Next :3100 → 引擎 :8787 → Clash 7897 → dzmm。

| 项 | 值 |
|---|---|
| 公网地址 | `https://let-msg-rep-len.trycloudflare.com`（quick tunnel，重启即变） |
| 口令 | `lan-4821`（`SITE_PASS`，middleware 拦截全站，未登录 307 → `/enter`） |
| 引擎令牌 | `SITE_TOKEN`（`out/site_token.txt`），Next 转发时带 `x-site-token`，直接打 8787 会 401 |

**额度池接入**（本次新增）：
- `GET /site/pool` → `{total, usable, count, accounts[]}`；顶栏显示「池子 1039.4 · 14/21 号」
- 生成时按 credit 升序挑号，`upgrade_needed/credit` → 标 exhausted → 立刻换下一个号，
  **直到所有号见底**；见底后页面顶部出现「号池额度已用完」横幅
- 公网实测：经隧道 POST `/api/chat` → `g01` 生成完成，credit 64.75 → 63.49，附带 3 条 `<sug>`

**Vercel 的边界（重要）**：
- 引擎跑不了：需要 `curl_cffi` TLS 指纹、本地 Clash 代理、磁盘账号池与长连接 SSE，
  Serverless 三者都不满足；且 Vercel 出网 IP 会被站方风控
- 可行架构只有一种：**Vercel 只托管前端**，`ENGINE_URL` 指向一条稳定隧道（Cloudflare 命名隧道 / 固定域名），
  函数时长需覆盖单次生成（Hobby 默认 60s，长回复会被截断）
- 当前没有 Vercel 凭证（无 `VERCEL_TOKEN`、无 `~/.vercel/auth.json`），所以本次未部署
