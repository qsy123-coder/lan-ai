import PostalMime from "postal-mime";

// mail-hub —— Cloudflare Email Routing catch-all 接收 → 提取 8 位验证码 → KV
//
// 绑定:
//   KV: MAILKV
//   变量: API_TOKEN（可选；设置后 HTTP 接口要求 Authorization: Bearer <token>）
//
// HTTP:
//   GET /health
//   GET /code?addr=<收件地址>&since=<毫秒时间戳>
//   GET /list?addr=<收件地址>            // 最近 20 条（排障用）
//   DELETE /code?addr=<收件地址>          // 消费后清理

const TTL = 7 * 24 * 3600;
const KEY = (addr) => "addr:" + addr.toLowerCase();
const HIST = (addr) => "hist:" + addr.toLowerCase();

function codeOf(parsed) {
  const parts = [];
  if (parsed.text) parts.push(parsed.text);
  if (parsed.html) parts.push(String(parsed.html).replace(/<[^>]+>/g, " "));
  const body = parts.join("\n").replace(/&nbsp;/g, " ");
  const m = body.match(/\b(\d{8})\b/);
  return m ? m[1] : null;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function authed(req, env) {
  if (!env.API_TOKEN) return true;
  const h = req.headers.get("authorization") || "";
  return h === "Bearer " + env.API_TOKEN;
}

export default {
  async email(message, env) {
    const to = (message.to || "").toLowerCase();
    try {
      const parsed = await PostalMime.parse(await new Response(message.raw).arrayBuffer());
      const code = codeOf(parsed);
      if (!code) return;
      const rec = {
        code,
        ts: Date.now(),
        subject: parsed.subject || "",
        from: (parsed.from && parsed.from.address) || message.from || "",
      };
      await env.MAILKV.put(KEY(to), JSON.stringify(rec), { expirationTtl: TTL });
      const histRaw = await env.MAILKV.get(HIST(to));
      const hist = histRaw ? JSON.parse(histRaw) : [];
      hist.unshift(rec);
      await env.MAILKV.put(HIST(to), JSON.stringify(hist.slice(0, 20)), { expirationTtl: TTL });
    } catch (e) {
      // 邮件处理失败不应反弹给发件人；只记录（wrangler tail 可见）
      console.log("mail-hub parse error", to, String(e));
    }
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/health") return json({ ok: true, ts: Date.now() });
    if (!authed(req, env)) return json({ error: "unauthorized" }, 401);

    const addr = (url.searchParams.get("addr") || "").toLowerCase();
    if (!addr) return json({ error: "addr required" }, 400);

    if (url.pathname === "/code" && req.method === "GET") {
      const since = Number(url.searchParams.get("since") || 0);
      const raw = await env.MAILKV.get(KEY(addr));
      if (!raw) return json({ code: null });
      const rec = JSON.parse(raw);
      if (since && rec.ts < since) return json({ code: null, ts: rec.ts });
      return json(rec);
    }

    if (url.pathname === "/code" && req.method === "DELETE") {
      await env.MAILKV.delete(KEY(addr));
      return json({ ok: true });
    }

    if (url.pathname === "/list") {
      const raw = await env.MAILKV.get(HIST(addr));
      return json({ items: raw ? JSON.parse(raw) : [] });
    }

    return json({ error: "not found" }, 404);
  },
};
