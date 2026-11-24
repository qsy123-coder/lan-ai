(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6b9b9954-31e0-4f5e-a6e9-3518dc8bf325`,e._sentryDebugIdIdentifier=`sentry-dbid-6b9b9954-31e0-4f5e-a6e9-3518dc8bf325`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={code:`code`,h1:`h1`,li:`li`,p:`p`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`model-picker`}),`
`,(0,n.jsxs)(r.p,{children:[`用于游戏自己展示模型选择 UI。没有可见选择器时，不需要调用 `,(0,n.jsx)(r.code,{children:`dzmm.models.list()`}),`，直接传
`,(0,n.jsx)(r.code,{children:`model: 'default'`}),`；由当前 GameFy Chat 的模型设置决定。Workbench 预览挂在隐藏的开发会话上，
模型解析与玩家链路一致，同样读取该会话的模型设置。`]}),`
`,(0,n.jsx)(r.p,{children:`核心规则：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`不硬编码短模型名`}),`
`,(0,n.jsxs)(r.li,{children:[`可见选择器使用动态 `,(0,n.jsx)(r.code,{children:`models`}),` 列表，`,(0,n.jsx)(r.code,{children:`defaultModel`}),` 只用于初始化 UI 选项`]}),`
`,(0,n.jsxs)(r.li,{children:[`UI 显示用 `,(0,n.jsx)(r.code,{children:`displayName`}),`，调用 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 用 `,(0,n.jsx)(r.code,{children:`internalName`})]}),`
`,(0,n.jsxs)(r.li,{children:[`模型列表获取失败时降级到 `,(0,n.jsx)(r.code,{children:`'default'`})]}),`
`,(0,n.jsx)(r.li,{children:`游戏自己的选择器不会修改平台的 Chat 模型设置`}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};