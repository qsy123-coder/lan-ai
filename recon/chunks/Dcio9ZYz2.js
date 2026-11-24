(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2eac0279-9847-4856-9f3e-74bbf78ce49c`,e._sentryDebugIdIdentifier=`sentry-dbid-2eac0279-9847-4856-9f3e-74bbf78ce49c`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`服务器逻辑 — `,(0,n.jsx)(r.code,{children:`rt/server.js`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：多人游戏的规则写在 `,(0,n.jsx)(r.code,{children:`rt/server.js`}),` 里，由平台的房间服务器运行。玩家只能发「我想做什么」（`,(0,n.jsx)(r.code,{children:`act`}),` 动作、`,(0,n.jsx)(r.code,{children:`input`}),` 操作），结果由服务器算，每个玩家只收到你允许他看的画面（`,(0,n.jsx)(r.code,{children:`view`}),`）。不用自己写同步、重连和防作弊。游戏端的 API 见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/realtime`,children:`联机房间`}),`，所有数字上限见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/limits`,children:`平台限制总表 §15`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 文件放在哪里`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`my-game/
├── dzmm.json
├── rt/
│   ├── server.js     # 服务器逻辑，不会发给玩家
│   └── shared.js     # 可选：服务器和游戏共用的纯函数（如移动公式），会发给玩家
├── publish/          # 游戏页面（玩家能下载这里的所有文件）
└── functions/
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`rt/`}),` 放在`,(0,n.jsx)(r.strong,{children:`项目根目录`}),`，不能放进 `,(0,n.jsx)(r.code,{children:`publish/`}),`：`,(0,n.jsx)(r.code,{children:`publish/`}),` 里的文件玩家都能读到，`,(0,n.jsx)(r.code,{children:`gamefy deploy`}),` 发现 `,(0,n.jsx)(r.code,{children:`publish/rt/server.js`}),` 会拒绝发布。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`rt/server.js`}),` 只能 `,(0,n.jsx)(r.code,{children:`import`}),` `,(0,n.jsx)(r.code,{children:`./shared.js`}),`，不能用其他模块或 npm 包。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`rt/shared.js`}),` 会和游戏一起发布，`,(0,n.jsxs)(r.strong,{children:[`不要在 `,(0,n.jsx)(r.code,{children:`shared.js`}),` 里放秘密`]}),`（题库、牌序、答案放 `,(0,n.jsx)(r.code,{children:`server.js`}),` 或服务器状态）。平台把根目录的 `,(0,n.jsx)(r.code,{children:`rt/shared.js`}),` 放在游戏根目录（`,(0,n.jsx)(r.code,{children:`publish/`}),` 的内容所在处）下的 `,(0,n.jsx)(r.code,{children:`rt/shared.js`}),`，`,(0,n.jsx)(r.code,{children:`gamefy dev`}),`、Workbench 预览和发布后都是这个路径：`,(0,n.jsx)(r.code,{children:`publish/index.html`}),` 用 `,(0,n.jsx)(r.code,{children:`<script type="module">`}),` 写 `,(0,n.jsx)(r.code,{children:`import { move } from './rt/shared.js'`}),`，`,(0,n.jsx)(r.code,{children:`publish/`}),` 子目录里的页面按层级写（如 `,(0,n.jsx)(r.code,{children:`../rt/shared.js`}),`）。不要在 `,(0,n.jsx)(r.code,{children:`publish/rt/`}),` 里再放一份，根目录那份优先。`]}),`
`,(0,n.jsxs)(r.li,{children:[`两个文件合计大小有上限；项目有 `,(0,n.jsx)(r.code,{children:`rt/server.js`}),` 时，玩家进的就是权威房间。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 模块结构`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// rt/server.js
export default {
  tickRate: 0,              // 0（默认，事件驱动）或 10 / 15 / 20 / 30
  maxPlayers: 8,            // 2–32，省略为 16；实际房间还受部署人数上限限制
  joinAfterStart: false,    // true 时开局后仍可加入，平台调用 onJoin
  hidden: { role: 'owner' },// 秘密字段，见 §6

  setup(players, ctx) { return { /* 初始状态 */ }; },   // 必填：房主 start() 时调用
  actions: {                                            // 玩家 rt.act(name, payload)
    vote(state, payload, ctx) { /* 直接修改 state */ },
  },
  update(state, inputs, dt, ctx) {},                    // tickRate > 0 时必填，每 tick 调用
  timers: { tally(state, payload, ctx) {} },            // ctx.timer(name, ms) 到期时调用
  view(state, playerId) { return { /* 该玩家能看到的 */ }; }, // 必填
  onJoin(state, playerId, ctx) {},                      // 开局后有人加入（joinAfterStart）
  onLeave(state, playerId, ctx) {},                     // 有人真正离开（暂时掉线不调用）
  bot(view, ctx) { return { input: { dx: 1, dy: 0 }, act: ['vote', { target: 'x' }] }; }, // 可选：给自检用；没事做时返回 null
};
`})}),`
`,(0,n.jsx)(r.p,{children:`规则（平台会检查）：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`所有函数必须是同步的`}),`：不能 `,(0,n.jsx)(r.code,{children:`async`}),`、不能返回 Promise，也没有 `,(0,n.jsx)(r.code,{children:`fetch`}),`、`,(0,n.jsx)(r.code,{children:`setTimeout`}),`。需要延时用 `,(0,n.jsx)(r.code,{children:`ctx.timer`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`结果只取决于输入`}),`：随机数只用 `,(0,n.jsx)(r.code,{children:`ctx.random()`}),` / `,(0,n.jsx)(r.code,{children:`ctx.shuffle()`}),`，时间只用 `,(0,n.jsx)(r.code,{children:`ctx.now`}),`。`,(0,n.jsx)(r.code,{children:`Math.random()`}),` 和 `,(0,n.jsx)(r.code,{children:`Date.now()`}),` 在服务器里也会被换成同一种子序列和 `,(0,n.jsx)(r.code,{children:`ctx.now`}),`，但请直接写 `,(0,n.jsx)(r.code,{children:`ctx.*`}),`，自检会对前者给出提示。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsxs)(r.strong,{children:[`直接修改 `,(0,n.jsx)(r.code,{children:`state`})]}),`：`,(0,n.jsx)(r.code,{children:`actions`}),`、`,(0,n.jsx)(r.code,{children:`update`}),`、`,(0,n.jsx)(r.code,{children:`timers`}),` 收到的是状态本身，改它就行，不用返回。`,(0,n.jsx)(r.code,{children:`setup`}),` 返回初始状态。`]}),`
`,(0,n.jsxs)(r.li,{children:[`状态必须能被 JSON 序列化（不要放函数、`,(0,n.jsx)(r.code,{children:`Map`}),`、`,(0,n.jsx)(r.code,{children:`Date`}),`、循环引用）。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`maxPlayers`}),` 声明模块能处理的人数，省略为 16，可写 2–32。实际房间还受部署上限限制（默认 16）；声明 32 不会自行开通 32 人房，建房请求超出任一上限都会被拒绝。当前额度见 `,(0,n.jsx)(r.code,{children:`dzmm.rt.state()`}),` 的 `,(0,n.jsx)(r.code,{children:`maxPlayers`}),` 与 `,(0,n.jsx)(r.code,{children:`trafficLimits.maxPlayers`}),`，含义见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/realtime#room-traffic-budget`,children:`房间实际预算`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`发布检查抽样验证：加载、信息隔离和确定性最多用 4 人，CPU 测量最多用 8 人。检查通过不代表声明的人数已通过容量验收；提高人数前还要测满房同步、上下行、CPU、断线与刷新重进。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 一局的流程`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`等待阶段`}),`（`,(0,n.jsx)(r.code,{children:`lobby`}),`）：玩家进房，用 `,(0,n.jsx)(r.code,{children:`dzmm.rt.me.set({ ready: true, color: 'red' })`}),` 设置自己的选择，所有人在 `,(0,n.jsx)(r.code,{children:`member`}),` 事件的 `,(0,n.jsx)(r.code,{children:`players[].state`}),` 里看到。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`开局`}),`：房主调用 `,(0,n.jsx)(r.code,{children:`dzmm.rt.start()`}),`，平台以当前座位调用 `,(0,n.jsx)(r.code,{children:`setup(players, ctx)`}),`。`,(0,n.jsx)(r.code,{children:`players[i]`}),` 含 `,(0,n.jsx)(r.code,{children:`userId`}),`、`,(0,n.jsx)(r.code,{children:`fullName`}),`、`,(0,n.jsx)(r.code,{children:`avatarUrl`}),`、`,(0,n.jsx)(r.code,{children:`state`}),`（就是 `,(0,n.jsx)(r.code,{children:`me.set`}),` 的内容，`,(0,n.jsx)(r.strong,{children:`来自客户端，要验证`}),`）。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`游戏中`}),`（`,(0,n.jsx)(r.code,{children:`playing`}),`）：处理 `,(0,n.jsx)(r.code,{children:`act`}),`、`,(0,n.jsx)(r.code,{children:`input`}),`、计时器；每次状态变化后，平台对每个玩家调用 `,(0,n.jsx)(r.code,{children:`view(state, playerId)`}),` 并发出画面。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`结束`}),`：调用 `,(0,n.jsx)(r.code,{children:`ctx.end(result)`}),`，平台发出最后一次画面和 `,(0,n.jsx)(r.code,{children:`result`}),` 事件，房间回到等待阶段，可以再开一局。`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:`开局失败`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`setup`}),` 抛错时状态回滚、房间留在等待阶段：只有房主的 `,(0,n.jsx)(r.code,{children:`rt.start()`}),` reject `,(0,n.jsx)(r.code,{children:`RT_LOGIC_ERROR`}),`，`,(0,n.jsx)(r.code,{children:`error.reason`}),` 形如 `,(0,n.jsx)(r.code,{children:`Error: 你写的消息`}),`；其他人什么也收不到。`,(0,n.jsx)(r.code,{children:`setup`}),` 里不能用 `,(0,n.jsx)(r.code,{children:`ctx.invalid`}),`（会变成 `,(0,n.jsx)(r.code,{children:`RT_LOGIC_ERROR`}),`），要拒绝就 `,(0,n.jsx)(r.code,{children:`throw new Error(...)`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`setup`}),` 出错和 `,(0,n.jsx)(r.code,{children:`update`}),`、计时器出错一样计入「10 秒内 5 次 → 房间结束」。人数不够这类条件先在游戏端挡住（人数不够时开局按钮置灰），`,(0,n.jsx)(r.code,{children:`setup`}),` 里的检查只做最后一道保护。`]}),`
`,(0,n.jsxs)(r.li,{children:[`发布检查用 4 名测试玩家（`,(0,n.jsx)(r.code,{children:`maxPlayers`}),` 小于 4 时用 `,(0,n.jsx)(r.code,{children:`maxPlayers`}),` 人）调用 `,(0,n.jsx)(r.code,{children:`setup`}),`，测试玩家没有 `,(0,n.jsx)(r.code,{children:`state`}),`，也可能没有 `,(0,n.jsx)(r.code,{children:`fullName`}),`。这时开不了局会挡住发布，所以最少人数不能高于 4，`,(0,n.jsx)(r.code,{children:`state`}),` 缺失时用默认值。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`setup`}),` 里可以用 `,(0,n.jsx)(r.code,{children:`ctx.timer`}),`（如第一回合的倒计时）、`,(0,n.jsx)(r.code,{children:`ctx.random`}),`、`,(0,n.jsx)(r.code,{children:`ctx.shuffle`}),`、`,(0,n.jsx)(r.code,{children:`ctx.now`}),`、`,(0,n.jsx)(r.code,{children:`ctx.players`}),`；`,(0,n.jsx)(r.code,{children:`ctx.playerId`}),` 为 `,(0,n.jsx)(r.code,{children:`undefined`}),`。不能调用 `,(0,n.jsx)(r.code,{children:`ctx.end`}),`：`,(0,n.jsx)(r.code,{children:`rt.start()`}),` 会 reject `,(0,n.jsx)(r.code,{children:`RT_LOGIC_ERROR`}),`（`,(0,n.jsx)(r.code,{children:`ctx.end() cannot run in setup`}),`）。`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:`开局与结束时游戏端收到什么`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`开局：所有人（含房主）随后收到第一份画面（`,(0,n.jsx)(r.code,{children:`onView`}),`）；房主以外的人还会先收到 `,(0,n.jsx)(r.code,{children:`member`}),` 事件，其中 `,(0,n.jsx)(r.code,{children:`state.lifecycle === 'playing'`}),`。房主不要依赖这次 `,(0,n.jsx)(r.code,{children:`member`}),`，以 `,(0,n.jsx)(r.code,{children:`rt.start()`}),` resolve 或第一份画面为准。最简单的写法：收到画面就切到游戏界面。`]}),`
`,(0,n.jsxs)(r.li,{children:[`结束：最后一次画面和 `,(0,n.jsx)(r.code,{children:`result`}),` 只发给`,(0,n.jsx)(r.strong,{children:`当时在线`}),`的玩家，各一次；随后所有人收到 `,(0,n.jsx)(r.code,{children:`member`}),`（`,(0,n.jsx)(r.code,{children:`lifecycle: 'lobby'`}),`），`,(0,n.jsx)(r.code,{children:`rt.view()`}),` 变为 `,(0,n.jsx)(r.code,{children:`null`}),`。结束后才刷新或重连的玩家只回到等待阶段，收不到 `,(0,n.jsx)(r.code,{children:`result`}),` 和最后画面。`]}),`
`,(0,n.jsxs)(r.li,{children:[`要让刷新的人也看到结算：收到 `,(0,n.jsx)(r.code,{children:`result`}),` 时自己存下来（如 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),`）；或者先进入结算阶段（`,(0,n.jsx)(r.code,{children:`state.phase = 'over'`}),`，结果写进 state 由 `,(0,n.jsx)(r.code,{children:`view`}),` 发出），用 `,(0,n.jsx)(r.code,{children:`ctx.timer`}),` 过几秒再 `,(0,n.jsx)(r.code,{children:`ctx.end`}),`。结算阶段还在对局中，要公布的秘密先复制到没有登记在 `,(0,n.jsx)(r.code,{children:`hidden`}),` 的字段（如 `,(0,n.jsx)(r.code,{children:`state.reveal = { ...state.role }`}),`），否则泄漏检查会报。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`开局后默认不接受新玩家（加入会得到 `,(0,n.jsx)(r.code,{children:`RT_ROOM_CLOSED`}),`），除非 `,(0,n.jsx)(r.code,{children:`joinAfterStart: true`}),`。玩家掉线期间座位保留，用 `,(0,n.jsx)(r.code,{children:`ctx.connected(id)`}),` 判断是否在线；保留时间到期或主动离开才调用 `,(0,n.jsx)(r.code,{children:`onLeave`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`4. 动作：`,(0,n.jsx)(r.code,{children:`actions`}),` 与 `,(0,n.jsx)(r.code,{children:`ctx.invalid`})]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`actions: {
  play(state, { card }, ctx) {
    const me = ctx.playerId;                       // 调用者，由服务器按连接身份填写
    if (state.turn !== me) ctx.invalid('not-your-turn');
    if (!state.hands[me].includes(card)) ctx.invalid('no-such-card');
    state.hands[me] = state.hands[me].filter(c => c !== card);
    state.pile.push(card);
    state.turn = next(state, me);
  },
},
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`动作是`,(0,n.jsx)(r.strong,{children:`事务`}),`：`,(0,n.jsx)(r.code,{children:`ctx.invalid(reason)`}),` 或任何异常都会让状态回到动作之前，不会留下改了一半的状态。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.invalid(reason)`}),` 让游戏端的 `,(0,n.jsx)(r.code,{children:`rt.act()`}),` reject `,(0,n.jsx)(r.code,{children:`RT_INVALID_ACTION`}),`，`,(0,n.jsx)(r.code,{children:`error.reason === reason`}),`。其他异常返回 `,(0,n.jsx)(r.code,{children:`RT_LOGIC_ERROR`}),`，房间继续。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`payload`}),` 来自玩家，`,(0,n.jsx)(r.strong,{children:`每个字段都要验证`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[`游戏端按下按钮时先播放本地表现，`,(0,n.jsx)(r.code,{children:`act()`}),` 成功再确认、失败就撤销（一次往返在部分玩家那里要 300–500 ms）。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`5. tick 模式：`,(0,n.jsx)(r.code,{children:`update`}),`、`,(0,n.jsx)(r.code,{children:`input`}),` 与插值预测`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`tickRate > 0`}),` 时服务器每秒运行 `,(0,n.jsx)(r.code,{children:`update(state, inputs, dt, ctx)`}),` `,(0,n.jsx)(r.code,{children:`tickRate`}),` 次：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`inputs[playerId]`}),` 是该玩家最新的 `,(0,n.jsx)(r.code,{children:`rt.input(control)`}),`；玩家掉线或没有操作时为 `,(0,n.jsx)(r.code,{children:`undefined`}),`。`,(0,n.jsx)(r.code,{children:`dt`}),` 固定为 `,(0,n.jsx)(r.code,{children:`1 / tickRate`}),` 秒。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`input`}),` 是「操作状态」不是事件：摇杆方向、是否按住跳跃。调用一次就一直生效到下一次调用，松手时记得发 `,(0,n.jsx)(r.code,{children:`{ dx: 0, dy: 0 }`}),`。每条最多 8 个数字或布尔字段。`]}),`
`,(0,n.jsxs)(r.li,{children:[`一次性的事情（开火、拾取、投票）用 `,(0,n.jsx)(r.code,{children:`act`}),`，不要塞进 `,(0,n.jsx)(r.code,{children:`input`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`update`}),` 不能拒绝操作，自己做范围限制（夹到地图边界等）。抛出异常时这个 tick 剩下的部分跳过，已做的修改保留。`]}),`
`,(0,n.jsxs)(r.li,{children:[`画面最多每秒 20 次：`,(0,n.jsx)(r.code,{children:`tickRate: 30`}),` 时每 2 个 tick 发一次。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`插值与预测`}),`（游戏端，可选）：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`import { move } from './rt/shared.js';
const myId = (await dzmm.user.info()).id;

dzmm.rt.netcode({
  interpolate: ['players.*.x', 'players.*.y'],   // 其他人：在两次画面之间平滑移动
  predict(view, input, dt) {                     // 自己：按键立即反应
    const p = view.players[myId];
    if (p?.alive) move(p, input, dt);
  },
  smoothMs: 100,                                 // 预测被服务器纠正时，在这段时间内平滑过去
});
(function frame() { draw(dzmm.rt.view()); requestAnimationFrame(frame); })();
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`移动公式`,(0,n.jsx)(r.strong,{children:`只写一次`}),`放在 `,(0,n.jsx)(r.code,{children:`rt/shared.js`}),`，`,(0,n.jsx)(r.code,{children:`update`}),` 和 `,(0,n.jsx)(r.code,{children:`predict`}),` 共用，预测才准。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`predict`}),` `,(0,n.jsx)(r.strong,{children:`只改自己的那部分`}),`：SDK 记录 `,(0,n.jsx)(r.code,{children:`predict`}),` 写过的路径，只把这些路径叠加到画面上。像上面那样直接改 `,(0,n.jsx)(r.code,{children:`view.players[myId]`}),` 的字段可以；把对象复制出来改完再整个赋值回去不会生效。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`predict`}),` 只做移动这类连续量，不要预测分数、生死这类结果。`]}),`
`,(0,n.jsxs)(r.li,{children:[`没列在 `,(0,n.jsx)(r.code,{children:`interpolate`}),` 里的字段直接取最新画面。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:(0,n.jsx)(r.code,{children:`ctx.lag(playerId)`})}),`：该玩家画面比服务器晚了多少秒（已含网络延迟和插值，有上限）。距离类判定按它放宽，避免「我屏幕上明明碰到了」：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const reach = KILL_RANGE + SPEED * ctx.lag(ctx.playerId);
if (Math.hypot(me.x - t.x, me.y - t.y) > reach) ctx.invalid('too-far');
`})}),`
`,(0,n.jsxs)(r.p,{children:[`长时间没有任何操作，或者所有人都掉线时，tick 会暂停（游戏端收到 `,(0,n.jsx)(r.code,{children:`paused`}),`），有人操作或重连后恢复（`,(0,n.jsx)(r.code,{children:`resumed`}),`）。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`6. 隐藏信息：`,(0,n.jsx)(r.code,{children:`view`}),` 与 `,(0,n.jsx)(r.code,{children:`hidden`})]}),`
`,(0,n.jsxs)(r.p,{children:[`完整状态永远只在服务器上，玩家只收到 `,(0,n.jsx)(r.code,{children:`view(state, playerId)`}),` 的返回值。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`hidden: {
  role: 'owner',               // state.role[某人] 只有本人能看到（以玩家 id 为键的表）
  'players.*.hand': 'owner',   // state.players[某人].hand 只有本人能看到；* 代表玩家 id
  deck: 'server',              // 谁都不能看到
},
view: (state, me) => ({
  phase: state.phase,
  players: Object.fromEntries(Object.entries(state.players).map(([id, p]) => [id, { name: p.name, cards: p.hand.length }])),
  myHand: state.players[me].hand,
  myRole: state.role[me],
}),
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`hidden`}),` 告诉平台哪些字段是秘密：`,(0,n.jsx)(r.code,{children:`'owner'`}),` 只有对应玩家能看，`,(0,n.jsx)(r.code,{children:`'server'`}),` 谁都不能看。键是状态路径，`,(0,n.jsx)(r.code,{children:`*`}),` 匹配玩家 id；`,(0,n.jsx)(r.code,{children:`'owner'`}),` 而路径里没有 `,(0,n.jsx)(r.code,{children:`*`}),` 时（如 `,(0,n.jsx)(r.code,{children:`role`}),`），表示这个值是以玩家 id 为键的表。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`view`}),` 必须`,(0,n.jsx)(r.strong,{children:`挑出`}),`要给的字段，不要 `,(0,n.jsx)(r.code,{children:`return state`}),` 或 `,(0,n.jsx)(r.code,{children:`{ ...state }`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[`平台自检会把别人的秘密换掉再算一次你的 `,(0,n.jsx)(r.code,{children:`view`}),`，结果变了就是泄漏，`,(0,n.jsx)(r.strong,{children:`会挡住发布`}),`。没写进 `,(0,n.jsx)(r.code,{children:`hidden`}),` 的字段测不到，所以秘密一律登记。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ctx.end()`}),` 之后不再检查，结局时公布身份是正常玩法。`]}),`
`,(0,n.jsx)(r.li,{children:`单份画面有大小上限；大地图只发玩家附近的部分。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 计时器`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`ctx.timer('tally', 60_000, { round: state.round }); // 60 秒后调用 timers.tally(state, payload, ctx)
ctx.cancelTimer('tally');
`})}),`
`,(0,n.jsxs)(r.p,{children:[`同名计时器会被替换；每房同时数量和最短间隔有上限。计时器处理函数和 `,(0,n.jsx)(r.code,{children:`update`}),` 一样，出错时跳过，不回滚。`,(0,n.jsx)(r.code,{children:`ctx.end()`}),` 会清除所有计时器。`]}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsxs)(r.strong,{children:[(0,n.jsx)(r.code,{children:`ctx.now`}),` 与倒计时`]})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.now`}),` 是毫秒时间戳（Unix 纪元，服务器时钟），计时器按同一个时钟到期；服务器里的 `,(0,n.jsx)(r.code,{children:`Date.now()`}),`、`,(0,n.jsx)(r.code,{children:`new Date()`}),` 也返回它。`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`事件模式（`,(0,n.jsx)(r.code,{children:`tickRate: 0`}),`）：这一步发生时服务器的时间；`,(0,n.jsx)(r.code,{children:`setup`}),` 里是开局时刻。`]}),`
`,(0,n.jsx)(r.li,{children:`tick 模式：开局时刻 + tick × 周期。房间暂停（长时间没人操作、全员掉线）或服务器跟不上跳过 tick 时它不前进，会慢于真实时间。`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`view`}),` 拿不到 `,(0,n.jsx)(r.code,{children:`ctx`}),`，所以倒计时要把`,(0,n.jsx)(r.strong,{children:`截止时间写进 state`}),` 再投影出去：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// rt/server.js（事件模式）
function startTurn(state, ctx) {
  state.turnEndsAt = ctx.now + 30_000;
  ctx.timer('turnEnd', 30_000);                 // 到点由服务器结算，这才是准的
}
// view 里带上：turnEndsAt: state.turnEndsAt

// 游戏端：只用来显示
const left = Math.max(0, Math.ceil((view.turnEndsAt - Date.now()) / 1000));
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`游戏端用自己的时钟比较，玩家设备时钟可能差几秒；倒计时只做显示，以服务器计时器为准，超时的 `,(0,n.jsx)(r.code,{children:`act`}),` 在服务器用 `,(0,n.jsx)(r.code,{children:`ctx.invalid('time-up')`}),` 拒绝。平台不提供服务器时间偏移，`,(0,n.jsx)(r.code,{children:`rt.stats()`}),` 只有 `,(0,n.jsx)(r.code,{children:`rttMs`}),`、`,(0,n.jsx)(r.code,{children:`jitterMs`}),`、`,(0,n.jsx)(r.code,{children:`tick`}),`、`,(0,n.jsx)(r.code,{children:`corrections`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[`tick 模式不要拿 `,(0,n.jsx)(r.code,{children:`ctx.now`}),` 和游戏端时钟比（暂停后会差很多）：在 `,(0,n.jsx)(r.code,{children:`update`}),` 里 `,(0,n.jsx)(r.code,{children:`state.left -= dt`}),`，`,(0,n.jsx)(r.code,{children:`view`}),` 投影剩余秒数。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`8. `,(0,n.jsx)(r.code,{children:`ctx`}),` 一览`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`成员`}),(0,n.jsx)(r.th,{children:`说明`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.playerId`})}),(0,n.jsxs)(r.td,{children:[`当前动作 / `,(0,n.jsx)(r.code,{children:`onJoin`}),` / `,(0,n.jsx)(r.code,{children:`onLeave`}),` 的玩家 id`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.players`})}),(0,n.jsxs)(r.td,{children:[`当前座位：`,(0,n.jsx)(r.code,{children:`[{ userId, fullName, avatarUrl, state }]`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`ctx.tick`}),` / `,(0,n.jsx)(r.code,{children:`ctx.now`}),` / `,(0,n.jsx)(r.code,{children:`ctx.dt`})]}),(0,n.jsx)(r.td,{children:`当前 tick、逻辑时间（毫秒时间戳，见 §7）、本次步长（秒；事件模式为 0）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`ctx.random()`}),` / `,(0,n.jsx)(r.code,{children:`ctx.shuffle(arr)`})]}),(0,n.jsxs)(r.td,{children:[`每局一个种子的随机数；`,(0,n.jsx)(r.code,{children:`shuffle`}),` 原地打乱并返回数组`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.invalid(reason)`})}),(0,n.jsx)(r.td,{children:`拒绝当前动作并回滚`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`ctx.timer(name, ms, payload?)`}),` / `,(0,n.jsx)(r.code,{children:`ctx.cancelTimer(name)`})]}),(0,n.jsx)(r.td,{children:`计时器`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.connected(id)`})}),(0,n.jsx)(r.td,{children:`该玩家现在是否在线`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.lag(id)`})}),(0,n.jsx)(r.td,{children:`该玩家画面落后服务器的秒数`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.end(result)`})}),(0,n.jsxs)(r.td,{children:[`结束这一局，`,(0,n.jsx)(r.code,{children:`result`}),` 发给所有人`]})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`服务器逻辑在短时间内反复出错，或单次运行超过 CPU 上限太多次，房间会结束（所有人收到 `,(0,n.jsx)(r.code,{children:`ended: 'error'`}),`）。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`9. 示例：回合制（`,(0,n.jsx)(r.code,{children:`tickRate: 0`}),`）`]}),`
`,(0,n.jsx)(r.p,{children:`鹅鸭杀式：夜里鸭子刀人，白天开会投票。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// rt/server.js
export default {
  tickRate: 0, maxPlayers: 8,
  hidden: { role: 'owner' },
  setup(players, ctx) {
    const ids = players.map(p => p.userId), duck = ctx.shuffle([...ids])[0];
    return { phase: 'night', votes: {},
      alive: Object.fromEntries(ids.map(id => [id, true])),
      role: Object.fromEntries(ids.map(id => [id, id === duck ? 'duck' : 'goose'])) };
  },
  actions: {
    kill(state, { target }, ctx) {
      const me = ctx.playerId;
      if (state.phase !== 'night') ctx.invalid('not-night');
      if (state.role[me] !== 'duck') ctx.invalid('only-duck');
      if (!state.alive[me] || !state.alive[target] || target === me) ctx.invalid('bad-target');
      state.alive[target] = false;
      state.phase = 'meeting';
      ctx.timer('tally', 60_000);
    },
    vote(state, { target }, ctx) {
      if (state.phase !== 'meeting' || !state.alive[ctx.playerId]) ctx.invalid('cannot-vote');
      state.votes[ctx.playerId] = target;
    },
  },
  timers: {
    tally(state, _payload, ctx) { /* 计票、淘汰 */ ctx.end({ winner: 'goose' }); },
  },
  view: (state, me) => ({ phase: state.phase, alive: state.alive, votes: state.votes, myRole: state.role[me] }),
};

// 游戏端
dzmm.rt.onView(render);
killBtn.onclick = () => dzmm.rt.act('kill', { target })
  .catch(e => { if (e.code === 'RT_INVALID_ACTION') showHint(e.reason); });
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`10. 示例：即时（`,(0,n.jsx)(r.code,{children:`tickRate: 20`}),`）`]}),`
`,(0,n.jsx)(r.p,{children:`俯视角移动 + 隐藏身份抓人。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// rt/shared.js —— 服务器和游戏共用，会发给玩家，不放秘密
export const SPEED = 3, KILL_RANGE = 1.2, W = 40, H = 30;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function move(p, input, dt) {
  const len = Math.hypot(input.dx, input.dy);
  if (!len) return;
  p.x = clamp(p.x + (input.dx / len) * SPEED * dt, 0, W);
  p.y = clamp(p.y + (input.dy / len) * SPEED * dt, 0, H);
}

// rt/server.js
import { move, SPEED, KILL_RANGE, W, H } from './shared.js';
export default {
  tickRate: 20, maxPlayers: 8,
  hidden: { role: 'owner' },
  setup(players, ctx) {
    const ids = players.map(p => p.userId), duck = ctx.shuffle([...ids])[0];
    return { cooldown: 0,
      players: Object.fromEntries(ids.map(id => [id, { x: ctx.random() * W, y: ctx.random() * H, alive: true }])),
      role: Object.fromEntries(ids.map(id => [id, id === duck ? 'duck' : 'goose'])) };
  },
  update(state, inputs, dt) {
    for (const [id, p] of Object.entries(state.players)) if (p.alive && inputs[id]) move(p, inputs[id], dt);
    state.cooldown = Math.max(0, state.cooldown - dt);
  },
  actions: {
    kill(state, { target }, ctx) {
      const me = state.players[ctx.playerId], t = state.players[target];
      if (state.role[ctx.playerId] !== 'duck' || state.cooldown > 0) ctx.invalid('cannot-kill');
      if (!me?.alive || !t?.alive) ctx.invalid('bad-target');
      const reach = KILL_RANGE + SPEED * ctx.lag(ctx.playerId);
      if (Math.hypot(me.x - t.x, me.y - t.y) > reach) ctx.invalid('too-far');
      t.alive = false; state.cooldown = 20;
      if (Object.values(state.players).filter(p => p.alive).length <= 2) ctx.end({ winner: 'duck' });
    },
  },
  view: (state, me) => ({ players: state.players, myRole: state.role[me],
    cooldown: state.role[me] === 'duck' ? state.cooldown : undefined }),
};

// 游戏端
import { move } from './rt/shared.js';
const myId = (await dzmm.user.info()).id;
await dzmm.rt.quickMatch({ maxPlayers: 8 });
dzmm.rt.netcode({
  interpolate: ['players.*.x', 'players.*.y'],
  predict(view, input, dt) { const p = view.players[myId]; if (p?.alive) move(p, input, dt); },
});
onDirectionChange((dx, dy) => dzmm.rt.input({ dx, dy }));
(function frame() { draw(dzmm.rt.view()); requestAnimationFrame(frame); })();
`})}),`
`,(0,n.jsxs)(r.p,{children:[`要点：公式放 `,(0,n.jsx)(r.code,{children:`rt/shared.js`}),` 共用；`,(0,n.jsx)(r.code,{children:`predict`}),` 只改自己；距离判定用 `,(0,n.jsx)(r.code,{children:`ctx.lag`}),` 放宽；秘密写进 `,(0,n.jsx)(r.code,{children:`hidden`}),`；按下动作先播本地表现，以 `,(0,n.jsx)(r.code,{children:`act()`}),` 结果为准。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`11. 测试与发布检查`}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:`Workbench 预览`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`预览里的联机房间是开发专用的，线上玩家看不到。服务器逻辑出错时，堆栈会打印到 Workbench 控制台（玩家永远看不到）。`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`开第二位玩家`}),`：工具栏按钮会打开第二个标签页，只有游戏画面，以「你的名字（测试 2）」加入，测试双人流程；它不占用 Workbench，原来的标签页照常编辑。改了代码后刷新这个标签页才会加载新文件。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`本机模拟`}),`：工具栏「本机模拟」在浏览器里运行你工作区当前的 `,(0,n.jsx)(r.code,{children:`rt/`}),`，规则和上限与线上相同；旁边的「模拟网络延迟」可选 0 ms、150 ms ± 100、300 ms ± 100，用来体验高延迟玩家。切换时游戏会重新加载。本机模拟靠页面计时器推进，预览标签页切到后台时浏览器会把计时器放慢，实时游戏会停住；测试时让预览标签页留在前台。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsxs)(r.strong,{children:[`读不到 `,(0,n.jsx)(r.code,{children:`rt/`}),` 时`]}),`：Workbench 控制台会提示「本次预览只能开中继房间」，这时 `,(0,n.jsx)(r.code,{children:`realtimeAuthority`}),` 为 `,(0,n.jsx)(r.code,{children:`false`}),`，游戏应退回单人；修好后刷新预览即可。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`机器人`}),`：本机模拟开启时，`,(0,n.jsx)(r.code,{children:`await dzmm.capabilities.get()`}),` 之后会出现 `,(0,n.jsx)(r.code,{children:`dzmm.rt.dev`}),`（线上和普通预览都没有）：`]}),`
`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.capabilities.get();
if (dzmm.rt.dev) {
  const bot = await dzmm.rt.dev.addBot();   // 名字默认「机器人 1」，userId 为 bot-1
  await bot.me.set({ ready: true });
  // 开局后：
  bot.input({ dx: 1, dy: 0 });              // 一直生效到下一次调用
  await bot.act('vote', { target: myId });
  await bot.leave();
}
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`改了 `,(0,n.jsx)(r.code,{children:`rt/`}),` 后，已开的房间仍用旧逻辑（版本在建房时锁定），预览工具栏会提示「服务器逻辑已更新，重新开房后生效」；离开后重新开房才用新逻辑。房间里断线重连或刷新预览，仍回到原来的房间、用原来的逻辑。`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:(0,n.jsx)(r.code,{children:`gamefy rt check`})})}),`
`,(0,n.jsxs)(r.p,{children:[`在本地项目里运行 `,(0,n.jsx)(r.code,{children:`gamefy rt check`}),`（加 `,(0,n.jsx)(r.code,{children:`--json`}),` 输出机器可读结果），平台会用多局模拟检查：`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`检查`}),(0,n.jsx)(r.th,{children:`失败时`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`泄漏：换掉别人的 `,(0,n.jsx)(r.code,{children:`hidden`}),` 字段后你的 `,(0,n.jsx)(r.code,{children:`view`}),` 是否变化、`,(0,n.jsx)(r.code,{children:`view`}),` 是否直接引用了秘密对象`]}),(0,n.jsx)(r.td,{children:`挡住发布，报出泄漏的路径`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`确定性：同一种子、同一组操作跑两次，每个 tick 的状态是否相同`}),(0,n.jsx)(r.td,{children:`挡住发布，报出出现差异的 tick 和种子`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`CPU 与大小：8 个机器人跑一段时间，每 tick CPU、最大状态与画面`}),(0,n.jsx)(r.td,{children:`超出预算给警告，不挡发布（线上仍按上限执行）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`能否加载、能否开局`}),(0,n.jsx)(r.td,{children:`挡住发布`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`自检的机器人默认随机操作；写了 `,(0,n.jsx)(r.code,{children:`bot(view, ctx)`}),` 时用你的（`,(0,n.jsx)(r.code,{children:`ctx`}),` 只有 `,(0,n.jsx)(r.code,{children:`playerId`}),` 和 `,(0,n.jsx)(r.code,{children:`random()`}),`），模拟更接近真实对局。返回 `,(0,n.jsx)(r.code,{children:`{ input?, act?: [name, payload] }`}),`，没事做（不是自己的回合、已出局）时返回 `,(0,n.jsx)(r.code,{children:`null`}),`。检查失败时命令以非零状态退出。`]}),`
`,(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:`发布`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`gamefy deploy`}),` 和 Workbench 发布都会先跑同样的检查：泄漏、确定性失败或服务器逻辑加载不了会拒绝发布；CPU 超预算只警告。`,(0,n.jsx)(r.code,{children:`gamefy deploy --dry-run`}),` 只跑检查不发布。发布后新开的房间用新逻辑，已开的房间不受影响：房里的玩家断线重连或刷新页面，仍回到自己的座位、继续用原来的版本，不会因为你重新发布被拒；房间结束后玩家再开房就是新版本。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};