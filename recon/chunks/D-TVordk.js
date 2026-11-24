(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ee752844-b4cf-455a-8391-c7d769bb1ae5`,e._sentryDebugIdIdentifier=`sentry-dbid-ee752844-b4cf-455a-8391-c7d769bb1ae5`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`错误处理大全`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：普通 SDK API 通常抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`（开发模式与生产模式一致）；服务端函数 `,(0,n.jsx)(r.code,{children:`dzmm.fn.*`}),` 抛 `,(0,n.jsx)(r.code,{children:`RPCError`}),`（含 `,(0,n.jsx)(r.code,{children:`ctx.chat`}),` 的 `,(0,n.jsx)(r.code,{children:`chat_not_found`}),` 等小写 code）。两者都有稳定的 `,(0,n.jsx)(r.code,{children:`code`}),` 字段，兼容代码应优先按 `,(0,n.jsx)(r.code,{children:`error.code`}),` 分支，不要只按错误类或会随语言变化的 `,(0,n.jsx)(r.code,{children:`error.message`}),` 判断。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. `,(0,n.jsx)(r.code,{children:`DzmmError`}),` 是什么`]}),`
`,(0,n.jsxs)(r.p,{children:[`普通 SDK 方法（`,(0,n.jsx)(r.code,{children:`dzmm.completions / draw / chat / kv / user / models`}),`）失败时抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`，继承自 `,(0,n.jsx)(r.code,{children:`Error`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`class DzmmError extends Error {
  code: DzmmErrorCode;        // 稳定 SNAKE_CASE 枚举（用这个分支！）
  category:
    | 'validation'   // 用户输入问题
    | 'safety'       // 内容审查
    | 'quota'        // 额度 / 速率
    | 'auth'         // 登录态
    | 'network'      // 瞬时网络
    | 'server'       // 服务端故障
    | 'unknown';
  retryable: boolean;         // 以后再次请求是否可能成功，不代表应自动重试付费动作
  message: string;            // 已按玩家语言本地化
  rawCode?: string;           // 上游原始码（如果不在标准枚举内）
  serverStack?: string;       // 服务端 stack（调试用）
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.chat.*`}),` 在开发和生产环境都返回 `,(0,n.jsx)(r.code,{children:`DzmmError(code: 'CHAT_NOT_FOUND')`}),`。服务端函数中的 `,(0,n.jsx)(r.code,{children:`ctx.chat.*`}),` 才通过 `,(0,n.jsx)(r.code,{children:`dzmm.fn.*`}),` 返回 `,(0,n.jsx)(r.code,{children:`RPCError(code: 'chat_not_found')`}),`。跨浏览器／函数两条调用路径的公共错误处理应读取稳定 `,(0,n.jsx)(r.code,{children:`error.code`}),`，不要仅用 `,(0,n.jsx)(r.code,{children:`isDzmmError`}),` 过滤掉函数错误。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 自动 toast：你不 catch 也行`}),`
`,(0,n.jsxs)(r.p,{children:[`平台默认会自动 toast 这些错误的 `,(0,n.jsx)(r.code,{children:`message`}),` 给玩家（已本地化）。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 即使你这么写，玩家也会看到"积分不足"的 toast
await dzmm.draw.generate({ prompt: 'cat', dimension: '1:1' });
// （平台会弹 toast，但 Promise 仍会 reject；后面的代码不会继续执行）
`})}),`
`,(0,n.jsxs)(r.p,{children:[`自动 toast 不会吞掉异常。仍然要 `,(0,n.jsx)(r.code,{children:`try/catch`}),`（或显式 `,(0,n.jsx)(r.code,{children:`.catch()`}),`），否则会产生未处理的 Promise rejection。你的代码应该明确处理至少这几类错误：`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`错误类`}),(0,n.jsx)(r.th,{children:`你必须做点什么`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),` / `,(0,n.jsx)(r.code,{children:`VIP_REQUIRED`})]}),(0,n.jsx)(r.td,{children:`引导玩家充值 / 开通 VIP`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`UNAUTHORIZED`}),` / `,(0,n.jsx)(r.code,{children:`TOKEN_EXPIRED`})]}),(0,n.jsx)(r.td,{children:`停止后续请求，提示重新进入`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`SENSITIVE_CONTENT_DETECTED`})}),(0,n.jsx)(r.td,{children:`提示玩家换 prompt / 换图`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`RATE_LIMITED`}),` / `,(0,n.jsx)(r.code,{children:`NETWORK_ERROR`})]}),(0,n.jsx)(r.td,{children:`结束当前动作，提供稍后显式重试入口`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`其它`}),(0,n.jsx)(r.td,{children:`平台自动 toast，你不用做什么`})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 推荐 pattern`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  const result = await dzmm.draw.edit({
    prompt: '加上猫耳',
    images: [refImageDataUrl],
    model: 'pro',
  });
  showImage(result.images[0]);
} catch (e) {
  // 先用守卫，避免 e 不是 DzmmError 时读到 undefined
  if (!dzmm.errors.isDzmmError(e)) throw e;

  switch (e.code) {
    case 'IMAGE_TOO_LARGE':
    case 'IMAGE_DIMENSION_EXCEEDED':
    case 'UNSUPPORTED_IMAGE_FORMAT':
    case 'INVALID_IMAGE_DATA':
      showError('请换一张更小或更标准的参考图');
      break;
    case 'IMAGE_NOT_FOUND':
      showError('参考图已失效，请重新生成或选择');
      break;
    case 'SENSITIVE_CONTENT_DETECTED':
    case 'NON_ANIME_IMAGE_DETECTED':
      showError('提示词或图片包含敏感内容');
      break;
    case 'RATE_LIMITED':
      showRetryButton('请求太频繁，请稍后再次点击');
      break;
    case 'QUOTA_EXHAUSTED':
      showVipUpsell();
      break;
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      // 停止后续请求
      stopAllInflight();
      showError('请重新进入游戏');
      break;
    default:
      // 兜底：平台已自动 toast 本地化的 message，不用再做
      console.error('[edit error]', e.code, e.message);
  }
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 完整错误码字典`}),`
`,(0,n.jsx)(r.h3,{children:`4.1 validation — 用户输入问题（不可重试）`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`触发条件`}),(0,n.jsx)(`th`,{children:`建议`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`IMAGE_TOO_LARGE`})}),(0,n.jsx)(`td`,{children:`参考图 > 10MB`}),(0,n.jsx)(`td`,{children:`提示换小图`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`IMAGE_DIMENSION_EXCEEDED`})}),(0,n.jsx)(`td`,{children:`参考图任一边 > 8192px`}),(0,n.jsx)(`td`,{children:`提示缩小`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`UNSUPPORTED_IMAGE_FORMAT`})}),(0,n.jsx)(`td`,{children:`非 jpg / png / webp`}),(0,n.jsx)(`td`,{children:`提示换格式`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`INVALID_IMAGE_DATA`})}),(0,n.jsx)(`td`,{children:`data URL 解析失败 / magic-byte 嗅探未过`}),(0,n.jsx)(`td`,{children:`重新选图`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`IMAGE_NOT_FOUND`})}),(0,n.jsx)(`td`,{children:`edit 传入的图 URL 失效`}),(0,n.jsx)(`td`,{children:`重新生成或选择`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`INVALID_KIND`})}),(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`/draw/models?kind=`}),` 参数非法`]}),(0,n.jsx)(`td`,{children:`查代码`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`INVALID_REQUEST`})}),(0,n.jsxs)(`td`,{children:[`上游 4xx 兜底；`,(0,n.jsx)(`code`,{children:`BAD_REQUEST`}),` / `,(0,n.jsx)(`code`,{children:`VALIDATION_ERROR`}),` 别名也归这里`]}),(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`error.message`}),` 可直接显示给玩家`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`INVALID_REQUEST`}),`（`,(0,n.jsx)(`code`,{children:`rawCode: 'CONTEXT_TOO_LONG'`}),`）`]}),(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`dzmm.completions()`}),` 内容太长，模型放不下`]}),(0,n.jsxs)(`td`,{children:[`按 `,(0,n.jsx)(`a`,{href:`/studio/game-creation/workbench/help/sdk/completions#length-limits`,children:`AI 对话 · 长度限制与分段`}),` 缩短后让玩家重新点，原样重发还会失败`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`UNSUPPORTED_MODEL`})}),(0,n.jsx)(`td`,{children:`model 字段不在白名单`}),(0,n.jsx)(`td`,{children:`检查 model 字符串`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`IMAGE_EDIT_PROMPT_OR_TAGS_REQUIRED`})}),(0,n.jsx)(`td`,{children:`edit 没传 prompt 也没 tagIds`}),(0,n.jsx)(`td`,{children:`至少提供一个`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`IMAGE_URL_NOT_TRUSTED`})}),(0,n.jsx)(`td`,{children:`参考图 URL 不在受信任域`}),(0,n.jsx)(`td`,{children:`用 generate 结果或 base64`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`KEY_TOO_LONG`})}),(0,n.jsx)(`td`,{children:`batch / list / namespace KV key 或 prefix > 256 字符`}),(0,n.jsx)(`td`,{children:`用更短 key / prefix`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`VALUE_TOO_LARGE`})}),(0,n.jsx)(`td`,{children:`KV value 过大`}),(0,n.jsx)(`td`,{children:`拆分 / 压缩`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`KEY_NOT_FOUND`}),` / `,(0,n.jsx)(`code`,{children:`CHAT_NOT_FOUND`})]}),(0,n.jsx)(`td`,{children:`数据不存在`}),(0,n.jsx)(`td`,{children:`视场景处理`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`4.2 safety — 内容审查（不可重试，必须改输入）`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`触发条件`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`SENSITIVE_CONTENT_DETECTED`})}),(0,n.jsx)(`td`,{children:`提示词 / 图片命中审查`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`NON_ANIME_IMAGE_DETECTED`})}),(0,n.jsx)(`td`,{children:`edit 仅支持二次元风格`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`4.3 quota — 额度 / 速率`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`retryable`}),(0,n.jsx)(`th`,{children:`建议`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`RATE_LIMITED`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsx)(`td`,{children:`结束当前动作，等待玩家稍后明确再次触发`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`QUOTA_EXHAUSTED`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsx)(`td`,{children:`引导充值，绝不重试`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`VIP_REQUIRED`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsx)(`td`,{children:`引导开通 VIP`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`4.4 auth — 登录态`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`建议`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`UNAUTHORIZED`}),` / `,(0,n.jsx)(`code`,{children:`TOKEN_EXPIRED`})]}),(0,n.jsx)(`td`,{children:`触发重新登录提示，停止后续请求`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`FORBIDDEN`})}),(0,n.jsx)(`td`,{children:`提示无权限`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`4.5 network — 瞬时错误`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`retryable`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`NETWORK_ERROR`})}),(0,n.jsx)(`td`,{children:`✅`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`TIMEOUT`})}),(0,n.jsx)(`td`,{children:`✅`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`DRAW_TIMEOUT`})}),(0,n.jsx)(`td`,{children:`✅（绘图任务超 2 分钟）`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`这里的 `,(0,n.jsx)(r.code,{children:`retryable`}),` 表示以后再次请求可能成功。AI 和画图属于付费生成，当前动作仍然只调用一次；先用确定性结果收口，再给玩家显式重试入口。`]}),`
`,(0,n.jsx)(r.h3,{children:`4.6 server — 服务端兜底`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`retryable`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`CREATE_TASK_FAILED`})}),(0,n.jsx)(`td`,{children:`✅`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`NO_OUTPUT_IMAGES`})}),(0,n.jsx)(`td`,{children:`✅`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`INTERNAL_ERROR`})}),(0,n.jsx)(`td`,{children:`✅`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`SERVICE_UNAVAILABLE`})}),(0,n.jsx)(`td`,{children:`✅`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`4.7 unknown — 兜底`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`Code`}),(0,n.jsx)(`th`,{children:`建议`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`ABORTED`})}),(0,n.jsx)(`td`,{children:`宿主主动取消，不需要提示`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`UNKNOWN_ERROR`})}),(0,n.jsxs)(`td`,{children:[`信任 `,(0,n.jsx)(`code`,{children:`error.message`}),` 文案显示给玩家`]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`5. 服务端函数的错误：`,(0,n.jsx)(r.code,{children:`RPCError`})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 和 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invokeStream()`}),` 不抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`，抛的是 `,(0,n.jsx)(r.code,{children:`RPCError`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`class RPCError extends Error {
  code: string;
  source: 'user' | 'runtime';
  userStack?: string;
  retryable: boolean;
  retryAfterMs?: number;
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`框架错误通常是小写下划线（如 `,(0,n.jsx)(r.code,{children:`function_error`}),` / `,(0,n.jsx)(r.code,{children:`function_timeout`}),`），但 Provider 也可能透传大写或未来新增的错误码。`,(0,n.jsx)(r.code,{children:`error.code`}),` 会保留上游原字符串；按实际处理的 code 精确分支，其余走通用 fallback。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`source: 'user'`}),` 不能获得可信 runtime 身份，用户函数伪造 runtime-looking code 或 `,(0,n.jsx)(r.code,{children:`retryable: true`}),` 也无效。可信 `,(0,n.jsx)(r.code,{children:`source: 'runtime'`}),` 错误可能携带 `,(0,n.jsx)(r.code,{children:`retryAfterMs`}),`；unary `,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 默认只发送一次，只有显式 `,(0,n.jsx)(r.code,{children:`{ retry: true }`}),` 才允许最多一次基础设施重试；`,(0,n.jsx)(r.code,{children:`invokeStream()`}),` 不重试。`]}),`
`,(0,n.jsxs)(r.p,{children:[`详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/limits`,children:`服务端函数：限制与错误码`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 反模式（不要这么写）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ❌ message 文案随版本和语言变，不稳定
if (error.message.includes('quota')) { ... }

// ❌ 不要假设 error 一定是 DzmmError，先用守卫
if (error.code === 'IMAGE_TOO_LARGE') { ... } // error 可能是普通 Error，没 code

// ✓ 正确
if (dzmm.errors.isDzmmError(error) && error.code === 'IMAGE_TOO_LARGE') { ... }

// ❌ 把 SDK 错误手动 toast（平台已经 toast 了）
catch (e) { dzmm.toast.error(e.message); }

// ❌ 无限重试
while (true) { try { return await fn(); } catch (e) {} }

// ✓ 付费生成只调用一次；可恢复错误交给玩家明确再次触发
try { return await runGenerationOnce(); }
catch (e) {
  if (e.source !== 'runtime' || !e.retryable) throw e;
  showRetryButton();
  return useDeterministicFallback();
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`7. 工具函数：`,(0,n.jsx)(r.code,{children:`dzmm.errors.isDzmmError(e)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`类型守卫，判断 `,(0,n.jsx)(r.code,{children:`e`}),` 是不是 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`（继承自 `,(0,n.jsx)(r.code,{children:`Error`}),`，能读到 `,(0,n.jsx)(r.code,{children:`code`}),` / `,(0,n.jsx)(r.code,{children:`category`}),` / `,(0,n.jsx)(r.code,{children:`retryable`}),` 字段）：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  await dzmm.something();
} catch (e) {
  if (dzmm.errors.isDzmmError(e)) {
    // 安全访问 e.code / e.category / e.retryable
  } else {
    // 普通 Error（比如你代码里 throw new Error(...) 抛出来的）
    throw e;
  }
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 工作台保存超限`}),`
`,(0,n.jsx)(r.p,{children:`这是作者代码／素材的工作区保存失败，与游戏中玩家调用 SDK 的存档错误不同。先保留当前工作区并备份未保存文件，再按具体提示处理：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`提示`}),(0,n.jsx)(r.th,{children:`含义与处理`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`变更文件超过上限（512 个）`}),(0,n.jsxs)(r.td,{children:[`新增、修改、删除合计超限。工具依赖与缓存先按实际路径加入 `,(0,n.jsx)(r.code,{children:`.gitignore`}),`；需保存的素材备份后分批处理，确认前一批保存成功再继续。已保存过的工具文件不能只加忽略，需保留文件并联系支持处理`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单个文件超过上限（50 MiB）`}),(0,n.jsx)(r.td,{children:`提示会列出文件名和大小。先保留原件，再压缩、拆分或替换；分批保存不能解除单文件超限`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`大文件合计／保存传输内容过大（256 MiB，传输上限以实际提示为准）`}),(0,n.jsx)(r.td,{children:`排除可重建的工具依赖与缓存，保留需要的素材原件，再压缩或减少每批内容`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`保存超限时不会自动跳过文件；编辑器写入、上传或解压成功，也不代表已保存版本。不要反复重试、删除原件或重建工作区。完整限制、`,(0,n.jsx)(r.code,{children:`.gitignore`}),` 示例、只读检查和恢复步骤见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/limits#workspace-save`,children:`工作区保存`}),`。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};