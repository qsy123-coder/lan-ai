# 041 登录功能上线记录（2026-11-15 22:0x）

分支：`feat/signin-otp`
生产：`ubuntu@43.135.10.175` / `https://43-135-10-175.sslip.io`
备份：`/opt/lan/backup-signin-20261115220642`（108MB，站点源码 + `.next` + 引擎 `server.py`/`users.py` + `out/users.json`/`forum.json`）

## 上线内容

**引擎**（`/opt/lan/engine/`）

- `server.py`：新增 `/site/user/signup/request|verify`、`/site/user/reset/request|verify`；
  原有论坛、用户、签到、409 `CHAT_LOCKS`、memory/sug 全部保留（`grep` 校验 `CHAT_LOCKS=5`）。
- `users.py`：新增 `pending_signups` / `reset_codes`；8 位码 10 分钟、5 次尝试；重置清旧 session。
- `AUTH_DEV_CODE` 未设置，默认 `1`：演示站把验证码回给前端，线上注册页会显示「演示验证码」。

**站点**（`/opt/lan/site/`，增量覆盖，未整包替换）

- 新增：`app/sign-in`、`app/api/auth/signup`、`app/api/auth/reset`、`components/SignInClient.jsx`。
- 修改：`app/login/page.js`（307 → `/sign-in`）、`components/Nav.jsx`（登录/昵称）、
  `app/forum/page.js`、`app/forum/new/page.js`、`app/me/page.js`、`components/PostActions.jsx`、
  `components/RechargeDemo.jsx`（链接统一 `/sign-in`）。
- 未动：`ChatClient.jsx`、`SensitiveCover.jsx`、`SessionList.jsx`、`imports.css`、`globals.css` 等线上专属文件。
- `npm run build` 通过，`lan-site` / `lan-engine` 均为 active。

## 验收

```text
公开页面：
  / 200、/sign-in 200、/login 307 -> /sign-in、/forum 200、/category 200、
  /me 200、/pricing 200、/post/p_1001 200
旧 API：
  /api/pool 200、/api/memory 200、/api/forum 200、/api/img 200
引擎：
  /site/pool 200、/site/forum 200、/site/user/signup/request 200
登录链路（生产 API）：
  signup/request -> devCode；signup/verify -> 200 + session + 100 credit
  /me 显示「我的积分 / 每日签到」；签到 200
  reset/request -> devCode；reset/verify -> 200；旧密码 401，新密码 200
真实点击（生产 CDP）：
  /sign-in?s=signup 填表 -> 注册 -> OTP 页 -> 填入 -> 验证 -> 跳 /，Nav 显示昵称
  /sign-in 邮箱+密码 -> 登录 -> 跳 /
  /sign-in?s=reset -> 发送 -> 填入 + 新密码 -> 「密码已重设」，新密码 200 / 旧密码 401
生成：
  游客 /api/chat -> complete:true（账号 b021）
清理：
  测试账号/待验证码已删：users=0、pending=0、resets=0；forum=7 条种子帖
```

## 回滚

```bash
BK=/opt/lan/backup-signin-20261115220642
sudo systemctl stop lan-site
cd /opt/lan/site
rm -rf app components lib public .next
cp -a $BK/site/app $BK/site/components $BK/site/lib $BK/site/public .
cp -a $BK/site/.next .
sudo systemctl start lan-site

sudo cp $BK/engine/server.py /opt/lan/engine/server.py
sudo cp $BK/engine/users.py /opt/lan/engine/users.py
sudo systemctl restart lan-engine
# 需要时恢复用户/广场数据
cp $BK/users.json /opt/lan/out/users.json 2>/dev/null || true
cp $BK/forum.json /opt/lan/out/forum.json 2>/dev/null || true
```

## 备注

- 注册/重置验证码目前显示在页面上（演示）；接真实邮件后设 `AUTH_DEV_CODE=0` 并补邮件发送。
- Telegram / Google / 登录码上传仍是占位，不发起外部认证。
- 本次部署为 scp 增量，不是 git 部署；线上专属文件未被覆盖。
