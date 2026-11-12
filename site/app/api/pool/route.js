export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { denyIfNoPass } from "../../../lib/gate";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function GET(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const r = await fetch(ENGINE + "/site/pool", { cache: "no-store" });
    return Response.json(await r.json());
  } catch {
    return Response.json({ total: 0, usable: 0, count: 0, accounts: [], offline: true });
  }
}
