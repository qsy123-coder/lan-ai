export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { denyIfNoPass } from "../../../lib/gate";
import { tokenFromRequest } from "../../../lib/session";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function POST(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const raw = await req.text();
  // 已登录用户把会话 token 透传给引擎，由引擎做账本预检查/扣费；游客保持不变。
  const token = tokenFromRequest(req);
  let body = raw;
  if (token) {
    try {
      const obj = JSON.parse(raw);
      obj.userToken = token;
      body = JSON.stringify(obj);
    } catch {}
  }
  let upstream;
  try {
    upstream = await fetch(ENGINE + "/site/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-site-token": process.env.SITE_TOKEN || "" },
      body,
      cache: "no-store",
    });
  } catch (e) {
    return Response.json({ error: "引擎未启动", detail: String(e).slice(0, 160) }, { status: 503 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response((await upstream.text().catch(() => "")) || "engine error", {
      status: upstream.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
