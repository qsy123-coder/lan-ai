# 012 — 对话页手机端 UI 重构 + 主题切换（2026-11-12）

## 变更清单

| 文件 | 动作 |
|---|---|
| `site/components/ThemeToggle.jsx` | 新建。`useTheme()` / `applyTheme()` / `ThemeToggle` / `ThemeSegments` |
| `site/components/SessionList.jsx` | 新建。会话面板（手机整屏 / 桌面左栏共用） |
| `site/components/ChatClient.jsx` | 换用 SessionList；顶栏加主题按钮与状态条；输入区图标化 |
| `site/components/Nav.jsx` | 改用共享 ThemeToggle，删掉本地重复实现 |
| `site/app/layout.js` | 首屏主题脚本改为「无偏好时跟随系统」 |
| `site/app/globals.css` | 追加 `--ch-*` 语义 token、对话页 v2、直角总开关、焦点环、对比度修正 |
| `scripts/shot-chat.mjs` | 新增手机/桌面截图工具（`--theme` / `--seed` / `--click` / `--eval-file`） |

## 会话面板设计（直角版）

- 手机：`position:fixed; inset:0` 整屏，`translateX(-100%) → 0`，260ms 缓动
- 桌面：左栏 296px（1180px 以下 260px），1px 右边框，无圆角
- 行高：触摸区 68px（≥44px 下限）
- 分组：今天 / 昨天 / 本周 / 本月 / 更早，吸顶 30px 标签条 + 计数
- 搜索：44px 高，匹配角色名与最近一句
- 管理：进入后每行出现 68px「删除」，二次点击变「确认删除」才真删
- 空态 / 无匹配：各自独立文案 + 44px CTA

## 主题

- 三态：`auto`（跟随系统，不写 localStorage）/ `light` / `dark`
- `app/layout.js` 内联脚本在 HTML 解析前写 `data-theme`，刷新不闪白
- 任一按钮改动派发 `lan:theme` 事件，页面内所有按钮同步
- 图标用 CSS `html[data-theme="dark"]` 切换显示，首帧即正确

## 验收（实测数值）

| 项 | 值 |
|---|---|
| 横向溢出 320 / 390 / 1000 / 1440 | 均 0（`scrollWidth === innerWidth`） |
| 会话行高 | 68px（触摸区） |
| 搜索框高 | 44px |
| 顶栏高 | 手机 56px / 桌面 60px |
| 发送键 | 44×44 |
| 圆角 | 全站 0（`*{border-radius:0 !important}`） |
| 对比度（浅色） | 标题 14.49 / 次级 5.17 / 分组 5.44 / 提示 5.17 |
| 对比度（深色） | 标题 15.9 / 次级 5.69 / 分组 9.34 |
| 用户气泡 | 浅色 10.86 / 深色 7.46 |
| 键盘焦点环 | 2px `--ch-accent`，深色换 `#9ccac1` |

## 端到端

`createByCard` → `/api/chat` SSE → `完成 · b003 · 余额 30.62`，1516 字，消息落 `lg.msgs.v2.<cardId>`，
索引落 `lg.sessions.v2`，面板首行显示卡名 + 去 markdown 的预览。

## 踩到的坑

1. **前台进程的 `SITE_PASS` 与 `out\site_pass.txt` 不一致**（旧进程未重启），`/api/enter` 一律 401。
   重启前台即恢复（claude.md §11.16 已有记录，本次复现）。
2. **运行中的引擎来自另一份 checkout**（`C:\Users\WINDOWS11\Desktop\Xsdsh-purge-4.6.11-alpha\project\engine\server.py`），
   `SITE_TOKEN` 是那边的 `lg-526163`，不是本仓 `out\site_token.txt` 的 `lg-517184`。
   前台必须用 `lg-526163` 才不 401。本项目 `out/` 里没有 `accounts.json`，引擎状态在对方 `out/webstate.json`。
3. **`.hint span:nth-child(n)` 依赖子元素顺序**，插一个 `<span className="spacer" />` 就全错位。
   已改为 `.hint-turns` / `.hint-ctx` / `.spacer` 显式类名。
4. **旧 `.sug` / `.sess-item` 暗色规则打在新结构上**（实际类名是 `.sug-chip` / `.sess`），深色下白底残留。
   已补同权重覆盖。
5. 截图工具读不到图片时不可依赖截图判断，改用 `getComputedStyle` + `getBoundingClientRect` 探针。

## 回滚

```powershell
cd F:\Projects\lan-ai
git checkout -- site/app/globals.css site/app/layout.js site/components/ChatClient.jsx site/components/Nav.jsx
Remove-Item site/components/SessionList.jsx, site/components/ThemeToggle.jsx
# globals.css 备份：site/app/globals.css.bak（重构前原样）
```
