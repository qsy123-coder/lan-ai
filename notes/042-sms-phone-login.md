# 042 短信服务接入 + 手机号 OTP 登录/注册

日期：2026-11-15
分支：`feat/sms-login`

## 短信服务抽象（`engine/sms.py`）

`SMS_PROVIDER` 选择发送通道：

| 值 | 需要的环境变量 | 说明 |
|---|---|---|
| `mock`（默认） | 无 | 不真发短信，写 `out/sms_outbox.jsonl`，验证码回给前端 |
| `webhook` | `SMS_WEBHOOK_URL`、`SMS_WEBHOOK_TOKEN`（可选） | POST JSON `{phone,code,text,purpose}`，可接任意短信网关 |
| `twilio` | `TWILIO_ACCOUNT_SID`、`TWILIO_AUTH_TOKEN`、`TWILIO_FROM` | Twilio Messages API |
| `smsbao` | `SMSBAO_USER`、`SMSBAO_PASS` | 短信宝 `api.smsbao.com` |

其它：`SMS_TEMPLATE`（默认「【澜】验证码 {code}，5 分钟内有效。」）、
`SMS_DEV_CODE`（mock 默认 1，其它默认 0；1 时把验证码回给前端）、
`SMS_PROXY`（可选，发送 HTTP 走代理）。

**当前没有短信服务凭证**：本地/生产默认 `mock`，页面显示「演示验证码」。
填入真实凭证并把 `SMS_PROVIDER` 改为对应值后，重启引擎即可真发；同时设
`SMS_DEV_CODE=0` 不再回显验证码。

## 手机号登录

**数据**：`out/users.json`

- 用户新增 `phone`（E.164，如 `+8613800138000`）；手机号用户 `email` 为空。
- 新增 `phone_codes`：`{phone: {code, exp, tries, lastSent}}`。
- 6 位数字码，5 分钟有效，最多 5 次尝试；同一号码 60 秒内不重复发。
- 未注册手机号验证通过后自动建号，送 100 credit；已注册则直接登录。
- 手机号用户没有密码，只能用短信码登录；邮箱/手机号目前是两个独立账号。

**引擎接口**（都要 `x-site-token`）：

```text
POST /site/user/phone/request {phone} -> {ok,phone,provider,devCode?}
POST /site/user/phone/verify  {phone,code,name?} -> {user,token}
```

**Next 代理**：

```text
POST /api/auth/phone/request
POST /api/auth/phone/verify   （成功写 lan_sess）
```

**前端**：

- `/sign-in` 增加「邮箱 / 手机号」切换。
- 手机号模式：区号（默认 +86）+ 手机号 + 获取验证码（60s 倒计时）+ 6 位验证码 + 协议勾选 + 登录/注册。
- mock 通道下显示「演示验证码」，可一键填入。
- `/me` 在无邮箱时显示手机号。

## 验证

```text
单测：47 项 OK（新增 test_sms 2 项、test_users 手机号 2 项）
API：phone/request 200 + provider=mock + devCode
     phone/verify 200 -> user{phone,email:"",credit:100} + Set-Cookie
     /api/auth/me 200；/me 页面显示手机号
UI 真实点击（CDP）：
  /sign-in -> 手机号 tab -> 输入 +86/号码 -> 获取验证码 -> 演示码 -> 填入
  -> 勾选协议 -> 登录/注册 -> 跳 /，Nav 显示「用户7938」
截图：out/shots/signin-phone-1440-light.png、signin-phone-390-light.png
```

## 已知限制

- 没有真实短信凭证，默认 mock；真实发送未实测（Twilio/smsbao/webhook 适配已写好）。
- 手机号与邮箱账号是两套，暂不支持绑定/合并。
- 只有 60 秒发送冷却，没有按 IP/日限额；生产建议在网关侧加限流。
- 短信模板需按服务商审核/报备；`SMS_TEMPLATE` 可覆盖文案。

## 回滚

```powershell
git checkout main
git branch -D feat/sms-login
Remove-Item engine\sms.py engine\tests\test_sms.py -Force
git checkout -- engine\users.py engine\server.py site\components\SignInClient.jsx
git checkout -- site\app\sign-in\sign-in.css site\app\me\page.js
Remove-Item site\app\api\auth\phone -Recurse -Force
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
