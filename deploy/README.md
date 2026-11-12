# 部署到云主机（关机也能用）

> 你电脑一关机，任何指向它的隧道都会断。要让手机上随时能玩，**整条链路必须搬到一台不关机的机器上**。
> 这套文件就是干这个的：引擎 + 前台 + 自动 HTTPS，一条命令起。

## 0. 为什么不是 Vercel

| 需要 | Serverless（Vercel） | 一台云主机 |
|---|---|---|
| `curl_cffi` TLS 指纹 | ❌ 装不了 | ✅ |
| 本地/出口代理 | ❌ | ✅ 可选 |
| 磁盘存账号池 `accounts.json` | ❌ 无状态 | ✅ 挂卷 |
| 单次 30–60s 的 SSE 连接 | ⚠️ 有时长上限 | ✅ 随便跑 |
| 出网 IP 不被风控 | ❌ 数据中心 IP 常被封 | ⚠️ 选对地区即可 |

所以：**Vercel 只能放前端壳子，引擎必须在一台长开的机器上。** 这台机器可以是云主机（推荐）、也可以是家里的小主机/软路由。

## 1. 买一台（不需要域名）

| 选项 | 价格 | 说明 |
|---|---|---|
| **Oracle Cloud 永久免费**（ARM 4C24G） | ¥0 | 需要信用卡验证；选日本/新加坡区域 |
| RackNerd / CloudCone 年付小鸡 | $12–20/年 | 1C1G 足够，选洛杉矶/圣何塞 |
| 阿里云/腾讯云 轻量（香港/新加坡） | ¥24–60/月 | 延迟低，**站方风控友好** |

> **地区很重要**：优先 日本 / 香港 / 新加坡。欧美机房 IP 更容易触发 418 闸门。
> 如果被封，部署这套件时可以填 `DZMM_PROXY=http://你的代理:端口` 让引擎走代理出网。

## 2. 传文件（本机执行）

```powershell
# 打包（只传必要文件）
$dst = "Z:\project\deploy\data"; New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item Z:\project\accounts.json            "$dst\accounts.json" -Force
Copy-Item Z:\project\captures\site\cards.json "$dst\cards.json"    -Force

# 传到云主机（把 IP 换成你的）
scp -r Z:\project\deploy root@<你的IP>:/root/deploy
```

## 3. 起服务（云主机上执行）

```bash
cd /root/deploy
bash deploy.sh <你的公网IP> lan-4006
```

脚本会做四件事：

1. 装 docker（没有的话）
2. 把纯 IP 转成 `43-198-12-34.sslip.io` —— **sslip.io 是免费通配 DNS，不用买域名**，Let's Encrypt 能给它签证书
3. 生成 `.env`（`SITE_HOST / SITE_PASS / SITE_TOKEN`）
4. `docker compose up -d --build`，起三个容器

跑完直接打印：

```
站点 : https://43-198-12-34.sslip.io
口令 : lan-4006
```

手机浏览器打开这个地址 → 输口令 → 开聊。**你电脑关机也不影响。**

## 4. 三个容器在干什么

```
caddy  :80/:443  → 自动申请证书 + 反代（flush_interval -1，保证 SSE 不被缓冲）
site   :3000     → Next.js standalone，/api/chat 转发到引擎
engine :8787     → 账号池轮换、createByCard、SSE、结算（不对外暴露）
```

`engine` 只在 docker 内网可达，外面扫不到；`/site/chat` 还要 `x-site-token`。

## 5. 日常运维

```bash
docker compose ps                      # 状态
docker compose logs -f engine          # 引擎日志（换号、扣费）
docker compose logs -f site            # 前台日志
docker compose restart site            # 改了口令/令牌后重启前台
docker compose up -d --build           # 改了代码重新构建

# 换口令：改 .env 里的 SITE_PASS，然后
docker compose up -d site
```

账号池数据在 `deploy/data/accounts.json`；引擎的运行态写在 `deploy/data/webstate.json`。
想加号：本机跑完开号流程后，把新的 `accounts.json` 覆盖上去，再 `docker compose restart engine`。

## 6. 没有域名的三种“固定地址”

| 方式 | 地址形态 | 成本 |
|---|---|---|
| **sslip.io**（本方案默认） | `43-198-12-34.sslip.io` | ¥0，自动 HTTPS |
| nip.io | `43.198.12.34.nip.io` | ¥0 |
| 直接 IP + HTTP | `http://43.198.12.34:3000` | ¥0，但没加密、且要开端口 |

## 7. 排错

| 现象 | 原因 | 处理 |
|---|---|---|
| 证书签不下来 | 80 端口没放行 | 云厂商安全组放行 80/443 |
| 页面 502 | site 还没起来 | `docker compose logs -f site` |
| 聊天报「池子暂时没有可用额度」 | 账号全见底 | 补号，覆盖 `accounts.json` |
| 生成报 418 / 403 | 机房 IP 被风控 | `.env` 填 `DZMM_PROXY`，或换地区 |
| 长回复被截断 | 反代缓冲 | 已用 `flush_interval -1`，若换 nginx 记得 `proxy_buffering off` |
