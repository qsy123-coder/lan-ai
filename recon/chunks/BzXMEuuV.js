(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`84c278f7-82db-4cf5-8a1c-cc1db9d9c2d4`,e._sentryDebugIdIdentifier=`sentry-dbid-84c278f7-82db-4cf5-8a1c-cc1db9d9c2d4`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,li:`li`,p:`p`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`发布与上架`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsxs)(r.strong,{children:[`发布前请落实`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help#game-basic-rules`,children:`游戏基本规则`})]}),`：在游戏首页或开始前醒目展示规则及`,(0,n.jsx)(r.a,{href:`/community-guidelines`,children:`《社区公约》`}),`链接，确保用户开始游玩前能看见；联机、聊天或语音入口还须再次提示。出现违规时，作者须配合平台管控；情节恶劣的，平台会直接下架游戏。`]}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`保存代码、`,(0,n.jsx)(r.strong,{children:`发布游戏版本`}),`和`,(0,n.jsx)(r.strong,{children:`上架角色卡`}),`是三个动作。发布与上架互相独立，发布完成还不会自动对玩家公开。
这一页把两者讲清楚。`]}),`
`,(0,n.jsx)(r.h2,{children:`两个动作`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{}),(0,n.jsx)(r.th,{children:`发布（游戏代码）`}),(0,n.jsx)(r.th,{children:`上架（角色卡）`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`在哪做`}),(0,n.jsxs)(r.td,{children:[`工坊右上角「发布」，或 CLI `,(0,n.jsx)(r.code,{children:`gamefy deploy`})]}),(0,n.jsx)(r.td,{children:`角色详情页的「上架」按钮`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`做了什么`}),(0,n.jsxs)(r.td,{children:[`把 `,(0,n.jsx)(r.code,{children:`publish/`}),` 和 `,(0,n.jsx)(r.code,{children:`functions/`}),` 推到线上`]}),(0,n.jsx)(r.td,{children:`把这张卡提交审核`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`改变可见性吗`}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.strong,{children:`不改变`})}),(0,n.jsx)(r.td,{children:`审核通过后才公开`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`可以重复做吗`}),(0,n.jsx)(r.td,{children:`可以，每次覆盖线上版本`}),(0,n.jsx)(r.td,{children:`可以，但有每日配额`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`先发布，后上架`}),`。没有成功发布过的游戏无法上架——上架时会去取线上的 `,(0,n.jsx)(r.code,{children:`index.html`}),`，
取不到就拒绝，报「请先在 Workbench 中保存游戏后再上架」。`]}),`
`,(0,n.jsx)(r.h2,{children:`发布做了什么`}),`
`,(0,n.jsxs)(r.p,{children:[`先完成代码保存，再发布。按顺序：校验这张卡属于你且是游戏卡 → 铸一个新版本号 → 收集 `,(0,n.jsx)(r.code,{children:`publish/`}),` 下的文件 →
校验 `,(0,n.jsx)(r.code,{children:`index.html`}),` 存在且是合法 HTML → 上传静态文件到新版本目录 → 上传 `,(0,n.jsx)(r.code,{children:`functions/`}),` 源码 →
`,(0,n.jsx)(r.strong,{children:`在一个事务里把线上指针切到新版本`}),`。`]}),`
`,(0,n.jsx)(r.p,{children:`几个后果值得记住：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`静态版本指针的切换是原子的`}),`。静态文件上传失败时保留旧版本，玩家不会看到半套静态文件。工坊的函数上传是另一条流程：某个函数失败或文件名非法时会发出警告，新静态版本仍可能发布，线上函数会保留此前的版本或清单。看到警告必须修复后重新发布，不能把静态发布成功当成函数也已更新。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`文件名必须是 ASCII`}),`。含中文或其它非 ASCII 字符的路径会被直接拒绝，并列出需要改名的文件。`]}),`
`,(0,n.jsxs)(r.li,{children:[`只有 `,(0,n.jsx)(r.code,{children:`publish/`}),` 目录下的文件会给玩家。`,(0,n.jsx)(r.code,{children:`functions/`}),` 是服务端代码，玩家拿不到。`]}),`
`,(0,n.jsxs)(r.li,{children:[`发布`,(0,n.jsx)(r.strong,{children:`不会`}),`改变游戏对玩家的可见性。`]}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`发布时的提示`}),`
`,(0,n.jsxs)(r.p,{children:[`发布过程中，工坊会留意几种容易让玩家卡顿、白屏或闪退的情况，发现了就弹出黄色提示。`,(0,n.jsx)(r.strong,{children:`提示只是提醒，不会拦住发布`}),`——这次发布照常完成，改不改由你决定，建议改好后再发布一次。`]}),`
`,(0,n.jsxs)(r.p,{children:[`除了「`,(0,n.jsx)(r.code,{children:`index.html`}),` 引用了没有包含在本次发布里的资源」和「整个游戏超过 20 MB」这两条老提示，现在还会提醒下面三种：`]}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`提示`}),(0,n.jsx)(r.th,{children:`什么时候出现`}),(0,n.jsx)(r.th,{children:`为什么要改`}),(0,n.jsx)(r.th,{children:`怎么改`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`引用了国外字体服务`}),(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`publish/`}),` 里的 HTML、CSS、JS 引用了谷歌字体（`,(0,n.jsx)(r.code,{children:`fonts.googleapis.com`}),`、`,(0,n.jsx)(r.code,{children:`fonts.gstatic.com`}),`）、Adobe Fonts、Font Awesome 在线服务这类国外字体服务`]}),(0,n.jsx)(r.td,{children:`国内玩家可能打不开这些地址，字体加载不出来会拖慢甚至卡住游戏启动`}),(0,n.jsxs)(r.td,{children:[`把字体文件下载下来放进 `,(0,n.jsx)(r.code,{children:`publish/`}),`（比如 `,(0,n.jsx)(r.code,{children:`publish/fonts/`}),`），在 CSS 里用 `,(0,n.jsx)(r.code,{children:`@font-face`}),` 指向这份随包的字体文件，再删掉原来的在线引用`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`从外部域名加载脚本`}),(0,n.jsxs)(r.td,{children:[`HTML 里的 `,(0,n.jsx)(r.code,{children:`<script src>`}),`、代码里的 `,(0,n.jsx)(r.code,{children:`import()`}),`、`,(0,n.jsx)(r.code,{children:`importScripts()`}),`、运行时创建的 `,(0,n.jsx)(r.code,{children:`<script>`}),` 指向了本站以外的网址`]}),(0,n.jsx)(r.td,{children:`国内网络常常打不开这些地址，只要有一个脚本没加载上，整局游戏就可能起不来；对方改了内容，你的游戏也会跟着变`}),(0,n.jsxs)(r.td,{children:[`把脚本下载下来放进 `,(0,n.jsx)(r.code,{children:`publish/`}),`，改成引用随包的相对路径`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`图片过大`}),(0,n.jsx)(r.td,{children:`有单张图片超过 1 MB（PNG、JPG、GIF、WebP、AVIF、BMP、TIFF）；提示会列出文件名和大小，最多列五张，其余只给个数`}),(0,n.jsx)(r.td,{children:`大图下载慢，手机内存吃紧时容易让游戏卡顿甚至闪退`}),(0,n.jsx)(r.td,{children:`缩小图片尺寸、降低质量，或转成 WebP 这类更小的格式`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`几点说明：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`这三项只看 `,(0,n.jsx)(r.code,{children:`publish/`}),` 里的文件：字体和脚本检查读的是 HTML、CSS、JS 里明写出来的网址，用代码拼出来的网址查不到；指向本站自己的地址不算外部。`]}),`
`,(0,n.jsx)(r.li,{children:`刚好 1 MB 的图片不提示；不是图片的大文件（音频、视频）不在这一项里，整个游戏的体积由「超过 20 MB」那条提示管。`}),`
`,(0,n.jsxs)(r.li,{children:[`CLI 发布（`,(0,n.jsx)(r.code,{children:`gamefy deploy`}),`）也会在返回的 `,(0,n.jsx)(r.code,{children:`warnings`}),` 里给出同样三项，文字是英文。`]}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`上架做了什么`}),`
`,(0,n.jsxs)(r.p,{children:[`把这张卡的状态置为「等待审核」，并生成一条列表记录。审核是`,(0,n.jsx)(r.strong,{children:`异步`}),`的，由平台的审核服务在后台进行，
不是点完按钮立刻出结果。`]}),`
`,(0,n.jsx)(r.p,{children:`审核通过之后，卡才会被置为公开，此时玩家才能：在角色列表里看到它、搜到它、打开它的详情页、进入游戏。`}),`
`,(0,n.jsx)(r.h2,{children:`没上架的时候，谁能看到`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`入口`}),(0,n.jsx)(r.th,{children:`结果`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家打开角色详情页直链`}),(0,n.jsx)(r.td,{children:`看不到（404）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`玩家加载游戏入口`}),(0,n.jsx)(r.td,{children:`看不到（403）`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`列表页、搜索`}),(0,n.jsx)(r.td,{children:`不出现`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`你自己`}),(0,n.jsx)(r.td,{children:`都能看、能玩`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`⚠️ `,(0,n.jsx)(r.strong,{children:`一个例外`}),`：游戏的静态文件（图片、脚本等）走的是「知道地址即可访问」的链接，不检查上架状态。
知道完整地址的人可以直接拉到这些文件的字节。所以`,(0,n.jsx)(r.strong,{children:`未上架不等于内容保密`}),`——不要把不能外泄的东西
放进 `,(0,n.jsx)(r.code,{children:`publish/`}),`。服务端逻辑可以放在 `,(0,n.jsx)(r.code,{children:`functions/`}),`，避免源码直接下发；模型仍可能复述提示词，不要把密码、API key 或个人数据写进 prompt。`]}),`
`,(0,n.jsx)(r.h2,{children:`发布的前置条件`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`登录，且会员等级 ≥ VIP1`}),`
`,(0,n.jsx)(r.li,{children:`是你自己的游戏卡`}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`代码必须先保存`}),`。工坊发现未保存改动时，在发布确认框选择「保存后发布」；保存失败或冲突时先解决，再发布。文件过多／过大或安装工具后保存失败，按`,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/limits#workspace-save`,children:`工作区保存的具体限制与处理步骤`}),`先备份、排除可重建的工具依赖，再整理需要保存的素材`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:`publish/index.html`}),` 存在，且是合法 HTML`]}),`
`,(0,n.jsx)(r.li,{children:`所有文件路径是 ASCII、无重复`}),`
`,(0,n.jsx)(r.li,{children:`同一张卡同时只能有一个发布在跑`}),`
`]}),`
`,(0,n.jsxs)(r.p,{children:[`屏幕方向`,(0,n.jsx)(r.strong,{children:`不是`}),`发布的前置条件，它是设置项，缺省为竖屏。但它决定玩家看到的画布比例，发布前最好确认。`]}),`
`,(0,n.jsx)(r.h2,{children:`上架的前置条件`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`不是游客账号`}),`
`,(0,n.jsx)(r.li,{children:`会员等级 ≥ VIP1`}),`
`,(0,n.jsx)(r.li,{children:`当日上架配额未用完（VIP1 每天 2 次、VIP2 每天 5 次、VIP3 每天 10 次；当天已提交和已通过的都计入）`}),`
`,(0,n.jsx)(r.li,{children:`游戏名不为空，且不是默认的「未命名游戏」`}),`
`,(0,n.jsx)(r.li,{children:`头像不是默认占位图`}),`
`,(0,n.jsx)(r.li,{children:`填写了作者说明`}),`
`,(0,n.jsxs)(r.li,{children:[`线上能取到有效的 `,(0,n.jsx)(r.code,{children:`index.html`}),`（即至少成功发布过一次）`]}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`审核状态`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`状态`}),(0,n.jsx)(r.th,{children:`含义`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`未上架`}),(0,n.jsx)(r.td,{children:`从未上架，或已下架`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`等待审核`}),(0,n.jsx)(r.td,{children:`已提交，审核进行中。这期间不能重复提交`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`审核未通过`}),(0,n.jsx)(r.td,{children:`被拒。详情页会显示红框和具体理由`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:`审核通过`}),(0,n.jsx)(r.td,{children:`已公开，玩家可见`})]})]})]}),`
`,(0,n.jsx)(r.p,{children:`被拒时的理由只有你自己看得到，玩家看不到。老卡如果没有保留具体理由，会显示一句兜底说明。`}),`
`,(0,n.jsx)(r.h2,{children:`被拒之后`}),`
`,(0,n.jsx)(r.p,{children:`改内容，然后点「重新上架」重新提交。同一张卡可以反复修改重提。`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`待补充`}),`：审核的具体判定标准，以及被拒后除了修改重提之外是否有申诉通道，
这两项不在本仓库代码内，需要产品侧补充说明。本页其余内容均依据平台代码的实际行为写成。`]}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`CLI 与工坊的差异`}),`
`,(0,n.jsx)(r.p,{children:`两者最终走同一套核心逻辑、同一个存储布局，并且共用同一把发布锁（所以不会互相打架）。差异在于：`}),`
`,(0,n.jsx)(r.p,{children:`CLI 更严格：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsx)(r.li,{children:`函数上传只要有一个失败，整次发布就失败。工坊只会给一条警告`}),`
`,(0,n.jsxs)(r.li,{children:[`带版本冲突检测：如果线上版本比你上次 `,(0,n.jsx)(r.code,{children:`gamefy pull`}),` 时新，会拒绝发布（`,(0,n.jsx)(r.code,{children:`revision_conflict`}),`）。
先保住本地改动，再到另一个空目录 `,(0,n.jsx)(r.code,{children:`gamefy pull`}),` 对比合并后重新发布；`,(0,n.jsx)(r.code,{children:`--force`}),` 会直接覆盖线上版本，
只在确认本地为准时使用`]}),`
`,(0,n.jsx)(r.li,{children:`上传前会一次性检查所有函数（重名、超长、不支持的 import）`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`CLI 少做的：`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[`不会提醒「`,(0,n.jsx)(r.code,{children:`index.html`}),` 引用了某个本次没有上传的资源」，工坊会`]}),`
`,(0,n.jsx)(r.li,{children:`不会提示重复路径（重复项会被自动排除，不会传坏，但你拿不到提示）`}),`
`,(0,n.jsx)(r.li,{children:`没有流式进度，只返回一个结果`}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`还有一点容易踩：CLI 发布的是你本地的文件，不会和工坊容器里的内容自动同步。
用 CLI 发布之后再回工坊继续编辑，需要先用设置里的「从线上恢复」把线上版本拉回容器。`})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};