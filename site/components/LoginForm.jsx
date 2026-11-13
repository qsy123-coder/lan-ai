"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      const r = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name: mode === "register" ? name : undefined }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setErr((j && j.error) || "操作失败");
        return;
      }
      router.push("/me");
      router.refresh();
    } catch {
      setErr("网络错误，稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page auth-page">
      <header className="auth-head">
        <p className="auth-kicker">账号</p>
        <h1>{mode === "login" ? "登录" : "注册"}</h1>
        <p className="auth-sub">
          登录后生成本会计入你的积分账本；不登录也能继续以游客身份对话。
        </p>
      </header>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs" role="tablist" aria-label="登录或注册">
          <button
            type="button"
            className={mode === "login" ? "on" : ""}
            onClick={() => { setMode("login"); setErr(""); }}
          >
            登录
          </button>
          <button
            type="button"
            className={mode === "register" ? "on" : ""}
            onClick={() => { setMode("register"); setErr(""); }}
          >
            注册
          </button>
        </div>

        {mode === "register" ? (
          <label className="auth-field">
            <span>昵称（可选）</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="怎么称呼你"
              maxLength={24}
              autoComplete="nickname"
            />
          </label>
        ) : null}

        <label className="auth-field">
          <span>邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "至少 8 位" : "密码"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>

        {err ? <p className="auth-err">{err}</p> : null}

        <button className="me-btn primary auth-submit" disabled={busy}>
          {busy ? "处理中…" : mode === "login" ? "登录" : "注册并送 100 积分"}
        </button>

        <p className="auth-foot">
          注册即送 100 credit；本站为演示站，不涉及真实支付。
          <Link href="/pricing">看计费规则</Link>
        </p>
      </form>
    </main>
  );
}
