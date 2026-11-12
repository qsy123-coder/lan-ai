"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const proxy = (u, w) => (u ? `/api/img?u=${encodeURIComponent(u)}&w=${w}` : "");

function fmt(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 10000) return (v / 10000).toFixed(1) + "万";
  return String(v);
}

function relTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!t) return "";
  const d = Math.max(0, Date.now() - t);
  const m = Math.floor(d / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  return mo < 12 ? `${mo} 个月前` : `${Math.floor(mo / 12)} 年前`;
}

export default function Card({ c, cover }) {
  // 敏感图默认遮住（与原站一致），用户在设置里关了「隐藏敏感图」才直接看到
  const [hideSensitive, setHideSensitive] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const read = () => setHideSensitive(localStorage.getItem("hideSensitive") !== "0");
    read();
    window.addEventListener("hide-sensitive-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("hide-sensitive-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const masked = hideSensitive && c.isSensitive && !shown;

  return (
    <Link className="zc" href={`/card/${c.id}`} prefetch={false}>
      <div
        className="zc-cover"
        style={cover ? { backgroundImage: `url("${cover}")` } : undefined}
      >
        {masked ? (
          <div className="zc-mask">
            <svg
              className="zc-mask-eye"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 12s3.4-5.2 9-5.2S21 12 21 12s-3.4 5.2-9 5.2S3 12 3 12z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
            <div className="zc-mask-t">敏感图片</div>
            <div className="zc-mask-s">此图片可能包含敏感内容</div>
            <button
              className="zc-view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShown(true);
              }}
            >
              查看
            </button>
          </div>
        ) : null}

        <div className="zc-count">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
            <path
              d="M16 8.5a4.5 4.5 0 0 1 0 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {fmt(c.popularity)}
        </div>

        {/* 右下角游戏/合集标识 */}
        <span className="zc-corner" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7h10a4 4 0 0 1 4 4v.6a3 3 0 0 1-2.6 3l-1.4.2-1.2 1.6a2 2 0 0 1-1.6.8h-2.4a2 2 0 0 1-1.6-.8L8.4 14.8 7 14.6a3 3 0 0 1-2.6-3V11a4 4 0 0 1 4-4z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M8 10.4v2.4M6.8 11.6h2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <div className="zc-title">{c.name}</div>

      <div className="zc-foot">
        {c.creatorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="zc-av"
            src={proxy(c.creatorAvatar, 64)}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="zc-av" />
        )}
        <span className="zc-by">{c.creator || "匿名"}</span>
        <span className="zc-like">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20s-7-4.3-7-9.2A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.8C19 15.7 12 20 12 20z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
          </svg>
          {c.likes ?? 0}
        </span>
      </div>
    </Link>
  );
}
