"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 主导航：照 dzmm —— 左「角色 消息 论坛 我的」／中「搜索」／右「加号 头像」
const NAV = [
  { href: "/", label: "角色", icon: "role" },
  { href: "/messages", label: "消息", icon: "msg", badge: 9 },
  { href: "/forum", label: "论坛", icon: "forum" },
  { href: "/me", label: "我的", icon: "me" },
];

function Icon({ name }) {
  if (name === "role")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17.5" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 14.2c2.6 0 4.5 1.7 4.5 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (name === "msg")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 12c0 4-3.6 7-8 7-1 0-2-.2-2.9-.5L4 20l1.4-3.6A6.6 6.6 0 0 1 4 12c0-4 3.6-7 8-7s8 3 8 7z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "forum")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5v5l3 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (name === "me")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8.4" r="3.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 19.5c0-3.3 3.1-5.6 7-5.6s7 2.3 7 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  return null;
}

export default function Nav() {
  const p = usePathname() || "/";
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [q, setQ] = useState("");
  // 敏感内容默认遮住；一键切换写 localStorage 并广播给 Card / 详情页
  const [hideSensitive, setHideSensitive] = useState(true);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || localStorage.getItem("theme") || "light");
    setHideSensitive(localStorage.getItem("hideSensitive") !== "0");
  }, []);

  const toggleTheme = () => {
    const next = (document.documentElement.dataset.theme || "light") === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const toggleSensitive = () => {
    const next = !hideSensitive;
    localStorage.setItem("hideSensitive", next ? "1" : "0");
    setHideSensitive(next);
    // 同页组件靠自定义事件，其它标签页靠 storage 事件（Card.jsx 两个都监听）
    window.dispatchEvent(new Event("hide-sensitive-change"));
  };

  const active = (href) =>
    href === "/" ? p === "/" || p.startsWith("/card") : p.startsWith(href);

  const submit = (e) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/?q=${encodeURIComponent(v)}` : "/");
  };

  return (
    <div className="topnav-wrap">
      <nav className="topnav" aria-label="主导航">
        {/* 左：logo + 四项 */}
        <div className="nav-left">
          <Link href="/" className="brand" aria-label="澜">
            <span className="brand-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3c4.4 2.2 6.6 5.5 6.6 9.2 0 4-3 7.3-6.6 8.8-3.6-1.5-6.6-4.8-6.6-8.8C5.4 8.5 7.6 5.2 12 3z"
                  fill="currentColor"
                  opacity=".9"
                />
                <path
                  d="M12 7.4c2.2 1.3 3.3 3 3.3 4.9 0 2-1.4 3.8-3.3 4.7-1.9-.9-3.3-2.7-3.3-4.7 0-1.9 1.1-3.6 3.3-4.9z"
                  fill="#fff"
                  opacity=".85"
                />
              </svg>
            </span>
            <span className="brand-t">澜</span>
          </Link>

          <div className="nav-tabs">
            {NAV.map((t) => (
              <Link key={t.href} href={t.href} className={`tab ${active(t.href) ? "active" : ""}`}>
                <Icon name={t.icon} />
                <span>{t.label}</span>
                {t.badge ? <em className="tab-badge">{t.badge}</em> : null}
              </Link>
            ))}
          </div>
        </div>

        {/* 中：搜索 */}
        <form className="search" onSubmit={submit} role="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索全站"
            aria-label="搜索"
          />
        </form>

        {/* 右：图标按钮 + 头像 */}
        <div className="nav-right">
          <button
            type="button"
            className={"theme-btn sens-btn" + (hideSensitive ? " on" : "")}
            onClick={toggleSensitive}
            title={hideSensitive ? "当前隐藏敏感内容，点击显示" : "当前显示敏感内容，点击隐藏"}
            aria-label={hideSensitive ? "显示敏感内容" : "隐藏敏感内容"}
            aria-pressed={hideSensitive}
          >
            {hideSensitive ? (
              // 眼睛带斜线：已隐藏
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12s3.4-5.2 9-5.2S21 12 21 12s-3.4 5.2-9 5.2S3 12 3 12z"
                  stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
                <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            ) : (
              // 睁眼：已显示
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12s3.4-5.2 9-5.2S21 12 21 12s-3.4 5.2-9 5.2S3 12 3 12z"
                  stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "切到浅色" : "切到深色"}
            aria-label={theme === "dark" ? "切到浅色" : "切到深色"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          <button type="button" className="nav-plus" aria-label="新建" title="新建">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/me" className="nav-avatar" aria-label="我的账号">
            <span className="nav-av-inner" />
            <em className="nav-dot" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
