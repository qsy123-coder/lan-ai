import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const pass = process.env.SITE_PASS || "";
  let p = "";
  try {
    p = (await req.json()).p || "";
  } catch {}

  if (pass && p !== pass) {
    return NextResponse.json({ ok: false, error: "口令不对" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("lg_pass", pass || "open", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
