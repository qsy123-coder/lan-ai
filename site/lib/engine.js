// 引擎调用的小封装：统一 ENGINE_URL / x-site-token。
export const ENGINE = process.env.ENGINE_URL || "http://127.0.0.1:8787";

export function engineHeaders() {
  return {
    "content-type": "application/json",
    "x-site-token": process.env.SITE_TOKEN || "",
  };
}

export async function engineJson(path, { method = "GET", body } = {}) {
  try {
    const r = await fetch(ENGINE + path, {
      method,
      headers: engineHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const text = await r.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {}
    return { status: r.status, data, text };
  } catch (e) {
    return { status: 503, data: null, text: String(e && e.message ? e.message : e).slice(0, 160) };
  }
}
