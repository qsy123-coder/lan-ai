(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0b4fddd6-3bca-49aa-aef6-8534d6ba5d7f`,e._sentryDebugIdIdentifier=`sentry-dbid-0b4fddd6-3bca-49aa-aef6-8534d6ba5d7f`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`KV 存储 — `,(0,n.jsx)(r.code,{children:`dzmm.kv.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：KV（Key-Value）就是"按名字存数据"。你给它一个名字（key）和一份数据（value），下次用同一个名字就能拿回来。不像 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/chat`,children:`聊天存档`}),` 有树状关系，KV 是扁平的，最适合存"分数 / 关卡 / 背包 / 设置"这类数据。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 基础 API`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 存
await dzmm.kv.put('score', 100);
await dzmm.kv.put('inventory', { items: ['sword', 'potion'], gold: 50 });

// 手动存档、购买结果等必须立刻写出并确认已落到服务端的状态
await dzmm.kv.put('critical-save', state, { flush: true });

// 每次状态变化都存、又不想等服务端确认：SDK 收下就返回（写失败不会通知游戏）
await dzmm.kv.put('draft', state, { ack: 'accepted' });

// 读
const scoreData = await dzmm.kv.get('score');
console.log(scoreData?.value); // 100

// 删
await dzmm.kv.delete('score');
`})}),`
`,(0,n.jsxs)(r.p,{children:[`注意 `,(0,n.jsx)(r.code,{children:`get`}),` 返回的是包了一层的对象 `,(0,n.jsx)(r.code,{children:`{ value, updated_at }`}),`，不是直接的值。
key 不存在时两者都是 `,(0,n.jsx)(r.code,{children:`null`}),`；显式保存 JSON `,(0,n.jsx)(r.code,{children:`null`}),` 时 `,(0,n.jsx)(r.code,{children:`value`}),` 是 `,(0,n.jsx)(r.code,{children:`null`}),`、
`,(0,n.jsx)(r.code,{children:`updated_at`}),` 是时间字符串。删除必须调用 `,(0,n.jsx)(r.code,{children:`kv.delete(key)`}),`，`,(0,n.jsx)(r.code,{children:`put(key, null)`}),` 不等于删除。
`,(0,n.jsx)(r.code,{children:`delete`}),` 是幂等的：删除一个不存在的 key 会正常 resolve，不会抛 `,(0,n.jsx)(r.code,{children:`KEY_NOT_FOUND`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`生产 Web Host 默认会对普通 `,(0,n.jsx)(r.code,{children:`put`}),` 做 leading/trailing debounce，但 `,(0,n.jsx)(r.code,{children:`await put(...)`}),` 返回时，这个值（或同一个 key 上更新的值）已经写进服务端；写不进去会 reject，错误形状与 `,(0,n.jsx)(r.code,{children:`{ flush: true }`}),` 相同。同一个 key 在同一个 debounce 窗口里的多次 `,(0,n.jsx)(r.code,{children:`put`}),` 共用一次写入和同一个结果。等待有时限：约 20 秒内服务端没有确认就 reject（没出过错误时是 `,(0,n.jsx)(r.code,{children:`TIMEOUT`}),`，否则是最近一次失败），SDK 仍会在后台继续重试；值还没写出去、同一个 key 就被 `,(0,n.jsx)(r.code,{children:`delete`}),` 删掉时，这次 `,(0,n.jsx)(r.code,{children:`put`}),` 以 `,(0,n.jsx)(r.code,{children:`ABORTED`}),` reject（那个值从未写入）。因为有 debounce，紧跟在同一个 key 上一次 `,(0,n.jsx)(r.code,{children:`put`}),` 之后（约 2 秒内）的 `,(0,n.jsx)(r.code,{children:`await put(...)`}),` 要等到窗口结束再加一次写入才返回；每次状态变化都存、又不能等的地方，传 `,(0,n.jsx)(r.code,{children:`{ ack: 'accepted' }`}),`，SDK 收下就返回，这种写入失败只通过 Host 提示玩家，不会通知游戏。不 `,(0,n.jsx)(r.code,{children:`await`}),` 的 `,(0,n.jsx)(r.code,{children:`put`}),` 要么传 `,(0,n.jsx)(r.code,{children:`{ ack: 'accepted' }`}),`，要么接 `,(0,n.jsx)(r.code,{children:`.catch(...)`}),`，否则写失败会变成未处理的 rejection。移动 Host 会等待网络响应。对手动存档、付费结果或准备向玩家显示“保存成功”并且要立刻写出的操作，请传 `,(0,n.jsx)(r.code,{children:`{ flush: true }`}),`，并处理 reject。第一方 Web iframe 或移动 WebView 文档被替换时，会立即中止旧文档的读取、Chat、Workshop、completions、Draw 和函数请求；Web 中即使 DOM iframe 元素没有更换，游戏执行 `,(0,n.jsx)(r.code,{children:`location.reload()`}),` 或页内导航也属于文档替换。只有已经接受的 pending/in-flight KV 写入会进入关闭排空：默认 2 秒，在途存档超过 512 KB 时按体积追加（每 MiB 约 4 秒，上限 10 秒），且不会延迟新文档的 SDK 握手；超时后旧写作用域会被中止。后台自动存档遇到 `,(0,n.jsx)(r.code,{children:`UNAUTHORIZED`}),` / `,(0,n.jsx)(r.code,{children:`FORBIDDEN`}),` / 校验类错误不会再自动重试，会通过 Host 提示玩家。同一 `,(0,n.jsx)(r.code,{children:`(chatId,key)`}),` 的替换前后写入仍会排队，避免旧 autosave 覆盖新存档。浏览器或 App 被强杀仍只能 best-effort，不能把终止事件当成唯一保存时机。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 存什么都可以`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`value`}),` 可以是任何能被 `,(0,n.jsx)(r.code,{children:`JSON.stringify`}),` 序列化的东西：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.kv.put('username', 'Alice');                       // 字符串
await dzmm.kv.put('hp', 100);                                  // 数字
await dzmm.kv.put('isVip', true);                              // 布尔
await dzmm.kv.put('unlocked', ['level1', 'level2']);           // 数组
await dzmm.kv.put('player', { name: 'Alice', hp: 100, mp: 50 }); // 对象
`})}),`
`,(0,n.jsxs)(r.p,{children:[`不能存：函数、Date 对象（会变字符串）、循环引用对象、`,(0,n.jsx)(r.code,{children:`undefined`}),`、`,(0,n.jsx)(r.code,{children:`BigInt`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 批量读写、列 key、namespace`}),`
`,(0,n.jsx)(r.p,{children:`批量接口适合存档槽、设置面板这类一次读写多个 key 的场景：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.kv.batchPut({
  'slot:1': { level: 3, hp: 20 },
  'slot:2': { level: 5, hp: 8 },
});

const slots = await dzmm.kv.batchGet(['slot:1', 'slot:2', 'slot:missing']);
console.log(slots['slot:missing']); // null
`})}),`
`,(0,n.jsx)(r.p,{children:`批量限制：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`batchGet`}),` 最多 10 个 key，`,(0,n.jsx)(r.code,{children:`batchPut`}),` 最多 10 个条目`]}),`
`,(0,n.jsxs)(r.li,{children:[`所有 key 都必须非空、不含 NUL、是合法 Unicode，且不能等于 `,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`}),`。新 `,(0,n.jsx)(r.code,{children:`batchGet / batchPut / list / namespace`}),` 合同的 key / prefix 上限是 256 字符；旧的根级 `,(0,n.jsx)(r.code,{children:`get / put / delete`}),` 继续允许访问历史上已经使用的更长 key，避免升级 SDK 后旧存档无法读写或删除`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`kv.put(key, null)`}),` 会保存 JSON `,(0,n.jsx)(r.code,{children:`null`}),`，只有 `,(0,n.jsx)(r.code,{children:`batchPut`}),` 的顶层 entry value 禁止 `,(0,n.jsx)(r.code,{children:`null`}),` / `,(0,n.jsx)(r.code,{children:`undefined`}),`。删除必须显式调用 `,(0,n.jsx)(r.code,{children:`kv.delete`}),`，非法条目会在 RPC 前拒绝`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`/`}),`、`,(0,n.jsx)(r.code,{children:`?`}),`、`,(0,n.jsx)(r.code,{children:`#`}),` 等字符会被安全编码为同一个 URL path segment，不会逃逸到别的 chat 或接口`]}),`
`,(0,n.jsxs)(r.li,{children:[`请求与响应分别最多 5 MiB（`,(0,n.jsx)(r.code,{children:`5,242,880`}),` 字节）`]}),`
`,(0,n.jsx)(r.li,{children:`字节数按完整 JSON 的 UTF-8 序列化结果计算，包含 key 和外层结构`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`batchPut`}),` 是原子操作：整批全部成功，或整批不写入`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`列 key 只返回 key，不返回 value；用 `,(0,n.jsx)(r.code,{children:`cursor`}),` 取下一页：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let cursor;
do {
  const page = await dzmm.kv.list({ prefix: 'slot:', limit: 20, cursor });
  renderSlotKeys(page.keys);
  cursor = page.cursor;
} while (cursor);
`})}),`
`,(0,n.jsxs)(r.p,{children:[`远端分页和 prefix 过滤在服务端执行。生产 SDK 还会把本会话已经接受、仍在
debounce 队列中的 key 合并到当前页，因此和 `,(0,n.jsx)(r.code,{children:`get`}),` / `,(0,n.jsx)(r.code,{children:`batchGet`}),` 一样具备
read-your-writes 语义。key 使用稳定的 UTF-8 字节序排列；把 `,(0,n.jsx)(r.code,{children:`cursor`}),` 当作
不透明值原样传回，不要用本地语言排序重新计算。`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`namespace(prefix)`}),` 返回一个自动加前缀的 KV 适配器，适合把一个功能的 key 放在一起：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const saves = dzmm.kv.namespace('save:');

await saves.put('slot:1', { level: 3 });
const data = await saves.get('slot:1'); // 实际读 save:slot:1

const page = await saves.list({ prefix: 'slot:' });
console.log(page.keys); // ['slot:1']，不会带 save: 前缀
`})}),`
`,(0,n.jsxs)(r.h3,{children:[`原子创建：`,(0,n.jsx)(r.code,{children:`putIfAbsent(key, value)`})]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const caps = await dzmm.capabilities.get();
if (caps.kvPutIfAbsent === true && typeof dzmm.kv.putIfAbsent === 'function') {
  const created = await dzmm.kv.putIfAbsent('profile:v1', { level: 1 });
  if (created) console.log('Created the initial profile');
  else console.log('Existing profile was preserved');
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`返回 `,(0,n.jsx)(r.code,{children:`true`}),` 表示原子创建成功且已经等待服务端确认；`,(0,n.jsx)(r.code,{children:`false`}),` 表示 key 已存在，旧值不会被覆盖。它不走普通 `,(0,n.jsx)(r.code,{children:`put`}),` 的 debounce，也不需要 `,(0,n.jsx)(r.code,{children:`{ flush: true }`}),`。key 最长 256 字符，命名空间拼接后的完整 key 同样受限，value 必须可 JSON 序列化。`]}),`
`,(0,n.jsx)(r.p,{children:`这只能保证“创建这个 key”原子，不能把后续 AI 扣费、发奖或多个 key 的写入变成一个事务。需要防重复动作时，用稳定 action ID 记录 reservation / result，明确处理 pending 与未知结果；请求超时后不要直接重复付费操作。`}),`
`,(0,n.jsxs)(r.p,{children:[`旧宿主缺少这项能力时，停用依赖它的动作或改走有同等原子守卫的服务端逻辑。`,(0,n.jsxs)(r.strong,{children:[`不要用 `,(0,n.jsx)(r.code,{children:`get`}),` 后 `,(0,n.jsx)(r.code,{children:`put`}),` 模拟`]}),`，并发窗口会让两个调用都认为自己拿到了资格。服务端的 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:(0,n.jsx)(r.code,{children:`ctx.kv.putIfAbsent`})}),` 使用不同的数据 scope，不能和浏览器存档互换。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 推荐写法：直接用 dzmm.kv，不需要 localStorage fallback`}),`
`,(0,n.jsxs)(r.p,{children:[`沙箱 iframe 里 `,(0,n.jsx)(r.code,{children:`localStorage`}),` 不可用；而 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 无论开发模式还是生产模式都持久化到数据库，直接用即可。可以封一层薄 helper 省掉 `,(0,n.jsx)(r.code,{children:`.value`}),` 包装、统一错误处理：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`async function kvPut(key, value, { critical = false } = {}) {
  await window.dzmm.kv.put(key, value, { flush: critical });
}

async function kvGet(key) {
  const data = await window.dzmm.kv.get(key);
  return data?.value ?? null;
}

// 用起来更顺手
await kvPut('score', 100);
const score = await kvGet('score');
console.log(score); // 100（没了一层 .value 包装）

// 关键删除也要处理失败，不要静默显示“已删除”
await dzmm.kv.delete('score');
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`什么时候才需要 localStorage？只有"把游戏文件直接丢进浏览器打开、完全没有 DZMM SDK"的裸本地预览才需要自己写 localStorage 兜底。在 Workbench 预览和线上 iframe 里都不要用：沙箱禁用了 localStorage，`,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 是唯一正常路径。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 开发模式 vs 生产模式`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`模式`}),(0,n.jsx)(r.th,{children:`行为`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`开发模式（Workbench 预览）`}),(0,n.jsx)(r.td,{children:`数据持久化到数据库（你自己的开发数据），刷新 / 重开浏览器数据都在`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`生产模式（玩家游玩）`}),(0,n.jsx)(r.td,{children:`数据持久化到 PostgreSQL，跟当前玩家绑定`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`预览挂在一个隐藏的开发会话（dev chat）上，SDK 统一走真实后端：开发模式的 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 拥有与生产完全相同的写语义（debounce、`,(0,n.jsx)(r.code,{children:`{ flush: true }`}),`、批量、list 等），只是数据落在你自己的开发数据里，与玩家的生产数据、与其他开发者的开发数据都互相隔离。localStorage 不参与任何一种模式。`]}),`
`,(0,n.jsxs)(r.p,{children:[`关键含义：游戏初始化时永远要处理"没数据"分支（首次运行、清除存储后都会遇到）。不要假设 `,(0,n.jsx)(r.code,{children:`kvGet('savePoint')`}),` 一定有结果。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 数据隔离`}),`
`,(0,n.jsx)(r.p,{children:`生产模式下：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`每个玩家的 KV 数据互相隔离 —— 玩家 A 看不到玩家 B 的数据`}),`
`,(0,n.jsx)(r.li,{children:`每个聊天会话的 KV 数据互相隔离 —— 同一玩家在两个不同 chat 里存的同名 key，互不影响`}),`
`,(0,n.jsx)(r.li,{children:`不同游戏之间也是隔离的`}),`
`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`这是"浏览器 SDK 的 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),`"的 scope 规则（chat 维度 + 玩家维度）。服务端函数中，`,(0,n.jsx)(r.code,{children:`ctx.kv.*`}),` 是当前玩家私有、跨 chat 持久的数据；`,(0,n.jsx)(r.code,{children:`ctx.kv.global.*`}),` 才是全游戏共享数据，例如排行榜或公告。两者都属于 game 维度，但入口和隔离范围不同，详见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`服务端函数 ctx KV`}),`。`]}),`
`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`ctx.kv`}),` / `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 和这里的 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 在开发模式下遵循同一套规则：都按开发者隔离。Workbench 预览读写的是你自己的那份开发数据，与生产、与其他开发者都完全隔离 —— 预览里写 `,(0,n.jsx)(r.code,{children:`ctx.kv.global`}),` 排行榜不会污染线上，同时也读不到线上数据；要验证真实数据需发布后验证。详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless/ctx`,children:`服务端函数 ctx.kv 章节`}),`。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 限制`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`项`}),(0,n.jsx)(r.th,{children:`限制`}),(0,n.jsx)(r.th,{children:`超出时`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`batch / list / namespace key 或组合 prefix`}),(0,n.jsx)(r.td,{children:`≤ 256 字符`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`KEY_TOO_LONG`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`旧根级 `,(0,n.jsx)(r.code,{children:`get / put / delete`}),` key`]}),(0,n.jsx)(r.td,{children:`不新增 256 字符限制；保留历史数据访问`}),(0,n.jsx)(r.td,{children:`—`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`key 内容`}),(0,n.jsxs)(r.td,{children:[`非空、不含 NUL、合法 Unicode，不能是 `,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`})]}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`INVALID_REQUEST`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`value 大小`}),(0,n.jsx)(r.td,{children:`≤ 5 MiB（SDK 客户端会前置校验，超出直接 throw）`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`VALUE_TOO_LARGE`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`key 不存在`}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`get`}),` 返回 `,(0,n.jsx)(r.code,{children:`null`}),`，`,(0,n.jsx)(r.code,{children:`delete`}),` 正常 resolve（都不抛错）`]}),(0,n.jsx)(r.td,{children:`—`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`同 key 并发 `,(0,n.jsx)(r.code,{children:`get`})]}),(0,n.jsxs)(r.td,{children:[`生产 Host 合并成一次请求，并在约 1.5 秒内复用最近一次结果；`,(0,n.jsx)(r.code,{children:`put`}),` / `,(0,n.jsx)(r.code,{children:`delete`}),` 后立即失效，写入在途时 `,(0,n.jsx)(r.code,{children:`get`}),` 会等它落地`]}),(0,n.jsx)(r.td,{children:`—`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`get`}),` 被限流 / 存储短暂不可用`]}),(0,n.jsx)(r.td,{children:`SDK 自动重试最多 2 次（总等待不超过约 4 秒）`}),(0,n.jsxs)(r.td,{children:[`之后才抛 `,(0,n.jsx)(r.code,{children:`RATE_LIMITED`}),` / `,(0,n.jsx)(r.code,{children:`SERVICE_UNAVAILABLE`})]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 实用模式`}),`
`,(0,n.jsx)(r.h3,{children:`存档接入：先分清空档、失败和已保存`}),`
`,(0,n.jsx)(r.p,{children:`下面这些写法会造成“显示保存成功，重进却回到开局”，接入时逐项检查：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`错误写法`}),(0,n.jsx)(r.th,{children:`正确做法`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`get`}),` / `,(0,n.jsx)(r.code,{children:`batchGet`}),` / `,(0,n.jsx)(r.code,{children:`list`}),` 失败后返回 `,(0,n.jsx)(r.code,{children:`null`}),` 或 `,(0,n.jsx)(r.code,{children:`[]`}),`，随后自动写入初始状态`]}),(0,n.jsxs)(r.td,{children:[`读取失败、损坏或不兼容的数据都属于“存档状态未知”，显示失败并允许重试，暂停初始化写入和 autosave。只有请求成功且明确返回缺失才是空档；单 key 缺失是 `,(0,n.jsx)(r.code,{children:`{ value: null, updated_at: null }`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`必须打开读档面板、或必须先读到一个已有档，才能写云端`}),(0,n.jsx)(r.td,{children:`在启动或选定档位时完成读取。成功读到空档也要允许首次保存，不要把是否打开面板当写入条件；已有档读失败时仍须保留防覆盖保护`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`一次写失败就把 `,(0,n.jsx)(r.code,{children:`cloudEnabled`}),` 永久设为 `,(0,n.jsx)(r.code,{children:`false`})]}),(0,n.jsx)(r.td,{children:`保留内存进度、显示失败；连接或登录恢复后允许玩家重试同一份待保存状态。请求尚未结束或结果不明时先等待或重新核对，不能并行启动另一套写入器`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`吞掉 `,(0,n.jsx)(r.code,{children:`put`}),` 的错误，或用 `,(0,n.jsx)(r.code,{children:`{ ack: 'accepted' }`}),` 的 `,(0,n.jsx)(r.code,{children:`put`}),` 后显示“已保存”`]}),(0,n.jsxs)(r.td,{children:[`手动保存及关键进度必须 `,(0,n.jsx)(r.code,{children:`await put(key, state, { flush: true })`}),`（普通 `,(0,n.jsx)(r.code,{children:`await put()`}),` 也会等服务端，但要等 debounce 窗口）。服务端确认前显示“保存中”，确认后才显示“已保存到云端”，reject 时显示失败并继续向调用方传递错误`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`“新游戏 / 新一世 / 开始经营”立刻覆盖唯一档位`}),(0,n.jsx)(r.td,{children:`先读档，已有进度时让玩家明确选择继续、另存或确认覆盖。取消时不能改变旧进度；未知状态不能当成可覆盖的空档`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`将跨局共用的 `,(0,n.jsx)(r.code,{children:`ctx.kv`}),` 金钱、属性直接盖到读出的槽位上`]}),(0,n.jsx)(r.td,{children:`先决定字段属于跨局账号资料还是当前存档。属于一局的权威进度须按稳定存档 ID 隔离，并在服务端校验归属；不要用跨 chat 共用的同名 key 覆盖不同局的进度`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`启动读取和手动保存的最小骨架如下。`,(0,n.jsx)(r.code,{children:`validateAndMigrate`}),` 应拒绝损坏或不支持的存档，不能偷偷返回初始状态；界面的重试按钮重新调用对应函数并处理 rejection。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let state;
let storageReady = false;
let saving = false;

async function restoreGame() {
  storageReady = false;
  setGameControlsEnabled(false);
  setSaveStatus('读档中');
  try {
    const record = await dzmm.kv.get('game-state');
    const missing = record.value === null && record.updated_at === null;
    state = missing ? createInitialState() : validateAndMigrate(record.value);
    storageReady = true;
    setGameControlsEnabled(true);
    setSaveStatus(missing ? '尚未存档' : '已读取存档');
  } catch (error) {
    setSaveStatus('读档失败，请重试');
    throw error;
  }
}

async function saveGame() {
  if (!storageReady || saving) throw new Error('请先完成读档或等待本次保存结束');
  saving = true;
  setGameControlsEnabled(false);
  setSaveStatus('保存中');
  try {
    await dzmm.kv.put('game-state', state, { flush: true });
    setSaveStatus('已保存到云端');
  } catch (error) {
    setSaveStatus('保存失败，恢复连接或登录后请重试');
    throw error;
  } finally {
    saving = false;
    setGameControlsEnabled(storageReady);
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`“已读取存档”只说明恢复了上次的记录，不表示本局后续修改已经保存。保存失败后保留内存状态，不要自动调用 `,(0,n.jsx)(r.code,{children:`restoreGame()`}),` 丢掉尚未保存的进度。页面隐藏时的 flush 只能补救，不能保证浏览器或 App 被强关时仍能送达。`]}),`
`,(0,n.jsx)(r.p,{children:`发布前至少验证：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`从未存档、不打开读档面板，直接开始游戏后可以首次保存。`}),`
`,(0,n.jsx)(r.li,{children:`已有进度时模拟读档失败：显示错误和重试，不能写入默认值；恢复后仍能读回旧档。`}),`
`,(0,n.jsx)(r.li,{children:`模拟写入失败：不能出现“已保存”；恢复连接或登录后，同一份进度能再次保存。`}),`
`,(0,n.jsx)(r.li,{children:`保存后彻底关闭网页或 App，再进入同一游戏记录读档，关键进度一致。`}),`
`,(0,n.jsx)(r.li,{children:`已有档位时点新游戏并取消覆盖，旧档不变；多个档位、不同游戏记录的进度互不覆盖。`}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`启动时读一次，之后在内存里持有`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ✓ 进入游戏时把需要的存档一次读进内存，之后只改内存、按需 put
const state = (await kvGet('game-state')) ?? createInitialState();
function render() {
  drawHud(state); // 直接读内存
}

// ✗ 不要在渲染循环 / 定时器 / 每次打开菜单时反复 get
setInterval(async () => {
  const slots = await Promise.all([1, 2, 3, 4].map(i => kvGet(\`save-\${i}\`)));
  renderSlots(slots);
}, 1000);
`})}),`
`,(0,n.jsxs)(r.p,{children:[`每次 `,(0,n.jsx)(r.code,{children:`get`}),` 都是一次网络请求。把它写进渲染循环或定时器，几秒内就会攒出上百个请求，
被网关按 IP 限流后 `,(0,n.jsx)(r.code,{children:`get`}),` 会以 `,(0,n.jsx)(r.code,{children:`RATE_LIMITED`}),` 失败，整局游戏都会变卡。生产 Host 会把
同一 key 的并发 `,(0,n.jsx)(r.code,{children:`get`}),` 合并、并在约 1.5 秒内复用结果，这只是兜底，不是让你无限读的许可。
存档槽列表这类界面，打开时读一次并缓存在内存里，写入后自己更新内存即可。`]}),`
`,(0,n.jsx)(r.h3,{children:`关键状态"立即落盘"，不要等 unload`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ✓ 每次有意义的状态变化都立刻保存
async function onLevelComplete(level) {
  state.maxLevel = Math.max(state.maxLevel, level);
  await kvPut('progress', state, { critical: true });
}

// ✗ 不要等"页面退出"才保存 —— 玩家直接关标签时不会触发
window.addEventListener('beforeunload', () => {
  dzmm.kv.put('progress', state); // 大概率丢
});
`})}),`
`,(0,n.jsxs)(r.p,{children:[`玩家关标签 / 切应用时浏览器经常不给你时间执行 `,(0,n.jsx)(r.code,{children:`beforeunload`}),`，靠它存档基本不可靠。`]}),`
`,(0,n.jsx)(r.h3,{children:`复杂数据用一个 key 一次性存`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ✓ 一次性存整个游戏状态，原子读写
await kvPut('game-state', {
  level: 5,
  hp: 80,
  inventory: ['sword'],
  flags: { metKing: true },
}, { critical: true });

// ✗ 拆很多 key，要 race condition 自己想办法
await kvPut('level', 5);
await kvPut('hp', 80);
await kvPut('inventory', ['sword']);
// 中间任何一步失败 → 数据不一致
`})}),`
`,(0,n.jsxs)(r.p,{children:[`单个 key 尽量控制在 512 KB 以内。超过后离场时的排空时间会按体积延长，但慢网络下几 MB 的存档
仍可能在页面关闭前来不及落盘。图片、音频走资源接口，对话历史用 `,(0,n.jsx)(r.code,{children:`dzmm.chat`}),`，不要整段塞进 KV；
真的很大的状态可以拆成「热数据小 key + 冷数据大 key」，热数据频繁保存、冷数据只在变化时保存。`]}),`
`,(0,n.jsx)(r.h3,{children:`用版本号防止旧代码读到新数据`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const STATE_SCHEMA_VERSION = 2;

async function loadState() {
  const raw = await kvGet('game-state');
  if (!raw) return null;
  if (raw.version !== STATE_SCHEMA_VERSION) {
    // 旧版本，迁移或重置
    return migrateState(raw);
  }
  return raw;
}

async function saveState(state) {
  await kvPut('game-state', { ...state, version: STATE_SCHEMA_VERSION });
}
`})}),`
`,(0,n.jsx)(r.p,{children:`游戏迭代时改了存档结构，老玩家的旧存档不会让游戏崩。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`9. 常见错误码`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`Code`}),(0,n.jsx)(r.th,{children:`触发`}),(0,n.jsx)(r.th,{children:`建议`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`KEY_TOO_LONG`})}),(0,n.jsx)(r.td,{children:`putIfAbsent / batch / list / namespace key 或组合 prefix > 256 字符`}),(0,n.jsx)(r.td,{children:`用更短的 key / prefix`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`INVALID_REQUEST`})}),(0,n.jsxs)(r.td,{children:[`key 为空、含 NUL、是 `,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`}),`、含非法 Unicode，或 value 不能 JSON 序列化`]}),(0,n.jsx)(r.td,{children:`修正 key / value`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`VALUE_TOO_LARGE`})}),(0,n.jsx)(r.td,{children:`value 过大`}),(0,n.jsx)(r.td,{children:`拆分或压缩`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`KEY_NOT_FOUND`})}),(0,n.jsx)(r.td,{children:`不存在的 key`}),(0,n.jsxs)(r.td,{children:[`单个 `,(0,n.jsx)(r.code,{children:`get`}),` 返回 `,(0,n.jsx)(r.code,{children:`{ value: null, updated_at: null }`}),`；`,(0,n.jsx)(r.code,{children:`batchGet`}),` 对应条目为 `,(0,n.jsx)(r.code,{children:`null`}),`，`,(0,n.jsx)(r.code,{children:`delete`}),` 正常 resolve，都不会抛这个`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`RATE_LIMITED`})}),(0,n.jsx)(r.td,{children:`读取过于频繁，被网关按 IP 限流`}),(0,n.jsxs)(r.td,{children:[`SDK 已自动重试 2 次仍失败；检查是否把 `,(0,n.jsx)(r.code,{children:`get`}),` 写进了渲染循环或定时器`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`SERVICE_UNAVAILABLE`})}),(0,n.jsx)(r.td,{children:`存储短暂不可用`}),(0,n.jsx)(r.td,{children:`SDK 已自动重试；稍后再试，不要循环硬刷`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNAUTHORIZED`})}),(0,n.jsx)(r.td,{children:`登录态失效`}),(0,n.jsx)(r.td,{children:`提示重新进入游戏；后台自动存档遇到它不会再重试`})]})]})]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};