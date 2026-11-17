# 050 · 手机 → 云端上传整段会话（突破上游存档上限）

日期：2026-11-17
分支：`feat/chat-history-upload`
触发：用户手机上有 ~90 轮「夏日,妹妹,同居」，上游只取到 49 条。

## 1. 为什么上游拿不全

- `chat.getMessages` 每个 chat 只有 **1 个 active chunk**（`chunkInfos[].children` 为空），
  实测上限约 **50–70 条**；换号会产生多条分支型存档（3/5/9/13/17/35/41/49/57/69 条）。
- 站点的浏览器 localStorage 每个会话最多存 **120 条**（`save()` 的 `slice(-120)`）。
- 所以「90 轮」的完整原文只可能在手机浏览器里，上游没有任何一份是全的。

## 2. 方案：浏览器上传快照

- 引擎：
  - `POST /site/history` `{cardId, sessionId, messages}` → 落 `out/history/<card>/<sid>.json`
    （原子写，单条 ≤6000 字，最多 2000 条 / 2MB）。
  - `GET /site/history` **优先返回快照**（`source: snapshot`），没有再走上游分块。
  - `/site/sessions` 合并 `out/history` 下的快照，上传后 PC 左侧列表直接可见。
- 站点：`/api/history` 增加 POST 透传。
- 前端：会话面板顶栏新增「上传」按钮，把当前会话的消息推到云端。

## 3. 用法（手机 → PC）

1. 手机打开该会话 → 左上「对话」→ 点「上传」→ 提示「已上传 N 条到云端」。
2. PC `Ctrl+Shift+R`，打开同一张卡：列表出现该会话（名称/封面正常）。
3. 点开即从快照回填，内容与手机一致；PC 之后打开也一直能读。

## 4. 验证

- 60 条测试消息 POST → `{"ok":true,"count":60}`；GET → `source=snapshot count=60`。
- `/api/sessions` 出现 `upload-test` 且带卡名/封面；测试文件已清理。
- 线上重建 + 重启，页面 200。

## 5. 边界

- 只能同步手机浏览器当前还留着的消息（≤120 条）；更早的已在本机被裁掉，无法恢复。
- 快照只存在服务器磁盘，不写上游；清空会话时不会自动删快照（后续可加）。
- 依赖站点口令隔离；多用户部署需按 uid 隔离。

## 6. 回滚

```bash
cp /opt/lan/backup-history-upload-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-history-upload-<ts>/route.js /opt/lan/site/app/api/history/route.js
cp /opt/lan/backup-history-upload-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
cp /opt/lan/backup-history-upload-<ts>/SessionList.jsx /opt/lan/site/components/SessionList.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
