(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b18b2b6b-308c-4f9a-882d-4b0649e8f705`,e._sentryDebugIdIdentifier=`sentry-dbid-b18b2b6b-308c-4f9a-882d-4b0649e8f705`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`玩家提示 — `,(0,n.jsx)(r.code,{children:`dzmm.toast.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：Toast 是页面右上角弹出来的一行小提示（"保存成功"那种）。`,(0,n.jsx)(r.code,{children:`dzmm.toast.*`}),` 让你的游戏代码直接调起 DZMM 主站的 toast 组件，不用自己写。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 四种级别`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`dzmm.toast.success('保存成功');
dzmm.toast.error('没有更多角色卡了');
dzmm.toast.warning('能量值不足');
dzmm.toast.info('正在生成图片，预计 30 秒');
`})}),`
`,(0,n.jsxs)(r.p,{children:[`仅这 4 个 level：`,(0,n.jsx)(r.code,{children:`'success' | 'error' | 'warning' | 'info'`}),`。`]}),`
`,(0,n.jsx)(r.p,{children:`不同 level 颜色 / 图标不同，能让玩家一眼看出严重程度。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 特性`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`返回 `,(0,n.jsx)(r.code,{children:`Promise<void>`}),`，内部吞掉发送错误，正常调用不会 reject。可以直接调用，但 `,(0,n.jsx)(r.code,{children:`await`}),` 完成不代表玩家已经看到提示，也不能当成存档或业务操作成功的确认。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`message`}),` 上限 500 字符，超过会被截断。`]}),`
`,(0,n.jsx)(r.li,{children:`同一时刻 DZMM 主站会管理 toast 队列，不会把屏幕铺满。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. ⚠️ 重要：不要把 SDK 错误手动转 toast`}),`
`,(0,n.jsxs)(r.p,{children:[`所有 `,(0,n.jsx)(r.code,{children:`DzmmError`}),` 平台都会自动 toast 给玩家（已按玩家语言本地化）。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ❌ 错误：会出现两条相同的 toast
try {
  await dzmm.draw.generate(...);
} catch (e) {
  dzmm.toast.error(e.message); // 平台已经 toast 了，你再 toast 一次就出现两条
}

// ✅ 正确：catch 只决定要不要重试 / 引导
try {
  await dzmm.draw.generate(...);
} catch (e) {
  if (e.code === 'QUOTA_EXHAUSTED') {
    showVipUpsell(); // 业务引导，不是 toast
  }
  // 其它错误：什么都不做，平台已经自动 toast
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.toast.*`}),` 的正确用途是"业务级事件"，比如：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`玩家完成了一关：`,(0,n.jsx)(r.code,{children:`dzmm.toast.success('过关！')`})]}),`
`,(0,n.jsxs)(r.li,{children:[`玩家的某个动作不满足条件：`,(0,n.jsx)(r.code,{children:`dzmm.toast.warning('能量不足，去主城休息')`})]}),`
`,(0,n.jsxs)(r.li,{children:[`游戏状态变化：`,(0,n.jsx)(r.code,{children:`dzmm.toast.info('新角色已解锁')`})]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`不是用来转 SDK 错误的。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 写作建议`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`简短：toast 不是 dialog，一行字能说清楚就行。"保存成功"比"游戏数据已经被保存到云端"好。`}),`
`,(0,n.jsx)(r.li,{children:`有指引：error toast 最好告诉玩家"接下来该做什么"。`}),`
`,(0,n.jsxs)(r.li,{children:[`慎用 error：玩家看到红色 toast 就紧张。日常状态变化用 `,(0,n.jsx)(r.code,{children:`info`}),` 更友好。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 不需要错误处理`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ✓ 直接调，不用 try/catch
dzmm.toast.success('保存成功');

// ❌ 多余
try { dzmm.toast.success('保存成功'); } catch (e) {} // 永远不会进 catch
`})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};