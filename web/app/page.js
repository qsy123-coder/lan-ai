"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ---------------- SSE 读取 ---------------- */
async function readSSE(res, onEvent) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let ev = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) ev = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        onEvent(ev, JSON.parse(data));
      } catch {
        /* 忽略非 JSON 帧 */
      }
    }
  }
}

const hhmmss = (t) =>
  new Date(t).toLocaleTimeString("zh-CN", { hour12: false });

export default function Page() {
  const [accounts, setAccounts] = useState([]);
  const [models, setModels] = useState([]);
  const [engineStats, setEngineStats] = useState({});
  const [online, setOnline] = useState(null);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("x-apex-flux-0217-16k");
  const [maxTokens, setMaxTokens] = useState(400);
  const [minCredit, setMinCredit] = useState(3.4);
  const [gap, setGap] = useState(2);
  const [maxCount, setMaxCount] = useState(0);

  const [running, setRunning] = useState(false);
  const [activeName, setActiveName] = useState(null);
  const [stream, setStream] = useState("");
  const [feed, setFeed] = useState([]);
  const [done, setDone] = useState([]);
  const [stats, setStats] = useState({ generated: 0, spent: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const abortRef = useRef(null);
  const streamBox = useRef(null);

  const pushLog = useCallback((level, msg) => {
    setFeed((f) => [...f.slice(-199), { t: Date.now(), level, msg }]);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/pool", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setAccounts(j.accounts || []);
      if (j.models?.length) {
        setModels(j.models);
        setModel((m) => (j.models.some((x) => x.id === m) ? m : j.models[0].id));
      }
      setEngineStats(j.stats || {});
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (streamBox.current) streamBox.current.scrollTop = streamBox.current.scrollHeight;
  }, [stream]);

  const totalCredit = useMemo(
    () => accounts.reduce((s, a) => s + (a.credit || 0), 0),
    [accounts]
  );
  const aliveCount = useMemo(
    () =>
      accounts.filter(
        (a) => !a.exhausted && !a.disabled && (a.credit || 0) >= 3.4
      ).length,
    [accounts]
  );

  /* ---------------- 事件处理 ---------------- */
  const onEvent = useCallback(
    (ev, d) => {
      if (ev === "log") {
        pushLog("info", d.msg);
      } else if (ev === "account") {
        if (d.active) setActiveName(d.name);
        if (typeof d.credit === "number") {
          setAccounts((list) =>
            list.map((a) =>
              a.name === d.name
                ? { ...a, credit: d.credit, exhausted: !!d.exhausted }
                : a
            )
          );
        }
      } else if (ev === "chat") {
        pushLog("info", `${d.account} 会话就绪 · 卡片 ${d.cardId}`);
      } else if (ev === "delta") {
        setStream((s) => s + d.text);
      } else if (ev === "complete") {
        setDone((list) => [
          {
            ...d,
            ts: Date.now(),
            chars: (d.text || "").length,
          },
          ...list,
        ]);
        setStream("");
        setAccounts((list) =>
          list.map((a) =>
            a.name === d.account ? { ...a, credit: d.credit } : a
          )
        );
        pushLog("info", `#${d.index} 完成 · ${d.account} · 剩余 ${d.credit ?? "?"} credit`);
      } else if (ev === "switch") {
        const why =
          d.reason === "credit" ? "余额见底" : d.reason === "auth" ? "登录失效" : d.reason;
        pushLog("warn", `${d.from} → ${why}，切换账号`);
      } else if (ev === "stats") {
        setStats({ generated: d.generated, spent: d.spent });
      } else if (ev === "end") {
        const map = {
          no_credit: "全部账号余额不足，收工",
          max_count: "达到设定条数，收工",
          stopped: "已手动停止",
          empty_pool: "账号池是空的",
          empty_prompt: "提示词为空",
          card_exhausted: "可用角色卡耗尽",
          too_many_errors: "连续失败过多，已停",
          crash: "引擎异常退出",
        };
        pushLog("warn", `结束：${map[d.reason] || d.reason}（本次 ${d.generated ?? 0} 条）`);
        setActiveName(null);
      }
    },
    [pushLog]
  );

  /* ---------------- 开始 / 停止 ---------------- */
  const start = useCallback(async () => {
    if (running || !prompt.trim()) return;
    setRunning(true);
    setStream("");
    setDone([]);
    setFeed([]);
    setStats({ generated: 0, spent: 0 });
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          maxTokens: Number(maxTokens) || 400,
          minCredit: Number(minCredit) || 3.4,
          gap: Number(gap) || 2,
          maxCount: Number(maxCount) || 0,
        }),
        signal: ctl.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t.slice(0, 160)}`);
      }
      await readSSE(res, onEvent);
    } catch (e) {
      if (e.name !== "AbortError") pushLog("error", String(e.message || e));
    } finally {
      setRunning(false);
      setActiveName(null);
      abortRef.current = null;
      load();
    }
  }, [running, prompt, model, maxTokens, minCredit, gap, maxCount, onEvent, pushLog, load]);

  const stop = useCallback(async () => {
    try {
      await fetch("/api/stop", { method: "POST" });
    } catch {
      /* ignore */
    }
    abortRef.current?.abort();
    pushLog("warn", "已发送停止指令");
  }, [pushLog]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/refresh", { method: "POST", body: "{}" });
      const j = await r.json();
      const bad = (j.accounts || []).filter((a) => a.error);
      pushLog("info", `体检完成：${(j.accounts || []).length} 个号，异常 ${bad.length} 个`);
      await load();
    } catch (e) {
      pushLog("error", "体检失败：" + String(e.message || e));
    } finally {
      setRefreshing(false);
    }
  }, [load, pushLog]);

  const accountOp = useCallback(
    async (name, payload) => {
      await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, ...payload }),
      });
      await load();
    },
    [load]
  );

  const exportAll = useCallback(() => {
    const rows = done.map((d) => ({
      account: d.account,
      model: d.model,
      credit_before: d.creditBefore,
      credit_after: d.credit,
      text: d.text,
    }));
    const blob = new Blob([rows.map((r) => JSON.stringify(r)).join("\n")], {
      type: "application/jsonl;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dzmm-${Date.now()}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [done]);

  const canRun = prompt.trim().length > 0 && !running;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="mark">额</div>
          <div>
            <h1>额度池</h1>
            <p>一条提示词 · 自动跨号打满全部余额</p>
          </div>
        </div>

        <span className="pill">
          <i className={`dot ${online === null ? "" : online ? (running ? "busy" : "on") : "off"}`} />
          {online === null ? "连接中" : online ? (running ? "运行中" : "引擎在线") : "引擎离线"}
        </span>
        <span className="pill">
          可用 {aliveCount} / {accounts.length} 号
        </span>
        <span className="pill">
          余额合计 <b style={{ color: "var(--text)", marginLeft: 4 }}>{totalCredit.toFixed(2)}</b>
        </span>
        <span className="pill">
          累计 {engineStats.generated || 0} 条
        </span>
      </header>

      <div className="grid">
        {/* ---------------- 左：控制台 ---------------- */}
        <section className="card composer">
          <div className="card-head">
            <h2>生成</h2>
            <div className="grow" />
            {running && (
              <span className="pill">
                <i className="spin" /> {activeName ? `正在用 ${activeName}` : "准备中"}
              </span>
            )}
          </div>

          <div className="card-body">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) start();
              }}
              placeholder="输入提示词。Ctrl + Enter 直接开跑。同一个提示词会在每个账号上各跑一遍，直到全部余额见底。"
              spellCheck={false}
            />
            <div className="meta-row">
              <span>{prompt.length} 字</span>
              <span>·</span>
              <span>串行发送，每条间隔 {gap}s</span>
              <span>·</span>
              <span>预计每条 ≈ {model === "x-apex-flux-0217-16k" ? "2.1" : "2.1"} credit</span>
            </div>

            <div className="chips">
              {models.map((m) => (
                <button
                  key={m.id}
                  className={`chip ${model === m.id ? "active" : ""}`}
                  onClick={() => setModel(m.id)}
                  disabled={running}
                  type="button"
                >
                  {m.label}
                  <small>{m.hint}</small>
                </button>
              ))}
            </div>

            <div className="params">
              <div className="field">
                <label>最大 token</label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  disabled={running}
                />
              </div>
              <div className="field">
                <label>最低余额（低于则弃号）</label>
                <input
                  type="number"
                  min={3.2}
                  step={0.1}
                  value={minCredit}
                  onChange={(e) => setMinCredit(e.target.value)}
                  disabled={running}
                />
              </div>
              <div className="field">
                <label>间隔（秒）</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={gap}
                  onChange={(e) => setGap(e.target.value)}
                  disabled={running}
                />
              </div>
              <div className="field">
                <label>最多条数（0 = 不限）</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={maxCount}
                  onChange={(e) => setMaxCount(e.target.value)}
                  disabled={running}
                />
              </div>
            </div>

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={start}
                disabled={!canRun}
                type="button"
              >
                {running ? "运行中…" : "开始连续生成"}
              </button>
              {running && (
                <button className="btn btn-danger" onClick={stop} type="button">
                  停止
                </button>
              )}
              {!running && done.length > 0 && (
                <button className="btn btn-ghost" onClick={exportAll} type="button">
                  导出本次 {done.length} 条
                </button>
              )}
              <div className="grow" />
              <span className="pill">
                本次 {stats.generated} 条 · 耗 {stats.spent.toFixed(2)} credit
              </span>
            </div>

            <div className="stream-head" style={{ marginTop: 20 }}>
              <span>实时输出</span>
              {activeName && <span className="tag">{activeName}</span>}
              {running && <span className="tag ok">streaming</span>}
            </div>
            <div className="stream" ref={streamBox}>
              {stream ? (
                <>
                  {stream}
                  {running && <span className="caret" />}
                </>
              ) : (
                <span className="placeholder">
                  {running ? "等待首个 token…" : "尚未开始。"}
                </span>
              )}
            </div>

            {done.length > 0 && (
              <div className="hist">
                <div className="stream-head">
                  <span>本次记录</span>
                  <span className="tag">{done.length}</span>
                </div>
                {done.map((d) => (
                  <div className="hist-item" key={d.ts + d.index}>
                    <div className="hist-meta">
                      <span className="tag">#{d.index}</span>
                      <span>{d.account}</span>
                      <span>·</span>
                      <span>{hhmmss(d.ts)}</span>
                      <span>·</span>
                      <span>{d.chars} 字</span>
                      <span>·</span>
                      <span>
                        {d.creditBefore?.toFixed?.(2)} → {d.credit?.toFixed?.(2)} credit
                      </span>
                      <div className="grow" />
                      <button
                        className="mini"
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(d.text || "")}
                      >
                        复制
                      </button>
                    </div>
                    <div className="hist-text">{d.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------------- 右：账号池 ---------------- */}
        <aside>
          <section className="card">
            <div className="summary">
              <div className="stat">
                <b>{totalCredit.toFixed(1)}</b>
                <span>总余额 credit</span>
              </div>
              <div className="stat">
                <b>{aliveCount}</b>
                <span>可跑账号</span>
              </div>
              <div className="stat">
                <b>{Math.floor(totalCredit / 3.4)}</b>
                <span>≈ 可生成条数</span>
              </div>
            </div>

            <div className="card-head">
              <h2>账号池</h2>
              <div className="grow" />
              <button className="mini" onClick={refresh} disabled={refreshing || running} type="button">
                {refreshing ? "体检中…" : "刷新体检"}
              </button>
            </div>

            <div className="card-body" style={{ paddingTop: 14 }}>
              {accounts.length === 0 && (
                <div className="empty">
                  {online === false ? "引擎未启动，先运行 start.ps1" : "账号池为空"}
                </div>
              )}
              {accounts.map((a) => {
                const credit = a.credit ?? 0;
                const pct = Math.max(0, Math.min(100, (credit / 80) * 100));
                const low = credit < 10;
                return (
                  <div
                    key={a.name}
                    className={`acct ${activeName === a.name ? "active" : ""} ${
                      a.exhausted || a.disabled ? "dead" : ""
                    }`}
                  >
                    <div className="acct-main">
                      <div className="acct-name">
                        <i className={`dot ${a.exhausted || a.disabled ? "off" : "on"}`} />
                        {a.name}
                      </div>
                      <div className="acct-note">{a.note || a.error || "—"}</div>
                      <div className="bar">
                        <i className={low ? "low" : ""} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="meta-row" style={{ marginTop: 6 }}>
                        <span className="credit">
                          {a.credit == null ? "—" : a.credit.toFixed(2)}
                          <small>credit</small>
                        </span>
                        {a.chatId && <span className="tag">会话已建</span>}
                        {a.disabled && <span className="tag">手动停用</span>}
                        {a.exhausted && !a.disabled && <span className="tag">已耗尽</span>}
                      </div>
                    </div>
                    <div className="acct-ops">
                      <button
                        className="mini"
                        type="button"
                        onClick={() => accountOp(a.name, { reset: true })}
                        disabled={running}
                      >
                        重置
                      </button>
                      <button
                        className="mini"
                        type="button"
                        onClick={() => accountOp(a.name, { enabled: !!a.disabled })}
                        disabled={running}
                      >
                        {a.disabled ? "启用" : "停用"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card" style={{ marginTop: 18 }}>
            <div className="card-head">
              <h2>运行日志</h2>
              <div className="grow" />
              <span className="pill">{feed.length}</span>
            </div>
            <div className="card-body" style={{ paddingTop: 10 }}>
              <div className="logs">
                {feed.length === 0 && <div className="placeholder">等待任务…</div>}
                {feed.map((f, i) => (
                  <div key={i}>
                    <time>{hhmmss(f.t)}</time>
                    <span className={f.level === "info" ? "" : f.level}>{f.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
