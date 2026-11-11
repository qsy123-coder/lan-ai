"use client";

import { useState } from "react";

export default function Enter() {
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!p || busy) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/enter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ p }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "口令不对");
      location.replace("/");
    } catch (e) {
      setErr(String(e.message || e));
      setBusy(false);
    }
  };

  return (
    <div className="shell">
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
        <div className="glass glass-tinted" style={{ width: "min(420px,100%)", borderRadius: 28, padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="dot" style={{ width: 26, height: 26, borderRadius: 9, background: "linear-gradient(150deg,#e9f6f2,#9fc9c2)" }} />
            <b style={{ fontSize: 16 }}>澜 · 私有入口</b>
          </div>
          <p style={{ fontSize: 12.5, color: "rgba(32,41,41,.6)", margin: "0 0 18px", lineHeight: 1.6 }}>
            这个站点只给自己用，请输入口令。
          </p>
          <input
            className="inp"
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="口令"
            autoFocus
            style={{ width: "100%" }}
          />
          {err ? <div style={{ color: "#b4474f", fontSize: 12, marginTop: 8 }}>{err}</div> : null}
          <button
            className="btn btn-primary press"
            onClick={go}
            disabled={busy || !p}
            style={{ width: "100%", justifyContent: "center", marginTop: 16, height: 44 }}
          >
            {busy ? "验证中…" : "进入"}
          </button>
        </div>
      </div>
    </div>
  );
}
