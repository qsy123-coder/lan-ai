(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8ad58979-6fc3-48a7-a0de-4188320338ec`,e._sentryDebugIdIdentifier=`sentry-dbid-8ad58979-6fc3-48a7-a0de-4188320338ec`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`玩家信息 — `,(0,n.jsx)(r.code,{children:`dzmm.user.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`新手提示：拿到当前玩家是谁（ID / 昵称 / 头像），用来个性化游戏体验（"欢迎回来，Alice！"）。如果你的游戏有自己的后端服务（少见），还能拿到一个 JWT token 让后端验证玩家身份。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. 获取玩家信息 — `,(0,n.jsx)(r.code,{children:`user.info()`})]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { id, name, avatarUrl, token } = await dzmm.user.info();

document.getElementById('player-name').textContent = name || '玩家';
if (avatarUrl) {
  document.getElementById('player-avatar').src = avatarUrl;
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  id: string | null;         // 玩家唯一 ID（UUID）
  name: string | null;       // 玩家昵称
  avatarUrl: string | null;  // 玩家头像 URL
  token: string | null;      // 平台签发的 JWT（RS256），有效期 30 分钟
  environment?: 'dev' | 'prod'; // 当前运行环境：Workbench 预览是 'dev'，玩家游玩是 'prod'
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`所有字段都可能是 `,(0,n.jsx)(r.code,{children:`null`}),`，写代码时务必处理空值。`]}),`
`,(0,n.jsx)(r.h3,{children:`不同模式下的差异`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`模式`}),(0,n.jsx)(r.th,{children:`返回值`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`开发模式（Workbench 预览）`}),(0,n.jsxs)(r.td,{children:[`返回你自己的真实信息和真实 token；`,(0,n.jsx)(r.code,{children:`environment`}),` 是 `,(0,n.jsx)(r.code,{children:`'dev'`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`生产模式（玩家游玩）`}),(0,n.jsxs)(r.td,{children:[`返回当前玩家的真实信息和 token；`,(0,n.jsx)(r.code,{children:`environment`}),` 是 `,(0,n.jsx)(r.code,{children:`'prod'`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`未登录用户`}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`id`}),` / `,(0,n.jsx)(r.code,{children:`name`}),` / `,(0,n.jsx)(r.code,{children:`avatarUrl`}),` / `,(0,n.jsx)(r.code,{children:`token`}),` 都是 `,(0,n.jsx)(r.code,{children:`null`})]})]})]})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`开发模式现在也签发真实 RS256 token。`,(0,n.jsx)(r.code,{children:`token === null`}),` 只代表"未登录或签发失败"，不能用来判断是不是开发模式；判断环境的官方方法是读这里的 `,(0,n.jsx)(r.code,{children:`environment`}),` 字段，或 `,(0,n.jsx)(r.code,{children:`(await dzmm.capabilities.get()).environment`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. JWT Token：什么时候用？`}),`
`,(0,n.jsxs)(r.p,{children:[`绝大多数游戏不需要用 token —— 你的游戏所有数据都通过 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` / `,(0,n.jsx)(r.code,{children:`dzmm.chat`}),` 走平台数据库，平台自动鉴权。`]}),`
`,(0,n.jsxs)(r.p,{children:[`只有少数情况下需要：你的游戏有自己的后端服务，需要验证"是不是真的 DZMM 玩家"。这种场景非常少见，通常用`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),`就能解决，不用搭自己的后端。`]}),`
`,(0,n.jsx)(r.p,{children:`如果你确实有自己后端：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 前端：把 token 发给你的后端
const { token } = await dzmm.user.info();
if (!token) throw new Error('DZMM login token is unavailable');
fetch('https://your-game-server.com/api/login', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${token}\` },
});
`})}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 后端（Node.js）：拿 JWKS 公钥验签
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://www.dzmm.ai/api/gamefy/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(err, key?.getPublicKey());
  });
}

const EXPECTED_GAME_ID = '你的 game ID';
jwt.verify(token, getKey, {
  algorithms: ['RS256'],
  issuer: 'dzmm-gamefy',
  audience: EXPECTED_GAME_ID,
}, (err, decoded) => {
  if (err) return res.status(401).json({ error: 'Invalid token' });
  // decoded.sub = 玩家 ID, decoded.name = 玩家昵称, decoded.avatar_url = 玩家头像 URL（可能为 null）
});
`})}),`
`,(0,n.jsx)(r.h3,{children:`Token 注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`有效期 30 分钟，过期后调 `,(0,n.jsx)(r.code,{children:`dzmm.user.info()`}),` 再拿一个新的。`]}),`
`,(0,n.jsx)(r.li,{children:`不要写进 KV / chat / console.log。开发模式 console 会被转发到 Workbench 控制台，token 会暴露给所有看 Console 的人。`}),`
`,(0,n.jsx)(r.li,{children:`token 是 RS256 JWT，对称密钥不能用于验签，必须用公钥（见下面）。`}),`
`,(0,n.jsxs)(r.li,{children:[`必须校验 `,(0,n.jsx)(r.code,{children:`audience`}),` 等于当前游戏 ID；只验签名和 issuer 会让另一个游戏签发的有效 token 被跨游戏重放。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. 获取 JWKS 公钥 — `,(0,n.jsx)(r.code,{children:`user.jwks()`})]}),`
`,(0,n.jsx)(r.p,{children:`平台用 JWKS（JSON Web Key Set）发布验证 token 用的 RSA 公钥。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const jwks = await dzmm.user.jwks();
// {
//   keys: [
//     { kty: 'RSA', alg: 'RS256', use: 'sig', kid: '...', n: '...', e: '...' }
//   ]
// }
`})}),`
`,(0,n.jsx)(r.h3,{children:`在前端用不上`}),`
`,(0,n.jsx)(r.p,{children:`99% 情况下前端不需要自己拿 JWKS。这是给你的后端用的（验签）。`}),`
`,(0,n.jsxs)(r.p,{children:[`后端验签的标准做法是直接调 well-known 端点（见上面 Node.js 示例的 `,(0,n.jsx)(r.code,{children:`jwksUri`}),`），不是经过 SDK 转发。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.user.jwks()`}),` 主要是给"想在浏览器内做轻量 token 内省"的场景，普通游戏用不到。`]}),`
`,(0,n.jsx)(r.h3,{children:`注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`开发模式也签发真实 RS256 token，验签用的公钥同样通过 JWKS 发布，dev / prod 用同一套验签流程。`}),`
`,(0,n.jsx)(r.li,{children:`公钥缓存 1 小时，密钥轮换时预留缓存刷新窗口。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 实用模式`}),`
`,(0,n.jsx)(r.h3,{children:`优雅地处理"未登录玩家"`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`async function initPlayer() {
  const { id, name } = await dzmm.user.info();
  if (!id) {
    // 未登录，给个友好提示，让玩家先登录
    showLoginPrompt();
    return false;
  }
  greetingEl.textContent = \`欢迎回来，\${name || '玩家'}！\`;
  return true;
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`个性化打招呼`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { name } = await dzmm.user.info();
await dzmm.completions(
  {
    model: 'default',
    messages: [
      {
        role: 'user',
        content: \`请用友好的语气向玩家 \${name || '陌生人'} 打招呼。\`,
      },
    ],
  },
  (content) => {
    greetingEl.textContent = content; // 回调是截至当前的累计全文
  },
);
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ 不要把玩家 `,(0,n.jsx)(r.code,{children:`id`}),` 明文写进 prompt 或 console.log，泄漏隐私。`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};