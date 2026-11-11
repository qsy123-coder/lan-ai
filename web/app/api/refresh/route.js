export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function POST(req) {
  const body = await req.text();
  try {
    const r = await fetch(ENGINE + "/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body || "{}",
      cache: "no-store",
    });
    return Response.json(await r.json());
  } catch (e) {
    return Response.json({ error: "引擎未启动" }, { status: 503 });
  }
}
