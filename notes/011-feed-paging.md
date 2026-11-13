# 011 · feed 分页：`cursor` 是页码，一页 24 张

> 2026-11-12 22:3x 实测，匿名、出口 SG。
> `notes/010` 已确认 `home.getCards` 匿名可读、strict schema、返回完整卡片对象 —— **本页只记增量**：
> 分页怎么做，以及旧路径为什么在请求数上不可行。

## 1. `cursor` 是页码，不是卡片 id

| 入参 | 结果 |
|---|---|
| `{"type":"newest"}` | 200，24 张（第 0 页） |
| `{"type":"newest","limit":100}` | 200，**仍只给 24** —— `limit` 在 schema 里但服务端忽略 |
| `{"type":"newest","cursor":1001}` | **400「小于等于 1000」** |
| `{"type":"newest","cursor":1}` | 200，下一页 |

两条推论：

1. `cursor` **在 schema 里**且带 `max(1000)`。一旦不在 schema，`.strict()` 会先报「必填」而不是范围错 ——
   所以「报的是范围错」本身就证明这个键是存在的。
2. `cursor` 被当成**页码**（受 1000 上限约束），不是 `cardId`。拿 3.8M 级的卡 id 去喂
   会立刻撞范围错，这也是它不像 id 的旁证。

按每页 24 张、1001 页算，单个 type 的理论上限 ≈ **24024 张**。

## 2. 实测产出

```
newest page=0  rows=24 new=24  total=90     # 基底 66 张
newest page=1  rows=24 new=21  total=111
newest page=2  rows=24 new=24  total=135
```

**3 个请求 / 72 行 / 69 张新卡。** page=1 只出 21 张新 —— 相邻页会重叠，
去重必须按 `id`，不能假设页与页互斥。

## 3. 为什么必须走分页：请求数就是闸门额度

418 闸门按**请求数**触发（claude.md §9，约 15 发就锁），不是按返回的数据量。
而两种拉法拿同样 24 张卡：

| 路径 | 请求数 | 每请求产出 |
|---|---|---|
| 逐张 `card.getById` | 24 | 1 张 |
| `home.getCards` 一页 | **1** | 24 张 |

差 24 倍。按 15 发预算算：旧法撑不到 15 张，新法能拿 **360 张**。
所以**扩库一律走 feed，`card.getById` 只在「已知 id、要单张、且需要区分下架」时用**。

## 4. 落库注意：别覆写

`seed_feed.py` 默认写 `captures/site/cards.json`，但拉回来的是一份**独立快照** ——
若此时 `cards.json` 已被别的合并流程推进（本次作业期间从 66 → 105 → 185 → 250 张），
直接覆写会把对方新增的卡删掉。

正确姿势：

```powershell
# 1) 先落暂存，不碰线上档
python -I scripts\seed_feed.py --pages 40 --types newest --out out\stage_cards.json

# 2) 三路按 id 合并：现有档 > 暂存 feed > 榜单合并结果
```

合并时**只对新增行的新卡**做下架剔除（`publishStatus != approved` / `isPublic=false` / `isHidden=true`）；
`home.getCards` 本身不返回下架卡，那三道检查是给 `card.getById` 路径兜底的。

## 5. 工具

| 脚本 | 作用 |
|---|---|
| `scripts/probe_trpc.py` | 通用单发探针，落 `out/trpc_probe.jsonl`，418 即 exit 2 |
| `scripts/seed_feed.py` | type × page 拉卡；`--out` 落暂存；`--dry` 只算请求数 |

```powershell
$PY = (Get-Command python).Source

# 探针（PowerShell 5.1 会吃掉内联 JSON 的内层引号 —— 长入参一律 @文件）
& $PY -I scripts\probe_trpc.py home.getCards '@out\p_newest.json'

# 只算不发
& $PY -I scripts\seed_feed.py --pages 40 --types newest --dry

# 小跑验证分页
& $PY -I scripts\seed_feed.py --pages 2 --types newest --out out\stage_cards.json
```

`--dry` 输出示例：`would send 41 requests (1 types x 41 pages), GAP=1.6s, ~66s`
—— 41 发会撞 418，正式跑必须按 §9 分轮、轮间冷却 ≥60s，或换节点续跑
（脚本遇 418 会**先落盘再 exit 2**，重跑同一条命令即续）。

## 6. 未解决

- `cursor` 到 1000 页之后没有更深的翻法（`limit` 无效）；要更多只能换 `type`
  （6 个 type × 1001 页）或走别的 feed（`home.newbie` 24 张、`home.greenFeatured` 当前 0）。
- 相邻页重叠的**具体规则**没测（是边界重复还是排序不稳定）。目前按 id 去重即可，
  但要知道「page=1 少 3 张」不是丢数据。
