# 063 建议卡片接入用户自建 OpenAI 兼容 API（6 条 = 3 原 + 3 自建）

日期：2026-11-20
分支：`feat/own-api-suggestions`
相关：`engine/server.py`、`site/components/ChatClient.jsx`

## 需求

建议卡片从 3 条改成 6 条：3 条用原来的（dzmm 模型生成），3 条用用户自己的
OpenAI 兼容 API 生成。

## 实现

- `engine/server.py`：
  - 环境变量 `OWN_API_URL` / `OWN_API_KEY` / `OWN_API_MODEL`（默认 `gpt-4o-mini`）；
    `OWN_API_PROXY=1` 时走出口代理，默认直连（国内端点）。
  - `suggest_own_api(text, card_id)`：未配置返回 `[]`；否则用用户 key 调
    `{URL}/chat/completions`，生成 3 条接话建议（剥编号，≤40 字）。
  - `_merge_sug(text, items, limit=6)`：把额外建议合并进正文末尾已有的 `<sug>`
    块，上限 6 条；没有则新建。
  - `run_site_chat` 建议阶段：原建议（suggestedReplies / suggest_followup）之后，
    再调 `suggest_own_api` + `_merge_sug` 追加 3 条。
- `site/components/ChatClient.jsx`：`splitSug` 的 `sug.slice(0, 4)` → `slice(0, 6)`。

未配置 `OWN_API_URL/KEY` 时 `suggest_own_api` 直接返回 `[]`，行为不变（仍 3 条）。

## 配置（生产，systemd lan-engine）

```bash
sudo systemctl edit lan-engine
# 加入：
[Service]
Environment=OWN_API_URL=https://api.deepseek.com/v1
Environment=OWN_API_KEY=sk-xxxx
Environment=OWN_API_MODEL=deepseek-chat
# 若是 OpenAI 官方等国外端点，再加：
Environment=OWN_API_PROXY=1

sudo systemctl restart lan-engine
```

## 自检

- `python -m py_compile engine/server.py` + 87 单测通过；
- 远端 `npm run build` 成功，`lan-engine` / `lan-site` active。

## 回滚

```powershell
git revert <本次提交>
# 生产：/opt/lan/backup-20261120002410 覆盖回 server.py 与 ChatClient.jsx 后重启
# 停用自建：systemctl edit lan-engine 删掉 OWN_API_* 再 restart
```
