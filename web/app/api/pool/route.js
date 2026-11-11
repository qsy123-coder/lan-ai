export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

async function proxy(path, init) {
  try {
    const r = await fetch(ENGINE + path, { cache: "no-store", ...init });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return Response.json(
      { error: "引擎未启动", detail: String(e).slice(0, 200) },
      { status: 503 }
    );
  }
}

export async function GET() {
  return proxy("/pool");
}
