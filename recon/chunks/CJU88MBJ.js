(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6ea8a5ed-3991-4371-ace8-9e3e36013518`,e._sentryDebugIdIdentifier=`sentry-dbid-6ea8a5ed-3991-4371-ace8-9e3e36013518`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`音频播放`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：游戏里播 BGM 和音效，一律用 `,(0,n.jsx)(r.code,{children:`dzmm.audio.*`}),`，`,(0,n.jsxs)(r.strong,{children:[`不要自己 `,(0,n.jsx)(r.code,{children:`new Audio()`})]}),`。移动端浏览器（尤其 iOS Safari）会因为自动播放策略把裸 `,(0,n.jsx)(r.code,{children:`<audio>`}),` 静音，而且玩家在平台设置里调的音量对它不生效。SDK 统一处理首次手势解锁、BGM 交叉淡入淡出、切后台暂停和双轨音量。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`快速上手`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// BGM：切场景时调用。SDK 自动做单例管理和交叉淡入淡出，
// 重复调用同一首不会重头播放。
await dzmm.audio.play('bgm/daily/warm');

// 音效：即发即忘，内部有并发池。
dzmm.audio.play('sfx/ui/click');

// 环境循环音（雨、风）
dzmm.audio.play('sfx/env/rain-loop', { loop: true });
dzmm.audio.stop('sfx/env/rain-loop');

// 预加载关键音效，首次播放更跟手（可选）
dzmm.audio.preload(['sfx/ui/click', 'sfx/combat/hit']);
`})}),`
`,(0,n.jsx)(r.h2,{children:`key 与素材清单`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`play()`}),` 的参数是素材 key，来自游戏的 `,(0,n.jsx)(r.code,{children:`assets/audio/manifest.json`}),`（发布时随游戏打包）：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`sfx/ui/click`}),` —— 一个「概念」（family），SDK 会在它的多个变体里`,(0,n.jsx)(r.strong,{children:`随机挑一条`}),`播放，高频音（脚步、点击、打击）不容易听腻`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`sfx/ui/click#02`}),` —— 指定具体变体`]}),`
`,(0,n.jsxs)(r.li,{children:[`前缀 `,(0,n.jsx)(r.code,{children:`bgm/`}),` 的 key 走 BGM 轨（单例 + 淡入淡出），`,(0,n.jsx)(r.code,{children:`sfx/`}),` 走音效轨（并发池）`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`manifest 由开发助手（coding agent）在配音时自动维护，格式：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-json`,children:`{
  "version": 1,
  "assets": {
    "sfx/ui/click": { "source": "library", "variants": [{ "id": "01" }, { "id": "03" }] },
    "sfx/special/magic-burst": {
      "source": "local",
      "variants": [{ "id": "01", "path": "assets/audio/magic-burst-01.mp3" }]
    }
  }
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`library`}),` 条目引用平台公共素材库（全体游戏共享、跨游戏 CDN 缓存）；`,(0,n.jsx)(r.code,{children:`local`}),` 条目是本游戏专属文件。`]}),`
`,(0,n.jsx)(r.h2,{children:`API 参考`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`方法`}),(0,n.jsx)(r.th,{children:`说明`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.play(key, opts?)`})}),(0,n.jsxs)(r.td,{children:[`播放。`,(0,n.jsx)(r.code,{children:`opts.loop`}),`（BGM 默认 true，音效默认 false）、`,(0,n.jsx)(r.code,{children:`opts.volume`}),`（0–1，本次播放增益）。返回 `,(0,n.jsx)(r.code,{children:`Promise<{ok, reason?}>`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.stop(key?)`})}),(0,n.jsx)(r.td,{children:`不传 key 停当前 BGM 和循环音效；传 key 停对应 BGM 或该 family 的循环音效`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.stopAll()`})}),(0,n.jsx)(r.td,{children:`停下所有声音`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.preload(keys)`})}),(0,n.jsxs)(r.td,{children:[`提前拉取并解码音效（仅 `,(0,n.jsx)(r.code,{children:`sfx/`}),`）`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.setVolume(channel, v)`})}),(0,n.jsxs)(r.td,{children:[`游戏侧频道音量，`,(0,n.jsx)(r.code,{children:`channel`}),` 为 `,(0,n.jsx)(r.code,{children:`'bgm'`}),` 或 `,(0,n.jsx)(r.code,{children:`'sfx'`}),`，与玩家平台音量相乘生效`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`dzmm.audio.getVolume(channel)`})}),(0,n.jsx)(r.td,{children:`读游戏侧频道音量`})]})]})]}),`
`,(0,n.jsx)(r.h2,{children:`错误处理：不用 try/catch`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`play()`}),` `,(0,n.jsx)(r.strong,{children:`永远不会抛异常`}),`。失败时 resolve `,(0,n.jsx)(r.code,{children:`{ok: false, reason}`}),`（文件 404、清单缺失等），游戏主流程不受影响。唯一值得关注的返回是 `,(0,n.jsx)(r.code,{children:`{ok: true, reason: 'pending_gesture'}`}),`：浏览器还没收到用户手势，BGM 已排队，会在玩家第一次点击/触摸后自动开播——这是正常现象，不需要处理。`]}),`
`,(0,n.jsx)(r.h2,{children:`注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`首次播放必须发生在用户手势之后`}),`才有声音（浏览器策略）。把第一次 `,(0,n.jsx)(r.code,{children:`play('bgm/...')`}),` 放进「开始游戏」按钮的点击处理里最稳。`]}),`
`,(0,n.jsx)(r.li,{children:`玩家可以在游戏设置面板里分别调 BGM / 音效音量，游戏代码不需要自己做音量设置界面（做游戏内静音开关仍然推荐）。`}),`
`,(0,n.jsx)(r.li,{children:`页面切后台时 SDK 自动暂停，回前台自动续播。`}),`
`,(0,n.jsxs)(r.li,{children:[`旧版宿主可能没有音频能力：直接调用前判一下 `,(0,n.jsx)(r.code,{children:`if (dzmm.audio)`}),`，或用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/capabilities`,children:(0,n.jsx)(r.code,{children:`dzmm.capabilities.get()`})}),` 的 `,(0,n.jsx)(r.code,{children:`audio`}),` 位。`]}),`
`,(0,n.jsxs)(r.li,{children:[`大 BGM 不要塞进首屏加载路径；需要提示加载进度时用 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/sdk/loading`,children:`启动加载状态`}),`。`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};