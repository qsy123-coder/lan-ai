(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`43a1e767-14a3-491d-a90b-b47f73f48c83`,e._sentryDebugIdIdentifier=`sentry-dbid-43a1e767-14a3-491d-a90b-b47f73f48c83`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`存档生命周期 — `,(0,n.jsx)(r.code,{children:`dzmm.save.onAction`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：玩家在游戏容器里点“重置存档”或“删除游戏记录”时，平台不会直接猜你的存档结构，也不会默认强删 KV。你要注册 `,(0,n.jsx)(r.code,{children:`dzmm.save.onAction`}),`，告诉平台这个游戏支持安全处理存档。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. 什么时候必须接`}),`
`,(0,n.jsx)(r.p,{children:`只要游戏有进度、背包、关卡、角色状态、解谜状态、抽卡结果、养成数据，就应该接：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`dzmm.save.onAction(async (request) => {
  if (request.action === 'reset') {
    // 玩家想保留这条游玩记录，但重新开始
  }

  if (request.action === 'prepareDeleteRecord') {
    // 玩家想从列表删除这条记录；游戏先清理自己的存档
  }
});
`})}),`
`,(0,n.jsx)(r.p,{children:`如果不接，平台会认为这个游戏不支持容器级存档操作：玩家不会被强制提供“重置/删除存档”能力。`}),`
`,(0,n.jsxs)(r.p,{children:[`设置页的“该游戏暂未支持存档操作”只表示未接入这里的重置／删除 handler，不能据此判断游戏不能保存，也不能拿它当本次存档是否落盘的状态。普通存档仍使用 `,(0,n.jsx)(r.code,{children:`dzmm.kv`}),`，并由游戏显示保存中、服务端已确认或失败，详见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/kv`,children:`KV 存档接入`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 最小完整模板`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let autosaveEnabled = true;
let state = createInitialState();

function stopAutosave() {
  autosaveEnabled = false;
}

async function saveState() {
  if (!autosaveEnabled) return;
  await dzmm.kv.put('game-state', state);
}

async function clearOwnedSaveKeys() {
  await dzmm.kv.delete('game-state');
  await dzmm.kv.delete('checkpoint');
  await dzmm.kv.delete('inventory');
}

dzmm.save.onAction(async (request) => {
  stopAutosave();

  if (request.action === 'reset') {
    await clearOwnedSaveKeys();
    state = createInitialState();
    return { ok: true, reload: true };
  }

  if (request.action === 'prepareDeleteRecord') {
    await clearOwnedSaveKeys();
    return { ok: true };
  }

  return { ok: false, code: 'unsupported' };
});
`})}),`
`,(0,n.jsx)(r.p,{children:`关键点：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`先停 autosave，再删 key。`}),`
`,(0,n.jsx)(r.li,{children:`删掉这个游戏自己拥有的所有存档 key。`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`reset`}),` 成功后通常返回 `,(0,n.jsx)(r.code,{children:`{ reload: true }`}),`，让平台重新加载 iframe。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`prepareDeleteRecord`}),` 只表示“我已经清理/准备好了”，真正删除列表记录由平台完成。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. request 字段`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`type SaveActionRequest = {
  requestId: string;
  action: 'reset' | 'prepareDeleteRecord';
  reason: 'user_reset_save' | 'user_delete_record';
  timeoutMs: number;
};
`})}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`字段`}),(0,n.jsx)(r.th,{children:`说明`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`requestId`})}),(0,n.jsx)(r.td,{children:`平台生成的本次操作 ID。只用于日志 / 防重复。`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`action`})}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`reset`}),` = 重置进度；`,(0,n.jsx)(r.code,{children:`prepareDeleteRecord`}),` = 删除记录前清理。`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`reason`})}),(0,n.jsxs)(r.td,{children:[`玩家触发原因。当前和 `,(0,n.jsx)(r.code,{children:`action`}),` 一一对应。`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`timeoutMs`})}),(0,n.jsx)(r.td,{children:`平台等待时间。请在这个时间内完成清理并返回。`})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`type SaveActionResult =
  | { ok: true; message?: string; reload?: boolean }
  | { ok: false; code?: string; message?: string };
`})}),`
`,(0,n.jsx)(r.p,{children:`成功：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`return { ok: true, reload: true };
`})}),`
`,(0,n.jsx)(r.p,{children:`失败并阻止平台继续：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`return {
  ok: false,
  code: 'save_locked',
  message: '战斗结算中，稍后再试',
};
`})}),`
`,(0,n.jsxs)(r.p,{children:[`如果返回 `,(0,n.jsx)(r.code,{children:`ok: false`}),`、抛异常或超时，平台不会继续删除记录，也不会强制删除存档。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 常见错误`}),`
`,(0,n.jsx)(r.h3,{children:`❌ 只删一个 key`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.kv.delete('game-state');
return { ok: true };
`})}),`
`,(0,n.jsxs)(r.p,{children:[`如果你还把进度存在 `,(0,n.jsx)(r.code,{children:`checkpoint`}),` / `,(0,n.jsx)(r.code,{children:`inventory`}),` / `,(0,n.jsx)(r.code,{children:`flags`}),`，旧进度会残留。把存档 key 集中维护：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const SAVE_KEYS = ['game-state', 'checkpoint', 'inventory', 'flags'];

async function clearOwnedSaveKeys() {
  await Promise.all(SAVE_KEYS.map(key => dzmm.kv.delete(key)));
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`❌ 删完后 autosave 又写回旧数据`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await clearOwnedSaveKeys();
autosave(); // 把旧 state 又写回去了
`})}),`
`,(0,n.jsx)(r.p,{children:`清理前先停 autosave，并把内存 state 重置：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`stopAutosave();
await clearOwnedSaveKeys();
state = createInitialState();
`})}),`
`,(0,n.jsxs)(r.h3,{children:[`❌ 误解 `,(0,n.jsx)(r.code,{children:`prepareDeleteRecord`})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`prepareDeleteRecord`}),` 不是让游戏删除平台记录。游戏只能清理自己的存档、停止计时器、取消 autosave、上报统计。平台收到成功后才会删除这条游戏记录。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 和 KV 的关系`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.kv`}),` 仍然是推荐的玩家存档方式。`,(0,n.jsx)(r.code,{children:`dzmm.save.onAction`}),` 不是新存储，它只是让平台在玩家触发容器级操作时，给游戏一个“自己处理存档”的机会。`]}),`
`,(0,n.jsxs)(r.p,{children:[`如果游戏还用了内存缓存或服务端函数里的 `,(0,n.jsx)(r.code,{children:`ctx.kv`}),`，也要在 handler 里一起处理。平台无法知道这些数据的含义。DZMM 沙箱不能使用 `,(0,n.jsx)(r.code,{children:`localStorage`}),`，不要把它当成存档清理或保存的兜底。`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};