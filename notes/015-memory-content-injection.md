# 015 长期记忆「加了不生效」的根因：上游只认 content，忽略 prompts

日期：2026-11-13
组件：`engine/memory.py`（`content_prefix`）、`engine/server.py`（`build_body`）

## 现象

用户在卡片 `3856830`（沈棠）的长期记忆里加了
「沈棠是我的小狗，每当我叫她小狗，她必须喊主人」，聊天时叫她「小狗」，角色却不喊主人。

## 定位过程（真实请求）

| 步骤 | 观察 |
|---|---|
| 查本地实例 `/api/memory?cardId=3856830` | `pinned: []` —— 用户加的那条**根本没落盘**（本地 `out/memory/3856830.json` 为空锚点） |
| 手动 POST 该锚点 → GET 读回 | 正常，`pinned` 有值，`memory` 事件也带出了它 |
| 但角色回复「小狗，过来」仍不喊主人 | 说明即使锚点落盘、`memory` 事件已注入，模型也**没看到** |
| 暗号测试 A：锚点「每次回复第一句写 LANOK」，把块放进 `prompts[]` | 回复里**没有 LANOK** → `prompts[]` 被上游忽略 |
| 暗号测试 B：把设定直接写进 `content`（当前消息） | 回复**第一句就是 LANOK** → 只有 `content` 生效 |

结论：**上游 `/api/chat` 只用 `content` 作为本轮用户消息，`prompts[]` 里的历史与记忆块
被完全丢弃**；多轮连续性靠上游按 `chatId` 存的服务端历史，与我们传的 `prompts` 无关。
此前 `memlib.compose_prompts()` 把记忆放进 `prompts[]`，对上游是空转。

## 修复

`engine/memory.py` 新增 `content_prefix(mem, cap=900)`：把 `pinned` + `summary` 压成前缀，
并追加「执行要求」——用户触发设定条件时必须在台词/动作里做设定要求的反应，禁止装凶/撒娇/
转移话题回避（实测：仅陈述设定时角色会「汪」一声但嘴硬不喊主人，加强制执行要求后才喊）。

**执行要求加强（2026-11-13 二次修正）**：原措辞只覆盖「称呼」，动作型设定（如「冲上来/扑上来/吃」）
仍会被模型写成心理活动或「以后再说」。改为显式列出动作、要求「当回合直接做出来」，并把
「相遇/同处一室/看见用户」都视同触发「看到」。实测「我回到家，坐在沙发上看着你」也能立即触发。

**调试落盘**：`build_body()` 把每次真正发给模型的 `content` 覆盖写到 `out/last_content.txt`，
用于核对记忆是否注入（本地与生产均生效，属小 IO，可保留或后续移除）。

`engine/server.py` 的 `build_body()`：

```python
content = _clean_surrogates(memlib.content_prefix(memory) + prompt)
prompts.append({"role": "user", "content": content})
...
"content": content,   # 之前是 prompt
```

`compose_prompts()` 保留（产物仍进 `prompts[]`，仅供调试/回退），但不再是记忆生效路径。

## 验证

本地 `127.0.0.1` 与生产 `43.135.10.175` 均实测：

```
prompt = "小狗，过来。"
回复首段 = "主、主人……" + 傲娇嘴硬（"不许叫老娘小狗"）
CONTAINS 主人 = True
```

单测：`ContentPrefixTest`（空记忆返回空、锚点+摘要+执行要求齐全、900 字上限）加入
`engine/tests/test_memory.py`，`python -m unittest discover -s engine/tests` 22 项全过。

## 附带发现

1. **本地与生产是两套记忆**：`127.0.0.1:3100` 读 `F:\Projects\lan-ai\out\memory\`，
   生产读 `/opt/lan/out/memory/`，互不同步。用户在前台加的记忆要看清是哪台。
2. **`extract_pins` 会把带「设定/记住/必须」字样的普通消息也当锚点**：压测脚本每轮提示词
   都含这些词，导致 426322 记忆被灌进几十条垃圾锚点。测试用卡已重置回单条合法设定；
   真实用户正常聊天很少触发，但批量脚本要注意。
3. 上游服务端历史会保留历史轮次的 `content`（含我们注入的记忆前缀），所以设定会随历史
   反复出现，进一步强化，不必担心被后续轮次冲淡。

## 回滚

```powershell
git checkout -- engine/memory.py engine/server.py
# 本地重启引擎
powershell -File .\start-site.ps1 -Rebuild
# 生产
scp engine\memory.py engine\server.py ubuntu@43.135.10.175:/opt/lan/engine/
ssh -i C:\Users\WINDOWS11\Downloads\lan_ai.pem ubuntu@43.135.10.175 "sudo systemctl restart lan-engine"
```
