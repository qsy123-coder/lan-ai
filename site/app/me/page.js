import Link from "next/link";
import Nav from "../../components/Nav";
import { requirePass } from "../../lib/gate";
import { getPool } from "../../lib/pool";
import "../account.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的 · 澜" };

// 不把池里的账号名暴露到前台：前台只看到序号。
function accountLabel(index) {
  return `账号 ${String(index + 1).padStart(2, "0")}`;
}

export default async function MePage() {
  await requirePass();
  const pool = await getPool();
  const pct = pool.count ? Math.round((pool.usable / pool.count) * 100) : 0;
  const credit = pool.total.toFixed(2);
  const visible = pool.accounts.slice(0, 12);
  const rest = pool.accounts.slice(12);

  return (
    <div className="shell">
      <Nav />
      <main className="page me-page">
        <header className="me-head">
          <p className="me-kicker">我的</p>
          <h1>额度与账号</h1>
          <p className="me-sub">
            这个站的所有生成都由后台账号池转发。下面是池子的实时状态，
            不需要登录，也不涉及真实支付。
          </p>
        </header>

        <section className={`me-hero${pool.offline ? " is-offline" : ""}`}>
          <div className="me-hero-main">
            <p className="me-label">池内可用额度</p>
            <p className="me-big">{pool.offline ? "—" : credit}</p>
            <p className="me-hint">
              {pool.offline ? "引擎未启动，稍后再试" : "credit · 按账号实时汇总"}
            </p>
          </div>
          <div className="me-progress" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="me-hero-foot">
            <span>可用 {pool.usable} / {pool.count}</span>
            <span>{pool.offline ? "离线" : `${pct}%`}</span>
          </div>
        </section>

        <section className="me-stats" aria-label="池子概览">
          <div className="me-stat">
            <b>{pool.count}</b>
            <span>账号总数</span>
          </div>
          <div className="me-stat">
            <b>{pool.usable}</b>
            <span>可用账号</span>
          </div>
          <div className="me-stat">
            <b>{pool.offline ? "—" : pool.total.toFixed(0)}</b>
            <span>池内 credit</span>
          </div>
        </section>

        <section className="me-actions" aria-label="快捷入口">
          <Link href="/chat" className="me-btn primary press">开始对话</Link>
          <Link href="/pricing" className="me-btn ghost press">会员与价格</Link>
          <Link href="/about" className="me-btn ghost press">关于本站</Link>
        </section>

        <section className="me-list">
          <div className="me-list-head">
            <h2>账号明细</h2>
            <span>{pool.offline ? "离线" : `${pool.count} 个`}</span>
          </div>
          {pool.accounts.length ? (
            <>
              <ul>
                {visible.map((a, i) => (
                  <li key={i}>
                    <span className="me-name">{accountLabel(i)}</span>
                    <span className={`me-pill ${a.usable ? "ok" : "off"}`}>
                      {a.usable ? "可用" : "停用"}
                    </span>
                    <b>{Number(a.credit || 0).toFixed(2)}</b>
                  </li>
                ))}
              </ul>
              {rest.length ? (
                <details className="me-more">
                  <summary>展开其余 {rest.length} 个账号</summary>
                  <ul>
                    {rest.map((a, i) => (
                      <li key={i + visible.length}>
                        <span className="me-name">{accountLabel(i + visible.length)}</span>
                        <span className={`me-pill ${a.usable ? "ok" : "off"}`}>
                          {a.usable ? "可用" : "停用"}
                        </span>
                        <b>{Number(a.credit || 0).toFixed(2)}</b>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          ) : (
            <p className="me-empty">
              {pool.offline ? "引擎未启动，读不到账号池。" : "账号池为空。"}
            </p>
          )}
        </section>

        <p className="me-note">
          说明：credit 是后台账号池的余额，不是你的个人钱包；本站不提供充值、提现或退款。
        </p>
      </main>
    </div>
  );
}
