# 040 登录逆向 + 邮箱 OTP 登录/注册/重置

日期：2026-11-15
分支：`feat/signin-otp`
目标：dzmm.ai `/sign-in` 与登录弹窗；复刻到 `site/` + `engine/`

## 一、REA 逆向结果（2026-11-15，Chrome CDP 9333 + 代理 7897）

登录弹窗（首页点「登录」）：

```text
邮箱 + 密码               POST /api/auth/sign-in   {"email","password"}
或 飞机（Telegram）        /sign-in?s=signin-tg
Google                    /auth/oauth/google?next=/
以游客模式继续            关闭弹窗
忘记密码                  /sign-in?s=reset
去注册账号                /sign-in?s=signup&next=/
```

错误示例：`{"error":"邮箱地址或密码错误"}`。

注册：

```text
POST /api/auth/sign-up   {"email","password","terms":true}
  -> {"type":"email"}
  -> /sign-in?s=otp&email=...&next=/&type=email
POST /api/auth/sign-up/otp  {"email","token","type":"email","next":"/"}
```

邮箱验证码是 **8 位**；页面提示「验证码邮件可能被归入垃圾邮件」。
重置密码：

```text
POST /api/auth/send-reset-password-email  {"email"} -> {"ok":true}
  -> /sign-in?s=otp&email=...&next=/reset-password
POST /api/auth/sign-up/otp  {"email","token","type":"recovery","next":"/reset-password"}
```

Telegram：

```text
GET /api/auth/tg-sign-in-code          -> 生成 code
GET /api/auth/tg-sign-in-code/<code>   -> 轮询状态
深链 https://telegram.me/Dzmm1loginbot?start=dzmm_login_<code>_www_dzmm_ai
```

登录码：`/sign-in?s=signin-code`，上传登录码图片（未做图片识别）。
Google：`/auth/oauth/google?next=/`。

## 二、克隆实现

**引擎 `engine/users.py`**

- `out/users.json` 新增 `pending_signups` / `reset_codes`。
- 8 位数字码，10 分钟有效，最多试 5 次；验证码/重置码均一次性。
- 注册验证通过后创建用户（送 100 credit）并签发 session；重置密码会清掉该用户所有旧 session。
- 新接口（都要 `x-site-token`）：
  - `POST /site/user/signup/request` {email,password,name} -> `{ok,email,devCode?}`
  - `POST /site/user/signup/verify` {email,code} -> `{user,token}`
  - `POST /site/user/reset/request` {email} -> `{ok,email,devCode?}`
  - `POST /site/user/reset/verify` {email,code,password} -> `{ok,user}`
- `AUTH_DEV_CODE` 默认 `1`：演示站没有邮件服务，把验证码回给前端；线上要真邮件时设 `0`，并接入邮件发送。

**Next 代理**

```text
POST /api/auth/signup/request|verify
POST /api/auth/reset/request|verify
```

verify 接口成功时写 `lan_sess` cookie；原有 `/api/auth/login`、`/api/auth/me`、`/api/auth/logout` 不变。

**前端**

| 文件 | 作用 |
|---|---|
| `site/app/sign-in/page.js` + `sign-in.css` | `/sign-in` 登录/注册/重置/Telegram/登录码/Google 占位 |
| `site/components/SignInClient.jsx` | 表单状态机：登录、注册发码、8 位 OTP、重置、成功态 |
| `site/app/login/page.js` | `/login` 302/redirect 到 `/sign-in`（兼容旧链接） |
| `site/components/Nav.jsx` | 右上角新增「登录」/当前昵称；手机端隐藏该文字 |
| `site/app/me`、`forum`、`post`、`pricing` 等 | 登录链接统一改到 `/sign-in` |

演示体验：注册后页面直接显示「演示验证码 xxxxxxxx」，点「填入」即可验证；没有邮件服务。
Telegram / Google / 登录码上传保留入口，标记为本地未接入（不发起外部认证）。

## 三、验证

```text
单测：43 项 OK（新增 signup OTP / reset OTP）
Next API：
  signup/request -> devCode
  signup/verify  -> Set-Cookie lan_sess，user credit=100
  /api/auth/me   -> user
  reset/request  -> devCode
  reset/verify   -> 旧密码 401，新密码 200
UI 真实点击（CDP）：
  /sign-in?s=signup 填昵称/邮箱/密码/勾选协议 -> 注册 -> OTP 页显示验证码
  点「填入」-> 验证 -> 跳 /，右上角显示昵称，/api/auth/me 返回用户
  /sign-in 邮箱+密码 -> 登录 -> 跳 /
  /sign-in?s=reset -> 发送 -> 填入验证码 + 新密码 -> 「密码已重设」
截图：out/shots/signin-1440-light.png、signin-1440-dark.png、signin-390-light.png、
      signup-1440-light.png、signin-tg-1440-light.png
```

## 四、已知限制

- 没有真实邮件发送：验证码直接显示在页面/接口里；线上需接 SMTP/邮件服务并设 `AUTH_DEV_CODE=0`。
- Telegram 登录只保留入口，未接 Bot；Google OAuth 未接客户端密钥；登录码图片上传未做识别。
- 未做登录失败限流/锁定；验证码有 5 次尝试上限。
- 旧的 `/api/auth/register` 即时注册接口保留，但新页面不再使用。

## 五、回滚

```powershell
git checkout feat/forum
git branch -D feat/signin-otp
# 或撤文件
Remove-Item site\app\sign-in, site\app\api\auth\signup, site\app\api\auth\reset,
  site\components\SignInClient.jsx -Recurse -Force
git checkout -- engine\users.py engine\server.py engine\tests\test_users.py
git checkout -- site\app\login\page.js site\components\Nav.jsx
git checkout -- site\app\forum, site\app\me\page.js site\components\PostActions.jsx site\components\RechargeDemo.jsx
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
