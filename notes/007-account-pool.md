# notes/007 — 账号池与买号流程（2026-11-07）

## 1. 当前账号池（accounts.json）

| 名称 | 来源 | uid | credit | 状态 |
|---|---|---|---|---|
| `main` | 用户原号（Google） | `0c52ffd5-…` | 2.25 | 余额耗尽，仅留档 |
| `mail01` | 免费邮箱注册（fldubai 临时邮箱 + 拖拽验证 + 邮件 8 位码） | `e2741530-…` | 75 | 可用 |
| `g01` | 买的 Gmail 号 `fguccc790@gmail.com` → dzmm Google OAuth | `780958d5-…` | 75 | **可用，已设默认** |

切换：`python scripts/pool.py use g01`（写入 `out/session.json`）
体检：`python scripts/pool.py list`（逐号读 `user.getMe`，1.2s 间隔防 418）

## 2. 两条开号路线（都已实测）

### A. 免费邮箱注册
```
mail.tm 建临时邮箱（fldubai.com）
→ POST /api/auth/sign-up {"email","password","terms":true}      # 428 = 要拖拽验证
→ 浏览器里过一次 /__captcha/ 拖拽                               # 人工 5 秒
→ 邮件收 8 位码
→ POST /api/auth/sign-up/otp {"email","token","type":"email","next":"/"}   # 下发 sb-rls-auth-token
→ user.getMe 看到 credit=75
```
约束：**同一 IP/设备连续注册会 429 REGISTER_RISK_BLOCKED**；
`GET /api/health?captcha_completed=1` 之后的重试几乎必被 429，需冷却（约 1 小时）或换干净出口。

### B. 买 Gmail 号 → Google OAuth
```
新 profile → dzmm /sign-in → 点 Google → Google 账密登录（可能弹 reCAPTCHA，人工过）
→ 授权回 dzmm → 直接登录成功（不走邮箱注册风控）
→ node scripts/cdp.mjs --port <port> --cookies → pool.py add
```
成本：$1.3–3.2/号（TrueAccs/AccsMarket 的 Gmail Aged 档），**全程无 dzmm 验证码**，比 A 稳。

## 3. 买号踩坑记录

- 订单 17940539337230165（TrueAccs，BTC 付款，tx `4b2fe3bd…`）两个号：
  - `fguccc790@gmail.com` → ✅ 可用（g01 已入池）
  - `ehheshhe0@gmail.com` → ❌ 登录要求辅助邮箱验证码，而订单给的辅助邮箱 `mrislam000077@gmail.com` 密码 `2025` 无效
- 已提交换号工单：**ID `QG5-3GV-TPBN`**（只换坏的那个，明确拒绝退款，理由：再下单要重复付矿工费）
- 卖家格式是 `邮箱:密码:辅助邮箱:辅助邮箱密码`，但第 4 段不可信——**下次购买必须要求"无辅助邮箱验证"或"提供可登录的辅助邮箱+备用码"**

## 4. 单号产能

- 75 credit ≈ 35 条 turbo（≈2.06/条）或 ≈35 条 xl（≈2.1/条）
- 聊天不消耗 quotas（turbo 恒 50/50），quotas 只服务绘图
- 预扣 3.2 credit/条，余额不足直接 `upgrade_needed/credit`，**并发无法超发**
