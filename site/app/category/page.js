import Link from "next/link";
import Nav from "../../components/Nav";
import CategoryGrid from "../../components/CategoryGrid";
import { requirePass } from "../../lib/gate";
import { lightCards } from "../../lib/cards";
import { categoriesWithCounts } from "../../lib/categories";
import "./category.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "分类 · 澜" };

export default async function CategoryPage() {
  await requirePass();
  const cards = lightCards();
  const categories = categoriesWithCounts(cards);

  return (
    <div className="shell">
      <Nav />
      <main className="page cat-page">
        <header className="cat-head">
          <p className="cat-kicker">分类</p>
          <h1>角色分类</h1>
          <p className="cat-sub">
            按 dzmm.ai 的 <code>category.list</code> 复刻，共 {categories.length} 个分类 ·{" "}
            {cards.length} 张角色卡。点分类按标签筛选。
          </p>
          <div className="cat-head-actions">
            <Link href="/" className="cat-back">← 返回角色</Link>
          </div>
        </header>
        <CategoryGrid categories={categories} />
      </main>
    </div>
  );
}
