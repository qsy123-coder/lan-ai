// scripts/replay.mjs —— node replay.mjs <path> <cookie> [bodyFile]
import fs from "node:fs";
import crypto from "node:crypto";

const [path, cookie, bodyFile] = process.argv.slice(2);
if (!path || !cookie) {
  console.error("usage: node replay.mjs <path> <cookie> [bodyFile]");
  process.exit(2);
}
const body = bodyFile ? fs.readFileSync(bodyFile, "utf8") : undefined;

const res = await fetch("https://www.dzmm.ai" + path, {
  method: body ? "POST" : "GET",
  headers: {
    "content-type": "application/json",
    "cookie": cookie,
    "x-dzmm-client": process.env.DZMM_CLIENT || "web",
    "x-dzmm-request-id": crypto.randomUUID(),
    "x-dzmm-locale": "zh-CN",
    "origin": "https://www.dzmm.ai",
    "referer": "https://www.dzmm.ai/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  },
  body,
});

const hdrs = [...res.headers].filter(([k]) => k.startsWith("x-dzmm"));
console.log(res.status, Object.fromEntries(hdrs));
const text = await res.text();
fs.mkdirSync("out", { recursive: true });
fs.appendFileSync(
  "out/replay.jsonl",
  JSON.stringify({ t: Date.now(), path, status: res.status, body: text.slice(0, 20000) }) + "\n",
  "utf8"
);
console.log(text.slice(0, 4000));
