// scripts/shot-full.mjs —— 整页截图（可带 cookie、可点掉弹窗）
//   node scripts/shot-full.mjs --port 9250 --url https://www.dzmm.ai/ --cookie "..." --out a.png --w 1440 [--click ".sel"] [--full]
import fs from "node:fs";

const a = process.argv.slice(2);
let port = 9250, url = "", cookie = "", out = "out/full.png", w = 1440, h = 1000;
let click = "", full = false;
for (let i = 0; i < a.length; i++) {
  if (a[i] === "--port") port = Number(a[++i]);
  else if (a[i] === "--url") url = a[++i];
  else if (a[i] === "--cookie") cookie = a[++i];
  else if (a[i] === "--out") out = a[++i];
  else if (a[i] === "--w") w = Number(a[++i]);
  else if (a[i] === "--h") h = Number(a[++i]);
  else if (a[i] === "--click") click = a[++i];
  else if (a[i] === "--full") full = true;
}

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === "page");
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

await call("Page.enable");
await call("Network.enable");
await call("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });

if (cookie) {
  const host = new URL(url).hostname;
  const cookies = cookie.split(";").map((s) => s.trim()).filter(Boolean).map((kv) => {
    const i = kv.indexOf("=");
    return { name: kv.slice(0, i), value: kv.slice(i + 1), domain: "." + host.replace(/^www\./, ""), path: "/", secure: true };
  });
  await call("Network.setCookies", { cookies });
}

await call("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 7000));

if (click) {
  for (const sel of click.split("|")) {
    await call("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(sel)})?.click()`,
      returnByValue: true,
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
  }
  await new Promise((r) => setTimeout(r, 2500));
}

let shotParams = { format: "png" };
if (full) {
  const m = await call("Page.getLayoutMetrics");
  const c = m.cssContentSize || m.contentSize;
  shotParams = { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(c.height, 12000), scale: 1 } };
  console.log("content size:", c.width, "x", c.height);
}
const shot = await call("Page.captureScreenshot", shotParams);
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("saved", out);
ws.close();
