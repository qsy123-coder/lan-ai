# 064 右栏「DeepSeek 建议卡片」开关

日期：2026-11-20
分支：`feat/own-sug-toggle`
相关：`site/components/ChatClient.jsx`、`site/app/globals.css`、`engine/server.py`

## 需求

给「用 DeepSeek key 生成额外 3 条建议」加一个右栏开关，可随时关掉省 key 额度。

## 实现

- 前端 `ChatClient.jsx`：
  - `OKEY = "lg.own.sug.v1"`，全局（不分卡）localStorage 持久化，默认开；
  - 状态 `ownSug`，右栏「续写轮数」下方新增 `.own-sug-row`（标题 + 说明 + 拨动开关），
    `role="switch"` + `aria-checked`，`busy` 时禁用；
  - 发送时 payload 带 `ownSug: !!ownSug`；`send` 的 deps 加 `ownSug`。
- 引擎 `server.py`：`run_site_chat` 里 `payload.get("ownSug") is False` 时跳过
  `suggest_own_api`（不发请求、不耗 key）。
- `globals.css`：追加 `.own-sug-row / .switch / .knob`（GBK 编码追加，纯 ASCII）。

## 自检

- `python -m py_compile engine/server.py` 通过；`unittest` 90 项全过；
- 远端 `npm run build` + 重启验证。

## 回滚

```powershell
git revert <本次提交>
```
