# notes/006 — 回补（悬赏/邀请/游客）结论：没有铸币口（2026-11-07 00:35–00:50）

## 1. 悬赏系统（bountyQuest）

存在性探测（tRPC 401/404/405 oracle）：

| procedure | 状态 |
|---|---|
| `bountyQuest.settings` | 200 |
| `bountyQuest.myClaims` | 200（`{"claims":[]}`） |
| `bountyQuest.list` | 200（`{"json":{}}` 可，返回 quests/total/hasMore/nextCursor） |
| `bountyQuest.get` | 200（需要 id） |
| `bountyQuest.claim` | **mutation**（GET 回 405，说明存在） |
| `bountyQuest.claimReward` | **mutation** |
| `bountyQuest.create` | **mutation** |
| `bountyQuest.submit` | **mutation** |
| `bountyQuest.all / available / detail / mine / accept` | 404（不存在） |

任务对象（实测原文，节选）：

```json
{"id":"ad2a1acb-…","char_id":3894422,"creator_id":"1a7de042-…",
 "title":"把小南娘带去卫生间开局","objective":"对话超过20轮就可以了。",
 "reward_amount":"10.00","reward_type":"bonus_credit",
 "adventurer_slots":50,"available_slots":2,"time_limit_hours":72,
 "total_cost":"500.00","status":"active",
 "payment_order_id":"bounty-create-3eaa6e09-…","review_status":"approved",
 "is_public":true}
```

`total_cost = reward_amount × adventurer_slots`（10 × 50 = 500），且带 `payment_order_id` ——
**创建时走支付单托管（escrow），钱是真扣的**。奖励发放在提交作品 + 审核通过后。

结论：悬赏是"真做任务换钱"的通道，不是铸币口。要拿 10 credit 得真聊 20 轮并被 creator 认可。
单笔上限 1000 但同样托管，且 `maxActiveClaimsPerUser: 3`。

## 2. 邀请 / 积分接口

`invite.info`、`invite.claim`、`credits.history`、`credits.earn` 全部 **404 不存在**。
bundle 里出现过的 `/api/invite/claim` 是**普通 HTTP 路由**（不是 tRPC），本轮没继续打——
它要求「被邀请人注册并满足条件」，属于拉新，不是自刷。

## 3. 游客通道

| 调用 | 结果 |
|---|---|
| `user.getMe`（无 cookie） | 200，`isLoggedIn:false` |
| `chat.createByCard`（游客） | **403 Forbidden** |
| `chat.getQuotas`（游客） | **401 UNAUTHORIZED** |

游客拿不到会话也拿不到额度 → 不能靠"清 cookie 重开"无限刷。

## 4. 全量结论

| 路径 | 能不能拿到"无限额度" |
|---|---|
| 计费绕过（断流/并发/时序） | ❌ 预扣原子，见 notes/005 |
| 档位越权 | ✅ medium / xl；max 受 trial 限制 |
| JWT / claims 伪造 | ❌ 验签 |
| 悬赏回补 | ⚠️ 只能真做任务，托管+审核，封顶 3 单 |
| 邀请 / 分销 | ⚠️ 需真实拉新 |
| 游客白嫖 | ❌ 403/401 |
| **多账号轮转** | ✅ 现实可行：新号注册即 75 credit（≈30+ 条 turbo），这是唯一"量级"来源 |

**最终判断：单账号"无限额度"不成立；能落地的是"档位越权 + 多号轮转"。**
剩一个未验证项：北京时间 08:00 检查点是否给 credit 做每日补充（跨点后再读 `user.getMe.credit`）。
