// scripts/cdp.mjs —— 通过 Edge 远程调试端口操作页面（自带登录态）
//
// 用法:
//   node scripts/cdp.mjs "document.title"
//   node scripts/cdp.mjs --file probe.js
//   node scripts/cdp.mjs --list
//   node scripts/cdp.mjs --goto "https://www.dzmm.ai/chat?c=<id>" --wait 8000 "location.href"
//   node scripts/cdp.mjs --hook --goto "https://www.dzmm.ai/chat?c=<id>" --wait 8000 "JSON.stringify(window.__log)"
//
//   --hook   在页面脚本执行前注入请求记录器（fetch + XHR），结果在 window.__log
import fs from "node:fs";

const argv = process.argv.slice(2);
let port = 9222;
let urlMatch = "dzmm.ai";
let expr = null;
let file = null;
let listOnly = false;
let gotoUrl = null;
let waitMs = 0;
let hook = false;
let cookies = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--port") port = Number(argv[++i]);
  else if (a === "--url") urlMatch = argv[++i];
  else if (a === "--file") file = argv[++i];
  else if (a === "--list") listOnly = true;
  else if (a === "--goto") gotoUrl = argv[++i];
  else if (a === "--wait") waitMs = Number(argv[++i]);
  else if (a === "--hook") hook = true;
  else if (a === "--cookies") cookies = true;
  else if (a === "--") expr = argv.slice(i + 1).join(" ");
  else expr = expr ? expr + " " + a : a;
}

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const pages = targets.filter((t) => t.type === "page");
if (listOnly) {
  for (const t of pages) console.log(`${t.url}\n  ${t.webSocketDebuggerUrl}`);
  process.exit(0);
}
const target = pages.find((t) => t.url.includes(urlMatch)) || pages[0];
if (!target) {
  console.error("no target matching", urlMatch);
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  const p = pending.get(msg.id);
  if (!p) return;
  pending.delete(msg.id);
  if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
  else p.resolve(msg.result);
});

await new Promise((r) => ws.addEventListener("open", r, { once: true }));
await call("Runtime.enable");
await call("Page.enable");

if (cookies) {
  const jar = await call("Network.getAllCookies");
  const list = (jar.cookies || []).filter((c) => (c.domain || "").includes("dzmm.ai"));
  console.log(JSON.stringify(list.map((c) => ({ name: c.name, value: c.value, domain: c.domain }))));
  console.log("COOKIE_HEADER=" + list.map((c) => c.name + "=" + c.value).join("; "));
  ws.close();
  process.exit(0);
}

if (hook) {
  const hookSrc = `(() => {
    window.__log = [];
    const rec = (kind, url, init) => {
      try {
        let body = null;
        if (init && init.body) body = typeof init.body === 'string' ? init.body.slice(0, 3000) : '<non-string>';
        window.__log.push({ t: Date.now(), kind, url: String(url).slice(0, 300), method: (init && init.method) || 'GET', body });
      } catch (e) {}
    };
    const of = window.fetch;
    window.fetch = function (input, init) {
      rec('fetch', input && input.url ? input.url : input, init);
      return of.apply(this, arguments);
    };
    const oo = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u) {
      rec('xhr', u, { method: m });
      this.addEventListener('load', () => window.__log.push({ t: Date.now(), kind: 'xhr-load', url: String(u).slice(0,300), status: this.status }));
      return oo.apply(this, arguments);
    };
  })();`;
  await call("Page.addScriptToEvaluateOnNewDocument", { source: hookSrc });
}

if (gotoUrl) {
  await call("Page.navigate", { url: gotoUrl });
  await new Promise((r) => setTimeout(r, 1200));
}
if (waitMs) await new Promise((r) => setTimeout(r, waitMs));

if (file) expr = fs.readFileSync(file, "utf8");
if (!expr) {
  ws.close();
  process.exit(0);
}
const res = await call("Runtime.evaluate", {
  expression: expr,
  awaitPromise: true,
  returnByValue: true,
  userGesture: true,
});
if (res.exceptionDetails) {
  console.error("EXCEPTION:", res.exceptionDetails.exception?.description || JSON.stringify(res.exceptionDetails));
  ws.close();
  process.exit(1);
}
const out = res.result?.value;
console.log(typeof out === "string" ? out : JSON.stringify(out, null, 1));
ws.close();
