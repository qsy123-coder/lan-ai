# 裸机部署（无 docker，IP:端口直连）

> 2026-11-13 实测跑通。适用：目标机器**已经跑着别的项目**（有 nginx、有 PostgreSQL、
> 没有 docker），你不想装 docker 也不想抢 80/443。
>
> 实际部署：`http://45.135.119.204:18100`（Apache 云 HK，Ubuntu 22.04，2G 内存）

## 0. 为什么不用 docker

目标机器 `45.135.119.204` 的现状：

| 项 | 值 |
|---|---|
| 系统 | Ubuntu 22.04.3 LTS |
| 内存 | 1963 MB（已用 548，可用 1159） |
| nginx | 1.18，占着 `80/443`，跑 `go.sunnyrose.xyz`（另一项目） |
| docker | **未安装** |
| node | v22.14.0（`/usr/local/bin/node`） |
| python | 3.10.12 |

装 docker 要多吃 200–300MB，而这台只有 2G。所以直接用 systemd + venv。

## 1. 端口分配

| 服务 | 端口 | 绑定 | 对外 |
|---|---|---|---|
| `lan-site`（Next.js） | `18100` | `0.0.0.0` | ✅ 手机直接访问 |
| `lan-engine`（Python） | `18101` | `127.0.0.1` | ❌ 仅回环，靠 `x-site-token` |

选 18100/18101 的原因：避开 nginx 的 80/443、避开常见 3000/8080，且 18100 当时空闲。

## 2. 一键部署

```powershell
# 本机（Windows）
powershell -ExecutionPolicy Bypass -File deploy\bare-metal.ps1 `
  -Server root@45.135.119.204 -Port 28822 `
  -Key "$env:USERPROFILE\.ssh\wavemod_hk"
```

脚本做 7 件事：

1. 打包 `site/`（排除 node_modules/.next）+ `engine/server.py` + `data/`
2. tar 上传解包到 `/root/lan`
3. `python3 -m venv` + 装 `curl_cffi`
4. `npm install` + `npm run build`
5. 写 `.env`（SITE_PASS / SITE_TOKEN）
6. 装两个 systemd 单元并 `enable`（开机自启）
7. 自检：端口监听、`/health`、`/enter`、外部可达

## 3. 服务器上的文件布局

```
/root/lan/
├── accounts.json  -> data/accounts.json    # 符号链接，引擎按 DZMM_ROOT 找
├── cards.json     -> data/cards.json
├── out/
│   └── webstate.json -> data/webstate.json # 引擎运行态
├── data/                                   # 真实数据（从本机传来）
│   ├── accounts.json
│   ├── cards.json
│   ├── webstate.json
│   ├── site_pass.txt
│   └── site_token.txt
├── engine/server.py
├── site/                                   # Next.js 源码 + .next 构建产物
├── .venv/                                  # Python 环境
├── .env                                    # SITE_PASS / SITE_TOKEN
└── logs/{engine,site}.log
```

**关键**：引擎代码里写死 `ROOT/accounts.json` 和 `ROOT/out/webstate.json`，
而数据放在 `data/`，所以必须建符号链接，否则号池读出来是 `count: 0`。

## 4. systemd 单元

`lan-engine.service`：

```ini
[Service]
WorkingDirectory=/root/lan
Environment=DZMM_ROOT=/root/lan
Environment=DZMM_PROXY=
ExecStart=/root/lan/.venv/bin/python /root/lan/engine/server.py --port 18101
Restart=always
```

> `DZMM_PROXY=` 必须显式置空。引擎默认值 `http://127.0.0.1:7897` 是本机 Clash 端口，
> 服务器上没有，不清空会导致所有出网请求失败。服务器本身能直连 dzmm.ai。

`lan-site.service`：

```ini
[Service]
WorkingDirectory=/root/lan/site
Environment=ENGINE_URL=http://127.0.0.1:18101
Environment=CARDS_FILE=/root/lan/data/cards.json
EnvironmentFile=/root/lan/.env
ExecStart=/usr/local/bin/node /root/lan/site/node_modules/next/dist/bin/next start -H 0.0.0.0 -p 18100
Restart=always
```

> node 路径是 `/usr/local/bin/node`（不是 `/usr/bin/node`），写错会 `status=203/EXEC`。

## 5. 日常运维

```bash
systemctl status lan-engine lan-site
systemctl restart lan-site          # 改了前端
systemctl restart lan-engine        # 改了引擎/换号
journalctl -u lan-site -n 50        # 或 tail /root/lan/logs/site.log

# 换口令
vi /root/lan/.env                   # 改 SITE_PASS
systemctl restart lan-site
```

## 6. 更新代码

```powershell
# 本机改完代码后，重跑部署脚本（会覆盖 /root/lan 的源码并重新构建）
powershell -ExecutionPolicy Bypass -File deploy\bare-metal.ps1 -Server root@45.135.119.204 -Port 28822 -Key "$env:USERPROFILE\.ssh\wavemod_hk"
```

`data/` 不在覆盖范围内，账号池不会丢。

## 7. 加号

```powershell
scp -P 28822 -i $env:USERPROFILE\.ssh\wavemod_hk accounts.json root@45.135.119.204:/root/lan/data/accounts.json
ssh -p 28822 -i $env:USERPROFILE\.ssh\wavemod_hk root@45.135.119.204 "systemctl restart lan-engine"
```

## 8. 排错

| 现象 | 原因 | 处理 |
|---|---|---|
| `/api/pool` 返回 `count: 0` | 引擎找不到 accounts.json | 检查 `/root/lan/accounts.json` 符号链接 |
| 生成报 `bad_request` | 代理连不上 | `.env`/service 里 `DZMM_PROXY=` 置空 |
| site `status=203/EXEC` | node 路径错 | 改成 `/usr/local/bin/node` |
| 外部访问超时 | 云安全组没放行 | 控制台放行 TCP 18100 |
| `Could not resolve host` | 服务器 DNS 问题 | `cat /etc/resolv.conf`，改用 8.8.8.8 |

## 9. 卸载

```bash
systemctl disable --now lan-site lan-engine
rm -f /etc/systemd/system/lan-{site,engine}.service
rm -f /etc/logrotate.d/lan
systemctl daemon-reload
rm -rf /root/lan
```
