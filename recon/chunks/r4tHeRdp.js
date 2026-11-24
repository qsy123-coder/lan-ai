(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`038eb202-66ca-4ce6-aee7-365a162f7d69`,e._sentryDebugIdIdentifier=`sentry-dbid-038eb202-66ca-4ce6-aee7-365a162f7d69`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,p:`p`,pre:`pre`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`能力检查 — `,(0,n.jsx)(r.code,{children:`dzmm.capabilities.get()`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`新手提示：这个 API 只回答“当前宿主有没有这类能力”。它不返回积分、配额、图片数量上限、KV 剩余空间等动态信息。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 用法`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const caps = await dzmm.capabilities.get();

if (caps.share) {
  showShareButton();
}

if (caps.loading) {
  dzmm.loading.progress({ phase: 'start', message: 'Preparing game' });
}

if (caps.kvBatch) {
  await dzmm.kv.batchPut({ profile: player, settings });
}

if (!caps.chatStableIds) {
  hideBranchSaveUi(); // 当前 Host 不能保证旧 message id 在分支后仍有效
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  environment: 'dev' | 'prod';
  kv: boolean;
  kvBatch: boolean;
  kvList: boolean;
  kvPutIfAbsent?: boolean;
  fn: boolean;
  completions: boolean;
  draw: boolean;
  drawEdit?: boolean;
  drawPresentation?: boolean;
  chat: boolean;
  share: boolean;
  loading: boolean;
  user: boolean;
  toast: boolean;
  log: boolean;
  workshop: boolean;
  realtime: boolean;
  voice: boolean;
  chatStableIds?: boolean;
  drawStatus?: boolean;
  audio?: boolean;
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`这些值在一次运行中可以当作静态能力使用。不要把它当作 quota / 余额 / 模型列表；
需要模型列表时用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/models`,children:(0,n.jsx)(r.code,{children:`dzmm.models.list()`})}),`，
需要处理余额不足时 catch `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`kv`}),` 只表示基础 `,(0,n.jsx)(r.code,{children:`get / put / delete`}),`。使用 `,(0,n.jsx)(r.code,{children:`batchGet / batchPut`}),` 前检查
`,(0,n.jsx)(r.code,{children:`kvBatch`}),`，使用 `,(0,n.jsx)(r.code,{children:`list`}),` 前检查 `,(0,n.jsx)(r.code,{children:`kvList`}),`，使用 `,(0,n.jsx)(r.code,{children:`putIfAbsent`}),` 前检查 `,(0,n.jsx)(r.code,{children:`kvPutIfAbsent === true`}),`；不要从 `,(0,n.jsx)(r.code,{children:`kv: true`}),` 推断高级 KV
方法可用。同理，`,(0,n.jsx)(r.code,{children:`draw`}),` 只表示 `,(0,n.jsx)(r.code,{children:`draw.generate()`}),`：调用 `,(0,n.jsx)(r.code,{children:`draw.edit()`}),` 前检查
`,(0,n.jsx)(r.code,{children:`drawEdit`}),`，调用 `,(0,n.jsx)(r.code,{children:`draw.download()`}),` / `,(0,n.jsx)(r.code,{children:`draw.nav()`}),` 前检查 `,(0,n.jsx)(r.code,{children:`drawPresentation`}),`；
这两个字段在旧 Host 上可能缺失，缺失时按不可用处理。声明为 `,(0,n.jsx)(r.code,{children:`false`}),` 的能力
对应的普通网络调用会被 Host 拒绝（`,(0,n.jsx)(r.code,{children:`INVALID_REQUEST`}),`）。日志会静默丢弃，音频则返回播放结果，见各自章节。新版 Host 会在既有 ready 握手中直接附带能力；SDK 识别到没有该字段的
旧 Host 时直接返回保守值，不会发送旧 Host 不认识的探测 RPC。不同 Web、App、Workbench 和 CLI 宿主的版本与能力可能不同；不要用设备类型或 `,(0,n.jsx)(r.code,{children:`environment`}),` 推断能力。只有 `,(0,n.jsx)(r.code,{children:`chatStableIds`}),` 为 `,(0,n.jsx)(r.code,{children:`true`}),` 时，才把 `,(0,n.jsx)(r.code,{children:`chat.insert()`}),` 返回的 message id
长期保存为复杂分支后的剧情存档点。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`drawStatus`}),` 表示宿主支持用 taskId 取重新签名的图片地址
（`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/draw`,children:(0,n.jsx)(r.code,{children:`dzmm.draw.status()`})}),`）。
存档里存的是 taskId 时，渲染前检查这一位；缺失或为 `,(0,n.jsx)(r.code,{children:`false`}),` 时显示占位图并提供重新生成入口。本会话刚生成的签名 URL 可以临时展示，但会过期，不能改回持久化 URL。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`log`}),` 表示宿主会把 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/log`,children:(0,n.jsx)(r.code,{children:`dzmm.log.*`})}),` 转交作者的运行面板。
`,(0,n.jsx)(r.code,{children:`workshop`}),` 对应`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/workshop`,children:`作品工坊`}),`；不代表玩家已通过内容审核或有发布额度。
`,(0,n.jsx)(r.code,{children:`realtime`}),` / `,(0,n.jsx)(r.code,{children:`voice`}),` 分别控制`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/realtime`,children:`联机房间和房间语音`}),`；`,(0,n.jsx)(r.code,{children:`realtimeAuthority`}),` 为 `,(0,n.jsx)(r.code,{children:`true`}),` 时才能进运行 `,(0,n.jsx)(r.code,{children:`rt/server.js`}),` 的权威房间，为 `,(0,n.jsx)(r.code,{children:`false`}),` 时写了服务器逻辑的游戏应退回单人。`,(0,n.jsx)(r.code,{children:`dzmm.rt`}),` / `,(0,n.jsx)(r.code,{children:`dzmm.voice`}),` 始终存在，不能用 `,(0,n.jsx)(r.code,{children:`if (dzmm.rt)`}),` 判断是否可用。
`,(0,n.jsx)(r.code,{children:`audio`}),` 表示支持平台音量设置与音频资源代理；音频实际在 iframe 内播放，仍需处理浏览器的手势限制与 `,(0,n.jsx)(r.code,{children:`{ ok, reason }`}),` 结果。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};