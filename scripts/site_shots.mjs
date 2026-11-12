// scripts/site_shots.mjs —— 用 CDP 打开 dzmm 站点，逐路由截图 + 记录真实请求
//
// 先起浏览器（独立 profile + 调试端口）:
//   msedge --headless=new --remote-debugging-port=9222 --user-data-dir=%TEMP%\dzmm-shot about:blank
//
// 再跑:
//   node scripts/site_shots.mjs --port 9222 --outdir out/site
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
let port = 9222, outdir = "out/site", cookie = "";
const routes = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--port") port = Number(argv[++i]);
  else if (argv[i] === "--outdir") outdir = argv[++i];
  else if (argv[i] === "--cookie") cookie = argv[++i];
  else routes.push(argv[i]);
}
if (!routes.length) routes.push("/");

fs.mkdirSync(outdir, { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === "page");
if (!page) { console.error("no page target"); process.exit(2); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];
const call = (method, params = {}) =>
  new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
  } else if (m.method) {
    events.push(m);
  }
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

await call("Page.enable");
await call("Network.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false,
});

if (cookie) {
  const cookies = cookie.split(";").map((s) => s.trim()).filter(Boolean).map((kv) => {
    const i = kv.indexOf("=");
    return {
      name: kv.slice(0, i),
      value: kv.slice(i + 1),
      domain: ".dzmm.ai",
      path: "/",
      secure: true,
      httpOnly: false,
    };
  });
  await call("Network.setCookies", { cookies });
  console.log("cookies set:", cookies.length);
}

const summary = {};
for (const r of routes) {
  events.length = 0;
  const url = r.startsWith("http") ? r : "https://www.dzmm.ai" + r;
  try {
    await call("Page.navigate", { url });
  } catch (e) {
    summary[r] = { error: String(e).slice(0, 120) };
    continue;
  }
  await new Promise((res) => setTimeout(res, 6000));

  const reqs = events
    .filter((e) => e.method === "Network.requestWillBeSent")
    .map((e) => e.params.request.url)
    .filter((u) => u.includes("/api/") || u.includes("/ws/"))
    .map((u) => u.replace("https://www.dzmm.ai", "").slice(0, 220));

  let info = {};
  try {
    const ev = await call("Runtime.evaluate", {
      expression: `(() => {
        const t = document.title;
        const txt = (document.body.innerText || '').replace(/\\n{2,}/g, '\\n').slice(0, 900);
        const imgs = [...document.images].map(i => i.src).slice(0, 8);
        return { title: t, url: location.href, text: txt, imgs, nodes: document.querySelectorAll('*').length };
      })()`,
      returnByValue: true,
    });
    info = ev.result?.value || {};
  } catch (e) {
    info = { error: String(e).slice(0, 120) };
  }

  const name = (r === "/" ? "home" : r.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")) || "root";
  try {
    const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(path.join(outdir, name + ".png"), Buffer.from(shot.data, "base64"));
  } catch {}

  summary[r] = {
    title: info.title, url: info.url, nodes: info.nodes,
    text: (info.text || "").slice(0, 400),
    imgCount: (info.imgs || []).length,
    api: [...new Set(reqs)].slice(0, 40),
    shot: path.join(outdir, name + ".png"),
  };
  console.log("—", r, "→", info.title, "| api:", new Set(reqs).size);
}

fs.writeFileSync(path.join(outdir, "_summary.json"), JSON.stringify(summary, null, 1));
console.log("written", path.join(outdir, "_summary.json"));
ws.close();
