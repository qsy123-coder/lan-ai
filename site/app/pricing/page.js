import Link from "next/link";
import Nav from "../../components/Nav";
import RechargeDemo from "../../components/RechargeDemo";
import { requirePass } from "../../lib/gate";
import { engineJson } from "../../lib/engine";
import { tokenFromCookies } from "../../lib/session";
import "../account.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "会员与价格 · 澜" };

const TIERS = [
  { price: "¥10", credit: "137", vip: "VIP1" },
  { price: "¥50", credit: "856", vip: "VIP1" },
  { price: "¥100", credit: "2,055", vip: "VIP2" },
  { price: "¥400", credit: "10,958", vip: "VIP3" },
];

const VIP_ROWS = [
  ["深度思考", "✓", "✓", "✓"],
  ["记忆增强", "✓", "✓", "✓"],
  ["MAX 模型使用权（使用仍扣积分）", "✓", "✓", "✓"],
  ["64K 模型", "—", "—", "✓"],
  ["API 调用", "50 次/分钟", "更高", "最高"],
  ["检查点查看", "15 次/日", "更高", "最高"],
  ["Anime 绘图", "15–115 次/日", "更高", "最高"],
  ["编辑图片", "4 次/日", "更高", "最高"],
  ["搜索", "500 次/小时", "更高", "最高"],
];

export default async function PricingPage() {
  await requirePass();
  const token = await tokenFromCookies();
  let user = null;
  if (token) {
    const me = await engineJson(`/site/user/me?token=${encodeURIComponent(token)}`);
    if (me.status === 200 && me.data && me.data.user) user = me.data.user;
  }

  return (
    <div className="shell">
      <Nav />
      <main className="page price-page">
        <header className="price-head">
          <p className="price-kicker">会员与价格</p>
          <h1>积分、充值与 VIP</h1>
          <p className="price-sub">
            下面按 dzmm.ai 的 /pricing 产品定义整理。本站是演示站，
            <b>不提供真实充值、提现或退款</b>，档位只用于说明计费规则。
          </p>
          {user ? (
            <p className="price-hint">
              当前登录：{user.name} · 积分 {Number(user.credit).toFixed(2)} ·{" "}
              {user.vip > 0 ? `VIP${user.vip}` : "普通用户"}（近 30 天充值累计决定等级）
            </p>
          ) : null}
        </header>

        <section className="price-section">
          <h2>积分怎么算</h2>
          <div className="price-notes">
            <div className="price-note">
              <b>预扣 3.2 credit / 条</b>
              <span>每次生成先预扣，完成后按实际 token 结算，约 2.1 credit/条。</span>
            </div>
            <div className="price-note">
              <b>余额不足直接拒</b>
              <span>不会先跑后扣；被拒的请求不扣费，但也不会生成内容。</span>
            </div>
            <div className="price-note">
              <b>credit 不回补</b>
              <span>免费号的 75 credit 是一次性赠礼；每日 08:00 只重置绘图 quota，不动 credit。</span>
            </div>
          </div>
        </section>

        <section className="price-section">
          <h2>充值档位</h2>
          <div className="price-grid">
            {TIERS.map((t) => (
              <div key={t.price} className="price-card">
                <p className="price-amount">{t.price}</p>
                <p className="price-credit">{t.credit} 积分</p>
                <p className="price-vip">{t.vip}</p>
              </div>
            ))}
          </div>
          <p className="price-hint">
            任意充值即 VIP1；近 30 天累计充值决定等级。另有月卡，每天领积分（具体数额以站内为准）。
          </p>
          <RechargeDemo loggedIn={!!user} />
          <p className="price-hint">
            本站用户账本：生成成功后按 2.1 credit/条扣费；余额低于 3.2 时不会发起生成。
          </p>
        </section>

        <section className="price-section">
          <h2>VIP 权益</h2>
          <div className="vip-wrap">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>权益</th>
                  <th>VIP1</th>
                  <th>VIP2</th>
                  <th>VIP3</th>
                </tr>
              </thead>
              <tbody>
                {VIP_ROWS.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="price-hint">
            VIP1 的数值来自站内原文；VIP2 / VIP3 的具体档位站内未公开，表中只写“更高/最高”，不臆造数值。
          </p>
        </section>

        <section className="price-section">
          <h2>月卡</h2>
          <p className="price-body">
            月卡按天发放积分，适合连续使用。演示站不接入支付，所以这里只展示规则，
            实际额度由后台账号池提供。
          </p>
        </section>

        <div className="me-actions">
          <Link href="/me" className="me-btn primary press">返回我的</Link>
          <Link href="/chat" className="me-btn ghost press">开始对话</Link>
        </div>
      </main>
    </div>
  );
}
