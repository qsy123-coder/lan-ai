// scripts/shot.mjs —— 连到已开的调试端口，截当前页
//   node scripts/shot.mjs --port 9223 --out out/site/x.png
import fs from "node:fs";

const argv = process.argv.slice(2);
let port = 9223, out = "out/shot.png";
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--port") port = Number(argv[++i]);
  else if (argv[i] === "--out") out = argv[++i];
}

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === "page");
if (!page) { console.error("no page"); process.exit(2); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const call = (m, p = {}) =>
  new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  const p = pending.get(msg.id);
  if (!p) return;
  pending.delete(msg.id);
  msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result);
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
await call("Page.enable");
const shot = await call("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("saved", out);
ws.close();
