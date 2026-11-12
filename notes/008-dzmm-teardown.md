# notes/008 — dzmm.ai 站点拆解（2026-11-11）

> 目的：为一个「同类站」做产品与工程前置调研。只读抓取，未做任何写操作。
> 产物：截图 `out/site/*.png`、接口样本 `captures/site/api/*.json`、路由与文案 `captures/site/structure.json`。

## 1. 站点概况

| 项 | 值 |
|---|---|
| 名称 / Slogan | **DZMM AI** — 让幻想有回应 \| AI 角色聊天与角色卡 |
| 形态 | Web（桌面优先，三栏布局）+ App（有 App 下载入口） |
| 技术栈 | **Expo Router（React Native Web）+ Vite** 构建、**tRPC** 单入口 API、**Supabase** 认证与存储、Cloudflare 边缘、PostHog 埋点、Sentry 上报 |
| 构建标识 | `x-dzmm-build: 99a3093b…`、`x-dzmm-built-at: 1794317091874` |
| 路由规模 | 425 条（Expo Router 目录式，含 `(tabs)/(others)(studio)(draw)` 分组） |
| 核心内容 | 角色卡（card）+ 与角色的多轮聊天 + 论坛/广场 + 画图工作室 + 创作者 Studio |

## 2. 信息架构（已截图）

顶栏：`◈ 角色` / `💬 消息` / `◎ 论坛` / `👤 我的`，右侧全站搜索框、通知铃、头像。

### 2.1 角色（首页 `/`）

- 一级 tab：**关注 · 最新 · 猜你喜欢 · 新手 · 榜单 · 比赛 · 分类 · 游戏 · 画图 · 社群**
- 二级入口：**匹配 · 念白 · 画图 · 小说 · 团本 · 悬赏 · 任务**
- 内容：角色卡网格（封面 + 标题 + 作者 + 标签）、运营横幅（团本模式）、广告位（970×250 / 336×280）
- 首次进入弹 **Onboarding**：选性别（男/女/更多）+ 兴趣分类（最多 3 个）+ 18+ 条款勾选

### 2.2 消息（`/chat`）

三栏：
- 左：会话列表（`匹配 / 群聊 / 定制` 三个入口；`全部` + 角色筛选圆形头像组；按 昨天/上周 分组；「加载更多记录」）
- 中：对话流。顶部一行显示 **角色名 + 模型选择器**（如 `Flux-0217 (16K)`）；消息块支持长文 + 建议回复（`<sug>` 三段）
- 底部输入框：左侧 `{}` 结构化输入、右侧 语音/图片/更多，提示 `Shift+Enter 换行`
- 右上工具条：分享、更多、设置、书签、朗读

### 2.3 论坛 / 广场（`/forum`）

- 左侧：`主题 / 作品 / 我的` + 主题分类（最新、角色与创作、互动交友、生活交流、站务与求助、真人专区、妹子认证）
- 中间：帖子流（置顶、标签、作者等级 VIP1/VIP3、点赞/踩/评论数）
- 右侧：关于广场、热门标签（`#剧情 520` `#调教 520` `#男娘 455` …）、活跃群组（成员数）

### 2.4 我的（`/me`）+ 会员与价格（`/pricing`）

`/pricing` 完整可见：积分说明、充值档位、月卡、VIP1–VIP3 权益表。

### 2.5 其他分区（路由可见，未逐个截图）

`/explore`、`/search`、`/search/explore`、`/search/following`、`/post/$postId`、`/points-card`、
`/purchase-giftcard`、`/draw`（gallery / tag / generate{tabs: app,edit,history,tags}）、
`/studio`（bots / $botId / commands / docs / edit / complete / game-creation{new,upload,workbench-beta,dev-keys,cli-auth}）。

## 3. 数据模型（从接口真实返回还原）

### 3.1 Card（`card.getById` 26 字段）

```
id, name, cardFilename, originalFilename,
isPublic, isSensitive, isImageBlur, isHidden, publishStatus(approved),
creator, creatorFullName, creatorAvatarUrl, creatorNotes, userId,
createdAt, updatedAt, publishedAt, firstPublishedAt,
imageInfo[{url,name,isHidden,triggerKeywords[]}],
weightedRating, popularityScore, isGamefy, likesCount, commentsCount,
tags[], rawdata
```

运行时视角（`card.getForChat` 追加）：`avatarUrl, recommendedModel, generalChatModelId,
statusTemplate, suggestedReplies, blurNsfwImages, isGeneralChat, gamefyId`。

> `creatorNotes` 是**创作者给玩家看的说明**（长文，含分支玩法）；角色本体设定在 `rawdata`（详情接口返回为空，需 `card.getForChat` 或编辑页取）。

### 3.2 Category（`category.list`，21 条）

`id, name, displayName, description, isNew, tags[], coverImageUrl`
例：`truelove/纯爱`、`girl/女性向`、`NTR`、`古风历史`、`调教`、`乱伦`、`仙侠古风`、`大世界`、`后宫`、`足控`、`同人`、`百合`、`男娘`、`油腻`、`扶她`、`一般向`、`男同`、`女性视角`、`游戏`。

### 3.3 Chat / 消息（`chat.getSettings` / `chat.getMessages`）

会话设置：`chatId, cardId, cardName, cardAvatarUrl, title, model, style, maxTokens, randomIndex,
createdAt, lastVisited, deepThinking, enableMemoryEnhance, visualNovelMode,
backgroundOfficial, backgroundCustom, voiceId, voiceAutoPlay, voiceOnlyQuotes,
voiceIgnoreEnglish, voiceIgnoreParentheses, voiceReadAsterisks, imageGenerationModel,
isGamefy, presetId, presetOverride, modelLock, trialExperiment`

消息：`chunks[{chunkId, messages[{role, content}]}]`、`chunkInfos`、`activeGeneration`（分块存储，支持超长上下文）。

### 3.4 模型目录（`chat.models`，49 个模型）

```
categories[{key,name,description,modelGroups[{seriesKey,icon,gradient,description,
  price,contexts[{internalName,displayName,maxTokens}],minMembershipLevel,
  thinkingSupported,forceThinking,strictModeration,isRecommended,isApex,...}]}]
models[{internalName, displayName, price, description}]
defaultModel, language, unsupportedLanguages
```

已见系列：`XL-0826`（均衡）、`Surge`（情绪反应快，32K/16K）、`Dash`（低消耗高频）、`Flux`、
`nalang-max/medium/xl`、`x-apex-*`。`price` 量级 0.0001–0.0004（按 token 计价）。

### 3.5 其他

| 数据 | 接口 | 关键字段 |
|---|---|---|
| 积分 | `credits.getBalance` | `credit, bonusCredit, total, owedCredits, nextExpiring, expiringWithinWindow` |
| 额度 | `chat.getQuotas` | `planName, quotas{turbo{remaining,total,planName}}` |
| 任务 | `tasks.list` | `tasks[{key,title,description,reward,credit,...}]`（签到 7 天等） |
| 预设 | `preset.list` | `{presets, settings}` |
| 标签 | `chatroom.getTags` | 71 个（官方/AI/剧情/小说/画图…） |
| 榜单 | `competition.awardedCards` | `[{cardId, rank}]`（549 条） |
| 悬赏 | `bountyQuest.myClaims` | `{claims[]}` |

## 4. API 面

**tRPC 单入口** `/api/trpc/<proc>?batch=1&input={"0":{"json":…,"meta":…}}`，已见：

```
auth:        /api/auth/token
chat:        chat.models, chat.createByCard, chat.getSettings, chat.getMessages, chat.getQuotas,
             chat.getModelMetrics, chat.listAll, chat.cardRefusalNotice
card:        card.getById, card.getForChat
category:    category.list, category.listForOnboarding
community:   chatroom.getTags, chatroom.getPreview, post.resolvePostId, post.checkBookmark,
             competition.awardedCards, competition.cardCompetitionInfo
feeds:       home.getCards{type,categoryName,direction}, home.newbie, home.rerankVariant,
             forYouV2.start/explore/validate/onboarding/reportClick/reportExposures
user:        user.getMe, user.getPreferences, user.getBlockedUserIds, user.relations.checkFollowing,
             user.relations.checkBlocked, user.recordFingerprint, userPreference.getAll
misc:        preset.list, tasks.list, bountyQuest.myClaims, notification.*, featureSwitch.mine,
             privacy.flywheelCapture, ads.close/label, history.record, studio.getVoices
business:    /api/invite/claim, /api/ads-serving, /api/with-auth/points-card/status,
             /api/with-auth/dzmm/affiliate/partner/profile
realtime:    /ws/matching/  (WebSocket, 匹配)
```

## 5. 计费与会员（`/pricing` 原文）

- 积分用于站内付费功能（如 MAX 模型）；**任意充值即 VIP1**，近 30 天累计充值决定等级。
- 充值档位：`¥10 → 137 积分`（VIP1）、`¥50 → 856`（VIP1）、`¥100 → 2,055`（VIP2）、`¥400 → 10,958`（VIP3）；另有**月卡**（每天领积分）。
- VIP1 权益：深度思考、记忆增强、MAX 模型使用权（使用仍扣积分）、API 50 次/分钟、检查点查看 15 次/日、Anime 15–115 次/日（时段加成）、编辑图片 4 次/日、搜索 500 次/小时。
- 生成计费：**预扣 3.2 credit/条 → 按 token 结算（≈2.1/条）**，余额不足直接拒且不扣费；免费号 75 credit 一次性。

## 6. UI 设计系统（照抄要点）

- **浅色为主**：白底 / 米白分区 / 粉色主色（约 `#FF6B9D`）+ 深灰文字；暗色仅作强调块
- 顶部导航固定 64px：左侧 logo+4 tab（图标+文字），右侧胶囊搜索框 + 铃铛 + 头像
- 卡片：圆角 12–16px、1px 浅描边、hover 微抬；角色卡封面 3:4
- 聊天：三栏（左 260px 列表 / 中自适应 / 右图标条），消息气泡无边框、长文满宽，建议回复以 `<sug>` 生成 3 条快捷句
- 输入框：圆角 24px、内嵌工具按钮、`Shift+Enter` 换行提示
- Onboarding：居中大卡（720px），性别双卡 + 兴趣 chips（最多 3）+ 18+ 条款块 + 全宽主按钮
- 论坛：左分类 / 中帖子 / 右信息栏（关于、热标签、群组）

## 7. 克隆所需的最小骨架（结论）

| 层 | 必须有的东西 | 备注 |
|---|---|---|
| 角色卡 | card 表 + 分类 + 标签 + 封面/多图 + 创作者 | 卡是内容核心，支持 rawdata 导入（SillyTavern 格式） |
| 会话 | chat 表（按 card 归属）+ 分块消息 + 每会话模型设置 | 卡与会话强绑定，跨卡复用会话会 403 |
| 生成 | `/api/chat` SSE + 预扣/结算 + 模型矩阵 | 可直接转发到「额度池」现有链路 |
| 账号 | 登录（邮箱/OAuth）+ 积分账本 | 与池子的账号体系分离 |
| 前台 | 首页 feed、角色卡详情、聊天页、消息列表 | 先做这四屏即可用 |
| 运营 | 任务/签到、充值档位、VIP 等级 | 二期 |

## 8. 待确认（产品侧）

见对话中的产品问题清单：范围（是否含论坛/画图/Studio）、卡片来源（抓取 / UGC / 导入）、
额度对接方式（池子直连 vs 自建账本）、部署形态、视觉还原度、合规与内容边界。
