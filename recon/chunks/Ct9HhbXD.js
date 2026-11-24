(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4f1586ef-5c58-4cba-a21e-1799fc0d7cda`,e._sentryDebugIdIdentifier=`sentry-dbid-4f1586ef-5c58-4cba-a21e-1799fc0d7cda`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`游戏运行环境`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`新手提示：你的游戏在玩家浏览器里跑，但是被装在一个完全隔离的小盒子（iframe 沙箱）里。这一页讲清楚这个盒子的边界，能省下你以后一半的调试时间。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 总体架构`}),`
`,(0,n.jsx)(r.p,{children:`游戏运行时的样子：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`玩家浏览器
└── DZMM 页面（顶层）
    └── <iframe sandbox="allow-scripts ...">   ← 你的游戏在这里
        ├── 你的 publish/index.html
        ├── 你的 JS / CSS / 图片
        └── window.dzmm                        ← SDK 自动注入
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`iframe sandbox`}),` 让你的游戏代码没法访问 DZMM 主站的页面、Cookie、localStorage。`]}),`
`,(0,n.jsxs)(r.li,{children:[`但 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` 这个 SDK 全局对象能跨过这道墙通信，让游戏调到平台能力（AI、画图、存档）。`]}),`
`,(0,n.jsxs)(r.li,{children:[`跨墙通信用的是浏览器的 `,(0,n.jsx)(r.code,{children:`postMessage`}),` —— 这也是为什么 SDK 调用都是 `,(0,n.jsx)(r.code,{children:`async`}),`（要等消息走一个来回）。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 沙箱限制：哪些代码会失败`}),`
`,(0,n.jsxs)(r.p,{children:[`游戏 iframe 没有 `,(0,n.jsx)(r.code,{children:`allow-same-origin`}),`，所以下面这些常见操作会直接抛 `,(0,n.jsx)(r.code,{children:`SecurityError`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ❌ 全部禁止
parent.document.getElementById('...')   // 访问父页面 DOM
top.window.location                     // 访问顶层窗口
window.opener                           // 访问打开者
localStorage.setItem('key', 'value')    // localStorage 不可用
sessionStorage.setItem('key', 'value')  // sessionStorage 不可用
document.cookie = 'key=value'           // Cookie 不可用
indexedDB.open('db')                    // IndexedDB 不可用

// ✅ 这些可以
window.dzmm.kv.put('key', 'value')      // 用 dzmm.kv 存数据
window.dzmm.completions(config, onContent) // 调 AI，文本通过回调提供
alert('hello')                          // ✔ allow-modals
window.open(url)                        // ✔ allow-popups
document.forms[0].submit()              // ✔ allow-forms
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`怎么持久化数据？ 不能用 `,(0,n.jsx)(r.code,{children:`localStorage`}),`，要用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/kv`,children:(0,n.jsx)(r.code,{children:`dzmm.kv.*`})}),`。它通过 SDK 走到云端数据库，玩家下次打开游戏数据还在。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 控制台日志`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`console.log / warn / error / info`}),` 在沙箱里被拦截：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`开发模式：日志被转发到 Workbench 底部 Preview 面板的控制台，方便你调试。`}),`
`,(0,n.jsx)(r.li,{children:`生产模式：日志只有浏览器 DevTools 看得到（玩家自己按 F12）。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`调试时，在 Chat 面板可以选择「附带控制台日志」一起发给 Agent，它能直接看到错误堆栈。`}),`
`,(0,n.jsxs)(r.h3,{children:[`看到 `,(0,n.jsx)(r.code,{children:`Script error at :0`}),` 怎么办`]}),`
`,(0,n.jsxs)(r.p,{children:[`这是浏览器对跨域错误的标准模糊化提示。通常原因是游戏代码尝试了被禁止的操作（比如 `,(0,n.jsx)(r.code,{children:`parent.document`}),`）。`]}),`
`,(0,n.jsx)(r.p,{children:`排查：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsx)(r.li,{children:`按 F12 打开浏览器 DevTools → Console`}),`
`,(0,n.jsxs)(r.li,{children:[`找 `,(0,n.jsx)(r.code,{children:`SecurityError`}),` 开头的错误，能看到完整堆栈`]}),`
`,(0,n.jsxs)(r.li,{children:[`把违规代码改成 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` API`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 开发模式 vs 生产模式`}),`
`,(0,n.jsxs)(r.p,{children:[`游戏在两种模式下都会跑。两种模式走的是同一套 SDK、同一套真实后端链路，差别只在数据落在哪个命名空间：开发模式的所有数据（存档、聊天、服务端函数 KV）都在`,(0,n.jsx)(r.strong,{children:`你自己的开发数据`}),`里，与生产隔离，也与其他开发者的开发数据隔离——同一个游戏若有多人参与开发，每人一份，互不覆盖也互相看不见。`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`特性`}),(0,n.jsx)(r.th,{children:`开发模式（Workbench 预览）`}),(0,n.jsx)(r.th,{children:`生产模式（玩家游玩）`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`触发方式`}),(0,n.jsx)(r.td,{children:`你在 Workbench 里点 Preview 刷新`}),(0,n.jsx)(r.td,{children:`玩家在 DZMM 里打开你的游戏`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`KV 存储`}),(0,n.jsx)(r.td,{children:`数据库持久化（你自己的开发数据，刷新/重开都在）`}),(0,n.jsx)(r.td,{children:`数据库持久化`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`聊天存档`}),(0,n.jsx)(r.td,{children:`数据库持久化（你自己的开发会话）`}),(0,n.jsx)(r.td,{children:`数据库持久化，跟当前聊天绑定`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`AI 对话 / 画图`}),(0,n.jsx)(r.td,{children:`正常工作，消耗你自己的积分`}),(0,n.jsx)(r.td,{children:`正常工作，消耗玩家的积分`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.user.info()`})}),(0,n.jsx)(r.td,{children:`返回你自己的信息`}),(0,n.jsx)(r.td,{children:`返回当前玩家的信息`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`token`}),`（JWT）`]}),(0,n.jsx)(r.td,{children:`真实的 RS256 JWT（你的身份）`}),(0,n.jsx)(r.td,{children:`真实的 RS256 JWT`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`environment`})}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`'dev'`})}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`'prod'`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`控制台`}),(0,n.jsx)(r.td,{children:`转发到 Workbench Preview 控制台`}),(0,n.jsx)(r.td,{children:`仅浏览器 DevTools 可见`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`服务端函数`}),(0,n.jsxs)(r.td,{children:[`实时编译容器里的 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`}),`，改完无需重启；容器未运行会明确报错`]}),(0,n.jsx)(r.td,{children:`必须先「发布」函数快照才能用`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`正式游戏中，作者指定的可用模型会优先使用；`,(0,n.jsx)(r.code,{children:`model: 'default'`}),` 或作者模型已不可用时，会使用玩家在当前 GameFy Chat 设置中选择的模型。浏览器调用和服务端函数调用共用这项设置。Workbench 预览走同样的解析逻辑（挂在预览专用的开发会话上），与玩家看到的模型行为一致。`]}),`
`,(0,n.jsx)(r.h3,{children:`怎么知道当前是哪个模式？`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`代码里通常不需要分支处理 —— 两种模式行为一致，写一份代码两边都跑。`}),`
`,(0,n.jsxs)(r.li,{children:[`如果一定要判断，用 `,(0,n.jsx)(r.code,{children:`dzmm.capabilities.get()`}),` 或 `,(0,n.jsx)(r.code,{children:`dzmm.user.info()`}),` 返回的 `,(0,n.jsx)(r.code,{children:`environment`}),` 字段（`,(0,n.jsx)(r.code,{children:`'dev'`}),` / `,(0,n.jsx)(r.code,{children:`'prod'`}),`）。`]}),`
`,(0,n.jsxs)(r.li,{children:[`不要再用 `,(0,n.jsx)(r.code,{children:`token === null`}),` 判断开发模式：开发模式现在也签发真实 token，`,(0,n.jsx)(r.code,{children:`null`}),` 只代表"未登录或签发失败"。`]}),`
`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`提示：预览的开发数据独立于生产，也不会随发布带到线上。想从干净状态重测，用 Preview 工具栏的「清除存储」按钮——它只清你自己在本游戏的开发数据（存档、聊天、服务端函数 KV），不会动生产数据，也不会动其他开发者的数据。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`5. 资源加载（`,(0,n.jsx)(r.code,{children:`<base>`}),` 注入）`]}),`
`,(0,n.jsxs)(r.p,{children:[`SDK 在游戏 HTML 加载前，会注入一个 `,(0,n.jsx)(r.code,{children:`<base href="...">`}),` 标签，让你的相对路径（`,(0,n.jsx)(r.code,{children:`./assets/img.png`}),`）能解析到正确位置：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`开发模式：`,(0,n.jsx)(r.code,{children:`<base>`}),` 指向容器代理地址。`]}),`
`,(0,n.jsxs)(r.li,{children:[`生产模式：`,(0,n.jsx)(r.code,{children:`<base>`}),` 指向线上 CDN。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`对你来说只要遵守一条规则：所有资源用相对路径（`,(0,n.jsx)(r.code,{children:`./assets/...`}),`），别用绝对路径（`,(0,n.jsx)(r.code,{children:`/assets/...`}),`）。其它的 SDK 替你搞定。`]}),`
`,(0,n.jsx)(r.h3,{children:`资源多时要上报启动进度`}),`
`,(0,n.jsxs)(r.p,{children:[`如果游戏启动期要下载较多图片、音频、字体、关卡 JSON、WASM 或大 JS bundle，不要让 iframe 长时间完全静默。请在主脚本顶部开始调用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/loading`,children:(0,n.jsx)(r.code,{children:`dzmm.loading.progress()`})}),`，每个阶段或资源完成时更新进度，首个可交互画面渲染后调用 `,(0,n.jsx)(r.code,{children:`dzmm.loading.ready()`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`这样平台就知道游戏只是还在加载资源，而不是卡死或白屏。启动失败时调用 `,(0,n.jsx)(r.code,{children:`dzmm.loading.error(code, message)`}),`，同时在游戏内显示失败/重试 UI。Web 和移动 WebView 都会处理这些 loading 信号。`]}),`
`,(0,n.jsxs)(r.p,{children:[`调用过 `,(0,n.jsx)(r.code,{children:`progress()`}),` 后，宿主会忽略普通 `,(0,n.jsx)(r.code,{children:`load`}),` / blank 探测，直到收到 `,(0,n.jsx)(r.code,{children:`ready()`}),` 或 `,(0,n.jsx)(r.code,{children:`error()`}),`。30 秒没有握手或新进度会进入可重试失败，启动总时长还有 120 秒硬上限。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 网络请求`}),`
`,(0,n.jsxs)(r.p,{children:[`iframe 里可以直接 `,(0,n.jsx)(r.code,{children:`fetch()`}),` 外部 URL（沙箱不限制网络）。但有两个建议：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`优先用 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` API。直接 `,(0,n.jsx)(r.code,{children:`fetch`}),` DZMM 后端是行不通的（跨域 + 没鉴权）。`]}),`
`,(0,n.jsx)(r.li,{children:`用第三方 API 时，提示词审核、内容合规仍然要你自己负责。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 游戏方向（横屏 / 竖屏）`}),`
`,(0,n.jsxs)(r.p,{children:[`iframe 容器的形状是按你声明的方向画的，不是按玩家手机当前的方向自动适配。所以`,(0,n.jsx)(r.strong,{children:`发布前一定要在 Workbench 里把方向选对`}),`，否则玩家会进游戏后看到一个被挤扁/拉长的画面，再被提示转屏才能继续。`]}),`
`,(0,n.jsx)(r.h3,{children:`在哪里设置`}),`
`,(0,n.jsxs)(r.p,{children:[`Workbench 右侧 `,(0,n.jsx)(r.strong,{children:`设置面板 → 游戏信息 → 游戏方向`}),`，二选一：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`横屏（landscape）`}),`：iframe 按 16:9 渲染，适合横向布局的游戏（卡牌战斗、横版动作、宽 UI 的视觉小说等）。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`竖屏（portrait）`}),`：iframe 按 9:16 渲染，适合上下布局（聊天式互动小说、纵向操作、手机直读小说等）。`]}),`
`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`老卡片如果没声明方向，平台一律按 `,(0,n.jsx)(r.strong,{children:`竖屏`}),` 渲染 —— DZMM 历史上的 gamefy 大多是竖屏，把未声明的当横屏会让大量旧卡 letterbox。新作品请显式选择，不要依赖这个默认值。`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`设置改完点保存即生效，预览面板的设备框会立即按新方向旋转，方便你检查布局。`}),`
`,(0,n.jsx)(r.h3,{children:`这个设置会影响什么`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`场景`}),(0,n.jsx)(r.th,{children:`行为`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家进入游戏`}),(0,n.jsx)(r.td,{children:`iframe 按声明方向的比例渲染（不会因手机当前方向旋转）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`移动端 / Android APP 进入全屏`}),(0,n.jsxs)(r.td,{children:[`平台尝试调用 `,(0,n.jsx)(r.code,{children:`screen.orientation.lock(...)`}),` 或原生桥把屏幕锁到目标方向`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家方向与游戏方向不一致`}),(0,n.jsx)(r.td,{children:`启动前弹方向提示对话框；进入游戏后还不一致则在顶部显示横幅，玩家转屏后自动消失`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`iOS / iPadOS`}),(0,n.jsxs)(r.td,{children:[`Apple 没实现 Screen Orientation Lock，平台无法强制旋转，提示文案会额外告诉玩家`,(0,n.jsx)(r.strong,{children:`关掉控制中心的"方向锁定"`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`PC 桌面浏览器`}),(0,n.jsx)(r.td,{children:`无方向锁定，iframe 在窗口内按声明比例 letterbox`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Workbench 预览面板`}),(0,n.jsxs)(r.td,{children:[`设备框按当前 `,(0,n.jsx)(r.code,{children:`orientation`}),` 设置旋转，可点旋转按钮临时切换查看`]})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`怎么选`}),`
`,(0,n.jsxs)(r.p,{children:[`选 `,(0,n.jsx)(r.strong,{children:`你 UI 设计的实际画面比例`}),`，不是"玩家可能怎么拿手机"。规则只有一条：`,(0,n.jsx)(r.strong,{children:`画面横得多就选横屏，竖得多就选竖屏`}),`。不要试图写"自适应任意方向"的游戏 —— 平台会按你声明的方向锁屏，自适应代码大概率跑不到。`]}),`
`,(0,n.jsx)(r.p,{children:`如果你的游戏 UI 是用 CSS 自适应布局画的，依然要选一个主方向，让平台帮你锁屏；否则在 Android 上玩家随手一转，画面会跟着系统旋转，体验会很乱。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 画布尺寸 — 高度、滚动、全屏`}),`
`,(0,n.jsxs)(r.p,{children:[`iframe 的尺寸`,(0,n.jsx)(r.strong,{children:`不是玩家的整个屏幕`}),`，而是平台按你声明的方向锁定的一块画布：横屏 16:9 / 竖屏 9:16。桌面端 letterbox，移动端 fit-contain。玩家进入/退出全屏会让 iframe 实际像素尺寸瞬间变化（移动端全屏还可能解锁到真实手机比例如 19.5:9）。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`核心心智`}),`：iframe 里的 `,(0,n.jsx)(r.code,{children:`100vh`}),` / `,(0,n.jsx)(r.code,{children:`100dvh`}),` / `,(0,n.jsx)(r.code,{children:`100vw`}),` 是 `,(0,n.jsx)(r.strong,{children:`iframe 自己的可视尺寸`}),`，不是物理屏幕。下面这一节解决 80% 的「在我电脑上看着挺好，玩家手机上一塌糊涂」类问题。`]}),`
`]}),`
`,(0,n.jsxs)(r.h3,{children:[`8.1 用 `,(0,n.jsx)(r.code,{children:`100dvh`}),`，不要单写 `,(0,n.jsx)(r.code,{children:`100vh`})]}),`
`,(0,n.jsxs)(r.p,{children:[`iOS Safari 14- 把 `,(0,n.jsx)(r.code,{children:`100vh`}),` 当成"含地址栏的最大高度"，导致底部一行内容被遮挡。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-css`,children:`/* ✓ 推荐 */
body { height: 100dvh; }

/* ✓ 向下兼容（旧浏览器吃 vh，新浏览器覆盖为 dvh） */
.full-screen { height: 100vh; height: 100dvh; }

/* ❌ 不要单写 100vh */
body { height: 100vh; }
`})}),`
`,(0,n.jsx)(r.h3,{children:`8.2 别让 body 出现滚动条`}),`
`,(0,n.jsx)(r.p,{children:`游戏不是文档，绝大多数 gamefy 应该「一屏装下、内部局部滚动」。让 body 自身滚动会让玩家上下滑动时把 HUD、固定按钮、背景一起拖走。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-css`,children:`/* ✓ 根布局锁死视口，子区域自己滚 */
html, body { margin: 0; height: 100dvh; overflow: hidden; }
body { display: flex; flex-direction: column; }

.scroll-area {
  flex: 1;
  min-height: 0;      /* 必须！否则 flex 子项默认 min-height: auto，内容多了会撑爆 */
  overflow-y: auto;
  overscroll-behavior: contain;  /* 滚到顶/底不带动 parent */
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`min-height: 0`}),` 是 flex 列布局最高频的坑。漏写后，内容超过可视高度时不会在子容器内滚动，而是把整个 body 撑出滚动条。`]}),`
`,(0,n.jsxs)(r.p,{children:[`文字阅读类游戏（互动小说、长 Galgame）是少数允许 body 滚动的例外，但这种情况下 HUD 要用 `,(0,n.jsx)(r.code,{children:`position: sticky`}),` 而不是 `,(0,n.jsx)(r.code,{children:`fixed`}),`，否则全屏切换 / 键盘弹出时位置会漂。`]}),`
`,(0,n.jsx)(r.h3,{children:`8.3 iframe 尺寸会变 — 监听 resize`}),`
`,(0,n.jsxs)(r.p,{children:[`会触发 iframe 尺寸变化的事件：进入/退出全屏、玩家旋转手机、浏览器地址栏收起、虚拟键盘弹出/收起。不能只在 `,(0,n.jsx)(r.code,{children:`DOMContentLoaded`}),` 算一次。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// Canvas 游戏：尺寸变化要重置 canvas + 重绘
function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.clientWidth  * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// DOM 游戏推荐用 ResizeObserver
new ResizeObserver(() => layout()).observe(document.body);
`})}),`
`,(0,n.jsx)(r.h3,{children:`8.4 安全区 + 输入框`}),`
`,(0,n.jsx)(r.p,{children:`全屏后 iframe 顶到屏幕边缘（刘海、底部 home indicator）。HUD 务必加 safe-area 内边距：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-html`,children:`<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover,
               interactive-widget=resizes-content">
`})}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-css`,children:`.hud-top    { padding-top:    env(safe-area-inset-top); }
.hud-bottom { padding-bottom: env(safe-area-inset-bottom); }
`})}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`viewport-fit=cover`}),` 必须写，否则 `,(0,n.jsx)(r.code,{children:`env(safe-area-inset-*)`}),` 全是 0。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`interactive-widget=resizes-content`}),` 让虚拟键盘弹出时 `,(0,n.jsx)(r.code,{children:`100dvh`}),` 自动收缩，输入框不被键盘挡住。`]}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`8.5 推荐的根布局起手式`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-html`,children:`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover,
               interactive-widget=resizes-content, user-scalable=no">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100vh;           /* 旧浏览器兜底 */
    height: 100dvh;          /* 新浏览器覆盖为 dynamic viewport */
    overflow: hidden;
  }
  body {
    display: flex;
    flex-direction: column;
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  .scroll-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
</style>
</head>
<body>
  <header class="hud-top">…</header>
  <main class="scroll-area">…</main>
  <footer class="hud-bottom">…</footer>
</body>
</html>
`})}),`
`,(0,n.jsx)(r.h3,{children:`8.6 自检清单`}),`
`,(0,n.jsx)(r.p,{children:`写完一个布局后过一遍：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`Workbench 预览面板拉到最小 / 最大，body 都不出滚动条`}),`
`,(0,n.jsx)(r.li,{children:`长内容（消息列表 / 背包）只在内部容器里滚，HUD 不跟着滚`}),`
`,(0,n.jsx)(r.li,{children:`点预览顶部「全屏」按钮，UI 不错位、内容不被截断、HUD 不压在刘海下`}),`
`,(0,n.jsx)(r.li,{children:`切到 iPhone 14 预设，竖屏 / 横屏旋转布局都不破`}),`
`,(0,n.jsx)(r.li,{children:`Canvas 游戏 resize 后还能正确渲染（不模糊、不拉伸、不被裁切）`}),`
`,(0,n.jsx)(r.li,{children:`有输入框时，模拟移动端把键盘抬起来，输入框能保持可见`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`9. 心智模型一句话`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`"游戏跑在一个沙箱里。要碰平台的东西，全走 `,(0,n.jsx)(r.code,{children:`dzmm.*`}),` SDK；自己写的代码该怎么写还是怎么写。"`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};