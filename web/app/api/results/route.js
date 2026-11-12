export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function GET() {
  try {
    const r = await fetch(ENGINE + "/results", { cache: "no-store" });
    return Response.json(await r.json());
  } catch (e) {
    return Response.json({ results: [] });
  }
}
