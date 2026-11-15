# 019 上游 418 风控：现象、判定与冷却

日期：2026-11-14
相关：`engine/server.py`（`note_gate` / `gate_cooldown_left` / `run_site_chat`）

## 现象

用户报「对话列表上游触发了 409 验证码风控，进行不了对话」，并补充「今天 1:00 左右也是」。

## 判定（引擎日志，2026-11-14 00:40–01:30）

```
01:09:06 [warn] site: b026 无法为卡 3212165 建会话（HTTP 418）
01:11:08 [warn] site: b012 无法为卡 3821218 建会话（HTTP 418）
01:11:08 [warn] site: b011 无法为卡 3821218 建会话（HTTP 418）
01:16:41 …（重复）
01:17:50 [warn] site: b012 无法为卡 1059101 建会话（HTTP 418）
```

- 是 **HTTP 418（captcha_required）**，不是 409；409 是本站引擎自己的 `RUN_LOCK`
  （`{"error":"已有任务在跑"}`），两者被用户混在一起说了。
- 418 出现在 `chat.createByCard`，多个账号同时命中 → **出口 IP 级风控**，
  与本机 `notes/002` 的结论一致（换节点即恢复，跟账号无关）。
- 2026-11-14 11:4x 复测：服务器上 `chat.getQuotas` 返回 **200**，风控已自动解除；
  `/site/chat` 生成 `complete=1`、`sug=2`，服务恢复正常。

## 为什么会反复

- 服务器出口是单 IP（腾讯云香港 43.135.10.175，引擎 `DZMM_PROXY` 为空），
  所有账号、所有请求共用一个 IP；
- 01:07–01:09 两分钟内有约 20 次 `prompt 组装`（用户连点重试 + 引擎多号轮换），
  每次换号都再发一次 `createByCard`，风控窗口内越打越久。

## 修（`engine/server.py`）

1. 全局冷却：命中 418 后 `GATE_UNTIL = now + GATE_COOLDOWN`（默认 120s，
   环境变量 `GATE_COOLDOWN` 可调）；冷却期内 `/site/chat` 直接回
   `event: end {reason:"gate", message:"上游风控冷却中（约 N 秒后再试）…"}`，**不再请求上游**。
2. 第一次命中就停：不再「连换两个号确认」，少打一次上游、少给 IP 添一次记录。
3. 提示语统一为「上游风控（HTTP 418），出口 IP 被临时限制，冷却约 N 秒后自动放行」。

## 验证

- 生产部署后 `health=200`；`/site/chat`（Turbo 16K）`complete=1`、`sug=2`、`bad_name_hits=0`。
- 服务器侧 `chat.getQuotas` 200，说明当前出口不在风控窗口。

## 根治：服务器上跑 mihomo，引擎走代理出口（2026-11-14 落地）

服务器原本是单 IP 直连（`43.135.10.175`），所有号共用；风控自然累积。

1. **装 mihomo v1.19.34**：`/opt/lan/mihomo/mihomo`（GitHub releases，linux-amd64）。
2. **配置**：以本机 Clash Verge 的运行配置（`clash-verge.yaml`，mitce 订阅）为底，
   改 `mixed-port: 7890`、`external-controller: 127.0.0.1:9090`、随机 `secret`，
   删掉 `rule-providers` / `rules` / `tun`（global 模式用不到）；
   落 `/opt/lan/mihomo/config.yaml`，`profile.store-selected: true` 会记住 GLOBAL 选择。
   订阅本身对非 Clash Verge 客户端返回 **403**，所以不走服务器直拉，直接用本机已合并的配置。
3. **systemd**：`mihomo.service`（User=ubuntu，WorkingDirectory=/opt/lan/mihomo，已 enable）。
4. **引擎接入**：`lan-engine.service` 增加
   `DZMM_PROXY=http://127.0.0.1:7890`、`MIHOMO_API=http://127.0.0.1:9090`、
   `MIHOMO_SECRET=<config 里的 secret>`；`After/Wants=mihomo.service`。
5. **418 自动换出口**：`rotate_egress()` 调 mihomo API 把 GLOBAL 切到下一个节点，
   每个请求最多换一次，换完继续换号重试；换不了才进 120s 冷却。

验证（服务器上）：

```
mihomo active；/version = v1.19.34
GLOBAL=HK-N-5；经代理出口 IP = 95.40.34.214（≠ 43.135.10.175）
/api/chat 生成：complete=1、sug=1、bad_name_hits=0
lan-engine health: "proxy": "http://127.0.0.1:7890"
```

维护：订阅更新后需重新生成 `config.yaml`（本机 `clash-verge.yaml` → 脚本改三处 → scp），
再 `sudo systemctl restart mihomo`。节点过期时改 GLOBAL 即可，无需重启引擎。
