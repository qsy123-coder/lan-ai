# notes/037 — 扩号产线：WARP IP 工厂 + 免费域名工厂（2026-11-14 晚）

## 0. 一句话

注册的瓶颈已经从「IP」转移到「域名」：**WARP 可以无限免费换 IPv6 出口**，
但站点对每个根域名每天只放 **2–3 个**注册。扩号速度 = 干净域名数量 × 3。

---

## 1. IP 工厂：Cloudflare WARP（已验证可用）

服务器 `43.135.10.175` 装 `cloudflare-warp`，跑 **proxy 模式**（SOCKS5 在 `127.0.0.1:40000`），
本地用 SSH 隧道接出来：

```powershell
ssh -i ~/.ssh/wavemod_server -N -L 1081:127.0.0.1:40000 ubuntu@43.135.10.175
# 浏览器 --proxy-server=socks5://127.0.0.1:1081
```

换 IP（每次执行 = 新身份/新 IPv6）：

```bash
warp-cli --accept-tos disconnect
warp-cli --accept-tos registration delete
warp-cli --accept-tos registration new
warp-cli --accept-tos mode proxy
warp-cli --accept-tos connect
```

实测：
- 出口 `2a09:bac1:3180::246:ef` → 重注册后 `2a09:bac5:3981:e6::17:360`（确实换）
- 经 WARP 访问 dzmm：`home=200/0.15s`、`trpc=401`、`signup=428`（可注册）
- 用 WARP 浏览器完整注册成功（b051/b052/b053/b054/b055）

**坑**：重注册后 WARP 的 SOCKS 端口会短暂重建。必须轮询本地链路 `curl --proxy socks5h://127.0.0.1:1081 https://www.dzmm.ai/` 直到 200，
再启动浏览器；否则浏览器会带着死连接启动（`ECONNREFUSED` / 白屏 / no form）。

---

## 2. 域名工厂：DigitalPlat 免费域 + Cloudflare Email Routing

### 2.1 选域前提

Cloudflare 只接受**根域**（PSL 内的域名）。已确认在 PSL、可被 Cloudflare 当根域的免费后缀：

```
us.kg / dpdns.org / qzz.io   （DigitalPlat）
eu.org / pp.ua / is-a.dev / js.org / dynv6.net
```

`afraid.org` 的共享子域**不在** PSL，Cloudflare 建不了 Zone。

### 2.2 实测走通的完整链路

```
DigitalPlat 注册 jjlnlnl.dpdns.org
→ Cloudflare POST /zones {"name":"jjlnlnl.dpdns.org"} 返回两个 NS
→ 在 DigitalPlat「域名服务器」页把 NS1/NS2 替换成 Cloudflare 的两个，点「更新名称服务器」
→ Cloudflare PUT /zones/{id}/activation_check 循环催，直到 status=active
→ POST /zones/{id}/email/routing/enable        # 自动补 MX route1/2/3 + SPF
→ PUT  /zones/{id}/email/routing/rules/catch_all
       {"enabled":true,"matchers":[{"type":"all"}],
        "actions":[{"type":"forward","value":["qsy55882@gmail.com"]}]}
→ 注册用 随机@jjlnlnl.dpdns.org，验证码进 Gmail，IMAP 收码
```

实测 b054、b055 就是这个域注册成功的。

### 2.3 DigitalPlat 操作要点（给不熟悉后台的人）

域名管理页 →「DNS」→「域名服务器」标签 → 名称服务器 1/2 两个输入框 →
替换成 Cloudflare 给的两个 NS → 点右下角蓝色 **「更新名称服务器」**。
保存后 1 分钟内用 DoH 验证：

```
https://cloudflare-dns.com/dns-query?name=<域名>&type=NS
```

返回 `daniella.ns.cloudflare.com` / `hassan.ns.cloudflare.com` 即生效。

---

## 3. 走不通：Cloudflare 子域收件（三种方式全部失败）

目标是用一个域变出无限个「邮箱域名」（`dz1.aetouban.cn`、`dz2...`）。实测：

| 尝试 | 结果 |
|---|---|
| `POST /zones {"name":"dz1.aetouban.cn"}` | `1116 must be the root domain`（不接受子域做 Zone） |
| `POST /zones/{id}/email/routing/dns {"name":"dz1.aetouban.cn"}` | 200 `status: ready`，自动补了 dz1 的 MX/SPF，但投递仍回 **Missing email** |
| apex 区加字面规则 `probe3@dz1.aetouban.cn` | 仍 **Missing email**（apex 规则不匹配子域收件人） |
| 通配 MX `*.aetouban.cn → route1/2/3.mx.cloudflare.net` | 邮件到了 Cloudflare，仍 **Missing email** |
| catch-all 动作改成 Email Worker（部署成功，`handlers:["email"]`，worker 里 `message.forward`） | 仍 **Missing email** |

结论：**Cloudflare Email Routing 不会把子域收件人交给 apex 的 catch-all / Worker**。
（官方文档也只承诺子域「字面规则」，而实测 apex 区规则对子域不生效。）

> 期间临时把 apex catch-all 改成 Worker，已还原为 forward；不影响现有 `aetouban.cn` 收码。

---

## 4. 额度规律（决定扩号速度）

| 域名 | 今日成功数 | 之后表现 |
|---|---|---|
| `fldubai.com`（mail.tm） | 3（b048–b050） | 换 4 个全新 IP（含 WARP）仍 429 |
| `aetouban.cn` | 2–3（b051–b053） | 第 4 个起 429 |
| `jjlnlnl.dpdns.org` | 3（b054/b055 + 一次丢号） | 待观察 |

两类错误要分清：

- `该邮箱暂不支持注册` → **域名黑名单**（Guerrilla 等一次性域），与 IP 无关；
- `当前环境暂时无法完成注册`（`REGISTER_RISK_BLOCKED`，带请求 ID）→ **风控/额度**，与 IP、域名额度都相关。

---

## 5. 其它路径排查结论

| 路径 | 结论 |
|---|---|
| pp.ua | 现在收费，排除 |
| DigitalPlat 继续注册 | 账号额度用尽 |
| 服务器自建收信（MX 指向 43.135.10.175） | 腾讯云 25/2525 **外网全封**，开 25 需工单申请（等于等待），排除 |
| forwardemail.net | 免费版**无限域/无限别名/catch-all**，但官方提示「新注册域可能被临时风控」；**是否接受子域待验证**（明天首试） |
| Cloudflare WARP 当出口 | 已用，且是当前主力 |
| 机场节点轮询 | 可用节点每天漂移，约 1/3 能过注册，作为补充 IP 源 |

---

## 6. 自动化脚本（都在 `out/`，未入 git）

| 脚本 | 作用 |
|---|---|
| `warp_loop.py <count> <port> <domain>` | 换 WARP → 等链路 200 → 开浏览器 → 填表 → 提交 → 弹窗置顶 → 登记 worker → 等你拖 |
| `auto_finish.py` | 常驻监听 `out/workers/*.json`：进 OTP 就收码（IMAP 或 mail.tm）→ 提交 → 抓 cookie → `add_pool`；429 自动记死 |
| `prepare_signup.py <node> <port>` | 机场节点版：切节点 → 建箱 → 开窗 → 填表 → 弹窗 |
| `check_node.py <node...>` | 注册前体检：home 200 / trpc 401 / signup 428 + 耗时 |
| `finish_imap.py` / `finish_mailtm.py` | 手动收尾（IMAP 或 mail.tm API） |
| `cf` 相关 | Cloudflare 建 Zone / 开 Email Routing / catch-all 的 API 调用（见 §2.2） |

### 关键实现坑

1. **launch 后立刻登记 worker**：否则「no form」误判会让 OTP 页没人收码（真踩过：9700/9710 的码发了没人填）。
2. **复选框可能没勾上**：`set value` 之后要点一次 `input[type=checkbox]`，提交前后都校验；
   用 `out/check_and_submit.js`（勾选 + 点注册）最稳。
3. **WARP 重注册后等链路**：见 §1。
4. **IMAP 走代理**：直连 Gmail 被墙，隧道用 `DZMM_PROXY`（socks5h/1080 或 7897），
   失败自动重试；Gmail 的 IMAP 搜索对 `TO 别名` 不稳，aetouban 收码要兜底 `FROM dianzimeimo`。
5. **mail.tm 限流**：连续建箱会 429，需要间隔；返回非 JSON 时重试。

---

## 7. 今日成果

```
新增 b048–b055（8 个），全部 credit=75
池子 48 号 / 可用 34 / 2052.6 credit（本机与 43-135-10-175 已同步）
```

## 8. 明天可选（按 ROI）

1. **forwardemail 子域实验**：用它接 `d1/d2.jjlnlnl.dpdns.org`，若接受子域 → 一个域变无限域名；
2. DigitalPlat 配额恢复后继续加域（每个域再 +3/天）；
3. 三个现有域每天轮换（约 8–9 个/天）；
4. 机场节点每天重新扫一遍，捡能过注册的 IP 作补充。
