import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const CACHE = process.env.IMG_CACHE || "/opt/lan/imgcache";
// 只允许代理这几个域名，避免被当成开放代理
const ALLOWED_HOSTS = new Set(["pxlorbit.com", "assetora.net"]);

function keyOf(src, w) {
  return crypto.createHash("sha1").update(`${w}|${src}`).digest("hex");
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
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
        "x-img-cache": "hit",
      },
    });
  } catch {
    /* miss */
  }

  // 2) 回源
  let buf;
  let ctype = "image/jpeg";
  try {
    const r = await fetch(target.href, {
      headers: { referer: "https://www.dzmm.ai/", "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return new NextResponse("upstream " + r.status, { status: 502 });
    ctype = r.headers.get("content-type") || ctype;
    buf = Buffer.from(await r.arrayBuffer());
  } catch {
    return new NextResponse("upstream error", { status: 502 });
  }

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
