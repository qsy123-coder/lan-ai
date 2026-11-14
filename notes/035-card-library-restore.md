# notes/035 — 会话历史点卡回首页：卡片库丢卡 + 缺卡跳转（2026-11-14）

## 1. 现象

用户点会话历史里的某些卡（例：「夏日,妹妹,同居」）**直接回到首页**，进不了卡。

## 2. 根因（两条叠加）

1. **卡片库丢卡**：21:13 的卡片重构把 `cards.json` 从 522 张换成 391 张，
   **447 张被丢掉**（含 `426322 夏日,妹妹,同居`）。会话里存的 cardId 在新库里查不到。
2. **缺卡静默跳首页**：`site/app/chat/page.js` 里
   ```js
   const card = getCard(id);
   if (!card) redirect("/");
   ```
   卡片查不到就 307 回首页，用户只看到「闪一下回首页」，没有任何提示。

## 3. 修复

| 层 | 动作 |
|---|---|
| 数据 | 从 `/opt/lan/cards.json.bak-838-20261113211330`（838 张，无重复 id/name，含全部 391 + 447）恢复为当前库；线上 `/opt/lan/cards.json` 与本机 `captures/site/cards.json` 同步；备份 `cards.json.bak-<ts>-pre-restore` |
| 代码 | `chat/page.js`：缺卡时渲染「这张卡暂时不可用」状态页（带 ID、回首页入口），不再 `redirect("/")` |
| 代码 | `card/[id]/not-found.js`：已有的下架落点（requirePass + 状态面板），保持不变 |

## 4. 验证

```
线上 /chat?card=426322     → 200（可进入）
线上 /chat?card=999999999  → 200，渲染「这张卡暂时不可用」
线上 /card/999999999       → 200，渲染「找不到这张卡」
构建通过，lan-site active
```

## 5. 教训

- **卡片库是会话的隐式外键**：任何 rebuild/merge 必须做 `old_ids - new_ids` 检查，
  丢掉 id 等于把老会话全部打断。恢复脚本见 `out/diff_cards.py`、`out/restore_cards.sh`。
- **查不到资源不要静默 redirect**：缺失态要显式渲染，用户才知道发生了什么。
- `cards.js` 按 mtime 热加载，改 `cards.json` 不需要重启；改代码需要 `npm run build` + 重启。
