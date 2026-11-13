import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../../lib/gate";
import { engineJson } from "../../../../lib/engine";
import { tokenFromRequest } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const r = await engineJson("/site/credits/recharge", {
    method: "POST",
    body: { token, amount: body.amount, note: body.note || "演示充值" },
  });
  return NextResponse.json(r.data || { error: "充值失败" }, { status: r.status });
}
