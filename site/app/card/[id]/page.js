import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import SensitiveCover from "../../../components/SensitiveCover";
import { getCard } from "../../../lib/cards";
import { requirePass } from "../../../lib/gate";

export const dynamic = "force-dynamic";

const imgSrc = (u, w) => (u ? `/api/img?u=${encodeURIComponent(u)}&w=${w}` : "");

function relTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!t) return "";
  const d = Math.max(0, Date.now() - t);
  const day = Math.floor(d / 864e5);
  if (day < 1) return "今天";
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  return mo < 12 ? `${mo} 个月前` : `${Math.floor(mo / 12)} 年前`;
}

const fmt = (n) => {
  const v = Math.round(Number(n) || 0);
  return v >= 10000 ? (v / 10000).toFixed(1) + "万" : String(v);
};

export default async function CardPage({ params }) {
  await requirePass();
  const { id } = await params;
  const c = getCard(id);
  if (!c) notFound();

  const covers = c.images?.length ? c.images.slice(0, 1) : [];

  return (
    <div className="shell">
      <div className="scene" aria-hidden="true" />
      <Nav />
      <main className="detail-wrap">
        {/* 左：封面（敏感卡跟随顶栏「隐藏敏感内容」开关） */}
        <div className="detail-media">
          <div className="big">
            {c.cover ? (
              <SensitiveCover
                src={imgSrc(c.cover, 720)}
                alt={c.name}
                sensitive={!!c.isSensitive}
              />
            ) : null}
            <div className="big-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
              </svg>
              {fmt(c.popularity)}
            </div>
            {c.images?.length > 1 ? <div className="big-dots">●●●</div> : null}
          </div>
        </div>

        {/* 右：信息 */}
        <div className="detail-body">
          <h1 className="detail-title">{c.name}</h1>

          <div className="detail-sub">
            <span>#{c.id}</span>
            <span>·</span>
            <span>{relTime(c.publishedAt)}</span>
          </div>

          <div className="detail-author">
            <div className="au-left">
              {c.creatorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="au-av" src={imgSrc(c.creatorAvatar, 96)} alt={c.creator} />
              ) : (
                <span className="au-av" />
              )}
              <div className="au-meta">
                <b>{c.creator || "匿名创作者"}</b>
                <span>{fmt(c.popularity)} 播放</span>
              </div>
            </div>
            <button className="follow-btn press" type="button">
              <span aria-hidden="true">＋</span>关注
            </button>
          </div>

          <div className="detail-stats">
            <span className="st">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-7-4.3-7-9.2A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.8C19 15.7 12 20 12 20z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              {c.likes ?? 0}
            </span>
            <span className="st">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 12a8 8 0 1 1-3.3-6.5M20 5v4h-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              {c.comments ?? 0}
            </span>
            {c.rating ? (
              <span className="st">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4.5l2.3 4.7 5.2.7-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 9.9l5.2-.7z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                {Number(c.rating).toFixed(2)}
              </span>
            ) : null}
            <span className="st">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14 4l6 6-9 9H5v-6z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              分享
            </span>
          </div>

          <div className="detail-tags">
            {(c.tags || []).map((t) => (
              <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="dtag">
                {t}
              </Link>
            ))}
          </div>

          <div className="detail-actions">
            <Link className="btn-chat" href={`/chat?card=${c.id}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              开始对话
            </Link>
            <button className="btn-susp press" type="button">
              <span aria-hidden="true">⚑</span>悬赏
            </button>
          </div>

          <section className="notes-card">
            <div className="notes-head">
              <span className="notes-bar" aria-hidden="true" />
              角色介绍
            </div>
            <div className="notes">{c.creatorNotes || "这张卡还没有创作说明。"}</div>
          </section>

          {c.images?.length ? (
            <section className="gallery">
              {c.images.slice(0, 6).map((u) => (
                <div className="gitem" key={u}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc(u, 480)} alt="" loading="lazy" decoding="async" />
                </div>
              ))}
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
