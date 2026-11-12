#!/usr/bin/env bash
set -euo pipefail
cd /opt/lan

echo "== 1/4 Python venv =="
python3 -m venv venv
./venv/bin/pip install -q --upgrade pip setuptools wheel
./venv/bin/pip install -q "curl_cffi==0.17.0"
./venv/bin/python -c "import curl_cffi; print('curl_cffi', curl_cffi.__version__)"

echo "== 2/4 npm install =="
cd site
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS=--max-old-space-size=1024
npm install --no-audit --no-fund --loglevel=error

echo "== 3/4 next build =="
npm run build

echo "== 4/4 done =="
du -sh /opt/lan
