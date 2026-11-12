export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function POST() {
  try {
    const r = await fetch(ENGINE + "/stop", { method: "POST", cache: "no-store" });
    return Response.json(await r.json().catch(() => ({ ok: true })));
  } catch (e) {
    return Response.json({ error: "引擎未启动" }, { status: 503 });
  }
}
