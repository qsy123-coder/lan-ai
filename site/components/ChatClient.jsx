"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MODELS = [
  { id: "x-apex-flux-0217-16k", label: "Flux 16K" },
  { id: "x-apex-surge-0505", label: "Surge 32K" },
  { id: "nalang-xl-0826-16k", label: "XL 16K" },
  { id: "nalang-medium-0826", label: "Medium" },
];

const SKEY = "lg.sessions.v2";
const mkey = (id) => `lg.msgs.v2.${id}`;
const uid = () => Math.random().toString(36).slice(2, 9);

const SUG_RE = /<sug>([\s\S]*?)<\/sug>/i;

function splitSug(text) {
  const m = SUG_RE.exec(text || "");
  if (!m) return { text: text || "", sug: [] };
  const body = text.replace(SUG_RE, "").trimEnd();
  const sug = m[1]
    .split("|")
    .map((s) => s.trim().replace(/^[“"「『]|[”"」』]$/g, "").trim())
    .filter(Boolean)
    .slice(0, 4);
  return { text: body, sug };
}

function readJSON(k, d) {
  try {
    const v = JSON.parse(localStorage.getItem(k) || "null");
    return v ?? d;
  } catch {
    return d;
  }
}

function groupLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "今天";
  if (d.toDateString() === new Date(now.getTime() - 864e5).toDateString()) return "昨天";
  if (now - d < 7 * 864e5) return "本周";
  return "更早";
}

const timeOf = (ts) =>
  new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

async function readSSE(res, onEvent) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, i);
      buf = buf.slice(i + 2);
      let ev = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) ev = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) {
        try {
          onEvent(ev, JSON.parse(data));
        } catch {}
      }
    }
  }
}

export default function ChatClient({ card }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [maxTokens, setMaxTokens] = useState(600);
  const [sessions, setSessions] = useState([]);
  const [note, setNote] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  const [pool, setPool] = useState(null);

  const box = useRef(null);
  const taRef = useRef(null);
  const abort = useRef(null);
  const stick = useRef(true);

  useEffect(() => {
    const saved = readJSON(mkey(card.id), []);
    setMsgs(saved);
    const s = readJSON(SKEY, []);
    const prev = s.find((x) => String(x.cardId) === String(card.id));
    const next = [
      {
        cardId: card.id,
        name: card.name,
        cover: card.cover,
        lastAt: prev?.lastAt || Date.now(),
        last: prev?.last || "",
      },
      ...s.filter((x) => String(x.cardId) !== String(card.id)),
    ].slice(0, 40);
    localStorage.setItem(SKEY, JSON.stringify(next));
    setSessions(next);
  }, [card.id, card.name, card.cover]);

  const loadPool = useCallback(async () => {
    try {
      const r = await fetch("/api/pool", { cache: "no-store" });
      const j = await r.json();
      setPool(j);
    } catch {}
  }, []);

  useEffect(() => {
    loadPool();
    const t = setInterval(loadPool, 30000);
    return () => clearInterval(t);
  }, [loadPool]);

  useEffect(() => {
    if (!box.current || !stick.current) return;
    box.current.scrollTop = box.current.scrollHeight;
  }, [msgs, streaming]);

  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const save = useCallback(
    (list, lastText) => {
      const trimmed = list
        .slice(-120)
        .map(({ id, role, content, ts }) => ({ id, role, content, ts }));
      localStorage.setItem(mkey(card.id), JSON.stringify(trimmed));
      const s = readJSON(SKEY, []);
      const prev = s.find((x) => String(x.cardId) === String(card.id));
      const next = [
        {
          cardId: card.id,
          name: card.name,
          cover: card.cover,
          lastAt: Date.now(),
          last: lastText ?? prev?.last ?? "",
        },
        ...s.filter((x) => String(x.cardId) !== String(card.id)),
      ].slice(0, 40);
      localStorage.setItem(SKEY, JSON.stringify(next));
      setSessions(next);
    },
    [card.id, card.name, card.cover]
  );

  const send = useCallback(
    async (textArg, historyArg) => {
      const text = (textArg ?? input).trim();
      if (!text || busy) return;
      const base = historyArg ?? msgs;
      if (!textArg) setInput("");
      setBusy(true);
      setStreaming("");
      setNote("");
      stick.current = true;

      const userMsg = { id: uid(), role: "user", content: text, ts: Date.now() };
      const nextMsgs = [...base, userMsg];
      setMsgs(nextMsgs);

      const history = base
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-24)
        .map((m) => ({ role: m.role, content: m.content }));

      const ctl = new AbortController();
      abort.current = ctl;
      let acc = "";
      let finished = false;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cardId: card.id,
            prompt: text,
            history,
            model,
            maxTokens: Number(maxTokens) || 600,
          }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        await readSSE(res, (ev, d) => {
          if (ev === "delta") {
            acc += d.text || "";
            setStreaming(acc);
          } else if (ev === "account") {
            setNote(`账号 ${d.name}`);
          } else if (ev === "complete") {
            finished = true;
            const final = d.text || acc || "";
            const list = [
              ...nextMsgs,
              { id: uid(), role: "assistant", content: final, ts: Date.now() },
            ];
            setMsgs(list);
            setStreaming("");
            save(list, final.slice(0, 42));
            setNote(
              d.credit != null
                ? `完成 · ${d.account} · 余额 ${Number(d.credit).toFixed(2)}`
                : "完成"
            );
            loadPool();
          } else if (ev === "switch") {
            setNote(d.reason === "credit" ? "余额见底，切换到下一个账号" : `切换：${d.reason}`);
          } else if (ev === "end" && d.reason !== "stopped") {
            setNote(
              d.reason === "no_credit"
                ? "池子暂时没有可用额度"
                : d.message || "这次没成功，点重试再发一次"
            );
          }
        });
      } catch (e) {
        if (e.name !== "AbortError") setNote(String(e.message || e));
      } finally {
        if (!finished && acc) {
          const list = [
            ...nextMsgs,
            { id: uid(), role: "assistant", content: acc, ts: Date.now() },
          ];
          setMsgs(list);
          save(list, acc.slice(0, 42));
        }
        setBusy(false);
        setStreaming("");
        abort.current = null;
        taRef.current?.focus();
      }
    },
    [input, busy, msgs, card.id, model, maxTokens, save]
  );

  const stop = useCallback(() => {
    abort.current?.abort();
    setNote("已停止");
  }, []);

  const regenerate = useCallback(() => {
    if (busy) return;
    const idx = [...msgs].reverse().findIndex((m) => m.role === "user");
    if (idx < 0) return;
    const realIdx = msgs.length - 1 - idx;
    const head = msgs.slice(0, realIdx);
    setMsgs(head);
    save(head, head[head.length - 1]?.content?.slice(0, 42) || "");
    send(msgs[realIdx].content, head);
  }, [busy, msgs, save, send]);

  const del = useCallback(
    (id) => {
      const list = msgs.filter((m) => m.id !== id);
      setMsgs(list);
      const last = list.filter((m) => m.role === "assistant").at(-1);
      save(list, last?.content?.slice(0, 42) || "");
    },
    [msgs, save]
  );

  const clear = useCallback(() => {
    setMsgs([]);
    localStorage.removeItem(mkey(card.id));
    save([], "");
    setNote("已清空本会话");
  }, [card.id, save]);

  const grouped = useMemo(() => {
    const g = new Map();
    for (const s of sessions) {
      const k = groupLabel(s.lastAt);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(s);
    }
    return [...g.entries()];
  }, [sessions]);

  const modelLabel = MODELS.find((m) => m.id === model)?.label || model;
  const turns = msgs.filter((m) => m.role === "user").length;

  return (
    <div className="shell">
      <div className="topnav-wrap">
        <nav className="topnav glass">
          <Link href="/" className="brand">
            <span className="dot" />
            澜
          </Link>
          <Link href="/" className="tab">
            角色
          </Link>
          <Link href="/chat" className="tab active">
            对话
          </Link>
          <span className="spacer" />
          {pool && !pool.offline ? (
            <span className={`pool-badge ${pool.total < 3.4 ? "empty" : ""}`}>
              池子 {Number(pool.total).toFixed(1)} · {pool.usable}/{pool.count} 号
            </span>
          ) : null}
          <span className="nav-note">{note || (busy ? "生成中…" : "就绪")}</span>
        </nav>
      </div>

      <div className={`chat-shell ${showPanel ? "" : "no-panel"}`}>
        <aside className="side glass glass-tinted side-left">
          <h3>会话</h3>
          {sessions.length === 0 ? <div className="state">还没有对话</div> : null}
          {grouped.map(([label, list]) => (
            <div key={label} className="sess-group">
              <div className="sess-label">{label}</div>
              {list.map((s) => (
                <Link
                  key={s.cardId}
                  href={`/chat?card=${s.cardId}`}
                  className={`sess ${String(s.cardId) === String(card.id) ? "on" : ""}`}
                >
                  {s.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.cover} alt="" />
                  ) : (
                    <span className="ph" />
                  )}
                  <span className="t">
                    <b>{s.name}</b>
                    <span>{s.last || "开始新的对话"}</span>
                  </span>
                  <span className="time">{timeOf(s.lastAt)}</span>
                </Link>
              ))}
            </div>
          ))}
          <div className="side-foot">
            <Link href="/" className="mini-link">
              ← 去挑新角色
            </Link>
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-head">
            {card.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="head-cover" src={card.cover} alt="" />
            ) : null}
            <div className="who">
              <b>{card.name}</b>
              <span>{(card.tags || []).slice(0, 3).join(" · ") || "角色卡"}</span>
            </div>
            <span className="spacer" />
            <select
              className="model-pick"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={busy}
              aria-label="模型"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              className="icon-btn press"
              onClick={() => setShowPanel((v) => !v)}
              aria-label="设置"
              title="设置"
            >
              ⚙
            </button>
          </div>

          {pool && !pool.offline && pool.usable === 0 ? (
            <div className="pool-empty">
              号池额度已用完（{pool.count} 个号全部见底）。开新号后这里会自动恢复。
            </div>
          ) : null}

          <div className="msgs" ref={box} onScroll={onScroll}>
            {msgs.length === 0 && !streaming ? (
              <div className="empty-chat">
                <div className="ec-badge">开场</div>
                <p>
                  和「{card.name}」的第一句话，会决定这场戏的走向。
                  <br />
                  直接输入，或者从下面挑一句。
                </p>
                <div className="starter">
                  {["（敲门）我进来了。", "今天有点累，陪我待一会儿。", "你在忙什么？"].map((s) => (
                    <button key={s} className="chip press" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              const parsed = isUser ? { text: m.content, sug: [] } : splitSug(m.content);
              return (
                <div className={`turn ${isUser ? "me" : "them"}`} key={m.id || i}>
                  {!isUser ? (
                    <div className="turn-head">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="turn-avatar" src={card.cover} alt="" />
                      <span>{card.name}</span>
                      <time>{timeOf(m.ts)}</time>
                    </div>
                  ) : null}

                  <div className={`bubble ${isUser ? "user" : "bot"}`}>{parsed.text}</div>

                  {parsed.sug.length ? (
                    <div className="sug">
                      {parsed.sug.map((s) => (
                        <button
                          key={s}
                          className="sug-chip press"
                          onClick={() => send(s)}
                          disabled={busy}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="turn-ops">
                    <button
                      className="mini-btn"
                      onClick={() => navigator.clipboard?.writeText(m.content)}
                    >
                      复制
                    </button>
                    {!isUser && i === msgs.length - 1 ? (
                      <button className="mini-btn" onClick={regenerate} disabled={busy}>
                        重生成
                      </button>
                    ) : null}
                    <button className="mini-btn" onClick={() => del(m.id)} disabled={busy}>
                      删除
                    </button>
                  </div>
                </div>
              );
            })}

            {streaming ? (
              <div className="turn them">
                <div className="turn-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="turn-avatar" src={card.cover} alt="" />
                  <span>{card.name}</span>
                  <span className="typing">正在输入</span>
                </div>
                <div className="bubble bot">
                  {streaming}
                  <span className="caret" />
                </div>
              </div>
            ) : null}

            {busy && !streaming ? (
              <div className="turn them">
                <div className="turn-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="turn-avatar" src={card.cover} alt="" />
                  <span>{card.name}</span>
                  <span className="typing">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="composer">
            <div className="composer-inner">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = Math.min(180, el.scrollHeight) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                  if (e.key === "Escape" && busy) stop();
                }}
                placeholder={`和「${card.name}」说点什么…  Enter 发送 · Shift+Enter 换行`}
                rows={1}
              />
              {busy ? (
                <button className="send stop press" onClick={stop} aria-label="停止">
                  ■
                </button>
              ) : (
                <button
                  className="send press"
                  onClick={() => send()}
                  disabled={!input.trim()}
                  aria-label="发送"
                >
                  ↑
                </button>
              )}
            </div>
            <div className="hint">
              <span>{input.length} 字</span>
              <span>·</span>
              <span>{modelLabel}</span>
              <span>·</span>
              <span>{turns} 轮</span>
              <span className="spacer" />
              <span>自动带上最近 24 条上下文</span>
            </div>
          </div>
        </main>

        {showPanel ? (
          <aside className="side glass glass-tinted side-right">
            <h3>本会话</h3>
            <div className="panel-body">
              <label className="fld">模型</label>
              <select
                className="inp"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={busy}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              <label className="fld">最大输出 token</label>
              <input
                className="inp"
                type="number"
                min={100}
                step={100}
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                disabled={busy}
              />

              <div className="divider" />

              <div className="kv">
                <span>消息</span>
                <b>{msgs.length}</b>
              </div>
              <div className="kv">
                <span>字数</span>
                <b>{msgs.reduce((n, m) => n + m.content.length, 0)}</b>
              </div>

              <button
                className="btn btn-ghost press wide"
                onClick={clear}
                disabled={busy || msgs.length === 0}
              >
                清空本会话
              </button>
              <p className="tip">消息存在本机浏览器；额度由后台池子统一转发。</p>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
