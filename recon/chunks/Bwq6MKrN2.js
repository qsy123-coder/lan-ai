(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0409e1c9-bbd1-4b93-ba42-74d8a4d8a19c`,e._sentryDebugIdIdentifier=`sentry-dbid-0409e1c9-bbd1-4b93-ba42-74d8a4d8a19c`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`编写函数`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：把代码放在 `,(0,n.jsx)(r.code,{children:`functions/{name}.ts`}),` 或 `,(0,n.jsx)(r.code,{children:`functions/{name}.js`}),` 里，`,(0,n.jsx)(r.code,{children:`name`}),` 就是浏览器调用时用的名字。每个文件有一个 `,(0,n.jsx)(r.code,{children:`default export`}),` 的服务端入口，可以在同一文件里写任意数量的 helper；不能 `,(0,n.jsx)(r.code,{children:`import`}),` 别的文件 / npm 包。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 函数签名`}),`
`,(0,n.jsxs)(r.p,{children:[`每个 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`}),` 必须 default export 一个函数。函数名只允许字母、数字、下划线和连字符，不扫描子目录，同名 `,(0,n.jsx)(r.code,{children:`.ts`}),` / `,(0,n.jsx)(r.code,{children:`.js`}),` 不能同时发布。下面用 TypeScript 举例；JavaScript 文件去掉类型标注即可。两种形态：`]}),`
`,(0,n.jsx)(r.h3,{children:`1.1 一次性函数（最常见）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/echo.ts
export default async function (request: any, ctx: any) {
  return {
    echo: request.body,
    by: ctx.user?.id,
  };
}
`})}),`
`,(0,n.jsx)(r.p,{children:`参数：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`request.body`}),` —— 浏览器传过来的 body（已 JSON 解析）`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx`}),` —— 平台注入的工具箱，详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`ctx API 详解`})]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`返回：任何能被 `,(0,n.jsx)(r.code,{children:`JSON.stringify`}),` 的对象。浏览器侧 `,(0,n.jsx)(r.code,{children:`await dzmm.fn.invoke('echo', { ... })`}),` 会拿到这个返回值。`]}),`
`,(0,n.jsx)(r.h3,{children:`1.2 流式函数（async generator）`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`async function*`}),` 让函数像 SSE 一样边算边吐 chunk，浏览器侧用 `,(0,n.jsx)(r.code,{children:`for await`}),` 消费。最常见用法是流式 AI 对话。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/storyteller.ts
export default async function* (request: any, ctx: any) {
  const prompt = String(request.body?.prompt ?? '');

  // ctx.completions.stream 是个 async generator
  for await (const chunk of ctx.completions.stream({
    model: 'default',
    messages: [
      {
        role: 'user',
        content: \`你是一位说书人。\\n\\n玩家请求：\${prompt}\`,
      },
    ],
  })) {
    // 把每个 delta 转发给浏览器
    yield { delta: chunk.delta };
  }
}
`})}),`
`,(0,n.jsx)(r.p,{children:`浏览器侧：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`for await (const c of dzmm.fn.invokeStream('storyteller', { prompt: '讲个故事' })) {
  document.getElementById('out').textContent += c.delta;
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`每次 `,(0,n.jsx)(r.code,{children:`yield`}),` 立刻发到浏览器，玩家逐字看到生成。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 单文件限制`}),`
`,(0,n.jsx)(r.p,{children:`每个函数文件必须自包含：`}),`
`,(0,n.jsx)(r.p,{children:`❌ 不能用：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`import { something } from './helper';   // 不支持
import axios from 'axios';                // 不支持
const x = require('lodash');              // 不支持
`})}),`
`,(0,n.jsxs)(r.p,{children:[`任何 `,(0,n.jsx)(r.code,{children:`import`}),` / `,(0,n.jsx)(r.code,{children:`require`}),` 语句都会让 fn 被加载阶段拒绝，浏览器拿到 `,(0,n.jsx)(r.code,{children:`unsupported_import`}),` 错误。`]}),`
`,(0,n.jsx)(r.p,{children:`✅ 能用：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`ES 标准内置（`,(0,n.jsx)(r.code,{children:`JSON`}),`、`,(0,n.jsx)(r.code,{children:`Math`}),`、`,(0,n.jsx)(r.code,{children:`Date`}),`、`,(0,n.jsx)(r.code,{children:`Promise`}),`、`,(0,n.jsx)(r.code,{children:`Map`}),`、`,(0,n.jsx)(r.code,{children:`Set`}),`、`,(0,n.jsx)(r.code,{children:`Array`}),`、`,(0,n.jsx)(r.code,{children:`String`}),` 等）`]}),`
`,(0,n.jsxs)(r.li,{children:[`workerd 内置的 `,(0,n.jsx)(r.code,{children:`fetch`}),` / `,(0,n.jsx)(r.code,{children:`URL`}),`（虽然能写但沙箱会拦截到外网的请求，详见限制章节）`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.*`}),` 上挂着的所有 API`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 怎么"组织代码"？`}),`
`,(0,n.jsxs)(r.p,{children:[`既然不能 `,(0,n.jsx)(r.code,{children:`import`}),`，复用就只能靠：`]}),`
`,(0,n.jsx)(r.h3,{children:`3.1 复制粘贴`}),`
`,(0,n.jsx)(r.p,{children:`简单情况下完全够用。3 个函数里都需要"算 SHA-256"？直接复制 SHA-256 实现到每个文件里。`}),`
`,(0,n.jsx)(r.h3,{children:`3.2 一个函数包多个功能（method dispatch）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/player.ts
export default async function (req: any, ctx: any) {
  const { method, args } = req.body;
  switch (method) {
    case 'getStats':
      return await getStats(ctx, args);
    case 'submitScore':
      return await submitScore(ctx, args);
    case 'leaderboard':
      return await leaderboard(ctx);
    default:
      throw new Error(\`unknown method: \${method}\`);
  }
}

async function getStats(ctx: any, args: any) { /* ... */ }
async function submitScore(ctx: any, args: any) { /* ... */ }
async function leaderboard(ctx: any) { /* ... */ }
`})}),`
`,(0,n.jsx)(r.p,{children:`浏览器侧：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const stats = await dzmm.fn.invoke('player', { method: 'getStats', args: {} });
const board = await dzmm.fn.invoke('player', { method: 'leaderboard' });
`})}),`
`,(0,n.jsx)(r.p,{children:`这是绕过"不能 import"最实用的模式。一个文件 200-300 行没问题。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 抛错的正确方式`}),`
`,(0,n.jsxs)(r.p,{children:[`函数里抛任何 `,(0,n.jsx)(r.code,{children:`Error`}),`，浏览器侧都会收到 `,(0,n.jsx)(r.code,{children:`RPCError`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`export default async function (req: any, ctx: any) {
  if (typeof req.body?.score !== 'number') {
    throw new Error('score is required and must be a number');
  }
  if (req.body.score < 0 || req.body.score > 1000000) {
    throw new Error('score out of range');
  }
  // ...
}
`})}),`
`,(0,n.jsx)(r.p,{children:`浏览器拿到：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  await dzmm.fn.invoke('submitScore', { score: -1 });
} catch (e) {
  console.log(e.code);    // 'function_error' （所有自定义抛错都归这个 code）
  console.log(e.source);  // 'user'  （区别于 'runtime' 错误）
  console.log(e.message); // 'score out of range'  （你抛的 message）
  console.log(e.userStack); // 你函数内的 stack；生产调用也可能收到
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`userStack`}),` 当前会随用户代码错误在 dev 和 prod 链路中转发给调用方。玩家可以查看生产游戏里的错误对象，因此不要把令牌、个人数据、私有 prompt 或其他敏感值拼进异常 message，也不要让这些值出现在自定义错误堆栈信息中。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`想抛"平台标准"错误码？ 极少数情况下你想抛 `,(0,n.jsx)(r.code,{children:`quota_exceeded`}),` 这种平台级 code。99% 不需要，扔自定义 message 就够。具体规则见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/limits`,children:`限制与错误码`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 完整模板：服务端编排的占卜师`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.completions()`}),` 和 `,(0,n.jsx)(r.code,{children:`.stream()`}),` 的 `,(0,n.jsx)(r.code,{children:`messages`}),` 都只支持 `,(0,n.jsx)(r.code,{children:`user`}),` / `,(0,n.jsx)(r.code,{children:`assistant`}),`。下面把服务端指令和玩家输入合并到同一条 `,(0,n.jsx)(r.code,{children:`user`}),` 消息中。函数源码不会直接下发到浏览器，但 prompt injection 仍可能让模型在输出中复述这些指令，所以不要把它当秘密存储，也不要放凭证或安全关键规则。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`// functions/tarot.ts

const SERVER_INSTRUCTIONS = \`
你是一位有 30 年经验的塔罗占卜师。
当玩家询问问题时，从示例牌库随机抽 3 张（依次代表过去、现在、未来），
然后用诗意但温和的语气，200 字内给出占卜词。
最后必须以"请把这份答案当作启发，而非命运"结尾。
\`.trim();

// 为了让文档示例简短，这里只是节选牌库；正式塔罗游戏请补全你需要的牌。
const CARDS = [
  '愚者', '魔法师', '女祭司', '皇后', '皇帝',
];

function drawThreeCards(): [string, string, string] {
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1], shuffled[2]];
}

export default async function (req: any, ctx: any) {
  const question = String(req.body?.question ?? '').slice(0, 200);
  if (!question) {
    throw new Error('请输入你想问的事');
  }

  const [past, present, future] = drawThreeCards();

  const reading = await ctx.completions({
    model: 'default',
    messages: [
      {
        role: 'user',
        content: \`\${SERVER_INSTRUCTIONS}\\n\\n玩家问题：\${question}\\n抽到的牌：\${past} / \${present} / \${future}\`,
      },
    ],
    maxTokens: 500,
  });

  return {
    cards: { past, present, future },
    reading: reading.text,
  };
}
`})}),`
`,(0,n.jsx)(r.p,{children:`浏览器侧：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const r = await dzmm.fn.invoke('tarot', { question: '我会找到对的人吗？' });
// {
//   cards: { past: '...', present: '...', future: '...' },
//   reading: '...'
// }
// 指令源码不直接下发，但模型输出仍可能复述指令
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 文件命名规则`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`functions/{name}.ts`}),` 里 `,(0,n.jsx)(r.code,{children:`name`}),`：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`只能用 ASCII 字母 / 数字 / 下划线 / 连字符`}),`
`,(0,n.jsxs)(r.li,{children:[`不支持点号、中文、Emoji、空格或带音符字母；`,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke(name, ...)`}),` 与服务端路由会按同一规则校验`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器调用时用同一个 `,(0,n.jsx)(r.code,{children:`name`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// functions/submit-score.ts
await dzmm.fn.invoke('submit-score', { ... });
`})}),`
`,(0,n.jsxs)(r.p,{children:[`支持子目录吗？不支持。所有函数必须直接放在 `,(0,n.jsx)(r.code,{children:`functions/`}),` 下：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`functions/
├── tarot.ts        ✅
├── submit-score.ts ✅
└── npc/            ❌ 不会被扫描
    └── shopkeeper.ts
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. dev 模式：改完立刻生效`}),`
`,(0,n.jsx)(r.p,{children:`Workbench 预览（挂在隐藏的开发会话上）走 dev 模式，每次调用都从容器实时拉取最新源文件：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`你改完 `,(0,n.jsx)(r.code,{children:`functions/tarot.ts`}),` → 切到 Preview → 调用 → 马上跑到新版本`]}),`
`,(0,n.jsx)(r.li,{children:`不用重启、不用刷新、不用发布`}),`
`,(0,n.jsxs)(r.li,{children:[`前提是开发容器在运行：容器未运行时调用会明确报错 `,(0,n.jsx)(r.code,{children:`dev_container_inactive`}),`（HTTP 409），先启动容器再调，不会静默降级到已发布快照`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`玩家会话永远走 prod，读“已发布快照”，跟你的容器开不开无关 —— 所以改完必须先发布，玩家才能用到新版本。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 下一步`}),`
`,(0,n.jsxs)(r.p,{children:[`学完函数签名，去看 `,(0,n.jsxs)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:[(0,n.jsx)(r.code,{children:`ctx`}),` API 详解`]}),`，里面是所有"在函数里能调到平台能力"的列表（KV / AI / chat / draw / models）。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};