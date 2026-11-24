(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e5cd424b-e7fb-4eb1-8f75-bc7c6d38c7a2`,e._sentryDebugIdIdentifier=`sentry-dbid-e5cd424b-e7fb-4eb1-8f75-bc7c6d38c7a2`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`启动加载状态`}),`
`,(0,n.jsxs)(r.p,{children:[`资源多的游戏启动时，iframe 的 `,(0,n.jsx)(r.code,{children:`load`}),` 事件可能很晚才触发。平台会尽量判断游戏是否还活着，但如果游戏在下载图片、音频、字体、WASM 或大 JS bundle 时完全没有任何信号，就可能被误判成卡死或空白。`]}),`
`,(0,n.jsxs)(r.p,{children:[`新游戏只要有明显预加载，就要用 `,(0,n.jsx)(r.code,{children:`dzmm.loading.*`}),` 主动告诉平台：游戏还在加载、首帧已经好了，或者启动失败了。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. API 一览`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`dzmm.loading.progress({
  phase: 'resource_loading',
  loadedResources: 3,
  totalResources: 10,
  loadedBytes: 420000,
  totalBytes: 2100000,
  currentResource: './assets/background.jpg',
  message: 'Loading assets',
});

dzmm.loading.ready();

dzmm.loading.error('ASSET_LOAD_FAILED', 'Failed to load background.jpg');
`})}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`方法`}),(0,n.jsx)(r.th,{children:`作用`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.loading.progress(payload?)`})}),(0,n.jsx)(r.td,{children:`告诉平台游戏启动仍在推进，刷新宿主 loading 状态`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.loading.ready()`})}),(0,n.jsx)(r.td,{children:`首个可交互画面已经渲染，可以移除宿主 loading`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.loading.error(code, message?)`})}),(0,n.jsx)(r.td,{children:`启动不可恢复失败，平台显示失败状态`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`一旦调用过 `,(0,n.jsx)(r.code,{children:`progress()`}),`，平台就进入显式 loading 流程：普通 `,(0,n.jsx)(r.code,{children:`window.load`}),`、alive
或 blank 探测不会提前把宿主 loading 隐藏。之后必须调用 `,(0,n.jsx)(r.code,{children:`ready()`}),` 或 `,(0,n.jsx)(r.code,{children:`error()`}),`
明确结束；Web 和移动端行为一致。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 什么时候必须用`}),`
`,(0,n.jsx)(r.p,{children:`下面任一情况都建议使用：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`首屏资源加载可能超过 3 秒。`}),`
`,(0,n.jsx)(r.li,{children:`需要预加载多张图片、音频、字体、关卡 JSON。`}),`
`,(0,n.jsx)(r.li,{children:`使用 Phaser、Three.js、WASM 或体积较大的运行时 bundle。`}),`
`,(0,n.jsx)(r.li,{children:`移动网络下可能长时间白屏。`}),`
`,(0,n.jsx)(r.li,{children:`启动期有自己的 asset manifest / runtime 初始化流程。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`资源很少的简单 DOM 游戏可以继续依赖默认探测，但新游戏尽量都加上，成本很低。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. `,(0,n.jsx)(r.code,{children:`progress()`}),` payload`]}),`
`,(0,n.jsx)(r.p,{children:`所有字段都是可选的。SDK 会丢弃非法值和嵌套对象，只转发小的 JSON-safe 字段。`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`字段`}),(0,n.jsx)(r.th,{children:`类型`}),(0,n.jsx)(r.th,{children:`说明`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`phase`})}),(0,n.jsx)(r.td,{children:"`'start'"}),(0,n.jsx)(r.td,{children:`'resource_loading'`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`loadedResources`})}),(0,n.jsx)(r.td,{children:`number`}),(0,n.jsx)(r.td,{children:`已加载资源数，非负数`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`totalResources`})}),(0,n.jsx)(r.td,{children:`number`}),(0,n.jsx)(r.td,{children:`总资源数，非负数`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`loadedBytes`})}),(0,n.jsx)(r.td,{children:`number`}),(0,n.jsx)(r.td,{children:`已加载字节数，非负数`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`totalBytes`})}),(0,n.jsx)(r.td,{children:`number`}),(0,n.jsx)(r.td,{children:`总字节数，非负数`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`currentResource`})}),(0,n.jsx)(r.td,{children:`string`}),(0,n.jsx)(r.td,{children:`当前资源名或相对路径`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`message`})}),(0,n.jsx)(r.td,{children:`string`}),(0,n.jsx)(r.td,{children:`给玩家看的短文案`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`阶段建议：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`phase`}),(0,n.jsx)(r.th,{children:`何时发送`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`start`})}),(0,n.jsx)(r.td,{children:`主脚本开始执行后立刻发`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`resource_loading`})}),(0,n.jsx)(r.td,{children:`下载图片、音频、字体、关卡 JSON 时`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`runtime_initializing`})}),(0,n.jsx)(r.td,{children:`初始化引擎、WASM、游戏状态时`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`first_frame`})}),(0,n.jsx)(r.td,{children:`即将渲染首帧或已经安排首帧`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`ready`})}),(0,n.jsxs)(r.td,{children:[`通常直接用 `,(0,n.jsx)(r.code,{children:`dzmm.loading.ready()`})]})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 推荐模板`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const assetUrls = [
  './assets/player.png',
  './assets/background.jpg',
  './assets/enemy.png',
];

dzmm.loading.progress({ phase: 'start', message: 'Preparing game' });

function showBootError(message) {
  document.body.innerHTML = \`<main class="boot-error">\${message}</main>\`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(\`Failed to load \${url}\`));
    img.src = url;
  });
}

async function boot() {
  try {
    const images = {};

    for (let i = 0; i < assetUrls.length; i += 1) {
      const url = assetUrls[i];
      dzmm.loading.progress({
        phase: 'resource_loading',
        loadedResources: i,
        totalResources: assetUrls.length,
        currentResource: url,
        message: 'Loading assets',
      });

      images[url] = await loadImage(url);
    }

    dzmm.loading.progress({
      phase: 'runtime_initializing',
      loadedResources: assetUrls.length,
      totalResources: assetUrls.length,
      message: 'Starting game',
    });

    startGame(images);

    requestAnimationFrame(() => {
      dzmm.loading.ready();
    });
  } catch (err) {
    dzmm.loading.error('BOOT_FAILED', err?.message || 'Game failed to start');
    showBootError('加载失败，请刷新重试');
  }
}

boot();
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 使用规则`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`第一次 `,(0,n.jsx)(r.code,{children:`progress()`}),` 要尽量早，通常放在主脚本顶部。`]}),`
`,(0,n.jsxs)(r.li,{children:[`不要等 `,(0,n.jsx)(r.code,{children:`window.onload`}),` 或所有资源加载完才第一次上报。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`ready()`}),` 只能在首个可见、可交互画面渲染后调用。`]}),`
`,(0,n.jsxs)(r.li,{children:[`启动失败时，既要 `,(0,n.jsx)(r.code,{children:`dzmm.loading.error(code, message)`}),` 通知平台，也要在游戏内渲染失败/重试 UI。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`progress()`}),` 不要放进每帧循环；按资源完成、阶段切换，或最多每约 500ms 上报即可。`]}),`
`,(0,n.jsx)(r.li,{children:`宿主在 30 秒没有握手或新进度时显示可重试失败，并有 120 秒启动硬上限；长加载要持续上报真实进度，但仍要控制总耗时。`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`currentResource`}),` 不要放带签名参数、token、玩家 ID 的完整私有 URL；用相对路径或文件名。`]}),`
`,(0,n.jsx)(r.li,{children:`payload 只传小字段，不要传 DOM、Error、Blob、ArrayBuffer、大数组或嵌套对象。`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`dzmm.loading.*`}),` 只负责启动期宿主 loading；游戏内 AI 生成、抽卡、战斗结算等长任务仍然要自己做 loading / 防重复 / 错误 UI。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`6. 反模式`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ❌ 太晚：资源都加载完才第一次上报，中途仍可能被判定超时
window.onload = () => dzmm.loading.progress({ phase: 'ready' });

// ❌ 糊弄 ready：首屏还没渲染，玩家仍看到白屏
dzmm.loading.ready();
initBigEngineAndLoadAssets();

// ❌ 高频刷 progress：每帧 postMessage，浪费主线程
function loop() {
  dzmm.loading.progress({ message: 'Loading' });
  requestAnimationFrame(loop);
}

// ❌ 泄漏敏感信息：不要把带签名参数的 URL 发给宿主/日志
dzmm.loading.progress({ currentResource: signedPrivateUrl });

// ❌ 调过 progress 却不收口：宿主会一直等到 timeout
dzmm.loading.progress({ phase: 'resource_loading' });
startGame();
// 缺少 dzmm.loading.ready() / dzmm.loading.error(...)
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 和游戏内 loading 的区别`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.loading.*`}),` 是给平台宿主看的启动信号，解决的是"平台是否还应该继续等这个 iframe"。`]}),`
`,(0,n.jsx)(r.p,{children:`你自己的游戏 UI 仍然要显示 loading、进度条、失败重试按钮。玩家能看到的体验靠游戏 UI，平台 loading 只是兜底保护。`})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};