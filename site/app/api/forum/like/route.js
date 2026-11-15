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
  const r = await engineJson("/site/forum/like", {
    method: "POST",
    body: { token, postId: body.postId, value: body.value },
  });
  return NextResponse.json(r.data || { error: "操作失败" }, { status: r.status });
}
