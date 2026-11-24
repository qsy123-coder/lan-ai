@echo off
cd /d "%~dp0"
set DZMM_PROXY=http://127.0.0.1:7897
python -u openai_proxy.py 8787
pause
