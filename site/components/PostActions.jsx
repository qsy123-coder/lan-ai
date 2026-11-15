"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostActions({ post, loggedIn = false }) {
  const [liked, setLiked] = useState(post.liked || 0);
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const router = useRouter();

  const vote = async (value) => {
    if (!loggedIn) {
      setNote("请先登录");
      return;
    }
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      const next = liked === value ? 0 : value;
      const r = await fetch("/api/forum/like", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: post.id, value: next }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setNote((j && j.error) || "操作失败");
        return;
      }
      const p = (j && j.post) || {};
      setLiked(p.liked ?? next);
      setLikes(p.likes ?? likes);
      setDislikes(p.dislikes ?? dislikes);
      router.refresh();
    } catch {
      setNote("网络错误，稍后再试");
    } finally {
      setBusy(false);
    }
  };

  const comment = async (e) => {
    e.preventDefault();
    if (!loggedIn) {
      setNote("请先登录");
      return;
    }
    if (!body.trim() || busy) return;
    setBusy(true);
    setNote("");
    try {
      const r = await fetch("/api/forum/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: post.id, body }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setNote((j && j.error) || "评论失败");
        return;
      }
      setBody("");
      setNote("已发布");
      router.refresh();
    } catch {
      setNote("网络错误，稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="post-actions">
      <div className="post-votes">
        <button
          type="button"
          className={`vote-btn${liked === 1 ? " on" : ""}`}
          disabled={busy}
          onClick={() => vote(1)}
        >
          赞 {likes}
        </button>
        <button
          type="button"
          className={`vote-btn${liked === -1 ? " on" : ""}`}
          disabled={busy}
          onClick={() => vote(-1)}
        >
          踩 {dislikes}
        </button>
      </div>
      {loggedIn ? (
        <form className="comment-form" onSubmit={comment}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="说点什么…"
            maxLength={1000}
            rows={3}
          />
          <button className="me-btn primary" disabled={busy || !body.trim()}>
            {busy ? "发送中…" : "评论"}
          </button>
        </form>
      ) : (
        <p className="post-login">
          <Link href="/login">登录</Link>后点赞和评论。
        </p>
      )}
      {note ? <p className="post-note">{note}</p> : null}
    </div>
  );
}
