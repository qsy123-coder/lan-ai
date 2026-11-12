"use client";

// 对话列表面板 —— 手机全屏 / 桌面左栏，共用一套 DOM
// 直角、1px 分隔线、44px 触摸区（design.md 的 spacing/触摸下限，但不用圆角）
import Link from "next/link";
import { useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const timeOf = (ts) =>
  new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

const dateOf = (ts) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 今天的显示时刻，更早的显示月/日 —— 列表里混着两种时间才读得懂
const metaOf = (ts) => {
  const d = new Date(ts);
  return d.toDateString() === new Date().toDateString() ? timeOf(ts) : dateOf(ts);
};

// 预览：模型常输出 markdown 与换行，列表里只留一行干净文本
function previewOf(s) {
  const raw = String(s || "").replace(/<[^>]*>/g, " ");
  const flat = raw
    .replace(/[*_`#>~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return flat || "开始新的对话";
}

const dayOf = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "今天";
  if (d.toDateString() === new Date(now.getTime() - 864e5).toDateString()) return "昨天";
  if (now - d < 7 * 864e5) return "本周";
  if (now - d < 30 * 864e5) return "本月";
  return "更早";
};

export default function SessionList({
  open,
  sessions,
  currentId,
  onClose,
  onDelete,
  onOpenSettings,
}) {
  const [q, setQ] = useState("");
  const [manage, setManage] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return sessions;
    return sessions.filter(
      (s) =>
        String(s.name || "").toLowerCase().includes(k) ||
        String(s.last || "").toLowerCase().includes(k)
    );
  }, [sessions, q]);

  const grouped = useMemo(() => {
    const order = ["今天", "昨天", "本周", "本月", "更早"];
    const m = new Map();
    for (const s of filtered) {
      const k = dayOf(s.lastAt || Date.now());
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(s);
    }
    return order.filter((k) => m.has(k)).map((k) => [k, m.get(k)]);
  }, [filtered]);

  const del = (cardId) => {
    if (confirmId !== String(cardId)) {
      setConfirmId(String(cardId));
      return;
    }
    setConfirmId(null);
    onDelete?.(cardId);
  };

  return (
    <>
      {open ? <div className="sp-scrim" onClick={onClose} aria-hidden="true" /> : null}
      <aside className={`sesspanel ${open ? "open" : ""}`} aria-label="对话列表">
        <header className="sp-head">
          <button className="sp-ico press" onClick={onClose} aria-label="关闭对话列表">
            <svg className="ico-close" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <svg className="ico-back" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14.5 5.5L8 12l6.5 6.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2>对话</h2>
          <span className="sp-count">{sessions.length}</span>
          <span className="sp-gap" />
          <button
            className={`sp-txt-btn press ${manage ? "on" : ""}`}
            onClick={() => {
              setManage((v) => !v);
              setConfirmId(null);
            }}
            aria-pressed={manage}
          >
            {manage ? "完成" : "管理"}
          </button>
          <ThemeToggle className="sp-theme" />
        </header>

        <div className="sp-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.4-3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索角色或最近一句"
            aria-label="搜索对话"
            inputMode="search"
            enterKeyHint="search"
          />
          {q ? (
            <button className="sp-clear press" onClick={() => setQ("")} aria-label="清除搜索">
              ✕
            </button>
          ) : null}
        </div>

        <div className="sp-body">
          {sessions.length === 0 ? (
            <div className="sp-empty">
              <b>还没有对话</b>
              <p>去挑一张角色卡，第一句话会决定这场戏的走向。</p>
              <Link href="/" className="sp-cta press" onClick={onClose}>
                挑角色
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="sp-empty">
              <b>没有匹配</b>
              <p>换个关键词，或清空搜索。</p>
              <button className="sp-cta press" onClick={() => setQ("")}>
                清空搜索
              </button>
            </div>
          ) : (
            grouped.map(([label, list]) => (
              <section key={label} className="sp-group">
                <div className="sp-label">
                  <span>{label}</span>
                  <em>{list.length}</em>
                </div>
                {list.map((s) => {
                  const on = String(s.cardId) === String(currentId);
                  return (
                    <div className={`sp-row ${on ? "on" : ""}`} key={s.cardId}>
                      <Link
                        href={`/chat?card=${s.cardId}`}
                        className="sp-main"
                        onClick={onClose}
                        aria-current={on ? "page" : undefined}
                      >
                        <span className="sp-av">
                          {s.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.cover} alt="" loading="lazy" />
                          ) : (
                            <span className="sp-ph" aria-hidden="true">
                              {(s.name || "?").slice(0, 1)}
                            </span>
                          )}
                        </span>
                        <span className="sp-txt">
                          <b>{s.name}</b>
                          <span>{previewOf(s.last)}</span>
                        </span>
                        <span className="sp-meta">
                          {on ? <em>当前</em> : metaOf(s.lastAt || Date.now())}
                        </span>
                      </Link>
                      {manage ? (
                        <button
                          className={`sp-del press ${confirmId === String(s.cardId) ? "sure" : ""}`}
                          onClick={() => del(s.cardId)}
                        >
                          {confirmId === String(s.cardId) ? "确认删除" : "删除"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ))
          )}
        </div>

        <footer className="sp-foot">
          <Link href="/" className="sp-foot-link" onClick={onClose}>
            去挑新角色
          </Link>
          <button className="sp-foot-link press" onClick={onOpenSettings}>
            会话设置
          </button>
          <span className="sp-foot-gap" />
          <Link href="/" className="sp-foot-link sp-foot-nav" onClick={onClose}>
            导航
          </Link>
        </footer>
      </aside>
    </>
  );
}
