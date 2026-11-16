# 045 卡片池扩容：多 feed 深翻页 + 榜单补抓 + 418 自动换节点

日期：2026-11-16
分支：`feat/card-pool-expand`
起点：`captures/site/cards.json` 838 张（tags 覆盖 636）
数据源：`https://www.dzmm.ai/api/trpc/*`（匿名可读，走 Clash `127.0.0.1:7897`）

## 1. 入口与实测预算

| procedure | 入参 | 行为 |
|---|---|---|
| `home.getCards` | `{"type":T}` / `{"type":T,"cursor":N}` | 一页 24 张完整卡片；`cursor` 是页码 0..1000；`tags` 恒为 `[]` |
| `home.newbie` | `{}` / `{"cursor":N}` | 一页 24 张；N=2 起空 → 只有 2 页 |
| `competition.awardedCards` | `{}` | 549 行，只有 `{cardId, rank}`，需 `card.getById` 补全（连同 tags） |
| `home.getHotTags` | `{}` | 100 条标签表（不是卡片） |
| `card.getById` | `{"cardId":N}` | 单张完整对象，含 tags；下架返回 `json:null` |
| `home.forYou` | `{}` / `{"cursor":N}` | **带登录 cookie 可用**；一页 24 行，page=1000 仍有数据；tags 恒 `[]`，每页约 2–7 张新卡 |

合法 `type`：`newest | highest_rated_1d | highest_rated_7d | highest_rated_30d | highest_rated_all | games`。
schema 是 zod `.strict()`，多传未知键直接 400。

2026-11-16 实测：连续 21 发 `/api/trpc`（feed + 单张混合）**未触发 418**，
说明闸门阈值早已不是 notes/011 记录的「约 15 发」；仍按 1.5 s 间隔、撞闸门即换节点处理。

## 2. 工具

| 脚本 | 作用 |
|---|---|
| `scripts/crawl_cards.py` | 6 个 type + `home.newbie` 深翻页；`competition.awardedCards` 逐张补全；进度存 `out/crawl_state.json`，撞 418 后 `--rotate` 自动换节点续爬 |
| `scripts/clash.ps1 -Next` | 新增：按 GLOBAL 节点表顺序切到下一个（撞闸门轮换用） |
| `scripts/backfill_tags.py` | 新增 `--rotate/--rotations/--rotate-wait/--cooldown`；`_tags_checked` 防重复补 |

`crawl_cards.py` 的断点语义：

- `next` = 该源下一页；`done` = 该源到底（空页 / 连续 `--stale` 页无新卡）。
- 连接层失败（`FetchError`）只暂停该源、**不写 done**，重跑同一条命令从原页继续。
- 每页新增即原子落盘，开工先备份 `cards.json.bak-<ts>-pre-crawl`。

## 3. 运行

```powershell
python -I scripts/crawl_cards.py --dry                       # 只算请求数
python -I scripts/crawl_cards.py --pages 1000 --rotate --gap 1.5
python -I scripts/backfill_tags.py --limit 400 --gap 1.2 --rotate --loop
```

## 4. 结果（2026-11-17 00:13 收工）

| 源 | 请求数 | 翻页 | 新增 |
|---|---:|---|---:|
| `home.getCards:newest` | 1001 | page 0..1000（撞 cursor 上限，**未到底**） | 23367 |
| `home.getCards:highest_rated_all` | 101 | 0..99，page 100 空页 | 1064 |
| `home.getCards:highest_rated_7d` | 19 | 0..18 | 2 |
| `home.getCards:highest_rated_30d` | 10 | 0..9 | 0 |
| `home.getCards:highest_rated_1d` | 8 | 0..6 | 0 |
| `home.getCards:games` | 43 | 0..41，page 42 空页 | 324 |
| `home.newbie` | 3 | 0..1，page 2 空页 | 0 |
| `competition.awardedCards` | 1 | 549 行 | 0（26 张缺卡 getById 全部下架/无效） |

- 卡库 **838 → 25723 张**（+24885），唯一 id 25,723，无重复，`cover` 全非空。
- `cards.json` 53 MB（`.gitignore` 已排除 `captures/`，不进 git）。
- 全程 **0 次 418**，未触发换节点；1.5 s/发，总耗时约 50 分钟。
- **tags 覆盖率仍是 636 张（2.5%）**：feed 不返回 tags，补 tags 只能逐张 `card.getById`（25k 发）。
  分类页/标签筛选只对已补 tags 的卡生效；补法见 §5。

### 4.1 feed 已到上限

`newest` 的 `cursor` 硬顶 1000，page=1000 仍 24 张全新 → 站内卡片总量 > 25723。
要再扩只能换来源：`home.newbie`（已尽）、`competition.awardedCards`（已尽）、
登录态 `home.forYou`（401），或按已知 id 邻近区间扫 `card.getById`（1 发 1 张，不划算）。

### 4.2 首页分页（本次一起改）

2.5 万张卡全量渲染会把首页 HTML 打到 **66 MB**。`site/app/page.js` 改为服务端分页：

- `PER_PAGE = 120`，`?p=N`，筛选/搜索/排序在分页前完成；
- 分页条 `.home-pager`（上一页 / 第 N / M 页 · 共 X 张 / 下一页），样式追加在 `site/app/globals.css`；
- 实测：`/` = 120 张 / 366 KB / 1.06 s；`/?p=999` = 43 张；`/?p=2` = 「第 2 / 215 页」。

### 4.3 上线验收（2026-11-17 00:18，`https://43-135-10-175.sslip.io`）

```
/          200 366385B 1.10s  cards=120
/?p=2      200 379850B 0.54s  cards=120
/?p=999    200 138306B 0.49s  cards=43
/category  200  68170B 0.48s
/?cat=truelove 200 342252B 0.51s  cards=113
第 2 / 215 页
/health=200；/site/pool total=14039.34 usable=171 count=202
```

服务器备份：`/opt/lan/backup-202611170016/`（cards.json / page.js / globals.css）+ `/opt/lan/cards.json.bak-202611170016`。
`cards.json` 两侧 sha256 一致：`1d390c07…afc518b`。

## 5. 补 tags（可选，按需分批）

```powershell
python -I scripts/backfill_tags.py --dry                                  # 看还差多少
python -I scripts/backfill_tags.py --limit 400 --gap 1.2 --rotate --loop  # 撞闸门自动换节点
```

`getById` 一卡一发，25k 张按 1.2 s 约 8 小时；建议只补需要进分类的批次，
`_tags_checked` 会记录「已确认无标签 / 已下架」，不会每轮重试。

连接层抖动（节点挂掉 `SSLError (35)`）不再整批崩：单卡异常 → 换节点或跳过，
每补 10 张落盘一次，崩了也不丢已补的结果。

## 6. 验收

```powershell
python -I -c "import json;d=json.load(open('captures/site/cards.json',encoding='utf-8'));print(len(d), len({c['id'] for c in d}))"
# 25723 25723
```

判据：总数增加、id 无重复、`cover` 全非空、无 `publishStatus != approved`；
首页 120 张/页、分页条页数与 `ceil(总数/120)` 一致。

## 7. 回滚

```powershell
Copy-Item captures/site/cards.json.bak-<ts>-pre-crawl captures/site/cards.json -Force
```
线上：备份 `/opt/lan/cards.json` 后 scp 覆盖，无需重启（`site/lib/cards.js` 按 mtime 热读）。
