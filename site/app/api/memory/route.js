export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { denyIfNoPass } from "../../../lib/gate";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

function engineHeaders() {
  return {
    "content-type": "application/json",
    "x-site-token": process.env.SITE_TOKEN || "",
  };
}

export async function GET(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const cardId = u.searchParams.get("cardId") || "";
  const sessionId = u.searchParams.get("sessionId") || "";
  let q = `cardId=${encodeURIComponent(cardId)}`;
  // 多会话：必须把 sessionId 透传给引擎，否则引擎会退回卡片级旧记忆
  if (sessionId) q += `&sessionId=${encodeURIComponent(sessionId)}`;
  try {
    const r = await fetch(`${ENGINE}/site/memory?${q}`, {
      headers: engineHeaders(),
      cache: "no-store",
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return Response.json({ error: "引擎未启动", detail: String(e).slice(0, 160) }, { status: 503 });
  }
}

export async function POST(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.text();
  try {
    const r = await fetch(ENGINE + "/site/memory", {
      method: "POST",
      headers: engineHeaders(),
      body,
      cache: "no-store",
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return Response.json({ error: "引擎未启动", detail: String(e).slice(0, 160) }, { status: 503 });
  }
}
