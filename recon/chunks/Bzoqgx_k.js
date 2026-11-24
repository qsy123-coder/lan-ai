(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8eb3a4b2-dc37-4a13-ba9e-44a03d6535ea`,e._sentryDebugIdIdentifier=`sentry-dbid-8eb3a4b2-dc37-4a13-ba9e-44a03d6535ea`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`聊天存档 — `,(0,n.jsx)(r.code,{children:`dzmm.chat.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`新手提示：把游戏的对话历史存到平台数据库里，支持分支。最常见的用途是 Galgame / 互动小说：玩家做不同选择走不同剧情，每个选择都是一个分支。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 核心概念：不透明 message ID 与稳定能力`}),`
`,(0,n.jsxs)(r.p,{children:[`所有版本的 Host 都会在旧顶层 `,(0,n.jsx)(r.code,{children:`insert().id`}),`、`,(0,n.jsx)(r.code,{children:`list()`}),` 或 `,(0,n.jsx)(r.code,{children:`timeline()`}),` 中返回平台生成的 message ID；新版 Host 还会返回与输入消息同序的 `,(0,n.jsx)(r.code,{children:`insert().ids`}),`。无论 Host 版本如何，调用方都必须把拿到的 ID 当作不透明值：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`只保存并原样回传 `,(0,n.jsx)(r.code,{children:`insert().id`}),` / `,(0,n.jsx)(r.code,{children:`insert().ids`}),`、`,(0,n.jsx)(r.code,{children:`list()`}),` 或 `,(0,n.jsx)(r.code,{children:`timeline()`}),` 返回的 ID`]}),`
`,(0,n.jsx)(r.li,{children:`不要解析 ID、拼接 ID、截取 UUID，也不要自行编造业务字符串充当 ID`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`只有 `,(0,n.jsx)(r.code,{children:`(await dzmm.capabilities.get()).chatStableIds === true`}),` 时，平台才额外保证新版 Chat 合同：`,(0,n.jsx)(r.code,{children:`insert().ids`}),` 存在；空 parent 会 append active leaf；明确 parent 会创建/继续分支；后续物理 chunk 拆分或迁移不会让已经返回的逻辑 ID 失效。旧 Host 会返回或被规范化为 `,(0,n.jsx)(r.code,{children:`false`}),`；基础 `,(0,n.jsx)(r.code,{children:`insert/list/timeline`}),` 仍可调用，但它的 parent、active-history 和返回结构属于 legacy 语义，新游戏不能拿它作为复杂剧情进度真源。`]}),`
`,(0,n.jsx)(r.p,{children:`这样可以做：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`多分支剧情：玩家选 A 和选 B 生成两条不同的子链`}),`
`,(0,n.jsx)(r.li,{children:`存档点：记住"我现在在哪个节点"，下次接着玩`}),`
`,(0,n.jsx)(r.li,{children:`读档：跳回某个旧节点，重新选择`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`P0 不承诺 `,(0,n.jsx)(r.code,{children:`ChatMessage.parent`}),` / `,(0,n.jsx)(r.code,{children:`children`}),` 字段。新游戏只依赖 `,(0,n.jsx)(r.code,{children:`insert`}),`、`,(0,n.jsx)(r.code,{children:`list`}),` 和 `,(0,n.jsx)(r.code,{children:`timeline`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`公开 API 只有这三个方法，没有 `,(0,n.jsx)(r.code,{children:`chat.append()`}),`。开始使用“分支后仍长期保存旧 ID”的能力前先检查 Host capability：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const caps = await dzmm.capabilities.get();
if (!caps.chatStableIds) {
  // 不禁用基础 Chat 调用；关闭现代分支流程，并用 KV 保存完整业务进度
  disableBranchSaveFeature();
}
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`2. 插入消息 — `,(0,n.jsx)(r.code,{children:`chat.insert(parentId, messages)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`当 `,(0,n.jsx)(r.code,{children:`chatStableIds === true`}),` 时，插入一组新消息由 `,(0,n.jsx)(r.code,{children:`parentId`}),` 决定“继续当前剧情”还是“从存档点分支”：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`空 Chat：`,(0,n.jsx)(r.code,{children:`null`}),` / `,(0,n.jsx)(r.code,{children:`undefined`}),` / `,(0,n.jsx)(r.code,{children:`''`}),` 创建第一条根剧情`]}),`
`,(0,n.jsxs)(r.li,{children:[`非空 Chat：`,(0,n.jsx)(r.code,{children:`null`}),` / `,(0,n.jsx)(r.code,{children:`undefined`}),` / `,(0,n.jsx)(r.code,{children:`''`}),` 追加到当前 active leaf，继续当前 active history`]}),`
`,(0,n.jsx)(r.li,{children:`明确传入一个 SDK 返回的 message ID：从该存档点创建/切换分支`}),`
`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 玩家选了"向左走"，AI 给出反应
const result = await dzmm.chat.insert(currentSavePoint, [
  { role: 'user', content: '向左走' },
  { role: 'assistant', content: '你走进了一片森林…' }
]);

console.log(result.ids);
// ['<opaque-id-1>', '<opaque-id-2>'] — 与输入 messages 同序；不要解析格式

console.log(result.id);      // 兼容旧代码：最后一条消息 ID
console.log(result.message); // 显式的最后一条消息

const lastId = result.ids?.[result.ids.length - 1] ?? result.id;
// 通常你会想记住"最后一条"作为新的存档点
`})}),`
`,(0,n.jsxs)(r.p,{children:[`如果 capability 为 `,(0,n.jsx)(r.code,{children:`false`}),`，只把 `,(0,n.jsx)(r.code,{children:`result.id`}),` 当作当前调用返回的 legacy
顶层字段；不要假设 `,(0,n.jsx)(r.code,{children:`result.ids`}),` 存在，也不要假设空 parent / 明确 parent
具备本页下面的 active-leaf 与分支语义。此时应由 KV 保存完整业务进度。`]}),`
`,(0,n.jsx)(r.h3,{children:`参数`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`参数`}),(0,n.jsx)(r.th,{children:`类型`}),(0,n.jsx)(r.th,{children:`必需`}),(0,n.jsx)(r.th,{children:`说明`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`parentId`})}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`string | null`})}),(0,n.jsx)(r.td,{children:`✅`}),(0,n.jsxs)(r.td,{children:[`SDK 返回的父消息 ID；`,(0,n.jsx)(r.code,{children:`null`}),` / `,(0,n.jsx)(r.code,{children:`undefined`}),` / `,(0,n.jsx)(r.code,{children:`''`}),` 在非空 Chat 中表示追加 active leaf，在空 Chat 中创建根消息`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`messages`})}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`Message[]`})}),(0,n.jsx)(r.td,{children:`✅`}),(0,n.jsxs)(r.td,{children:[`消息数组，至少 1 条。`,(0,n.jsx)(r.code,{children:`Message = { role: 'user' | 'assistant', content: string }`})]})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`多条消息会按输入顺序形成一条链。只有明确 ID 才表达“从这个存档点分支”；不要用空 parent 表达新分支。`}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`ChatMessage & {
  ids: string[];        // 新插入消息 ID；chatStableIds=true 时可跨后续分支长期保存
  message: ChatMessage; // 最后一条消息，和顶层 id/role/content/timestamp 相同
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`为兼容老游戏，返回对象顶层继续保留最后一条 `,(0,n.jsx)(r.code,{children:`ChatMessage`}),` 的字段。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. 读消息 — `,(0,n.jsx)(r.code,{children:`chat.list(ids?)`})]}),`
`,(0,n.jsx)(r.p,{children:`按 ID 列表批量取消息。不传 ID 时返回当前 active history，不会把其它历史分支全部混进来。`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 取当前 active history
const all = await dzmm.chat.list();

// 取指定几条；使用之前由 SDK 返回并保存的 ID
const some = await dzmm.chat.list(savedIds);
`})}),`
`,(0,n.jsxs)(r.p,{children:[`传入超过 100 个 ID 时，SDK 会按 Provider 单次上限自动分批，并按输入顺序合并结果；
`,(0,n.jsx)(r.code,{children:`timeline()`}),` 返回长时间线后可以直接交给 `,(0,n.jsx)(r.code,{children:`list()`}),`，不需要游戏自己切片。`]}),`
`,(0,n.jsx)(r.h3,{children:`单条消息结构`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  id: string;                      // 不透明 ID，只保存/回传；稳定保证受 capability 限定
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;               // ISO 时间
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[`Provider 单次最多读取 100 个 ID；新版 SDK 会自动分批并按输入顺序合并，
所以可以把长 `,(0,n.jsx)(r.code,{children:`timeline()`}),` 结果直接传给 `,(0,n.jsx)(r.code,{children:`list()`}),`。不要通过解析 ID 猜测相邻消息。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`4. 取时间线 — `,(0,n.jsx)(r.code,{children:`chat.timeline(messageId)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`传入一个由 SDK 返回的 message ID，取得该存档点对应的时间线 ID 序列；再交给 `,(0,n.jsx)(r.code,{children:`list(ids)`}),` 读取内容。需要跨复杂分支长期保存该 ID 时，先确认 `,(0,n.jsx)(r.code,{children:`chatStableIds === true`}),`。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const timelineIds = await dzmm.chat.timeline(currentSavePoint);

// 拿到所有消息内容
const messages = await dzmm.chat.list(timelineIds);
`})}),`
`,(0,n.jsx)(r.p,{children:`这是"读档"最常用的组合：拿到 timeline 后渲染整条线索给玩家看。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 完整示例：Galgame 存档系统`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let currentSavePoint = null;
let canPersistChatSavePoints = false;
let legacyHistory = [];
let storageMode = null;
let persistedStorageState = null;
const STORAGE_STATE_KEY = 'story:storageState';
const LEGACY_HISTORY_KEY = 'story:legacyHistory';
const STORAGE_SCHEMA_VERSION = 1;

async function persistStorageMode(mode) {
  storageMode = mode;
  canPersistChatSavePoints = mode === 'stable-chat';
  if (persistedStorageState?.schemaVersion === STORAGE_SCHEMA_VERSION
      && persistedStorageState.mode === mode) return;
  persistedStorageState = { schemaVersion: STORAGE_SCHEMA_VERSION, mode };
  await dzmm.kv.put(STORAGE_STATE_KEY, persistedStorageState);
}

async function initializeGame() {
  // 先读显式 storage mode 与 legacy KV，再检查当前 Host 能力。
  // 一旦进入 legacy-kv，Host 后续升级也不会隐式切换剧情真源。
  const [stateRecord, legacyRecord] = await Promise.all([
    dzmm.kv.get(STORAGE_STATE_KEY),
    dzmm.kv.get(LEGACY_HISTORY_KEY),
  ]);
  persistedStorageState = stateRecord?.value ?? null;
  const persistedMode = persistedStorageState?.schemaVersion === STORAGE_SCHEMA_VERSION
    ? persistedStorageState.mode
    : null;
  const hasLegacyHistory = legacyRecord?.updated_at != null;
  legacyHistory = Array.isArray(legacyRecord?.value) ? legacyRecord.value : [];
  const caps = await dzmm.capabilities.get();
  const mustStayLegacy = persistedMode === 'legacy-kv'
    || hasLegacyHistory
    || caps.chatStableIds !== true;
  await persistStorageMode(mustStayLegacy ? 'legacy-kv' : 'stable-chat');
  if (storageMode === 'legacy-kv') {
    // 基础 Chat 仍可调用，但不依赖 legacy parent/active-history/result.ids。
    // KV 保存完整剧情，才是旧 Host 以及升级后兼容路径的进度真源。
    disableBranchSaveFeature();
    if (legacyHistory.length > 0) {
      renderHistory(legacyHistory);
      return;
    }
    // 升级前若只有旧 Chat 数据，尽量导入当前 Host 能返回的 basic history。
    const basicHistory = await dzmm.chat.list();
    if (basicHistory.length > 0) {
      legacyHistory = basicHistory;
      renderHistory(legacyHistory);
      await dzmm.kv.put(LEGACY_HISTORY_KEY, legacyHistory);
      return;
    }
    return startGame();
  }
  return loadSave();
}

async function persistSavePoint() {
  if (canPersistChatSavePoints && currentSavePoint) {
    await dzmm.kv.put('savePoint', currentSavePoint);
  }
}

async function appendStory(messages) {
  const r = await dzmm.chat.insert(null, messages);
  currentSavePoint = r.ids?.[r.ids.length - 1] ?? r.id ?? null;
  if (storageMode === 'legacy-kv') {
    legacyHistory = [...legacyHistory, ...messages];
    await dzmm.kv.put(LEGACY_HISTORY_KEY, legacyHistory);
  }
  await persistSavePoint();
  return r;
}

// chatStableIds=true 时，空 Chat 的 null 创建第一条根剧情。
// 旧 Host 只把 Chat 调用当 best-effort 展示/记录，进度由 KV 保证。
async function startGame() {
  await appendStory([
    { role: 'assistant', content: '你在一个陌生的房间醒来…' }
  ]);
}

// 只有现代稳定合同才承诺 null append active leaf。
async function continueStory(choice) {
  await appendStory([
    { role: 'user', content: choice },
    { role: 'assistant', content: await generateResponse(choice) }
  ]);
}

// 玩家从旧存档点重选：只有明确传入旧 ID 才创建分支
async function branchFrom(savePoint, choice) {
  if (!canPersistChatSavePoints) {
    throw new Error('当前 Host 不支持稳定 Chat 分支存档');
  }
  const r = await dzmm.chat.insert(savePoint, [
    { role: 'user', content: choice },
    { role: 'assistant', content: await generateResponse(choice) }
  ]);
  currentSavePoint = r.ids[r.ids.length - 1];
  await persistSavePoint();
}

// 玩家回到游戏：读档
async function loadSave() {
  if (!canPersistChatSavePoints) return startGame();
  const saved = (await dzmm.kv.get('savePoint'))?.value;
  if (!saved) return loadExistingChatOrStart();
  const ids = await dzmm.chat.timeline(saved);
  if (ids.length === 0) return loadExistingChatOrStart();
  const history = await dzmm.chat.list(ids);
  renderHistory(history);
  currentSavePoint = saved;
}

async function loadExistingChatOrStart() {
  // 缺 savePoint 不等于新游戏；先确认 active Chat 是否真的为空。
  const history = await dzmm.chat.list();
  if (history.length === 0) return startGame();
  renderHistory(history);
  currentSavePoint = history[history.length - 1]?.id ?? null;
  await persistSavePoint();
}

void initializeGame();
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 开发模式 vs 生产模式`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`模式`}),(0,n.jsx)(r.th,{children:`行为`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`开发模式（Workbench 预览）`}),(0,n.jsx)(r.td,{children:`数据持久化到数据库，绑定一个隐藏的开发会话（dev chat），刷新 / 重开浏览器数据都在`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`生产模式（玩家游玩）`}),(0,n.jsx)(r.td,{children:`数据持久化到数据库，跟当前聊天会话绑定`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`预览挂在开发会话上，SDK 统一走真实后端；开发会话独立于玩家会话，与生产数据按命名空间隔离。即便如此，游戏初始化时仍要处理"无数据"分支：首次运行、点了「清除存储」之后都是空数据，不要假设上次保存的数据一定还在。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 限制`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`项`}),(0,n.jsx)(r.th,{children:`限制`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单次插入消息数`}),(0,n.jsx)(r.td,{children:`1–100 条`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单条消息大小`}),(0,n.jsx)(r.td,{children:`≤ 128 KiB（按 UTF-8 计）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单次插入总大小`}),(0,n.jsx)(r.td,{children:`≤ 512 KiB（按 UTF-8 计）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单聊天总消息数`}),(0,n.jsx)(r.td,{children:`无硬限，但建议合理使用`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`分支数`}),(0,n.jsx)(r.td,{children:`无硬限`})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 常见错误码`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`Code`}),(0,n.jsx)(r.th,{children:`含义`}),(0,n.jsx)(r.th,{children:`建议`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`CHAT_NOT_FOUND`}),` / `,(0,n.jsx)(r.code,{children:`chat_not_found`})]}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`chat.insert`}),` 明确传入的 parent message ID 不存在`]}),(0,n.jsx)(r.td,{children:`只使用 SDK 返回并持久保存的 ID；不要自行构造`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNAUTHORIZED`})}),(0,n.jsx)(r.td,{children:`登录态失效`}),(0,n.jsx)(r.td,{children:`提示重新进入游戏`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`NETWORK_ERROR`})}),(0,n.jsx)(r.td,{children:`网络瞬时`}),(0,n.jsx)(r.td,{children:`结束当前动作并提供显式重试入口`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`CHAT_NOT_FOUND`}),` 是浏览器 `,(0,n.jsx)(r.code,{children:`dzmm.chat.*`}),` 抛出的 `,(0,n.jsx)(r.code,{children:`DzmmError`}),` 形式，开发模式与生产模式
走同一条链路、行为一致；服务端函数里的 `,(0,n.jsx)(r.code,{children:`ctx.chat.*`}),` 错误经 `,(0,n.jsx)(r.code,{children:`dzmm.fn.*`}),` 返回时则是
`,(0,n.jsx)(r.code,{children:`RPCError(code: 'chat_not_found')`}),`。跨路径代码应兼容两种大小写，并按 `,(0,n.jsx)(r.code,{children:`error.code`}),` 判断。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`9. KV 和 Chat 都能存数据，怎么选？`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.th,{children:[`用 `,(0,n.jsx)(r.code,{children:`chat`}),` 当存档`]}),(0,n.jsxs)(r.th,{children:[`用 `,(0,n.jsx)(r.code,{children:`kv`}),` 存数据`]})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`有线性 / 树状关系（剧情节点）`}),(0,n.jsx)(r.td,{children:`没有关系（背包、分数）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`需要展示成对话气泡`}),(0,n.jsx)(r.td,{children:`需要快速读写键值`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家会"读档"回到某个节点`}),(0,n.jsx)(r.td,{children:`只关心"当前是什么状态"`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`典型搭配：用 `,(0,n.jsx)(r.code,{children:`chat`}),` 存剧情对话本身，用 `,(0,n.jsx)(r.code,{children:`kv`}),` 存"当前在哪个节点 ID"。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};