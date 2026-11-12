# 032 — 会话列表 UI 重构 + 主题切换 + 去背景渐变（2026-11-13）

## 为什么要在这份工程做

上一轮改动落在 `F:\Projects\lan-ai`，但**实际运行与提交的是本工程**
（`C:\Users\WINDOWS11\Desktop\Xsdsh-purge-4.6.11-alpha\project`）。两份共用同一个
remote，但 git 历史已分叉，本工程的 commit 在 F 盘那份里根本不存在。

更关键的是**两份共用同一个构建目录** `%LOCALAPPDATA%\dzmm-site`：

```
start-site.ps1:16   $RT = Join-Path $env:LOCALAPPDATA "dzmm-site"
start-site.ps1:50   robocopy $SRC $RT /E /XD node_modules .next
```

`robocopy /E` 只增不删。哪个工程后启动，就把自己的 `site/` 叠进去；对方独有的文件
（如 `SessionList.jsx`）反而残留在运行副本里，下次构建照样被打包。这就是「改动被
上一个会话覆盖」的真实机制 —— 不是 git 覆盖，是共享目录互相踩。

**本次处理**：删掉副本里的 `app/ components/ lib/ public/` 四个源码目录后重新
`robocopy`，确保副本只含本工程的源码。以后切工程先清目录，或给每个工程单独的 `$RT`。

## 变更

| 文件 | 动作 |
|---|---|
| `site/components/ThemeToggle.jsx` | 新增。`useTheme` / `applyTheme` / `ThemeToggle` / `ThemeSegments` |
| `site/components/SessionList.jsx` | 新增。对话抽屉（手机右侧滑入 / 桌面左栏） |
| `site/components/ChatClient.jsx` | 换用 SessionList；顶栏加主题按钮；设置抽屉加标题栏与主题三段 |
| `site/components/Nav.jsx` | 重写。手机端 52px 细条 + 导航抽屉；保留敏感内容开关 |
| `site/app/layout.js` | 首屏主题脚本改为「无偏好时跟随系统」 |
| `site/app/enter/page.js` | 内联 `linear-gradient` 图标改纯色 |
| `site/app/globals.css` | 追加对话页 v2、双抽屉、设置抽屉；清空全部背景渐变 |

## 三个抽屉

手机上原来顶栏塞了 logo + 四项导航 + 搜索 + 三个图标，全挤在一条里。现在拆成三条独立抽屉：

| 抽屉 | 触发 | 宽度 | 方向 |
|---|---|---|---|
| 导航（`Nav.jsx`） | 首页/详情页左上汉堡 | `min(84vw,320px)` | 左滑入 |
| 对话（`SessionList.jsx`） | 对话页左上汉堡 | `min(86vw,360px)` | 右滑入 |
| 设置（`ChatClient` 右栏） | 对话页齿轮 | `min(86vw,360px)` | 右滑入 |

对话页手机端**不再叠全局导航**（`Nav` 上加了 `.nav-hide-phone`，只在 `/chat` 生效），
顶栏只有一条 60px：汉堡 → 返回 → 卡名 → 主题 → 设置。

导航抽屉内容：品牌头 + 44px 搜索框 + 四项导航（52px 每项，当前项左侧 3px 强调条）+
主题切换 + 敏感内容开关 + 去挑角色。打开时锁 `body` 滚动，Esc 关闭，路由变化自动收起。

设置抽屉内容：主题三段 / 模型 / 最大输出 token / 续写轮数 / 消息字数统计 / 清空会话，
顶部带标题栏与 40px 关闭键（`≤1180px` 显示）。



## 去渐变（本轮重点）

`globals.css` 里 `gradient(` 出现次数：**13 → 0**。

| 原 | 现 |
|---|---|
| `.scene` 三层渐变（径向 + 线性深青到米黄） | `background: var(--paper)` 纯色 |
| `.scene::before` repeating-linear-gradient 等高线 | `content: none` |
| `.glass` 线性渐变 | `rgba(255,255,255,.08)` 平铺 |
| `.glass::before` 上缘渐变高光 | `content: none` |
| 卡片占位 / 封面底 4 处 `linear-gradient(150deg,...)` | 单一实色 `--mist` / `#cfe0da` |
| `.nav-av-inner` 径向渐变头像 | `#e8cdb4` 实色 |
| `.btn-primary` / 深色气泡 线性渐变 | `#2f5450` / `#2b474b` 实色 |
| `.big-mask` 遮罩渐变（两处 hover） | 半透明实色 `rgba(19,37,41,.52/.44)` |
| `enter/page.js` 内联渐变图标 | `#9fc9c2` 实色 |

验证：运行时遍历 `body *` 检查 `backgroundImage` 含 `gradient` → **0 个**，
首页 / 详情页 / 对话页三处均为 0。

## 会话面板

- 手机：`position:fixed; inset:0` 整屏，`translateX(-100%)→0` 260ms
- 桌面：左栏 296px（≤1180px 为 260px），1px 右边框
- 行高 68px（触摸下限 44px）；搜索框 44px；顶栏手机 56px / 桌面 60px
- 分组：今天 / 昨天 / 本周 / 本月 / 更早，吸顶 30px 标签条带计数
- 搜索匹配角色名与最近一句；管理模式下 68px「删除」按钮，二次点击变「确认删除」
- 预览剥掉 markdown 记号与换行；今天显示时刻，更早显示 `11/11`

## 主题

三态 `auto` / `light` / `dark`。`auto` 不写 localStorage，跟随 `prefers-color-scheme`。
首屏内联脚本先写 `data-theme` 防闪白；图标用 CSS 按主题切显示，首帧即正确。
任一按钮改动派发 `lan:theme` 事件，页面内所有按钮同步。

## 验收（实测）

| 项 | 值 |
|---|---|
| 横向溢出 320 / 390 / 1440 | 均 0（`scrollWidth === innerWidth`） |
| 手机顶栏 | 首页 52px / 对话页 60px |
| 导航抽屉 | 320×844，4 项 × 52px，搜索 44px，`body` 锁定 `hidden` |
| 对话抽屉 | 390 屏下 x=55 / w=335（贴右），12 行 |
| 设置抽屉 | 335×844，3 个主题段，3 个输入控件，关闭键 40px |
| 桌面三栏 | 296 + 784 + 280 |
| 会话行高 / 搜索框 | 68px / 44px |
| 发送键 | 44×44 |
| 背景渐变（全站） | 0 |
| 对比度 | 标题 14.49 / 次级 5.17 / 分组 5.44 / 提示 5.17（深色 15.9 / 5.69 / 9.34） |
| 主题切换 | 顶栏与抽屉内都能切，`localStorage.theme` 同步 |
| 面板删除 | 12 行 → 删除 1 行 → 11 行，localStorage 同步 11 |
| 搜索 | 「学姐」→ 2 行，命中「高冷学姐的毒舌家教 孙雪瑶」 |
| 构建 | `next build` 通过，CSS 括号 739/739，无替换字符 |

## 已知限制

- `.bubble.user` 的对比度探针读到的是祖先背景（1.12），实际自身底色 `#25414a` 配白字为
  10.86:1（深色 `#33565a` 配 `#f2f8f7` 为 7.46:1）。探针逻辑缺陷，不是样式问题。
- 引擎仍是 `127.0.0.1:8787` 那个进程，`SITE_TOKEN` 取本工程 `out/site_token.txt`（`lg-526163`）。
- `next build` 有 `Can't resolve 'sharp'` 警告，来自 `app/api/img/route.js` 的可选优化路径，
  不影响构建与运行（此前既有）。

## 回滚

```powershell
cd 'C:\Users\WINDOWS11\Desktop\Xsdsh-purge-4.6.11-alpha\project'
git checkout -- site/app/globals.css site/app/layout.js site/components/ChatClient.jsx site/components/Nav.jsx site/app/enter/page.js
Remove-Item site/components/SessionList.jsx, site/components/ThemeToggle.jsx
# 清副本后由 start-site.ps1 重新同步构建
Remove-Item "$env:LOCALAPPDATA\dzmm-site\app","$env:LOCALAPPDATA\dzmm-site\components","$env:LOCALAPPDATA\dzmm-site\lib","$env:LOCALAPPDATA\dzmm-site\public" -Recurse -Force
```
