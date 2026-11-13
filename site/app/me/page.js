import Link from "next/link";
import Nav from "../../components/Nav";
import LogoutButton from "../../components/LogoutButton";
import CheckinButton from "../../components/CheckinButton";
import { requirePass } from "../../lib/gate";
import { getPool } from "../../lib/pool";
import { engineJson } from "../../lib/engine";
import { tokenFromCookies } from "../../lib/session";
import "../account.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的 · 澜" };

const TYPE = {
  grant: "注册赠礼",
  charge: "生成扣费",
  recharge: "充值",
  checkin: "每日签到",
  prepay: "预扣",
  settle: "结算",
  refund: "退款",
};

function fmtTime(ts) {
  try {
    return new Date(Number(ts) * 1000).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// 不把池里的账号名暴露到前台：前台只看到序号。
function accountLabel(index) {
  return `账号 ${String(index + 1).padStart(2, "0")}`;
}

function Ledger({ entries }) {
  if (!entries.length) return <p className="me-empty">还没有积分记录。</p>;
  return (
    <ul className="ledger">
      {entries.map((e, i) => (
        <li key={i}>
          <span className="ledger-type">{TYPE[e.type] || e.type}</span>
          <span className="ledger-note">
            {e.note || ""}
            <small>{fmtTime(e.ts)}</small>
          </span>
          <b className={Number(e.amount) < 0 ? "minus" : "plus"}>
            {Number(e.amount) > 0 ? "+" : ""}
            {Number(e.amount).toFixed(2)}
          </b>
          <span className="ledger-bal">{Number(e.balance).toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function MePage() {
  await requirePass();
  const token = await tokenFromCookies();
  const pool = await getPool();

  let user = null;
  let entries = [];
  let checkin = null;
  if (token) {
    const me = await engineJson(`/site/user/me?token=${encodeURIComponent(token)}`);
    if (me.status === 200 && me.data && me.data.user) {
      user = me.data.user;
      const lg = await engineJson(
        `/site/credits/ledger?token=${encodeURIComponent(token)}&limit=12`
      );
      if (lg.status === 200 && lg.data && Array.isArray(lg.data.entries)) {
        entries = lg.data.entries;
      }
      const ck = await engineJson(
        `/site/credits/checkin?token=${encodeURIComponent(token)}`
      );
      if (ck.status === 200 && ck.data) {
        if (ck.data.user) user = ck.data.user;
        checkin = ck.data.checkin || null;
      }
    }
  }

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
          <h1>{user ? "我的积分" : "额度与账号"}</h1>
          <p className="me-sub">
            登录后生成本会计入你的积分账本；下面还有本站账号池的实时状态。
            不登录也能以游客身份对话，只是不记账。
          </p>
        </header>

        {user ? (
          <section className="me-account">
            <div className="me-account-top">
              <div>
                <p className="acct-label">当前积分</p>
                <p className="acct-big">{Number(user.credit).toFixed(2)}</p>
                <p className="acct-hint">
                  {user.name} · {user.email}
                  <span className={`vip-badge${user.vip > 0 ? " on" : ""}`}>
                    {user.vip > 0 ? `VIP${user.vip}` : "普通用户"}
                  </span>
                </p>
              </div>
              <div className="me-actions">
                <Link href="/pricing" className="me-btn primary press">充值</Link>
                <LogoutButton />
              </div>
            </div>
            <div className="checkin-row">
              <div>
                <p className="acct-label">每日签到</p>
                <p className="checkin-sub">
                  {checkin && checkin.checkedToday
                    ? `今天已签到 · 连续 ${checkin.streak} 天`
                    : `连续 ${(checkin && checkin.streak) || 0} 天 · 今日 +${(checkin && checkin.rewardNext) || 5}`}
                </p>
              </div>
              <CheckinButton
                checked={!!(checkin && checkin.checkedToday)}
                reward={(checkin && checkin.rewardNext) || 5}
              />
            </div>
            <div className="ledger-head">
              <h2>最近记录</h2>
              <span>{entries.length} 条</span>
            </div>
            <Ledger entries={entries} />
            <div className="task-block">
              <div className="ledger-head">
                <h2>任务</h2>
                <span>运营</span>
              </div>
              <ul className="task-list">
                <li>
                  <span>每日签到</span>
                  <em>
                    {checkin && checkin.checkedToday ? "已完成" : "待完成"} · +
                    {(checkin && checkin.rewardNext) || 5}
                  </em>
                </li>
                <li>
                  <span>注册赠礼</span>
                  <em>已完成 · +100</em>
                </li>
                <li>
                  <span>邀请好友</span>
                  <em className="off">即将上线</em>
                </li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="me-guest">
            <div>
              <p className="me-kicker">还没有登录</p>
              <h2>登录后开始记账</h2>
              <p>注册即送 100 credit；游客对话仍可用，但不会产生积分记录。</p>
            </div>
            <div className="me-actions">
              <Link href="/login" className="me-btn primary press">登录 / 注册</Link>
              <Link href="/pricing" className="me-btn ghost press">会员与价格</Link>
            </div>
          </section>
        )}

        <div className="me-divider">
          <span>本站额度池 · 运营视角</span>
        </div>

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
          说明：池内 credit 是后台账号池的余额；你的积分账本与它分开，本站不提供真实充值、提现或退款。
        </p>
      </main>
    </div>
  );
}
