import Link from "next/link";
import Nav from "../components/Nav";
import HomeGrid from "../components/HomeGrid";
import { lightCards, allTags } from "../lib/cards";
import { requirePass } from "../lib/gate";

export const dynamic = "force-dynamic";

// 一级 tab（照 dzmm：关注 最新 猜你喜欢 周榜▾ 比赛 分类 游戏 画图 社群）
const TABS = [
  { key: "", label: "最新" },
  { key: "guess", label: "猜你喜欢" },
  { key: "week", label: "周榜", caret: true },
  { key: "match", label: "比赛" },
  { key: "cat", label: "分类" },
  { key: "game", label: "游戏" },
  { key: "draw", label: "画图" },
  { key: "group", label: "社群" },
];

// 二级胶囊行
const PILLS = [
  { key: "match", label: "匹配", icon: "✕" },
  { key: "pure", label: "纯白", icon: "◌" },
  { key: "draw", label: "画图", icon: "▣" },
  { key: "novel", label: "小说", icon: "▤" },
  { key: "team", label: "团本", icon: "✚" },
  { key: "idea", label: "悬赏", icon: "◈" },
  { key: "task", label: "任务", icon: "◷" },
];

const SORTERS = {
  week: (a, b) => (b.likes ?? 0) - (a.likes ?? 0),
  guess: (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
};

export default async function Home({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  const q = (sp.q || "").toString().trim().toLowerCase();
  const tag = (sp.tag || "").toString();
  const tab = (sp.tab || "").toString();
  const pill = (sp.pill || "").toString();

  const all = lightCards();
  let cards = all;

  if (tab === "match" || pill === "match")
    cards = cards.filter((c) => (c.tags || []).includes("参赛卡"));
  if (tag) cards = cards.filter((c) => (c.tags || []).includes(tag));
  if (q)
    cards = cards.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );

  const sorter = SORTERS[tab];
  if (sorter) cards = [...cards].sort(sorter);

  const total = cards.length;
  const tags = allTags(all).slice(0, 12);
  const noSource = ["game", "draw", "group"].includes(tab);

  const qs = (patch) => {
    const merged = { q, tag, tab, pill, ...patch };
    const u = new URLSearchParams();
    if (merged.q) u.set("q", merged.q);
    if (merged.tag) u.set("tag", merged.tag);
    if (merged.tab) u.set("tab", merged.tab);
    if (merged.pill) u.set("pill", merged.pill);
    const s = u.toString();
    return s ? `/?${s}` : "/";
  };

  const covers = cards.reduce((m, c) => {
    if (c.cover) m[c.id] = `/api/img?u=${encodeURIComponent(c.cover)}&w=320`;
    return m;
  }, {});

  return (
    <div className="shell">
      <div className="scene" aria-hidden="true" />
      <Nav />
      <div className="home-wrap">
        <nav className="home-tabs" aria-label="频道">
          {TABS.map((t) => (
            <Link
              key={t.key || "new"}
              href={qs({ tab: t.key, tag: "", q: "", pill: "" })}
              className={`home-tab ${tab === t.key ? "on" : ""}`}
            >
              {t.label}
              {t.caret ? <span className="tab-caret">▾</span> : null}
            </Link>
          ))}
        </nav>

        <div className="home-pills">
          {PILLS.map((p) => (
            <Link
              key={p.key}
              href={qs({ pill: pill === p.key ? "" : p.key })}
              className={`pill ${pill === p.key ? "on" : ""}`}
            >
              <i aria-hidden="true">{p.icon}</i>
              {p.label}
            </Link>
          ))}
        </div>

        {noSource ? (
          <div className="state-panel">
            <div className="state-badge">未接入</div>
            <p>这个频道还没有内容源。</p>
          </div>
        ) : total === 0 ? (
          <div className="state-panel">
            <div className="state-badge">空</div>
            <p>没有匹配的角色卡。</p>
          </div>
        ) : (
          <HomeGrid cards={cards} covers={covers} />
        )}

        {tags.length ? (
          <div className="home-tagrow">
            <span className="home-tagrow-t">热门标签</span>
            {tags.map(([t, n]) => (
              <Link key={t} href={qs({ tag: t })} className={`tag ${tag === t ? "on" : ""}`}>
                {t}
                <em>{n}</em>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
