"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPostForm({ topics = [] }) {
  const list = topics.length ? topics : ["角色与创作"];
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(list[0]);
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/forum/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body, tags, topic }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setErr((j && j.error) || "发布失败");
        return;
      }
      const id = j && j.post && j.post.id;
      if (id) {
        router.push(`/post/${id}`);
        router.refresh();
      }
    } catch {
      setErr("网络错误，稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="newpost-form" onSubmit={submit}>
      <label className="newpost-field">
        <span>标题</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="一句话说清楚你想聊什么"
          maxLength={80}
          required
        />
      </label>
      <div className="newpost-row">
        <label className="newpost-field">
          <span>分区</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {list.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="newpost-field">
          <span>标签（逗号分隔，最多 5 个）</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="剧情, 妹妹"
            maxLength={120}
          />
        </label>
      </div>
      <label className="newpost-field">
        <span>正文</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="展开说说。换行会保留。"
          rows={10}
          maxLength={4000}
          required
        />
      </label>
      {err ? <p className="newpost-err">{err}</p> : null}
      <button className="me-btn primary" disabled={busy}>
        {busy ? "发布中…" : "发布"}
      </button>
    </form>
  );
}
