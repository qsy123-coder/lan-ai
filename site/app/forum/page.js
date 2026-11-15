import Link from "next/link";
import Nav from "../../components/Nav";
import { requirePass } from "../../lib/gate";
import { engineJson } from "../../lib/engine";
import { tokenFromCookies } from "../../lib/session";
import "./forum.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "论坛 · 澜" };

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

const EMPTY_META = { topics: [], groups: [], hotTags: [] };

export default async function ForumPage({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  const topic = (sp.topic || "最新").toString();
  const tag = (sp.tag || "").toString();
  const sort = (sp.sort || "latest").toString();
  const q = (sp.q || "").toString();
  const token = await tokenFromCookies();

  const params = new URLSearchParams();
  if (topic && topic !== "最新") params.set("topic", topic);
  if (tag) params.set("tag", tag);
  if (sort) params.set("sort", sort);
  if (q) params.set("q", q);
  if (token) params.set("token", token);

  const r = await engineJson(`/site/forum?${params.toString()}`);
  const data = r.status === 200 && r.data ? r.data : { posts: [], meta: EMPTY_META, user: null };
  const posts = data.posts || [];
  const meta = data.meta || EMPTY_META;
  const user = data.user || null;
  const topics = ["最新", ...(meta.topics || [])];

  const qlink = (patch) => {
    const m = { topic, tag, sort, q, ...patch };
    const u = new URLSearchParams();
    if (m.topic && m.topic !== "最新") u.set("topic", m.topic);
    if (m.tag) u.set("tag", m.tag);
    if (m.sort && m.sort !== "latest") u.set("sort", m.sort);
    if (m.q) u.set("q", m.q);
    const s = u.toString();
    return s ? `/forum?${s}` : "/forum";
  };

  return (
    <div className="shell">
      <Nav />
      <main className="page forum-page">
        <aside className="forum-side">
          <p className="forum-side-title">分区</p>
          <nav className="forum-topics" aria-label="分区">
            {topics.map((t) => (
              <Link
                key={t}
                href={qlink({ topic: t })}
                className={`forum-topic${topic === t ? " on" : ""}`}
              >
                {t}
              </Link>
            ))}
          </nav>
          <div className="forum-side-foot">
            <Link href="/">角色</Link>
            <Link href="/me">我的</Link>
          </div>
        </aside>

        <section className="forum-main">
          <header className="forum-head">
            <div>
              <p className="forum-kicker">广场</p>
              <h1>角色之外</h1>
              <p className="forum-sub">聊卡、聊剧情、找搭子。登录后可发帖、评论和点赞。</p>
            </div>
            {user ? (
              <Link href="/forum/new" className="me-btn primary press">发帖</Link>
            ) : (
              <Link href="/sign-in" className="me-btn ghost press">登录发帖</Link>
            )}
          </header>

          <div className="forum-toolbar">
            <div className="forum-sorts">
              <Link href={qlink({ sort: "latest" })} className={sort !== "hot" ? "on" : ""}>
                最新
              </Link>
              <Link href={qlink({ sort: "hot" })} className={sort === "hot" ? "on" : ""}>
                热门
              </Link>
            </div>
            <form className="forum-search" action="/forum" method="get">
              <input name="q" defaultValue={q} placeholder="搜索帖子" aria-label="搜索帖子" />
              {topic !== "最新" ? <input type="hidden" name="topic" value={topic} /> : null}
              {tag ? <input type="hidden" name="tag" value={tag} /> : null}
              <button type="submit">搜索</button>
            </form>
          </div>

          {tag ? (
            <div className="forum-filter">
              <span>标签：#{tag}</span>
              <Link href={qlink({ tag: "" })}>清除</Link>
            </div>
          ) : null}

          {posts.length ? (
            <div className="forum-list">
              {posts.map((p) => (
                <Link key={p.id} href={`/post/${p.id}`} className="forum-post">
                  <div className="forum-post-top">
                    {p.pinned ? <span className="forum-pin">置顶</span> : null}
                    <span className="forum-ptopic">{p.topic}</span>
                    <span className="forum-time">{fmtTime(p.createdAt)}</span>
                  </div>
                  <h2>{p.title}</h2>
                  {p.excerpt ? <p className="forum-excerpt">{p.excerpt}</p> : null}
                  <div className="forum-post-foot">
                    <span className="forum-author">
                      @{p.author}
                      {p.authorLevel > 1 ? <em>VIP{p.authorLevel}</em> : null}
                    </span>
                    <span className="forum-tags">
                      {(p.tags || []).map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </span>
                    <span className="forum-counts">赞 {p.likes} · 评 {p.commentCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="state-panel">
              <div className="state-badge">空</div>
              <p>这个分区还没有帖子。</p>
            </div>
          )}
        </section>

        <aside className="forum-right">
          <div className="forum-box">
            <h3>关于广场</h3>
            <p>角色之外的第二客厅。聊卡、聊剧情、找搭子；真人专区只聊日常，不发图。</p>
          </div>
          <div className="forum-box">
            <h3>热门标签</h3>
            <div className="forum-hot">
              {(meta.hotTags || []).map((t) => (
                <Link
                  key={t.tag}
                  href={qlink({ tag: tag === t.tag ? "" : t.tag })}
                  className={tag === t.tag ? "on" : ""}
                >
                  #{t.tag}
                  <em>{t.count}</em>
                </Link>
              ))}
            </div>
          </div>
          <div className="forum-box">
            <h3>活跃群组</h3>
            <ul className="forum-groups">
              {(meta.groups || []).map((g) => (
                <li key={g.name}>
                  <span>{g.name}</span>
                  <em>{g.members} 人</em>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
