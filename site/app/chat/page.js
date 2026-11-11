import { redirect } from "next/navigation";
import ChatClient from "../../components/ChatClient";
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
  if (!card) redirect("/");
  return <ChatClient card={card} />;
}
