# 038 分类页：复刻 dzmm.ai 的 21 个分类

日期：2026-11-15
分支：`feat/category-page`
数据源：`https://www.dzmm.ai/api/trpc/category.list?batch=1&input={"0":{"json":{}}}`（匿名 200）

## 分类原文（21 条，2026-11-15 实测）

| id | name | 显示名 | 匹配卡片数 |
|---:|---|---|---:|
| 15 | truelove | 纯爱 | 113 |
| 26 | girl | 女性向 | 112 |
| 11 | ntr | NTR | 123 |
| 16 | history | 古风历史 | 61 |
| 25 | sm | 调教 | 151 |
| 20 | emmmmm | 乱伦 | 66 |
| 7 | cultivation-sect | 仙侠古风 | 58 |
| 18 | world | 大世界 | 100 |
| 17 | hougong | 后宫 | 41 |
| 10 | foot-fetish | 足控 | 45 |
| 13 | acg | 同人 | 70 |
| 19 | yuri | 百合 | 28 |
| 21 | nanniang | 男娘 | 29 |
| 24 | you | 油腻 | 47 |
| 22 | futa | 扶她 | 11 |
| 12 | sfw | 一般向 | 40 |
| 23 | gay | 男同 | 8 |
| 9 | for-girls | 女性视角 | 97 |
| 14 | rpg | 游戏 | 4 |
| 28 | bisai4 | 第四届比赛 | 26 |
| 27 | bisai3 | 第三届比赛 | 21 |

> 数量 = 卡片 tags 与分类 tags 的交集（838 张卡，可重复计入多个分类）。
> 分类原文含 `description`、`tags`、`coverImageUrl`，全部落 `site/data/categories.json`。

## 改动

| 文件 | 作用 |
|---|---|
| `site/data/categories.json` | 21 条分类原始数据（UTF-8） |
| `scripts/seed_categories.py` | 重新拉取并覆盖 `site/data/categories.json`；418/401/空结果不覆盖 |
| `site/lib/categories.js` | 读取、按 name/id 查找、tags 交集匹配、计数 |
| `site/components/CategoryGrid.jsx` | 分类卡：封面 / 名称 / 描述 / 标签 / 卡片数 |
| `site/app/category/page.js` + `category.css` | `/category` 分类页（4 列 → 2 列手机） |
| `site/app/page.js` | 首页「分类」tab 指向 `/category`；`/?tab=cat` 渲染分类网格；`/?cat=<name>` 按分类标签筛选并显示可清除的筛选条 |
| `site/app/api/img/route.js` | 允许 `rls.cheggpt.com`；Supabase render 端点；该域跳过 Clash（走代理会 SSL_ERROR_SYSCALL，直连正常） |

## 验证

```text
category.list 200 -> 21 条
/category 200，21 个 displayName 全在
/?tab=cat 200，分类网格 21 张
/?cat=truelove 200，筛选条「分类：纯爱 · 113 张」，113 张卡
分类封面 /api/img?u=rls.cheggpt.com/...&w=640 -> 200 34KB image/jpeg
next build 通过
截图：out/shots/category-1440-light.png、category-1440-dark.png、category-390-light.png、
      home-cat-1440-light.png、home-cat-truelove-1440-light.png
横向溢出：1440 / 390 均 scrollW == vw
```

真实鼠标点击（CDP `Input.dispatchMouseEvent`，不是 `element.click()`）：

```text
首页「分类」tab -> /category，21 张分类卡
第一张分类卡 -> /?cat=truelove，筛选条「分类：纯爱 · 113 张」，113 张卡
```

## 已知限制

- 分类封面是官方分类图，不受「隐藏敏感内容」开关影响（只有角色卡按 `isSensitive` 遮罩）。
- 一个角色卡可同时属于多个分类（tags 交集），计数会重复。
- 分类页封面用 eager 加载（21 张 × 约 30KB），首屏请求略多；后续可改虚拟滚动/懒加载。
- 没有分类详情页；点分类回首页用 `?cat=` 过滤，清除后回到全部卡片。

## 回滚

```powershell
git checkout feat/checkin-vip
git branch -D feat/category-page
# 或撤文件
Remove-Item site\app\category, site\components\CategoryGrid.jsx, site\lib\categories.js, site\data\categories.json, scripts\seed_categories.py -Recurse -Force
git checkout -- site\app\page.js site\app\api\img\route.js
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
