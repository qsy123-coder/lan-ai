import Link from "next/link";

// 分类卡：封面 + 名称 + 简介 + 标签 + 角色数。
// 点击后回到首页，用 ?cat=<name> 按该分类的标签过滤卡片。
export default function CategoryGrid({ categories = [], compact = false }) {
  if (!categories.length) {
    return (
      <div className="state-panel">
        <div className="state-badge">空</div>
        <p>分类数据未加载。</p>
      </div>
    );
  }

  return (
    <div className={`cat-grid${compact ? " compact" : ""}`}>
      {categories.map((c) => {
        const tags = c.tags || [];
        return (
          <Link
            key={c.id}
            href={`/?cat=${encodeURIComponent(c.name)}`}
            className="cat-card press"
          >
            <div className="cat-cover">
              {c.coverImageUrl ? (
                <img
                  src={`/api/img?u=${encodeURIComponent(c.coverImageUrl)}&w=640`}
                  alt={c.displayName}
                  loading="eager"
                  decoding="async"
                />
              ) : null}
              {c.isNew ? <span className="cat-new">NEW</span> : null}
            </div>
            <div className="cat-body">
              <div className="cat-title-row">
                <h3>{c.displayName}</h3>
                <span className="cat-count">{c.count ?? 0}</span>
              </div>
              {c.description ? <p className="cat-desc">{c.description}</p> : null}
              {tags.length ? (
                <div className="cat-tags">
                  {tags.slice(0, 4).map((t) => (
                    <span key={t} className="cat-tag">
                      {t}
                    </span>
                  ))}
                  {tags.length > 4 ? (
                    <span className="cat-tag more">+{tags.length - 4}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
