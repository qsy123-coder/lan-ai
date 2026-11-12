"use client";

import { useEffect, useState } from "react";

/**
 * 详情页封面：敏感卡在「隐藏敏感内容」开启时盖一层遮罩，点击才显示。
 * 开关状态与列表页共用 localStorage.hideSensitive；
 * 顶栏 sens-btn 触发 "hide-sensitive-change"，其它标签页靠 storage 事件。
 *
 * 只负责图片与遮罩，外层 .big 与 big-count 由详情页自己维护。
 */
export default function SensitiveCover({ src, alt, sensitive }) {
  const [hide, setHide] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const read = () => {
      setHide(localStorage.getItem("hideSensitive") !== "0");
      // 切回「隐藏」时把单张的已显示状态复位，否则会一直露着
      setShown(false);
    };
    read();
    window.addEventListener("hide-sensitive-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("hide-sensitive-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const masked = sensitive && hide && !shown;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={masked ? "big-blur" : undefined} />
      {masked ? (
        <button
          type="button"
          className="big-mask"
          onClick={() => setShown(true)}
          aria-label="显示敏感内容"
        >
          <svg
            className="zc-mask-eye"
            width="30"
            height="30"
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
          <span className="zc-mask-t">敏感图片</span>
          <span className="zc-mask-s">点击显示</span>
        </button>
      ) : null}
    </>
  );
}
