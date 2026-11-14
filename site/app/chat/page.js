import Link from "next/link";
import { redirect } from "next/navigation";
import ChatClient from "../../components/ChatClient";
import Nav from "../../components/Nav";
import { getCard, loadCards } from "../../lib/cards";
import { requirePass } from "../../lib/gate";

export const dynamic = "force-dynamic";

export default async function ChatPage({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  const id = sp.card;
  if (!id) {
    const first = loadCards()[0];
    if (first) redirect(`/chat?card=${first.id}`);
    return (
      <div className="shell">
        <div className="page state" style={{ paddingTop: 120 }}>
          卡片库为空，先跑 scripts/seed_cards.py 抓种子卡片。
        </div>
      </div>
    );
  }
  const card = getCard(id);
  if (!card) {
    // 卡片不在库里（下架 / 重构丢卡 / 老会话引用的 ID）：
    // 以前直接 redirect("/")，用户点会话历史会「莫名回首页」；这里给明确状态页。
    return (
      <div className="shell">
        <Nav />
        <main className="detail-wrap detail-wrap-single">
          <div className="state-panel">
            <div className="state-badge">这张卡暂时不可用</div>
            <p>
              卡片可能已下架或未收录（ID {String(id)}）。
              <br />
              你的会话记录还在，可以回首页换一张卡继续。
            </p>
            <Link className="btn-chat" href="/">回到首页挑角色</Link>
          </div>
        </main>
      </div>
    );
  }
  return <ChatClient card={card} />;
}
