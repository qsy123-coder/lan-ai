export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 跨设备同步：列出服务器侧登记过的会话（webstate.site_chats + sessions.json）。
// 不传 cardId 时返回全部卡片的会话，并用卡片库补齐 name/cover，左侧列表才能跨卡显示。
import { denyIfNoPass } from "../../../lib/gate";
import { getCard } from "../../../lib/cards";

const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";
const TEST_SID = /^(diag-|sessA-|sessB-|verify-|test-)/;

export async function GET(req) {
  if (denyIfNoPass(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const cardId = u.searchParams.get("cardId") || "";

  const qs = cardId ? `?cardId=${encodeURIComponent(cardId)}` : "";
  let upstream;
  try {
    upstream = await fetch(`${ENGINE}/site/sessions${qs}`, {
      headers: { "x-site-token": process.env.SITE_TOKEN || "" },
      cache: "no-store",
    });
  } catch (e) {
    return Response.json({ error: "引擎未启动", detail: String(e).slice(0, 160) }, { status: 503 });
  }

  const text = await upstream.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return new Response(text, {
      status: upstream.status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const rows = Array.isArray(data?.sessions) ? data.sessions : [];
  data.sessions = rows
    .filter((s) => s && s.sessionId && !TEST_SID.test(String(s.sessionId)))
    .map((s) => {
      const c = getCard(s.cardId);
      return {
        ...s,
        name: c?.name || `卡片 ${s.cardId}`,
        cover: c?.cover || "",
      };
    });

  return Response.json(data, { headers: { "cache-control": "no-store" } });
}
