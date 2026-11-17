export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 跨设备同步：列出某张卡在服务器侧登记过的会话（webstate.site_chats），
// PC 打开时据此把手机上玩出来的会话补进左侧列表。
import { denyIfNoPass } from "../../../lib/gate";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function GET(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const cardId = u.searchParams.get("cardId") || "";
  if (!cardId) return Response.json({ error: "cardId required" }, { status: 400 });

  let upstream;
  try {
    upstream = await fetch(`${ENGINE}/site/sessions?cardId=${encodeURIComponent(cardId)}`, {
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
