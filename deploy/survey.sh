#!/usr/bin/env bash
echo '--NODE--'
node -v 2>/dev/null || echo none
npm -v 2>/dev/null || echo none
command -v node npm 2>/dev/null
echo '--PY--'
python3 -V
python3 -m pip -V 2>/dev/null | head -1 || echo 'no pip'
echo '--VENV--'
python3 -c 'import venv; print("venv ok")'
echo '--CERTBOT--'
certbot --version 2>/dev/null || echo none
echo '--SITES--'
ls /etc/nginx/sites-enabled/ 2>/dev/null
echo '--CONFD--'
ls /etc/nginx/conf.d/ 2>/dev/null
echo '--PORT3000--'
sudo -n ss -lntp 2>/dev/null | grep ':3000 ' || echo 'free'
echo '--SWAP--'
free -m | tail -2
echo '--SERVICES--'
systemctl list-units --type=service --state=running --no-pager 2>/dev/null | grep -Ei 'next|node|nginx|pm2' || true
