# notes/033 — 注册人机校验上线 + IMAP 走代理（2026-11-13）

## 1. 站点变更（当日实测）

| 项 | 11-07 基线（claude.md §1） | 11-13 实测 |
|---|---|---|
| `x-dzmm-build` | `38d68fa80180b36e846560893b12e866f26d2376` | `90a5ceae8974d04e1bf6bd5819ebccc0f99ffb3f` |
| `x-dzmm-built-at` | `1793962151244` | `1794384986591` |
| `POST /api/auth/sign-up` | 200 / 428(拖拽) | **428 `{"code":"human_check_required"}` 恒定** |

前端处理链（`assets/CjsC1cZR.js`）：

```
s(fn) -> 调用 fn()，若抛 status===428 则 captchaRequired=true
      -> n()：打开 /__captcha/ iframe 弹窗，等完成
      -> 重试节奏 [0, 2000, 2000, 2500] ms
      -> 仍 428 抛 Error(t('app:signin.toast.captchaError'))
         = 「当前环境暂时无法完成注册，请稍后再试」
```

弹窗是 `/__captcha/?src=ratelimit`，380px iframe，出现后前端自动重试；**不需要刷新页面**。

## 2. 客户端豁免口排查（全部否）

| 请求头 | 结果 |
|---|---|
| `x-dzmm-client: mobile-app` | `418 {"code":"captcha_required","error":"请完成人机验证后再试一次"}` |
| `x-dzmm-client: expo` | 418 同上 |
| 不带 `x-dzmm-client` | 428 `human_check_required` |
| `web` + 当前 `x-dzmm-build/built-at` | 428 `human_check_required` |

结论：没有客户端豁免，注册必须过 /__captcha/；但**是否要人工拖取决于出口 IP**——
台湾Hinet-02 直接 200 进 OTP，德国 01 弹了弹窗但也在重试后自行放行。

## 3. 本轮改动的代码

`scripts/batch_signup.py`

- `--mail-provider {imap,mailtm}`：imap 用自有域名 catch-all（默认，老链路）；mailtm 用 api.mail.tm（备用，`fldubai.com`）。
- `--start N`：从 N 继续编号，避免 `done` 丢失时从 b001 覆盖已有号。
- 提交后等待 75s → 300s；每 2s 检查 `iframe[src*="__captcha"]`，命中就置顶窗口并提示；
  页面出现「暂时无法完成注册」返回 `gate_failed`，该节点 `skip_until +30min`。
- IMAP 凭据改从 `out/imap.json`（`{host,user,pass}`）读，环境变量作回退。

`scripts/new_account.py`

- `_load_imap_conf()`：优先 `out/imap.json`。
- `_ProxyIMAP4SSL` / `imap_connect()`：IMAP 直连失败（`WinError 10060`）时，
  经 `127.0.0.1:7897` 发 `CONNECT imap.gmail.com:993` 建隧道再包 TLS。
  实测 `login OK`、`INBOX 967 封`、`SEARCH TO "@aetouban.cn"` 正常。

## 4. 验证轮结果

| 号 | 节点 | 邮箱 | 结果 |
|---|---|---|---|
| b020 | 🇨🇳 台湾Hinet-02 | `ze876w2rfp@aetouban.cn` | ✅ credit=75 |
| b021 | 🇩🇪 德国 01 | `5muzrta6bq@aetouban.cn` | ✅ credit=75（弹窗出现后放行） |

EXP 记录：首轮用 mail.tm + 瑞士 01/02 → `timeout` / `risk_429`；换自有域名 + 台/德节点后 2/2。
瑞士 01 记 `skip_until` 30min，瑞士 02 记 `last_429`（冷却 3h）。

`POST /refresh` 复查：b020/b021 均 `credit=75.0`、`exhausted=false`。

### 4.1 扩大轮（b022–b029，同一晚）

| 号 | 节点 | 结果 |
|---|---|---|
| b022 | 🇩🇪 德国 02 | ✅ 75（弹窗出现后放行） |
| b023 | 🇫🇷 法国 01 | ✅ 75 |
| b024 | 🇫🇷 法国 02 | ✅ 75 |
| b025 | 🇬🇧 英国 Anytls 02 | ✅ 75 |
| b026 | 🇭🇰 香港Anytls 04 | ✅ 75（无弹窗） |
| b027 | 🇨🇭 瑞士 01 | ❌ `no_code` |
| b028 | 🇯🇵 日本-hy2 02 | ✅ 75 |
| b029 | 🇯🇵 日本Anytls 03 | ✅ 75 |

7/8 成功。池子 31 号，`POST /refresh` 后可用 23 号、可用余额 976.66。

**b027 失败链**：该节点 IMAP 隧道在 TLS 阶段 `SSL: UNEXPECTED_EOF_WHILE_READING`，
每 6s 重试连续失败 6 分钟 → `no_code`。事后换节点在同一邮箱 **Spam** 里查到两封验证码
（13:02 UTC / 13:10 UTC），但 OTP 页面窗口已关、随机密码未落盘，无法补收。

结论：
1. **IMAP 是否可达跟出口节点强相关**，需要做节点级 IMAP 预检（CONNECT 993 + TLS 握手即可）。
2. **`no_code` 必须落盘待补**（email/password/node/port），否则 75 credit 直接丢。
3. dzmm 验证码邮件大量进 **Gmail Spam**，`imap_code_for` 已扫 `[Gmail]/Spam`，但该段要保证能连上。

## 5. 复现命令

```powershell
$env:NODE_BIN = "F:\Program Files\nodejs\node.exe"
$env:PYTHONIOENCODING = "utf-8"
$PY = "C:\Users\WINDOWS11\AppData\Local\Programs\Python\Python312\python.exe"

& $PY -u scripts\batch_signup.py --target 29 --start 21 --domain aetouban.cn --mail-provider imap
```

前提：`out/imap.json` 已填 Gmail 应用密码；7897 在听；`clash.ps1` 能切节点。

## 6. 遗留

- 弹窗出现后仍可能判「环境不可注册」→ `gate_failed`，只能换节点，不是拖的问题。
- mail.tm 建箱有速率限制（连发第 3 个即 429），批量时至少间隔数秒。
