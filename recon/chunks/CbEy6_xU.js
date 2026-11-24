(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`85e42bee-72cd-49c3-9fa1-b21cc5b4232a`,e._sentryDebugIdIdentifier=`sentry-dbid-85e42bee-72cd-49c3-9fa1-b21cc5b4232a`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`AI 对话 — `,(0,n.jsx)(r.code,{children:`dzmm.completions()`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：让 AI 像 ChatGPT 一样回答问题。回答通过回调持续更新；每次回调拿到的是截至当前的完整文本，`,(0,n.jsx)(r.code,{children:`done === true`}),` 表示生成结束。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 最简单的用法`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let answer = '';
await dzmm.completions(
  {
    model: 'default',                              // 使用当前 GameFy Chat 的模型设置
    messages: [{ role: 'user', content: '你好' }], // 问题
  },
  (content, done) => {
    answer = content;
    if (done) console.log(answer); // AI 的完整回答
  },
);
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`messages`}),` 数组的 `,(0,n.jsx)(r.code,{children:`role`}),` 只支持两种：`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`role`}),(0,n.jsx)(r.th,{children:`含义`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`user`})}),(0,n.jsx)(r.td,{children:`玩家说的话`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`assistant`})}),(0,n.jsx)(r.td,{children:`AI 之前说过的话（用于多轮对话）`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`不要传 `,(0,n.jsx)(r.code,{children:`system`}),`，平台会拒绝该请求。角色设定、语气和输出规则也放在 `,(0,n.jsx)(r.code,{children:`user`}),` 消息中；需要隐藏规则时改用服务端函数。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 流式响应（推荐）`}),`
`,(0,n.jsx)(r.p,{children:`让 AI 一边生成你一边显示，玩家不用干等几秒看一个长段落"啪"地出现。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.completions(
  {
    model: 'default',
    messages: [{ role: 'user', content: '讲个三国故事' }],
    maxTokens: 1500,
  },
  (content, done) => {
    document.getElementById('output').textContent = content;
    if (done) {
      console.log('完成，总长度:', content.length);
    }
  },
);
`})}),`
`,(0,n.jsx)(r.p,{children:`回调参数：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`content`}),` —— 截至当前已经生成的完整文本，不是增量片段；直接覆盖旧文本，不要用 `,(0,n.jsx)(r.code,{children:`+=`}),` 拼接`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`done`}),` —— 是否结束。`,(0,n.jsx)(r.code,{children:`done === true`}),` 时，当前 `,(0,n.jsx)(r.code,{children:`content`}),` 是最终完整内容`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 参数详解`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`参数`}),(0,n.jsx)(`th`,{children:`类型`}),(0,n.jsx)(`th`,{children:`必需`}),(0,n.jsx)(`th`,{children:`说明`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`model`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsxs)(`td`,{children:[`模型 id。传具体且可用的 id 时优先使用；传 `,(0,n.jsx)(`code`,{children:`'default'`}),` 或传入已不可用的 id 时，使用玩家当前 GameFy Chat 的模型设置`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`messages`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`Array<Message>`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsxs)(`td`,{children:[`消息数组，至少 1 条；整个请求（JSON，按 UTF-8 字节计）最多 8 MiB。能被 AI 读到的长度另有上限，见下文「长度限制与分段」。`,(0,n.jsxs)(`code`,{children:[`Message = `,`{ role, content }`]})]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`maxTokens`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`number`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsx)(`td`,{children:`最多生成多少 token，范围 200-3000，默认 1000。1 个中文字大概 1-2 token`})]})]})]}),`
`,(0,n.jsxs)(r.h3,{children:[`关于 `,(0,n.jsx)(r.code,{children:`model`}),` 的最佳实践`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`简单游戏：写 `,(0,n.jsx)(r.code,{children:`model: 'default'`}),`，由玩家在当前 GameFy Chat 设置中选择实际使用的模型。`]}),`
`,(0,n.jsxs)(r.li,{children:[`需要固定体验：传 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/models`,children:(0,n.jsx)(r.code,{children:`dzmm.models.list()`})}),` 返回的具体模型 id；只要该模型仍可用，就优先于玩家的 Chat 设置。`]}),`
`,(0,n.jsx)(r.li,{children:`遗留代码里写死的模型如果下线，服务端会回退到该玩家当前 Chat 的模型设置，无需重新发布游戏。`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.models.list().defaultModel`}),` 是模型目录的推荐元数据，适合游戏自己展示模型列表时预选；它不是玩家的 fallback 设置。`]}),`
`,(0,n.jsxs)(r.p,{children:[`Workbench 预览挂在一个隐藏的开发会话（dev chat）上，模型解析与玩家链路完全一致：预览里的 `,(0,n.jsx)(r.code,{children:`default`}),` 同样读取该会话的模型设置，发布后读取玩家当前 Chat 的设置。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(`a`,{id:`length-limits`}),`
`,(0,n.jsx)(r.h2,{children:`4. 长度限制与分段`}),`
`,(0,n.jsxs)(r.p,{children:[`AI 一次能读的内容有上限（上下文长度，按「词元」计）。平台`,(0,n.jsx)(r.strong,{children:`不会替你压缩或改写`}),`发出去的内容：自建档位放不下时只会整条丢掉最早的消息，最新一条自己就放不下时直接拒绝；Apex 档位整份原样发给模型。剧情、设定和存档怎么取舍，只有作者知道，所以长度要在游戏里自己控制。服务端函数里的 `,(0,n.jsx)(r.code,{children:`ctx.completions()`}),` 走的是同一个服务，下面的限制同样适用。`]}),`
`,(0,n.jsx)(r.p,{children:`工作台的「健康体检」会逐行检查 AI 对话调用，找出一直追加却整份发出的对话历史、整份存档或设定、导入的整份文本、写死的超长文字，标出文件和行号；光看代码判断不了长度的调用会列出来请你实际玩一下确认。它是读代码的估算，不会替你实际发请求测量。`}),`
`,(0,n.jsx)(r.h3,{children:`4.1 两类模型的规则不一样`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`模型`}),(0,n.jsx)(r.th,{children:`平台怎么处理长度`}),(0,n.jsx)(r.th,{children:`实际的硬上限`}),(0,n.jsx)(r.th,{children:`建议按多长规划`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`自建档位（XL、Medium、Max、Turbo 系列）`}),(0,n.jsxs)(r.td,{children:[`按约 3 万词元的预算裁剪：从最早的消息开始整条丢弃，直到放得下；`,(0,n.jsx)(r.strong,{children:`最新一条自己超过约 3 万词元时直接拒绝`})]}),(0,n.jsx)(r.td,{children:`约 3 万词元，游戏对话里每个自建档位都一样，与档位名里的 10K／16K／32K 无关`}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`maxContext`}),` 与 3 万词元中较小的那个`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Apex 系列`}),(0,n.jsxs)(r.td,{children:[`不裁剪，也`,(0,n.jsxs)(r.strong,{children:[`不按档位的 `,(0,n.jsx)(r.code,{children:`maxContext`}),` 拦截`]}),`，整份原样发给模型`]}),(0,n.jsxs)(r.td,{children:[`模型本身的上限，由模型决定，通常比目录里的 `,(0,n.jsx)(r.code,{children:`maxContext`}),` 大，不同模型不同、也可能变化，平台不公布；超出时请求失败，返回 `,(0,n.jsx)(r.code,{children:`CONTEXT_TOO_LONG`})]}),(0,n.jsxs)(r.td,{children:[`该档位的 `,(0,n.jsx)(r.code,{children:`maxContext`}),`（10K、16K、32K、64K、128K 等）：这是目录里标的、平台按它规划的长度，超出部分能不能用不作保证`]})]})]})]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`messages`}),` 里所有消息加起来算长度，`,(0,n.jsx)(r.code,{children:`maxTokens`}),` 要的回复长度也占在里面。`]}),`
`,(0,n.jsxs)(r.li,{children:[`估算时按 `,(0,n.jsx)(r.strong,{children:`1 个汉字约 1.5 词元`}),`、英文约 4 个字母 1 词元算（偏保守）；平台以服务端的估算为准。不同模型数词元的方式不同，同一段中文，不同模型算出来可能差三成以上；按 1.5 估算出来的是留了余量的上限，不是精确值。`]}),`
`,(0,n.jsxs)(r.li,{children:[`玩家会员等级不够用某个档位（目录里的 `,(0,n.jsx)(r.code,{children:`minMembershipLevel`}),`）时返回 `,(0,n.jsx)(r.code,{children:`VIP_REQUIRED`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`4.2 建议的长度`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`场景`}),(0,n.jsxs)(r.th,{children:[`建议整次请求（所有 `,(0,n.jsx)(r.code,{children:`messages`}),`）控制在`]})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`model: 'default'`}),`（模型由玩家选，可能是最小的 10K 档）`]}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.strong,{children:`7000 词元以内`}),`（约 4500 个汉字）`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`作者指定了自建档位`}),(0,n.jsxs)(r.td,{children:[`该档位 `,(0,n.jsx)(r.code,{children:`maxContext`}),` 与 3 万词元中较小的那个，再减去 `,(0,n.jsx)(r.code,{children:`maxTokens`}),`，并留两成余量`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`作者指定了 Apex 档位`}),(0,n.jsxs)(r.td,{children:[`该档位 `,(0,n.jsx)(r.code,{children:`maxContext`}),` 减去 `,(0,n.jsx)(r.code,{children:`maxTokens`}),`，并留两成余量`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`最新一条消息（玩家输入 + 你拼的规则）`}),(0,n.jsxs)(r.td,{children:[`不超过上面建议长度的一半，最多 `,(0,n.jsx)(r.strong,{children:`8000 词元`}),`（约 5000 个汉字）`]})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`指定模型时可以从 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/models`,children:(0,n.jsx)(r.code,{children:`dzmm.models.list()`})}),` 读出它的上下文长度和是否 Apex：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`async function contextBudget(modelId) {
  const { categories } = await dzmm.models.list();
  for (const category of categories) {
    for (const group of category.modelGroups) {
      const ctx = group.contexts.find(c => c.internalName === modelId);
      if (ctx) {
        // Apex 按目录里标的档位长度规划（平台不按它拦截，超出部分不作保证）；
        // 自建档位平台单次最多约 3 万词元
        return group.isApex ? ctx.maxContext : Math.min(ctx.maxContext, 30000);
      }
    }
  }
  return 10000; // 找不到（例如 'default'）就按最小档位算
}

// 整次请求（所有 messages）的建议上限：减去回复长度，再留两成余量
const requestBudget = async (modelId, maxTokens) =>
  Math.floor((await contextBudget(modelId) - maxTokens) * 0.8);
`})}),`
`,(0,n.jsx)(r.h3,{children:`4.3 怎么分段`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`只带最近几轮`}),`：对话历史保留最近 6～10 轮，更早的不要每次都发。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`早期剧情写成摘要`}),`：每隔几轮把旧剧情整理成一段摘要存进 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/kv`,children:(0,n.jsx)(r.code,{children:`dzmm.kv`})}),`，之后只发摘要。摘要可以用一次单独的 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 生成，内容由你决定保留什么，不会像平台压缩那样失真。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`设定按需取`}),`：世界观、角色卡、物品表按当前场景挑相关的几段，不要整份每次都带。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`存档只发需要的字段`}),`：不要把整个存档 JSON 原样塞进消息里。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`长文本先切块`}),`：确实要让 AI 读一大段（比如导入的小说章节），按每块 5000 词元以内切开，逐块处理并把每块结果汇成摘要。`]}),`
`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const MAX_HISTORY_TOKENS = 7000;
const estimate = text => Math.ceil(text.length * 1.5);

// 从最新往回取，取到预算为止；更早的剧情放在 summary 里
function buildMessages(summary, history, input) {
  const latest = { role: 'user', content: input };
  let used = estimate(summary) + estimate(input);
  const recent = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const cost = estimate(history[i].content);
    if (used + cost > MAX_HISTORY_TOKENS) break;
    recent.unshift(history[i]);
    used += cost;
  }
  // role 只能是 user / assistant，摘要放进第一条 user 消息
  const head = summary ? [{ role: 'user', content: \`前情提要：\${summary}\` }, { role: 'assistant', content: '好的。' }] : [];
  return [...head, ...recent, latest];
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`4.4 被挡下时`}),`
`,(0,n.jsxs)(r.p,{children:[`请求太长被拒绝时抛 `,(0,n.jsx)(r.code,{children:`DzmmError`}),`，`,(0,n.jsx)(r.code,{children:`code`}),` 为 `,(0,n.jsx)(r.code,{children:`INVALID_REQUEST`}),`、`,(0,n.jsx)(r.code,{children:`rawCode`}),` 为 `,(0,n.jsx)(r.code,{children:`CONTEXT_TOO_LONG`}),`，`,(0,n.jsx)(r.code,{children:`message`}),` 会提示到这一节看建议（自建档位还会写出这条大约多长、可用多少；Apex 超出模型本身的上限时是一句固定的提示）。同样的内容再发一次还是会被拒绝，先缩短再让玩家重新点：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  await dzmm.completions(cfg, onChunk);
} catch (e) {
  if (dzmm.errors.isDzmmError(e) && e.rawCode === 'CONTEXT_TOO_LONG') {
    history = history.slice(-4);          // 丢掉更早的轮次，或改发摘要
    showHint('这段内容太长了，已精简，请再试一次。');
    return;                               // 不自动重发
  }
  throw e;
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 返回值`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 返回 `,(0,n.jsx)(r.code,{children:`Promise<void>`}),`。文本只通过回调提供，不能读取 `,(0,n.jsx)(r.code,{children:`result.text`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`省略回调只会让生成文本无人接收，不会切换成返回 `,(0,n.jsx)(r.code,{children:`{ text }`}),` 的“非流式模式”。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let finalText = '';
await dzmm.completions(cfg, (content, done) => {
  finalText = content;
});
console.log(finalText);
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 生产级最佳实践`}),`
`,(0,n.jsx)(r.h3,{children:`防重复点击 + 显示进度`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let inflight = false;

async function onClickAsk() {
  if (inflight) return;
  inflight = true;
  setButton({ disabled: true, label: 'AI 思考中…' });
  try {
    await dzmm.completions(
      { model: 'default', messages: [{ role: 'user', content: prompt }] },
      (content, done) => {
        outputEl.textContent = content;
      },
    );
  } catch (e) {
    handleError(e);
  } finally {
    inflight = false;
    setButton({ disabled: false, label: '提问' });
  }
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`解析 AI 返回的 JSON（必须兜底）`}),`
`,(0,n.jsx)(r.p,{children:`很多游戏让 AI 返回 JSON 用于驱动剧情。AI 偶尔会返回不合法 JSON，必须兜底：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let buf = '';
await dzmm.completions(cfg, (c, done) => {
  buf = c;
  if (!done) return;

  let parsed;
  try {
    parsed = JSON.parse(buf);
  } catch {
    return useTextFallback(buf); // 用纯文本展示
  }
  if (!parsed?.choices?.length) {
    return useTextFallback(buf); // 字段缺失也降级
  }
  applyChoices(parsed.choices);
});
`})}),`
`,(0,n.jsx)(r.p,{children:`不能因为 AI 一次返非 JSON 就让游戏白屏。`}),`
`,(0,n.jsx)(r.h3,{children:`Race condition：守卫 stale update`}),`
`,(0,n.jsx)(r.p,{children:`玩家点"再来一次"会再发一个请求。旧请求的回调更新可能晚到，必须用请求 id 守卫：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let latestReq = 0;

async function regen() {
  const reqId = ++latestReq;
  await dzmm.completions(cfg, (c, done) => {
    if (reqId !== latestReq) return; // 旧请求，丢弃
    outputEl.textContent = c;
  });
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`网络瞬时错误：本次动作直接收口`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`try {
  await dzmm.completions(cfg, (content) => {
    outputEl.textContent = content;
  });
} catch (e) {
  if (dzmm.errors.isDzmmError(e) && e.retryable) {
    outputEl.textContent = '连接暂时不稳定，请稍后再试。';
    retryButton.hidden = false;
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`retryable: true`}),` 表示以后再次请求可能成功，不表示当前这次点击应自动重复调用。一次用户动作最多调用一次 AI；网络错误或超时后先用本地结果收口，只有玩家再次明确点击时才开始新的动作。`]}),`
`,(0,n.jsx)(r.h3,{children:`配额耗尽要引导充值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`catch (e) {
  if (e.code === 'QUOTA_EXHAUSTED') {
    showVipUpsell(); // 提示玩家充值 / 开通 VIP
    return;          // 不要重试
  }
  if (e.code === 'RATE_LIMITED') {
    showCooldown('请求太频繁，请稍后再次点击');
    return; // 当前动作到此结束，不自动再次调用 AI
  }
  // 其它错误：catch 不处理，平台已自动 toast 本地化的 message
}
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),` 不要重试，玩家钱包真的空了，重试也是同样错误。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 常见错误码`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`Code`}),(0,n.jsx)(r.th,{children:`含义`}),(0,n.jsx)(r.th,{children:`怎么处理`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`RATE_LIMITED`})}),(0,n.jsx)(r.td,{children:`调用太频繁`}),(0,n.jsx)(r.td,{children:`显示冷却提示，等待玩家稍后明确再试`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`})}),(0,n.jsx)(r.td,{children:`玩家积分 / 额度耗尽`}),(0,n.jsx)(r.td,{children:`引导充值，不要重试`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`VIP_REQUIRED`})}),(0,n.jsx)(r.td,{children:`此模型需要 VIP`}),(0,n.jsx)(r.td,{children:`引导开通 VIP`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`UNAUTHORIZED`}),` / `,(0,n.jsx)(r.code,{children:`TOKEN_EXPIRED`})]}),(0,n.jsx)(r.td,{children:`登录态失效`}),(0,n.jsx)(r.td,{children:`提示"请重新进入游戏"，停止后续请求`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`SENSITIVE_CONTENT_DETECTED`})}),(0,n.jsx)(r.td,{children:`提示词命中审查`}),(0,n.jsx)(r.td,{children:`提示玩家换一种表达`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNSUPPORTED_MODEL`})}),(0,n.jsx)(r.td,{children:`model 字段不在白名单`}),(0,n.jsxs)(r.td,{children:[`改用 `,(0,n.jsx)(r.code,{children:`'default'`}),` 或 `,(0,n.jsx)(r.code,{children:`dzmm.models.list()`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`INVALID_REQUEST`}),`（`,(0,n.jsx)(r.code,{children:`rawCode: 'CONTEXT_TOO_LONG'`}),`）`]}),(0,n.jsx)(r.td,{children:`内容太长，模型放不下`}),(0,n.jsx)(r.td,{children:`按「长度限制与分段」缩短后让玩家重新点，不要原样重发`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`NETWORK_ERROR`}),` / `,(0,n.jsx)(r.code,{children:`TIMEOUT`})]}),(0,n.jsx)(r.td,{children:`网络瞬时`}),(0,n.jsx)(r.td,{children:`本地降级并结束当前动作，提供显式重试入口`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`完整错误码字典见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/errors`,children:`错误处理大全`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 关于隐藏提示词`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 不支持 `,(0,n.jsx)(r.code,{children:`system`}),` role。放在 `,(0,n.jsx)(r.code,{children:`user`}),` 消息里的角色设定和输出规则也写在浏览器代码中，玩家可以通过开发者工具看到。`]}),`
`,(0,n.jsxs)(r.p,{children:[`如果不想让玩家直接从浏览器代码或 Network 读取剧情设定，可以用`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),`，在函数内部调用 `,(0,n.jsx)(r.code,{children:`ctx.completions()`}),`，浏览器只接收最小结果。服务端 prompt 仍可能被 prompt injection 间接提取，因此不能存放密钥或安全关键规则；防作弊与权限判断必须由确定性服务端代码执行。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};