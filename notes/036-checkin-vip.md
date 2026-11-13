# 036 签到 + VIP 等级（notes/008 §7 运营）

日期：2026-11-13
分支：`feat/checkin-vip`（基于 `feat/account-ledger`）
总文档：`notes/008-dzmm-teardown.md` §3.5（tasks.list）、§5（VIP 档位）、§7（运营）

## 规则

**每日签到**

- 按北京时间（固定 UTC+8，不依赖 tzdata）每天一次。
- 基础 **+5 credit**；连续第 7 天（以及 14/21…）额外 **+20**。
- 断签后从第 1 天重算；同一天重复签到返回 `400 今天已经签到`。
- 账本条目带 `day: "YYYY-MM-DD"`，方便算连续天数，不新增表。

**VIP 等级**

- 近 30 天累计**充值 credit**：
  - `> 0` → VIP1
  - `≥ 2055`（¥100 档）→ VIP2
  - `≥ 10958`（¥400 档）→ VIP3
- 在 `_public()` 里实时计算，不落库；30 天窗口外的充值自动失效。

## 接口

```text
GET  /site/credits/checkin?token=   -> {user, checkin:{today,checkedToday,streak,rewardNext}}
POST /site/credits/checkin {token}  -> {user, entry, streak} | 400 今天已经签到
```

Next：`GET/POST /api/credits/checkin`（透传 `lan_sess`，外圈仍要 `lg_pass`）。

## 页面

- `/me`：当前积分旁显示 VIP 徽标；新增「每日签到」行（连续天数、今日奖励、签到按钮/今天已签到）；
  账本下新增任务列表：每日签到 / 注册赠礼 / 邀请好友（即将上线）。
- `/pricing`：当前登录行显示 `VIP1/VIP2/VIP3` 与「近 30 天充值累计决定等级」。

## 验证

```text
引擎：
  register 100 vip0
  GET checkin -> checkedToday=false, streak=0, rewardNext=5
  POST checkin -> +5, streak=1, day=2026-11-13
  POST again   -> 400 今天已经签到
  GET checkin -> checkedToday=true, streak=1
  recharge 137 -> VIP1 / +2055 -> VIP2 / +10958 -> VIP3

Next：
  GET /api/credits/checkin -> checkedToday=false
  POST -> credit 234.90 -> 239.90, entry +5, streak 1
  账本新增「每日签到 +5.00」

单测：37 项 OK（test_users 新增 3 项：VIP 等级、每日一次、第 7 天奖励）
构建：next build 通过
截图：out/shots/me-vip-*.png（签到前）、me-checked-*.png（签到后）、pricing-vip-1440-light.png
横向溢出：1440 / 390 均为 scrollW == vw
```

## 已知限制

- 任务列表只有「每日签到」是实装；邀请好友是占位。
- VIP 以 credit 累计近似人民币档位（¥100→2055、¥400→10958），没有单独存 CNY 金额。
- 没有补签、没有签到日历；断签只影响连续奖励。
- 充值是演示接口，VIP 变化只影响徽标/展示，不影响生成权限。

## 回滚

```powershell
git checkout feat/account-ledger
git branch -D feat/checkin-vip
# 或撤文件
git checkout -- engine/users.py engine/server.py site/app/me/page.js site/app/pricing/page.js site/app/account.css
Remove-Item engine\tests\test_users.py  # 如要连同上一轮
Remove-Item site\app\api\credits\checkin, site\components\CheckinButton.jsx -Recurse -Force
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
