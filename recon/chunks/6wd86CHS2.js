(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2beb1ea1-3203-49e7-9f3f-553bc893d16b`,e._sentryDebugIdIdentifier=`sentry-dbid-2beb1ea1-3203-49e7-9f3f-553bc893d16b`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`浏览器调用 — `,(0,n.jsx)(r.code,{children:`dzmm.fn.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：你的游戏 JS 通过 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 调一次性函数（拿完整结果），通过 `,(0,n.jsx)(r.code,{children:`dzmm.fn.invokeStream()`}),` 调流式函数（边算边收 chunk）。失败抛 `,(0,n.jsx)(r.code,{children:`RPCError`}),`（不是 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`），处理方式略有不同。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. 一次性：`,(0,n.jsx)(r.code,{children:`dzmm.fn.invoke(name, body, opts?)`})]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const result = await dzmm.fn.invoke('tarot', {
  question: '我会找到对的人吗？',
});

console.log(result.cards);   // { past: '...', present: '...', future: '...' }
console.log(result.reading); // 占卜词
`})}),`
`,(0,n.jsx)(r.h3,{children:`参数`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`参数`}),(0,n.jsx)(`th`,{children:`类型`}),(0,n.jsx)(`th`,{children:`必需`}),(0,n.jsx)(`th`,{children:`说明`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`name`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsxs)(`td`,{children:[`函数名（对应 `,(0,n.jsx)(r.code,{children:`functions/{name}.ts`}),`）`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`body`})}),(0,n.jsx)(`td`,{children:`any`}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsxs)(`td`,{children:[`任何可 JSON 序列化对象，作为 `,(0,n.jsx)(`code`,{children:`request.body`}),` 传给函数`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`opts`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`{ timeout?: number, retry?: boolean }`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsxs)(`td`,{children:[(0,n.jsx)(`code`,{children:`timeout`}),` 单位毫秒，默认 320_000；`,(0,n.jsx)(`code`,{children:`retry`}),` 默认 false。只有幂等或 reservation 保护的函数才可设为 true，允许一次可信基础设施重试`]})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsxs)(r.p,{children:[`函数 `,(0,n.jsx)(r.code,{children:`return`}),` 的任意 JSON 可序列化对象。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`2. 流式：`,(0,n.jsx)(r.code,{children:`dzmm.fn.invokeStream(name, body, opts?)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`返回 `,(0,n.jsx)(r.code,{children:`AsyncIterable`}),`，用 `,(0,n.jsx)(r.code,{children:`for await`}),` 消费：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const out = document.getElementById('out');
out.textContent = '';

try {
  for await (const chunk of dzmm.fn.invokeStream('storyteller', { prompt: '讲个故事' })) {
    out.textContent += chunk.delta; // chunk 是函数 yield 出来的对象
  }
} catch (e) {
  console.error('stream failed:', e.code, e.message);
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`chunk 结构由函数决定（不是平台规定）。函数 `,(0,n.jsx)(r.code,{children:`yield { delta: '...' }`}),`，浏览器就收 `,(0,n.jsx)(r.code,{children:`{ delta: '...' }`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`流中途出错`}),`
`,(0,n.jsxs)(r.p,{children:[`流式调用中途也可能失败（fn 超时、cordon 死掉、用户函数抛错）。`,(0,n.jsx)(r.code,{children:`for await`}),` 循环会 throw 一个 `,(0,n.jsx)(r.code,{children:`RPCError`}),`，已经收到的 chunk 不会丢：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let received = [];
try {
  for await (const c of dzmm.fn.invokeStream('flaky', body)) {
    received.push(c);
  }
  console.log('stream done, total chunks:', received.length);
} catch (e) {
  console.log('partial result:', received.length, 'chunks');
  console.log('then failed with:', e.code);
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`fn-runner 在能够继续写连接时会尽力发送最终 `,(0,n.jsx)(r.code,{children:`{ error: { code, message } }`}),` 帧，SDK 会把它转换成 throw。但网络断开、代理重置或客户端连接先消失时，服务端可能无法送达最终 error frame；调用方可能看到连接错误，极端情况下也可能只看到提前 EOF。`]}),`
`,(0,n.jsxs)(r.p,{children:[`已经收到的 chunk 必须始终当作 partial result。业务如果必须确认完整性，应让函数自己 `,(0,n.jsx)(r.code,{children:`yield { type: 'done' }`}),` 之类的应用层终止标记；没有收到该标记就按不完整处理，不能仅凭 `,(0,n.jsx)(r.code,{children:`for await`}),` 结束断言成功。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. `,(0,n.jsx)(r.code,{children:`RPCError`}),`：服务端函数的错误类型`]}),`
`,(0,n.jsxs)(r.p,{children:[`服务端函数失败时不抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`，抛 `,(0,n.jsx)(r.code,{children:`RPCError`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`class RPCError extends Error {
  code: string;           // fn runtime 多为小写；ctx.draw/completions 也可能透传大写上游码
  source: 'user' | 'runtime';  // 错的是用户代码还是平台
  message: string;
  userStack?: string;     // 函数内的 stack；生产调用也可能收到
  retryable: boolean;
  retryAfterMs?: number;
}
`})}),`
`,(0,n.jsx)(r.p,{children:`注意：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`fn runtime 自身的错误码通常是小写下划线（`,(0,n.jsx)(r.code,{children:`function_error`}),` / `,(0,n.jsx)(r.code,{children:`function_timeout`}),`）；`,(0,n.jsx)(r.code,{children:`ctx.completions`}),` / `,(0,n.jsx)(r.code,{children:`ctx.draw`}),` 还可能透传 `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),` 等大写上游码。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`retryable`}),` 只表示平台判断将来再次请求可能成功；部分限流/繁忙响应还会带 `,(0,n.jsx)(r.code,{children:`retryAfterMs`}),`，表示服务端建议等待的毫秒数。没有 `,(0,n.jsx)(r.code,{children:`DzmmError.category`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`source: 'user'`}),` 的错误不能获得可信 runtime 身份，即使用户函数伪造了 runtime-looking code 或 `,(0,n.jsx)(r.code,{children:`retryable: true`}),`。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 默认不重放；只有显式 `,(0,n.jsx)(r.code,{children:`{ retry: true }`}),` 才会对可信 `,(0,n.jsx)(r.code,{children:`source: 'runtime'`}),` 基础设施错误最多再尝试 1 次，并优先遵守 `,(0,n.jsx)(r.code,{children:`retryAfterMs`}),`。`,(0,n.jsx)(r.code,{children:`invokeStream()`}),` 不重试，避免重复交付已经收到的 chunk。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`userStack`}),` 当前在 dev 和 prod 都可能转发给浏览器。玩家能检查生产错误对象，不要在异常 message 或堆栈中包含凭证、个人数据、私有 prompt 等敏感信息。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 错误处理推荐 pattern`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  const r = await dzmm.fn.invoke('myFn', body);
  // 成功
} catch (e) {
  switch (e.code) {
    case 'function_error':
      // 函数里 throw 了，或代码有 bug
      console.error('fn 抛错:', e.message, e.userStack);
      showError(\`错误：\${e.message}\`);
      break;

    case 'function_timeout':
      // 函数跑超 5 分钟被砍
      showError('请求太复杂，请简化后重试');
      break;

    case 'function_not_published':
      // prod 模式调一个没保存过的函数
      showError('这个功能还没上线');
      break;

    case 'function_not_found':
      // dev 模式调一个不存在的函数（写错名字了）
      console.error('fn 不存在，检查 name 拼写');
      break;

    case 'unsupported_import':
      // 函数代码里有 import 语句，加载阶段被拒
      console.error('函数里不能 import');
      break;

    case 'runtime_busy':
    case 'cordon_dead':
    case 'fn_runner_unreachable':
      // 默认调用没有静默重放；结束当前动作，给玩家显式重试入口
      showRetryButton('服务暂时繁忙，请稍后再次点击');
      break;

    case 'too_many_requests':
      // 同游戏 / 同玩家并发太多
      showError('请稍等再操作');
      break;

    case 'quota_exceeded':
      // 函数内 ctx.completions / ctx.draw 调超了配额
      showError('额度不足，请稍后再试');
      break;

    case 'invocation_token_invalid':
      // 调用凭证过期 / 被撤销
      showError('请刷新页面重试');
      break;

    case 'response_too_large':
      // 函数返回值超大（非流 > 1 MiB / 流 > 10 MiB）
      console.error('fn 返回太大，需要优化');
      break;

    case 'chat_not_associated':
      // 函数没有关联的 chat（正常链路不会出现：预览挂在开发会话上，玩家链路有玩家 chat）
      console.warn('函数没有关联的 chat');
      break;

    case 'dev_container_inactive':
      // 开发模式调用但开发容器未运行（HTTP 409）
      console.warn('请先启动开发容器再预览调用函数');
      break;

    default:
      console.error('未知错误:', e.code, e.message);
      showError(e.message);
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`完整错误码字典见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/limits`,children:`限制与错误码`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 常见模式`}),`
`,(0,n.jsx)(r.h3,{children:`5.1 防重复点击 + loading`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let inflight = false;

async function onClickInvoke() {
  if (inflight) return;
  inflight = true;
  setBtn({ disabled: true, label: '处理中…' });
  try {
    const r = await dzmm.fn.invoke('myFn', body);
    showResult(r);
  } catch (e) {
    handleErr(e);
  } finally {
    inflight = false;
    setBtn({ disabled: false, label: '提交' });
  }
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`5.2 默认单次与显式 retry opt-in`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.fn.invoke()`}),` 默认只发送一次请求。响应丢失时，客户端无法知道服务端是否已经完成付费调用或副作用，因此老调用不能被无感重放。`]}),`
`,(0,n.jsxs)(r.p,{children:[`只有严格幂等的函数，或已接收稳定 action ID 并在服务端使用 reservation/result 状态机的函数，才可以显式传 `,(0,n.jsx)(r.code,{children:`{ retry: true }`}),`。此时可信 runtime 基础设施错误最多再尝试 1 次，并优先遵守 `,(0,n.jsx)(r.code,{children:`retryAfterMs`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.fn.invoke('reserved-action', { actionId, input }, { retry: true });
`})}),`
`,(0,n.jsx)(r.p,{children:`不要再套通用自动循环。付费或有副作用的函数最终失败后应结束当前动作并展示显式重试按钮；玩家再次操作时开始一个新的业务动作。`}),`
`,(0,n.jsxs)(r.p,{children:[`注意：`,(0,n.jsx)(r.code,{children:`function_error`}),` / `,(0,n.jsx)(r.code,{children:`quota_exceeded`}),` / `,(0,n.jsx)(r.code,{children:`function_not_published`}),` / `,(0,n.jsx)(r.code,{children:`invocation_token_invalid`}),` 不要重试，重试结果一样。`]}),`
`,(0,n.jsx)(r.h3,{children:`5.3 流式 + race condition 守卫`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let latestReq = 0;

async function regenStream() {
  const reqId = ++latestReq;
  let text = '';
  try {
    for await (const c of dzmm.fn.invokeStream('storyteller', { prompt })) {
      if (reqId !== latestReq) return; // 旧请求，丢弃
      text += c.delta ?? '';
      outputEl.textContent = text;
    }
  } catch (e) {
    if (reqId !== latestReq) return; // 旧请求出错也忽略
    showError(e.message);
  }
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`5.4 复用一个 fn 做多种操作`}),`
`,(0,n.jsxs)(r.p,{children:[`如果用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/writing`,children:`编写函数 §3.2`}),` 的 method dispatch 模式：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const player = {
  async getStats() {
    return await dzmm.fn.invoke('player', { method: 'getStats' });
  },
  async submitScore(score) {
    return await dzmm.fn.invoke('player', { method: 'submitScore', args: { score } });
  },
  async leaderboard() {
    return await dzmm.fn.invoke('player', { method: 'leaderboard' });
  },
};

// 用起来更顺手
const stats = await player.getStats();
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. dev vs prod 行为差异`}),`
`,(0,n.jsx)(r.p,{children:`模式是显式的：Workbench 预览挂在隐藏的开发会话上，走 dev 模式；玩家会话永远走 prod。不再由"容器是否存活"隐式决定。`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`场景`}),(0,n.jsx)(r.th,{children:`Workbench 预览（dev）`}),(0,n.jsx)(r.th,{children:`玩家会话（prod）`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`调一个新加的函数`}),(0,n.jsxs)(r.td,{children:[`✅ 实时读容器内 `,(0,n.jsx)(r.code,{children:`functions/*.ts`}),` / `,(0,n.jsx)(r.code,{children:`*.js`}),` 就跑`]}),(0,n.jsxs)(r.td,{children:[`❌ `,(0,n.jsx)(r.code,{children:`function_not_published`}),`，要先发布函数快照`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`改完 fn 代码`}),(0,n.jsx)(r.td,{children:`✅ 下次调立即生效`}),(0,n.jsx)(r.td,{children:`❌ 跑的是上次保存的版本`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`开发容器未运行`}),(0,n.jsxs)(r.td,{children:[`❌ 明确报错 `,(0,n.jsx)(r.code,{children:`dev_container_inactive`}),`（HTTP 409），提示先启动容器；不会静默降级到已发布快照`]}),(0,n.jsx)(r.td,{children:`不受影响，始终跑已发布快照`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`调用 `,(0,n.jsx)(r.code,{children:`console.log`})]}),(0,n.jsx)(r.td,{children:`输出到 fn-runner 服务日志（你看不到）`}),(0,n.jsx)(r.td,{children:`同上`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ctx.chat`})}),(0,n.jsx)(r.td,{children:`✅ 可用，读写开发会话的存档`}),(0,n.jsx)(r.td,{children:`✅ 读写玩家 chat 的存档`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`ctx.kv`}),` / `,(0,n.jsx)(r.code,{children:`ctx.kv.global`})]}),(0,n.jsx)(r.td,{children:`读写你自己的开发数据，与生产、与其他开发者都隔离`}),(0,n.jsx)(r.td,{children:`读写生产数据`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`玩家无论容器是否存活，都走 prod 已发布快照，你开着工作台改代码不会影响线上玩家。`}),`
`,(0,n.jsxs)(r.p,{children:[`dev 环境下函数 `,(0,n.jsx)(r.code,{children:`console.log`}),` 输出浏览器侧看不到。调试时建议：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`把要看的信息直接 `,(0,n.jsx)(r.code,{children:`return`}),` 出来`]}),`
`,(0,n.jsxs)(r.li,{children:[`或者临时写到 `,(0,n.jsx)(r.code,{children:`ctx.kv.put('debug-log', ...)`}),` 再用另一个 fn 读；dev 模式的 KV 与生产隔离，不会污染线上数据`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 完整示例：占卜师按钮 + 流式说书`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-html`,children:`<!-- publish/index.html -->
<button id="tarot">塔罗占卜</button>
<input id="q" placeholder="你想问什么？" />
<pre id="tarot-out"></pre>

<button id="story">讲个故事</button>
<input id="topic" placeholder="主题" />
<pre id="story-out"></pre>

<script>
  // 占卜：一次性 invoke
  let tarotInflight = false;
  document.getElementById('tarot').onclick = async () => {
    if (tarotInflight) return;
    tarotInflight = true;
    const out = document.getElementById('tarot-out');
    out.textContent = '占卜中…';
    try {
      const r = await dzmm.fn.invoke('tarot', {
        question: document.getElementById('q').value,
      });
      out.textContent = \`卡牌: \${Object.values(r.cards).join(' / ')}\\n\\n\${r.reading}\`;
    } catch (e) {
      out.textContent = \`[\${e.code}] \${e.message}\`;
    } finally {
      tarotInflight = false;
    }
  };

  // 流式：边讲边显示
  let latestStory = 0;
  document.getElementById('story').onclick = async () => {
    const id = ++latestStory;
    const out = document.getElementById('story-out');
    out.textContent = '';
    try {
      for await (const c of dzmm.fn.invokeStream('storyteller', {
        prompt: document.getElementById('topic').value,
      })) {
        if (id !== latestStory) return;
        out.textContent += c.delta ?? '';
      }
    } catch (e) {
      if (id !== latestStory) return;
      out.textContent += \`\\n\\n[error: \${e.code}] \${e.message}\`;
    }
  };
<\/script>
`})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};