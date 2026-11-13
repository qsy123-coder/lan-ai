import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../../lib/gate";
import { engineJson } from "../../../../lib/engine";
import { tokenFromRequest } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const r = await engineJson(`/site/credits/checkin?token=${encodeURIComponent(token)}`);
  return NextResponse.json(r.data || { error: "读取失败" }, { status: r.status });
}

export async function POST(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const r = await engineJson("/site/credits/checkin", {
    method: "POST",
    body: { token },
  });
  return NextResponse.json(r.data || { error: "签到失败" }, { status: r.status });
}
