export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { denyIfNoPass } from "../../../lib/gate";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function POST(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.text();
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
