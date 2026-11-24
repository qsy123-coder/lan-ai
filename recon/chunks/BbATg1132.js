(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b68c2a99-7f14-4e7c-909f-e3291e2168f4`,e._sentryDebugIdIdentifier=`sentry-dbid-b68c2a99-7f14-4e7c-909f-e3291e2168f4`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`Bot 接入指南`}),`
`,(0,n.jsx)(r.p,{children:`这份文档覆盖 Bot 从创建到群内使用、触发、管理和下线的完整闭环。当前能力面向普通群聊；scenario 群聊不会展示 Add Bot 入口。`}),`
`,(0,n.jsx)(r.h2,{children:`闭环检查`}),`
`,(0,n.jsx)(r.p,{children:`上线前按这个顺序检查：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[`在创作者中心的 Bot 管理页填写名称、Webhook URL 和可见性，创建 Bot 并保存只展示一次的 `,(0,n.jsx)(r.code,{children:`API Token`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[`复制 `,(0,n.jsx)(r.code,{children:`Webhook Secret`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[`在普通群聊里，由群主或管理员通过输入框 `,(0,n.jsx)(r.code,{children:`+`}),` 面板添加 Bot。`]}),`
`,(0,n.jsx)(r.li,{children:`群内用户发送消息后，你的 Webhook 收到回调。`}),`
`,(0,n.jsxs)(r.li,{children:[`Bot 服务用 `,(0,n.jsx)(r.code,{children:`API Token`}),` 调用发送消息接口，把回复发回同一个 `,(0,n.jsx)(r.code,{children:`chatroom_id`}),`。`]}),`
`,(0,n.jsx)(r.li,{children:`需要下线时，群主或管理员在成员列表移出 Bot；开发者也可以在 Bot 详情页删除 Bot。`}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`创建 Bot`}),`
`,(0,n.jsxs)(r.p,{children:[`入口：`,(0,n.jsx)(r.code,{children:`/studio/bots`})]}),`
`,(0,n.jsxs)(r.p,{children:[`点击“创建 Bot”，填写名称、Webhook URL 和可见性。Webhook URL 必须是公网 `,(0,n.jsx)(r.code,{children:`https://`}),` 地址；平台会拒绝 localhost、内网地址和非 HTTPS 地址。创建成功后，平台会展示：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`API Token`}),`：调用 Bot HTTP API 时使用。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`API Token`}),` 只会完整展示一次。丢失后只能重新生成 `,(0,n.jsx)(r.code,{children:`API Token`}),`，旧 token 会立即失效。
`,(0,n.jsx)(r.code,{children:`Webhook Secret`}),` 可在 Bot 详情页查看和复制。`]}),`
`,(0,n.jsx)(r.h2,{children:`公开与私有`}),`
`,(0,n.jsx)(r.p,{children:`Bot 有两种可见性：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`状态`}),(0,n.jsx)(r.th,{children:`谁能在群里添加`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`公开`}),(0,n.jsx)(r.td,{children:`任意普通群聊的群主或管理员`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`私有`}),(0,n.jsx)(r.td,{children:`Bot 创建者本人，且自己必须是目标群的群主或管理员`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`因此，刚创建的私有 Bot 仍然可以由创建者添加到自己管理的群里测试；公开后才会出现在其他用户的 Add Bot 列表中。`}),`
`,(0,n.jsx)(r.h2,{children:`配置 Webhook`}),`
`,(0,n.jsx)(r.p,{children:`入口：Bot 详情页 -> 设置`}),`
`,(0,n.jsxs)(r.p,{children:[`创建时必须提供 Webhook URL；之后可在设置中更新。Webhook URL 必须是公网 `,(0,n.jsx)(r.code,{children:`https://`}),` 地址。平台会拒绝 localhost、内网地址和非 HTTPS 地址，避免请求打到私有网络。`]}),`
`,(0,n.jsx)(r.p,{children:`当 Bot 所在群聊产生新消息时，平台会向 Webhook URL 发送 POST 请求，body 使用 Telegram Update 兼容结构。请求头会携带：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-http`,children:`X-Telegram-Bot-Api-Secret-Token: <secret_token>
Content-Type: application/json
`})}),`
`,(0,n.jsx)(r.p,{children:`示例 payload：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "update_id": 123456,
  "message": {
    "message_id": "uuid-message-id",
    "chat": {
      "id": "uuid-chatroom-id",
      "type": "group",
      "title": "群聊名称"
    },
    "from": {
      "id": "uuid-user-id",
      "is_bot": false,
      "first_name": "用户昵称"
    },
    "date": 1780000000,
    "text": "用户消息"
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`你的服务应先校验 `,(0,n.jsx)(r.code,{children:`X-Telegram-Bot-Api-Secret-Token`}),`，再处理消息。Bot 创建时必须配置 Webhook。`]}),`
`,(0,n.jsx)(r.h2,{children:`添加到群聊`}),`
`,(0,n.jsxs)(r.p,{children:[`入口：普通群聊输入框 `,(0,n.jsx)(r.code,{children:`+`}),` 面板 -> Add Bot`]}),`
`,(0,n.jsx)(r.p,{children:`权限规则：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`群主、群管理员、平台 super admin 可以添加 Bot。`}),`
`,(0,n.jsx)(r.li,{children:`普通成员看不到 Add Bot 入口。`}),`
`,(0,n.jsx)(r.li,{children:`只有普通群聊支持；scenario 群聊不展示入口。`}),`
`,(0,n.jsx)(r.li,{children:`已添加的 Bot 会显示为已添加，不会重复加入或重复发送系统消息。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`添加成功后，Bot 会出现在成员列表中，群内会收到一条系统消息，在线客户端会实时刷新成员状态。`}),`
`,(0,n.jsx)(r.h2,{children:`接收消息并回复`}),`
`,(0,n.jsxs)(r.p,{children:[`收到 Webhook 后，用 `,(0,n.jsx)(r.code,{children:`API Token`}),` 调用发送消息接口：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-http`,children:`POST /api/bot/send-message
X-Bot-Token: <api_token>
Content-Type: application/json
`})}),`
`,(0,n.jsx)(r.p,{children:`请求体：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "chatroom_id": "uuid-chatroom-id",
  "content": "Hello from bot"
}
`})}),`
`,(0,n.jsx)(r.p,{children:`响应：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "ok": true,
  "result": {
    "message_id": "generated-message-id"
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`Bot 必须已经加入目标群聊，否则接口会返回 403。`,(0,n.jsx)(r.code,{children:`content`}),` 最大 10000 字符。`]}),`
`,(0,n.jsxs)(r.p,{children:[`如果发送接口返回 429 且响应体为 `,(0,n.jsx)(r.code,{children:`ok: false`}),`，这次消息没有发送成功。请降低发送频率，稍后由调用方按需重试；避免立即反复重试。`]}),`
`,(0,n.jsx)(r.h2,{children:`Telegram 兼容接口`}),`
`,(0,n.jsx)(r.p,{children:`如果你的服务已经按 Telegram Bot API 组织代码，也可以调用兼容路径：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-http`,children:`POST /api/bot/bot<api_token>/sendMessage
Content-Type: application/json
`})}),`
`,(0,n.jsx)(r.p,{children:`请求体：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "chat_id": "uuid-chatroom-id",
  "text": "Hello from a Telegram-compatible client"
}
`})}),`
`,(0,n.jsx)(r.p,{children:`图片消息使用：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-http`,children:`POST /api/bot/bot<api_token>/sendPhoto
Content-Type: application/json
`})}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "chat_id": "uuid-chatroom-id",
  "photo": "https://<your-storage-host>/storage/v1/object/public/<bucket>/<object>",
  "caption": "optional caption"
}
`})}),`
`,(0,n.jsx)(r.p,{children:`当前兼容接口只支持我方公共存储对象 URL，不支持第三方 URL 或 multipart 文件上传。第三方地址会被拒绝；请先把图片上传到我方存储并完成审核，再把返回的对象地址传给接口。`}),`
`,(0,n.jsx)(r.h2,{children:`置顶消息`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-http`,children:`POST /api/bot/pin-message
X-Bot-Token: <api_token>
Content-Type: application/json
`})}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "chatroom_id": "uuid-chatroom-id",
  "message_id": "message-id-to-pin"
}
`})}),`
`,(0,n.jsx)(r.p,{children:`Bot 必须在群内，且目标消息必须属于同一个群聊。`}),`
`,(0,n.jsx)(r.h2,{children:`管理和下线`}),`
`,(0,n.jsx)(r.p,{children:`群内管理：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`群主或管理员打开成员列表，可以把 Bot 移出群聊。`}),`
`,(0,n.jsx)(r.li,{children:`移出后，Bot 不再收到该群 Webhook，也不能向该群发送消息。`}),`
`,(0,n.jsx)(r.li,{children:`重新添加同一个 Bot 会恢复原 membership，不会产生重复成员记录。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`创作者管理：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`Bot 详情页可以更新名称、Webhook URL、可见性。`}),`
`,(0,n.jsxs)(r.li,{children:[`可以查看和复制 `,(0,n.jsx)(r.code,{children:`Webhook Secret`}),`，用于校验平台推送的 Webhook 请求。`]}),`
`,(0,n.jsxs)(r.li,{children:[`可以重新生成 `,(0,n.jsx)(r.code,{children:`API Token`}),`；旧 token 会立即失效。`]}),`
`,(0,n.jsx)(r.li,{children:`删除 Bot 会移出所有群聊、删除 Bot 记录和对应 auth 用户。此操作不可撤销。`}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`最小服务示例`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-ts`,children:`const API_TOKEN = process.env.DZMM_BOT_TOKEN!;
const SECRET_TOKEN = process.env.DZMM_BOT_SECRET!;

export async function handleWebhook(request: Request) {
  if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET_TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }

  const update = await request.json();
  const chatroomId = update.message?.chat?.id;
  const text = update.message?.text;

  if (!chatroomId || !text) {
    return Response.json({ ok: true });
  }

  await fetch('https://dzmm.io/api/bot/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bot-Token': API_TOKEN,
    },
    body: JSON.stringify({
      chatroom_id: chatroomId,
      content: \`收到：\${text}\`,
    }),
  });

  return Response.json({ ok: true });
}
`})}),`
`,(0,n.jsx)(r.h2,{children:`常见问题`}),`
`,(0,n.jsx)(r.h3,{children:`Add Bot 里看不到自己创建的 Bot`}),`
`,(0,n.jsx)(r.p,{children:`确认当前账号就是 Bot 创建者。如果 Bot 是私有的，只有创建者本人能看到。还要确认你在目标群里是群主或管理员。`}),`
`,(0,n.jsx)(r.h3,{children:`Webhook 没有收到消息`}),`
`,(0,n.jsx)(r.p,{children:`先检查 Bot 是否已经在目标群里，再检查 Webhook URL 是否是公网 HTTPS。平台会阻断 localhost、内网 IP 和 DNS 解析失败的目标。`}),`
`,(0,n.jsx)(r.h3,{children:`Bot 发送消息返回 403`}),`
`,(0,n.jsxs)(r.p,{children:[`目标 `,(0,n.jsx)(r.code,{children:`chatroom_id`}),` 不在 Bot 当前加入的群聊里，或 Bot 已被移出群聊。重新添加 Bot 后再调用。`]}),`
`,(0,n.jsx)(r.h3,{children:`Webhook Secret 应该看哪个 header`}),`
`,(0,n.jsxs)(r.p,{children:[`使用 `,(0,n.jsx)(r.code,{children:`X-Telegram-Bot-Api-Secret-Token`}),`。不要使用 `,(0,n.jsx)(r.code,{children:`X-Bot-Secret`}),`；当前实现不会发送这个 header。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(){return(0,n.jsx)(`div`,{className:`mx-auto max-w-3xl px-4 py-8 md:px-6 lg:py-12`,children:(0,n.jsx)(`article`,{className:`prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none`,children:(0,n.jsx)(i,{})})})}export{a as component};