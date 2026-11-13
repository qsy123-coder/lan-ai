// 额度池读取：/me 页与后续任何服务端组件共用。
// 引擎 /site/pool 不需要 token；公网部署时带上 SITE_TOKEN 也无害。
const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export async function getPool() {
  try {
    const headers = {};
    if (process.env.SITE_TOKEN) headers["x-site-token"] = process.env.SITE_TOKEN;
    const r = await fetch(`${ENGINE}/site/pool`, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    return {
      total: Number(j.total) || 0,
      usable: Number(j.usable) || 0,
      count: Number(j.count) || 0,
      accounts: Array.isArray(j.accounts) ? j.accounts : [],
      offline: false,
    };
  } catch (e) {
    // 引擎没起时页面仍要能打开：走离线态，不把 500 抛给前台。
    return {
      total: 0,
      usable: 0,
      count: 0,
      accounts: [],
      offline: true,
      error: String(e && e.message ? e.message : e).slice(0, 120),
    };
  }
}
