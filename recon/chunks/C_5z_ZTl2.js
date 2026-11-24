(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f31b95b1-5731-4847-a1f9-3e4de8fe467d`,e._sentryDebugIdIdentifier=`sentry-dbid-f31b95b1-5731-4847-a1f9-3e4de8fe467d`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`服务端函数：是什么 & 何时用`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：服务端函数让你的游戏跑一段“源码不直接下发到玩家浏览器”的代码。它跑在云端的轻量沙箱里，由游戏 JS 通过 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 调用。适合服务端编排、校验和跨玩家共享数据；但函数返回值、错误信息和 AI 输出仍会到达浏览器。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 跟浏览器 SDK 是什么关系？`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`玩家浏览器（沙箱 iframe）           云端 fn-runner（workerd 沙箱）
┌──────────────────────────┐        ┌──────────────────────────┐
│  你的 publish/game.js    │        │  你的 functions/score.ts │
│                          │        │                          │
│  dzmm.fn.invoke('score', │ ─────► │  export default function │
│    { runs: 1, kills: 5 } │        │  (req, ctx) {            │
│  )                       │        │    // 服务端校验 + 算分  │
│                          │        │    // 玩家看不到这段     │
│  // 只拿到结果           │ ◄───── │    return { ok: true };  │
│                          │        │  }                       │
└──────────────────────────┘        └──────────────────────────┘
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`publish/`}),` 里的 JS / HTML 是公开的，玩家按 F12 能看到所有代码、所有 prompt。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`functions/`}),` 里的 TypeScript 是私有的，只跑在云端，玩家看不到源码。`]}),`
`,(0,n.jsxs)(r.li,{children:[`两侧通过 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke(name, body)`}),` 通信。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 三个典型场景`}),`
`,(0,n.jsx)(r.h3,{children:`场景 A：避免 AI 提示词直接随前端代码下发`}),`
`,(0,n.jsx)(r.p,{children:`游戏里有个"塔罗占卜师"NPC，你给 AI 的设定是这样的：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`你是一个有 30 年经验的塔罗占卜师。当玩家询问感情、事业、健康时，从以下 78 张牌中随机抽 3 张，然后基于这些牌给出 200 字以内的占卜词…
`})}),`
`,(0,n.jsxs)(r.p,{children:[`如果直接写在 `,(0,n.jsx)(r.code,{children:`publish/game.js`}),` 的 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 里 —— 玩家按 F12 就能看到全部设定，复制走自己用 ChatGPT 跑。`]}),`
`,(0,n.jsxs)(r.p,{children:[`放到 `,(0,n.jsx)(r.code,{children:`functions/tarot.ts`}),` 里以后，玩家不能再从前端源码或普通请求载荷中直接读取这段设定。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.completions()`}),` 也只支持 `,(0,n.jsx)(r.code,{children:`user`}),` / `,(0,n.jsx)(r.code,{children:`assistant`}),`，不能传 `,(0,n.jsx)(r.code,{children:`system`}),`。可以把服务端指令和玩家输入组装进同一条 `,(0,n.jsx)(r.code,{children:`user`}),` 消息，但这`,(0,n.jsx)(r.strong,{children:`不保证指令保密`}),`：玩家输入可能通过 prompt injection 诱导模型复述指令，模型输出又会原样返回浏览器。不要在 prompt 中放 API key、密码、令牌、个人数据或安全关键规则；权限、奖励和防作弊判断必须由确定性的服务端代码执行。`]}),`
`,(0,n.jsx)(r.h3,{children:`场景 B：服务端验证分数（防作弊）`}),`
`,(0,n.jsxs)(r.p,{children:[`玩家打通一关，前端发"我赢了，分数 10000"。但是 —— 玩家可以改 JS 直接传 99999。
真正的防作弊不能只把 `,(0,n.jsx)(r.code,{children:`score`}),`、`,(0,n.jsx)(r.code,{children:`runs`}),`、`,(0,n.jsx)(r.code,{children:`kills`}),` 或 `,(0,n.jsx)(r.code,{children:`time`}),` 换个接口接收；函数必须根据
服务端保存的关卡状态、一次性挑战 token、可验证回放或其他可信证据重新计算结果。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-text`,children:`架构伪代码（不是可复制的 ctx API）：

run = 从你设计的可信服务端状态中校验 challengeToken，并读取击杀数与耗时
if run 不存在、已使用、归属错误，或 elapsedMs <= 0：拒绝
score = floor(kills * 100000 / elapsedMs)
把 run 标记为已结算，再返回 score
`})}),`
`,(0,n.jsxs)(r.p,{children:[`这里的“可信服务端状态”和结算流程需要按游戏状态模型自行设计，不是平台提供的 `,(0,n.jsx)(r.code,{children:`verifyRunFromServerState`}),` helper。不要直接信任浏览器提供的运行统计。另请注意，`,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 没有 CAS/事务，严格排行榜或发奖不能靠一次 `,(0,n.jsx)(r.code,{children:`get`}),` → 修改 → `,(0,n.jsx)(r.code,{children:`put`}),` 保证并发正确性；详细限制见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`ctx API 详解`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`场景 C：跨玩家共享数据`}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.kv.*`}),` 是 (chat, 玩家) scope —— 玩家 A 看不到玩家 B 的数据。`]}),`
`,(0,n.jsx)(r.p,{children:`如果你想做：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`全游戏排行榜（所有玩家都能看）`}),`
`,(0,n.jsx)(r.li,{children:`全游戏公告 / 限时活动`}),`
`,(0,n.jsx)(r.li,{children:`玩家之间通信（留言板）`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`只能用服务端函数的 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),`。服务端 KV 属于 game scope，并分成两种明确的访问入口：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.kv.*`}),`：`,(0,n.jsx)(r.code,{children:`(gameId, userId)`}),`，当前玩家私有、跨 chat 持久（跟浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 的"chat 隔离"不同）`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.kv.global.*`}),`：`,(0,n.jsx)(r.code,{children:`(gameId, NULL)`}),`，全游戏共享，所有玩家都能读写`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`ctx API 详解`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 何时不要用服务端函数`}),`
`,(0,n.jsx)(r.p,{children:`服务端函数有额外限制（CPU 5 秒、5 分钟超时、配额、不能 import 别的库等），简单场景直接用浏览器 SDK 更舒服。`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`场景`}),(0,n.jsx)(r.th,{children:`推荐`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家点按钮直接调 AI 聊天`}),(0,n.jsxs)(r.td,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.completions`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家自己存档（关卡进度、背包）`}),(0,n.jsxs)(r.td,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.kv`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家自己看的剧情分支`}),(0,n.jsxs)(r.td,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.chat`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`AI 画图给玩家自己看`}),(0,n.jsxs)(r.td,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.draw.generate`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`AI 指令不想直接随前端源码下发`}),(0,n.jsxs)(r.td,{children:[`服务端 `,(0,n.jsx)(r.code,{children:`functions/`}),`（prompt 仍可能被模型泄露）`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`服务端校验玩家分数 / 战利品`}),(0,n.jsxs)(r.td,{children:[`服务端 `,(0,n.jsx)(r.code,{children:`functions/`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`全游戏排行榜 / 公共数据`}),(0,n.jsxs)(r.td,{children:[`服务端 `,(0,n.jsx)(r.code,{children:`functions/`}),` + `,(0,n.jsx)(r.code,{children:`ctx.kv.global`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`多步 AI 链（多次调用 AI 合成结果）`}),(0,n.jsxs)(r.td,{children:[`服务端 `,(0,n.jsx)(r.code,{children:`functions/`})]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. dev 模式 vs prod 模式`}),`
`,(0,n.jsx)(r.p,{children:`模式是显式的，由调用来自哪种会话决定，不再跟"容器是否存活"隐式挂钩：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`模式`}),(0,n.jsx)(r.th,{children:`触发条件`}),(0,n.jsx)(r.th,{children:`函数代码来源`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`dev`}),(0,n.jsx)(r.td,{children:`Workbench 预览（挂在隐藏的开发会话上）`}),(0,n.jsxs)(r.td,{children:[`实时从作者容器读取 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`prod`}),(0,n.jsx)(r.td,{children:`玩家会话（永远 prod）`}),(0,n.jsx)(r.td,{children:`已发布版本（「发布」时上传的快照）`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`dev 模式的好处：改 `,(0,n.jsx)(r.code,{children:`.ts`}),` / `,(0,n.jsx)(r.code,{children:`.js`}),` 文件立刻生效，无需重启 / 无需发布。dev 模式要求开发容器在运行：容器未运行时调用会明确报错 `,(0,n.jsx)(r.code,{children:`dev_container_inactive`}),`（HTTP 409，提示先启动容器），不会静默降级到已发布快照。`]}),`
`,(0,n.jsxs)(r.p,{children:[`prod 模式的代价：必须先「发布」，把 `,(0,n.jsx)(r.code,{children:`functions/`}),` 上传一份快照。未发布的函数玩家调会得到 `,(0,n.jsx)(r.code,{children:`function_not_published`}),` 错误。`]}),`
`,(0,n.jsx)(r.p,{children:`玩家会话永远走 prod 已发布快照，所以你开着工作台改代码不会影响线上玩家。反过来说，玩家看到的永远是你上次成功发布的函数版本，改完要让玩家用上就必须重新发布，并确认没有函数警告。Workbench 用 gameId 直接调用的入口始终只允许作者。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 一个完整的 hello world`}),`
`,(0,n.jsxs)(r.p,{children:[`步骤 1：在容器里新建 `,(0,n.jsx)(r.code,{children:`functions/hello.ts`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`export default async function (req: any, ctx: any) {
  return {
    message: \`Hello, \${ctx.user.name || '玩家'}！\`,
    youSent: req.body,
    at: new Date().toISOString(),
  };
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`步骤 2：在 `,(0,n.jsx)(r.code,{children:`publish/index.html`}),` 加个按钮：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-html`,children:`<button onclick="callHello()">打招呼</button>
<pre id="out"></pre>

<script>
  async function callHello() {
    try {
      const r = await dzmm.fn.invoke('hello', { greeting: 'hi' });
      document.getElementById('out').textContent = JSON.stringify(r, null, 2);
    } catch (e) {
      document.getElementById('out').textContent = \`\${e.code}: \${e.message}\`;
    }
  }
<\/script>
`})}),`
`,(0,n.jsx)(r.p,{children:`步骤 3：保存代码 → 切到 Preview → 刷新 → 点按钮 → 看到 JSON 输出。`}),`
`,(0,n.jsx)(r.p,{children:`步骤 4：想让真玩家也能用？点右上角「发布」。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 接下来读什么`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`章节`}),(0,n.jsx)(r.th,{children:`内容`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/writing`,children:`编写函数`})}),(0,n.jsx)(r.td,{children:`函数签名、单文件限制、流式返回、错误抛出`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`ctx API 详解`})}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`ctx.kv`}),` / `,(0,n.jsx)(r.code,{children:`ctx.completions`}),` / `,(0,n.jsx)(r.code,{children:`ctx.chat`}),` / `,(0,n.jsx)(r.code,{children:`ctx.draw`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/calling`,children:`浏览器调用`})}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`dzmm.fn.invoke`}),` / `,(0,n.jsx)(r.code,{children:`invokeStream`}),` + RPCError 处理`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/limits`,children:`限制与错误码`})}),(0,n.jsx)(r.td,{children:`CPU、时长、配额、所有错误码`})]})]})]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};