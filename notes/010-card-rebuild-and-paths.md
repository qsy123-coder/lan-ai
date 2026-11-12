# 010 卡库重建与换机路径修复（2026-11-12）

> 起因：本机是 `F:\Projects\lan-ai`（用户 `WINDOWS11`），不是 DEV-GUIDE 里记的
> `Z:\project`（用户 `dsh`）。`accounts.json` 在 `.gitignore` 内，没跟过来 → 账号池为空，
> 所有依赖 `pool["g01"]["cookie"]` 的脚本（`seed_cards.py` / `seed_hot.py` / `probe_cards.py`）一律
> `FileNotFoundError`。

## 1. `home.getCards` 匿名可读（关键发现）

不需要登录态，`401` 不会出现。**入参只要一个 `type`**：

```
GET /api/trpc/home.getCards?batch=1&input={"0":{"json":{"type":"newest"}}}
```

合法 `type`（zod 400 报文泄出，实测全部有效）：

```
newest | highest_rated_1d | highest_rated_7d | highest_rated_30d | highest_rated_all | games
```

**反例（必须记住）**：`probe_cards.py` 与 `seed_hot.py` 里那套
`{"type":..., "categoryName":null, "direction":"forward", "meta":null}` 是**错的**，
一律 `400 BAD_REQUEST 必填`。多传字段反而失败。

**返回的是完整卡片对象**，26 个字段（**但 `tags` 恒为 `[]`** —— 见 §1.2）：

```
id name cardFilename isPublic isSensitive isImageBlur isHidden publishStatus
creator creatorNotes creatorFullName creatorAvatarUrl userId tags
weightedRating popularityScore likesCount commentsCount isGamefy imageInfo
originalFilename rawdata createdAt updatedAt publishedAt firstPublishedAt
```

所以做种子卡库**根本不需要 `card.getById`** —— 榜单里已经带全量信息。

### 1.2 但 feed 不填 `tags`（2026-11-12 22:4x 实测，推翻上面一半）

对比同一张卡（`1059101`）：

```
home.getCards {"type":"highest_rated_all"}  -> tags: []
card.getById  {"cardId":1059101}            -> tags: 20 个
```

字段**结构**完全一致（26 个键，`compare_card_shapes.py` 验证两边差集为空），
但 **feed 的 `tags` 恒为空数组**。391 张卡里只有最初靠 `card.getById` 抓来的 9 张有标签。

结论：**拉卡走 feed（1 发 = 24 张），补 tags 走 `card.getById`（1 发 = 1 张）**。
两者字段同构，所以 `shape()` 可以直接复用。

补标签用 `scripts/backfill_tags.py`：默认 `--limit 12 --gap 2.0`，命中 418 落盘退出（码 2），
冷却后重跑同一条命令续跑。

> 另一条实测：`home.getCards` 的 `cursor` 是**页码**（0..1000），`limit` 再大也封顶 24 张。
> schema 是 zod `.strict()`，多一个未知键就 400。`notes/011` 与 `claude.md §1.3` 有更完整记录。

### 1.1 实测结果（22:2x）

| type | 结果 |
|---|---|
| `highest_rated_30d` | 200，24 条 |
| `highest_rated_all` | 200，24 条 |
| `games` | 200，24 条 |
| `newest` / `highest_rated_1d` / `highest_rated_7d` | 418（已触发闸门） |

去重后 **58 个唯一 cardId**，其中 57 张库里没有。全部 `publishStatus=approved`、
`isPublic=true`、`isHidden=false`、有 `cardFilename`；57 张有 `creatorNotes`；
`imageInfo` 全为空数组（卡片不带多图，只有封面）。

> 418 是累计十来发之后才踩到的。**枚举必须 ≤1 rps，且一旦出现 418 就停手换节点。**

## 2. 已下架卡片的判定信号

引擎 `CARDS` 里有两张卡（`3856159`、`3860761`）与 `cards.json` 不一致。实测：

```
card.getById {"cardId":3856159} -> 200 {"result":{"data":{"json":null}}}
```

**`200` + `json:null` = 卡片已下架/不再公开**，不是被拦。这种卡要剔掉，不能硬塞。

> `seed_public.py` 原来把任何非 200 都糊成「无数据」，看不到状态码，
> 已改成打印 `[status] body前160字`，并区分 `200 但有 error` 的 tRPC 失败。

## 3. 换机后的第二处硬编码路径（真 bug）

恢复卡库后首页仍然 0 张卡。根因在 `site/lib/cards.js:3`：

```js
const FILE = process.env.CARDS_FILE || "Z:\\project\\captures\\site\\cards.json";
```

本机没有 `Z:\project`，`statSync` 抛错 → `catch` 静默 `return CACHE || []` →
**首页永远空网格，且没有任何日志**。这类「路径写错」伪装成「没有数据」的问题排查成本极高。

修复：

```js
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(HERE, "..", "..", "captures", "site", "cards.json");
const FILE = process.env.CARDS_FILE || DEFAULT_FILE;
```

并在 `catch` 里加一次性 `console.error`，读空不再无声。

`start-site.ps1:89` 本来就设了 `$env:CARDS_FILE`（指向仓库绝对路径），
所以走启动脚本时是好的；坏的是直接 `next start` / 部署缺该变量。现在两条路都对。

## 4. 构建触发器的缺陷

`start-site.ps1` 判断「要不要重建」时只扫 `app/`：

```powershell
$newest = Get-ChildItem (Join-Path $RT "app") -Recurse -File | ...
```

改 `lib/cards.js` 不会触发重建，直接跑就复用了旧构建（我这次就中招了，只能 `-Rebuild`）。
已改成同时扫 `app` / `lib` / `components`。

## 5. 验证

```
cards.json            66 张（9 + 57），全部唯一，备份 out/cards.before-merge.json
GET /                 带 lg_pass -> 204207 B，66 个 /card/<id> 链接
GET /card/1059101     200  26724 B   （新卡）
GET /card/1342379     200  26410 B   （新卡）
GET /card/3821218     200  29057 B   （旧卡）
```

注意口令 cookie 名是 **`lg_pass`**（`site/lib/gate.js:17`），不是 `lan_pass`；
不带它首页会被 `redirect("/enter")`，返回的只是 15 KB 空壳。

## 6. 新增脚本

| 脚本 | 作用 |
|---|---|
| `scripts/probe_home_min.py` | 用最小入参拉六个榜单，落 `out/home_min.json` |
| `scripts/merge_public_cards.py` | **不发请求**，从 `out/home_min.json` 按 id 去重合并进卡库；`--write` 才落盘，落盘前备份 |

## 7. 待办

- `out/home_min.json` 只覆盖 3 个 type；`newest` / `1d` / `7d` 待冷却后补，可再加几十张。
- 引擎 `CARDS` 常量仍含已下架的 `3856159` / `3860761`，建议剔除（`createByCard` 只会白试一次）。
