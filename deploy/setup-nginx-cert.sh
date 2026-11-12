#!/usr/bin/env bash
set -euo pipefail
HOST="43-135-10-175.sslip.io"

echo "== nginx 配置 =="
sudo tee /etc/nginx/conf.d/lan.conf >/dev/null <<EOF
# 澜 · 角色对话站（自动生成）
server {
    listen 80;
    server_name $HOST;

    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        proxy_pass http://127.0.0.1:3100;
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
sudo nginx -t
sudo systemctl reload nginx
echo "   nginx ok"

echo "== 安装 certbot =="
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq certbot python3-certbot-nginx

echo "== 申请证书 =="
sudo certbot --nginx -d "$HOST" --redirect --agree-tos \
  --register-unsafely-without-email -n || echo "CERT_FAILED"

sudo systemctl reload nginx || true
echo "== 自检 =="
echo -n "http  : "; curl -s -o /dev/null -w '%{http_code}\n' "http://$HOST/enter" || true
echo -n "https : "; curl -s -o /dev/null -w '%{http_code}\n' "https://$HOST/enter" || true
echo DONE
