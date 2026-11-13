import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

export const dynamic = "force-dynamic";

const CACHE =
  process.env.IMG_CACHE ||
  (process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA || os.tmpdir(), "lan-imgcache")
    : "/opt/lan/imgcache");

// 只允许代理这几个域名，避免被当成开放代理
const ALLOWED_HOSTS = new Set(["pxlorbit.com", "assetora.net"]);

// 本机 Node 直连该源站会在 ~320KB 处挂死（fetch / https / http2 都复现），
// curl 与 Python 正常。所以回源优先用 curl；curl 不可用时才退回 fetch。
const CURL_BIN = process.env.IMG_CURL || (process.platform === "win32" ? "curl.exe" : "curl");

function keyOf(src, w) {
  // v2：改用渲染端点出小图，旧缓存（原图）不再命中
  return crypto.createHash("sha1").update(`v2|${w}|${src}`).digest("hex");
}

// pxlorbit 是 Supabase Storage：把 object/public 换成 render/image/public，
// 用服务端缩图（实测 320px webp ≈ 20–30KB），免装 sharp。
function renderUrl(target, w) {
  if (target.hostname !== "pxlorbit.com" || w <= 0) return null;
  let p = target.pathname;
  if (p.startsWith("/storage/v1/object/public/")) {
    p = "/storage/v1/render/image/public/" + p.slice("/storage/v1/object/public/".length);
  } else if (!p.startsWith("/storage/v1/render/image/public/")) {
    return null;
  }
  const u = new URL(target.href);
  u.pathname = p;
  u.searchParams.set("width", String(Math.min(w, 1600)));
  u.searchParams.delete("height");
  if (!u.searchParams.has("resize")) u.searchParams.set("resize", "contain");
  return u;
}

function sniffType(buf) {
  if (!buf || buf.length < 12) return "image/jpeg";
  const b = buf;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b.slice(0, 4).toString("latin1") === "RIFF" && b.slice(8, 12).toString("latin1") === "WEBP")
    return "image/webp";
  if (b.slice(0, 3).toString("latin1") === "GIF") return "image/gif";
  return "image/jpeg";
}

function portOpen(host, port, ms = 350) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port });
    const done = (ok) => {
      s.destroy();
      resolve(ok);
    };
    s.setTimeout(ms, () => done(false));
    s.once("connect", () => done(true));
    s.once("error", () => done(false));
  });
}

async function proxyArg() {
  // 明确给了 IMG_PROXY 就用；没给时只在 Windows 上探测本机 Clash
  const raw = process.env.IMG_PROXY;
  if (!raw) {
    if (process.platform !== "win32") return null;
    if (await portOpen("127.0.0.1", 7897)) return "http://127.0.0.1:7897";
    return null;
  }
  try {
    const u = new URL(raw);
    if (await portOpen(u.hostname, Number(u.port) || 80)) return raw;
  } catch {
    /* 配置非法则不用代理 */
  }
  return null;
}

function curlDownload(urlStr, proxy) {
  return new Promise((resolve) => {
    const args = [
      "-sS",
      "--location",
      "--max-redirs",
      "3",
      "--max-time",
      "25",
      "--fail",
      "--proto",
      "=http,https",
      "-A",
      "Mozilla/5.0",
      "-e",
      "https://www.dzmm.ai/",
      "--compressed",
      "-o",
      "-",
      urlStr,
    ];
    if (proxy) args.unshift("-x", proxy);
    execFile(
      CURL_BIN,
      args,
      { encoding: "buffer", maxBuffer: 64 * 1024 * 1024, windowsHide: true },
      (err, stdout) => {
        if (err || !stdout || stdout.length < 16) return resolve(null);
        resolve(stdout);
      }
    );
  });
}

async function fetchDownload(urlStr) {
  const r = await fetch(urlStr, {
    headers: { referer: "https://www.dzmm.ai/", "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error("upstream " + r.status);
  return Buffer.from(await r.arrayBuffer());
}

async function download(urlStr, proxy) {
  const viaCurl = await curlDownload(urlStr, proxy);
  if (viaCurl) return viaCurl;
  return fetchDownload(urlStr);
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
  if (!/^https?:$/.test(target.protocol) || !ALLOWED_HOSTS.has(target.hostname)) {
    return new NextResponse("forbidden host", { status: 403 });
  }

  const k = keyOf(target.href, w);
  const fp = path.join(CACHE, k.slice(0, 2), k);

  // 1) 缓存命中直接返回
  try {
    const buf = await fs.readFile(fp);
    return new NextResponse(buf, {
      headers: {
        "content-type": sniffType(buf),
        "cache-control": "public, max-age=31536000, immutable",
        "x-img-cache": "hit",
      },
    });
  } catch {
    /* miss */
  }

  // 2) 回源（curl 优先，失败退回 fetch）；pxlorbit 走服务端缩图端点
  let buf;
  let ctype = "image/jpeg";
  try {
    const proxy = await proxyArg();
    const thumb = renderUrl(target, w);
    if (thumb) {
      try {
        buf = await download(thumb.href, proxy);
        ctype = sniffType(buf);
      } catch {
        buf = null;
      }
    }
    if (!buf) {
      buf = await download(target.href, proxy);
      ctype = sniffType(buf);
    }
  } catch {
    return new NextResponse("upstream error", { status: 502 });
  }

  // 3) 落盘
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
