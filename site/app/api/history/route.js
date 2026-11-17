export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 跨设备同步：把上游 chat.getMessages 的存档回放给浏览器。
// 手机与 PC 的消息各自存在 localStorage，真正共用的是上游会话存档。
import { denyIfNoPass } from "../../../lib/gate";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function GET(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const cardId = u.searchParams.get("cardId") || "";
  const sessionId = u.searchParams.get("sessionId") || "";
  if (!cardId) return Response.json({ error: "cardId required" }, { status: 400 });

  const qs = new URLSearchParams({ cardId });
  if (sessionId) qs.set("sessionId", sessionId);

  let upstream;
  try {
    upstream = await fetch(`${ENGINE}/site/history?${qs.toString()}`, {
      headers: { "x-site-token": process.env.SITE_TOKEN || "" },
      cache: "no-store",
    });
  } catch (e) {
    return Response.json({ error: "引擎未启动", detail: String(e).slice(0, 160) }, { status: 503 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
