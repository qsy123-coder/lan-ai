#!/usr/bin/env bash
set -euo pipefail
cd /opt/lan

if [ ! -f .env ]; then
  cat > .env <<EOF
SITE_TOKEN=lg-$((RANDOM*RANDOM%900000+100000))
SITE_PASS=lan-4006
DZMM_PROXY=
EOF
fi
set -a; . ./.env; set +a

echo "== 写 systemd =="
sudo tee /etc/systemd/system/lan-engine.service >/dev/null <<EOF
[Unit]
Description=Lan engine (dzmm account pool)
After=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/lan
Environment=DZMM_ROOT=/opt/lan
Environment=DZMM_PROXY=$DZMM_PROXY
Environment=SITE_TOKEN=$SITE_TOKEN
ExecStart=/opt/lan/venv/bin/python /opt/lan/engine/server.py --host 127.0.0.1 --port 8787
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/lan-site.service >/dev/null <<EOF
[Unit]
Description=Lan site (Next.js)
After=network-online.target lan-engine.service
Wants=lan-engine.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/lan/site
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=ENGINE_URL=http://127.0.0.1:8787
Environment=SITE_TOKEN=$SITE_TOKEN
Environment=SITE_PASS=$SITE_PASS
Environment=CARDS_FILE=/opt/lan/cards.json
ExecStart=/usr/bin/node /opt/lan/site/node_modules/next/dist/bin/next start -p 3100
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo "== 启动 =="
sudo systemctl daemon-reload
sudo systemctl enable --now lan-engine lan-site >/dev/null 2>&1 || true
sudo systemctl restart lan-engine
sleep 2
sudo systemctl restart lan-site
sleep 4

echo "== 状态 =="
systemctl is-active lan-engine lan-site || true
echo -n "engine health: "; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8787/health || true
echo -n "site /enter : "; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/enter || true
echo -n "pool        : "; curl -s http://127.0.0.1:8787/site/pool | head -c 120; echo
echo
echo "SITE_PASS=$SITE_PASS"
echo "SITE_TOKEN=$SITE_TOKEN"
