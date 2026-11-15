import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../../../lib/gate";
import { engineJson } from "../../../../../lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const r = await engineJson("/site/user/reset/request", { method: "POST", body });
  return NextResponse.json(r.data || { error: "发送失败" }, { status: r.status });
}
