(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ebf9ae65-4085-4e0a-a26e-50a4f7cf6697`,e._sentryDebugIdIdentifier=`sentry-dbid-ebf9ae65-4085-4e0a-a26e-50a4f7cf6697`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`模型列表 — `,(0,n.jsx)(r.code,{children:`dzmm.models.list()`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：这个 API 用于动态获取当前平台可用的 AI 对话模型，适合游戏自己展示模型选择。`,(0,n.jsx)(r.code,{children:`defaultModel`}),` 是目录推荐元数据，不是玩家的 fallback 设置。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 用法`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { models, categories } = await dzmm.models.list();

// 最常见用法：让当前 GameFy Chat 设置决定模型
await dzmm.completions(
  {
    model: 'default',
    messages: [{ role: 'user', content: '你好' }],
  },
  (content) => {
    outputEl.textContent = content;
  },
);
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 返回 `,(0,n.jsx)(r.code,{children:`Promise<void>`}),`；上面的回调每次收到截至当前的完整文本，所以直接覆盖 UI，不要用 `,(0,n.jsx)(r.code,{children:`+=`}),` 拼接。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：`,(0,n.jsx)(r.code,{children:`model: 'default'`}),` 会使用玩家当前 GameFy Chat 的模型设置，不需要先调用 `,(0,n.jsx)(r.code,{children:`dzmm.models.list()`}),`。玩家可直接在游戏设置里修改这个模型。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  // 扁平列表 — 简单场景用这个
  models: Array<{
    internalName: string;   // 传给 dzmm.completions() 的 model 字段
    displayName: string;    // 给 UI 显示用
    price: string;          // 价格说明文案
    description: string;
  }>;

  // 按"模型大家族"分组 — 想做高级 UI 时用
  categories: Array<{
    key: string;
    name: string;
    description: string | null;
    modelGroups: Array<{
      seriesKey: string;
      icon: string;
      gradient: string;
      description: string;
      price: number;
      thinkingSupported: boolean | null;
      thinkingMinMembershipLevel: number;
      isRecommended: boolean | null;
      minMembershipLevel: number;
      isApex: boolean;
      // 一个模型系列下不同上下文长度的变体
      contexts: Array<{
        internalName: string;
        displayName: string;
        maxContext: number;
        isRecommended: boolean;
        description: string;
      }>;
    }>;
  }>;

  defaultModel: string | null; // 模型目录推荐项，不是玩家 Chat 的 fallback 设置
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`使用限制怎么读`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`字段`}),(0,n.jsx)(r.th,{children:`含义`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`contexts[].maxContext`})}),(0,n.jsx)(r.td,{children:`这个档位标的上下文长度（词元），游戏按它规划请求长度。Apex 系列平台不按它拦截，超出部分不作保证；自建档位平台单次最多约 3 万词元（每个自建档位都一样）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`modelGroups[].isApex`})}),(0,n.jsx)(r.td,{children:`是否 Apex 系列。Apex 不裁剪，整份原样发给模型，超出模型本身的上限才失败；自建档位会从最早的消息整条丢弃`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`modelGroups[].minMembershipLevel`})}),(0,n.jsxs)(r.td,{children:[`玩家最低会员等级，不够时调用返回 `,(0,n.jsx)(r.code,{children:`VIP_REQUIRED`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`price`})}),(0,n.jsx)(r.td,{children:`价格说明，生成会消耗玩家积分`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`model: 'default'`}),` 用的是玩家自己选的模型，可能是最小的 10K 档，所以长度要按最小档位规划。完整规则与建议长度见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/completions`,children:`AI 对话 · 长度限制与分段`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 实用模式`}),`
`,(0,n.jsx)(r.h3,{children:`渲染下拉框让玩家选模型`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { models, defaultModel } = await dzmm.models.list();

const select = document.getElementById('model-select');
models.forEach((m) => {
  const opt = document.createElement('option');
  opt.value = m.internalName;
  opt.textContent = m.displayName;
  if (m.internalName === defaultModel) opt.selected = true;
  select.appendChild(opt);
});

// 玩家发消息时
async function send() {
  await dzmm.completions(
    {
      model: select.value,
      messages: [{ role: 'user', content: inputEl.value }],
    },
    (content) => {
      outputEl.textContent = content;
    },
  );
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`适配模型变更（防止旧模型下线）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const KNOWN_GOOD = 'nalang-medium-0826';

const { models } = await dzmm.models.list();
const isAvailable = models.some(m => m.internalName === KNOWN_GOOD);

const modelToUse = isAvailable ? KNOWN_GOOD : 'default';
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`作者指定的模型已下线时，平台会使用玩家当前 GameFy Chat 的模型设置。`,(0,n.jsx)(r.code,{children:`defaultModel`}),` 只用于游戏自己的模型选择 UI，不参与这个 fallback。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 缓存与配额`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`列表数据相对稳定，没必要频繁调。游戏启动时调一次缓存到变量即可。`}),`
`,(0,n.jsx)(r.li,{children:`这个 API 调用本身不消耗玩家积分。`}),`
`,(0,n.jsx)(r.li,{children:`模型目录会随平台配置变化；目录里的会员要求可用于渲染提示，列出某个模型不代表玩家一定有调用权限或足够积分，实际调用仍由服务端检查。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 完全可以不用`}),`
`,(0,n.jsxs)(r.p,{children:[`如果你的游戏简单，写死 `,(0,n.jsx)(r.code,{children:`model: 'default'`}),` 就够了：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.completions(
  {
    model: 'default', // 使用当前 GameFy Chat 的模型设置
    messages: [{ role: 'user', content: inputEl.value }],
  },
  (content) => {
    outputEl.textContent = content;
  },
);
`})}),`
`,(0,n.jsxs)(r.p,{children:[`浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.completions()`}),` 与服务端函数 `,(0,n.jsx)(r.code,{children:`ctx.completions()`}),` 都会使用同一项 Chat 设置。`,(0,n.jsx)(r.code,{children:`dzmm.models.list()`}),` 只用于游戏想展示自己的模型选择 UI 时。Workbench 预览挂在隐藏的开发会话上，`,(0,n.jsx)(r.code,{children:`default`}),` 同样读取该会话的模型设置，与玩家链路一致。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};