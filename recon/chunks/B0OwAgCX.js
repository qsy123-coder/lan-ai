(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`086145fe-dca9-46ee-bdcd-9e1a73a9dda5`,e._sentryDebugIdIdentifier=`sentry-dbid-086145fe-dca9-46ee-bdcd-9e1a73a9dda5`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`快速入门`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`新手提示：Workbench 是一个跑在浏览器里的"在线游戏编辑器"。你写的代码会自动同步到一个云端容器里跑起来，预览面板看到的就是真实运行效果。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`1. Workbench 是什么`}),`
`,(0,n.jsx)(r.p,{children:`一个在线游戏开发环境：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`左侧 Chat —— 跟 Agent 对话，让它帮你写代码 / 改 bug。`}),`
`,(0,n.jsx)(r.li,{children:`Chat / Preview / Files / Editor 等面板 —— 切换对话、预览、文件和编辑器；手机上的「···」可展开更多工具。`}),`
`,(0,n.jsx)(r.li,{children:`右上角「发布」按钮 —— 更新线上游戏版本；角色卡还需要单独上架审核，通过后玩家才可进入。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`平台只支持纯前端静态网站（HTML + CSS + JavaScript）。不能起 Node.js / Python 服务、不能监听端口、不能用 Express / Flask。`}),`
`,(0,n.jsxs)(r.p,{children:[`需要服务端逻辑（避免 prompt 直接随前端下发、防作弊、跨玩家共享）？看 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),`。注意：服务端 prompt 仍可能通过模型输出泄露，不是 secrets 存储。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`2. 目录结构`}),`
`,(0,n.jsx)(r.p,{children:`打开 Files 面板看到的目录：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{children:`/workspace/
├── publish/             ← 发布目录（玩家看到的就是这里）
│   ├── index.html       ← 入口文件（必需）
│   ├── style.css
│   ├── game.js
│   └── assets/
├── functions/           ← 服务端函数（可选）
│   ├── score.ts
│   └── leaderboard.ts
└── ... 其它都是工作目录
`})}),`
`,(0,n.jsxs)(r.h3,{children:[`关于 `,(0,n.jsx)(r.code,{children:`publish/`})]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`必须包含 `,(0,n.jsx)(r.code,{children:`index.html`}),` 作为入口。`]}),`
`,(0,n.jsx)(r.li,{children:`所有资源（图片、脚本、样式）都放在这里。`}),`
`,(0,n.jsxs)(r.li,{children:[`资源路径用相对路径（`,(0,n.jsx)(r.code,{children:`./assets/img.png`}),`），不要用 `,(0,n.jsx)(r.code,{children:`/assets/img.png`}),`。`]}),`
`,(0,n.jsx)(r.li,{children:`这里的静态文件会发布给玩家；工作区保存还会包含其他未忽略的项目文件，工具依赖放在外面也可能计入保存。`}),`
`]}),`
`,(0,n.jsxs)(r.h3,{children:[`关于 `,(0,n.jsx)(r.code,{children:`functions/`}),`（可选）`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`这里放你的`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/serverless`,children:`服务端函数`}),`源码（`,(0,n.jsx)(r.code,{children:`.ts`}),` 或 `,(0,n.jsx)(r.code,{children:`.js`}),` 单文件）。`]}),`
`,(0,n.jsx)(r.li,{children:`发布时会上传函数；注意发布结果里的函数警告，工坊可能保留上一次成功发布的函数。`}),`
`,(0,n.jsx)(r.li,{children:`不需要服务端函数的话，这个目录可以不存在。`}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`⚠️ 文件名规则：只能用英文字符`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`publish/`}),` 和 `,(0,n.jsx)(r.code,{children:`functions/`}),` 下所有路径的每一段都必须只包含：`]}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`ASCII 英文字母（a-z, A-Z）`}),`
`,(0,n.jsx)(r.li,{children:`数字（0-9）`}),`
`,(0,n.jsxs)(r.li,{children:[`下划线 `,(0,n.jsx)(r.code,{children:`_`}),`、连字符 `,(0,n.jsx)(r.code,{children:`-`}),`、点 `,(0,n.jsx)(r.code,{children:`.`})]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`不允许：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`不能用`}),(0,n.jsx)(r.th,{children:`改成`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`中文（`,(0,n.jsx)(r.code,{children:`角色外貌/`}),`、`,(0,n.jsx)(r.code,{children:`音效.mp3`}),`）`]}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`portraits/`}),`、`,(0,n.jsx)(r.code,{children:`bgm.mp3`})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`日文 / 韩文 / 其它非拉丁字母`}),(0,n.jsx)(r.td,{children:`翻译成英文`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`Emoji（`,(0,n.jsx)(r.code,{children:`🎵sounds/`}),`）`]}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`sounds/`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`带音符的拉丁字母（`,(0,n.jsx)(r.code,{children:`café/`}),`）`]}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`cafe/`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[`空格（`,(0,n.jsx)(r.code,{children:`my game.js`}),`）`]}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`my-game.js`}),` 或 `,(0,n.jsx)(r.code,{children:`my_game.js`})]})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`路径不能含空段、`,(0,n.jsx)(r.code,{children:`.`}),` / `,(0,n.jsx)(r.code,{children:`..`}),` 段；`,(0,n.jsx)(r.code,{children:`publish/`}),` 内的相对路径最长 1024 字符，顶层 `,(0,n.jsx)(r.code,{children:`__v`}),` 加数字的名字留给平台版本目录。
函数只支持 `,(0,n.jsx)(r.code,{children:`functions/`}),` 的直接子文件，名字须匹配 `,(0,n.jsx)(r.code,{children:`[A-Za-z0-9_-]+.ts`}),` 或 `,(0,n.jsx)(r.code,{children:`.js`}),`；同名的 `,(0,n.jsx)(r.code,{children:`.ts`}),` / `,(0,n.jsx)(r.code,{children:`.js`}),` 不能同时发布。`]}),`
`,(0,n.jsx)(r.p,{children:`为什么严格？线上发布走对象存储（CDN），非法静态路径会拒绝发布。工坊会跳过非法函数并给警告；CLI 会拒绝整次部署。`}),`
`,(0,n.jsx)(r.p,{children:`怎么检查？ 在 Terminal 面板跑：`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`node <<'NODE'
const { existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const invalid = [];
function scan(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (path.length > 1024 || (!prefix && /^__v\\d+$/.test(entry.name))
      || !/^[A-Za-z0-9._-]+$/.test(entry.name)
      || ['.', '..'].includes(entry.name)) invalid.push('publish/' + path);
    if (entry.isDirectory()) scan(join(dir, entry.name), path + '/');
  }
}
if (existsSync('publish')) scan('publish');
if (existsSync('functions')) {
  const names = new Set();
  for (const entry of readdirSync('functions', { withFileTypes: true })) {
    if (!entry.isFile() || !/\\.(ts|js)$/.test(entry.name)) continue;
    const match = /^([A-Za-z0-9_-]+)\\.(ts|js)$/.exec(entry.name);
    if (!match || names.has(match[1])) {
      invalid.push('functions/' + entry.name);
    }
    if (match) names.add(match[1]);
  }
}
console.log(invalid.length ? invalid.join('\\n') : '✓ 文件名合规');
process.exitCode = invalid.length ? 1 : 0;
NODE
`})}),`
`,(0,n.jsxs)(r.p,{children:[`这段文件名预检不依赖 `,(0,n.jsx)(r.code,{children:`grep -P`}),`，可在 Workbench Terminal、macOS / Linux 或 Windows 的 Bash 中运行。发布仍会检查入口、体积、HTML、函数源码等条件。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`3. 保存代码、发布与上架`}),`
`,(0,n.jsx)(r.p,{children:`这三个动作经常被混淆，这是开发中最容易踩的坑。`}),`
`,(0,n.jsx)(r.h3,{children:`保存代码（开发时同步）`}),`
`,(0,n.jsx)(r.p,{children:`编辑器保存文件只更新工作区；「保存版本」成功才代表平台已保存这次改动。Agent 可能帮你保存版本，但不要假设每次改动都会自动提交，先查看保存历史和未保存提示。这些操作都不改变玩家看到的线上版本。`}),`
`,(0,n.jsxs)(r.p,{children:[`工作区保存每次最多 512 个变更文件（新增、修改、删除合计），单文件最多 50 MiB，大文件传输合计最多 256 MiB，整次保存传输包部署默认也是 256 MiB。安装素材处理工具前，先用项目根目录 `,(0,n.jsx)(r.code,{children:`.gitignore`}),` 排除可重建的依赖与缓存；隐藏目录并不会自动忽略。完整限制、忽略示例和报错后的保全步骤见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/limits#workspace-save`,children:`工作区保存`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`发布（更新线上代码）`}),`
`,(0,n.jsx)(r.p,{children:`点击右上角「发布」按钮：`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsx)(r.li,{children:`有未保存改动时，在确认框选择「保存后发布」，等待保存成功`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`publish/`}),` 目录上传到线上 CDN`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`functions/`}),` 下的服务端函数打包上传（如果有）`]}),`
`,(0,n.jsx)(r.li,{children:`检查发布结果和函数警告；已公开的游戏会使用新版本`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`没发布时，玩家看到的仍是上一次发布的版本。还没上架的游戏，发布成功也不会自动公开；到角色详情页提交「上架」，审核通过后才可被玩家进入。详见`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/publishing`,children:`发布与上架`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`4. 工作台界面速查`}),`
`,(0,n.jsx)(r.p,{children:`手机底部有 4 个主面板，「···」展开更多工具；桌面在侧栏切换：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`面板`}),(0,n.jsx)(r.th,{children:`主要用途`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Chat`}),(0,n.jsxs)(r.td,{children:[`跟 Agent 对话（默认面板）。可以 `,(0,n.jsx)(r.code,{children:`@`}),` 提及文件、附带控制台日志、上传图片`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Preview`}),(0,n.jsx)(r.td,{children:`游戏预览。改了代码后点这里的刷新按钮才能看到最新效果`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Files`}),(0,n.jsx)(r.td,{children:`文件树管理，可拖拽上传`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Editor`}),(0,n.jsx)(r.td,{children:`VS Code 风格的代码编辑器`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Git（···）`}),(0,n.jsx)(r.td,{children:`查 commit 历史 / 回滚`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Terminal（···）`}),(0,n.jsx)(r.td,{children:`命令行`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`Settings（···）`}),(0,n.jsx)(r.td,{children:`改游戏信息 / 从线上恢复文件`})]})]})]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`5. 改代码后看不到效果？`}),`
`,(0,n.jsx)(r.p,{children:`先手动刷新 Preview，确认当前工作区的文件已经加载。`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsx)(r.p,{children:`切到底部 Preview 面板 → 点刷新按钮。`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`如果还是不行：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`看 Preview 面板下方的「控制台」，有红色错误吗？把内容发给 Agent，它能帮你定位。`}),`
`,(0,n.jsxs)(r.li,{children:[`看 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/faq`,children:`常见问题`}),`。`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};