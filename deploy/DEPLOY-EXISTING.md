# 部署到「已经跑着别的项目」的机器

> 原则：**不抢端口、不改你现有的反代、不动已有容器**。
> 本方案只做三件事：起两个容器（`lan-engine` / `lan-site`）、占一个回环端口 `127.0.0.1:18100`、写一个独立网络 `lan-net`。

## 1. 先看一眼现状（30 秒）

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'     # 现有容器与端口
ss -lntp | grep -E ':(80|443|3000|8080)\b'            # 谁占着 80/443
```

只要 `18100` 没被占，就不会冲突：

```bash
ss -lntp | grep 18100 || echo "18100 空闲 ✅"
```

## 2. 上传并启动

```bash
# 本机
scp -r Z:\project\deploy root@<你的IP>:/root/lan

# 服务器
cd /root/lan
cat > .env <<'EOF'
SITE_TOKEN=lg-826451
SITE_PASS=lan-4006
DZMM_PROXY=
EOF

docker compose -f docker-compose.existing.yml up -d --build
```

起完检查：

```bash
docker compose -f docker-compose.existing.yml ps
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18100/enter   # 期望 200
```

## 3. 接到你现有的反代（三选一）

### A. nginx / 宝塔

把 `deploy/nginx-lan.conf` 里的 `location /` 段，粘到你现有站点的 server 块里（或给新子域新建一个 server）。

宝塔面板：网站 → 设置 → 反向代理 → 目标 `http://127.0.0.1:18100`，
**务必在「配置文件」里手动加上**：

```nginx
proxy_buffering off;
proxy_read_timeout 300s;
```

### B. Caddy

把 `deploy/caddy-lan.conf` 追加到你的 Caddyfile，`caddy reload`。

### C. 没有反代 / 不想动证书

直接把 compose 里的

```yaml
- "127.0.0.1:18100:3000"
```

改成

```yaml
- "18100:3000"
```

然后手机访问 `http://<你的IP>:18100`。
⚠️ 明文 HTTP：口令会裸奔，只建议临时用；长期请走 A 或 B。

## 4. 没有多余域名的两种干净做法

| 做法 | 地址 | 代价 |
|---|---|---|
| 用**现有域名的子域** | `lan.yourdomain.com` | 加一条 A 记录，证书自动续（免费） |
| **sslip.io** | `43-198-12-34.sslip.io` | 零配置，Caddy 能自动签证书（免费） |

两者都不需要新买域名。

## 5. 资源占用（不会挤到你的项目）

| 容器 | 常驻内存 | CPU |
|---|---|---|
| lan-site (Next.js) | ~120–180 MB | 空闲≈0，生成时短暂峰值 |
| lan-engine (Python) | ~80–120 MB | 空闲≈0，仅请求时占 |

没有数据库、没有 Redis，数据就是 `deploy/data/` 两个 json。

## 6. 与现有服务互不干扰的细节

- 容器名固定 `lan-site` / `lan-engine`，不会和你已有的重名（如重名会直接报错，不会覆盖）
- 独立网络 `lan-net`，不加入你已有的 compose 网络
- 不 publish 引擎端口；站点只绑 `127.0.0.1`
- 日志走 docker 默认，`docker compose logs -f lan-site`

## 7. 停止 / 卸载

```bash
cd /root/lan
docker compose -f docker-compose.existing.yml down      # 停掉，数据保留
docker rmi lan-site:latest lan-engine:latest            # 彻底清掉镜像
rm -rf /root/lan                                        # 删目录
```
