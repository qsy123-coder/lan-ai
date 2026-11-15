import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../lib/gate";
import { engineJson } from "../../../lib/engine";
import { tokenFromRequest } from "../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  const sp = new URL(req.url).searchParams;
  const params = new URLSearchParams();
  for (const k of ["topic", "tag", "sort", "q"]) {
    const v = sp.get(k);
    if (v) params.set(k, v);
  }
  if (token) params.set("token", token);
  const r = await engineJson(`/site/forum?${params.toString()}`);
  return NextResponse.json(r.data || { error: "读取失败" }, { status: r.status });
}
