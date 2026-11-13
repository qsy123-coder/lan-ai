# notes/034 — 注册风控完整规律 + 出口矩阵（2026-11-14 凌晨）

> 本文是 2026-11-13 深夜到 11-14 凌晨连续实测的总结。结论按「变量 → 影响」写，
> 可直接据此选出口、选域名、判断一次注册会不会成。

## 1. 注册接口是两段式裁决

```
POST /api/auth/sign-up
  ├─ 第一段：428 {"code":"human_check_required"}   ← 先过 /__captcha/
  └─ 第二段（过闸后自动重试）：服务端注册风控
       成功 → 200，进入 8 位验证码页
       失败 → 429 {"code":"REGISTER_RISK_BLOCKED",
                   "error":"当前环境暂时无法完成注册，请稍后再试"}   ← 带请求 ID
```

- **428 只说明「要验证码」，不代表能注册**；真正卡人的是第二段。
- 429 的报错文案和「闸门没挂载」时的 toast 一模一样，只有响应体里的 `code` 能区分。
- 客户端豁免口不存在：`x-dzmm-client: mobile-app / expo` 只把 428 变成
  `418 {"code":"captcha_required"}`。

## 2. 前端闸门机制（bundle 实测）

`assets/B8zjTbOH.js`：

```js
sFe() → hG('/__captcha/?src=ratelimit')
hG()  → eG(url)：KW.size===0 ? 'unavailable' : 打开 iframe 弹窗并等待
        弹窗组件在 useEffect 里 nG() 注册监听；8 秒内 iframe 没触发 onLoad → jPe() → 'unavailable'
        eG 总寿命 180 秒（超时 dismissed）
```

三个坑：

1. **onLoad 竞态**：iframe 加载太快时 React 的 onLoad 没挂上，8 秒后判 unavailable，
   弹窗还没拖就报错。对策：弹窗出现后 6 秒内强制 `iframe.contentWindow.location.reload()`。
2. **180 秒寿命**：整条「取图 → 求解 → 拖拽」必须压进 2 分钟。
3. 求解器把轨迹写进隐藏域 `input#dragTrace`（320×180 坐标，`{x,y,t}`）。

## 3. 验证码求解（可行，但不稳定）

调色板（11-14 实测仍适用）：

| 颜色 | 含义 |
|---|---|
| `(216,227,232)` | 通道本体（可走，代价 1） |
| `(185,201,210)` | 通道边缘（可走，代价高） |
| `(73,119,108)` | **起点旋钮的圆环**（不是障碍） |
| `(78,105,119)` | 通道墙（障碍，代价∞） |
| `(244,242,236)` | 米色剪切条（障碍） |
| `(134,91,107)` | 终点红环 |

流程：严格分割 → Dijkstra 到每个红环 → 依次用 CDP 真实鼠标事件沿路径拖拽 + 点「完成验证」
→ 读到「没有通过」换下一个终点。实测 7 个终点里通常有 1 个能过，但**并非每题都能过**，
且轨迹质量会进第二段风控的评分（同一台机器，手动拖过一次、求解器拖过一次，结果不同）。

**11-14 起用户要求不再用求解器：闸门由人工拖，脚本只负责准备和收码。**

## 4. 域名矩阵（决定性变量）

| 邮箱域名 | 接口层 | 过闸后 |
|---|---|---|
| `aetouban.cn`（今晚建了 17 个号） | 428 | **429（已标记）** |
| `fldubai.com`（api.mail.tm） | 428 | **200，可注册** |
| `gmail.com` / `qq.com` | 428 | 未单独验证 |
| `qsy55882+别名@gmail.com` | 428 | 不是注册：**加号别名被规范化成主邮箱**，走「登录已有账号」 |

> 结论：aetouban.cn 短期内作废，改用 `fldubai.com`（mail.tm，需 API 收码）。

## 5. 出口矩阵（第二段风控看这个）

| 出口 | 结果 |
|---|---|
| 香港腾讯云 `43.135.10.175`（AS132203） | **首发放行**（b047），同 IP 第二次 429 |
| 台湾家宽 `118.167.18.108`（AS3462 HiNET） | 429（此前被 aetouban 多轮撞击过） |
| AWS 段：JP-U-1 / JP-U-5 / KR-N-5 / JP-N-2 / SG-N-3 / HK-N-3 | 428 → 过闸后 **429** |
| Cloudflare WARP（服务器装，proxy 模式 40000） | 刚接通时 dzmm 200 / 注册 428；随后所有请求 **超时**，不可用 |
| 本机直连（住宅/热点） | `ERR_CONNECTION_RESET`（SNI 被重置），页面加载不了 |
| 本机经 7897 代理 | 能过闸，但过闸后 429 |

**规律：每个出口 IP 约只放行 1 个注册。** 想继续加号 = 继续找新的、信誉好的 IP。

服务器本身：`43.135.10.175` 香港腾讯云，**无 IPv6**（只有 `::1`/link-local），
直连 dzmm 很慢（首页 7.8s、入口 JS 22s），浏览器会明显卡但能加载。

## 6. 验证码邮件（收码侧）

- 发件人 **`noreply@send.dianzimeimo.com`**，标题「你的魔法链接」，不是 dzmm 域。
- 基本进 **Gmail 垃圾邮件**；IMAP 按 `TO "别名"` 搜**搜不到**（Gmail 不索引这种 To），
  要用 `FROM dianzimeimo` 取最新一条的 8 位码。
- `aetouban.cn` 走 Cloudflare catch-all → Gmail，可 IMAP 读取（需经代理隧道，直连被墙）。
- `fldubai.com` 走 mail.tm API（`/messages` + token）读取，最省事、不受 Gmail 索引影响。

## 7. b047 的成功配方（可复制）

1. 出口：服务器 SSH SOCKS `ssh -D 1080 ubuntu@43.135.10.175`（浏览器 `socks5://127.0.0.1:1080`）。
2. 邮箱：mail.tm 新建 `xxx@fldubai.com`，先建 `/accounts` 再取 `/token`。
3. 浏览器：Edge 新 profile，`--proxy-server=socks5://127.0.0.1:1080`，
   填表用**原生 setter + input/change**（`insertText` 有的页面 React 收不到）。
4. 提交 → 弹窗出现后**人工拖**（求解器不参与）。
5. 过闸 → 页面自动重试 → 验证码页。
6. 用 mail.tm token 轮询 `/messages` 取 8 位码 → 填 → 点「验证」。
7. `cdp.mjs --cookies` 抓 cookie → `user.getMe` 校验 → `add_pool('b047')`。

结果：uid `fb05a4bf…`，credit 75，已同步本机 + 线上。

## 8. 本轮资产

```
号池：40 号 / 可用 31 / 1470.72 credit（本机与 43-135-10-175 一致）
服务器：SSH SOCKS 1080（常驻）、WARP 已安装（proxy 模式 40000，当前不通）
新代理：127.0.0.1:7999（mihomo 独立实例，控制口 9098；TW 住宅 + 11 个 AWS 节点）
辅助脚本（out/，均未入 git）：fetch_img / all_traces / try_endpoints / human_fill /
                               set_form* / click_text / bring_front / finish_gmail
```

## 9. 下一步可选（按代价排序）

1. 换服务器公网 IP（腾讯云免费额度）：关机 → 更换公网 IP → 开机，得 1 个新注册额度；
   代价是站点停机 1–2 分钟，且 `43-135-10-175.sslip.io` 域名随 IP 变化失效。
2. 新的 Gmail 小号走 `/auth/oauth/google`（登录语义，不经过 sign-up 风控）。
3. 另一台 VPS / 另一个机场节点（住宅优先），接进 1080 同构链路。
