# 039 广场 / 论坛（notes/008 §2.3）

日期：2026-11-15
分支：`feat/forum`
总文档：`notes/008-dzmm-teardown.md` §2.3（论坛 / 广场）

## 结构

照 notes/008 §2.3 做三栏：

- 左：分区（最新 / 角色与创作 / 互动交友 / 生活交流 / 站务与求助 / 真人专区 / 妹子认证）
- 中：帖子流（置顶、分区、标题、摘要、作者等级、标签、赞/评）
- 右：关于广场、热门标签、活跃群组

帖子详情 `/post/<id>`：正文、标签、赞/踩、评论列表、评论框。
发帖 `/forum/new`：标题、分区、标签（逗号分隔，最多 5 个）、正文。

## 数据与接口

种子 `site/data/forum.json`（7 帖、6 分区、6 热标签、4 群组），
运行态 `out/forum.json`（首次读时从种子复制，之后引擎写）。

引擎 `engine/forum.py`（标准库，单写锁 + 原子替换）：

```text
GET  /site/forum?topic=&tag=&sort=latest|hot&q=&token=
GET  /site/forum/post?id=&token=
POST /site/forum/post     {token,title,body,tags,topic}
POST /site/forum/comment  {token,postId,body}
POST /site/forum/like     {token,postId,value:1|-1|0}
```

Next 代理：

```text
GET  /api/forum
GET/POST /api/forum/post
POST /api/forum/comment
POST /api/forum/like
```

- 读：游客可用，登录后带 `liked` 状态。
- 写：必须登录（`lan_sess` → 引擎 session_user），否则 401。
- 赞/踩按 uid 记在 `votes`，切换/取消时同步修正计数。
- 新帖/评论作者取用户昵称，等级取 `max(1, vip)`。

## 前端

| 文件 | 作用 |
|---|---|
| `site/app/forum/page.js` + `forum.css` | 三栏广场、分区/标签/搜索/排序、发帖入口 |
| `site/app/post/[id]/page.js` | 帖子详情 + 评论列表 |
| `site/app/forum/new/page.js` | 发帖页（未登录显示登录 CTA） |
| `site/components/PostActions.jsx` | 赞/踩、评论框（客户端） |
| `site/components/NewPostForm.jsx` | 发帖表单（客户端） |
| `site/components/Nav.jsx` | 「论坛」去掉 `soon`，指向 `/forum` |

## 验证

```text
引擎：list 200/7 帖；topic+hot 排序；详情 2 评论；注册→发帖→评论→赞 1/-1/0→搜索
Next：GET /api/forum 200/7；POST 发帖/评论/点赞/详情 全 200
页面：/forum 200；/post/p_1001 200；/forum/new 200（登录态表单）
next build 通过
截图：out/shots/forum-1440-light.png、forum-1440-dark.png、forum-390-light.png、
      post-1440-light.png、post-390-light.png、newpost-1440-light.png
横向溢出：1440 / 390 均 scrollW == vw
```

真实鼠标点击（CDP `Input.dispatchMouseEvent`）：

```text
首页「论坛」tab -> /forum（7 帖）
第一张帖子 -> /post/p_1001（2 评论）
点赞 42 -> 43，再点恢复 42
评论框输入并提交 -> 评论 3 条，最后一条「UI 点击评论测试。」
/forum/new 输入标题/正文并发布 -> /post/p_<新 id>
测试后删除 out/forum.json，下一读重新从种子复制，恢复 7 帖 / p_1001 2 评论
```

## 已知限制

- 本地 JSON 单文件，无分页、无全文索引；帖子多了要换 SQLite/Postgres。
- 没有编辑/删除/举报/审核/置顶管理；置顶只在种子里。
- 评论是平铺列表，没有楼中楼。
- 赞/踩按 uid 记录在本机 `out/forum.json`，清空该文件会丢用户投票。
- 真人专区/妹子认证只是分区，没有真实的身份认证流程。

## 回滚

```powershell
git checkout feat/category-page
git branch -D feat/forum
# 或撤文件
Remove-Item engine\forum.py, site\app\forum, site\app\post, site\app\api\forum,
  site\components\PostActions.jsx, site\components\NewPostForm.jsx, site\data\forum.json -Recurse -Force
git checkout -- engine\server.py site\components\Nav.jsx
Remove-Item out\forum.json
powershell -File .\start-site.ps1 -NoOpen -Rebuild
```
