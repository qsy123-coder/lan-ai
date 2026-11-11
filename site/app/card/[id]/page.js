import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import { getCard } from "../../../lib/cards";
import { requirePass } from "../../../lib/gate";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }) {
  await requirePass();
  const { id } = await params;
  const c = getCard(id);
  if (!c) notFound();

  return (
    <div className="shell">
      <Nav />
      <div className="page">
        <div className="detail">
          <div>
            <div className="big">
              {c.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.cover} alt={c.name} />
              ) : null}
            </div>
          </div>
          <div>
            <h1>{c.name}</h1>
            <div className="byline">
              {c.creatorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="avatar" src={c.creatorAvatar} alt={c.creator} />
              ) : null}
              <span>{c.creator || "匿名创作者"}</span>
              <span>·</span>
              <span>♥ {c.likes ?? 0}</span>
              <span>·</span>
              <span>{c.comments ?? 0} 评论</span>
            </div>

            <div className="chips" style={{ marginTop: 16 }}>
              {(c.tags || []).map((t) => (
                <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="tag">
                  {t}
                </Link>
              ))}
            </div>

            <div className="cta">
              <Link className="btn btn-primary" href={`/chat?card=${c.id}`}>
                开始对话
              </Link>
              <Link className="btn btn-ghost" href="/">
                返回列表
              </Link>
            </div>

            <div className="panel" style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.025em", color: "rgba(32,41,41,.5)", marginBottom: 10 }}>
                创作者说明
              </div>
              <div className="notes">{c.creatorNotes || "这张卡还没有创作说明。"}</div>
            </div>

            {c.images?.length ? (
              <div className="grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))", paddingBottom: 0, marginTop: 16 }}>
                {c.images.slice(0, 4).map((u) => (
                  <div className="cover" key={u} style={{ aspectRatio: "16 / 10" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
