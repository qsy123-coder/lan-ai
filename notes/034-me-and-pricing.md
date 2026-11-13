# 034 我的 + 会员与价格（notes/008 §2.4 / §5）

日期：2026-11-13
分支：`feat/me-and-pricing`
总文档：`notes/008-dzmm-teardown.md`（信息架构 §2、最小骨架 §7、计费 §5）

## 为什么做这两个页

notes/008 的四屏最小骨架（首页 / 卡详情 / 对话 / 会话列表）已经完成，
顶栏四个入口里「消息 / 论坛 / 我的」还挂着 `soon`：

| 入口 | 处理 |
|---|---|
| 消息 | 实际聊天就是 `/chat`（三栏 + 会话抽屉），把 tab 从 `/messages` 改指 `/chat` |
| 论坛 | §8 明确列为待定范围（是否含论坛/画图/Studio），保持 `soon` |
| 我的 | §2.4 有页面定义、§5 有完整计费文案，先补这一屏 |

## 改动

| 文件 | 改动 |
|---|---|
| `site/app/me/page.js` | 新增。池内可用额度、账号数/可用数、账号明细（脱敏 + 折叠）、快捷入口 |
| `site/app/pricing/page.js` | 新增。积分规则、四档充值、VIP1–3 权益表、月卡 |
| `site/app/account.css` | 新增。两页共用样式（亮/暗/手机），ASCII-only，避免动 legacy 编码的 `globals.css` |
| `site/lib/pool.js` | 新增。服务端读 `ENGINE_URL/site/pool`，2.5s 超时，引擎离线返回离线态 |
| `site/components/Nav.jsx` | `消息` → `/chat`、`我的` → `/me`（移除 soon）；右上头像改为 `/me` 链接 |

## 数据与隐私

- 数据源：引擎 `GET /site/pool` → `{total, usable, count, accounts[{name,credit,usable}]}`。
- 前台**不显示账号名**：只按顺序显示「账号 01…」，`name` 也不作为 React key
  （否则会进 RSC payload）。实测 HTML 里 `g01 / b0*** / ma***` 计数均为 0。
- 引擎没起时页面仍 200，显示「引擎未启动」，不抛 500。
- 页面明确写「演示站，不提供真实充值/提现/退款」。

## 验证

```text
next build 通过
GET /me       200
GET /pricing  200
GET /me 无 cookie → 307 /enter
nav: href="/chat" ×2、href="/me" ×3、/messages ×0、论坛 tab-soon ×2
```

截图（`out/shots/`）：

| 页面 | 桌面 1440 | 手机 390 |
|---|---|---|
| `/me` | `me-1440-light.png` / `me-1440-dark.png` | `me-390-light.png` / `me-390-dark.png` |
| `/pricing` | `pricing-1440-light.png` / `pricing-1440-dark.png` | `pricing-390-light.png` / `pricing-390-dark.png` |

横向溢出：桌面 `scrollW 1425 / bodyW 1425`，手机 `scrollW 390 / vw 390`，均无溢出。
手机端 VIP 表四列（VIP1/2/3）压缩后完整可见，不再需要横向滚动。

## 已知限制

- `/me` 是**池子级**视图，不是 §7 里「登录 + 个人积分账本」那一项；后者仍未做。
- `/pricing` 是展示页，没有支付；VIP2/VIP3 的具体数值站内未公开，表里只写「更高/最高」。
- `/forum` 仍为 `soon`，等 §8 的范围决策。

## 回滚

```powershell
git checkout main
git branch -D feat/me-and-pricing
# 或只撤文件
git checkout -- site/components/Nav.jsx
Remove-Item site\app\me, site\app\pricing, site\app\account.css, site\lib\pool.js -Recurse -Force
# 重建前台
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
