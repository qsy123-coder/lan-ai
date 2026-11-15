import { NextResponse } from "next/server";
import { denyIfNoPass } from "../../../../lib/gate";
import { engineJson } from "../../../../lib/engine";
import { tokenFromRequest } from "../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  const id = new URL(req.url).searchParams.get("id") || "";
  const qs = new URLSearchParams({ id });
  if (token) qs.set("token", token);
  const r = await engineJson(`/site/forum/post?${qs.toString()}`);
  return NextResponse.json(r.data || { error: "读取失败" }, { status: r.status });
}

export async function POST(req) {
  if (denyIfNoPass(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = tokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const r = await engineJson("/site/forum/post", {
    method: "POST",
    body: { token, ...body },
  });
  return NextResponse.json(r.data || { error: "发帖失败" }, { status: r.status });
}
