# 046 引擎建会话卡池：从 cards.json 取候选（838→25723 后）

日期：2026-11-17
分支：`feat/engine-card-pool`
前置：notes/045（卡片库扩到 25723 张）

## 1. 问题

`engine/server.py` 的 `CARDS` 是硬编码 11 张（notes/005 实测可用）。卡片库扩到 2.5 万张后，
引擎建会话仍然只扫这 11 张：热门卡被用烂、新卡完全没机会，且 11 张全被某个号拉黑后该号报废。

## 2. 改法

| 项 | 值 |
|---|---|
| 候选来源 | `CARDS_FILE` → 默认 `DZMM_ROOT/captures/site/cards.json`，服务器 `/opt/lan/cards.json` |
| 取法 | 按 `popularityScore`/`likesCount` 取前 **70%**，再按 `publishedAt` 补 **30%** |
| 上限 | `CARD_POOL_LIMIT`（默认 **80**） |
| 兜底 | 11 张 `FALLBACK_CARDS` 永远追加在末尾（实测可用，不受库文件缺失影响） |
| 缓存 | 按 `(path, mtime_ns, size, limit)` 缓存；cards.json 更新后下一次调用自动重载 |
| 失败处理 | 读库异常 → 日志 warn + 只用兜底卡；单张失败仍由 `dead_cards` 逐号拉黑 |

`FALLBACK_CARDS` 保留原 11 张；`CARDS = FALLBACK_CARDS` 只为兼容旧引用，
建会话循环已改成 `for card in card_candidates()`，`/health` 也返回候选列表。

## 3. 代码

- `engine/server.py`：`_card_file()` / `_num()` / `card_candidates()`；
  `ensure_chat()` 改扫候选；`/health` 的 `cards` 字段返回候选。
- `engine/tests/test_card_pool.py`：热度优先、最新补齐、兜底追加、文件缺失、
  mtime 变更重载、无 name 行剔除，6 个用例。

## 4. 验证

```powershell
python -m py_compile engine/server.py
python -m unittest discover -s engine/tests -q      # 51 tests OK
python -I -c "import sys;sys.path.insert(0,'engine');import server as s;print(len(s.card_candidates()), s.card_candidates()[:5])"
# 91 [3834755, 3738712, 1323657, 3508194, 3689641]   （80 候选 + 11 兜底，去重后 91）
```

线上（部署后）：

```bash
curl -s http://127.0.0.1:8787/health | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d['cards']), d['cards'][:5])"
# 91 [...]
```

## 5. 回滚

```powershell
git checkout main -- engine/server.py
# 或删除 card_candidates 调用，恢复 for card in CARDS
```

线上：`/opt/lan/engine/server.py` 用备份覆盖后 `sudo systemctl restart lan-engine`。

## 6. 注意

- 候选只有 80 张，不扫全库：一次 createByCard = 一发上游请求，扫 2.5 万张会被 418 闸门接管。
- 候选顺序与 `webstate.json` 的 `dead_cards` 共同决定尝试顺序；某号拉黑的卡不会在同号重试。
- `CARD_POOL_LIMIT` 调大前先看 `/health` 与闸门日志，别直接把 80 拉到 1000。
