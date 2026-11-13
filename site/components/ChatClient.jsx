"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SessionList from "./SessionList";
import ThemeToggle, { ThemeSegments } from "./ThemeToggle";

const MODELS = [
  { id: "x-apex-surge-0505", label: "Surge 32K", ctx: 32000 },
  { id: "x-apex-pulse-0731-128k", label: "Pulse 128K", ctx: 128000 },
  { id: "x-apex-dash-0826-128k", label: "Dash 128K（严格）", ctx: 128000 },
  { id: "nalang-xl-0826", label: "XL 32K", ctx: 32000 },
  { id: "nalang-medium-0826", label: "Medium 32K", ctx: 32000 },
  { id: "x-apex-flux-0217-16k", label: "Flux 16K", ctx: 16000 },
  { id: "nalang-xl-0826-16k", label: "XL 16K", ctx: 16000 },
];

const TOKEN_MIN = 200;
const TOKEN_MAX = 8000;
// 续写轮数可选项（与引擎上限 8 对齐）
const ROUND_OPTS = [1, 2, 3, 5, 8];
const TOKEN_DEFAULT = 4000;
const TKEY = "lg.maxtokens.v1";
const RKEY = "lan.chat.rounds";
const MKEY = "lg.model.v2";

function clampTokens(v) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return TOKEN_DEFAULT;
  return Math.min(TOKEN_MAX, Math.max(TOKEN_MIN, n));
}

const SKEY = "lg.sessions.v2";
const mkey = (id) => `lg.msgs.v2.${id}`;
const uid = () => Math.random().toString(36).slice(2, 9);

// 多段续写会产出多个 <sug> 块，必须全局匹配；
// 否则第一个之后的标签会漏进正文，皔得像 HTML。
const SUG_RE_G = /<sug>([\s\S]*?)<\/sug>/gi;
const SUG_STRAY_RE = /<\/?sug>/gi;
const LUG_RE_G = /<lug>([\s\S]*?)<\/lug>/gi;
const LUG_STRAY_RE = /<\/?lug>/gi;

// 只砍「最后一个 <\/sug> 之后」残留的未闭合块，
// 不能直接 /<sug>[\s\S]*$/ —— 那会把后面的正文全吐掉。
function stripOpenSug(src) {
  const low = src.toLowerCase();
  const lastClose = low.lastIndexOf("</sug>");
  const tail = lastClose >= 0 ? src.slice(lastClose) : src;
  const idx = tail.toLowerCase().indexOf("<sug>");
  if (idx < 0) return src;
  return (lastClose >= 0 ? src.slice(0, lastClose) : "") + tail.slice(0, idx);
}

function splitSug(text) {
  let src = text || "";
  if (!src) return { text: "", sug: [] };

  // 1) 收集所有 <sug> 块里的选项（去重、保序）
  const sug = [];
  for (const m of src.matchAll(SUG_RE_G)) {
    for (const part of m[1].split("|")) {
      const v = part.trim().replace(/^[“"「『]|[”"」』]$/g, "").trim();
      if (v && !sug.includes(v)) sug.push(v);
    }
  }

  // 2) <lug> 是更长的建议块，整块删
  src = src.replace(LUG_RE_G, "");
  // 3) 流式中未闭合的尾部块
  src = stripOpenSug(src);
  // 4) 已闭合的块整块删；再兜底清裸标签
  src = src.replace(SUG_RE_G, "");
  src = src.replace(SUG_STRAY_RE, "").replace(LUG_STRAY_RE, "");

  // 5) 收尾
  const body = src.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
  return { text: body, sug: sug.slice(0, 4) };
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
  if (now - d < 30 * 864e5) return "本月";
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
  const [maxTokens, setMaxTokens] = useState(TOKEN_DEFAULT);
  const [mem, setMem] = useState(null);
  const [memInput, setMemInput] = useState("");
  const [memBusy, setMemBusy] = useState(false);
  // 分段续写轮数：单轮输出有硬上限（约 4800~5600 字），想更长只能多轮接续
  const [rounds, setRounds] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [note, setNote] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  // 手机端会话面板：与设置抽屉独立开关
  const [showSess, setShowSess] = useState(false);
  const [pool, setPool] = useState(null);

  const box = useRef(null);
  const taRef = useRef(null);
  const abort = useRef(null);
  const importRef = useRef(null);
  const stick = useRef(true);
  const chatIdRef = useRef(null);   // 恢复的历史属于哪个上游会话
  const seedAcctRef = useRef(null); // 该会话在哪个号下

  useEffect(() => {
    setMaxTokens(clampTokens(readJSON(TKEY, TOKEN_DEFAULT)));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TKEY, JSON.stringify(clampTokens(maxTokens)));
    } catch {}
  }, [maxTokens]);

  useEffect(() => {
    const saved = readJSON(MKEY, MODELS[0].id);
    if (MODELS.some((m) => m.id === saved)) setModel(saved);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MKEY, JSON.stringify(model));
    } catch {}
  }, [model]);

  const loadMemory = useCallback(async () => {
    try {
      const r = await fetch(`/api/memory?cardId=${encodeURIComponent(card.id)}`, {
        cache: "no-store",
      });
      if (!r.ok) return;
      const j = await r.json();
      if (j?.memory) setMem(j.memory);
    } catch {}
  }, [card.id]);

  useEffect(() => {
    setMem(null);
    setMemInput("");
    loadMemory();
  }, [card.id, loadMemory]);

  // 续写轮数持久化
  useEffect(() => {
    const v = Number(readJSON(RKEY, 1));
    setRounds(ROUND_OPTS.includes(v) ? v : 1);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(RKEY, JSON.stringify(rounds));
    } catch {}
  }, [rounds]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(max-width: 1180px)").matches) setShowPanel(false);
  }, []);

  useEffect(() => {
    const saved = readJSON(mkey(card.id), []);
    setMsgs(saved);

    // 本地空白时，从上游导出的 seeds.json 恢复真实历史（带 chatId），
    // 这样「上下文满了被重置」的对话能直接接着写。
    if (!saved.length) {
      let alive = true;
      fetch("/seeds.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((all) => {
          if (!alive || !all) return;
          const seed = all[String(card.id)];
          if (!seed || !Array.isArray(seed.msgs) || !seed.msgs.length) return;
          const restored = seed.msgs.map((m, i) => ({
            id: `s${i}`,
            role: m.role,
            content: m.content,
            ts: Date.now() - (seed.msgs.length - i) * 1000,
          }));
          setMsgs(restored);
          if (seed.chatId) chatIdRef.current = seed.chatId;
          if (seed.account) seedAcctRef.current = seed.account;
          localStorage.setItem(mkey(card.id), JSON.stringify(restored));
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }

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
    ].slice(0, 60);
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
      ].slice(0, 60);
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

      // 历史裁剪统一交给引擎（按模型 ctx + 锚点/摘要预算）。
      // 这里只做 200 条安全上限，避免长会话把请求体撑爆。
      const history = base
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-200)
        .map((m) => ({
          role: m.role,
          // 助手消息里的 <sug> 建议块不回灌，省 token 也避免模型复读
          content: m.role === "assistant" ? splitSug(m.content).text : m.content,
        }));

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
            maxTokens: clampTokens(maxTokens),
            rounds: Number(rounds) || 1,
            // 恢复的旧会话：告诉引擎用哪个 chatId / 哪个号，
            // 否则 createByCard 会新建一个空会话，历史接不上。
            chatId: chatIdRef.current || undefined,
            account: seedAcctRef.current || undefined,
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
          } else if (ev === "memory") {
            setMem((cur) => ({ ...(cur || {}), ...d }));
          } else if (ev === "memory_update") {
            setMem((cur) => ({ ...(cur || {}), ...d }));
            setNote("长期记忆已更新");
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
            // 摘要在后台生成，分几次拉记忆面板（摘要通常 5~30s 完成）
            [5000, 15000, 30000].forEach((ms) => setTimeout(() => loadMemory(), ms));
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
    [input, busy, msgs, card.id, model, maxTokens, rounds, save, loadPool, loadMemory]
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

  const saveMemory = useCallback(
    async (body) => {
      setMemBusy(true);
      try {
        const r = await fetch("/api/memory", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cardId: card.id, ...body }),
        });
        const j = await r.json().catch(() => null);
        if (j?.memory) setMem(j.memory);
        return j?.memory || null;
      } catch {
        return null;
      } finally {
        setMemBusy(false);
      }
    },
    [card.id]
  );

  const addPin = useCallback(async () => {
    const text = memInput.trim();
    if (!text) return;
    const pins = [...(mem?.pinned || []), { text, source: "manual" }];
    const saved = await saveMemory({
      pinned: pins.map((p) => ({ text: p.text, source: "manual" })),
    });
    if (saved) setMemInput("");
  }, [mem, memInput, saveMemory]);

  const delPin = useCallback(
    (id) => {
      const pins = (mem?.pinned || []).filter((p) => p.id !== id);
      saveMemory({ pinned: pins.map((p) => ({ text: p.text, source: "manual" })) });
    },
    [mem, saveMemory]
  );

  const clearMemory = useCallback(() => {
    saveMemory({ clear: true });
    setMem({ pinned: [], summary: "", summarizedUpTo: 0 });
    setNote("长期记忆已清空");
  }, [saveMemory]);

  const regenSummary = useCallback(() => {
    saveMemory({ summary: "", summarizedUpTo: 0 });
    setMem((cur) => ({ ...(cur || {}), summary: "", summarizedUpTo: 0 }));
    setNote("摘要已清空，下一轮会重新生成");
  }, [saveMemory]);

  const exportMemory = useCallback(() => {
    const data = {
      version: 1,
      cardId: card.id,
      pinned: (mem?.pinned || []).map((p) => ({
        text: p.text,
        source: p.source || "manual",
      })),
      summary: mem?.summary || "",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-${card.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNote("记忆已导出");
  }, [card.id, mem]);

  const importMemory = useCallback(
    async (file) => {
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const body = {};
        if (Array.isArray(data.pinned)) {
          body.pinned = data.pinned
            .map((p) => (typeof p === "string" ? p : p?.text))
            .filter(Boolean)
            .slice(0, 20)
            .map((text) => ({ text: String(text).slice(0, 200), source: "manual" }));
        }
        if (typeof data.summary === "string") {
          body.summary = data.summary.slice(0, 600);
          body.summarizedUpTo = 0;
        }
        const saved = await saveMemory(body);
        setNote(saved ? "记忆已导入" : "导入失败：引擎未响应");
      } catch {
        setNote("导入失败：不是有效的记忆 JSON");
      }
    },
    [saveMemory]
  );

  // 从列表里彻底移除一个会话（消息体 + 索引条目），不影响其它卡
  const dropSession = useCallback(
    (cardId) => {
      try {
        localStorage.removeItem(mkey(cardId));
        const next = readJSON(SKEY, []).filter((x) => String(x.cardId) !== String(cardId));
        localStorage.setItem(SKEY, JSON.stringify(next));
        setSessions(next);
        if (String(cardId) === String(card.id)) {
          setMsgs([]);
          setNote("已删除本会话");
        }
      } catch {}
    },
    [card.id]
  );

  const groupedCount = useMemo(() => {
    const g = new Map();
    for (const s of sessions) {
      const k = groupLabel(s.lastAt);
      g.set(k, (g.get(k) || 0) + 1);
    }
    return g;
  }, [sessions]);

  const modelLabel = MODELS.find((m) => m.id === model)?.label || model;
  const modelCtx = MODELS.find((m) => m.id === model)?.ctx || 0;
  const memCount = mem?.pinned?.length || 0;
  const memChars = (mem?.summary || "").length;
  const turns = msgs.filter((m) => m.role === "user").length;

  return (
    <div className="shell chat-shell-wrap">
      {/* 手机端(<860px)整条导航隐藏，空间让给对话；关键信息并在 .chat-head 内 */}
      <div className="topnav-wrap nav-desktop-only">
        <nav className="topnav">
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
          <ThemeToggle />
        </nav>
      </div>

      <div className={`chat-shell ${showPanel ? "" : "no-panel"}`}>
        <SessionList
          open={showSess}
          sessions={sessions}
          currentId={card.id}
          onClose={() => setShowSess(false)}
          onDelete={dropSession}
          onOpenSettings={() => {
            setShowSess(false);
            setShowPanel(true);
          }}
        />

        <main className="chat-main">
          <div className="chat-head">
            {/* 手机端：展开对话列表 */}
            <button
              className="head-ico head-burger press"
              onClick={() => setShowSess(true)}
              aria-label="对话列表"
              aria-expanded={showSess}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* 手机端回到角色列表；桌面端隐藏 */}
            <Link className="head-ico head-back press" href="/" aria-label="返回角色列表">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14.5 5.5L8 12l6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            {card.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="head-cover" src={card.cover} alt="" />
            ) : null}
            <div className="who">
              <b>{card.name}</b>
              <span>
                {(card.tags || []).slice(0, 2).join(" · ") || "角色卡"}
                {msgs.length ? ` · ${turns} 轮` : ""}
              </span>
            </div>
            <span className="spacer" />
            {pool && !pool.offline ? (
              <span className={`pool-badge head-pool ${pool.total < 3.4 ? "empty" : ""}`}>
                池 {Number(pool.total).toFixed(1)}
              </span>
            ) : null}
            <ThemeToggle className="head-theme" />
            <button
              className="head-ico press"
              onClick={() => setShowPanel((v) => !v)}
              aria-label="会话设置"
              aria-expanded={showPanel}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M12 3.2v2.1M12 18.7v2.1M4.6 7.9l1.8 1.1M17.6 15l1.8 1.1M19.4 7.9l-1.8 1.1M6.4 15l-1.8 1.1"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {note ? <div className="chat-note">{note}</div> : null}

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
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
              />
              {busy ? (
                <button className="send stop press" onClick={stop} aria-label="停止">
                  <span className="sq" />
                </button>
              ) : (
                <button
                  className="send press"
                  onClick={() => send()}
                  disabled={!input.trim()}
                  aria-label="发送"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 19V5M6 11l6-6 6 6"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="hint">
              <span>{input.length} 字</span>
              <span className="hint-dot">·</span>
              <span>{modelLabel}</span>
              <span className="hint-turns">
                <span className="hint-dot">·</span>
                {turns} 轮
              </span>
              <span className="spacer" />
              <span className="hint-ctx">
                锚点 {memCount} 条 · 摘要 {memChars} 字 · 窗口 {Math.round(modelCtx / 1000)}K
              </span>
            </div>
          </div>
        </main>

        {showPanel ? (
          <>
            <div
              className="drawer-mask"
              onClick={() => setShowPanel(false)}
              aria-hidden="true"
            />
            <aside className="side side-right drawer" aria-label="会话设置">
              <h3>本会话</h3>
              <div className="panel-body">
                <label className="fld">主题</label>
                <ThemeSegments />

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
                  min={TOKEN_MIN}
                  max={TOKEN_MAX}
                  step={100}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  disabled={busy}
                />
                <div className="hint">这是上限，不是保证 —— 单段通常输出 4800~5600 字</div>

                <label className="fld">续写轮数</label>
                <select
                  className="inp"
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  disabled={busy}
                >
                  {ROUND_OPTS.map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 段（最快）" : `${n} 段（约 ${(n * 5.2).toFixed(0)}k 字，越长越慢）`}
                    </option>
                  ))}
                </select>

                <div className="divider" />
                <label className="fld">长期记忆</label>
                <div className="hint">
                  {memCount} 条锚点 · 摘要 {memChars} 字 · 窗口 {Math.round(modelCtx / 1000)}K
                </div>
                <div className="mem-list">
                  {(mem?.pinned || []).map((p) => (
                    <div className="mem-item" key={p.id || p.text}>
                      <span>{p.text}</span>
                      <button
                        type="button"
                        className="mem-del"
                        onClick={() => delPin(p.id)}
                        disabled={memBusy}
                        aria-label="删除这条设定"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {!memCount ? (
                    <div className="tip">
                      还没有锚点。你中途说的「以后 / 记住 / 称呼……」会自动记下，也可以手动加。
                    </div>
                  ) : null}
                </div>
                <div className="mem-add">
                  <input
                    className="inp"
                    value={memInput}
                    onChange={(e) => setMemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPin();
                      }
                    }}
                    placeholder="例如：私下叫主人，外人面前叫哥哥"
                    maxLength={200}
                  />
                  <button
                    className="btn btn-ghost press"
                    onClick={addPin}
                    disabled={memBusy || !memInput.trim()}
                  >
                    添加
                  </button>
                </div>
                {mem?.summary ? <div className="mem-sum">{mem.summary}</div> : null}
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    importMemory(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <div className="mem-ops">
                  <button className="btn btn-ghost press" onClick={regenSummary} disabled={memBusy}>
                    重生成摘要
                  </button>
                  <button className="btn btn-ghost press" onClick={exportMemory}>
                    导出
                  </button>
                  <button
                    className="btn btn-ghost press"
                    onClick={() => importRef.current?.click()}
                    disabled={memBusy}
                  >
                    导入
                  </button>
                  <button className="btn btn-ghost press" onClick={clearMemory} disabled={memBusy}>
                    清空记忆
                  </button>
                </div>
                <div className="tip">
                  记忆按卡片存在引擎侧：换号、换模型、刷新都还在；清空本会话不会清记忆。
                </div>

                <div className="divider" />

                <div className="kv">
                  <span>消息</span>
                  <b>{msgs.length}</b>
                </div>
                <div className="kv">
                  <span>字数</span>
                  <b>{msgs.reduce((n, m) => n + m.content.length, 0)}</b>
                </div>
                <div className="kv">
                  <span>号池</span>
                  <b>{pool && !pool.offline ? `${Number(pool.total).toFixed(1)} · ${pool.usable}/${pool.count}` : "—"}</b>
                </div>
                <div className="kv">
                  <span>会话分组</span>
                  <b>{[...groupedCount.entries()].map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}</b>
                </div>

                <button
                  className="btn btn-ghost press wide"
                  onClick={clear}
                  disabled={busy || msgs.length === 0}
                >
                  清空本会话
                </button>
                <p className="tip">消息存在本机浏览器；额度由后台池子统一转发。</p>
                <button
                  className="btn btn-ghost press wide drawer-close"
                  onClick={() => setShowPanel(false)}
                >
                  收起
                </button>
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
