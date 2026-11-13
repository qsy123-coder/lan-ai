import { NextResponse } from "next/server";
import { engineJson } from "../../../../lib/engine";
import { clearSession, tokenFromRequest } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const token = tokenFromRequest(req);
  if (token) {
    await engineJson("/site/user/logout", { method: "POST", body: { token } });
  }
  return clearSession(NextResponse.json({ ok: true }));
}
