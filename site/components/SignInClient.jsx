"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MODES = ["login", "signup", "reset", "otp", "signin-tg", "signin-code", "google"];

export default function SignInClient({ initialMode = "login", next = "/" }) {
  const router = useRouter();
  const [mode, setMode] = useState(MODES.includes(initialMode) ? initialMode : "login");
  const [step, setStep] = useState("form"); // form | otp | reset-otp | done
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devCode, setDevCode] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const safeNext = next && next.startsWith("/") ? next : "/";

  const switchMode = (m) => {
    setMode(m);
    setStep("form");
    setErr("");
    setNote("");
    setCode("");
    setNewPassword("");
    setDevCode("");
  };

  const post = async (path, body) => {
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => null);
      return { ok: r.ok, data };
    } catch {
      return { ok: false, data: { error: "网络错误，稍后再试" } };
    }
  };

  const finish = () => {
    router.push(safeNext);
    router.refresh();
  };

  const doLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/login", { email, password });
    setBusy(false);
    if (!ok) {
      setErr((data && data.error) || "登录失败");
      return;
    }
    finish();
  };

  const requestSignup = async (e) => {
    e.preventDefault();
    if (busy || !terms) return;
    setErr("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/signup/request", { email, password, name });
    setBusy(false);
    if (!ok) {
      setErr((data && data.error) || "发送失败");
      return;
    }
    setDevCode((data && data.devCode) || "");
    setStep("otp");
    setNote(`8 位验证码已发送至 ${email}`);
  };

  const verifySignup = async (e) => {
    e.preventDefault();
    if (busy || code.trim().length < 8) return;
    setErr("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/signup/verify", { email, code: code.trim() });
    setBusy(false);
    if (!ok) {
      setErr((data && data.error) || "验证失败");
      return;
    }
    finish();
  };

  const requestReset = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/reset/request", { email });
    setBusy(false);
    if (!ok) {
      setErr((data && data.error) || "发送失败");
      return;
    }
    setDevCode((data && data.devCode) || "");
    setStep("reset-otp");
    setNote(`验证码已发送至 ${email}`);
  };

  const verifyReset = async (e) => {
    e.preventDefault();
    if (busy || code.trim().length < 8) return;
    setErr("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/reset/verify", {
      email,
      code: code.trim(),
      password: newPassword,
    });
    setBusy(false);
    if (!ok) {
      setErr((data && data.error) || "重设失败");
      return;
    }
    setStep("done");
    setNote("密码已重设，请用新密码登录。");
  };

  const devBox = devCode ? (
    <div className="signin-dev">
      演示验证码 <b>{devCode}</b>
      <button type="button" onClick={() => setCode(devCode)}>填入</button>
    </div>
  ) : null;

  const methods = (
    <>
      <div className="signin-divider"><span>或</span></div>
      <div className="signin-methods">
        <button type="button" className="signin-method" onClick={() => switchMode("signin-tg")}>
          <span className="signin-method-ico">✈</span>
          飞机
        </button>
        <button type="button" className="signin-method" onClick={() => switchMode("google")}>
          <span className="signin-method-ico">G</span>
          Google
        </button>
      </div>
    </>
  );

  const placeholder = (title, text) => (
    <div className="signin-card">
      <h1 className="signin-title">{title}</h1>
      <p className="signin-sub">{text}</p>
      <div className="signin-placeholder" aria-hidden="true">本地演示</div>
      <button type="button" className="signin-back" onClick={() => switchMode("login")}>
        ← 返回登录
      </button>
    </div>
  );

  if (mode === "signin-tg") {
    return placeholder(
      "使用飞机登录",
      "线上 dzmm 通过 @Dzmm1loginbot 扫码登录。本克隆保留入口，不发起外部 Telegram 认证；请先用邮箱登录。"
    );
  }
  if (mode === "signin-code") {
    return placeholder("使用登录码登录", "线上支持上传登录码图片；本克隆未接入图片识别，请用邮箱登录。");
  }
  if (mode === "google") {
    return placeholder("Google 登录", "需要配置 Google OAuth 客户端 ID/Secret；本克隆未接入，请用邮箱登录。");
  }

  if (step === "done") {
    return (
      <div className="signin-card">
        <h1 className="signin-title">密码已重设</h1>
        <p className="signin-sub">{note}</p>
        <button type="button" className="signin-submit" onClick={() => switchMode("login")}>
          去登录
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="signin-card">
        <h1 className="signin-title">验证你的邮箱</h1>
        <p className="signin-sub">{note}</p>
        <form className="signin-form" onSubmit={verifySignup}>
          <label className="signin-field">
            <span>8 位验证码</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="00000000"
              maxLength={8}
              required
            />
          </label>
          {devBox}
          {err ? <p className="signin-err">{err}</p> : null}
          <button className="signin-submit" disabled={busy || code.length < 8}>
            {busy ? "验证中…" : "验证"}
          </button>
        </form>
        <p className="signin-foot">
          <button type="button" className="signin-link" onClick={requestSignup}>重新发送</button>
          <span>·</span>
          <button type="button" className="signin-link" onClick={() => switchMode("login")}>返回登录</button>
        </p>
      </div>
    );
  }

  if (step === "reset-otp") {
    return (
      <div className="signin-card">
        <h1 className="signin-title">重设密码</h1>
        <p className="signin-sub">{note}</p>
        <form className="signin-form" onSubmit={verifyReset}>
          <label className="signin-field">
            <span>8 位验证码</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="00000000"
              maxLength={8}
              required
            />
          </label>
          <label className="signin-field">
            <span>新密码（至少 8 位）</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {devBox}
          {err ? <p className="signin-err">{err}</p> : null}
          <button className="signin-submit" disabled={busy || code.length < 8 || newPassword.length < 8}>
            {busy ? "提交中…" : "重设密码"}
          </button>
        </form>
        <p className="signin-foot">
          <button type="button" className="signin-link" onClick={() => switchMode("login")}>返回登录</button>
        </p>
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="signin-card">
        <h1 className="signin-title">创建账号</h1>
        <p className="signin-sub">注册即送 100 credit。验证码会显示在下方（本地演示不发送邮件）。</p>
        <form className="signin-form" onSubmit={requestSignup}>
          <label className="signin-field">
            <span>昵称（可选）</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="怎么称呼你" />
          </label>
          <label className="signin-field">
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="signin-field">
            <span>密码（至少 8 位）</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="signin-terms">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>我已阅读并同意 <Link href="/about">服务协议</Link> 和 <Link href="/about">隐私权政策</Link></span>
          </label>
          {err ? <p className="signin-err">{err}</p> : null}
          <button className="signin-submit" disabled={busy || !terms}>
            {busy ? "发送中…" : "注册并获取验证码"}
          </button>
        </form>
        {methods}
        <p className="signin-guest"><Link href="/">以游客模式继续</Link></p>
        <p className="signin-foot">
          已经有账户？
          <button type="button" className="signin-link" onClick={() => switchMode("login")}>登录</button>
        </p>
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="signin-card">
        <h1 className="signin-title">重设密码</h1>
        <p className="signin-sub">输入你的邮箱，我们会生成一个 8 位验证码。</p>
        <form className="signin-form" onSubmit={requestReset}>
          <label className="signin-field">
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          {err ? <p className="signin-err">{err}</p> : null}
          <button className="signin-submit" disabled={busy}>
            {busy ? "发送中…" : "发送验证码"}
          </button>
        </form>
        <p className="signin-foot">
          已经有账户？
          <button type="button" className="signin-link" onClick={() => switchMode("login")}>登录</button>
        </p>
      </div>
    );
  }

  return (
    <div className="signin-card">
      <h1 className="signin-title">登录后畅聊你喜欢的角色</h1>
      <p className="signin-sub">用邮箱和密码登录；没有账号可以注册，或先以游客模式逛逛。</p>
      <form className="signin-form" onSubmit={doLogin}>
        <label className="signin-field">
          <span>邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="signin-field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="密码"
            required
          />
        </label>
        {err ? <p className="signin-err">{err}</p> : null}
        <button className="signin-submit" disabled={busy}>
          {busy ? "登录中…" : "登录"}
        </button>
      </form>
      {methods}
      <p className="signin-guest"><Link href="/">以游客模式继续</Link></p>
      <p className="signin-foot">
        <button type="button" className="signin-link" onClick={() => switchMode("reset")}>忘记密码</button>
        <span>|</span>
        <button type="button" className="signin-link" onClick={() => switchMode("signup")}>去注册账号</button>
      </p>
    </div>
  );
}
