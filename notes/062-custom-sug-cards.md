# 062 自定义建议卡片

日期：2026-11-20
分支：`feat/custom-sug`
相关：`site/components/ChatClient.jsx`、`site/app/globals.css`

## 需求

建议卡片能决定剧情走向。在模型生成的动态卡片之外，加「用户自定义」的固定
快捷句，点一下直接发，由用户自己掌控几个固定走向。

## 实现（纯前端，引擎不动）

- `ChatClient.jsx`：
  - `CKEY(id)` → `lg.custom.sug.v1.<cardId>`，按卡存 localStorage，最多 `CUSTOM_MAX=12` 条；
  - 状态 `customSug` / `customInput` / `showCustomAdd`；
  - `useEffect` 按 `card.id` 加载/持久化；
  - `addCustom`（去重 + 折叠空白 + 截断 12 条）/ `delCustom`；
  - 输入框上方渲染 `.custom-sug`：卡片（复用 `.sug-chip`，点击 `send(txt)`）+ 每条带 `×` 删除 +
    「+ 自定义」展开输入行（回车添加 / Escape 取消）。
- `globals.css`：追加 `.custom-sug / .csug-item / .csug-del / .csug-plus / .csug-add`，
  用 `color: inherit` + 半透明，深浅主题自适应。

## 自检

- 远端 `npm run build` 成功 + `lan-site` active（本地无 node_modules 无法本地 build）。

## 回滚

```powershell
git revert <本次提交>
# 生产：/opt/lan/backup-20261120001609 覆盖回 ChatClient.jsx 与 globals.css 后 build + restart lan-site
```
