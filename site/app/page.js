import Link from "next/link";
import Nav from "../components/Nav";
import { loadCards, allTags } from "../lib/cards";
import { requirePass } from "../lib/gate";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  const q = (sp.q || "").toString().trim().toLowerCase();
  const tag = (sp.tag || "").toString();

  const all = loadCards();
  let cards = all;
  if (tag) cards = cards.filter((c) => (c.tags || []).includes(tag));
  if (q)
    cards = cards.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );

  const tags = allTags(all).slice(0, 14);

  return (
    <div className="shell">
      <Nav />
      <div className="page">
        <header className="hero">
          <h1>让幻想有回应</h1>
          <p>
            {all.length} 张角色卡，随时开一场对话。额度由后台池子统一供给，余额不到时会自动换号续上。
          </p>
          <div className="chips">
            <Link href="/" className={`chip ${!tag && !q ? "on" : ""}`}>
              全部 {all.length}
            </Link>
            {tags.map(([t, n]) => (
              <Link
                key={t}
                href={`/?tag=${encodeURIComponent(t)}`}
                className={`chip ${tag === t ? "on" : ""}`}
              >
                {t} {n}
              </Link>
            ))}
          </div>
        </header>

        {cards.length === 0 ? (
          <div className="panel state">
            没有匹配的角色卡。{all.length === 0 && "（卡片库为空，先跑 scripts/seed_cards.py）"}
          </div>
        ) : (
          <div className="grid">
            {cards.map((c) => (
              <Link className="card" href={`/card/${c.id}`} key={c.id}>
                <div className="cover">
                  {c.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover} alt={c.name} loading="lazy" />
                  ) : null}
                  {c.isSensitive ? <span className="badge">18+</span> : null}
                </div>
                <div className="name">{c.name}</div>
                <div className="meta">
                  <span>{c.creator || "匿名"}</span>
                  <span>·</span>
                  <span>♥ {c.likes ?? 0}</span>
                </div>
                <div className="tags">
                  {(c.tags || []).slice(0, 3).map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
