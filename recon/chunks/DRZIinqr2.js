(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`37f72c63-d4d2-415a-a33a-b6a4c29a67f0`,e._sentryDebugIdIdentifier=`sentry-dbid-37f72c63-d4d2-415a-a33a-b6a4c29a67f0`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`分享游戏 & 启动参数 — `,(0,n.jsx)(r.code,{children:`dzmm.share`}),` / `,(0,n.jsx)(r.code,{children:`dzmm.getLaunchParams`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：这是一对"对称"的能力。你的游戏可以`,(0,n.jsx)(r.strong,{children:`生成`}),`一个分享链接（`,(0,n.jsx)(r.code,{children:`dzmm.share`}),`），玩家把它发给朋友；朋友点链接进来后，你的游戏能`,(0,n.jsx)(r.strong,{children:`读到`}),`链接里带的参数（`,(0,n.jsx)(r.code,{children:`dzmm.getLaunchParams`}),`）。常见玩法：邀请好友、对战口令、分享自己捏的关卡 / 角色、组队码。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. 两个参数：`,(0,n.jsx)(r.code,{children:`from`}),` 和 `,(0,n.jsx)(r.code,{children:`gp`})]}),`
`,(0,n.jsx)(r.p,{children:`链接里能带两样东西：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`参数`}),(0,n.jsx)(r.th,{children:`谁填`}),(0,n.jsx)(r.th,{children:`含义`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`from`})}),(0,n.jsx)(r.td,{children:`生成分享链接时由平台填写`}),(0,n.jsx)(r.td,{children:`邀请人的玩家 id，用来做归因。收到的 URL 可被修改，不能把它当成已验证身份。`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gp`})}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`你自己填`})}),(0,n.jsxs)(r.td,{children:[`game params —— 你定义的不透明字符串。平台原样透传，不解析。要塞结构化数据自己 `,(0,n.jsx)(r.code,{children:`JSON.stringify`}),`（上限 1024 字符）。`]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 读取启动参数（朋友点进来这一侧）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { from, gp } = await dzmm.getLaunchParams();
// 直接打开游戏（不是从分享链接进来）→ from 和 gp 都是 null
`})}),`
`,(0,n.jsxs)(r.p,{children:[`⚠️ `,(0,n.jsxs)(r.strong,{children:[`只在游戏启动时读一次，并立刻存到 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),`。`]}),` 平台读取后会把 `,(0,n.jsx)(r.code,{children:`from`}),` / `,(0,n.jsx)(r.code,{children:`gp`}),` 从 URL 上清掉（避免切换聊天时参数残留、串台），刷新页面就拿不到了。需要长期记住就自己落库。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`async function bootstrapInvite() {
  const { from, gp } = await dzmm.getLaunchParams();
  if (!from && !gp) return; // 普通打开，不是邀请进来的

  // Persist only the context needed after reload.
  if (from) await dzmm.kv.put('__invited_by', from, { flush: true });

  if (gp) {
    if (typeof gp !== 'string' || gp.length > 1024) return;
    let payload;
    try { payload = JSON.parse(gp); }
    catch { return; }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
      || typeof payload.roomId !== 'string'
      || !/^[A-Za-z0-9_-]{1,64}$/.test(payload.roomId)) return;
    await dzmm.kv.put('__invite_gp', { roomId: payload.roomId }, { flush: true });
    startBattle(payload.roomId);
  }
}
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`平台已自动给"通过别人链接进来"打了埋点（首次、且不是自己邀自己），你不用自己上报归因。`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`from`}),` / `,(0,n.jsx)(r.code,{children:`gp`}),` 都来自链接，先限制长度、解析并验证字段，再参与游戏流程。邀请奖励、房间权限和付费资格必须在服务端验证；不能因 URL 带着某个 id 就发奖或授权。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 生成分享链接（分享这一侧）`}),`
`,(0,n.jsx)(r.h3,{children:`形态一：弹平台分享面板（默认，最省事）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.share({
  params: JSON.stringify({ roomId: 'abc123' }), // 可选：对方用 getLaunchParams 读回
  text: '来和我组队！',                          // 可选：分享面板上的文案
  // mode: 'sheet' 是默认值，可省略
});
`})}),`
`,(0,n.jsx)(r.p,{children:`会弹出 DZMM 的分享面板（含"复制链接"），玩家自己选怎么发。`}),`
`,(0,n.jsx)(r.h3,{children:`形态二：只要 url，自己处理`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { url } = await dzmm.share({
  params: JSON.stringify({ roomId: 'abc123' }),
  mode: 'url',
});
renderQRCode(url); // 自己画二维码 / 自定义 UI / 复制按钮
// url 形如：https://站点/chat?card=<卡id>&from=<我的id>&gp=<params>
`})}),`
`,(0,n.jsxs)(r.p,{children:[`返回值 `,(0,n.jsx)(r.code,{children:`{ url, shared }`}),`：`,(0,n.jsx)(r.code,{children:`url`}),` 是最终链接；`,(0,n.jsx)(r.code,{children:`shared`}),` 在 `,(0,n.jsx)(r.code,{children:`mode: 'sheet'`}),` 弹出面板后为 `,(0,n.jsx)(r.code,{children:`true`}),`，`,(0,n.jsx)(r.code,{children:`mode: 'url'`}),` 时为 `,(0,n.jsx)(r.code,{children:`false`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. ⚠️ 关键：朋友点进来回到的是他自己的存档`}),`
`,(0,n.jsxs)(r.p,{children:[`游戏会话已`,(0,n.jsx)(r.strong,{children:`单例化`}),` —— 同一玩家 + 同一张游戏卡只有一个存档。朋友点你的分享链接进来，回到的是`,(0,n.jsx)(r.strong,{children:`他自己在这张卡的那个会话`}),`（第一次进则新建），`,(0,n.jsx)(r.strong,{children:`不是`}),`你的存档，也不是每次都新开一个空档。所以：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`✅ 适合传"轻量上下文"：房间号、口令、关卡 id、邀请人 —— 让对方进来后据此跳到对应玩法。`}),`
`,(0,n.jsxs)(r.li,{children:[`❌ 不要指望用 `,(0,n.jsx)(r.code,{children:`gp`}),` 把"你的完整存档"塞给对方。要分享存档内容得自己设计：比如把存档放到服务端函数的 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),`，`,(0,n.jsx)(r.code,{children:`gp`}),` 里只带一个 id 让对方去拉。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 错误处理`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  await dzmm.share({ params: bigString });
} catch (e) {
  if (e.code === 'VALUE_TOO_LARGE') {
    // params 超过 1024 字符：精简载荷，或只传一个 id 让对方去服务端拉完整数据
  } else if (e.code === 'INVALID_REQUEST') {
    // 当前环境不支持分享（如 Workbench dev 预览）。属正常。
  }
}
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`Workbench 预览（dev）下 `,(0,n.jsx)(r.code,{children:`share()`}),` 会抛 `,(0,n.jsx)(r.code,{children:`INVALID_REQUEST`}),` —— 分享面板只在玩家真实游玩的页面里才有，这是预期。调试 `,(0,n.jsx)(r.code,{children:`getLaunchParams()`}),` 的解析逻辑时，可以先在代码里写死一个假的 `,(0,n.jsx)(r.code,{children:`gp`}),` 跑通流程。`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};