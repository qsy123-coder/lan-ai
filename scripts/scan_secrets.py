#!/usr/bin/env python3
"""提交前凭证扫描：只扫 git 已跟踪文件（= 将要推送的内容）。

用法：
    python scripts/scan_secrets.py            # 高危命中即退出码 1
    python scripts/scan_secrets.py --strict   # 中危（password/uuid 赋值）也算失败
    python scripts/scan_secrets.py --all      # 连工作区未跟踪文件一起扫（排除 .git/out/）

高危：JWT、Bearer 长 token、云 key（sk-/AKIA/ghp_/xox）、Supabase 认证 cookie、长 Cookie 头。
中危：password/uuid 赋值、Set-Cookie 长值 —— 多为代码/文案误报，需人工看一眼。

退出码：0 通过；1 有命中；2 运行错误。
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

SKIP_EXT = re.compile(
    r'(?i)\.(png|jpe?g|gif|ico|webp|woff2?|ttf|otf|eot|zip|gz|xz|7z|rar|pdf|'
    r'pyc|pyo|so|dll|exe|bin|wasm|mp4|mp3|wav|flow|har)$'
)
SKIP_DIR = re.compile(r'(^|/)(\.git|node_modules|\.next|out|captures|patches|wordlists)/')

HIGH = {
    'jwt': re.compile(r'eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}'),
    'bearer': re.compile(r'(?i)authorization\s*[:=]\s*["\']?bearer\s+[A-Za-z0-9._\-]{20,}'),
    'cloud_key': re.compile(
        r'\b(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,})'
    ),
    'sb_auth_cookie': re.compile(
        r'sb-[a-z0-9\-]{6,}-auth-token["\']?\s*[:=]\s*["\']?[A-Za-z0-9._\-%]{40,}'
    ),
    'long_cookie_header': re.compile(r'(?i)(?:set-)?cookie["\']?\s*:\s*["\'][^"\']{80,}'),
}

MED = {
    'password_assign': re.compile(r'(?i)["\']?password["\']?\s*[:=]\s*["\']?([^\s"\'{},;)]{8,})'),
    'uuid_assign': re.compile(
        r'(?i)\buuid\s*[:=]\s*["\']?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
    ),
    # 关键字用非捕获组，group(1) 必须是「值」，否则 looks_like_secret 会去判关键字
    'proxy_secret': re.compile(
        r'(?i)\b(?:password|psk|auth-str|obfs-password|uuid)\s*:\s*([^\s{},]{6,})'
    ),
}

# 明显不是凭证的字面量（占位符、属性访问、环境变量名）
SAFE_VALUES = {
    'password', 'new-password', 'newpassword', 'user_pwd', 'passwordinfo',
    'payload[', '%filtered%', 'null', 'undefined', 'none', 'true', 'false',
    'password:', 'passwordinfo', 'e.password', 'n.password', 'user_password',
}
IDENT = re.compile(r'^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$')
LITERAL = re.compile(r'^[A-Za-z0-9._\-@#!$%^&*+=/]{8,}$')
CODEY = re.compile(r'[()\[\]{}`]|==|=>|\|\||&&|\?|,|\b(substring|find|substr|split)\b')


def looks_like_secret(value: str) -> bool:
    """密码类字面量判定：标识符 / 属性访问 / 占位符 / JS 表达式都不算。

    真凭证（hysteria2 password、vmess uuid、订阅 token）特征是纯字面量且含数字，
    或长度 >= 12 且大小写混合。
    """
    v = value.strip().strip('"\'')
    if len(v) < 8 or v.lower() in SAFE_VALUES:
        return False
    if CODEY.search(v) or IDENT.match(v):
        return False
    if not LITERAL.match(v):
        return False
    if re.search(r'[0-9]', v):
        return True
    return len(v) >= 12 and any(c.islower() for c in v) and any(c.isupper() for c in v)


def tracked_files() -> list[str]:
    out = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, encoding='utf-8')
    if out.returncode != 0:
        raise SystemExit(f'git ls-files 失败: {out.stderr.strip()}')
    return [f for f in out.stdout.splitlines() if f.strip()]


def walk_files() -> list[str]:
    root = Path('.')
    files = []
    for p in root.rglob('*'):
        if not p.is_file():
            continue
        rel = p.as_posix()
        if SKIP_DIR.search(rel) or SKIP_EXT.search(rel):
            continue
        files.append(rel)
    return sorted(files)


def scan(files: list[str], strict: bool) -> int:
    high_hits: list[tuple[str, str, int, str]] = []
    med_hits: list[tuple[str, str, int, str]] = []
    for rel in files:
        if SKIP_EXT.search(rel):
            continue
        try:
            text = Path(rel).read_text(encoding='utf-8', errors='replace')
        except OSError:
            continue
        if '\x00' in text[:4096]:
            continue
        for name, pat in HIGH.items():
            for m in pat.finditer(text):
                high_hits.append((name, rel, text[:m.start()].count('\n') + 1, m.group(0)[:60]))
        for name, pat in MED.items():
            for m in pat.finditer(text):
                if not looks_like_secret(m.group(1)):
                    continue
                med_hits.append((name, rel, text[:m.start()].count('\n') + 1, m.group(0)[:60]))

    print(f'scan files: {len(files)}')
    for label, hits in (('HIGH', high_hits), ('MED', med_hits)):
        print(f'== {label}: {len(hits)} hit(s)')
        for name, rel, line, snippet in hits[:200]:
            print(f'   [{name}] {rel}:{line}  {snippet}')
        if len(hits) > 200:
            print(f'   ... 还有 {len(hits) - 200} 条')

    if high_hits:
        return 1
    if strict and med_hits:
        return 1
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description='提交前凭证扫描')
    ap.add_argument('--strict', action='store_true', help='中危命中也算失败')
    ap.add_argument('--all', action='store_true', help='扫描工作区全部文件（含未跟踪）')
    args = ap.parse_args()
    try:
        files = walk_files() if args.all else tracked_files()
    except SystemExit as e:
        print(e, file=sys.stderr)
        return 2
    return scan(files, args.strict)


if __name__ == '__main__':
    sys.exit(main())
