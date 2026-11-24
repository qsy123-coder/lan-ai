(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`7ec7b96b406e10cfe9f0432f02653d13fed71fae`},e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[new e.Error().stack]=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];if(n!=null)for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},e._sentryModuleMetadata[new e.Error().stack],{"_sentryBundlerPluginAppKey:dzmm-web":!0});var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`39324935-ec53-4e3d-9117-ee275bd470f5`,e._sentryDebugIdIdentifier=`sentry-dbid-39324935-ec53-4e3d-9117-ee275bd470f5`)}catch{}})();import{r as e}from"./Q_o_XKpy.js";import{t}from"./WKZqy2YT.js";var n=e();function r(e){let r={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...t(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h1,{children:`Connected Dev CLI（本地开发）`}),`
`,(0,n.jsxs)(r.p,{children:[`用 `,(0,n.jsx)(r.code,{children:`gamefy`}),` 命令行在本地开发和测试游戏——wrangler 式体验，但跑的是真实平台：
KV、聊天存档、AI 对话、画图、服务端函数全部打到生产同款端点，数据落在你的
开发命名空间（和工坊预览共用同一份 dev 存档），模型调用消耗你自己的积分。`]}),`
`,(0,n.jsx)(r.h2,{children:`从在线工作台切换`}),`
`,(0,n.jsxs)(r.p,{children:[`在工作台顶部选择「在本地继续开发」（手机端在「更多操作」中），按顺序安装 CLI、授权账号、
创建独立目录、绑定当前项目、拉取代码并启动。命令会带上当前项目链接，`,(0,n.jsx)(r.code,{children:`gamefy status`}),` 可核对绑定。
先保存在线改动；Beta 导出的是最近保存点，尚未保存的编辑不会进入本地。`]}),`
`,(0,n.jsx)(r.h2,{children:`快速开始`}),`
`,(0,n.jsxs)(r.blockquote,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`前置条件`}),`：和工坊一样，需要 VIP1 及以上会员才能开发游戏。密钥本身只要
登录就能创建，但会员到期后 CLI 的拉取、开发和发布都会返回 `,(0,n.jsx)(r.code,{children:`VIP_REQUIRED`}),`。`]}),`
`]}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`安装`}),`：命令行不在 npm 仓库上，从平台下载安装包再安装（`,(0,n.jsx)(r.code,{children:`<站点>`}),` 换成你正在用的站点地址，
比如 `,(0,n.jsx)(r.code,{children:`https://www.dzmm.ai`}),`；`,(0,n.jsx)(r.a,{href:`/studio/game-creation/dev-keys`,children:`开发者密钥`}),` 页的「上手指南」里有替换好的命令）：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`curl -fL -o dzmm-gamefy-cli.tgz <站点>/api/app/cli/download/latest && npm install -g ./dzmm-gamefy-cli.tgz
`})}),`
`]}),`
`,(0,n.jsxs)(r.li,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`登录`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`gamefy auth login --base-url <站点>   # 打印一个网址和一串验证码
`})}),`
`,(0,n.jsxs)(r.p,{children:[`在任意浏览器打开这个网址（登录你的网页账号），输入验证码确认，命令行就会拿到一把新授权的密钥。
不需要在终端里输入，没有交互终端（比如 AI 助手的命令行）也能用；`,(0,n.jsx)(r.code,{children:`--no-open`}),` 只是不自动打开浏览器，
流程不变。已经在「开发者密钥」页手动建过密钥的话，可以用 `,(0,n.jsx)(r.code,{children:`--key-stdin`}),` 从标准输入传入。
（每个账号最多 3 把，可随时吊销、吊销即时生效；密钥是账号级的，对你名下所有游戏都有效。）`]}),`
`]}),`
`,(0,n.jsxs)(r.li,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`选定游戏`}),`（选择已有游戏，或 `,(0,n.jsx)(r.code,{children:`--new`}),` 在网页新建后自动接走；也可以 `,(0,n.jsx)(r.code,{children:`--game`}),` 粘贴游戏页 / 工坊链接。
会拉取代码、写好 AGENTS.md 并安装 AI 指引；从未发布过的新游戏从空白模板开始）：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`mkdir my-game && cd my-game
gamefy init
`})}),`
`,(0,n.jsx)(r.p,{children:`链接所属站点和登录的站点不一致时，命令行会直接说明并停下，不会把密钥发到别的站点。`}),`
`]}),`
`,(0,n.jsxs)(r.li,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`本地开发`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`gamefy dev               # 打开 http://127.0.0.1:<port>/
`})}),`
`,(0,n.jsxs)(r.p,{children:[`本地页面用生产同款 iframe 沙箱与 SDK 注入方式，`,(0,n.jsx)(r.code,{children:`functions/`}),` 里的函数
每次调用读取本地最新源码，无需容器。`]}),`
`]}),`
`,(0,n.jsxs)(r.li,{children:[`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`发布`}),`：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`gamefy deploy
`})}),`
`,(0,n.jsxs)(r.p,{children:[`走与工坊发布相同的校验与管线，但更严格：任何文件或函数失败都会让整个
发布失败。若平台上的版本比你上次 pull 时更新，deploy 会拒绝（`,(0,n.jsx)(r.code,{children:`revision_conflict`}),`），
处理办法见 `,(0,n.jsx)(r.a,{href:`/studio/game-creation/workbench/help/cli-errors`,children:`命令行与发布错误码`}),`；`,(0,n.jsx)(r.code,{children:`--force`}),`
会直接用本地覆盖线上版本，只在确认本地为准时使用。`]}),`
`,(0,n.jsx)(r.p,{children:`deploy 只发布代码：封面、简介在创作者中心的游戏页面设置，上架在角色详情页。`}),`
`]}),`
`]}),`
`,(0,n.jsx)(r.h2,{children:`识别本地目录与远端项目`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`init`}),` 会选择项目并拉取代码；如果目录已经有自己的代码，只想绑定项目，可运行：`]}),`
`,(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`gamefy link <项目ID或链接>
gamefy status
`})}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`link`}),` 只写入绑定，不覆盖代码，也不建立拉取基线。目录已绑定其它项目或站点时会拒绝混用，
请为另一个项目创建独立目录。`,(0,n.jsx)(r.code,{children:`status`}),` 显示目录、远端项目、站点、上次同步来源和线上版本。
新版 `,(0,n.jsx)(r.code,{children:`dzmm.json`}),` 记录站点，使用不同站点的授权时会在执行操作前拒绝。`]}),`
`,(0,n.jsxs)(r.p,{children:[`本地和在线工作区不会自动同步。拉取前运行 `,(0,n.jsx)(r.code,{children:`git status`}),` 并提交本地改动；`,(0,n.jsx)(r.code,{children:`pull`}),` 替换 `,(0,n.jsx)(r.code,{children:`publish/`}),` 和
`,(0,n.jsx)(r.code,{children:`functions/`}),`，包含删除远端已不存在的文件。将 `,(0,n.jsx)(r.code,{children:`dzmm.json`}),` 和 `,(0,n.jsx)(r.code,{children:`.dzmm/lock.json`}),` 随代码提交，
账号密钥不能提交。拉取后用 Git 比较和合并差异，再运行 `,(0,n.jsx)(r.code,{children:`gamefy deploy --dry-run`}),`。
`,(0,n.jsx)(r.code,{children:`link`}),` 不会自动切换 Git 分支或推送 Git 远端；没有同步基线时发布仍要求先 pull，或明确确认后使用既有 `,(0,n.jsx)(r.code,{children:`--force`}),`。`]}),`
`,(0,n.jsxs)(r.p,{children:[`独立授权页展示网页账号、终端自行报告的名称、请求标识和账号级权限；验证码仍需从终端输入，
密钥只交给发起请求的终端。旧版站点与 CLI 保留原授权入口。
`,(0,n.jsx)(r.code,{children:`gamefy --help`}),`、快速入门与关键提示优先使用中文，命令、参数和错误码名称保持英文。`]}),`
`,(0,n.jsx)(r.h2,{children:`同步文档、检查和验收`}),`
`,(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:`命令`}),(0,n.jsx)(r.th,{children:`用途`})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy docs`})}),(0,n.jsxs)(r.td,{children:[`把平台当前文档拉到项目，供本地 AI 助手使用；`,(0,n.jsx)(r.code,{children:`--stdout`}),` 只输出正文`]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy skills`})}),(0,n.jsx)(r.td,{children:`安装随当前 CLI 提供的游戏开发 skill；不会替代线上 SDK 契约`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy status`})}),(0,n.jsx)(r.td,{children:`比较本地 baseline、线上 revision 和上架状态`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy check --reload --slow`})}),(0,n.jsx)(r.td,{children:`在手机视口检查启动、刷新后的存档与慢网络表现`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy deploy --dry-run`})}),(0,n.jsx)(r.td,{children:`检查发布条件与版本冲突，不发布文件`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy deploy --verify`})}),(0,n.jsx)(r.td,{children:`发布后读回线上版本，逐文件核对`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsxs)(r.td,{children:[(0,n.jsx)(r.code,{children:`gamefy health`}),` / `,(0,n.jsx)(r.code,{children:`gamefy logs`})]}),(0,n.jsx)(r.td,{children:`查看平台体检、空间占用与真实玩家的运行问题`})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:`gamefy upgrade`})}),(0,n.jsx)(r.td,{children:`从当前站点下载并安装最新 CLI`})]})]})]}),`
`,(0,n.jsxs)(r.p,{children:[`发布前先保住本地改动，运行 `,(0,n.jsx)(r.code,{children:`check`}),` 与 `,(0,n.jsx)(r.code,{children:`deploy --dry-run`}),`；确认后再部署。`,(0,n.jsx)(r.code,{children:`check`}),` 验证启动和指定交互，不代替完整游戏流程测试。`,(0,n.jsx)(r.code,{children:`docs`}),` 拉取的是该站点当前已部署的文档，更新游戏依赖前仍要核对能力旗标。各命令与选项以你安装版本的 `,(0,n.jsx)(r.code,{children:`gamefy --help`}),` 为准。`]}),`
`,(0,n.jsx)(r.h2,{children:`注意事项`}),`
`,(0,n.jsxs)(r.ul,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`同一时间选一边编辑`}),`：本地 checkout 和工坊容器不会自动同步。CLI
deploy 之后回工坊时，用设置里的「从线上恢复」把容器代码同步到最新
（静态文件和函数都会恢复）。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`能力差异`}),`：本地环境不提供 `,(0,n.jsx)(r.code,{children:`draw.edit`}),`、画图 download/nav 展示和
workshop（`,(0,n.jsx)(r.code,{children:`capabilities.get()`}),` 相应字段为 `,(0,n.jsx)(r.code,{children:`false`}),`，调用会被拒绝）；
积分不足时游戏收到 `,(0,n.jsx)(r.code,{children:`QUOTA_EXHAUSTED`}),` 错误，没有充值弹窗。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`清存档`}),`：`,(0,n.jsx)(r.code,{children:`gamefy reset-data`}),` 清空你的 dev 命名空间数据（等价工坊设置
里的「清空开发数据」），生产玩家数据不受影响。`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`密钥安全`}),`：密钥只存在本机 `,(0,n.jsx)(r.code,{children:`~/.config/dzmm/credentials.json`}),`
（0600），浏览器和游戏代码永远接触不到；泄露时去「开发者密钥」页面吊销。`]}),`
`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}var a=i;export{a as component};