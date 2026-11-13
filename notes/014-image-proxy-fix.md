# 014 首页图片 502 与卡片「点不进去」修复

日期：2026-11-13
组件：`site/app/api/img/route.js`（前台图片代理）

## 现象

- `http://127.0.0.1:3100/` 首页卡片封面全部空白，头像不显示。
- 点卡片无反应（后来在无头浏览器里用真实鼠标事件验证：链接本身正常，
  `el.click()` 不跳转是无头环境的合成事件表现，不是站点问题；图片恢复后点击可正常进入 `/card/[id]`）。
- `/api/img?u=…&w=320` 返回 `502 text/plain "upstream error"`。

## 定位过程

| 测试 | 结果 |
|---|---|
| `curl.exe` 直连 pxlorbit.com 原图（3.1 MB） | 200，1.5s |
| `curl.exe` 经 Clash 7897 | 200，1.5s |
| Python `urllib` 直连 | 200，1.0s |
| Node `fetch` 直连 | 拿到 200 响应头，body 读到约 320 KB 处挂死，超时 |
| Node `https.get`（IPv4 / TLS1.2 / 无 keep-alive / Connection: close） | 全部在 body 中途挂死 |
| Node `http2` 直连 | 同样在约 327 KB 处停住 |
| Node `fetch` 经 Clash CONNECT 隧道 | 200，2.1s |
| Node `fetch` 下载 speed.cloudflare.com 3 MB | 200，1.4s（正常） |

结论：**不是网络问题，是 Node 的 TLS 链路对 pxlorbit.com 这个 Cloudflare 边缘的大响应体
在约 320 KB 处停住**；curl（Schannel）与 Python（OpenSSL）均正常。route 里原来的
`fetch + AbortSignal.timeout(20s)` 因此必然走到 catch，返回 `upstream error`。

另一处问题：缓存目录写死 `/opt/lan/imgcache`，Windows 上落到 `C:\opt\...`，
缓存实际不可用（异常被吞掉）。

## 修复

`site/app/api/img/route.js`：

1. **回源改走 curl**（`IMG_CURL` 可覆盖，Windows 默认 `curl.exe`，Linux 默认 `curl`），
   `execFile` 传参数组，无 shell 注入；`--location --max-redirs 3 --max-time 25 --fail`。
   curl 不可用或失败时才退回 `fetch`。
2. **缩图走 Supabase 渲染端点**：`pxlorbit.com` 的
   `/storage/v1/object/public/<bucket>/<path>` 改写为
   `/storage/v1/render/image/public/<bucket>/<path>?width=w&resize=contain`。
   实测带 `ciat` 签名的 render URL 改 `width` 后仍 200。320px 的 webp 仅 20–32 KB，
   不再需要 sharp（原代码的 sharp 分支已删除，构建告警随之消失）。
   渲染端点失败时自动回退原始 URL。
3. **缓存键加版本前缀 `v2|`**，避免命中旧的 3 MB 原图缓存。
4. **Windows 缓存目录**改为 `%LOCALAPPDATA%\lan-imgcache`；Linux 仍为 `/opt/lan/imgcache`。
5. 可选 `IMG_PROXY`：显式指定出站代理（默认 Windows 探测 `127.0.0.1:7897`，
   Linux 不探测）。

## 验证

```powershell
# 单图：object 路径 → 渲染端点
curl.exe -sS -o nul -w "%{http_code} %{size_download} %{content_type}`n" `
  "http://127.0.0.1:3100/api/img?u=https%3A%2F%2Fpxlorbit.com%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fpub_card_images%2F66ffe416-9b63-4230-8613-59e3b55b83d0.png&w=320"
# 200 21598 image/webp

# 第二次请求命中缓存
# x-img-cache: hit，耗时约 0.03s

# 首页 + 真实鼠标点击（无头 Chrome + CDP）
# cards=391，failedRequests=0
# afterClick url = http://127.0.0.1:3100/card/3821218，h1 正常，图片 broken=0
```

## 回滚

```powershell
git checkout -- site/app/api/img/route.js site/next.config.mjs
# 删掉 Windows 缓存目录（可选）
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\lan-imgcache"
# 重建
powershell -ExecutionPolicy Bypass -File start-site.ps1 -Rebuild
```

## 已知限制

- 首页 391 张卡会同时回源；首次冷缓存会并发拉起大量 curl 进程，耗时数秒。之后全部命中磁盘缓存。
- Supabase 渲染端点是服务端能力，若上游变更（403/404），route 自动回退原图（会较大）。
- `assetora.net` 没有渲染端点，只能回源原图。
