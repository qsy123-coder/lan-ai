"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TIERS = [
  { price: "¥10", credit: 137 },
  { price: "¥50", credit: 856 },
  { price: "¥100", credit: 2055 },
  { price: "¥400", credit: 10958 },
];

export default function RechargeDemo({ loggedIn = false }) {
  const [busy, setBusy] = useState(0);
  const [note, setNote] = useState("");
  const router = useRouter();

  const add = async (tier) => {
    if (busy) return;
    setBusy(tier.credit);
    setNote("");
    try {
      const r = await fetch("/api/credits/recharge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: tier.credit, note: `演示充值 ${tier.price}` }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setNote((j && j.error) || "充值失败");
        return;
      }
      setNote(`已充值 ${tier.credit}，当前余额 ${Number(j.user && j.user.credit).toFixed(2)}`);
      router.refresh();
    } catch {
      setNote("网络错误，稍后再试");
    } finally {
      setBusy(0);
    }
  };

  if (!loggedIn) {
    return (
      <p className="price-hint">
        登录后可演示充值：<Link href="/login">去登录</Link>
      </p>
    );
  }

  return (
    <div className="recharge-box">
      <p className="recharge-title">演示充值（不扣款）</p>
      <div className="recharge-row">
        {TIERS.map((t) => (
          <button
            key={t.price}
            type="button"
            className="me-btn ghost press"
            disabled={!!busy}
            onClick={() => add(t)}
          >
            {busy === t.credit ? "充值中…" : `${t.price} → +${t.credit}`}
          </button>
        ))}
      </div>
      {note ? <p className="price-hint">{note}</p> : null}
    </div>
  );
}
