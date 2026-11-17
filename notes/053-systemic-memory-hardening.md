# 053 · 系统性记忆加固：摘要账号回退 + 真实测试

日期：2026-11-17
分支：`fix/summary-account-fallback`
触发：用户确认「不是某一张卡的问题，而是会不会影响其它卡」。

## 1. 全站体检结论（26 份记忆）

```
摘要类型：empty 20 / ok 3 / rule 3
一个会话拆到多个账号/chat：7 个
```

| 会话 | chats | 摘要 |
|---|---|---|
| 夏日,妹妹,同居 `93d5e47b` | 15 | 空 |
| 两个少女… `a310c0e8` | 7 | ok（已修） |
| 夏日,妹妹,同居 `a9704810` | 2 | rule 600 |
| 夏日,妹妹,同居 `ec3e9c22` | 3 | 空 |
| 卡·撩人女上司 `a80379bc` | 2 | rule 145 |
| 从奴隶贩子… `815cb9ab` | 2 | 空 |
| 喜欢光屁股… `d38fcdeb` | 2 | 空 |

日志证据：摘要失败大量是 `status=exhausted/upgrade_needed` 与 `auth_error`——
原号被榨到 < 3.2 或 cookie 失效，摘要就整段失败，只剩规则碎片被每轮注入。

## 2. 改动

- `engine/server.py`
  - 新增 `summary_accounts()`：摘要候选号 = 原号（若余额够）+ 其它可用号按余额降序（最多 3 个）。
  - `maybe_summarize()` 改为按候选号重试：
    - 账号级失败（`exhausted/upgrade_needed`、`auth_error`、`no_chat`、异常）→ 换下一个号；
    - 内容级失败（拒答、续写、空）→ 不换号，直接规则兜底；
    - 成功且换了号时日志 `摘要改用账号 X（原号 Y 不可用：…）`。
- 测试
  - `engine/tests/test_summary_fallback.py`（4 例）：候选排序/过滤、低余额号换号、
    拒答不换号、全部不可用不推进水位。
  - `scripts/test_memory_live.py`：线上真实测试（见 §3）。

## 3. 真实测试（scripts/test_memory_live.py）

在服务器执行，会真实消耗少量 credit，结束自动清理：

```bash
cd /opt/lan && DZMM_PROXY= /opt/lan/venv/bin/python scripts/test_memory_live.py
```

覆盖：
1. `fresh_chat_for_card` 必须拿到 **0 条**的空会话；
2. 换号接续：把「刻晴 cos」原文作为 `recent_text`，断言真实模型回复里出现「刻晴/cos」；
3. 摘要账号回退：故意传一个不存在的号名，断言仍能生成摘要（`summaryHash` 前进、
   摘要含【当前场景】、不是拒答）；
4. 全站体检：拒答摘要 / 摘要被预算截断 → 直接 FAIL。

## 4. 验证记录

- 本地 `py_compile` 零错误；`unittest` **75 tests OK**。
- 线上真实测试：待执行（部署后运行，结果回填本节）。

## 5. 回滚

```bash
cp /opt/lan/backup-summary-fallback-<ts>/server.py /opt/lan/engine/server.py
sudo systemctl restart lan-engine
```
