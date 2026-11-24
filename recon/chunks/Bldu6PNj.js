(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`978828d5-a28a-4534-97be-da036f446a57`,e._sentryDebugIdIdentifier=`sentry-dbid-978828d5-a28a-4534-97be-da036f446a57`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={code:`code`,h1:`h1`,li:`li`,p:`p`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`completions-safe`}),`
`,(0,n.jsxs)(r.p,{children:[`用于所有 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 调用：防重复点击、用本地 deadline 收口挂起请求、统一处理 SDK / 平台超时，并避免旧请求晚到覆盖新 UI。`]}),`
`,(0,n.jsx)(r.p,{children:`核心规则：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`一个任务开始后先禁用按钮或进入 busy 状态`}),`
`,(0,n.jsx)(r.li,{children:`用递增 request id，只让最后一次请求能更新 UI`}),`
`,(0,n.jsx)(r.li,{children:`recipe 级 cancel 只代表“忽略这次结果”，不承诺底层请求真实 abort`}),`
`,(0,n.jsx)(r.li,{children:`helper 默认创建 60 秒本地 deadline，也允许工厂或单次调用覆盖；到期后可以停止接收晚到结果并展示 fallback，但不会真实取消已经发出的付费请求`}),`
`,(0,n.jsx)(r.li,{children:`本地 deadline 后仍要保持该 helper 实例的付费 in-flight 锁，直到原请求真正 settle；否则玩家再次点击会与仍在运行的付费请求重叠`}),`
`,(0,n.jsxs)(r.li,{children:[`SDK / 平台主动抛出的 `,(0,n.jsx)(r.code,{children:`TIMEOUT`}),` 与本地 deadline 走同一分支；可配置固定文本 fallback，结构化 fallback 仍由唯一的业务 owner 生成`]}),`
`,(0,n.jsxs)(r.li,{children:[`catch `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),`、`,(0,n.jsx)(r.code,{children:`RATE_LIMITED`}),`、`,(0,n.jsx)(r.code,{children:`NETWORK_ERROR`}),`、`,(0,n.jsx)(r.code,{children:`TIMEOUT`}),` 并展示对应 UI 或确定性降级结果，不要在同一次用户动作里自动重试 AI`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 默认只发送一次请求，不会因为响应丢失而静默重放旧函数。只有调用方显式传入 `,(0,n.jsx)(r.code,{children:`{ retry: true }`}),` 才会对可信、可恢复的基础设施错误再尝试一次；该选项只能用于幂等函数，或已经用稳定 action ID 和服务端 reservation/result 状态机去重的函数。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ai-json`}),`、对话记忆、图片流水线都应该复用这个基础，而不是各写一套竞态控制。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};