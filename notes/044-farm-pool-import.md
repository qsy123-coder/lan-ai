# notes/044 — 农场账号包整体接入号池（2026-11-16）

## 0. 一句话

外部农场账号包（158 行，149 个带口令）整包接进 `accounts.json`：**+109 新号 / 40 个 d 号换过期 cookie / 9 个无口令跳过**，
本地池 **53 → 202**，线上池 **48 → 202**，线上体检 202/202 通过、可用 173、credit 合计 **14045.93**。

---

## 1. 输入

| 项 | 值 |
|---|---|
| 源账号包 | `C:\Users\WINDOWS11\Desktop\新建文件夹 (7)\dzmm\accounts.json` |
| 源字段 | `access_token / refresh_token / user_id / email / password / credit / created_at / last_checkin` |
| 规模 | 158 行；149 行有 `email+password`；9 行无口令（跳过，不静默丢，见报告 `failed=9 no_credentials`） |
| 邮箱域 | 全部 `@anon.com`（uuid 前缀），149 个 |
| 源 cookies.json | **只有 `sb-rls-auth-token` 一项** → 不能直接当模板 |
| 源 token 状态 | `access_token` 全部过期（相对 20:04 全部 exp < 0）→ 只能走口令登录换新会话 |

## 2. 关键事实（本次踩到）

1. `sb-rls-auth-token` 是 `base64-<JSON>`，内含 `access_token / refresh_token / expires_at / expires_in(3600) / user / weak_password`。
   **有效期 1 小时**：00:34 导入的 d001–d040，`expires_at=1794764068`，01:34 就全过期。
   → 「导入成功」≠「号可用」，池子里存的 cookie 过期后必须重登。
2. 重登路径：`POST /api/auth/sign-in {email,password}` → 响应 Set-Cookie `sb-rls-auth-token`（新会话）。
   登录比注册宽松：**149 次登录全程 0 次 418 / 0 次 429**（clash 7897，1.0 s/号）。
3. cookie 模板必须带设备/地区/实验组字段。当前 `cookies.json` 只剩 sb token，直接用会丢
   `chosen_language / _geo / _tz / dzmm_exp_device_id / dzmm_exp_*`（共 **13** 个非鉴权键）。
   解法：**从池内 d001 的 cookie 反抽模板**（`--template-from d001`），与首轮导入保持同一套设备指纹。

## 3. 脚本改动 `scripts/import_farm_accounts.py`

| 参数 | 作用 |
|---|---|
| `--template-from NAME` | 用池内某个号的 cookie 里非鉴权字段当模板（模板键数会打印出来） |
| `--refresh-existing` | 已在池中的 uid 也重登：刷新 `cookie/last/credit/note`，**不新建条目**、不改名字 |
| 429 处理 | 连续 3 次 429 停手并打印 `resume --offset N`；418 立即停手 |
| 报告 | `out/farm_import_<ts>.json` 增加 `action: added|refreshed` 与 `refreshed` 计数 |

其余保持：逐号 `getMe` + `credits.getBalance` 双验证（uid 必须对得上），每 5 个落盘，写前自动备份 `accounts.json.bak-<ts>`。

## 4. 结果

```
python -I scripts/import_farm_accounts.py \
  --src "...\dzmm\accounts.json" --cookies "...\dzmm\cookies.json" \
  --pool accounts.json --template-from d001 --refresh-existing \
  --save-every 5 --delay 1.0
== added=109 refreshed=40 skipped=0 failed=9 report=out/farm_import_20261116-201024.json
```

| 指标 | 值 |
|---|---|
| 池子 | 53 → **202**（d 系列 149 / b 系列 50 / main·mail01·g01 各 1） |
| 新增号 credit 分布 | 90×51、85×8、80×24、75×25、**0×1（d147）** |
| 刷新号 credit 分布 | 90×37、95×1、87×1、15×1 |
| 本地 `last.credit` 合计 | 16452.56（1 个 0 分号） |
| 失败 | 9 个 `no_credentials`（源里没写 password，需农场侧补） |

> 本地的 b 系列 `last.credit` 是 11-14 的旧快照（75），线上体检后真实只剩 2–3，
> 所以「线上 credit 合计 14045.93」<「本地快照 16452.56」是正常的，不是丢号。

## 5. 线上同步（43.135.10.175）

```bash
# 1) 备份（48 号 → backup）
cp /opt/lan/accounts.json /opt/lan/backup-accounts-20261116201046.json
# 2) 本机 scp（md5 校验一致）
scp -i ~/.ssh/wavemod_server accounts.json ubuntu@43.135.10.175:/opt/lan/accounts.json
#    ae88e9947260b80fc94866aaec4edf2b  811197 bytes
# 3) 重启引擎
sudo systemctl restart lan-engine
```

- 线上引擎当前是**直连出口**（`lan-engine.service.d/direct-egress.conf` 把 `DZMM_PROXY` 置空，11-16 00:34 建）。
  单号验证：`d149 → credit 75`、`b001 → 2.66 exhausted`，**直连没被 418**，保持直连不动。
- 全量体检 `/refresh`（202 个名字）：
  `refreshed_ok 202 / errors 0 / credit_total 14045.93 / usable 173`，
  `/site/pool`：`total 14045.93  usable 173  count 202`。
- 冒烟 `/site/chat`（card 3821218, Flux 16K, maxTokens 64）：
  `event: memory → account → chat → complete`，`account=b019`，`credit=2.4`，正文非空 —— 号池可用。
  （引擎按 credit 升序挑号，所以先把快见底的 b019 用掉。）

## 6. 回滚

```bash
# 线上
cp /opt/lan/backup-accounts-20261116201046.json /opt/lan/accounts.json
sudo systemctl restart lan-engine
```

```powershell
# 本地：回到导入前（两种粒度）
Copy-Item accounts.json.bak-20261116200411 accounts.json -Force   # 回到 93 号（第二次导入前）
Copy-Item accounts.json.bak-20261116003427 accounts.json -Force   # 回到 53 号（首次导入前）
```

## 7. 遗留 / 下一步

1. **9 个无口令号**（uid 前缀 6e1020dd / f9f4913e / 2f296f0f / 3d06e356 / 648cb8b7 / d59f9496 / 28eee959 / 3715a3b5 / 7f0eb37b）
   需要农场侧补 `password` 后 `--offset` 单跑。
2. **d147 credit=0** → 体检判 `exhausted`，不参与轮换；等 08:00 检查点后看是否回补（按 notes 事实 credit 不回补，只有 quota 回）。
3. **cookie 每小时过期**：号池里的农场号 cookie 会在登录后 1h 失效。存量 b 系列靠引擎自动续期逻辑撑着，
   农场号是否同样能续期尚未验证 —— 若 1 小时后大面积为 401，需要补一个批量重登脚本（本文件 §3 的 `--refresh-existing` 可直接复用，
   建议挂每小时定时）。
4. 本机 `out/webstate.json` 未刷新（本机引擎没起）：要在本机控制台看 credit，先 `start.ps1` 再 `POST /refresh`。
