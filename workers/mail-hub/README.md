# mail-hub —— 自有域名收码（Cloudflare Email Routing + Worker + KV）

替代 Gmail IMAP：任意 `*@<域名>` 的邮件由 catch-all 交给 Worker，Worker 提取 8 位码写 KV，
脚本走 HTTP 查询。没有 IMAP 隧道、没有 Gmail Spam 索引问题。

## 一次性部署

```powershell
cd workers\mail-hub
npm i -D wrangler
npm i postal-mime

npx wrangler login
npx wrangler kv namespace create MAILKV        # 把返回的 id 填进 wrangler.toml
npx wrangler deploy
npx wrangler secret put API_TOKEN              # 可选但建议；脚本侧同步填 out/mail_api.json
```

## Cloudflare 控制台（域名侧）

1. 域名 NS 托管到 Cloudflare（免费套餐即可）。
2. **Email → Email Routing** → 启用，按提示添加 MX/SPF（自动）。
3. **Catch-all address** → Action 选 **Send to a Worker** → 选 `mail-hub`。
4. 目标邮箱验证仅对 forward 模式需要；Worker 模式不需要。
5. 记下 Worker 的 `https://mail-hub.<subdomain>.workers.dev` 作为 `base_url`。

## 自检

```powershell
curl.exe -sS "https://mail-hub.<sub>.workers.dev/health"
# 往 test123@<域名> 发一封含 8 位数字的邮件，然后：
curl.exe -sS -H "Authorization: Bearer <token>" "https://mail-hub.<sub>.workers.dev/code?addr=test123@<域名>"
# 期望 {"code":"12345678",...}
```

## 脚本侧配置

`out/mail_api.json`（git 忽略）：

```json
{"base_url":"https://mail-hub.<sub>.workers.dev","token":"<API_TOKEN>","domain":"<域名>"}
```

## 边界

- KV 每地址只保留**最新一条**验证码，历史最多 20 条（`/list` 排障）。
- 邮件正文必须是纯文本或 HTML 里含 8 位连续数字；当前站点的验证码就是 8 位。
- 免费额度：Workers 10 万请求/天、KV 读写各 10 万/天，足够本项目的量级。
