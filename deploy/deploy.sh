#!/usr/bin/env bash
# deploy.sh —— 在 Ubuntu / Debian 云主机上一键起服务
#
#   bash deploy.sh <你的公网IP或IP.sslip.io> [口令]
#
# 例：bash deploy.sh 43.198.12.34 lan-4006
#     没域名也行：站点会以 https://43-198-12-34.sslip.io 自动签证书
set -euo pipefail

HOST_ARG="${1:-}"
PASS_ARG="${2:-}"
if [ -z "$HOST_ARG" ]; then
  echo "用法: bash deploy.sh <公网IP> [口令]"
  exit 1
fi

# 纯 IP → 转成 sslip.io，让 Let's Encrypt 能签发（无需买域名）
case "$HOST_ARG" in
  *.*[0-9]*) SITE_HOST="${HOST_ARG//./-}.sslip.io" ;;
  *) SITE_HOST="$HOST_ARG" ;;
esac

SITE_PASS="${PASS_ARG:-lan-$(shuf -i 1000-9999 -n 1)}"
SITE_TOKEN="${SITE_TOKEN:-lg-$(shuf -i 100000-999999 -n 1)}"

echo "==> 安装 docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

mkdir -p data
# 账号池与卡片库：从本机带上来（scp 到 deploy/data 后再跑本脚本）
for f in accounts.json cards.json; do
  if [ ! -f "data/$f" ]; then
    echo "!! 缺少 data/$f —— 先从本机拷贝："
    echo "   scp Z:\\project\\${f/accounts/accounts} root@$HOST_ARG:/root/deploy/data/   # accounts.json"
    echo "   scp Z:\\project\\captures\\site\\cards.json root@$HOST_ARG:/root/deploy/data/"
  fi
done

cat > .env <<EOF
SITE_HOST=$SITE_HOST
SITE_PASS=$SITE_PASS
SITE_TOKEN=$SITE_TOKEN
DZMM_PROXY=
EOF

echo "==> 构建并启动"
docker compose up -d --build

echo
echo "================================================"
echo " 站点 : https://$SITE_HOST"
echo " 口令 : $SITE_PASS"
echo " 令牌 : $SITE_TOKEN"
echo " 日志 : docker compose logs -f site engine"
echo "================================================"
