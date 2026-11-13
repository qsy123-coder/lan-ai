# 035 账号 + 积分账本（notes/008 §7）

日期：2026-11-13
分支：`feat/account-ledger`（基于 `feat/me-and-pricing`）
总文档：`notes/008-dzmm-teardown.md` §7「账号：登录 + 积分账本，与池子账号体系分离」

## 做了什么

本站用户账号（邮箱 + 密码）与后台额度池**完全分离**：

| 层 | 实现 |
|---|---|
| 用户 | `out/users.json`，scrypt 密码哈希（n=2^14, r=8, p=1），注册送 100 credit |
| 会话 | 引擎签发随机 token，Next 写 HttpOnly / SameSite=Lax cookie `lan_sess`，30 天 |
| 账本 | 每用户一条 `grant / charge / recharge / prepay / settle / refund` 流水，保留最近 200 条 |
| 计费 | 生成前检查余额 ≥ 3.2；生成成功后扣 2.1（失败/换号/游客不扣） |
| 充值 | `/pricing` 演示充值（¥10→137 / ¥50→856 / ¥100→2055 / ¥400→10958），不扣款 |
| 游客 | 不登录仍可对话，只是不记账；登录后从下一轮开始记账 |

### 接口

引擎（全部要 `x-site-token`）：

```text
POST /site/user/register   {email,password,name} -> {user,token}
POST /site/user/login      {email,password}       -> {user,token}
POST /site/user/logout     {token}
GET  /site/user/me?token=
GET  /site/credits/ledger?token=&limit=
POST /site/credits/recharge {token,amount,note}
```

Next 代理（外圈仍要 `lg_pass`）：

```text
POST /api/auth/register|login|logout
GET  /api/auth/me
GET  /api/credits
POST /api/credits/recharge
```

`/api/chat` 在已登录时把 `lan_sess` 作为 `userToken` 透传给引擎；
`run_site_chat` 解析用户、做余额预检查、成功后扣 2.1，并把 `userCredit` 放进 `complete` 事件。

### 页面

- `/login`：登录 / 注册切换，注册送 100。
- `/me`：已登录显示「我的积分 + 最近记录 + 充值/退出」；未登录显示登录 CTA。
  下方保留「本站额度池 · 运营视角」（池子数据仍脱敏）。
- `/pricing`：登录后显示当前积分与「演示充值」按钮；未登录提示去登录。
- 对话页 `complete` 的提示追加「我的积分 X」。

## 验证

```text
引擎接口：register 200 / me 200 / recharge 137 -> 237 / ledger / login 200 / 错密码 401 / logout 200
Next 链路：register 200 + Set-Cookie / me / credits / recharge / chat complete userCredit=234.9 / charge -2.1 / logout
余额不足：把用户扣到 1.00 后发 /api/chat -> end {reason:"user_credit", message:"积分不足..."}，未发起上游
单测：python -m unittest discover -s engine\tests -> Ran 34 tests OK（新增 test_users 6 项）
构建：next build 通过
截图：out/shots/login-*.png、me-auth-*.png、pricing-auth-*.png（1440/390 亮暗）
横向溢出：scrollW == vw（1440 / 390）
```

## 已知限制

- 只做邮箱 + 密码，没有邮件验证 / OAuth / 找回密码；本地演示够用。
- 账本是单文件 JSON，靠引擎进程内锁串行写；多实例部署需要换 SQLite/Postgres。
- 游客对话不记账，也没有「游客转正合并历史」。
- 充值按钮是演示，不接支付；`out/users.json` 在 `.gitignore` 内，不入库。
- 仍然保留站点口令 `lg_pass` 作为外层门禁，用户账号在其内。

## 回滚

```powershell
git checkout main
git branch -D feat/account-ledger
# 或只撤文件
git checkout -- engine/server.py site/components/ChatClient.jsx site/app/api/chat/route.js
Remove-Item engine\users.py, engine\tests\test_users.py, site\lib\engine.js, site\lib\session.js,
  site\app\api\auth, site\app\api\credits, site\components\LoginForm.jsx,
  site\components\LogoutButton.jsx, site\components\RechargeDemo.jsx, site\app\login -Recurse -Force
# 用户数据可留可删
Remove-Item out\users.json
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
