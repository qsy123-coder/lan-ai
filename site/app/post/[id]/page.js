import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import PostActions from "../../../components/PostActions";
import { requirePass } from "../../../lib/gate";
import { engineJson } from "../../../lib/engine";
import { tokenFromCookies } from "../../../lib/session";
import "../../forum/forum.css";

export const dynamic = "force-dynamic";

function fmtTime(ts) {
  try {
    return new Date(Number(ts) * 1000).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `帖子 ${id} · 澜` };
}

export default async function PostPage({ params }) {
  await requirePass();
  const { id } = await params;
  const token = await tokenFromCookies();
  const qs = new URLSearchParams({ id });
  if (token) qs.set("token", token);
  const r = await engineJson(`/site/forum/post?${qs.toString()}`);
  if (r.status !== 200 || !r.data || !r.data.post) notFound();
  const post = r.data.post;
  const user = r.data.user || null;

  return (
    <div className="shell">
      <Nav />
      <main className="page post-page">
        <Link href="/forum" className="post-back">← 返回广场</Link>
        <article className="post-card">
          <div className="post-meta">
            {post.pinned ? <span className="forum-pin">置顶</span> : null}
            <span className="forum-ptopic">{post.topic}</span>
            <span className="forum-time">{fmtTime(post.createdAt)}</span>
          </div>
          <h1>{post.title}</h1>
          <div className="post-author">
            @{post.author}
            {post.authorLevel > 1 ? <em>VIP{post.authorLevel}</em> : null}
          </div>
          <div className="post-body">{post.body}</div>
          {post.tags && post.tags.length ? (
            <div className="post-tags">
              {post.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          ) : null}
          <PostActions post={post} loggedIn={!!user} />
        </article>

        <section className="post-comments">
          <h2>评论 {post.commentCount}</h2>
          {post.comments && post.comments.length ? (
            <ul>
              {post.comments.map((c) => (
                <li key={c.id}>
                  <div className="comment-head">
                    <span className="comment-author">
                      @{c.author}
                      {c.authorLevel > 1 ? <em>VIP{c.authorLevel}</em> : null}
                    </span>
                    <span className="forum-time">{fmtTime(c.createdAt)}</span>
                  </div>
                  <p>{c.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="post-empty">还没有评论，坐个沙发。</p>
          )}
        </section>
      </main>
    </div>
  );
}
