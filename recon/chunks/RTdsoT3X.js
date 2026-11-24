(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`93985df3-9915-47be-8439-92198ebee1b6`,e._sentryDebugIdIdentifier=`sentry-dbid-93985df3-9915-47be-8439-92198ebee1b6`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.h1,{children:[`AI 画图与编辑 — `,(0,n.jsx)(r.code,{children:`dzmm.draw.*`})]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：用 AI 生成图片（`,(0,n.jsx)(r.code,{children:`generate`}),`）或者基于已有图编辑（`,(0,n.jsx)(r.code,{children:`edit`}),`）。两个 API 配额是分开的。生成 / 编辑都需要 5-60 秒，做好 loading UI。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`1. 生成图片 — `,(0,n.jsx)(r.code,{children:`draw.generate()`})]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const result = await dzmm.draw.generate({
  prompt: 'a cute pink-haired catgirl, anime style',
  dimension: '1:1',
});

img.src = result.images[0];             // 立刻渲染可以直接用
await dzmm.kv.put('avatar', { taskId: result.taskId, index: 0 }); // 存档只存 taskId
`})}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`⚠️ 图片 URL `,(0,n.jsx)(r.strong,{children:`一小时后失效`}),`。存档里存 `,(0,n.jsx)(r.code,{children:`taskId`}),`，渲染时用 `,(0,n.jsx)(r.code,{children:`draw.status(taskId)`}),`
现取新地址（见下面第 4 节）。把 URL 写进存档，玩家第二天回来看到的就是裂图。`]}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`参数`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`参数`}),(0,n.jsx)(`th`,{children:`类型`}),(0,n.jsx)(`th`,{children:`必需`}),(0,n.jsx)(`th`,{children:`说明`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`prompt`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsx)(`td`,{children:`图片描述，最长 2000 字符`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`dimension`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`'1:1' | '2:3' | '3:2'`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsx)(`td`,{children:`generate 模型只支持这 3 种比例（上游 SDXL 训练约束）`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`model`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`'anime' | 'iroha'`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsxs)(`td`,{children:[`默认 `,(0,n.jsx)(`code`,{children:`'anime'`}),`（二次元）；`,(0,n.jsx)(`code`,{children:`'iroha'`}),` 也是二次元风格`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`negativePrompt`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsx)(`td`,{children:`负面提示词，最长 2000 字符`})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  taskId: string;        // 任务 ID，可传给 status / download / nav；这个才是要存的
  status: string;        // 通常是 'completed'
  images: string[];      // 图片 URL 数组，带签名，签发后 1 小时失效
  createdAt: string;     // ISO 时间
  errorMessage?: string; // 如有上游错误
}
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`images`}),` 里的地址带访问签名，`,(0,n.jsx)(r.strong,{children:`签发后一小时过期`}),`，只适合当次渲染用，不能持久化。
`,(0,n.jsx)(r.code,{children:`taskId`}),` 长期有效（除非任务被删除），存它。`]}),`
`,(0,n.jsx)(r.h3,{children:`配额与计费`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`每日有配额限制（随负载调整）`}),`
`,(0,n.jsx)(r.li,{children:`配额用完后按所选模型价格扣玩家积分（Kagami Web 入口为 1 积分/张；本 SDK 现有模型为 5 积分/张）`}),`
`,(0,n.jsx)(r.li,{children:`单次生成耗时 10-60 秒`}),`
`]}),`
`,(0,n.jsx)(r.h3,{children:`提示词技巧`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ✓ 好：具体、有风格关键词
prompt: '1girl, long pink hair, blue eyes, white dress, ' +
        'flower field, sunlight, high quality, detailed'

// ✗ 差：太笼统，AI 没方向
prompt: 'a girl'

// 推荐的负面提示词（贴上就行，避免常见崩坏）
negativePrompt: 'lowres, bad anatomy, bad hands, text, error, ' +
                'missing fingers, worst quality, low quality, ' +
                'jpeg artifacts, watermark, blurry'
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`2. 编辑图片 — `,(0,n.jsx)(r.code,{children:`draw.edit()`})]}),`
`,(0,n.jsxs)(r.p,{children:[`基于一张或多张参考图做 AI 编辑。可以编辑 `,(0,n.jsx)(r.code,{children:`generate()`}),` 的结果，也可以编辑 canvas 截图 / 玩家上传的图。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// 用 generate 出来的图继续编辑
const generated = await dzmm.draw.generate({ prompt: '猫娘', dimension: '1:1' });
const edited = await dzmm.draw.edit({
  prompt: '换成蓝色头发',
  images: [generated.images[0]],
});

// 编辑 canvas 截图（指定 pro 模型 + 16:9 比例）
const dataUrl = canvas.toDataURL('image/png');
const editedWide = await dzmm.draw.edit({
  prompt: '添加魔法光效',
  images: [dataUrl],
  dimension: '16:9',
  model: 'pro',
});
`})}),`
`,(0,n.jsx)(r.h3,{children:`参数`}),`
`,(0,n.jsxs)(`table`,{children:[(0,n.jsx)(`thead`,{children:(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`th`,{children:`参数`}),(0,n.jsx)(`th`,{children:`类型`}),(0,n.jsx)(`th`,{children:`必需`}),(0,n.jsx)(`th`,{children:`说明`})]})}),(0,n.jsxs)(`tbody`,{children:[(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`prompt`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsx)(`td`,{children:`编辑描述，最长 2000 字符`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`images`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`string[]`})}),(0,n.jsx)(`td`,{children:`✅`}),(0,n.jsx)(`td`,{children:`1-4 张参考图。支持 URL（如 generate 结果）或 base64 data URL（canvas / FileReader）`})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`dimension`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`'1:1' | '2:3' | '3:2' | '4:3' | '3:4' | '16:9' | '9:16'`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsxs)(`td`,{children:[`默认 `,(0,n.jsx)(`code`,{children:`'1:1'`}),`。edit 支持 7 种比例（比 generate 多 4 种）`]})]}),(0,n.jsxs)(`tr`,{children:[(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`model`})}),(0,n.jsx)(`td`,{children:(0,n.jsx)(`code`,{children:`'lite' | 'pro'`})}),(0,n.jsx)(`td`,{children:`❌`}),(0,n.jsxs)(`td`,{children:[`默认 `,(0,n.jsx)(`code`,{children:`'lite'`}),`。`,(0,n.jsx)(`code`,{children:`'pro'`}),` 质量更高、速度较慢`]})]})]})]}),`
`,(0,n.jsx)(r.h3,{children:`参考图限制（Web 完整前置校验，Mobile 分层校验）`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`限制`}),(0,n.jsx)(r.th,{children:`数值`}),(0,n.jsx)(r.th,{children:`触发错误`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单图大小`}),(0,n.jsx)(r.td,{children:`≤ 10 MB`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`IMAGE_TOO_LARGE`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`单边像素`}),(0,n.jsx)(r.td,{children:`≤ 8192 px`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`IMAGE_DIMENSION_EXCEEDED`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`格式`}),(0,n.jsxs)(r.td,{children:[`仅 `,(0,n.jsx)(r.code,{children:`jpg`}),` / `,(0,n.jsx)(r.code,{children:`png`}),` / `,(0,n.jsx)(r.code,{children:`webp`})]}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNSUPPORTED_IMAGE_FORMAT`})})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`gif`}),` / `,(0,n.jsx)(r.code,{children:`avif`}),` / `,(0,n.jsx)(r.code,{children:`tiff`}),` 不支持，需要用 canvas 转格式后再传。`]}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[`新手提示：Web Host 会在上传前校验格式、大小和解码后的尺寸。Mobile Host 会先校验数量、MIME 和编码大小，尺寸由认证上传端点解码后校验，因此不合规图片可能发生一次校验上传，但不会进入付费 Draw 提交。写文件选择 UI 时记得同步把限制写进 `,(0,n.jsx)(r.code,{children:`<input accept="...">`}),` 和提示文字，别让玩家选完 50MB 大图再被拒绝。`]}),`
`]}),`
`,(0,n.jsxs)(r.h3,{children:[`多图编辑：`,(0,n.jsx)(r.code,{children:`images`}),` 数组顺序 = prompt 里的"图1 / 图2"`]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`images`}),` 数组顺序就是 prompt 里"图1 / 图2 / ..."的引用顺序。多图（≥ 2 张）时推荐用「图1 / 图2」（中文）或 `,(0,n.jsx)(r.code,{children:`image 1 / image 2`}),`（英文）对齐数组下标，比"那张人物图"这种描述更稳定。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`await dzmm.draw.edit({
  prompt: '把图1的角色放进图2的场景里',
  images: [characterRef, sceneRef], // 顺序对应 prompt 里"图1 / 图2"
});
`})}),`
`,(0,n.jsx)(r.p,{children:`常用场景模板：`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`场景`}),(0,n.jsx)(r.th,{children:`推荐模板`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`场景合成`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`把图1的角色放进图2的场景里`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`换装`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`把图1的衣服穿在图2身上`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`换脸`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`把图1的脸换到图2上`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`姿势迁移`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`让图1的人物摆出图2的姿势`})})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`风格融合`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`用图2的画风重画图1`})})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`业务代码可以保留语义命名（`,(0,n.jsx)(r.code,{children:`characterImage / sceneImage`}),`），调用 SDK 前显式映射成数组顺序，避免顺序错乱。`]}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsxs)(r.p,{children:[`同 `,(0,n.jsx)(r.code,{children:`draw.generate()`}),`。`]}),`
`,(0,n.jsx)(r.h3,{children:`配额与计费`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`edit 使用独立配额，与 generate 分开计算。`}),`
`,(0,n.jsx)(r.li,{children:`配额用完后扣玩家积分。`}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`3. 列出可用模型 — `,(0,n.jsx)(r.code,{children:`draw.generateModels()`}),` / `,(0,n.jsx)(r.code,{children:`draw.editModels()`})]}),`
`,(0,n.jsxs)(r.p,{children:[`可选：动态获取当前可用的绘图模型。硬编码 `,(0,n.jsx)(r.code,{children:`'anime'`}),` / `,(0,n.jsx)(r.code,{children:`'iroha'`}),` / `,(0,n.jsx)(r.code,{children:`'lite'`}),` / `,(0,n.jsx)(r.code,{children:`'pro'`}),` 也完全可以；list API 适合需要在 UI 里展示模型选择菜单的场景。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const { models, defaultModel } = await dzmm.draw.generateModels();
console.log(models);
// [{ id: 'anime', displayName: '🎨 anime', description: '...', isDefault: true }, ...]

// 推荐用法：用 defaultModel 兜底，模型名变了也不挂
await dzmm.draw.generate({
  prompt: '猫娘',
  dimension: '1:1',
  model: defaultModel ?? 'anime',
});
`})}),`
`,(0,n.jsx)(r.h3,{children:`返回值`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-typescript`,children:`{
  models: Array<{
    id: string;            // 传给 draw.generate() / edit() 的 model id
    displayName: string;   // UI 显示名（含 emoji）
    description: string;   // 简短说明
    isDefault: boolean;
  }>;
  defaultModel: string | null;
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`HTTP 响应缓存 5 分钟（`,(0,n.jsx)(r.code,{children:`Cache-Control: max-age=300`}),`），不用游戏侧再做缓存。`]}),`
`,(0,n.jsx)(r.li,{children:`generate / edit 的模型列表独立，分别调对应方法。`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`model`}),` 字段不传时服务端会用 default 兜底，所以硬编码也行。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`4. 取新图片地址 — `,(0,n.jsx)(r.code,{children:`draw.status(taskId)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`用 `,(0,n.jsx)(r.code,{children:`taskId`}),` 重新读取一个绘图任务，拿到`,(0,n.jsx)(r.strong,{children:`重新签名`}),`的图片地址。这是存档里图片能长期显示的唯一正确做法。`]}),`
`,(0,n.jsx)(r.h3,{children:`为什么需要它`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`generate()`}),` / `,(0,n.jsx)(r.code,{children:`edit()`}),` 返回的 `,(0,n.jsx)(r.code,{children:`images`}),` 是带签名的临时地址，签发后一小时失效。游戏把它当永久地址写进 KV 存档，玩家一小时后回来，图片请求就是 404 —— 而且游戏 iframe 是沙箱 + 匿名源，`,(0,n.jsx)(r.code,{children:`<img>`}),` 请求不带 Cookie，没有任何兜底，只会显示裂图。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`// ❌ 错误：把会过期的 URL 存进存档
await dzmm.kv.put('gallery', { url: result.images[0] });

// ✅ 正确：存 taskId，渲染时现取
await dzmm.kv.put('gallery', { taskId: result.taskId, index: 0 });

const saved = (await dzmm.kv.get('gallery')).value;
const task = await dzmm.draw.status(saved.taskId);
const url = task.images[saved.index];
if (url) img.src = url;
else showPlaceholder();   // 任务失败或已被删除
`})}),`
`,(0,n.jsx)(r.h3,{children:`用法`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const task = await dzmm.draw.status(taskId);
// task 的结构与 draw.generate() 返回值完全一致
if (task.images[0]) img.src = task.images[0];
`})}),`
`,(0,n.jsxs)(r.p,{children:[`参数：`,(0,n.jsx)(r.code,{children:`taskId`}),`（string）—— `,(0,n.jsx)(r.code,{children:`generate`}),` / `,(0,n.jsx)(r.code,{children:`edit`}),` 返回的那个。`]}),`
`,(0,n.jsxs)(r.p,{children:[`返回值：同 `,(0,n.jsx)(r.code,{children:`draw.generate()`}),`（`,(0,n.jsx)(r.code,{children:`{ taskId, status, images, createdAt, errorMessage? }`}),`），
`,(0,n.jsx)(r.code,{children:`images`}),` 每次调用都是新签发的地址。`]}),`
`,(0,n.jsx)(r.h3,{children:`注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`只能读当前玩家自己的任务，别人的任务读不到。`}),`
`,(0,n.jsx)(r.li,{children:`不消耗画图配额、不扣积分，是一次普通读取，不是重新生图。`}),`
`,(0,n.jsxs)(r.li,{children:[`不轮询，也不抛"任务失败"：任务还在生成中时 `,(0,n.jsx)(r.code,{children:`status`}),` 是 `,(0,n.jsx)(r.code,{children:`'pending'`}),` / `,(0,n.jsx)(r.code,{children:`'processing'`}),`，
失败的任务返回 `,(0,n.jsx)(r.code,{children:`status: 'failed'`}),`，这两种情况 `,(0,n.jsx)(r.code,{children:`images`}),` 都可能是空数组。
`,(0,n.jsx)(r.strong,{children:`取图前一定判空`}),`，不要把 `,(0,n.jsx)(r.code,{children:`undefined`}),` 赋给 `,(0,n.jsx)(r.code,{children:`img.src`}),`（会打出一次必然 404 的请求）。`]}),`
`,(0,n.jsxs)(r.li,{children:[`任务不存在或不属于当前玩家会抛 `,(0,n.jsx)(r.code,{children:`KEY_NOT_FOUND`}),`：当作"这张图已丢失"，渲染占位图，不要重试。
最常见的原因是玩家在自己的绘图历史里删掉了这张图；平台不会为这种情况给玩家弹错误提示，怎么展示由游戏决定。`]}),`
`,(0,n.jsx)(r.li,{children:`建议在渲染时才调用，不要在启动时把整个图库一次性刷新 —— 每张图一次请求。
同一张图在一小时内可以复用上次拿到的地址，进程内缓存即可。`}),`
`,(0,n.jsxs)(r.li,{children:[`宿主不支持时（`,(0,n.jsx)(r.code,{children:`(await dzmm.capabilities.get()).drawStatus !== true`}),`，例如尚未支持此能力的旧宿主）：
本次会话里 `,(0,n.jsx)(r.code,{children:`generate`}),` / `,(0,n.jsx)(r.code,{children:`edit`}),` 刚拿到的地址照常能用；但存档里只有 taskId 的老图换不到新地址，
渲染占位图并提示玩家重新生成，不要因此改回存 URL。`]}),`
`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`5. 下载图片 — `,(0,n.jsx)(r.code,{children:`draw.download(taskId)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`通过任务 ID 把图片下载到玩家设备。委托父窗口走服务端 API，下载时会重新校验当前登录用户，并为私密图片签发短期链接，同时绕过 iframe 沙箱的 CORS 限制（直接 `,(0,n.jsx)(r.code,{children:`fetch + blob`}),` 在沙箱里行不通）。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const r = await dzmm.draw.generate({ prompt: '猫娘', dimension: '1:1' });
dzmm.draw.download(r.taskId); // 玩家收到下载提示
`})}),`
`,(0,n.jsxs)(r.p,{children:[`参数：`,(0,n.jsx)(r.code,{children:`id`}),`（string）—— `,(0,n.jsx)(r.code,{children:`taskId`}),`，`,(0,n.jsx)(r.code,{children:`generate`}),` / `,(0,n.jsx)(r.code,{children:`edit`}),` 返回的那个。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsxs)(r.h2,{children:[`6. 打开绘图详情 — `,(0,n.jsx)(r.code,{children:`draw.nav(taskId)`})]}),`
`,(0,n.jsxs)(r.p,{children:[`在新标签页打开 `,(0,n.jsx)(r.code,{children:`/draw/:id`}),`，玩家可以收藏、分享。`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`const r = await dzmm.draw.generate({ prompt: '猫娘', dimension: '1:1' });
dzmm.draw.nav(r.taskId);
`})}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`7. 生产级最佳实践`}),`
`,(0,n.jsx)(r.h3,{children:`防重复点击（10-60 秒长任务必备）`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let drawing = false;

async function onClickGenerate() {
  if (drawing) return;
  drawing = true;
  setBtn({ disabled: true, label: '生成中…约 30 秒' });
  try {
    const r = await dzmm.draw.generate({ prompt, dimension: '1:1' });
    showImage(r.images[0]);
  } catch (e) {
    handleErr(e);
  } finally {
    drawing = false;
    setBtn({ disabled: false, label: '生成图片' });
  }
}
`})}),`
`,(0,n.jsx)(r.p,{children:`进度提示必须有可见的视觉变化（spinner、骨架），不要只 disable 按钮。`}),`
`,(0,n.jsx)(r.h3,{children:`Race condition 守卫`}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-javascript`,children:`let latest = 0;
async function regen() {
  const id = ++latest;
  const r = await dzmm.draw.generate({ prompt, dimension: '1:1' });
  if (id !== latest) return; // 已被新请求顶替，丢弃旧结果
  setImage(r.images[0]);
}
`})}),`
`,(0,n.jsx)(r.h3,{children:`三种"额度类"错误区别处理`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`Code`}),(0,n.jsx)(r.th,{children:`UX`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`RATE_LIMITED`})}),(0,n.jsx)(r.td,{children:`提示"稍等"，结束当前动作并提供显式重试入口`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`})}),(0,n.jsx)(r.td,{children:`弹充值 / VIP 引导，绝不重试`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`VIP_REQUIRED`})}),(0,n.jsx)(r.td,{children:`弹 VIP CTA`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`千万别把三种当一类，玩家会困惑。`}),`
`,(0,n.jsx)(r.h3,{children:`移动端首屏 ≤ 2 MB`}),`
`,(0,n.jsx)(r.p,{children:`参考图 + 封面 + bgm 加起来不要超过 2 MB —— 4G 网络 5 秒没出图玩家就走了。critical（首屏）和 lazy（按需 fetch）分清。`}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`8. 常见错误码`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`Code`}),(0,n.jsx)(r.th,{children:`触发`}),(0,n.jsx)(r.th,{children:`建议`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`IMAGE_TOO_LARGE`})}),(0,n.jsx)(r.td,{children:`参考图 > 10MB`}),(0,n.jsx)(r.td,{children:`让玩家换图`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`IMAGE_DIMENSION_EXCEEDED`})}),(0,n.jsx)(r.td,{children:`参考图任一边 > 8192px`}),(0,n.jsx)(r.td,{children:`让玩家缩小`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNSUPPORTED_IMAGE_FORMAT`})}),(0,n.jsx)(r.td,{children:`非 jpg / png / webp`}),(0,n.jsx)(r.td,{children:`让玩家换格式`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`INVALID_IMAGE_DATA`})}),(0,n.jsx)(r.td,{children:`data URL 解析失败`}),(0,n.jsx)(r.td,{children:`让玩家重新选图`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`IMAGE_NOT_FOUND`})}),(0,n.jsx)(r.td,{children:`edit 传入的图片 URL 失效`}),(0,n.jsx)(r.td,{children:`让玩家重新生成或选择`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`KEY_NOT_FOUND`})}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`draw.status`}),` 的 taskId 不存在或不属于当前玩家`]}),(0,n.jsx)(r.td,{children:`把这张图当作已丢失，渲染占位图`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`SENSITIVE_CONTENT_DETECTED`})}),(0,n.jsx)(r.td,{children:`提示词命中审查`}),(0,n.jsx)(r.td,{children:`让玩家改 prompt`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`NON_ANIME_IMAGE_DETECTED`})}),(0,n.jsx)(r.td,{children:`edit 仅支持动漫风格`}),(0,n.jsx)(r.td,{children:`让玩家换图`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`UNSUPPORTED_MODEL`})}),(0,n.jsx)(r.td,{children:`model 字段不在白名单`}),(0,n.jsx)(r.td,{children:`检查 model 字符串`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`})}),(0,n.jsx)(r.td,{children:`积分 / 额度耗尽`}),(0,n.jsx)(r.td,{children:`引导充值，不重试`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`DRAW_TIMEOUT`})}),(0,n.jsx)(r.td,{children:`单次生成超过 2 分钟`}),(0,n.jsx)(r.td,{children:`当前动作收口，等待玩家显式再次触发`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`完整字典见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/errors`,children:`错误处理大全`}),`。`]}),`
`,(0,n.jsx)(r.hr,{}),`
`,(0,n.jsx)(r.h2,{children:`9. 想"运行时按玩家输入生成图"？`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`dzmm.draw.*`}),` 就是为这个场景设计的（消耗玩家积分）。`]}),`
`,(0,n.jsx)(r.p,{children:`注意区分：如果是开发时让 Agent 帮你生成游戏素材（背景、按钮、立绘），那是 Agent 在容器内调 Relay API，走开发者你自己的额度，跟玩家无关。让 Agent 主动用就行，不用你写代码。`})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};