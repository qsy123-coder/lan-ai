export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function POST(req) {
  const body = await req.text();
  let upstream;
  try {
    upstream = await fetch(ENGINE + "/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch (e) {
    return Response.json(
      { error: "引擎未启动", detail: String(e).slice(0, 200) },
      { status: 503 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || "engine error", {
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
