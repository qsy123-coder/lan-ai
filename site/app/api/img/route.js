import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import dns from "node:dns";

export const dynamic = "force-dynamic";

// 默认落到本机临时目录；Linux 部署可用 IMG_CACHE 指到 /opt/lan/imgcache。
const CACHE = process.env.IMG_CACHE || path.join(os.tmpdir(), "lan-imgcache");

// 只允许代理这些域名，避免被当成开放代理。
// 卡片封面在 pxlorbit / assetora，但作者头像散落在 supabase 项目域名、
// rls.* 与 dzmm.ai 默认头像上 —— 漏掉它们整片头像 403。
const ALLOWED_HOSTS = new Set([
  "pxlorbit.com",
  "assetora.net",
  "dzmm.ai",
  "www.dzmm.ai",
  "rls.dzmm.ai",
]);
const ALLOWED_SUFFIX = [".supabase.co", ".supabase.in"];

function hostAllowed(host) {
  if (ALLOWED_HOSTS.has(host)) return true;
  return ALLOWED_SUFFIX.some((s) => host.endsWith(s));
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

function keyOf(src, w) {
  return crypto.createHash("sha1").update(`${w}|${src}`).digest("hex");
}

// 环境里的代理（curl 能通而 Node fetch 不通，就是因为 fetch 不读这些变量）
function proxyUrl() {
  const p =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy || "";
  try {
    const u = new URL(p);
    return u.protocol.startsWith("http") ? u : null;
  } catch {
    return null;
  }
}

/** 经 HTTP CONNECT 隧道取 https URL 的完整响应体。 */
function fetchViaProxy(target, proxy, timeoutMs) {
  return new Promise((resolve, reject) => {
    const host = target.hostname;
    const port = target.port || 443;
    const auth = proxy.username
      ? "Basic " + Buffer.from(
          `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`
        ).toString("base64")
      : undefined;

    const creq = http.request({
      host: proxy.hostname,
      port: proxy.port || 80,
      method: "CONNECT",
      path: `${host}:${port}`,
      headers: auth ? { "proxy-authorization": auth } : {},
      timeout: timeoutMs,
    });

    creq.on("connect", (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return reject(new Error("proxy CONNECT " + res.statusCode));
      }
      const r = https.request(
        {
          host,
          port,
          path: target.pathname + target.search,
          method: "GET",
          headers: { host, referer: "https://www.dzmm.ai/", "user-agent": UA },
          // @ts-ignore 复用已建立的隧道
          createConnection: () => tls.connect({ socket, servername: host }),
          timeout: timeoutMs,
        },
        (up) => {
          const chunks = [];
          up.on("data", (c) => chunks.push(c));
          up.on("end", () =>
            resolve({
              status: up.statusCode || 0,
              ctype: up.headers["content-type"] || "image/jpeg",
              buf: Buffer.concat(chunks),
            })
          );
          up.on("error", reject);
        }
      );
      r.on("timeout", () => r.destroy(new Error("upstream timeout")));
      r.on("error", reject);
      r.end();
    });

    creq.on("timeout", () => creq.destroy(new Error("proxy timeout")));
    creq.on("error", reject);
    creq.end();
  });
}

/** 直连 https（无代理时用）。 */
function fetchDirectOnce(target, timeoutMs) {
  return new Promise((resolve, reject) => {
    const r = https.get(
      {
        host: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        headers: { referer: "https://www.dzmm.ai/", "user-agent": UA },
        timeout: timeoutMs,
      },
      (up) => {
        const chunks = [];
        up.on("data", (c) => chunks.push(c));
        up.on("end", () =>
          resolve({
            status: up.statusCode || 0,
            location: up.headers.location,
            ctype: up.headers["content-type"] || "image/jpeg",
            buf: Buffer.concat(chunks),
          })
        );
        up.on("error", reject);
      }
    );
    r.on("timeout", () => r.destroy(new Error("upstream timeout")));
    r.on("error", reject);
  });
}

/** 直连并跟随最多 3 次重定向（dzmm.ai/default-avatar.png 是 301）。 */
async function fetchDirect(target, timeoutMs) {
  let cur = target;
  for (let i = 0; i < 4; i++) {
    const r = await fetchDirectOnce(cur, timeoutMs);
    if (r.status >= 300 && r.status < 400 && r.location) {
      cur = new URL(r.location, cur);
      continue;
    }
    return r;
  }
  return { status: 310, ctype: "text/plain", buf: Buffer.alloc(0) };
}

export async function GET(req) {
  const url = new URL(req.url);
  const src = url.searchParams.get("u") || "";
  const w = parseInt(url.searchParams.get("w") || "0", 10) || 0;

  let target;
  try {
    target = new URL(src);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol) || !hostAllowed(target.hostname)) {
    return new NextResponse("forbidden host", { status: 403 });
  }

  const k = keyOf(target.href, w);
  const fp = path.join(CACHE, k.slice(0, 2), k);

  // 1) 缓存命中直接返回
  try {
    const buf = await fs.readFile(fp);
    return new NextResponse(buf, {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
        "x-img-cache": "hit",
      },
    });
  } catch {
    /* miss */
  }

  // 2) 回源：先确认域名能解析（已下线的 supabase 项目会白等 45s）
  try {
    await dns.promises.lookup(target.hostname);
  } catch {
    return new NextResponse("dns failed", { status: 404 });
  }

  const TIMEOUT = 45000;
  const px = proxyUrl();
  let got = null;
  const errors = [];
  if (px) {
    try {
      got = await fetchViaProxy(target, px, TIMEOUT);
    } catch (e) {
      errors.push("proxy: " + (e.message || e));
    }
  }
  if (!got || got.status !== 200) {
    try {
      const d = await fetchDirect(target, TIMEOUT);
      // 直连拿到 301 时，代理那条多半也只是超时，用直连结果兜底
      if (!got || d.status === 200) got = d;
    } catch (e) {
      errors.push("direct: " + (e.message || e));
    }
  }
  if (!got) {
    return new NextResponse("upstream error: " + errors.join(" | "), { status: 502 });
  }
  if (got.status !== 200) {
    return new NextResponse("upstream " + got.status + " " + (got.location || ""), {
      status: 502,
    });
  }

  let buf = got.buf;
  let ctype = got.ctype;

  // 3) 用 sharp 缩图（没装就原样返回，不影响可用性）
  if (w > 0) {
    try {
      const { default: sharp } = await import("sharp");
      buf = await sharp(buf)
        .resize({ width: Math.min(w, 1600), withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();
      ctype = "image/webp";
    } catch {
      /* sharp 不可用则退回原图 */
    }
  }

  // 4) 落盘
  try {
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, buf);
  } catch {
    /* 缓存失败不影响响应 */
  }

  return new NextResponse(buf, {
    headers: {
      "content-type": ctype,
      "cache-control": "public, max-age=31536000, immutable",
      "x-img-cache": "miss",
    },
  });
}
