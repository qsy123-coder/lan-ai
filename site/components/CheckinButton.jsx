"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckinButton({ checked = false, reward = 5 }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const router = useRouter();

  const go = async () => {
    if (busy || checked) return;
    setBusy(true);
    setNote("");
    try {
      const r = await fetch("/api/credits/checkin", { method: "POST" });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setNote((j && j.error) || "签到失败");
        return;
      }
      setNote(`+${j.entry && j.entry.amount ? j.entry.amount : reward} · 连续 ${j.streak} 天`);
      router.refresh();
    } catch {
      setNote("网络错误，稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="checkin-act">
      <button
        type="button"
        className={`me-btn ${checked ? "ghost" : "primary"} press`}
        disabled={busy || checked}
        onClick={go}
      >
        {checked ? "今天已签到" : busy ? "签到中…" : `签到 +${reward}`}
      </button>
      {note ? <span className="checkin-note">{note}</span> : null}
    </div>
  );
}
