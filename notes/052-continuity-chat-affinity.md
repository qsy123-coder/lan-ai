# 052 · 剧情割裂的真因：一个会话被拆成 15 条上游 chat

日期：2026-11-17
分支：`fix/session-chat-affinity`
触发：用户上传「夏日,妹妹,同居」（426322 / session `93d5e47b…`）指出 [96]→[97]
「伊一汇报玲奈在图书馆旧馆三层自习」与 [98]→[99]「玲奈戴耳机…从后方捂住她的嘴」
之间剧情断裂：回复没有进图书馆，而是回到「清晨卧室 + 结衣」的旧场景。

## 1. 证据（线上实测，不是推测）

把该会话在 `webstate.site_chats` 里的 15 条上游 chat 逐条 `chat.getMessages`：

| 号 | 条数 | 最后一条停在 |
|---|---|---|
| b021 | 15 | 「你的话像一道赦令」 |
| b054 | 49 | 「那一夜之后，伊一不再提观众」 |
| b022 | 17 | 「肉棒缓缓从她湿透的体内滑出」 |
| b028 | 15 | 「放学回家的路上」 |
| b029 | 11 | 「接下来的几天，在学校里」 |
| b030 | 17 | 「你拉开浴室门」 |
| b031 | 5 | 「伊一的手指在你胳膊上停留」 |
| b032 | 15 | 「那天晚上，伊一很晚才回家」 |
| b033 | 7 | 「结衣的嘴唇刚刚触碰到顶端」 |
| b055 | 1 | 卡片开场 |
| d006 | 7 | 「伊一听到这句话，眼睛瞬间亮了起来」 |
| b034 | 35 | 「房间里只剩下肉体碰撞的啪啪声…结衣」 |
| b037 | 35 | 「放学后的教室已经空无一人」（= [97]） |
| b038 | 41 | 「伊一的眼睛瞬间亮了起来…刻晴」 |
| b039 | 9 | 「家门在你身后咔哒一声关上…玄关」（= [119]） |

**同一段剧情被切成了 15 条各停在**不同**轮次的上游会话。** 每轮到下一个号时，
引擎用 `chat.createByCard` 拿会话，而它按 `(号, cardId)` 去重，直接返回该号
以前建过的那条旧会话；模型于是从那条会话的旧尾巴继续写：

- [99] 接的是「清晨卧室 + 结衣」（b034 一类）→ 用户看到的「剧情倒退」；
- [117] 接的是「美羽 / 更衣室」，[119] 接的是「玄关回家」——notes/051 记录的
  两次跳跃，也是同一机制，只是当时归因到「摘要停在旧阶段」。

同时暴露的两个次要问题：

1. `content_prefix` 用 `"...".join(lines)[:900]` 一刀切：6 条锚点（≈500 字）+
   摘要（600 字）超预算后，**摘要从中间被截断，末尾的【当前场景】整段丢失**。
   notes/051 刚加的 `ensure_scene` 因此等于白加。
2. 追加到 `content` 的「最近原文」只截每段**开头**（`c[:500]`），模型的接续
   依据恰好是最后一段的**结尾**，方向反了。

## 2. 改动

### engine/server.py

- **会话亲和**：一个会话只允许续写「sessions.json 里登记的那个号 + 那个 chat」。
  其它情况一律新建**空**会话；不再因为换号去接别的 chat。
- `fresh_chat_for_card()`：`createByCard` 返回的会话先 `chat.getMessages` 数条数。
  - 0 条 → 用；
  - 非空且属于**本会话** → `deleteChat` 后重开；
  - 非空且属于**别的会话** → 不删，换号（`chat_owned_by_other_session`）；
  - 返回的正是当前正式会话 → 不删，换号（`active_chat_reused`）。
  `chat_in_use()` 负责「这条 chat 是否被别的会话登记」，避免误删。
- `ensure_chat_for_card(fresh=True)`：跳过本地缓存，走上面的空会话流程；用
  `session_lock_for()` 串行化同会话的「建新 chat」，双击不再各建一条。
- 锁粒度从「号 × 卡」改成「chatId」：同号同卡的不同会话不再互相 409。
  当前会话的锁被占时返回 busy，而不是换号（换号=新 chat=断剧情）。
- `recent_turns_text()`：last assistant 保留**结尾** 900 字，其余消息留头+留尾。
- `build_body(fresh_chat=)`：只有新开会话时才把摘要塞进 `content`；同一会话内
  上游已有真实历史，旧摘要会把模型拉回摘要停笔的旧场景。新会话额外注入
  【接续要求】「从最后一句落点接着写，禁止回到更早场景」。
- `rewind`：客户端撤回消息/点重新生成时传 `rewind:true`，服务端
  `reset_session_chat()` 删掉当前上游会话并从 head 重开（上游没有「删单条消息」，
  不删旧会话的话被撤回的轮次仍然算已发生）。
- 重复发送兜底：history 末尾与本次 prompt 逐字相同的 user 消息整段丢弃
  （前端 2s 去重挡不住更慢的重试）。
- `/site/history`：优先返回**当前登记的会话**，不再「取最长」——旧存档都停在
  更早轮次，取最长可能把剧情退回去。
- `drop_session_chat()`：把该 session 名下**所有** chat 都删掉（原来只删注册的
  那一条，留下 14 条孤儿，下次 createByCard 又捡回来）。

### engine/memory.py

- `content_prefix(cap=2600, include_summary=True)`：超预算时裁「设定块」的头，
  摘要（含末尾【当前场景】）整段保留；摘要本身超预算时保末尾 `cap` 字。
- `include_summary=False`：只注入设定，用于同一上游会话的后续轮次。

### site/components/ChatClient.jsx

- `send(text, head, { rewind:true })`；`regenerate()` 与「删除某条消息」都会在
  下一次发送带上 `rewind`。

## 3. 验证

- `py_compile` 三文件零错误；`unittest` **71 tests OK**（新增 4 个
  `fresh_chat_for_card` 用例、`chat_in_use`/`chat_owner_session`、`recent_turns_text`
  留尾、`content_prefix` 场景行保留）。
- 站点 `next build` 通过（本地运行副本 `%LOCALAPPDATA%\dzmm-site`，BUILD_EXIT=0）。
- 线上冒烟：日志出现 `site: card=… session=… chat=… switched=… fresh=True recent=…`；
  换号时出现 `清掉旧会话 …（card=…，N 条旧剧情）-> True`；同一 session 只保留
  一条活跃 chat（`git` 不含运行态，看 `webstate.site_chats` 的活跃键）。

## 4. 对已污染会话的修复

「夏日,妹妹,同居」`93d5e47b…` 已经有 15 条旧 chat。两种做法：

1. **删除到分叉点之后**：在页面上删掉 [96] 之后的本地消息，然后发送下一句——
   `del` 已把 `rewindRef` 置真，引擎会删掉当前上游会话、从剩下的 head 重开。
2. **整会话重置**：左栏「删除会话」/「清空会话」→ `drop_session_chat` 现在会删掉
   该 session 名下全部 15 条上游 chat（不可逆，快照 `out/history/426322/93d5e47b….json`
   仍在，需要时还能上传恢复消息）。

## 5. 已知边界

- `fetch_chat_count` 读不到条数（网络抖动）时按「空会话」用，仍有一次串场景的可能；
  日志会留 `新会话条数未知`。
- 新会话若命中的号上有**旧版无 session 键**（`site:<号>:<卡>`）的 chat，按「被占用」
  跳过，不删；这类号在热门卡上会暂时不可用（池子足够大）。
- 删除旧 chat 会丢该号上的那段上游存档；客户端本地消息与 `out/history` 快照仍在。
- 摘要仍是每 ≥16 条才更新一次；同会话内不再注入摘要，跨会话接续依赖
  「最近 6 条原文 + 摘要 + 【当前场景】」。

## 6. 回滚

```bash
cp /opt/lan/backup-affinity-<ts>/server.py /opt/lan/engine/server.py
cp /opt/lan/backup-affinity-<ts>/memory.py /opt/lan/engine/memory.py
cp /opt/lan/backup-affinity-<ts>/ChatClient.jsx /opt/lan/site/components/ChatClient.jsx
sudo systemctl restart lan-engine
cd /opt/lan/site && npm run build && sudo systemctl restart lan-site
```
