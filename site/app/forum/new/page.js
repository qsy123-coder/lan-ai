import Link from "next/link";
import Nav from "../../../components/Nav";
import NewPostForm from "../../../components/NewPostForm";
import { requirePass } from "../../../lib/gate";
import { engineJson } from "../../../lib/engine";
import { tokenFromCookies } from "../../../lib/session";
import "../forum.css";
import "../../account.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "发帖 · 澜" };

export default async function NewPostPage() {
  await requirePass();
  const token = await tokenFromCookies();
  let user = null;
  let meta = { topics: [] };
  if (token) {
    const r = await engineJson(`/site/forum?token=${encodeURIComponent(token)}`);
    if (r.status === 200 && r.data) {
      user = r.data.user || null;
      meta = r.data.meta || meta;
    }
  }

  return (
    <div className="shell">
      <Nav />
      <main className="page newpost-page">
        <header className="forum-head">
          <div>
            <p className="forum-kicker">广场</p>
            <h1>发帖</h1>
            <p className="forum-sub">标题说清楚想聊什么，正文换行会保留。</p>
          </div>
          <Link href="/forum" className="me-btn ghost press">返回广场</Link>
        </header>

        {user ? (
          <NewPostForm topics={meta.topics || []} />
        ) : (
          <div className="me-guest">
            <div>
              <p className="me-kicker">还没有登录</p>
              <h2>登录后才能发帖</h2>
              <p>注册即送 100 credit，登录后回到这里继续。</p>
            </div>
            <div className="me-actions">
              <Link href="/sign-in" className="me-btn primary press">登录 / 注册</Link>
              <Link href="/forum" className="me-btn ghost press">先逛逛</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
