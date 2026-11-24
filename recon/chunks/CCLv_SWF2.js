(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cb2affca-48d4-45f6-9f59-c6d10ffc8ca4`,e._sentryDebugIdIdentifier=`sentry-dbid-cb2affca-48d4-45f6-9f59-c6d10ffc8ca4`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,code:`code`,h1:`h1`,h2:`h2`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`作品工坊 — `,(0,n.jsx)(r.code,{children:`dzmm.workshop.*`})]}),`
`,(0,n.jsx)(r.p,{children:`把玩家选定的 AI 角色或作品发布到当前游戏的共享作品列表，供其他玩家浏览和收藏。它与作者发布游戏代码、上架角色卡是不同功能。`}),`
`,(0,n.jsxs)(r.p,{children:[`先检查 `,(0,n.jsx)(r.code,{children:`(await dzmm.capabilities.get()).workshop === true`}),`，再显示入口。CLI 本地宿主不支持作品工坊；其他宿主以能力旗标为准。能力可用不代表有发布额度或一定通过内容审核，调用仍须处理错误。`]}),`
`,(0,n.jsx)(r.h2,{children:`1. 发布作品`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const task = await dzmm.draw.generate({ prompt: 'anime knight', dimension: '2:3' });
// Publish only after the player explicitly confirms the selected result.
const item = await dzmm.workshop.publish({
  image: { taskId: task.taskId, index: 0 },
  roleName: 'Forest knight',
  attributes: { class: 'knight', level: 1 },
  background: 'A traveller guarding the forest.',
  tag: 'knight',
});
`})}),`
`,(0,n.jsx)(r.p,{children:`图片必须引用当前玩家自己的绘图任务；不能传任意 URL 或别人的 taskId。任务要已有可用图片，发布前让玩家确认，不要在每次生成完成后自动投稿。请求会经过权限、额度和内容检查。`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`字段`}),(0,n.jsx)(r.th,{children:`要求`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`image.taskId`})}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`draw.generate / edit`}),` 返回的任务 UUID`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`image.index`})}),(0,n.jsx)(r.td,{children:`从 0 开始，0–31，默认 0；还须对应实际存在的图片`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`roleName`})}),(0,n.jsx)(r.td,{children:`去掉首尾空白后 1–120 字符`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`attributes`})}),(0,n.jsxs)(r.td,{children:[`可选，严格 JSON 对象，默认 `,(0,n.jsx)(r.code,{children:`{}`}),`；最多 32 KiB、128 个顶层 key、2048 节点、16 层`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`background`})}),(0,n.jsx)(r.td,{children:`可选，最多 12,000 字符，默认空字符串`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`tag`})}),(0,n.jsx)(r.td,{children:`可选，去掉首尾空白后 1–64 字符`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`不要把签名图片 URL、函数、循环引用、原型相关 key 或大段资源写进 `,(0,n.jsx)(r.code,{children:`attributes`}),`。整个投稿请求最多 128 KiB。`]}),`
`,(0,n.jsx)(r.h2,{children:`2. 浏览和分页`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const first = await dzmm.workshop.list({ limit: 20, tag: 'knight' });
renderItems(first.items);
if (first.nextCursor) {
  const next = await dzmm.workshop.list({ limit: 20, tag: 'knight', cursor: first.nextCursor });
  renderItems(next.items);
}

const mine = await dzmm.workshop.list({ mine: true });
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`list({ cursor?, limit?, tag?, mine? })`}),` 返回 `,(0,n.jsx)(r.code,{children:`{ items, nextCursor }`}),`。每页默认 20 项，范围 1–50；cursor 最长 512 字符，作为不透明值原样传回，保留原来的过滤条件。`,(0,n.jsx)(r.code,{children:`mine: true`}),` 读取当前玩家自己已发布与已下架的作品。`]}),`
`,(0,n.jsxs)(r.p,{children:[`每个 `,(0,n.jsx)(r.code,{children:`WorkshopItem`}),` 包含：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  id: string;
  imageUrl: string;
  roleName: string;
  attributes: Record<string, unknown>;
  background: string;
  tag: string | null;
  uploader: { id: string; name: string };
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
  status: 'published' | 'unlisted' | 'removed';
  createdAt: string;
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`把内容当作其他玩家提供的数据：渲染文字用 `,(0,n.jsx)(r.code,{children:`textContent`}),`，导入 `,(0,n.jsx)(r.code,{children:`attributes`}),` 前验证自己的存档 schema，不要拼接进 `,(0,n.jsx)(r.code,{children:`innerHTML`}),`。使用本次列表返回的图片地址，不把它当永久资源地址存档。`]}),`
`,(0,n.jsx)(r.h2,{children:`3. 收藏与下架`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const result = await dzmm.workshop.setLiked(item.id, true);
// Render the confirmed server state instead of incrementing locally.
renderLike(result.liked, result.likeCount);

await dzmm.workshop.setLiked(item.id, false);
await dzmm.workshop.unpublish(item.id);
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`setLiked(itemId, liked)`}),` 设置明确的收藏状态，重复设置同一状态是幂等的，返回 `,(0,n.jsx)(r.code,{children:`{ liked, likeCount }`}),`。`,(0,n.jsx)(r.code,{children:`unpublish(itemId)`}),` 返回 `,(0,n.jsx)(r.code,{children:`Promise<void>`}),`，只允许下架自己的作品；下架会隐藏发现入口，不会删除别人已导入的副本。`]}),`
`,(0,n.jsxs)(r.p,{children:[`这些方法失败时抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`。给投稿和收藏按钮加 loading、防重复，并在 `,(0,n.jsx)(r.code,{children:`finally`}),` 恢复按钮；额度、鉴权、内容检查失败时停止流程，使用稳定 `,(0,n.jsx)(r.code,{children:`error.code`}),` 分支，见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/errors`,children:`错误处理`}),`。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};