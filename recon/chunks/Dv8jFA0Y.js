(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1ea35270-e6f0-4b31-a6b1-9181cab03f40`,e._sentryDebugIdIdentifier=`sentry-dbid-1ea35270-e6f0-4b31-a6b1-9181cab03f40`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`常见问题`}),`
`,(0,n.jsx)(r.p,{children:`把开发时高频踩坑列在一处。看不到答案的话，把问题发给 Agent，它能直接看你的代码。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`改了代码看不到效果？`}),`
`,(0,n.jsx)(r.p,{children:`先手动刷新 Preview，确认当前工作区的文件已经加载。`}),`
`,(0,n.jsx)(r.p,{children:`切到底部 Preview 面板 → 点刷新按钮。`}),`
`,(0,n.jsx)(r.p,{children:`如果刷新后还是不对：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`看 Preview 控制台有没有红字错误 → 复制内容发给 Agent`}),`
`,(0,n.jsx)(r.li,{children:`看 Files 面板，文件确实被改到了吗`}),`
`,(0,n.jsxs)(r.li,{children:[`看 `,(0,n.jsx)(r.code,{children:`publish/index.html`}),`，引用的 JS / CSS 路径对吗`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`保存提示文件过多、文件过大，或安装工具后保存失败？`}),`
`,(0,n.jsxs)(r.p,{children:[`工作区保存包含整个项目未忽略的文件，工具放在隐藏目录或 `,(0,n.jsx)(r.code,{children:`publish/`}),` 外也可能计入。一次最多 512 个变更文件（新增、修改、删除合计），单文件 50 MiB，大文件传输合计 256 MiB；整次保存传输包部署默认也是 256 MiB。`]}),`
`,(0,n.jsxs)(r.p,{children:[`先保留工作区并备份未保存的文件。可重建的工具依赖、虚拟环境和缓存应按实际路径加入项目根目录 `,(0,n.jsx)(r.code,{children:`.gitignore`}),`，如 `,(0,n.jsx)(r.code,{children:`.venv/`}),`、`,(0,n.jsx)(r.code,{children:`.cache/`}),`、`,(0,n.jsx)(r.code,{children:`__pycache__/`}),`、`,(0,n.jsx)(r.code,{children:`matte-tools/`}),`；不要忽略游戏源码与发布素材。已保存过的工具文件只加忽略无效，先备份并联系支持处理。大批素材备份后分批处理，单个大素材保留原件后压缩或拆分；不要靠重复保存、重建或从线上恢复清除错误。`]}),`
`,(0,n.jsxs)(r.p,{children:[`完整上限、可复制的忽略示例、只读检查和处理顺序见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/limits#workspace-save`,children:`平台限制总表 · 工作区保存`}),`。`]}),`
`,(0,n.jsx)(r.h2,{children:`「发布」失败 / 提示文件名非法？`}),`
`,(0,n.jsx)(r.p,{children:`文件名 / 文件夹名出现了中文 / Emoji / 空格 / 带音符拉丁字母。线上对象存储拒收非 ASCII 路径，只要一个文件违规整次保存就失败。`}),`
`,(0,n.jsxs)(r.p,{children:[`在 Terminal 运行`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/getting-started`,children:`快速入门 §2 的 Node 文件名预检`}),`。静态路径还不能含空段、`,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`}),`；函数名只能用字母、数字、下划线和连字符，同名 `,(0,n.jsx)(r.code,{children:`.ts`}),` / `,(0,n.jsx)(r.code,{children:`.js`}),` 不能共存。`]}),`
`,(0,n.jsxs)(r.p,{children:[`把违规路径改成合法名称（用 `,(0,n.jsx)(r.code,{children:`git mv`}),`，相应 HTML / JS 引用也改），再发布。工坊的函数警告也要处理，避免新前端仍调用旧函数。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[(0,n.jsx)(r.code,{children:`Script error at :0`}),` 看不到完整错误？`]}),`
`,(0,n.jsxs)(r.p,{children:[`这是跨域错误的浏览器标准模糊化提示。通常是因为代码尝试了沙箱禁止的操作（`,(0,n.jsx)(r.code,{children:`parent.document`}),`、`,(0,n.jsx)(r.code,{children:`localStorage`}),` 等）。`]}),`
`,(0,n.jsx)(r.p,{children:`排查：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsx)(r.li,{children:`按 F12 → DevTools → Console`}),`
`,(0,n.jsxs)(r.li,{children:[`找 `,(0,n.jsx)(r.code,{children:`SecurityError`}),` 开头的项，能看到完整堆栈`]}),`
`,(0,n.jsxs)(r.li,{children:[`把违规操作改成 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` API`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`控制台里来源是 `,(0,n.jsx)(r.code,{children:`chrome-extension://`}),` 或 `,(0,n.jsx)(r.code,{children:`moz-extension://`}),` 的报错来自浏览器扩展注入，与游戏无关。`]}),`
`,(0,n.jsxs)(r.p,{children:[`详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/runtime`,children:`游戏运行环境`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[(0,n.jsx)(r.code,{children:`localStorage is not defined`}),` / `,(0,n.jsx)(r.code,{children:`Cookie 不能用`}),`？`]}),`
`,(0,n.jsxs)(r.p,{children:[`沙箱 iframe 没有 `,(0,n.jsx)(r.code,{children:`allow-same-origin`}),`，所以 `,(0,n.jsx)(r.code,{children:`localStorage`}),` / `,(0,n.jsx)(r.code,{children:`sessionStorage`}),` / Cookie / `,(0,n.jsx)(r.code,{children:`indexedDB`}),` 全部不能用。`]}),`
`,(0,n.jsxs)(r.p,{children:[`改用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/kv`,children:(0,n.jsx)(r.code,{children:`dzmm.kv.*`})}),`，直接用即可，不需要 localStorage fallback：开发模式和生产模式都持久化到数据库（开发模式数据是你自己那一份，刷新 / 重开浏览器都在）。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`玩家说游戏卡死，但我本地预览没问题？`}),`
`,(0,n.jsx)(r.p,{children:`最常见原因（按概率排序）：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[`配额 / 积分耗尽 —— 玩家积分用完，AI / 画图开始抛 `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),`，你的代码没处理 → UI 卡在 loading`]}),`
`,(0,n.jsxs)(r.li,{children:[`网络抖动 + 没有错误收口 / 显式重试按钮 —— `,(0,n.jsx)(r.code,{children:`NETWORK_ERROR`}),` 后 UI 一直卡在 loading`]}),`
`,(0,n.jsxs)(r.li,{children:[`AI 返回非 JSON —— 你的代码 `,(0,n.jsx)(r.code,{children:`JSON.parse(...)`}),` throw，整个流程白屏`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`对应方案分别见：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/errors`,children:`完整错误码处理`})}),`
`,(0,n.jsx)(r.li,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/completions`,children:`completions 章节 §5 网络瞬时错误与显式重试`})}),`
`,(0,n.jsx)(r.li,{children:(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/completions`,children:`completions 章节 §5.2 解析 JSON 必须兜底`})}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`我想藏起 system prompt 不让玩家看到？`}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 的 messages 是写在 JS 里的，玩家按 F12 → Network 能看到。`]}),`
`,(0,n.jsxs)(r.p,{children:[`不想让 prompt 直接出现在前端源码和普通浏览器请求里，可以用`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),`：在 `,(0,n.jsx)(r.code,{children:`functions/secret-npc.ts`}),` 里调用 `,(0,n.jsx)(r.code,{children:`ctx.completions(...)`}),`。但模型输出仍会返回浏览器，prompt injection 可能诱导模型复述服务端指令，所以这不是保密机制。不要放 API key、密码、个人数据或安全关键规则；权威校验要写成确定性服务端代码。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`想做全游戏排行榜，但 dzmm.kv 是玩家私有的？`}),`
`,(0,n.jsxs)(r.p,{children:[`是的，浏览器侧 `,(0,n.jsx)(r.code,{children:`dzmm.kv.*`}),` 是 (chat, 玩家) scope，互相隔离。`]}),`
`,(0,n.jsxs)(r.p,{children:[`跨玩家共享需要`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),` 里的 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),`，例如 `,(0,n.jsx)(r.code,{children:`ctx.kv.global.put('leaderboard', ...)`}),`。`,(0,n.jsx)(r.code,{children:`ctx.kv.*`}),` 是当前玩家私有的 `,(0,n.jsx)(r.code,{children:`(gameId, userId)`}),` scope，不能用于共享榜单。`]}),`
`,(0,n.jsxs)(r.p,{children:[`注意：Workbench 预览里 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 读写的是你自己的开发数据，与线上、与其他开发者都隔离 —— 调试不会污染玩家排行榜，但也读不到线上数据，要验证真实数据需发布后验证。另外 global KV 没有事务或 CAS；展示型榜单可以 best-effort 使用，严格排名和奖励结算需要事务存储。`]}),`
`,(0,n.jsxs)(r.p,{children:[`具体见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`ctx API 详解 §1 KV`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`服务端函数怎么本地调试？`}),`
`,(0,n.jsx)(r.p,{children:`直接在 Workbench：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[`在容器里写 `,(0,n.jsx)(r.code,{children:`functions/myFn.ts`})]}),`
`,(0,n.jsxs)(r.li,{children:[`在 `,(0,n.jsx)(r.code,{children:`publish/`}),` 里写浏览器代码调 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke('myFn', { ... })`})]}),`
`,(0,n.jsx)(r.li,{children:`切到 Preview 刷新`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`Workbench 预览（挂在隐藏的开发会话上）走 dev 模式，实时读容器内的 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`}),`，改完立刻生效，不用重启 / 重发布；开发容器未运行时会明确报错 `,(0,n.jsx)(r.code,{children:`dev_container_inactive`}),`（HTTP 409），先启动容器再调。`,(0,n.jsx)(r.code,{children:`console.log`}),` 在容器 fn 内不会显示在 Preview 控制台（在 fn-runner 服务日志里），调试时建议把信息直接 `,(0,n.jsx)(r.code,{children:`return`}),` 出去。玩家会话永远读已发布的 prod 快照，不受你的容器开关影响。`]}),`
`,(0,n.jsxs)(r.p,{children:[`更详细的写法见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/writing`,children:`编写函数`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`我的 AI 偶尔返回不是 JSON，怎么办？`}),`
`,(0,n.jsxs)(r.p,{children:[`不要假设 AI 一定返回合法 JSON。`,(0,n.jsx)(r.code,{children:`JSON.parse(buf)`}),` 必须 try-catch 兜底，失败时降级到纯文本：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let parsed;
try { parsed = JSON.parse(buf); }
catch { return useTextFallback(buf); }
`})}),`
`,(0,n.jsxs)(r.p,{children:[`详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/completions`,children:`completions §5.2`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`玩家关闭页面前我应该 `,(0,n.jsx)(r.code,{children:`dzmm.kv.put`}),` 一下吗？`]}),`
`,(0,n.jsxs)(r.p,{children:[`不要靠 `,(0,n.jsx)(r.code,{children:`beforeunload`}),` 存档。玩家直接关标签 / 切应用时浏览器经常不给执行时间，存档大概率丢。`]}),`
`,(0,n.jsxs)(r.p,{children:[`正确做法：每个有意义的状态变化（通关、选完一个分支、捡到道具）立刻 `,(0,n.jsx)(r.code,{children:`kv.put`}),`。游戏状态变量本身就是 source of truth，写多了也没事（SDK 会合并写入）。`,(0,n.jsx)(r.code,{children:`put`}),` 默认会等到写进服务端才返回、写失败会 reject：不想让界面等它的地方传 `,(0,n.jsx)(r.code,{children:`{ ack: 'accepted' }`}),`，或者不 `,(0,n.jsx)(r.code,{children:`await`}),` 并接 `,(0,n.jsx)(r.code,{children:`.catch(...)`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`我引用了 Phaser / Three.js 通过 CDN，但加载失败？`}),`
`,(0,n.jsx)(r.p,{children:`沙箱 iframe 可以从外部 CDN 加载脚本。失败常见原因：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`CDN URL 拼错了 / 版本号过期`}),`
`,(0,n.jsxs)(r.li,{children:[`引入顺序：你的 `,(0,n.jsx)(r.code,{children:`game.js`}),` 在 Phaser 还没加载完就跑了 → 用 `,(0,n.jsx)(r.code,{children:`defer`}),` 或 `,(0,n.jsx)(r.code,{children:`DOMContentLoaded`})]}),`
`,(0,n.jsxs)(r.li,{children:[`HTTPS：如果 CDN 是 `,(0,n.jsx)(r.code,{children:`http://`}),`，浏览器会拦截 mixed content。改 `,(0,n.jsx)(r.code,{children:`https://`})]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`Console 看不到我自己的 `,(0,n.jsx)(r.code,{children:`console.log`}),`？`]}),`
`,(0,n.jsx)(r.p,{children:`开发模式 console 会被转发到 Preview 面板的控制台（不是浏览器 F12 那个）。`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`console.error('失败:', err)`}),` 在 iframe 转发时可能丢结构，建议写成：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`console.error('失败:', err.code, err.message, err.stack);
`})}),`
`,(0,n.jsxs)(r.p,{children:[`详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/runtime`,children:`游戏运行环境 §3`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`还没解决？`}),`
`,(0,n.jsx)(r.p,{children:`把问题、报错截图（或控制台错误文本）、相关代码片段发给 Workbench 里的 Agent —— 它能直接看到你的项目文件并定位问题。`})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};