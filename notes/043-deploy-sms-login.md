# 043 短信登录上线记录（2026-11-15 23:0x）

分支：`feat/sms-login`
备份：`/opt/lan/backup-sms-20261115230726`（154MB：站点源码 + `.next` + 引擎 `server.py`/`users.py` + 用户/广场数据）

## 上线内容

**引擎**

- 新增 `engine/sms.py`：`mock` / `webhook` / `twilio` / `smsbao` 四种发送通道。
- `users.py`：用户 `phone` 字段、`phone_codes`、E.164 校验、6 位码 5 分钟、60 秒发送冷却。
- `server.py`：`/site/user/phone/request`、`/site/user/phone/verify`。

**站点**

- `/sign-in` 增加「邮箱 / 手机号」切换、区号 + 手机号 + 获取验证码 + 6 位码 + 协议、mock 演示码。
- 新增 `/api/auth/phone/request|verify`；`/me` 无邮箱时显示手机号。
- `npm run build` 通过；`lan-site` / `lan-engine` active。
- 未动 ChatClient / SensitiveCover / SessionList / imports.css / 409 会话锁。

## 短信通道状态

当前生产 **没有短信服务凭证**，`SMS_PROVIDER` 未设置，默认 **mock**：

- 不真正发短信；验证码显示在页面「演示验证码」，并写 `out/sms_outbox.jsonl`（测试后已清空）。
- 接真实短信：在 `lan-engine` 环境里设置
  - `SMS_PROVIDER=webhook` + `SMS_WEBHOOK_URL`（通用网关），或
  - `SMS_PROVIDER=twilio` + `TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM`，或
  - `SMS_PROVIDER=smsbao` + `SMSBAO_USER/SMSBAO_PASS`；
  - 同时设 `SMS_DEV_CODE=0`，重启 `lan-engine`。
- 可选 `SMS_TEMPLATE`、`SMS_PROXY`。

## 验收

```text
公开页面：
  / 200、/sign-in 200（含「手机号」）、/login 307 -> /sign-in、
  /forum 200、/category 200、/me 200、/pricing 200
旧 API：/api/pool 200、/api/memory 200、/api/forum 200
手机号（生产 API）：
  phone/request 200 provider=mock + devCode
  phone/verify 200 -> user{phone,email:"",credit:100} + Set-Cookie
  /api/auth/me 200；/me 显示手机号
邮箱回归：
  signup/request + verify 200（手机号改动未破坏邮箱 OTP）
生成：
  游客 /api/chat -> complete:true
真实点击（生产 CDP）：
  /sign-in -> 手机号 tab -> +86/号码 -> 获取验证码 -> 演示码 -> 填入
  -> 勾选协议 -> 登录/注册 -> 创建「用户1133」，/api/auth/me 返回该用户
清理：
  测试手机号/邮箱用户已删；users=0、phone_codes=0、forum=7
```

## 回滚

```bash
BK=/opt/lan/backup-sms-20261115230726
sudo systemctl stop lan-site
cd /opt/lan/site
rm -rf app components lib public .next
cp -a $BK/site/app $BK/site/components $BK/site/lib $BK/site/public .
cp -a $BK/site/.next .
sudo systemctl start lan-site

sudo cp $BK/engine/server.py /opt/lan/engine/server.py
sudo cp $BK/engine/users.py /opt/lan/engine/users.py
sudo rm -f /opt/lan/engine/sms.py
sudo systemctl restart lan-engine
```

## 备注

- 当前是 mock 短信：页面会显示验证码，适合演示；真实短信必须按上面的环境变量接入并关闭 `SMS_DEV_CODE`。
- 手机号与邮箱账号目前是两套，未做绑定/合并。
- 仅 60 秒发送冷却，生产建议在短信网关侧加 IP/日限额。
