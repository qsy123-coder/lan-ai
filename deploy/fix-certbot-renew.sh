#!/usr/bin/env bash
set -euo pipefail
# 1) 让 certbot 的系统服务绕开 /usr/local 里 pip 装的 urllib3（否则 90 天后续期会失败）
sudo mkdir -p /etc/systemd/system/certbot.service.d
sudo tee /etc/systemd/system/certbot.service.d/override.conf >/dev/null <<'EOF'
[Service]
Environment=PYTHONPATH=/usr/lib/python3/dist-packages
EOF
sudo systemctl daemon-reload

# 2) 续期演练
echo "== renew --dry-run =="
sudo env PYTHONPATH=/usr/lib/python3/dist-packages /usr/bin/certbot renew --dry-run 2>&1 | tail -6 || true

# 3) 看续期定时器
echo "== timer =="
systemctl list-timers certbot.timer --no-pager 2>/dev/null | head -3 || echo "no timer"

# 4) 打开（如果存在）
sudo systemctl enable --now certbot.timer 2>/dev/null || true
echo DONE
