"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "角色" },
  { href: "/chat", label: "对话" },
  { href: "/about", label: "关于" },
];

export default function Nav() {
  const p = usePathname() || "/";
  const active = (href) =>
    href === "/" ? p === "/" || p.startsWith("/card") : p.startsWith(href);

  return (
    <div className="topnav-wrap">
      <nav className="topnav glass" aria-label="主导航">
        <Link href="/" className="brand">
          <span className="dot" />
          澜
        </Link>
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`tab ${active(t.href) ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
        <span className="spacer" />
        <label className="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input placeholder="搜索角色、标签…" aria-label="搜索" />
        </label>
      </nav>
    </div>
  );
}
