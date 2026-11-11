# notes/005 — 计费模型定案：预扣额度（reservation）+ 档位矩阵（2026-11-07 00:10–00:30）

## 1. 一句话结论

**服务端按"预扣"计费，余额不够直接拒，失败不扣费 —— 单账号"无限额度"在这条链路上不成立。**
能拿到的只有档位越权（medium/xl 免费可用；max 需 trial/升级）。

## 2. 预扣机制（证据）

客户端 localStorage 里本来就有痕迹：

```json
// dzmm_chat_generation_billing:<uid>
{"<messageId>":{"reservedCredits":3.2,"settledCredits":1.91}}
```

服务端行为完全对上：

| 余额 | 并发数 | 结果 |
|---|---|---|
| 35.73 | 10（xl） | 10 条全 200 + complete，扣 20.63（≈2.06/条），余额 9.96 |
| **9.96** | **10（xl）** | **只 3 条 complete，7 条 init 后立刻 error；扣 6.42 = 3×2.14，余额 3.54** |
| 2.25 | 1（xl, maxTokens 8000） | `{"type":"error","data":{"classification":"upgrade_needed","upgradeReason":"credit"}}`，**0 扣费** |

9.96 余额正好只够 3 条 × 3.2 预扣（9.6），第 4 条起被拒 —— **预扣是原子的**，并发拿不到超发。

## 3. 档位矩阵（同一账号、同一 card 循环测）

| 模型 | 结果 |
|---|---|
| `x-apex-flux-0217-16k`（turbo） | 200 complete |
| `nalang-medium-0826` | 200 complete |
| `nalang-xl-0826-16k` | 200 complete |
| `nalang-max-0826` | 200 + `{"classification":"upgrade_needed","upgradeReason":"trial"}` |

> 修正 §3-B 的早期结论：max 档位的"能用"是 **trial 名额**，我们用测试把它烧完了；
> medium / xl 才是稳定可用的越权档位。

## 4. 会话/卡片层面的坑（已解决，写下来别再踩）

- `createByCard` 按 cardId 去重 → 想多会话必须换卡片。
- **`/api/chat` 的 `cardId` 必须与该 chatId 所属卡片一致**，否则一律 `403`（空 body）。这条排查花了半小时。
- 部分卡片建得出会话但生成报 `404 对话数据异常`（如 3774387 / 3854459 / 3857846 / 3866045）。
- 可用卡片（实测 200）：`3821218, 3856159, 3856830, 3858435, 3859027, 3860041, 3860611, 3860761, 3861267, 3865272, 3867710`

## 5. 现在的准确边界

| 能力 | 状态 |
|---|---|
| 免费号用 medium / xl 模型 | ✅ 可用（服务端不校验档位额度） |
| 免费号用 max 模型 | ❌ trial 用尽后 `upgrade_needed` |
| 断流不扣费 | ❌ 照扣 |
| 并发超发（余额打穿） | ❌ 预扣原子，拒绝且不扣费 |
| 不扣费白跑 | ❌ 只有 `upgrade_needed` 类错误不扣，但也不出内容 |
| 每日/活动回补 | ⏳ 未测（bountyQuest 2–1000 credit，上限 3 claim；invite/affiliate 未打） |

## 6. 下一步唯一还值得打的

1. `bountyQuest.claim`：单笔 2–1000 credit，`maxActiveClaimsPerUser: 3` —— 查能否重复 claim 同一任务 / 前置校验缺失。
2. `/api/invite/claim` 与 `/api/with-auth/dzmm/affiliate/partner*`（已见 201）—— 查邀请奖励是否可自邀/重复领。
3. ~~跨 08:00（北京时间）后看 credit 是否每日补充~~ → **已测（2026-11-10）：不回补**，见文末补记。


---

## 7. 补记：credit 是否每日回补 —— 已测，不回补（2026-11-10 22:20）

**样本**：`main`(2.25) / `mail01`(75.00) / `g01`(70.82)，11-08 00:06 与 11-10 22:20 两次 `user.getMe` 对照。

| 号 | 11-08 00:06 | 11-10 22:20 | 跨 3 个 08:00 检查点后 |
|---|---|---|---|
| main | 2.25 | 2.25 | ±0 |
| mail01 | 75.00 | 75.00 | ±0 |
| g01 | 70.82 | 70.82 | ±0 |

**结论**：08:00（UTC 00:00）重置的是 `quota`（turbo 50/50 那类次数，只服务绘图），
**`credit` 不会每日补充**。free 号的 75 credit 是注册一次性赠礼；
余额见底的号（如 `main`）除了换号没有恢复路径，`credit < 3.2` 的预扣门槛也永远过不去。

**工具**：`scripts/credit_watch.py`（`--once` 单采 / `--interval` 常驻，落 `out/credit_watch.jsonl` + `.log`）。
注意：跨天常驻需保证进程不被会话结束带走，或直接 `--once` 每隔几小时手动采一次。
