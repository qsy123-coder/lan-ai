// scripts/shot-chat.mjs —— 对话页/任意站内页 手机或桌面截图（CDP）
//
// 前置：起一个带调试端口的 Chrome/Edge
//   chrome --headless=new --remote-debugging-port=9230 --user-data-dir=%TEMP%\lan-shot about:blank
//
// 用法：
//   node scripts/shot-chat.mjs --url "http://127.0.0.1:3100/chat?card=3821218" \
//     --cookie "lg_pass=xx" --out out/shots/a.png --w 390 --h 844 --scale 1 \
//     [--theme dark] [--eval "js"] [--click "js"] [--wait 3000] [--full]
import fs from "node:fs";
import path from "node:path";

const a = process.argv.slice(2);
let port = 9230, url = "", cookie = "", out = "out/shots/shot.png";
let w = 390, h = 844, scale = 1, theme = "", evalJs = "", clickJs = "", wait = 6500, full = false;
let seed = "";
for (let i = 0; i < a.length; i++) {
  const v = a[i];
  if (v === "--port") port = Number(a[++i]);
  else if (v === "--url") url = a[++i];
  else if (v === "--cookie") cookie = a[++i];
  else if (v === "--out") out = a[++i];
  else if (v === "--w") w = Number(a[++i]);
  else if (v === "--h") h = Number(a[++i]);
  else if (v === "--scale") scale = Number(a[++i]);
  else if (v === "--theme") theme = a[++i];
  else if (v === "--eval") evalJs = a[++i];
  else if (v === "--eval-file") evalJs = fs.readFileSync(a[++i], "utf8");
  else if (v === "--click") clickJs = a[++i];
  else if (v === "--wait") wait = Number(a[++i]);
  else if (v === "--seed") seed = a[++i];
  else if (v === "--full") full = true;
}
if (!url) { console.error("--url required"); process.exit(2); }
fs.mkdirSync(path.dirname(out), { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === "page");
if (!page) { console.error("no page target"); process.exit(2); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pend = new Map();
const call = (m, p = {}) =>
  new Promise((res, rej) => {
    const mid = ++id;
    pend.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  const p = pend.get(msg.id);
  if (!p) return;
  pend.delete(msg.id);
  msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result);
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

const evaluate = async (expression) => {
  const r = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return { error: r.exceptionDetails.exception?.description || "err" };
  return r.result?.value;
};

await call("Page.enable");
await call("Network.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: w, height: h, deviceScaleFactor: scale, mobile: w < 900,
});
if (w < 900) await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

if (theme) {
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `try{localStorage.setItem('theme','${theme}');document.documentElement.dataset.theme='${theme}';}catch(e){}`,
  });
}

if (seed) {
  const src = fs.readFileSync(seed, "utf8");
  await call("Page.addScriptToEvaluateOnNewDocument", { source: src });
}

if (cookie) {
  const host = new URL(url).hostname;
  const cookies = cookie.split(";").map((s) => s.trim()).filter(Boolean).map((kv) => {
    const i = kv.indexOf("=");
    return { name: kv.slice(0, i), value: kv.slice(i + 1), domain: host, path: "/", secure: false };
  });
  await call("Network.setCookies", { cookies });
}

await call("Page.navigate", { url });
await new Promise((r) => setTimeout(r, wait));

if (clickJs) {
  await evaluate(clickJs);
  await new Promise((r) => setTimeout(r, 800));
}
if (evalJs) {
  const v = await evaluate(evalJs);
  console.log("eval:", typeof v === "string" ? v : JSON.stringify(v));
  await new Promise((r) => setTimeout(r, 500));
}

const info = await evaluate(`JSON.stringify({
  vw: innerWidth, vh: innerHeight,
  theme: document.documentElement.dataset.theme || 'light',
  head: document.querySelector('.chat-head')?.getBoundingClientRect().height || 0,
  msgs: document.querySelector('.msgs')?.getBoundingClientRect().height || 0,
  composer: document.querySelector('.composer')?.getBoundingClientRect().height || 0,
  bodyW: document.body.getBoundingClientRect().width,
  scrollW: document.documentElement.scrollWidth,
  title: document.title
})`);
console.log(info);

const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("saved", out);
ws.close();
