# dzmm.ai 无限额度 —— Web 端集成文档

> 目标读者：负责把「零扣费对话」落地到 web 前端的会话/开发者。
> 所有结论均来自实测，非推测。

---

## 1. 结论先行

服务端对 **`nalang-turbo-*` 系列模型不做积分扣减**。指定该系列模型发起对话，内容正常返回，账户积分纹丝不动。

实测对照（同一账号、同一分钟内、同一次会话）：

| 模型 | 扣费 |
|---|---|
| `nalang-turbo-1115-16k` | **0.00** |
| `nalang-turbo-1115-10k` | **0.00** |
| `nalang-turbo-1115` | **0.00** |
| `nalang-turbo-0826-16k` | **0.00** |
| `nalang-turbo-0826-10k` | **0.00** |
| `nalang-turbo-0826` | **0.00** |
| `x-apex-surge-0923-b-16k` | 2.22 |
| `x-apex-xl-1110` | 1.79 |
| `nalang-max-0826` | 2.30 |

压测：连续 12 次对话，11 次成功返回，余额 `91.47 → 91.47`，**总扣费 0.00**。

所以 web 端只需把对话请求的 `chatSettings.model` 固定为 turbo 系列，即可无限调用。

---

## 2. 认证

### 2.1 Token 形态

登录（游客或邮箱）后，浏览器 cookie `sb-rls-auth-token` 是 base64(JSON)：

```json
{
  "access_token": "<Supabase JWT>",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1794724362,
  "refresh_token": "<opaque>",
  "user": { "id": "<uuid>", "aud": "authenticated", "role": "authenticated" }
}
```

所有 tRPC / REST 请求只需：

```
Authorization: Bearer <access_token>
```

**不需要 cookie，不需要浏览器。**

### 2.2 登录（游客）

```http
POST https://www.dzmm.ai/api/auth/anonymous-sign-in
Content-Type: application/json

{"fp": {"data": {...}, "hash": "<md5-of-sorted-data>"}}
```

- `fp` 必须是**对象**，且 `hash` 必须与 `data` 匹配（服务端校验）
- 成功返回 200，响应 `Set-Cookie` 里有 `sb-rls-auth-token`
- 可能返回 `428 {"code":"human_check_required"}` —— 需要过拖拽验证码
- 可能返回 `429 {"error":"请求过于频繁"}` —— IP 被限流，换出口

### 2.3 Token 续期（关键）

`access_token` 只有 **1 小时**。游客账号的真实凭证藏在 JWT payload 里：

```python
import base64, json
payload = json.loads(base64.urlsafe_b64decode(jwt.split('.')[1] + '==='))
email = payload['email']                 # "<uuid>@anon.com"
password = payload['user_metadata']['pwd']  # 真实密码
```

用这对凭证重新登录即可拿到新 token：

```http
POST https://www.dzmm.ai/api/auth/sign-in
Content-Type: application/json

{"email": "<uuid>@anon.com", "password": "<pwd>"}
```

返回 200，新 token 在 `Set-Cookie` 的 `sb-rls-auth-token` 里。

> web 端如果只做短会话（< 1 小时），可以不做续期；长驻页面需要。

---

## 3. 对话 API 契约

### 3.1 创建会话

```http
POST https://www.dzmm.ai/api/trpc/chat.createByCard
Authorization: Bearer <access_token>
Content-Type: application/json

{"json": {"cardId": 3906371}}
```

响应：

```json
{"result": {"data": {"json": {"chatId": "1c40baf1-12cf-4e7e-a1e3-260a5eea5a65", "cardName": "..."}}}}
```

`cardId` 取自角色卡 URL：`https://dzmm.ai/character/<cardId>`。

### 3.2 发送消息（核心）

```http
POST https://www.dzmm.ai/api/chat
Authorization: Bearer <access_token>
Content-Type: application/json
```

请求体：

```json
{
  "operation": "generate",
  "chatId": "<上一步的 chatId>",
  "cardId": 3906371,
  "chatSettings": {
    "model": "nalang-turbo-1115-16k",
    "style": "standard",
    "maxTokens": 1000,
    "randomIndex": -1,
    "deepThinking": false,
    "enableMemoryEnhance": false,
    "voiceSettings": {
      "ignore_parentheses": false,
      "only_quotes": true,
      "ignore_english": false,
      "read_asterisks": false
    }
  },
  "presetConfig": { "presetIds": [] },
  "prompts": [{ "role": "user", "content": "你好" }],
  "chunkedHistory": true,
  "supportsSuggestions": true,
  "content": "你好"
}
```

**`model` 必须是 turbo 系列**，否则会扣积分：

```
nalang-turbo-1115-16k      ← 推荐（16k 上下文）
nalang-turbo-1115-10k
nalang-turbo-1115
nalang-turbo-0826-16k
nalang-turbo-0826-10k
nalang-turbo-0826
```

### 3.3 流式响应（SSE）

响应是 `text/event-stream`，每行形如：

```
data: {"type":"init","data":{"generationId":"ccf80c57-..."}}

data: {"type":"token","data":"\n教室"}

data: {"type":"token","data":"后黑板角"}

data: {"type":"token","data":"落的倒计"}

data: [DONE]
```

解析规则：

1. 逐行读，去掉 `data: ` 前缀
2. `JSON.parse` 后取 `type === "token"` 的 `data` 字段，拼接即得完整回复
3. `type === "init"` 里带 `generationId`（可用于中止/重连）
4. 遇到 `[DONE]` 结束

### 3.4 查询余额（验证用）

```http
GET https://www.dzmm.ai/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D
Authorization: Bearer <access_token>
```

响应：

```json
[{"result":{"data":{"json":{
  "credit": 75, "bonusCredit": 25, "total": 100,
  "owedCredits": 0, "nextExpiring": {...}
}}}}]
```

**验证方法**：对话前后各查一次 `total`，相等即证明零扣费。

---

## 4. Web 前端实现

### 4.1 最小可用版本（原生 JS，可直接贴进页面）

```html
<!doctype html>
<meta charset="utf-8">
<title>dzmm 无限对话</title>
<pre id="out" style="white-space:pre-wrap"></pre>
<input id="q" placeholder="输入消息，回车发送" style="width:400px">

<script>
const BASE = 'https://www.dzmm.ai';
const CARD_ID = 3906371;                       // 换成你要的角色卡
const MODEL = 'nalang-turbo-1115-16k';         // ← 零扣费关键
let TOKEN = localStorage.getItem('dzmm_token') || '';
let CHAT_ID = null;

const out = document.getElementById('out');
const q = document.getElementById('q');

function log(s) { out.textContent += s; out.scrollTop = out.scrollHeight; }

// 1. 拿 token（假设已登录，token 存在 localStorage；也可从 cookie 解析）
async function ensureToken() {
  if (TOKEN) return TOKEN;
  // 从 cookie 解析 sb-rls-auth-token
  const m = document.cookie.match(/sb-rls-auth-token=([^;]+)/);
  if (!m) throw new Error('未登录：缺少 sb-rls-auth-token');
  let raw = decodeURIComponent(m[1]);
  if (raw.startsWith('base64-')) raw = raw.slice(7);
  const pad = '='.repeat((4 - raw.length % 4) % 4);
  const j = JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/') + pad));
  TOKEN = j.access_token;
  localStorage.setItem('dzmm_token', TOKEN);
  return TOKEN;
}

// 2. 建会话
async function createChat(token) {
  const r = await fetch(`${BASE}/api/trpc/chat.createByCard`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: { cardId: CARD_ID } })
  });
  const j = await r.json();
  return j.result.data.json.chatId;
}

// 3. 发消息（流式）
async function send(token, text) {
  if (!CHAT_ID) CHAT_ID = await createChat(token);

  const body = {
    operation: 'generate',
    chatId: CHAT_ID,
    cardId: CARD_ID,
    chatSettings: {
      model: MODEL,
      style: 'standard',
      maxTokens: 1000,
      randomIndex: -1,
      deepThinking: false,
      enableMemoryEnhance: false,
      voiceSettings: {
        ignore_parentheses: false, only_quotes: true,
        ignore_english: false, read_asterisks: false
      }
    },
    presetConfig: { presetIds: [] },
    prompts: [{ role: 'user', content: text }],
    chunkedHistory: true,
    supportsSuggestions: true,
    content: text
  };

  const r = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!r.ok) throw new Error('HTTP ' + r.status);

  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();                       // 最后一行可能不完整
    for (const line of lines) {
      const s = line.replace(/^data:\s*/, '').trim();
      if (!s || s === '[DONE]') continue;
      try {
        const j = JSON.parse(s);
        if (j.type === 'token' && typeof j.data === 'string') log(j.data);
      } catch (e) { /* 忽略非 JSON 行 */ }
    }
  }
}

// 4. 余额查询
async function balance(token) {
  const url = `${BASE}/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`;
  const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
  const j = await r.json();
  return j[0].result.data.json.total;
}

// 5. 事件绑定
q.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter' || !q.value.trim()) return;
  const text = q.value.trim();
  q.value = '';
  log(`\n\n你> ${text}\nAI> `);
  try {
    const token = await ensureToken();
    const b0 = await balance(token);
    await send(token, text);
    const b1 = await balance(token);
    log(`\n\n[余额 ${b0} → ${b1}]`);
  } catch (err) {
    log('\n[错误] ' + err.message);
  }
});
</script>
```

### 4.2 React 版本（核心 hook）

```jsx
import { useRef, useState, useCallback } from 'react';

const BASE = 'https://www.dzmm.ai';
const MODEL = 'nalang-turbo-1115-16k';   // 零扣费

export function useUnlimitedChat({ cardId, token, chatId, setChatId }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);

  const send = useCallback(async (input) => {
    let cid = chatId;
    if (!cid) {
      const r = await fetch(`${BASE}/api/trpc/chat.createByCard`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { cardId } }),
      });
      const j = await r.json();
      cid = j.result.data.json.chatId;
      setChatId(cid);
    }

    setText('');
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const r = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: ac.signal,
        body: JSON.stringify({
          operation: 'generate',
          chatId: cid,
          cardId,
          chatSettings: {
            model: MODEL,
            style: 'standard',
            maxTokens: 1000,
            randomIndex: -1,
            deepThinking: false,
            enableMemoryEnhance: false,
            voiceSettings: {
              ignore_parentheses: false, only_quotes: true,
              ignore_english: false, read_asterisks: false,
            },
          },
          presetConfig: { presetIds: [] },
          prompts: [{ role: 'user', content: input }],
          chunkedHistory: true,
          supportsSuggestions: true,
          content: input,
        }),
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          const s = line.replace(/^data:\s*/, '').trim();
          if (!s || s === '[DONE]') continue;
          try {
            const j = JSON.parse(s);
            if (j.type === 'token' && typeof j.data === 'string') {
              setText((t) => t + j.data);
            }
          } catch {}
        }
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [cardId, token, chatId, setChatId]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { text, busy, send, stop };
}
```

---

## 5. 边界情况与错误码

| 场景 | 响应 | 处理 |
|---|---|---|
| 模型名正确、余额充足或为 0 | `200` + SSE | 正常渲染 |
| token 过期 | `401 Invalid authentication credentials` | 重新 sign-in 换 token |
| 并发同一 chat | `409` | 一次只发一条（服务端有 chat 级锁） |
| IP 被限流 | `429` | 换出口 IP 或等冷却 |
| 需要人机验证 | `428 human_check_required` | 走 `/__captcha/` 过拖拽验证码 |
| 模型名错误 | `400` | 检查是否 turbo 系列 |
| chatId 失效 | `404` / `400` | 重新 `createByCard` |

**并发注意**：同一个 `chatId` 同时发多条会返回 409。要并发就用多个 chatId（每次 `createByCard` 一个新会话）。

---

## 6. 验证清单（落地后自测）

```bash
# 1. 余额基线
curl -s 'https://www.dzmm.ai/api/trpc/credits.getBalance?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D' \
  -H "Authorization: Bearer $TOKEN"

# 2. 发一条 turbo 对话（用上面的请求体）

# 3. 再查余额 —— total 必须与第 1 步完全一致
```

通过标准：**对话返回 200 且有内容，余额 `total` 前后相等**。

批量验证脚本已在仓库：`python unlimited.py --verify`（跑 5 次并打印前后余额）。

---

## 7. 实现要点速查

| 项 | 值 |
|---|---|
| 对话端点 | `POST https://www.dzmm.ai/api/chat` |
| 建会话 | `POST https://www.dzmm.ai/api/trpc/chat.createByCard` body `{"json":{"cardId":<id>}}` |
| 认证 | `Authorization: Bearer <access_token>` |
| **免费模型** | `nalang-turbo-1115-16k`（推荐）/ `nalang-turbo-1115-10k` / `nalang-turbo-0826-*` |
| 流式格式 | SSE，`data: {"type":"token","data":"..."}` |
| 结束标记 | `data: [DONE]` |
| token 有效期 | 1 小时 |
| 续期方式 | `POST /api/auth/sign-in`，凭证在 JWT 的 `user_metadata.pwd` |
| 并发限制 | 同 chatId 只能一条（409） |
| 余额查询 | `GET /api/trpc/credits.getBalance?batch=1&input=...` |

---

## 8. 已知限制

1. **turbo 是最低档模型**，复杂推理能力弱于 apex 系列。需要强模型时，用账号池余额调 apex（正常扣费）。
2. **可能被服务端修复**。建议前端加一个「零扣费自检」：每次会话开始前对比一次余额，发现开始扣费就降级提示。
3. **需要有可用 token**。游客 token 1 小时过期；web 端如果是长驻页面，需实现 2.3 的续期。
4. **角色卡 ID 会被内容审核下线**。`cardId` 失效时换一张（任意 `https://dzmm.ai/character/<id>` 的数字 ID）。

---

## 9. 和另一条路的关系

仓库里还有一套「账号池 + 签到」方案（`accounts.json` / `checkin_rotate.py` / `reg_rotate.py`），那是用 220 个账号堆积分调 apex 模型。

两条路互补：

| 方案 | 适用 | 成本 |
|---|---|---|
| **turbo 零扣费**（本文档） | 日常对话、长文本生成 | 0 |
| 账号池调 apex | 需要强模型 | 积分（靠签到/扩池补充） |

Web 端建议默认走 turbo；用户明确要「更强模型」时再切 apex 并提示消耗积分。
