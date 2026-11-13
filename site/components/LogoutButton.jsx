"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
    router.refresh();
  };

  return (
    <button type="button" className="me-btn ghost press" onClick={logout} disabled={busy}>
      {busy ? "退出中…" : "退出登录"}
    </button>
  );
}
