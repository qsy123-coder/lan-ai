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
  const cardId = new URL(req.url).searchParams.get("cardId") || "";
  try {
    const r = await fetch(`${ENGINE}/site/memory?cardId=${encodeURIComponent(cardId)}`, {
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
