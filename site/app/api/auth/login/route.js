import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../../lib/gate";
import { engineJson } from "../../../../lib/engine";
import { setSession } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const r = await engineJson("/site/user/login", { method: "POST", body });
  if (r.status !== 200 || !r.data || !r.data.token) {
    return NextResponse.json(r.data || { error: "登录失败" }, { status: r.status || 401 });
  }
  return setSession(NextResponse.json({ ok: true, user: r.data.user }), r.data.token);
}
