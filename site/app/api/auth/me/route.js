import { NextResponse } from "next/server";
import { engineJson } from "../../../../lib/engine";
import { tokenFromRequest } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const token = tokenFromRequest(req);
  if (!token) return NextResponse.json({ user: null });
  const r = await engineJson(`/site/user/me?token=${encodeURIComponent(token)}`);
  return NextResponse.json({ user: r.status === 200 && r.data ? r.data.user : null });
}
