import Link from "next/link";
import Nav from "../../../components/Nav";
import { requirePass } from "../../../lib/gate";

/**
 * 卡片不在库里的落点。
 * 之前直接走 Next 默认 404 —— 返回 200 但页面是空壳，
 * 看起来像「详情页坏掉、还滚不动」，实际是这张卡根本没在 cards.json 里。
 */
export default async function CardNotFound() {
  await requirePass();

  return (
    <div className="shell">
      <Nav />
      <main className="detail-wrap detail-wrap-single">
        <div className="state-panel">
          <div className="state-badge">找不到这张卡</div>
          <p>
            它可能已经下架，或者不在当前卡库里。
            <br />
            换一张角色继续吧。
          </p>
          <Link className="btn-chat" href="/">
            回到首页挑角色
          </Link>
        </div>
      </main>
    </div>
  );
}
