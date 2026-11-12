// scripts/shot-mobile.mjs —— 手机尺寸截图（带口令 cookie）
//   node scripts/shot-mobile.mjs --port 9230 --url https://x/chat?card=1 --cookie "lg_pass=xx" --out a.png --w 390 --h 844
import fs from "node:fs";

const a = process.argv.slice(2);
let port = 9230, url = "", cookie = "", out = "out/m.png", w = 390, h = 844, click = "", pass = "";
for (let i = 0; i < a.length; i++) {
  if (a[i] === "--port") port = Number(a[++i]);
  else if (a[i] === "--url") url = a[++i];
  else if (a[i] === "--cookie") cookie = a[++i];
  else if (a[i] === "--out") out = a[++i];
  else if (a[i] === "--w") w = Number(a[++i]);
  else if (a[i] === "--h") h = Number(a[++i]);
  else if (a[i] === "--click") click = a[++i];
  else if (a[i] === "--pass") pass = a[++i];
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
await call("Emulation.setDeviceMetricsOverride", {
  width: w,
  height: h,
  deviceScaleFactor: 2,
  mobile: true,
});
await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
if (cookie) {
  const cookies = cookie.split(";").map((s) => s.trim()).filter(Boolean).map((kv) => {
    const i = kv.indexOf("=");
    return { name: kv.slice(0, i), value: kv.slice(i + 1), domain: new URL(url).hostname, path: "/", secure: true };
  });
  await call("Network.setCookies", { cookies });
}
await call("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 7000));
if (pass) {
  await call("Runtime.evaluate", {
    expression: `(() => {
      const i = document.querySelector("input[type=password]");
      if (!i) return "no-input";
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      set.call(i, ${JSON.stringify(pass)});
      i.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(() => document.querySelector(".btn-primary")?.click(), 300);
      return "submitted";
    })()`,
    returnByValue: true,
  });
  await new Promise((r) => setTimeout(r, 6000));
}
if (click) {
  await call("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(click)})?.click()`, returnByValue: true });
  await new Promise((r) => setTimeout(r, 900));
}
const info = await call("Runtime.evaluate", {
  expression: `JSON.stringify({w: innerWidth, h: innerHeight, title: document.title,
    composerW: document.querySelector('.composer-inner')?.getBoundingClientRect().width || 0,
    mainW: document.querySelector('.chat-main')?.getBoundingClientRect().width || 0,
    bodyW: document.body.getBoundingClientRect().width})`,
  returnByValue: true,
});
console.log(info.result.value);
const shot = await call("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("saved", out);
ws.close();
