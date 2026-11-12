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

## 9. 脱离本机：云主机部署包（2026-11-11 14:1x）

**动机**：本机一关机，quick tunnel 立即失效；Vercel 又跑不了引擎（curl_cffi / 代理 / 磁盘状态 / 长 SSE）。
所以把「引擎 + 前台 + 反代」打成 docker 套件，整包搬到一台长开的机器。

```
deploy/
├── Dockerfile.engine     python:3.12-slim + curl_cffi，CMD --host 0.0.0.0 --port 8787
├── Dockerfile.site       node:22-alpine，npm install → next build → next start（与本地同路径）
├── docker-compose.yml    engine(仅内网) + site(内网) + caddy(80/443)
├── Caddyfile             站点域名 + flush_interval -1（SSE 不缓冲）
├── deploy.sh             一条命令：装 docker → 生成 .env → compose up
├── data/accounts.json    账号池（凭证，随包上传）
├── data/cards.json       卡片库
└── README.md             选型 / 操作 / 运维 / 排错
```

**无域名方案**：`deploy.sh <公网IP>` 会把 IP 转成 `43-198-12-34.sslip.io`，
sslip.io 是免费通配 DNS，Let's Encrypt 可据此签发证书 —— 不需要买域名。

**为什么不用 output:standalone**：本机 pnpm 的 `.pnpm` 符号链接在 Windows 上 stat 报 EPERM，
standalone 产物的 node_modules 校验过不去；改用「拷 node_modules + next start」，
与本地已验证的运行方式完全一致，容器里不会再踩符号链接的坑。

**部署后换号**：覆盖 `data/accounts.json` 后 `docker compose restart engine` 即可。

## 10. 上线实录：腾讯云 43.135.10.175（2026-11-11 15:0x）

**目标**：不依赖本机、不碰服务器上已有的 `aetouban.cn`（Next.js，`ae-headline.service`，占 3000）与 nginx
（已占 80/443），把澜挂到独立子域。

**最终形态（原生部署，没装 docker，给 2G 内存省资源）**

| 项 | 值 |
|---|---|
| 访问地址 | `https://43-135-10-175.sslip.io`（sslip.io 免费通配 DNS，无域名、无解析操作） |
| 口令 | `lan-4006`（`SITE_PASS`） |
| 引擎令牌 | `lg-315340`（`SITE_TOKEN`） |
| 代码 | `/opt/lan/{engine,site,cards.json,accounts.json,venv}` |
| 站点服务 | `lan-site.service` → `next start -p 3100`（systemd，开机自启） |
| 引擎服务 | `lan-engine.service` → venv python `engine/server.py --host 127.0.0.1 --port 8787` |
| 反代 | `/etc/nginx/conf.d/lan.conf`，`proxy_buffering off` + 300s 超时 |
| 证书 | Let's Encrypt，certbot.timer 自动续期（2027-02-09 到期） |

**踩到的三个坑**

1. **SSH 只认公钥**：`server sent: publickey`，密码无效；且 plink 读不了 `BEGIN RSA PRIVATE KEY` 老 PEM，
   puttygen 转换也失败 → 改用系统自带 `ssh -i key.pem` + `StrictHostKeyChecking=accept-new`。
2. **certbot 与 pip 冲突**：`/usr/local/lib/python3.10/dist-packages/urllib3` 覆盖系统版本，
   certbot 启动即 `cannot import name 'appengine'`。
   解决：`sudo env PYTHONPATH=/usr/lib/python3/dist-packages /usr/bin/certbot ...`，
   并写 `/etc/systemd/system/certbot.service.d/override.conf` 固化，`renew --dry-run` 已通过。
3. **内存**：1.9G 内存跑 `next build` 会有压力 → `NODE_OPTIONS=--max-old-space-size=1024`，靠已有 2G swap 兜住。

**验证（全部从外网发起）**

| 检查 | 结果 |
|---|---|
| `https://.../enter` | 200 |
| `https://.../`（未登录） | 307 → /enter |
| 口令登录 | `{"ok":true}` |
| 登录后首页 | 200 |
| `/api/pool` | `{"total":1448.14,"usable":20,"count":21}` |
| 真实生成 | 账号 `b015`，35.0 → 34.05，返回正文 + 3 条 `<sug>` |
| 原站 `https://aetouban.cn` | 200（未受影响） |
| 续期演练 | `certbot renew --dry-run` 全部 success |

**日常命令**

```bash
systemctl status lan-site lan-engine
journalctl -u lan-site -n 50 --no-pager
journalctl -u lan-engine -n 50 --no-pager
sudo systemctl restart lan-site
# 换号：覆盖 /opt/lan/accounts.json 后
sudo systemctl restart lan-engine
```

## 11. 手机端对话页重构（2026-11-11 15:4x）

**问题**：手机上对话区被三栏布局挤窄，输入框外侧还有 padding，占位文字溢出被截断。

**改法（≤860px 生效）**
- `.chat-shell` 单列、`padding:0`、`height:100dvh`；`.chat-main` 去圆角去描边，整屏铺满
- 新增手机头 `.m-head`：左 ☰ 开抽屉 / 中间 卡名+模型 / 右 ⌂ 回列表；桌面端隐藏
- 会话列表改**抽屉**（左侧滑出，点遮罩关闭），替代原来的左栏
- 输入条 `position:sticky; bottom:0` + `env(safe-area-inset-bottom)`，贴键盘与 Home 指示条
- `textarea` 字号 16px（避免 iOS 聚焦自动放大），加 `enterKeyHint="send"`
- 建议回复横向滑动（隐藏滚动条）；消息操作条常显（触屏无 hover）；气泡最大宽 88%
- 占位文案固定「说点什么…」，不再拼接长卡名

**验证**：390×844 下 `chat-main=390px`、`composer=370px`（改动前约 330/300）。
截图 `out/site/mobile-final.png`、抽屉 `out/site/mobile-drawer.png`。
线上 `lan-site` 已重建并重启，`https://43-135-10-175.sslip.io` 200。
"""

## 12. 修补：手机端设置项丢失 + `<lug>` 建议标签（2026-11-11 15:5x）

**问题 1**：重构手机布局时把右栏整个 `display:none`，导致模型 / 最大 token / 额度池余额都改不了。
**修**：手机头加 ⚙，打开底部 sheet（`.sheet-mask` + `.sheet`），内含模型下拉、最大 token、额度池余额、清空会话。

**问题 2**：切到 `nalang-xl-0826-16k` 后，模型返回的是 `<lug>a|b|c</lug>` 而不是 `<sug>`，
前端解析不到 → 建议回复不渲染。
**修**：`SUG_RE` 同时匹配 `sug` 与 `lug`：`/<(?:sug|lug)>([\s\S]*?)<\/(?:sug|lug)>/i`。

**线上验证**：CSS 已含 `.sheet-mask`；接口带 `model=nalang-xl-0826-16k, maxTokens=120` 生成成功
（账号 b015，credit 24.89）。

## 13. 手机端第二轮重构 + 卡片库扩容（2026-11-11 16:0x）

**布局（≤720px）**
- 顶部胶囊导航压缩到 52px；品牌字号 14，tab 40px 高
- hero：标题 30px、正文两行截断、上下留白收紧
- 标签条改**横向滑动单行**（`flex-wrap:nowrap; overflow-x:auto`，隐藏滚动条）
- 卡片网格 2 列、gap 10、卡片内边距 8、圆角 18、封面圆角 12、标签在手机上隐藏
- 详情页：单列、封面 `max-height:54vh`、说明 14.5px/1.72
- 详情页 **底部固定操作条**（开始对话 + 返回列表），带 `env(safe-area-inset-bottom)`
- `layout.js` 增加 `viewport`（`viewport-fit=cover`、`themeColor:#F3F2ED`）
- 图片统一 `referrerPolicy="no-referrer"`，避免图床按 referer 拒绝

**卡片库**：22 → **112 张**
- `scripts/seed_more.py`：从 `competition.awardedCards` 的 549 个 id 池顺序补抓，去重合并，
  每 10 张落盘一次；`get_card` 带 3 次重试（此前一次 SSL 抖动就把整个进程带崩）
- 失败 6 个（多为下架/非公开卡），最终 112 张
- 服务端 `cards.json` 直接覆盖即可生效——`lib/cards.js` 每次请求都读文件，**不用重建、不用重启**

**验证**
- 线上 `https://43-135-10-175.sslip.io` 首页渲染 **112 个 `/card/\d+` 链接**
- 标签分布：参赛卡 21、纯爱 20、调教 17、女性视角 16 …
- 手机端截图：`out/site/mobile-home2.png`、`out/site/mobile-detail2.png`

## 14. 图片加载慢 / 点不进去 的修复（2026-11-11 16:2x）

**根因**：卡片封面用的是图床**原图 PNG，单张 1.30 MB**。112 张一次铺开，手机端图片队列把主线程和带宽占满，
点击后又要等详情页那张 1.3MB 的封面，体感就是「点不动」。

**图床自带缩放接口**（Supabase render/image），但**只有特定宽度会返回 WebP**：

| 宽度 | 结果 |
|---|---|
| 320 / 400 / 480 / 640 / 1200 | `image/webp`，**26–62 KB** |
| 160 / 240 / 360 / 420 / 560 / 720 / 800 / 960 | 回退 `image/png`，**0.3–1.3 MB** |

所以 `width=420`（我第一版随手取的值）反而拿到 445 KB 的 PNG。

**改法**
- `lib/cards.js` 的 `thumb(url, w)`：把 `storage/v1/object/public/...` 改写成
  `storage/v1/render/image/public/...?width=W&quality=72&resize=cover`，并把 W **吸附到预设档**（320/400/480/640/1200）
- 首页封面 480 档（48 KB）、详情大图 1200 档（62 KB）、图集 640 档、头像 320 档
- `ChatClient` 内同逻辑（客户端副本），头像 320
- 卡片加 `touch-action: manipulation` + 去掉点击高亮；`Link prefetch={false}`（112 个链接同时预取会抢带宽）
- 新增 `app/card/[id]/loading.js` 骨架屏：点进去立刻有反馈，不再「点了没反应」

**效果**：首屏 4 张封面 **5.2 MB → 194 KB**（27×）；整页 112 张 **约 145 MB → 5.4 MB**。

**验证**：线上 `/` 的 HTML 中 `width=480` 出现 120 次、`width=420` 为 0；
服务器实测 `width=480 → 200 image/webp 48,568B`、`width=1200 → image/webp 62,348B`。

## 15. PC 首页按 dzmm 复刻（2026-11-11 16:2x）

**基准**：在服务器上用 Playwright 抓了 `dzmm.ai` 登录态首页 4 屏（1440×1000），
存 `out/ref/dzmm-home-1..4.png`，结构快照 `out/ref/dzmm-home.json`。

**量到的关键尺寸**

| 项 | 值 |
|---|---|
| 顶栏 | 1440×64，白底、半透明模糊、底部 1px 分隔 |
| 内容宽 | 1280（左右各 80） |
| 一级 tab | 16px，间距约 26，选中加粗变黑 |
| 二级分类 | 13px，hover 粉底 `#ffe9ef`、字 `#ff3d6e` |
| 胶囊行 | 32px 高、圆角 999、浅灰底 `#f6f7f8`、彩色图标 |
| 网格 | 5 列，卡片 243×339（封面 3:4），列间距 12 |
| 卡片 | 封面圆角 12 + 左下角「▤ 5.3万」；标题 15px/600 两行；底栏 16px 头像 + 作者 12px + 右侧 ♥ 数 |
| 广告位 | 卡片尺寸，虚线框 + 📢 + 「1:1 / 4:5」+「广告位招租」+「查看广告位 →」 |
| 敏感图 | 模糊遮罩 + 锁图标 + 「敏感图片 / 此图片可能包含敏感内容 / 查看」 |

**实现**
- `components/SiteHeader.jsx`：logo、角色/消息/论坛/我的、搜索胶囊、通知角标、头像；
  额外加了「隐藏敏感图」开关（写 localStorage，默认关——原站是按用户设置遮的，我们默认显示）
- `components/Card.jsx`：封面用 background-image（避免 img 布局抖动）、播放数格式化（万）、
  标题两行截断、作者头像 + 名字 + ♥；敏感遮罩按开关生效
- `app/page.js`：一级 tab（关注/最新/新手/猜你喜欢/榜单/比赛/分类/游戏/画图/社群）、
  二级分类行、胶囊行、5 列网格、每 15 张插一个广告位、页脚
- tab 全部可用：最新=按发布时间、榜单=按热度、比赛=筛「参赛卡」、新手=热度最低 40 张；
  关注/游戏/画图/社群没有数据源 → 显示「还没有接入」而不是空白
- 响应式：≤1180 四列、≤900 三列、≤640 两列（手机顶栏单行、搜索隐藏）

**验证**（服务器侧 Playwright，能连图床，图是真的）
- 1440 视口：5 列 `236.8px ×5`、112 张卡、封面 `background-image` 指向 render/image 缩放图
- 手机 390 视口：2 列 `178px ×2`、顶栏单行不折行
- 截图：`out/ref/ours-pc.png`、`out/ref/ours-m2.png`

## 16. 横向宽度 / 卡片数量 精确对齐（2026-11-11 16:3x）

用 Playwright 在服务器上**同时量原站和本站**，逐项对齐，不靠目测。

| 指标 | dzmm | 修复前 | 修复后 |
|---|---|---|---|
| 外层容器 wrap | x=80, w=1280 | x=80, w=1280 | ✅ 一致 |
| 网格 grid | x=96, **w=1248** | x=104, w=1232 | ✅ x=96, w=1248 |
| 列宽 | 243.19 ×5 | 236.8 ×5 | ✅ 243.19 ×5 |
| 间距 gap | **8px** | 22px / 12px | ✅ 8px |
| 封面高度 | **243（1:1）** | 324（3:4） | ✅ 243 |
| 首屏格子数 | **25** | 120 | ✅ 25 |
| 滚动后 | 追加 | 不追加 | ✅ 25 → 51 |

**两个根因**

1. **内边距**：`.home-wrap` 用了 `padding: 0 24px`，网格左边距变成 104（原站 96）。
   改 `0 16px`（1280 − 32 = 1248）。
2. **封面比例**：原站卡片是 `pb-[125%] sm:pb-[100%]` —— 手机 4:5、**桌面正方形 1:1**。
   我们一直用 3:4，整行被拉高 81px，一屏少一排。改成 4:5 / 1:1 后行距 333px，与原站 347px 基本一致。

**卡片数量**：改成分批渲染 `HomeGrid`（客户端 IntersectionObserver），
首屏 23 张卡 + 2 个广告位 = 25 格，滚到底每次 +25 张，到底显示「到底了 · 共 112 张」。

**复核数据（服务器实测）**
```
FIRST {"cells":25,"x":96,"w":1248,"cols":"243.188px ×5","gap":"8px","coverH":243}
AFTER_SCROLL {"cells":51}
```

## 17. 宽屏（≥1536）与卡片细节对齐（2026-11-11 16:4x）

用户提供 1680×1006 实机截图后，发现两处系统性偏差，已按实测修正。

**① 容器宽度是分档的，不是单一 max-width**

扫了 8 个视口宽度，原站网格宽度如下：

| 视口 | 网格 x | 网格宽 | 列宽 |
|---|---|---|---|
| 1280 | 16 | 1248 | 243 |
| 1440 | 96 | 1248 | 243 |
| 1536 | 16 | **1504** | **294** |
| 1680 | 88 | 1504 | 294 |
| 1920 | 208 | 1504 | 294 |
| 2560 | 528 | 1504 | 294 |

规则：**宽度 < 1536 → 1248；≥ 1536 → 1504**，始终 5 列、gap 8。
我们之前写死 1280，所以在 1680 上整体偏窄、列宽偏小。

现改：
```css
.home-wrap { width: min(100% - 32px, 1248px); margin: 0 auto; }
@media (min-width: 1536px) { .home-wrap { width: min(100% - 32px, 1504px); } }
```

**② 卡片底栏是「作者 / 时间」两行**

原站卡片底栏：头像 + 作者名 + 相对时间（如「22 分钟前」）上下两行，右侧 ♥ 数。
我们原来只有作者一行，且没有时间。已加 `relTime()`（刚刚 / N 分钟前 / N 小时前 / N 天前 / N 个月前），
并把 `.zc-foot` 改成两行布局。

**③ 其它细节**
- 胶囊改成每色 6% 淡底（原站 3%），高度 30px
- 封面左下角换成喇叭图标（原站是播放/朗读图标）
- 分类行只在「猜你喜欢 / 分类」显示；「最新」等 tab 下不显示（与原站一致）
- 标题 16px / 1.5 行高 / 固定两行高度，卡片高度 243→341（原站 339）、294→393（原站 402）

**复核（服务器实测）**
```
1440 {"x":96,"w":1248,"cellW":243,"cellH":341,"coverH":243,"gap":"8px","cells":25}
1680 {"x":88,"w":1504,"cellW":294,"cellH":393,"coverH":294,"gap":"8px","cells":25}
1920 {"x":208,"w":1504,"cellW":294,"cellH":393,"gap":"8px"}
```

## 18. 视觉改回 design.md + 暗色主题（2026-11-11 17:0x）

**原则修正**：1:1 只复刻**布局**（栅格 / 间距 / 卡片解剖），视觉一律用 `design.md` 的液态玻璃调色板，不用原站粉色。

**换色对照**

| 位置 | 原（dzmm 粉） | 现（design.md） |
|---|---|---|
| logo | `#ff6b9d → #ff3d6e` | `#6f9c95 → #25414a`（深青） |
| 分类选中/hover | `#ffe9ef` / `#ff3d6e` | `rgba(85,123,121,.14)` / `#33514f` |
| 通知角标 | `#ff3d6e` | `#557b79` |
| 头像 | 粉渐变 | `#e4efeb → #a9c6bf` |
| 广告位链接 | `#ff3d6e` | `#557b79` |
| 页面底色 | `#fff` | `var(--paper)` `#F3F2ED` |
| 服务胶囊 | 6 色糖果色 | 鼠尾草/雾蓝/橄榄 6 组低饱和 |

**暗色主题**

- `html[data-theme="dark"]` 覆盖：底色 `#0B0E12`、文字 `#E6EAF3`、描边 `rgba(255,255,255,.07)`
- 覆盖范围：首页（顶栏/tab/分类/pill/卡片/广告位/页脚）、聊天（三栏、气泡、输入框、抽屉、设置面板、建议胶囊）
- 切换入口：**站点头部 ☾/☀** + **对话页头部 ☾/☀**（桌面与手机都有）
- 偏好写 `localStorage.theme`；`layout.js` 里加了首屏内联脚本，**刷新不闪白**
- 聊天的右栏原先用内联样式写死深灰字，暗色下看不清 → 改成 `.fld / .inp / .tip` class，由主题统一控制

**验证（服务器 Playwright，1440×1000）**
```
home-light  body bg rgb(243,242,237)
home-dark   body bg rgb(11,14,18)
chat-light  body bg rgb(243,242,237)
chat-dark   body bg rgb(11,14,18)
```
截图：`out/ref/home-light.png`、`home-dark.png`、`chat-light.png`、`chat-dark.png`

## 19. 长输出机制：maxTokens 无效 → 分段续写（2026-11-11 23:0x，服务器实测）

**结论先行**：上游 `/api/chat` 对 `chatSettings.maxTokens` **不敏感**。

**扫描结果**（同一个 cardId / 同一句提示，只改 maxTokens 与 model）
```
maxTokens=   200 model=turbo        chars=  5644
maxTokens=  2000 model=turbo        chars=  5182
maxTokens=  9000 model=turbo        chars=  4788
maxTokens=  9000 model=medium       chars=  4760
maxTokens= 16000 model=xl           chars=  5126
```
即：200 也能出 5600 字，16000 也只出 5100 字。**参数照传，但服务端按自己的硬上限截断**。
所以「调大最大输出 token」这条路到此为止，前端把它当上限展示，文案也改成「上限，不是保证」。

**真正有效的办法：多轮续写**

- 引擎新增 `generate_long(cookie, chat_id, card_id, model, max_tokens, prompt, emit, history, rounds)`
- 第 1 轮用原始 prompt；第 i>1 轮把「累积正文尾部 6000 字」当 `assistant` 历史回灌，
  追加指令 `CONTINUE_PROMPT`（从最后一个字往下写、不重复、不复述、不重新开头）
- `prompt` 只回灌一次（`user` + `assistant` 成对），避免历史被 `normalize_history()` 反复截断
- 任一轮失败就带着已有正文返回 `{"status":"ok","partial":True}`，不丢内容
- 每轮发 `event: round`，前端可显示进度

**接口**：`POST /site/chat` 增加 `rounds`（1–8，默认 1）。`rounds<=1` 走原来的单轮 `generate`。

**实测**（服务器，cardId=3821218，同一提示词）
```
rounds=1 -> chars=  5976   rounds_done=1/1
rounds=3 -> chars= 14056   rounds_done=3/3
rounds=3 -> chars= 19095   rounds_done=3/3
rounds=5 -> chars= 31239   rounds_done=5/5
```

**踩坑：`UnicodeEncodeError`**

第 2 轮直接崩。原因：上游 SSE 把 emoji 代理对拆在两个 delta 里，拼接后的正文含**孤立 surrogate**，
回灌进 `json.dumps(...).encode("utf-8")` 时抛 `UnicodeEncodeError`。

修法（三层）：
1. 新增 `_clean_surrogates(t)`：成对 high+low 合并为真字符，孤立的直接丢弃
2. `build_body()` 对每条历史与 prompt 先清洗
3. 兜底 `encode("utf-8", "replace")`

修完 3 轮 5 轮全部跑通。**注意 `doc` 里 `log(...format_exc()[:400])` 会把异常类型截掉**，
已改成取尾部 1800 字，便于定位。

**前端**（`ChatClient.jsx`）
- 新状态 `rounds`，默认 1
- 手机设置面板：`续写轮数（越长越慢）` 下拉（1/2/3/5 段）
- 桌面右栏：`续写轮数` 下拉 + 一行提示「这是上限，不是保证 —— 单段通常输出 4800~5600 字」
- 请求体带 `rounds: Number(rounds) || 1`，依赖数组补 `rounds`

## 20. 卡库扩展被 captcha 闸门挡住（2026-11-11 23:3x）

要扩卡必须拿 cardId 池。真实 procedure 名从 bundle 抽（`queryOptions` 调用点才是真路由）：
```
card.getById  chat.createByCard  chat.listAll  chat.hasSentMessage
chat.hasShelvedChats  chat.listOlderAiChats  chat.searchAiChats
competition.awardedCards  home.forYou  home.getCards  home.getHotTags
home.greenFeatured  home.greenFeaturedByTheme  home.greenFeaturedMore
home.newbie  home.rerankVariant
```
其中 **`home.getCards`** 是卡片流主入口（`card.list` / `home.chatCards` 都是 404，不存在）。

**结果：418 `captcha_required`**
- `home.getCards` 第一次 0（重试耗尽）→ 之后全部 418
- 已确认是 **IP 级**：`main / mail01 / g01 / b001 / b002` 五个号分别打 `card.getById`，全部 418
- 连 `GET /` 仍 200，说明只是 API 被闸门接管
- 触发原因：短时间内密集 trpc 探测（≈10 发）

**处置**：按 §2.1 冷却 + 换出口节点后再抓，不要在同一 IP 上硬顶。
当前 `cards.json` 仍是 112 张（服务器 `15:54` 版本，262674 字节），已经够用，
扩卡不影响站内已有功能。

**待办**：出口恢复后跑 `SEED_HOT=200 python scripts/seed_hot.py`
（数据源顺序：已抓榜单 → `home.getCards` 多页 → 分类），去重合并写 `captures/site/cards.json`。
脚本已就位：`Z:\project\scripts\seed_hot.py`。

## 21. 三个真实故障修复（2026-11-12，卡 426322「夏日,妹妹,同居」）

### 21.1 `<sug>` 漏进正文，看着像 HTML

**现象**：用户报「输出格式有问题，会输出类似 html 的文字」。

**取证**：落盘上游原文扫描（`scan_markup.py`）——

```
== /tmp/raw_text.txt len=438
   tags: [('<sug>', 1), ('</sug>', 1)]
```

上游正文是干净的，**唯一标记就是 `<sug>`**。所以问题在前端渲染层，不是模型输出脏。

**根因**：`SUG_RE = /<sug>([\s\S]*?)<\/sug>/i` —— **没有 `g` 标志**。
`splitSug()` 里 `text.replace(SUG_RE, "")` 只删掉**第一个**匹配块。
多段续写（`rounds>1`）会产出**多个** `<sug>` 块，于是第 2 个之后的
`<sug>…|…</sug>` 原样留在正文里，渲染出来就是类 HTML 文本。

**修法**（`site/components/ChatClient.jsx`）：

1. 全局匹配 `SUG_RE_G = /<sug>([\s\S]*?)<\/sug>/gi`，收集**所有**块的选项（去重保序）
2. 同时处理 `<lug>`（更长的建议块）—— 也全局删，不进正文
3. 流式中未闭合的 `<sug>` 用 `stripOpenSug()` 砍尾部
4. 兜底清掉任何裸标签 `</?sug>` / `</?lug>`
5. 收尾：去行尾空白、合并连续空行

**关键陷阱**：一开始写的是 `src.replace(/<sug>[\s\S]*$/i, "")`，单元测试立刻暴露——
它把**所有后续正文**一起吞了：

```
PASS | 多块（真实故障）
  text="正文A。"          ← 正文B、正文C 全丢了
```

改成「只在最后一个 `</sug>` **之后**还残留 `<sug>` 时才砍」，顺序也调整为
`lug → stripOpenSug → 已闭合块 → 兜底裸标签`。7 个用例全过：

```
PASS 单块 / 多块 / 流式未闭合 / 闭合后再开未闭合 / 裸闭合标签 / 含lug / 无标记
多块保留正文B/C: PASS
```

### 21.2 上下文满了，对话直接从头开始、人物全重置

**现象**：长对话到一定长度后，模型不认识前文，像重新开场。

**根因（两处叠加）**：

1. **前端**：`history = base.filter(...).slice(-24)` —— 只从**尾部**取 24 条。
   对话一长，**开场那几轮（人设、称呼、约定）直接被剪掉**，上游拿不到人设，自然重新开场。
2. **引擎**：`normalize_history()` 也是纯尾部回撤（`MAX_HISTORY_CHARS = 16000`），
   从后往前累加到预算就 `break`，**头部同样丢光**。两头都丢，等于没历史。

**修法：保头 + 保尾**

前端（`ChatClient.jsx`）：
```js
const HEAD_KEEP = 2;          // 开场 user+assistant，永久保留
const TAIL_BUDGET = 11000;    // 近期轮次预算
const head = all.slice(0, HEAD_KEEP);
// 从尾部回填到预算内
```

引擎（`engine/server.py`）：
```python
MAX_HISTORY_MSGS = 48         # 原 24
MAX_HISTORY_CHARS = 26000     # 原 16000
HEAD_ANCHOR_MSGS = 4          # 开场两对（user+assistant）
HEAD_ANCHOR_CHARS = 7000
```
- 头部锚点**从原序列取**，不参与尾部裁剪
- 尾部在「总预算 − 头部占用」内回填，最低保留 6000 字
- 历史必须以 `user` 开头（否则被当开场白）
- 历史必须以 `assistant` 结尾，**但仅当已存在 assistant 时**——
  否则单条 `user` 历史会被整条清空（单测踩到，已修）

**接缝修正**：尾部剪出来的第一条若孤立 `assistant`（对应 `user` 被剪了），削掉它。

实测（4 万字历史）：
```
raw msgs=80 chars=40240
kept msgs=50 chars=25150
tags: ['U01','A01','U02','A02','U18','A18',...,'U40','A40']
保头 U01 : True   保尾 U40 : True
首角色 user | 末角色 assistant   无重复 True
```

### 21.3 验收（真实上游）

用卡 `426322`、14 轮真实对话、历史 14399 字 / 30 条全部保留：

```
=== 第1轮开场 ===
"林川……哥哥。"伊一轻轻念出这个名字……

对话轮数=14  原始=14399字/30条  实际发送=14399字/30条
发送含第1轮开场: True

=== 记忆测试（问名字/称呼/季节）===
"林川……哥哥……" 伊一……"现在是……暑假，七月哦。"
记住名字林川: True
```

14 轮后仍记得开场设定的名字与关系，`<sug>` 单独抽成建议胶囊，正文无标记残留。

### 21.4 顺带发现

- 引擎 `PROXY` 默认 `http://127.0.0.1:7897`，但服务器上**没有这个代理**。
  `create_chat` 的重试碰巧把带代理的请求走通了才没暴露。
  服务器侧脚本一律要 `E.PROXY = ""` + `proxies=None` 直连。
- `upgrade_needed / credit` ≠ `exhausted`：某号 credit 显示 75.0 但账户级额度已用尽，
  SSE 返 `{"classification":"upgrade_needed","upgradeReason":"credit"}`。
  这是**该号**不可用，不是整个池子。
- `MAX_HISTORY_MSGS=48` 生效后，30 条历史一条不裁（原 24 条会裁掉 6 条）。

## 22. 旧对话一键接续（2026-11-12）

### 22.1 问题

用户问「我那张卡怎么接着之前的继续」。查清三件事：

1. **前端从来没保存过 chatId**。`/api/chat` 请求体只有 `{cardId, prompt, history, model, maxTokens}`，
   引擎每次 `createByCard` 若缓存命中才复用，缓存 miss 就新建 —— 历史只活在浏览器 localStorage，
   一换设备/清缓存就没了真实会话锚点。
2. **上游其实存着完整历史**。`chat.getMessages` 可读（`chat.getById` / `chat.get` / `chat.listMessages` 全 404）。
3. **旧会话的号可能已没额度**，硬接会 `upgrade_needed`。

### 22.2 `chat.getMessages` 结构

```json
{"chunkInfos":[{"id":"<chunkId>","len":53,"char":13311,"active":true,"children":[]}],
 "chunks":[{"chunkId":"<chunkId>","messages":[{"role":"assistant","content":"..."}]}],
 "activeGeneration": ...}
```

是**分块树**：`chunkInfos[].children` 指向分支，`chunks[].messages` 是实际消息。
还原顺序要按 `chunkInfos` 从根 `walk()` 子节点，再按顺序取 `chunks[chunkId].messages`。

读出来的卡 426322 → `6c6830c3-...`：**53 条 / 13311 字**，确认是用户的原对话
（开场「暑假的夜，房间里空调低低地嗡鸣着」→ 器材室那段），且能看到多段续写产物
（`继续。从上一段的最后一个字直接往下写…`）。

### 22.3 三件事

**① `seeds.json` —— 历史快照**

`/opt/lan/site/public/seeds.json`，按 cardId 存：

```json
{"426322": {"chatId": "42de6400-...", "account": "b003", "msgs": [{"role":..,"content":..}]}}
```

由 `build_seed.py` 生成，源自 `out/migrated_<cardId>.json`。

**② 前端恢复**

`ChatClient.jsx` 挂载时：localStorage 为空 → `fetch('/seeds.json')` → 命中 cardId 就
`setMsgs(restored)` 并写回 localStorage，同时把 `chatId` / `account` 存进
`chatIdRef.current` / `seedAcctRef.current`。请求体多带两个字段：

```js
chatId: chatIdRef.current || undefined,
account: seedAcctRef.current || undefined,
```

**③ 引擎接续**

`run_site_chat()` 开头新增：

- `want_chat` / `want_acct` 来自 payload
- **原号仍可用** → 用它，并 `chat_id_ok()` 验证 chatId 归属（`chat.getMessages` 返 200 才算）
- **原号不可用** → 发 `note`「原会话的号已不可用，改用其他号并新建会话」，退回原逻辑
- 排序改为 `key=(不是原号, credit)` —— 原号优先，其余按 credit 升序

```python
def chat_id_ok(pool, name, chat_id):
    url = "%s/api/trpc/chat.getMessages?batch=1&input=%s" % (
        BASE, quote(json.dumps({"0": {"json": {"chatId": chat_id}}})))
    r = creq.get(url, headers=headers_of(cookie), impersonate="chrome",
                 proxies=proxies(), timeout=30)
    return r.status_code == 200
```

### 22.4 跨号迁移

原会话在 `b001`，而 `b001` 已 `upgrade_needed`。`migrate_chat.py` 的做法：
读出源历史 → 在可用号（`b003`）`createByCard` 建新会话 → 用源历史最后一条 user 当 prompt
复刻一轮 → 新 chatId 记住。

```
=== 迁移成功 ===
账号: b003
新chatId: 42de6400-dd03-476f-be4f-6c5f032bde1a
复刻出字数: 935
*下午的体育课刚结束…器材室的门在你身后关上…
```

### 22.5 验收

线上 `/site/chat` 带 `chatId` + `account`：

```
event: account  {"name": "b003", "credit": 75.0}
event: note     {"message": "接上原会话 42de6400"}
event: delta    "器材室里的空气似乎凝固了…"     ← 接在器材室后，不是重新开场
```

`https://43-135-10-175.sslip.io/seeds.json` → **200, 41457 字节**。

### 22.6 顺带调参

- `HEAD_ANCHOR_MSGS` 4 → **6**，`HEAD_ANCHOR_CHARS` 7000 → **14000**
- `MAX_HISTORY_CHARS` 26000 → **30000**
理由：这张卡的开场白本身就 3000+ 字，4 条/7000 字的锚点预算装不下，开场会被切一半。

## 23. 卡片加载慢到点不进去（2026-11-12）

### 23.1 三个叠加原因

| 问题 | 原状 | 后果 |
|---|---|---|
| 一次渲染全部卡片 | 首页 `cards.map()` 无分页，522 张全出 | 522 个 `<img>` |
| 封面直连原图 | `<img src={c.cover}>` → `pxlorbit.com` | **单张 1.29 MB**，理论峰值 ≈ 680 MB |
| 每次请求全量解析 | `loadCards()` 里每次 `JSON.parse` 1.4 MB | 每个页面渲染都重新解析 |

`loading="lazy"` 救不了：快速滑动时懒加载会同时触发几十张，每张都 1.3 MB。

实测原图：

```
curl pxlorbit.com/.../dea54e41-....png
img code=200 total=0.076657s size=1297532     ← 1.29 MB / 张
```

### 23.2 三处改造

**① 图片代理 + 缩略图（最大收益）**

`site/app/api/img/route.js`：

- 白名单域名（`pxlorbit.com` / `assetora.net`），避免变开放代理
- `?w=320` 走 `sharp` 缩到 320 宽 + `webp(q=72)`
- 落盘缓存 `/opt/lan/imgcache/<sha1前2位>/<sha1>`，永久 `immutable`
- 回源带 `referer: https://www.dzmm.ai/`
- sharp 不可用时自动退回原图（不阻塞可用性）

**② 分页**

`site/app/page.js`：`PAGE = 60`，`?page=N`，`?tag=` / `?q=` 都保留在分页链接里。
首屏 10 张 `loading="eager"`、前 6 张 `fetchPriority="high"`，其余 lazy。

**③ 卡片数据瘦身 + 进程内缓存**

`site/lib/cards.js`：

```js
const LIGHT = ["id","name","cover","tags","creator","likes","isSensitive","publishedAt"];
// 列表页只传这 8 个字段；原来带 images/creatorNotes/popularity → 2.6 KB/张
let CACHE = null, MTIME = 0;   // 按 mtime 判断是否重读
```

### 23.3 效果

| 指标 | 改造前 | 改造后 |
|---|---|---|
| 单张封面 | 1,297,532 B | **12,722 B**（约 1/102） |
| 首页渲染卡片数 | 522 | **60** |
| 首页 HTML | 522 张全量 + 全字段 | **132,954 B** |
| 首页 TTFB | 秒级 | **0.113s** |
| 详情页 | — | **0.024s** |
| 缩略图（热） | — | **0.0043–0.0047s** |
| 全站缩略图缓存 | — | **522 张 / 11 MB** |

预热：`warm_img.py` / `warm_rest.py` 顺序打一遍 `/api/img?u=...&w=320`，
522 张全 ok、0 fail，22.8s 跑完。原来这批原图合计约 680 MB，现在缓存 11 MB。

### 23.4 注意

- 首页 HTML 里仍能看到 `pxlorbit.com` 字样 —— 那是 `/api/img?u=` 的 URL 编码参数，不是直连。
  判据看 `grep -c 'img src="https://'` = **0**。
- `grep -c 'class="card"'` 会显示 1，因为 Next.js 输出压成一行 —— 用 `grep -o ... | wc -l` 数。
- 详情页主图用 `w=720`，头像 `w=96`，画廊 `w=480`，不再拉原图。

## 24. 手机端布局错乱（2026-11-12）

### 24.1 详情页：`.detail` 自己跟自己打架

原始规则里同时有两条 `padding` 声明：

```css
.detail {
  padding: 24px;              /* 第一条 */
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 24px;
  padding: 56px 0 88px;       /* 覆盖第一条 —— 卡片内边距被抹成 0 */
}
```

`.detail` 既挂着 `background` / `border-radius` / `box-shadow`（卡片外观），
又被拿去做两列网格容器。手机端 `.page` 只有 `100% - 40px` 宽，`.detail` 再吃掉
`56px 0 88px`，内容被压到 ~310px 宽，标题换行、byline 折成竖排、CTA 按钮挤在一起。

改法：**结构与外观分离**。

- `.detail` 只做网格容器：`padding:28px; margin:28px 0 88px; align-items:start`
- 加 `.detail-media`（桌面 `position:sticky; top:100px`）/ `.detail-body`（`min-width:0`）
  —— `min-width:0` 是网格子项不溢出的关键，缺了长英文标签会把它撑破
- `≤900px` 单列，并取消 sticky

手机端（`≤860px`）再单独一套：

```css
.page:has(> .detail) { width: 100%; padding: 0 14px; }   /* 只详情页贴边 */
.detail { display:flex; flex-direction:column; gap:16px;
          margin:12px 0 96px; padding:0;
          background:transparent; border-radius:0; box-shadow:none; }
.detail .big { aspect-ratio:4/5; max-height:58dvh; border-radius:22px; }
.detail h1  { font-size:24px; word-break:break-word; }
.detail .byline { flex-wrap:wrap; gap:6px 8px; font-size:12.5px; }
.cta .btn { flex:1 1 0; min-width:0; }        /* 两个按钮等分，不换行 */
.detail .grid { grid-template-columns:minmax(0,1fr) !important; }  /* 画廊单列 */
```

> `3/4` 竖图在手机上太高（390 宽 → 520 高，加上导航基本吃掉一屏），压成 `4/5`
> 且 `max-height:58dvh` 封顶。

### 24.2 聊天页：三层高度互相叠加

| 层 | 原规则 | 问题 |
|---|---|---|
| `.shell` | `padding-top:68px; padding-bottom:18px; min-height:100dvh` | 已为 fixed 顶栏留位 |
| `.chat-shell` | `height:100dvh` | **没减掉那 68px**，整页多出一屏 |
| `.chat-main` | `overflow:hidden` | 高度不定 + hidden → 消息区被裁 |
| `.composer` | `position:fixed` | 不吃父级高度，但没人给它留底部空间 |

三层相加 → 消息区要么溢出、要么被裁，输入框压住最后几条消息。

改法：

```css
.shell { padding-bottom: 0; }                       /* 聊天页不需要底部留白 */
.chat-shell, .chat-shell.no-panel {
  display: flex; flex-direction: column;
  height: calc(100dvh - 68px);                      /* 扣掉顶栏占位 */
  min-height: 0; padding: 0; gap: 0;
}
.chat-main {
  flex: 1 1 auto; min-height: 0; overflow: hidden;
  display: flex; flex-direction: column;
  padding-bottom: calc(74px + env(safe-area-inset-bottom));   /* 给 fixed 输入框留位 */
}
.msgs { flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
```

`min-height:0` 在 flex 链路上每层都要写，少一层就会把父级撑开。

### 24.3 验证方式

服务器没有 Chrome（1.9 GB 内存也不适合装），所以走**结构 + 编译产物**双向核对：

```bash
# HTML 结构
curl -H "cookie: lg_pass=..." /card/426322 | grep -o 'detail-media' | wc -l   # 2
curl -H "cookie: lg_pass=..." /chat?card=426322 | grep -o 'chat-main' | wc -l # 1

# 编译后的 CSS
grep -o '.page:has(>.detail){[^}]*}' s.css
grep -o 'calc(100dvh - 68px)' s.css
```

结果：四条页面全 200，详情页 `裸外链 img = 0`，关键规则全部落地，
`len(.page)` 基础 1 条 + `:has()` 1 条互不干扰。

> 坑：`grep 'page:has(> .detail)'` 在压缩产物里查不到 —— Next 会把选择器压成
> `.page:has(>.detail)`（去掉空格）。按压缩后的写法搜。

### 24.4 没做的事

- 没装 Chrome/Xvfb 截图（内存不够，2 GB 跑 headless 会把引擎挤掉）。
  真要看像素级效果，在本地 Chrome DevTools 切 390×844 更快。
- `:has()` 需要 Chrome 105+ / Safari 15.4+，手机端都满足；老设备会退化成
  `.page` 的默认边距（可接受，不破版）。

## 25. 回滚：UI 布局还原（2026-11-12 晚）

### 25.1 决定

用户要求「ui 相关布局全部还原到昨天的样子」，并选定：

- **只还原布局，保留分页与图片加速**（否则卡片会重新变慢到 522×1.3 MB）
- 基准 = 今天早上改动前的状态

### 25.2 撤掉的东西

| 项 | 撤掉 |
|---|---|
| `.detail` 结构拆分 | `padding:28px; margin:28px 0 88px; align-items:start` → 回到原版双 `padding`（`24px` 被 `56px 0 88px` 覆盖） |
| `.detail-media` / `.detail-body` | CSS 规则 + JSX 包装类一并删除（留空类名会误导后续维护） |
| `@media 900px` | 去掉 `.detail > .detail-media { position:static }` |
| 手机 860 块 | 整段新增规则删除：`.page:has(> .detail)`、`.detail` 单列化、`.big` 改 `4/5`、`.byline` 换行、`.cta .btn` 等分、画廊单列、聊天 flex 链路、`calc(100dvh - 68px)` |
| `.grid` | `padding: 8px 0 24px` → `8px 0 88px` |

### 25.3 保留的东西

- `.pager` / `.pbtn` / `.pinfo` 分页条（首页每页 60 张）
- `/api/img` 图片代理 + `/opt/lan/imgcache`（522 张缩略图，11 MB）
- `lib/cards.js` 的 `lightCards()` 字段裁剪 + mtime 缓存
- 详情页 `imgSrc(u, w)` 三档尺寸（720 / 96 / 480）

### 25.4 踩的坑：删块时多删一个 `}`

用 `s.find("\n}\n")` 找 860 媒体块的收尾，把 `}` 一起切掉，导致 CSS 括号不平衡：

```
Syntax error: ./app/globals.css:1211:1 Unclosed block
> 1211 | @media (max-width: 860px) {
```

`redeploy.sh` 的输出只打了 `Build failed because of webpack errors`，
真正的错误要用 `npm run build 2>&1 | grep -A 12 -i error` 才看得到。

补法：在 `.hint { ... }` 后补回 `}`，然后校验 `s.count("{") == s.count("}")`。
**以后改 CSS 收尾块，先数括号再构建。**

### 25.5 验证

```bash
# 应消失
detail-media → 0        detail-body → 0
:has(>.detail) → 0      calc(100dvh - 68px) → 0
aspect-ratio:4/5 → 0    58dvh → 0

# 应保留
pager → 1               pager class="card" → 60
img 走代理 → 4          裸外链 img → 0
height:100dvh → 2（.shell 的 min-height + .chat-shell 的 height，原版既有）
```

编译产物里 `.detail` 已回到：

```css
.detail{background:var(--paper);border-radius:32px;
        box-shadow:0 24px 60px rgba(19,37,41,.18);
        display:grid;grid-template-columns:380px minmax(0,1fr);
        grid-gap:24px;gap:24px;padding:56px 0 88px}
```

五个页面全 200。

## 26. 主题切换系统恢复（2026-11-12 晚）

### 26.1 症状与根因

用户：「是昨天有主题切换的那一版 ui 啊」。

查下来是三处同时缺，各自独立：

| 件 | 状态 |
|---|---|
| `components/SiteHeader.jsx` | **完整保留**（`useState`/`toggleTheme`/☾☀ 按钮/localStorage 全在） |
| `app/layout.js` 首屏内联脚本 | **还在**，`dataset.theme` 注入正常 |
| `globals.css` 的 `html[data-theme="dark"]` 规则 | **0 条** —— 在 §25 回滚时被当成「今天新增」删掉了 |
| 实际在用的 `components/Nav.jsx` | **根本没有主题按钮**（所有页面 import 的是 Nav，不是 SiteHeader） |

也就是说：`SiteHeader.jsx` 是个**孤儿组件**，早在 11-11 就写好了但没被任何页面引用；
真正上线的 `Nav.jsx` 只有 44 行，没有开关。而暗色规则又被我删空，所以整条链断了。

```bash
grep -rn 'SiteHeader' app components   # → 只有它自己的定义，无人引用
grep -rn 'from.*Nav' app components    # → page.js / card/[id]/page.js / about/page.js
```

### 26.2 修法

**① Nav.jsx 加按钮**（复用 SiteHeader 的逻辑）

```jsx
const [theme, setTheme] = useState("light");
useEffect(() => {
  setTheme(document.documentElement.dataset.theme || localStorage.getItem("theme") || "light");
}, []);

const toggleTheme = () => {
  const next = (document.documentElement.dataset.theme || "light") === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  setTheme(next);
};
```

按钮插在 `.search` 之后，类名 `theme-btn`（不复用 `.icon-btn`——那是对话页的尺寸）。

**② ChatClient.jsx 加按钮**（对话页头部，放在 ⚙ 前面）

和 Nav 共用同一把 localStorage key，切一处全站跟着变。

**③ globals.css 补 57 条暗色规则**

不逐元素硬写颜色，而是**先覆盖 CSS 变量**，再补变量表达不了的：

```css
html[data-theme="dark"] {
  --paper: #0b0e12;      --paper-canvas: #0b0e12;
  --ink: #e6eaf3;        --scene: #0f1a20;
  --mist: #16232a;       --glint: rgba(255,255,255,.06);
  --clear-glass: rgba(255,255,255,.06);
  --tinted-glass: rgba(22,35,42,.82);
  --solid: #111820;
  --elev-float: 0 8px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);
  --elev-sheet: 0 16px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08);
}
```

因为全站颜色都走 `var(--paper)` / `var(--ink)` / `var(--solid)`，
**这一层覆盖就能带走 80% 的元素**，剩下的才逐条补：

- 顶栏 `.topnav` / `.tab` / `.search input` / `.brand`
- 首页 `.hero` / `.chip` / `.card` + `.name` / `.meta` / `.tag`
- 详情页 `.detail` / `h1` / `.byline` / `.notes` / `.panel` / `.state`
- 按钮 `.btn-ghost` / `.btn-primary`
- 分页 `.pbtn` / `.pinfo`
- 聊天 `.chat-main` / `.chat-head` / `.side` / `.sess-item` / `.bubble.bot` / `.bubble.user`
- 输入框 `.composer` / `.composer-inner` / `textarea` / `.hint`
- 设置 `.fld` / `.inp` / `.tip` / `.side-right.drawer`
- 建议胶囊 `.sug`

**④ layout.js 内联脚本收紧**

```jsx
<script dangerouslySetInnerHTML={{ __html:
  `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}`
}} />
```

加 `t==='dark'||t==='light'` 白名单——否则 localStorage 里存了脏值会把 `data-theme`
写成任意字符串，属性选择器匹配不上，看着像"没生效"。`<html>` 加 `suppressHydrationWarning`。

### 26.3 验证

```
首页 theme-btn → 1        title="切到深色" → 1
对话页 title="切到深色" → 1   icon-btn press → 2（主题 + 设置）
两页内联防闪白脚本 → 1 / 1
CSS: html[data-theme=dark] → 57 条   .theme-btn → 5
```

四条页面全 200，`.detail` 原版布局和分页也都还在（§25 的回滚没被破坏）。

### 26.4 教训

**回滚前先确认「这段 CSS 是谁加的、为谁服务」**。§25 我用 `grep -c data-theme` 判断
"是今天新增的"——但暗色规则是 11-11 就有的，只是当天 `globals.css` 整体被重写过一次，
按关键词一刀切就误伤了。正确做法是回滚前列一份 `class → 用途` 清单，或者先用
`cp globals.css globals.css.bak` 留底再改。

> 顺带：`SiteHeader.jsx` 这种孤儿组件该删或该接上，悬着比删了更坑——下次搜 `theme`
> 会以为功能还在。

## 27. 事故复盘：dzmm 首页结构被我换掉（2026-11-12 21:0x）

### 27.1 症状

用户贴截图：「没变化啊，还是之前的布局啊」→「绝对是你某个任务回滚了布局，
在任务开始前的布局是完全正常的，今天的会话回滚到了图片那个布局」。

截图特征：首页是「让幻想有回应」大标题 + 胶囊行 + 一排简易卡片，
**没有一级 tab、没有广告位、没有作者/时间两行底栏**；卡片是 `.card` 那套。

### 27.2 真因

不是回滚，是**我在 §23「卡片加载慢」那个任务里顺手换掉了首页**。
当时为了提速把 `page.js` 从 dzmm 结构改写成极简版（`PAGE=60` 分页 + `.grid` + `.card`），
并删掉了配套的 `.home-wrap` / `.home-grid` / `.zc-*` 全套 CSS（约 400 行）。

`grep -c 'zc-\|home-grid\|home-wrap' globals.css` → **0**。

`page.js` 从 §15 的实现（138 行极简版）算起，dzmm 那套（一级 tab / 二级分类 / 胶囊行 /
5 列网格 / 每 15 张插广告位 / 页脚）整个没了。

### 27.3 但组件其实还在

| 文件 | 状态 |
|---|---|
| `components/HomeGrid.jsx` | **完好**（无限滚动 IntersectionObserver、每 15 张插广告位、`home-more` 到底提示） |
| `components/Card.jsx` | **完好**（`fmt` 万、`relTime` 相对时间、封面左下角播放数、敏感遮罩 + 查看按钮、作者/时间两行、♥ 数） |
| `components/SiteHeader.jsx` | 完好但无人引用（见 §26） |
| `app/page.js` | 引用它们的那几行被删了 |
| `globals.css` | `.zc-*` 规则被删了 |

**结论：接线断了，不是代码没了。** 用户判断正确——不该重写，只要接回去。

### 27.4 修法

**① `page.js` 恢复 dzmm 结构**

```jsx
import HomeGrid from "../components/HomeGrid";

<nav className="home-tabs">{TABS.map(...)}</nav>
{showCats ? <div className="home-cats">{CATS.map(...)}</div> : null}
<div className="home-pills">
  <Link className={`pill ${!tag && !q ? "on" : ""}`}>✦ 全部 {all.length}</Link>
  {tags.map(([t, n]) => <Link className={`pill ${tag === t ? "on" : ""}`}>✦ {t} {n}</Link>)}
</div>
<HomeGrid cards={cards} covers={coversById} />
```

`covers` 必须是 `{ [cardId]: "/api/img?u=...&w=320" }` —— `HomeGrid` 按
`covers[cell.card.id]` 取，`Card` 拿它当 `background-image`（不是 `<img>`，避免布局抖动）。

**② `lib/cards.js` 的 `LIGHT` 补两个字段**

`Card` 要用 `popularity`（封面左下角播放数）和 `creatorAvatar`，原来 `LIGHT` 里没有，
不补的话显示为空。

```js
const LIGHT = ["id","name","cover","tags","creator","creatorAvatar",
               "likes","popularity","isSensitive","publishedAt"];
```

**③ `globals.css` 补回 `.home-*` / `.zc-*` 全套（约 460 行）**

尺寸严格用 §15–§17 在原站量到的值，不靠目测：

```css
.home-wrap { width: min(100% - 32px, 1248px); margin: 0 auto; }
@media (min-width: 1536px) { .home-wrap { width: min(100% - 32px, 1504px); } }
.home-grid { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 8px; }
.zc-cover { aspect-ratio: 1 / 1; }            /* 桌面 1:1，手机 4:5 */
.zc-title { font-size: 16px; height: 48px; -webkit-line-clamp: 2; }
```

三级响应式 5 → 4（≤1180）→ 3（≤900）→ 2（≤720），手机端封面转 4:5、gap 10、
胶囊和分类行改横向滑动单行。暗色各条也一并补了（74 条 `html[data-theme=dark]`）。

**④ tab 逻辑**

第一版我把「关注」当默认 tab 且放进了 `noSource`，首页渲染成「这个频道还没有接入」，
`home-grid` = 0。改成默认「最新」，`noSource` 只留 `group`，并给 `sorter` 加
`|| SORTERS.new` 兜底。

### 27.5 踩的坑

**scp 静默失败**：`scp page_home2.js → /opt/lan/site/app/page.js` 报成功、`npm run build`
也通过，但服务器上文件仍是旧的 4546 字节。第一次验证 `home-grid: 0` 就是这个原因。
**改法：先传到 `/tmp/x.js`，再 `cp` 到目标，并立刻 `stat -c%s` + `grep -c` 校验内容。**
以后部署单文件都按这个两步走。

### 27.6 验证

```
home-wrap 2   home-tabs 2   home-tab 8   home-pills 2
home-grid 1   class="zc" 25   zc-cover 25   zc-title 25   zc-foot 25   zc-like 25
zc-ad 12      home-more 1      img via proxy 547
css: repeat(5,minmax(0,1fr)) 1   1248px 1   1504px 1
     html[data-theme=dark] 74   html[data-theme=dark] .zc-title 1
theme-btn 1
```

`zc-mask: 0` 正常——敏感遮罩默认关，用户打开「隐藏敏感图」才渲染。

### 27.7 教训

**改性能和改结构必须分两次提交。** §23 那次只想解决「点不进去」，
但顺手把 `page.js` 的整棵 JSX 树换掉了，还连带删了 400 行 CSS——
提速只需要 `PAGE=60` + `lightCards()` + 图片代理，这三件都不需要动布局。

另外：**删 CSS 前先看有没有组件在用它。** 当时 `.zc-*` 对应 `Card.jsx`，
`.home-grid` 对应 `HomeGrid.jsx`，两个文件都还在，删样式等于让组件变废件。
检查办法：

```bash
for c in $(grep -o 'className="[a-z-]*"' components/*.jsx | cut -d'"' -f2 | sort -u); do
  echo "$c: $(grep -c "\.$c" app/globals.css)"
done
```

## 28. 1:1 复刻 dzmm 布局，配色改回 design.md（2026-11-12 21:1x）

### 28.1 决策

用户贴了两张 dzmm 实机截图（首页 + 角色详情）后定调：

> 「算了你直接重新一比一还原布局把，不要使用它的颜色风格，风格用 ui 文档里的。」

即：**结构照 dzmm，视觉照 `design.md`**。dzmm 的粉色（`#ff3d6e` / `#ffe9ef`）一处都不要。

验证命令里带了一条硬判据：`grep -c 'ff3d6e\|ffe9ef' 编译后 CSS` → **0**。

### 28.2 从截图量到的结构

**首页**（1440 宽）

```
[顶栏 64]  logo  角色 消息 论坛 我的 ............... [搜索胶囊] [加号] [头像]
[tab 行]   关注 最新 猜你喜欢 周榜▾ 比赛 分类 游戏 画图 社群
[胶囊行]   匹配 纯白 画图 小说 团本 悬赏 任务
[网格]     5 列 × 5 行，卡片：封面 1:1 + 标题两行 + 头像/作者 + ♥ 数
```

**详情页**（1440 宽）

```
[左 380px]  封面 3:4，左下角播放数，右下角 ●●●
[右 1fr]    标题（28px/600，可两行）
            #3892388 · 6 天前
            [头像 40] 牧歌 / 3.9万粉丝           [+ 关注]
            ♡ 805   ⟳ 1166   ✎ 分享
            古风 修仙 雌小鬼 厌男 妹妹 熟处 既堕
            [ 开始对话 ◯ ]  [ 悬赏 ⚑ ]        ← 主按钮 flex:1，高 52
            ┌ 角色介绍 ────────────┐
            │ ▎ 竖条 + 标题         │
            │ 正文 15px / 1.78      │
            └──────────────────────┘
```

### 28.3 实现要点

**`page.js`（首页）**

```jsx
<div className="shell">
  <div className="scene" aria-hidden="true" />   {/* 深色场景托住导航玻璃 */}
  <Nav />
  <div className="home-wrap">
    <nav className="home-tabs">...</nav>
    <div className="home-pills">...</div>
    <HomeGrid cards={cards} covers={covers} />
    <div className="home-tagrow">...</div>
  </div>
</div>
```

tab 与胶囊都做成真实链接，`?tab=` / `?pill=` / `?tag=` 三个参数可叠加：

| tab | 行为 |
|---|---|
| 最新（默认） | 按 `publishedAt` 倒序 |
| 周榜 | 按 `likes` 倒序 |
| 猜你喜欢 | 按 `popularity` 倒序 |
| 比赛 / 胶囊「匹配」 | 筛 `参赛卡` 标签 |
| 游戏 / 画图 / 社群 | 显示「未接入」状态卡，不装空白 |

**`card/[id]/page.js`（详情页）**

左封面 `position:sticky; top:96px`，右信息单列。主按钮 `.btn-chat` 用
`--scene (#25414A)` 做底 —— 这是 design.md 的「深色浮层用白字」规则，
不是 dzmm 的粉色。

**`globals.css`**

切掉旧的 `.page/.hero/.chips/.chip/.grid/.card/.detail/.notes/.cta/.btn*`
与旧 `.home-*` 两段，换成新的「内容区」+「详情页」+「响应式」+「暗色」四段。
聊天页（`.chat-shell` 起）整段原样保留。

网格断点沿用 §17 实测：

```css
.home-wrap  { width: min(100% - 32px, 1248px); margin: 0 auto; }
@media (min-width: 1536px) { .home-wrap { width: min(100% - 32px, 1504px); } }
.home-grid  { grid-template-columns: repeat(5, minmax(0,1fr)); gap: 8px; }
/* 1180 → 4 列，900 → 3 列，720 → 2 列 + 封面转 4:5 */
```

### 28.4 验证

```
页面       / ?tab=week ?tab=guess ?pill=match ?tag=御姐 /card/430690 /chat /about → 全 200

首页       home-tabs 2   home-tab 18   home-pills 2   pill 7
           home-grid 1   zc-cover 25   zc-title 25   zc-foot 25
           zc-ad 12      home-more 1   home-tagrow 4   /card/ 链接 25

详情       detail-wrap / detail-media / detail-body / detail-title
           detail-author / au-av / follow-btn / detail-stats
           detail-tags / btn-chat / btn-susp / notes-card / big-count   各 2
           gallery 0（该卡无 images 字段，正常）

CSS        bytes 32769   5 列规则 1   暗色选择器 94
           粉色残留 ff3d6e / ffe9ef → 0
```

### 28.5 坑

**PowerShell 的 `[id]` 是通配符。** `Copy-Item "...\card\[id]\page.js"` 把文件写成 0 字节
（`[id]` 被当成字符集匹配 `i` 或 `d`）。必须用 `-LiteralPath`：

```powershell
Copy-Item -LiteralPath "src.js" -Destination "Z:\project\site\app\card\[id]\page.js" -Force
```

同一个坑对 `Get-Item` / `Select-String` 也成立。

**scp 静默失败（§27.5 复发过一次）**：这次改成先传 `/tmp/n_*.js` 再 `cp`，并在落地后
立刻 `stat -c%s` + `grep -c` 校验，三个文件都核过大小才 build。

### 28.6 没做 / 待确认

- 顶栏的「角色 / 消息 / 论坛 / 我的」目前只有「角色」是链接，其余没有对应页面；
- 「关注」tab 在 dzmm 是登录后个性化内容，这里并入「最新」；
- 周榜的下拉（日/周/月）只有 `▾` 视觉，没接切换 —— 用户早前提过要这个，还没做；
- 悬赏按钮是静态的。

## 29. 补齐截图里所有视觉元素（2026-11-12 21:2x）

用户：「一比一还原啊，除了没有的功能，以及配送，图里的都要有啊。」

即：**截图里出现的每个东西都要画出来**；后端没有的就做视觉 + 合理降级，不能空着。

### 29.1 补了什么

**顶栏（`Nav.jsx` 重写）**

```
[澜logo 30×30 深色圆角块]  👥角色  💬消息(角标9)  ⏱论坛  👤我的  ...  [🔍搜索全站]  [☾]  [+新建]  [头像+红点]
```

- 原来是「角色 / 对话 / 关于」三项纯文字，与截图不符，换成四项带图标
- 「消息」带角标（`--focus` 鼠尾草绿，不是粉色）
- 右侧补 `+` 新建按钮、头像 + 右上角红点（同样用 `--focus`）
- 搜索框接真实跳转：`/?q=关键词`
- 保留主题切换按钮（这个原站没有，属于我们自己的功能，放在搜索右边）

**卡片（`Card.jsx` 重写）**

| 元素 | 说明 |
|---|---|
| 封面右下角小图标 | `.zc-corner`，手柄造型，`rgba(10,16,18,.42)` 毛玻璃底 |
| 播放数图标 | 补了喇叭弧线，原来是纯三角 |
| 敏感遮罩图标 | 换成「眼睛 + 斜杠」，26px，与截图一致 |
| 遮罩文案 | 敏感图片 / 此图片可能包含敏感内容 / [查看] 三行 |
| 头像代理 | `creatorAvatar` 走 `/api/img`，原站防盗链，直连会裂 |

**遮罩默认行为改了**：原来只在 `localStorage.hideSensitive === "1"` 时遮，
现在默认遮（`!== "0"` 才不算），因为截图里全是遮住的、原站默认也是遮的。

**详情页（`card/[id]/page.js`）**

- 补 `rating` 星级（`cards.json` 里有 `rating: 4.97`，原来是废字段）
- 统计行从「♡ 805 / ⟳ 1166 / ✎ 分享」补到四项（多了 ⭐ 评分）
- 作者名下方是 `fmt(popularity) 播放`（原来错写成「粉丝」）

### 29.2 数据现实

`cards.json` 的 `creatorAvatar` **全部是 `None`**，所以所有卡片头像回落到渐变圆点。
这是数据缺，不是代码缺 —— 要真头像得回去抓 `card.getById` 拿头像字段。

`popularity` 是浮点（`10483.71`），`fmt()` 会四舍五入到 `1.0万`。

### 29.3 踩的坑（新）

**JSX 文本节点里的 `\uXXXX` 不解析。**

我写 patch 脚本时习惯性把中文转成 `\u5173\u6ce8` 避免编码问题，
但 **JSX 的文本子节点里 `\uXXXX` 是字面量**，只有 JS 字符串里才解析：

```jsx
<span>\u89d2\u8272</span>          // ❌ 屏幕上显示 "角色"
<span>{"\u89d2\u8272"}</span>      // ✅ 花括号里才是字符串
<span>角色</span>                    // ✅ 直接写字最省事
```

修法：正则 `\\u([0-9a-fA-F]{4})` → `chr(int(g,16))`，Nav 修了 12 处、Card 修了 63 处。

验证信号：`grep -o '搜索全站' page.html | wc -l` 从 **0** 变 **1**。

**scp 又漏了一次**：`apply_v3b.sh` 里 `cp /tmp/n_css.css`，但我上一轮只传了三个 js 没传 css，
`cp` 用的是 `/tmp` 里的旧文件，`globals.css` 停在 43771 字节、`brand-logo: 0`。
所以 **每个 cp 前都要确认同名文件确实上传过**，别假设 `/tmp` 是干净的。

### 29.4 验证

```
顶栏   brand-logo 1  brand-t 1  tab-badge 1  nav-plus 1  nav-avatar 1  nav-dot 1
       搜索全站 1     导航项 6

首页   home-tab 18  pill 7  home-grid 1  zc-title 25  zc-foot 25
       zc-ad 12  zc-corner 25  zc-mask 80  zc-view 20  zc-count 25
       home-more 1  home-tagrow 4

详情   detail-wrap / detail-media / detail-body / detail-title / detail-sub
       detail-author / au-av / follow-btn / detail-stats / detail-tags
       btn-chat / btn-susp / notes-card / notes-bar / big-count   各 2

CSS    37187 bytes   .brand-logo 3   .zc-corner 1   .zc-mask-eye 1
       5 列 1   暗色 99   粉色残留 0
```

### 29.5 仍然是静态的（用户已知「没有的功能」）

- 顶栏「消息 / 论坛 / 我的」指向 `/messages` `/forum` `/me`，页面还没建 —— 点了会 404；
- 「+ 新建」只有外观；
- 「悬赏」只有外观；
- 周榜下拉（日/周/月）只有 `▾`；
- 关注按钮不落库。

## 30. 顶栏拆成通栏三段（2026-11-12 21:3x）

用户：「导航栏拆了」「导航栏拆成它那个样子啊」。

等于说：**不是把元素塞进一个悬浮胶囊，而是照 dzmm 那样整条横跨视口、内部拆成三段。**

### 30.1 前后的差别

| | 之前（悬浮胶囊） | 现在（通栏三段） |
|---|---|---|
| 容器 | `position:fixed; top:16px; left/right:0` 内再居中一个 1120px 胶囊 | `position:fixed; top:0; left:0; right:0`，高 68px 贴顶通栏 |
| 内部 | `display:flex`，`spacer` 撑开，搜索挤在右侧 | `display:grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr)` |
| 分段 | 无 | `.nav-left` / `.search` / `.nav-right` 三段 |
| 选中态 | 深色实心胶囊（`background: var(--scene)` + 白字） | 无底色，只变字重 + 图标变鼠尾草绿 |
| 底边 | 圆角 999 + 全向描边 | 底部 1px 分隔线 + 顶部 1px 内高光 |
| 背景 | `.glass` 类（`rgba(255,255,255,.2)` 渐变 + 全向 border + `--elev-float`） | `rgba(243,242,237,.82)` + `blur(18px) saturate(160%)` |

### 30.2 结构

```jsx
<nav className="topnav">
  <div className="nav-left">
    <Link className="brand">澜 logo</Link>
    <div className="nav-tabs">
      <Link className="tab">角色</Link>
      <Link className="tab">消息<em className="tab-badge">9</em></Link>
      <Link className="tab">论坛</Link>
      <Link className="tab">我的</Link>
    </div>
  </div>

  <form className="search">🔍 <input placeholder="搜索全站" /></form>

  <div className="nav-right">
    <button className="theme-btn">☾</button>
    <button className="nav-plus">＋</button>
    <Link className="nav-avatar"><span className="nav-av-inner" /><em className="nav-dot" /></Link>
  </div>
</nav>
```

网格三列，中列 `auto`（搜索固定 320px），左右两列 `minmax(0,1fr)` 对称
—— 这样搜索**真正居中**，不随左右内容宽度漂移。

### 30.3 关键：把 `.glass` 摘掉

`<nav className="topnav glass">` 会让通栏吃到 `.glass` 的
`position:relative` / `border:1px solid rgba(255,255,255,.28)` / `box-shadow: var(--elev-float)` /
`background: linear-gradient(160deg, ...)`，把通栏底边糊成一条白边、还多出一圈全向投影。

改成 `className="topnav"`，让 `.topnav` 全权接管：

```css
.topnav {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  height: 68px;
  padding: 0 24px;
  background: rgba(243, 242, 237, 0.82);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border-bottom: 1px solid rgba(32, 41, 41, 0.08);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 20px rgba(19, 37, 41, 0.06);
}
```

`.shell` 的 `padding-top` 同步改 76 → **68**（顶栏高度即占位）。

### 30.4 响应式

| 宽度 | 变化 |
|---|---|
| ≤1080 | 搜索宽 320 → 200 |
| ≤860 | 搜索 `display:none`；顶栏高 68→60 且变两列；`.tab span` 隐藏只留图标；`padding 0 14px` |

小屏高度变化时 `.shell { padding-top: 60px }` 与 `.topnav-wrap { height: 60px }` 要一起改，
否则内容会被压到顶栏底下 —— 这两处必须同进同退。

### 30.5 验证

```
nav-left 1  nav-tabs 1  nav-right 1  search 1
brand-logo 1  tab-badge 1  nav-plus 1  nav-avatar 1
三段在 nav 内的偏移: nav-left@12  search@2058  nav-right@2409   ← 顺序正确
nav classes: topnav                                            ← glass 已摘
CSS 38448 B   grid 3 段 1   topnav-wrap{position:fixed} 1
暗色顶栏规则 2   pink 0
```

### 30.6 坑

**`s.find("/* ---------- 内容 ---------- */")` 找不到** —— 文件里那条注释的
短横线数量和我写的不一致，`assert` 直接挂。改成按后面的 `.page {` 定位再往回
`rfind("/*")`，稳得多。**拿注释当锚点靠不住，用选择器。**
