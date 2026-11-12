"use client";

// 主题：light / dark / auto（跟随系统）
// - 首屏由 app/layout.js 的内联脚本先写 data-theme，避免闪白
// - 任何组件改了主题都派发 lan:theme，其它按钮同步，不用 context
import { useEffect, useState } from "react";

const KEY = "theme";
const EVT = "lan:theme";

export function resolveTheme(pref) {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readPref() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function applyTheme(pref) {
  const actual = resolveTheme(pref);
  const root = document.documentElement;
  root.dataset.theme = actual;
  try {
    if (pref === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(EVT, { detail: { pref, actual } }));
  } catch {}
  return actual;
}

export function useTheme() {
  // 初始用 auto，挂载后立刻对齐真实偏好；服务端与客户端首帧一致，无 hydration 警告
  const [pref, setPref] = useState("auto");
  const [actual, setActual] = useState("light");

  useEffect(() => {
    const sync = () => {
      const p = readPref();
      setPref(p);
      setActual(resolveTheme(p));
    };
    sync();

    const onCustom = (e) => {
      if (e.detail?.pref) {
        setPref(e.detail.pref);
        setActual(e.detail.actual || resolveTheme(e.detail.pref));
      } else sync();
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (readPref() === "auto") {
        document.documentElement.dataset.theme = resolveTheme("auto");
        sync();
      }
    };
    window.addEventListener(EVT, onCustom);
    mq.addEventListener?.("change", onSystem);
    return () => {
      window.removeEventListener(EVT, onCustom);
      mq.removeEventListener?.("change", onSystem);
    };
  }, []);

  const set = (p) => {
    setActual(applyTheme(p));
    setPref(p);
  };
  const toggle = () => set(actual === "dark" ? "light" : "dark");

  return { pref, actual, set, toggle };
}

/** 顶栏/面板上的单键切换。图标由 CSS 按 data-theme 显示，首帧不闪。 */
export default function ThemeToggle({ className = "" }) {
  const { actual, toggle } = useTheme();
  return (
    <button
      type="button"
      className={`theme-btn ${className}`.trim()}
      onClick={toggle}
      aria-label={actual === "dark" ? "切到浅色主题" : "切到深色主题"}
      title={actual === "dark" ? "切到浅色" : "切到深色"}
    >
      <svg className="ti ti-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.5A8.2 8.2 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="ti ti-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/** 设置面板里的三选一：跟随系统 / 浅色 / 深色 */
export function ThemeSegments() {
  const { pref, set } = useTheme();
  const OPTS = [
    { key: "auto", label: "跟随系统" },
    { key: "light", label: "浅色" },
    { key: "dark", label: "深色" },
  ];
  return (
    <div className="theme-seg" role="group" aria-label="主题">
      {OPTS.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`theme-seg-btn press ${pref === o.key ? "on" : ""}`}
          onClick={() => set(o.key)}
          aria-pressed={pref === o.key}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
