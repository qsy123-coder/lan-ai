# 开发规范执行清单（claude.md §7 / §9 落地版）

> 每次改动前后过一遍。违反任一条，改动不算完成。

## 0. 仓库与部署拓扑

```
Z:\project           <- git 仓库，唯一源码来源（origin: qsy123-coder/lan-ai）
  |-- site/          Next.js 15 前台
  |-- engine/        额度池引擎
  |-- scripts/       抓包 / 重放 / 批量开号
  |-- notes/         每轮结论
  |-- captures/      原始 flow（永不改，不入库）
  \-- out/           缓存与日志（不入库）

         |  scp 部署（不是 git push）

ubuntu@43.135.10.175:/opt/lan/site   <- 构建与运行副本，不是仓库
```

**GitHub 存源码，服务器只负责构建和跑。** 两边不互相同步，靠 `scp` 单向推送。

### 部署三步（缺一步等于没部署）

```powershell
$k = "C:\Users\dsh\lan_key.pem"
$S = "-i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes"

# 1) 传
& scp $S.Split(' ') "Z:\project\site\app\globals.css" ubuntu@43.135.10.175:/tmp/x.css

# 2) 落位 + 校验（scp 会静默失败，必须看 stat）
& ssh -i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes ubuntu@43.135.10.175 `
   "cp /tmp/x.css /opt/lan/site/app/globals.css && stat -c'%s' /opt/lan/site/app/globals.css"

# 3) 构建 + 重启
& ssh -i $k -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes ubuntu@43.135.10.175 `
   "cd /opt/lan/site && npm run build 2>&1 | tail -4 && sudo systemctl restart lan-site"
```

构建要几分钟，用 `run_in_background`。

## 1. 开工前（30 秒）

1. 读 `claude.md` §13 —— 当前结论必须能指回一次真实抓包
2. `git status --short` —— 工作区必须干净，没夹带上一轮的改动
3. 明确这一轮打哪条攻击面（A–H），写进 commit message

## 2. 禁止事项（claude.md §7.4）

- 用截图/记忆替代 `trpc.jsonl` 原始记录
- 没跑 `--dry-run` 就批量写库、批量注册、批量发请求
- 并发从 8 直接拉到 200
- 改动 `captures/` 里的原始 flow
- 引入 §5 未列出的运行时或依赖

## 3. 速率与并发

| 项 | 限制 |
|---|---|
| 单账号 | <= 2 rps |
| 并发实验 | 8 -> 12 -> 16 逐级，单轮 <= 16、<= 30s |
| 轮间冷却 | >= 60s |
| 枚举 | <= 1 rps，且带 `chosen_language` / `_geo` cookie |

**失败即停**：`403` + `cf-mitigated`、`x-dzmm-captcha-required: 1`、连续 5 次 `429`
-> 立刻停手，切节点 / 换 profile / 降速。

## 4. 前端专项（§27 事故换来的）

### 4.1 结构与性能分开提交

为提速顺手换首页 JSX 树 + 删 400 行 CSS，导致首页布局整个丢失。
**结构改动和性能改动永远分开 commit。**

### 4.2 删 CSS 前先扫引用

```bash
for c in $(grep -rho 'className="[a-zA-Z0-9_-]*"' site/components/*.jsx site/app/**/*.js | cut -d'"' -f2 | sort -u); do
  n=$(grep -c "\.$c" site/app/globals.css)
  [ "$n" = "0" ] && echo "未被引用: $c"
done
```

### 4.3 JSX 里直接写汉字

```jsx
<span>\u89d2\u8272</span>          // X  屏幕显示 "\u89d2\u8272"
<span>{"\u89d2\u8272"}</span>      // OK 花括号里才是 JS 字符串
<span>角色</span>                    // OK 最省事
```

`\uXXXX` 只在 JS 字符串里解析。写在 JSX 文本节点里会原样输出。

### 4.4 改完 CSS 必查括号平衡

```bash
awk '{o+=gsub(/{/,"{"); c+=gsub(/}/,"}")} END{print "braces:", o, c}' site/app/globals.css
```

不等就是块被删坏了，别构建。

### 4.5 构建后必验结构块计数

```bash
curl -sS -H "cookie: $PW" http://127.0.0.1:3100/ | grep -o 'home-grid\|zc-title\|zc-foot' | sort | uniq -c
```

只看 build 通过不算验证。

### 4.6 PowerShell 路径含 `[id]`

```powershell
Copy-Item -LiteralPath "Z:\project\site\app\card\[id]\page.js" -Destination $dst
```

不加 `-LiteralPath` 会被当通配符，写出 0 字节文件。

### 4.7 将本地改动同步回仓库

`Z:` 是 UNC 共享，`write` / `edit` 工具会报 `EISDIR`。用 Python 写：

```python
import io, shutil
shutil.copy2(r"C:\Users\dsh\dzmm-src\Nav_v4.jsx", r"Z:\project\site\components\Nav.jsx")
```

## 5. 提交前

```bash
# 凭证硬检查（路径匹配，别用子串，否则 about/page.js 会误伤 out/）
git ls-files | while read -r f; do
  case "$f" in
    */accounts.json|accounts.json|accounts.md|*.env|.env) echo "!! $f" ;;
    *.pem|*.key|*.p12|*.pfx|*/cookies/*|*/captures/*)     echo "!! $f" ;;
    out/*|*/out/*|*/node_modules/*|*/venv/*)               echo "!! $f" ;;
  esac
done
```

## 6. 提交信息格式

```
<type>: <中文一句话>

- 具体改了什么
- 为什么这么改
- 验证方式与结果

Refs: notes/NNN
```

`type` ∈ `feat` / `fix` / `chore` / `docs` / `refactor` / `perf`

## 7. 回滚

```bash
git checkout -- site/app/page.js      # 单文件
git revert <sha> --no-edit            # 整提交

# 已部署未提交
scp backup/page.js ubuntu@43.135.10.175:/opt/lan/site/app/page.js
ssh ... "sudo systemctl restart lan-site"
```

## 8. 环境事实

```powershell
$PY   = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
$NODE = "C:\Users\dsh\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$GIT  = "C:\Program Files\Git\cmd\git.exe"     # 2.56.1，全局已配代理 7897
```

- 代理：`http://127.0.0.1:7897`（Clash 混合端口，系统代理关闭，必须显式走）
- 服务器：`ubuntu@43.135.10.175`，key `C:\Users\dsh\lan_key.pem`
- `lan-site.service` -> `/opt/lan/site`，`next start -p 3100`
- `lan-engine.service` -> `/opt/lan/engine/server.py --port 8787`
- **别动 `aetouban.cn`**（占 :3000 的 `ae-headline.service`）
- Next.js 无法在 `Z:` (UNC) 构建 —— 必须在服务器上 build

## 9. 占位符表（claude.md §16）

| 占位符 | 含义 | 取值 |
|---|---|---|
| `TARGET` | 站点根 | `https://www.dzmm.ai` |
| `PROC` | tRPC procedure | `captures/*/trpc.jsonl` 的 `path` |
| `COOKIE` | 登录态 | DevTools -> Cookies 整串 |
| `PATH` | 接口路径 | 含 query，原样复制 |
| `BODY` | 请求体 | `notes/<proc>.body.json` |
| `CONCURRENCY` | 并发数 | 8 / 12 / 16 |
| `RATE` | 每秒请求 | <= 2 |
| `RESULT_LOG` | 结果落盘 | `out/<日期>-<proc>.jsonl` |
