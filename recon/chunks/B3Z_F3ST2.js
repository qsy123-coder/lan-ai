(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2df9ea71-5ec3-4685-8797-c773585c37e0`,e._sentryDebugIdIdentifier=`sentry-dbid-2df9ea71-5ec3-4685-8797-c773585c37e0`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`ctx API 详解`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：`,(0,n.jsx)(r.code,{children:`ctx`}),` 是平台塞给你函数的第二个参数，里面挂着所有"在函数里能调用平台能力"的 API。命名跟浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` 很像，但作用域不同（详见下面 KV 章节）。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`0. ctx 总览`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`type ServerDrawTask = {
  id: string;
  outputImages: string[];
  createdAt: string;
  status: string;
  errorMessage?: string;
};

ctx = {
  gameId: number;
  user: { id: string; name: string }; // name 可能是空字符串
  kv: {
    get(key): Promise<{ value: unknown | null; updated_at: string | null }>;
    put(key, value): Promise<{ ok: true }>;
    putIfAbsent(key, value): Promise<boolean>;
    delete(key): Promise<{ ok: true }>;
    global: { /* 全游戏共享 KV，同上四个方法 */ };
  };
  completions(cfg): Promise<{ text: string }>;
  completions: {
    stream(cfg): AsyncIterable<{ delta: string }>;
  };
  chat: {
    list(ids?): Promise<ChatMessage[]>;
    insert(parentId, messages): Promise<ChatMessage & {
      ids: string[];
      message: ChatMessage;
    }>;
    timeline(messageId): Promise<string[]>;
  };
  draw: {
    generate(cfg): Promise<ServerDrawTask>; // 图片在 outputImages
    edit(cfg): Promise<ServerDrawTask>;
    models: {
      generate(): Promise<{ models, defaultModel }>;
      edit(): Promise<{ models, defaultModel }>;
    };
  };
  models: { list(): Promise<ModelList> };
};
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.chat.insert()`}),` 的 `,(0,n.jsx)(r.code,{children:`ids`}),` 与传入消息同序。为保持旧版 Chat 调用向后兼容，
返回对象顶层仍保留最后一条 `,(0,n.jsx)(r.code,{children:`ChatMessage`}),` 的 `,(0,n.jsx)(r.code,{children:`id`}),`、`,(0,n.jsx)(r.code,{children:`role`}),`、`,(0,n.jsx)(r.code,{children:`content`}),`、`,(0,n.jsx)(r.code,{children:`timestamp`}),`
等字段，并通过 `,(0,n.jsx)(r.code,{children:`message`}),` 显式提供同一条最后消息。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. `,(0,n.jsx)(r.code,{children:`ctx.kv`}),` — game scope 的键值存储`]}),`
`,(0,n.jsxs)(r.p,{children:[`⚠️ `,(0,n.jsxs)(r.strong,{children:[`跟浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 是两个完全独立的 KV，且行为差异很重要，特别留意`]}),`：`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{}),(0,n.jsxs)(r.th,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.kv`})]}),(0,n.jsxs)(r.th,{children:[`函数 `,(0,n.jsx)(r.code,{children:`ctx.kv`})]})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`作用域`}),(0,n.jsx)(r.td,{children:`(chat, 玩家)`}),(0,n.jsx)(r.td,{children:`(game, 玩家)`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家切换不同 chat`}),(0,n.jsx)(r.td,{children:`看不到旧 chat 的数据`}),(0,n.jsx)(r.td,{children:`看得到（跨 chat 持久）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`全游戏共享`}),(0,n.jsx)(r.td,{children:`不支持`}),(0,n.jsxs)(r.td,{children:[`支持（`,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),`）`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`Workbench 预览模式`})}),(0,n.jsx)(r.td,{children:`PostgreSQL（你自己的开发数据）`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`PostgreSQL（你自己的开发数据）`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`生产模式`})}),(0,n.jsx)(r.td,{children:`PostgreSQL`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`PostgreSQL（prod 数据）`})})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`服务端 KV 按 dev/prod 命名空间隔离`}),`：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`开发模式（Workbench 预览）下，`,(0,n.jsx)(r.code,{children:`ctx.kv.*`}),` 和 `,(0,n.jsx)(r.code,{children:`ctx.kv.global.*`}),` 都读写你自己的那份开发数据，与生产隔离，也与其他参与开发的人隔离——每个开发者各有一份。`]}),`
`,(0,n.jsxs)(r.li,{children:[`预览里写 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 排行榜不会污染线上；同时也读不到线上数据 —— 要验证真实数据，需要发布后在正式链路验证。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.kv.*`}),` 始终按 `,(0,n.jsx)(r.code,{children:`(gameId, 当前调用者 userId)`}),` 隔离：即便在开发数据里，也只能读写自己的私有数据。`]}),`
`,(0,n.jsxs)(r.li,{children:[`同一玩家的 `,(0,n.jsx)(r.code,{children:`ctx.kv`}),` 会跨聊天记录、跨存档槽共用。先区分跨局账号资料与单局进度：金钱、属性等若属于某个存档，服务端 key 必须包含稳定存档 ID，并校验该存档属于当前调用者。不要把共用 `,(0,n.jsx)(r.code,{children:`progress`}),` / `,(0,n.jsx)(r.code,{children:`gold`}),` 直接合并覆盖到刚读出的任意槽位，否则不同局会互相串档。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.kv.global.*`}),` 按 `,(0,n.jsx)(r.code,{children:`(gameId, NULL)`}),` 全游戏共享；在生产环境中，global delete 会删除所有玩家共用的值，改 global KV schema 前要兼容老格式。`]}),`
`]}),`
`,(0,n.jsxs)(r.h3,{children:[`1.1 玩家私有：`,(0,n.jsx)(r.code,{children:`ctx.kv.*`})]}),`
`,(0,n.jsx)(r.p,{children:`scope 是 (gameId, userId)。玩家 A 看不到玩家 B 的数据，但跨 chat 持久。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/save.ts
export default async function (req: any, ctx: any) {
  const action = req.body?.action;

  if (action === 'load') {
    const data = await ctx.kv.get('progress');
    return { progress: data.value };
  }

  if (action === 'save') {
    await ctx.kv.put('progress', req.body.progress);
    return { ok: true };
  }

  if (action === 'reserve-once') {
    const inserted = await ctx.kv.putIfAbsent('operation-reservation', {
      status: 'reserved',
      at: new Date().toISOString(),
    });
    return { inserted };
  }

  if (action === 'reset') {
    await ctx.kv.delete('progress');
    return { ok: true };
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`get()`}),` 即使 miss 也返回 `,(0,n.jsx)(r.code,{children:`{ value: null, updated_at: null }`}),`；`,(0,n.jsx)(r.code,{children:`put()`}),` / `,(0,n.jsx)(r.code,{children:`delete()`}),` 返回 `,(0,n.jsx)(r.code,{children:`{ ok: true }`}),`；只有 `,(0,n.jsx)(r.code,{children:`putIfAbsent()`}),` 被 runtime 解包为 boolean。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`putIfAbsent(key, value)`}),` 只有在该作用域内的 key 尚不存在时才原子写入并返回 `,(0,n.jsx)(r.code,{children:`true`}),`；key 已存在时不覆盖并返回 `,(0,n.jsx)(r.code,{children:`false`}),`。它提供的是“至多一个预留成功者 / winner election”，`,(0,n.jsx)(r.strong,{children:`不是 exactly-once 副作用`}),`：预留成功后如果函数崩溃、AI 调用失败或响应丢失，key 仍可能永久停在 `,(0,n.jsx)(r.code,{children:`reserved`}),`，重试只会得到 `,(0,n.jsx)(r.code,{children:`false`}),`，无法知道奖励或付费操作是否真正完成。`]}),`
`,(0,n.jsxs)(r.p,{children:[`付费动作应保存 `,(0,n.jsx)(r.code,{children:`reserved → completed/result`}),` 或 `,(0,n.jsx)(r.code,{children:`failed`}),` 状态。同一 action ID 的重复调用只可返回 completed 缓存；看到 reserved 要明确报告 pending，看到 failed 要明确报告失败，两者都 fail closed、不得再次调用 AI/draw。玩家显式开始新尝试时生成新的 action ID。当前 API 没有 CAS/lease，不能安全地按超时自动接管旧 reservation。`]}),`
`,(0,n.jsx)(r.p,{children:`这也不是通用 CAS：已有 key 的“读取、修改、覆盖”仍可能发生并发冲突。`}),`
`,(0,n.jsxs)(r.h3,{children:[`1.2 全游戏共享：`,(0,n.jsx)(r.code,{children:`ctx.kv.global.*`})]}),`
`,(0,n.jsx)(r.p,{children:`scope 是 (gameId, NULL) —— 一个游戏一份，所有玩家共享。下面的排行榜只适合展示型、best-effort 场景；严格排名和奖励结算不能依赖这种无事务的读-改-写。`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`Preview 对 global KV 的写入落在你自己的开发数据里，不会影响线上、也不会影响其他开发者，可以放心用正式 key 调试；同理，Preview 也读不到线上排行榜，要验证真实数据需发布后验证。`}),`
`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/leaderboard.ts
const BOARD_KEY = 'leaderboard';

export default async function (req: any, ctx: any) {
  const action = req.body?.action;

  if (action === 'submit') {
    const score = Number(req.body.score);
    if (!Number.isFinite(score) || score < 0) {
      throw new Error('invalid score');
    }

    const board = (await ctx.kv.global.get(BOARD_KEY)).value ?? [];
    board.push({ user: ctx.user.id, name: ctx.user.name || '匿名', score, at: Date.now() });
    board.sort((a, b) => b.score - a.score);
    const persistedBoard = board.slice(0, 100);
    await ctx.kv.global.put(BOARD_KEY, persistedBoard);
    return { ok: true, listed: persistedBoard.some((e) => e.user === ctx.user.id) };
  }

  if (action === 'list') {
    const board = (await ctx.kv.global.get(BOARD_KEY)).value ?? [];
    return {
      board: board.map((e) => ({ name: e.name, score: e.score, at: e.at })),
    };
  }
}
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ 并发问题：`,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 是共享数据，多个玩家同时提交分数会读到同一份旧数据再写回，可能互相覆盖；同一玩家的高分也可能被并发的低分覆盖。`,(0,n.jsx)(r.code,{children:`putIfAbsent`}),` 只能原子创建新 key，不能原子更新已有排行榜。此模式仅适合可容忍偶尔丢写的展示榜，不适合奖励、比赛或严格排名；这些场景需要 CAS/事务存储。`]}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`1.3 限制`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`项`}),(0,n.jsx)(r.th,{children:`限制`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`key`}),(0,n.jsxs)(r.td,{children:[`非空、不含 NUL、不是 `,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`}),`、Unicode 必须完整，且 ≤ 512 UTF-8 字节；否则 `,(0,n.jsx)(r.code,{children:`invalid_request`}),` / `,(0,n.jsx)(r.code,{children:`key_too_large`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`value（JSON 序列化后）`}),(0,n.jsxs)(r.td,{children:[`≤ 128 KiB（131072 UTF-8 字节）；否则 `,(0,n.jsx)(r.code,{children:`value_too_large`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单次调用 bridge RPC 总数`}),(0,n.jsxs)(r.td,{children:[`≤ 50，所有 `,(0,n.jsx)(r.code,{children:`ctx.*`}),` 共享，不是 KV 专属计数`]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`2. `,(0,n.jsx)(r.code,{children:`ctx.completions`}),` — 服务端 AI 对话`]}),`
`,(0,n.jsxs)(r.p,{children:[`参数形状跟浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.completions`}),` 接近，积分扣的是触发这次调用的玩家（不是开发者），但结果契约不同：浏览器方法返回 `,(0,n.jsx)(r.code,{children:`Promise<void>`}),`，文本通过累计全文回调提供；一次性 `,(0,n.jsx)(r.code,{children:`ctx.completions`}),` 直接返回 `,(0,n.jsx)(r.code,{children:`{ text: string }`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`模型选择规则也与浏览器一致：作者传入的具体且可用模型优先；`,(0,n.jsx)(r.code,{children:`model: 'default'`}),` 或作者模型已不可用时，服务端会根据签名调用令牌中的玩家与 Chat，读取同一个 `,(0,n.jsx)(r.code,{children:`chats.model`}),` 设置。玩家在游戏 Chat 设置里修改后，浏览器调用和 Function Runner 调用都会生效。Workbench 预览挂在隐藏的开发会话上，`,(0,n.jsx)(r.code,{children:`default`}),` 同样读取该会话的模型设置，与玩家链路一致。`]}),`
`,(0,n.jsxs)(r.p,{children:[`两者的 `,(0,n.jsx)(r.code,{children:`messages`}),` 都只支持 `,(0,n.jsx)(r.code,{children:`user`}),` / `,(0,n.jsx)(r.code,{children:`assistant`}),`，不能传 `,(0,n.jsx)(r.code,{children:`system`}),`。把提示词写在 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`}),` 只能防止它直接随浏览器源码下发；玩家输入可能通过 prompt injection 让模型复述指令。prompt 中不得放 secrets、个人数据或安全规则，权威校验必须写成确定性代码。`]}),`
`,(0,n.jsx)(r.h3,{children:`2.1 一次性`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`const question = String(req.body?.question ?? '');
const result = await ctx.completions({
  model: 'default',
  messages: [
    {
      role: 'user',
      content: \`你是占卜师。请用温和的语气回答。\\n\\n玩家问题：\${question}\`,
    },
  ],
  maxTokens: 500,
});

return { reply: result.text };
`})}),`
`,(0,n.jsxs)(r.p,{children:[`返回值 `,(0,n.jsx)(r.code,{children:`{ text: string }`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`2.2 流式（async iterable）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`export default async function* (req: any, ctx: any) {
  for await (const chunk of ctx.completions.stream({
    model: 'default',
    messages: [{ role: 'user', content: req.body.prompt }],
  })) {
    yield { delta: chunk.delta };
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.completions.stream(...)`}),` 返回 `,(0,n.jsx)(r.code,{children:`AsyncIterable<{ delta: string }>`}),`，配合 `,(0,n.jsx)(r.code,{children:`async function*`}),` + `,(0,n.jsx)(r.code,{children:`yield`}),` 用。这里的 `,(0,n.jsx)(r.code,{children:`chunk.delta`}),` 是增量片段；它与浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.completions`}),` 回调里的累计全文不同。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ 50 次 subrequest 上限是所有 bridge RPC 的共享上限。流式调用建立 cursor 会消耗 RPC，每次读取一个 delta 的 `,(0,n.jsx)(r.code,{children:`cursor.next()`}),` 也会继续消耗；上游如果把文本切得很碎，可能在正常结束前耗尽大约 50 次额度。需要稳定长文本时优先使用一次性 `,(0,n.jsx)(r.code,{children:`ctx.completions()`}),`，或控制输出长度并处理流中途失败。`]}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`2.3 配额`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`单次调用 fn 内最多 3 次 `,(0,n.jsx)(r.code,{children:`ctx.completions`}),`（含 stream 计为 1 次）—— 超第 4 次抛 `,(0,n.jsx)(r.code,{children:`quota_exceeded`})]}),`
`,(0,n.jsxs)(r.li,{children:[`玩家级 60/分 + 2000/天 速率限（与浏览器侧 `,(0,n.jsx)(r.code,{children:`dzmm.completions`}),` 共用）`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. `,(0,n.jsx)(r.code,{children:`ctx.chat`}),` — 聊天存档`]}),`
`,(0,n.jsxs)(r.p,{children:[`读 / 写当前 chat 的消息。与浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.chat`}),` 操作同一份数据。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// 不传 ids：拉当前 active history，不包含其它历史分支
const all = await ctx.chat.list();

// 从自己的 KV 存档读取此前由 SDK 返回的 ID；不要构造 ID
const savedMessageIds = ((await ctx.kv.get('save:messageIds')).value ?? []) as string[];
const some = await ctx.chat.list(savedMessageIds);

// 非空 Chat：undefined / null / '' 追加 active leaf；空 Chat 才创建根
const r = await ctx.chat.insert(parentId, [
  { role: 'user', content: req.body.text },
]);
const insertedIds = r.ids; // 与 messages 同序

// Read the saved message's timeline IDs.
const savedMessageId = savedMessageIds[savedMessageIds.length - 1];
const ids = savedMessageId ? await ctx.chat.timeline(savedMessageId) : [];
`})}),`
`,(0,n.jsxs)(r.p,{children:[`只有明确传入由 SDK 返回的 message ID 才表示从该存档点分支。message ID 是平台生成、稳定且不透明的字符串；请直接保存并原样回传 `,(0,n.jsx)(r.code,{children:`list()`}),`、`,(0,n.jsx)(r.code,{children:`insert().ids`}),` 或 `,(0,n.jsx)(r.code,{children:`timeline()`}),` 返回的值，不要解析、拼接、猜测格式或自行构造。`,(0,n.jsx)(r.code,{children:`ctx.chat.list(ids)`}),` 单次最多传 100 个 ID。`]}),`
`,(0,n.jsxs)(r.h3,{children:[`开发模式下 `,(0,n.jsx)(r.code,{children:`ctx.chat`}),` 也可用`]}),`
`,(0,n.jsxs)(r.p,{children:[`Workbench 预览挂在一个隐藏的开发会话（dev chat）上，函数里的 `,(0,n.jsx)(r.code,{children:`ctx.chat`}),` 在开发模式下读写的就是这个开发会话的存档，不会再抛 `,(0,n.jsx)(r.code,{children:`chat_not_associated`}),`。玩家会话里则读写玩家 chat 的存档，与浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.chat`}),` 操作同一份数据。开发会话与玩家会话按命名空间隔离，预览写入不会出现在任何玩家的聊天里。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`4. `,(0,n.jsx)(r.code,{children:`ctx.draw`}),` — 服务端 AI 画图`]}),`
`,(0,n.jsxs)(r.p,{children:[`积分仍然扣触发调用的玩家，但服务端返回值`,(0,n.jsxs)(r.strong,{children:[`不会经过浏览器 SDK 的 `,(0,n.jsx)(r.code,{children:`images`}),` 归一化`]}),`。fn-runner 会返回 provider 的任务对象，图片字段名是 `,(0,n.jsx)(r.code,{children:`outputImages`}),`。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// 生成
const task = await ctx.draw.generate({
  prompt: req.body.prompt,
  dimension: '1:1',
  model: 'anime',
});
return { images: task.outputImages };

// 编辑（参考图必须是 URL，不接受 base64）
const edited = await ctx.draw.edit({
  prompt: '换成蓝色头发',
  images: [req.body.refUrl], // 必须是平台已生成图片或平台信任 URL
  model: 'pro',
});
`})}),`
`,(0,n.jsx)(r.h3,{children:`4.1 阻塞 vs polling`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.draw.generate / edit`}),` 是阻塞的：函数会等图生成完才返回（内置轮询，最长 2 分钟）。轮询时序接近浏览器 SDK，但返回对象形状不同，请使用 `,(0,n.jsx)(r.code,{children:`outputImages`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`4.2 列模型`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`const { models, defaultModel } = await ctx.draw.models.generate();
// 跟浏览器 dzmm.draw.generateModels() 结构相同
`})}),`
`,(0,n.jsx)(r.h3,{children:`4.3 配额`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`单次调用 fn 内最多 3 次 `,(0,n.jsx)(r.code,{children:`ctx.draw.*`}),`（generate / edit 共同计数）—— 超第 4 次抛 `,(0,n.jsx)(r.code,{children:`quota_exceeded`})]}),`
`,(0,n.jsx)(r.li,{children:`玩家级配额跟浏览器侧共用`}),`
`]}),`
`,(0,n.jsxs)(r.h3,{children:[`4.4 ⚠️ 没有公开的 `,(0,n.jsx)(r.code,{children:`uploadReference`})]}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器和服务端函数都没有公开的 `,(0,n.jsx)(r.code,{children:`draw.uploadReference`}),` 方法。玩家本地/base64 图片应直接交给浏览器侧 `,(0,n.jsx)(r.code,{children:`dzmm.draw.edit()`}),`；Host 会在内部完成校验和上传：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 浏览器侧
const task = await dzmm.draw.edit({
  images: [canvas.toDataURL('image/png')],
  prompt: '换成蓝色头发',
});
`})}),`
`,(0,n.jsxs)(r.p,{children:[`服务端 `,(0,n.jsx)(r.code,{children:`ctx.draw.edit()`}),` 只能接收平台已生成图片的 URL 或其它平台信任 URL。不要把 data URL 通过 `,(0,n.jsx)(r.code,{children:`fn.invoke`}),` 转发给函数；这既受 1 MiB body 限制，也不会触发浏览器 Host 的内部上传流程。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`5. `,(0,n.jsx)(r.code,{children:`ctx.models.list`}),` — 列对话模型`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`const list = await ctx.models.list();
// 跟浏览器 dzmm.models.list() 返回结构相同
`})}),`
`,(0,n.jsx)(r.p,{children:`跟浏览器版完全一致，不消耗积分。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`6. `,(0,n.jsx)(r.code,{children:`ctx.gameId`}),` / `,(0,n.jsx)(r.code,{children:`ctx.user`})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.gameId`}),` — 当前游戏的数字 ID（每个游戏一个）。常见用途：日志、调试。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.user`}),` — 当前触发调用的玩家：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`ctx.user = {
  id: string;   // 玩家 UUID
  name: string; // 昵称，未设置时是空字符串
};
`})}),`
`,(0,n.jsxs)(r.p,{children:[`显示昵称时使用 `,(0,n.jsx)(r.code,{children:`ctx.user.name || '匿名'`}),`，不要只用 `,(0,n.jsx)(r.code,{children:`??`}),` 判断，因为未设置昵称时是 `,(0,n.jsx)(r.code,{children:`''`}),` 而不是 `,(0,n.jsx)(r.code,{children:`null`}),`。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ 不要把 `,(0,n.jsx)(r.code,{children:`ctx.user.id`}),` 写进返回值给浏览器，玩家自己的 ID 没事，但暴露其他玩家的 ID（比如 leaderboard 里）算泄漏隐私。推荐只把 `,(0,n.jsx)(r.code,{children:`name`}),` 和必要的数据返回。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 不存在的 API（常见误用）`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`浏览器 SDK 有`}),(0,n.jsx)(r.th,{children:`fn 内 ctx 有吗`}),(0,n.jsx)(r.th,{children:`备注`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.fn.invoke`})}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsx)(r.td,{children:`函数内不能再调函数（防套娃）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.toast.*`})}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsx)(r.td,{children:`toast 是给玩家的，fn 不显示 UI`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.user.jwks()`})}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsx)(r.td,{children:`不需要，fn 已在受信端`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`dzmm.draw.download`}),` / `,(0,n.jsx)(r.code,{children:`nav`})]}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsx)(r.td,{children:`这些是浏览器侧的 navigation 行为`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.draw.uploadReference`})}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsxs)(r.td,{children:[`浏览器和 fn 都没有这个公开方法；本地图直接传给浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.draw.edit`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.waitUntil`})}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsx)(r.td,{children:`不支持后台任务，函数返回后就清理资源`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`直接 `,(0,n.jsx)(r.code,{children:`fetch('https://...')`})]}),(0,n.jsx)(r.td,{children:`❌`}),(0,n.jsxs)(r.td,{children:[`沙箱阻断外网（只有平台内部的 `,(0,n.jsx)(r.code,{children:`ctx.*`}),` bridge 能出站）`]})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`不要假设所有误用都会统一返回 `,(0,n.jsx)(r.code,{children:`unsupported_feature`}),`：大多数属性根本不存在，调用时会产生 JavaScript `,(0,n.jsx)(r.code,{children:`TypeError`}),`；被阻断的 `,(0,n.jsx)(r.code,{children:`fetch`}),` 当前通常也作为 `,(0,n.jsx)(r.code,{children:`function_error`}),`、`,(0,n.jsx)(r.code,{children:`source: 'user'`}),` 返回。`,(0,n.jsx)(r.code,{children:`ctx.waitUntil`}),` 是明确的稳定例外：它返回 `,(0,n.jsx)(r.code,{children:`unsupported_feature`}),`、`,(0,n.jsx)(r.code,{children:`source: 'runtime'`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 完整示例：跨玩家共享排行榜`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`下面示例演示共享存储、去重和排名，不构成防作弊实现。浏览器提交的 `,(0,n.jsx)(r.code,{children:`score`}),` 不可信；
正式游戏应先根据可信服务端状态、一次性挑战 token 或可验证回放重新计算分数。示例仍是无事务的 get-modify-put，可能丢并发提交或让低分覆盖高分，只适合 best-effort 展示榜，不能用于奖励或严格排名。Preview 写入落在你自己的开发数据里，不会影响线上数据，直接用正式 key 即可。`]}),`
`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/leaderboard.ts
const MAX_SCORE = 10_000_000;
const TOP_N = 100;
const BOARD_KEY = 'leaderboard';

export default async function (req: any, ctx: any) {
  const { action } = req.body ?? {};

  if (action === 'submit') {
    const raw = Number(req.body.score);
    if (!Number.isFinite(raw) || raw < 0 || raw > MAX_SCORE) {
      throw new Error('分数超出允许范围');
    }

    const board = (await ctx.kv.global.get(BOARD_KEY)).value ?? [];

    // 用 userId 去重：玩家只保留最高分
    const existing = board.findIndex((e: any) => e.user === ctx.user.id);
    const entry = {
      user: ctx.user.id,
      name: ctx.user.name || '匿名',
      score: raw,
      at: Date.now(),
    };

    if (existing < 0) {
      board.push(entry);
    } else if (board[existing].score < raw) {
      board[existing] = entry;
    } else {
      // 没有刷新最高分时不要把旧快照写回去，否则可能覆盖另一名玩家刚提交的成绩。
      const persistedBoard = board.slice(0, TOP_N);
      const rankIndex = persistedBoard.findIndex((e: any) => e.user === ctx.user.id);
      const rank = rankIndex >= 0 ? rankIndex + 1 : null;
      return { ok: true, kept: true, listed: rank !== null, rank };
    }

    board.sort((a: any, b: any) => b.score - a.score);
    const persistedBoard = board.slice(0, TOP_N);
    await ctx.kv.global.put(BOARD_KEY, persistedBoard);

    const rankIndex = persistedBoard.findIndex((e: any) => e.user === ctx.user.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : null;
    return { ok: true, kept: false, listed: rank !== null, rank };
  }

  if (action === 'list') {
    const board = (await ctx.kv.global.get(BOARD_KEY)).value ?? [];
    return {
      board: board.map((e: any) => ({ name: e.name, score: e.score, at: e.at })),
      // 不返回 user.id，避免泄漏
    };
  }

  if (action === 'myRank') {
    const board = (await ctx.kv.global.get(BOARD_KEY)).value ?? [];
    const persistedBoard = board.slice(0, TOP_N);
    const me = persistedBoard.find((e: any) => e.user === ctx.user.id);
    return {
      rank: me ? persistedBoard.indexOf(me) + 1 : null,
      score: me?.score ?? null,
    };
  }

  throw new Error(\`未知排行榜动作：\${action}\`);
}
`})}),`
`,(0,n.jsx)(r.p,{children:`浏览器侧：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.fn.invoke('leaderboard', { action: 'submit', score: 9999 });
const { board } = await dzmm.fn.invoke('leaderboard', { action: 'list' });
const me = await dzmm.fn.invoke('leaderboard', { action: 'myRank' });
`})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};