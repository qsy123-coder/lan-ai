#!/usr/bin/env bash
# setup-subdomain.sh —— 在「已有别的项目」的服务器上，把澜·角色对话站挂到子域
#
#   bash setup-subdomain.sh lan.yourdomain.com
#   bash setup-subdomain.sh lan.yourdomain.com --no-cert      # 不想让脚本碰证书
#
# 幂等：重复执行不会重复建容器、不会覆盖已存在的 .env，nginx 配置会先备份。
# 只占 127.0.0.1:18100；不碰 80/443 的其它站点；不加入你已有的 compose 网络。
set -euo pipefail

DOMAIN="${1:-}"
DO_CERT=1
[ "${2:-}" = "--no-cert" ] && DO_CERT=0
if [ -z "$DOMAIN" ]; then
  echo "用法: bash setup-subdomain.sh <子域> [--no-cert]"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m!! %s\033[0m\n" "$*"; }

[ "$(id -u)" = "0" ] || { echo "请用 root 跑（或用 sudo bash $0 $DOMAIN）"; exit 1; }

# ---------- 1. 环境 ----------
say "检查 docker"
if ! command -v docker >/dev/null 2>&1; then
  warn "没装 docker，开始安装"
  curl -fsSL https://get.docker.com | sh
fi
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "缺少 docker compose，请先安装 compose v2"
  exit 1
fi
echo "   compose: $DC"

say "检查端口 18100"
if ss -lnt 2>/dev/null | grep -q ':18100 '; then
  if docker ps --format '{{.Names}}' | grep -q '^lan-site$'; then
    echo "   lan-site 已在跑，继续（会重新构建）"
  else
    echo "!! 18100 被别的进程占用，先腾出来："
    ss -lntp | grep ':18100 ' || true
    exit 1
  fi
else
  echo "   18100 空闲 ✅"
fi

# ---------- 2. 凭证 ----------
say "准备 .env"
if [ ! -f .env ]; then
  SITE_TOKEN="lg-$((RANDOM*RANDOM%900000+100000))"
  SITE_PASS="lan-$((RANDOM%9000+1000))"
  cat > .env <<EOF
SITE_TOKEN=$SITE_TOKEN
SITE_PASS=$SITE_PASS
DZMM_PROXY=
EOF
  echo "   已生成新口令"
else
  echo "   .env 已存在，沿用"
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a

[ -f data/accounts.json ] || { echo "!! 缺 data/accounts.json（账号池），先把它传上来"; exit 1; }
[ -f data/cards.json ]    || { echo "!! 缺 data/cards.json（卡片库），先把它传上来"; exit 1; }

# ---------- 3. 起容器 ----------
say "构建并启动 lan-site / lan-engine"
$DC -f docker-compose.existing.yml up -d --build

say "等待站点健康"
ok=0
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:18100/enter || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 2
done
if [ "$ok" != "1" ]; then
  warn "站点没起来，最近日志："
  $DC -f docker-compose.existing.yml logs --tail=60 lan-site
  exit 1
fi
echo "   127.0.0.1:18100/enter -> 200 ✅"

# ---------- 4. nginx ----------
say "写 nginx 配置"
NGX_CONF_DIR=""
for d in /etc/nginx/conf.d /usr/local/nginx/conf/conf.d /www/server/panel/vhost/nginx; do
  [ -d "$d" ] && NGX_CONF_DIR="$d" && break
done
[ -n "$NGX_CONF_DIR" ] || { warn "没找到 nginx 配置目录，跳过"; NGX_CONF_DIR=""; }

if [ -n "$NGX_CONF_DIR" ]; then
  TARGET="$NGX_CONF_DIR/lan.conf"
  if [ -f "$TARGET" ]; then
    cp -a "$TARGET" "$TARGET.bak.$(date +%Y%m%d%H%M%S)"
    echo "   已备份原配置"
  fi
  cat > "$TARGET" <<EOF
# 澜 · 角色对话站（由 setup-subdomain.sh 生成）
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        proxy_pass http://127.0.0.1:18100;
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection        "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_set_header X-Accel-Buffering no;
    }
}
EOF
  echo "   写入 $TARGET"
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx 2>/dev/null || nginx -s reload
    echo "   nginx 已重载 ✅"
  else
    warn "nginx -t 失败："
    nginx -t || true
    echo "   配置文件留在 $TARGET，修好后 nginx -s reload"
  fi
fi

# ---------- 5. 证书 ----------
if [ "$DO_CERT" = "1" ] && [ -n "$NGX_CONF_DIR" ]; then
  say "申请证书"
  if command -v certbot >/dev/null 2>&1; then
    if certbot --nginx -d "$DOMAIN" --redirect --agree-tos --register-unsafely-without-email --non-interactive; then
      systemctl reload nginx 2>/dev/null || nginx -s reload
      echo "   证书 OK ✅"
    else
      warn "certbot 失败（多半是 DNS 还没生效或 80 端口没通）"
      echo "   DNS: dig +short $DOMAIN  应等于本机公网 IP"
    fi
  else
    warn "没装 certbot（apt install -y certbot python3-certbot-nginx 后可重跑本脚本）"
  fi
fi

# ---------- 6. 自检 ----------
say "自检"
echo -n "   本机 :80  -> "; curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $DOMAIN" http://127.0.0.1/ || true
echo -n "   内网 :18100 -> "; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:18100/enter || true

say "完成"
cat <<EOF

  ┌──────────────────────────────────────────────
  │ 站点   https://$DOMAIN
  │ 口令   $SITE_PASS
  │ 令牌   $SITE_TOKEN
  ├──────────────────────────────────────────────
  │ 日志   $DC -f docker-compose.existing.yml logs -f lan-site
  │ 重启   $DC -f docker-compose.existing.yml restart lan-site
  │ 停机   $DC -f docker-compose.existing.yml down
  └──────────────────────────────────────────────

  手机打开上面的地址，输口令即可。你本机关机也不影响。
EOF
