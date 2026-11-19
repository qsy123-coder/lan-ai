"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Nav from "./Nav";
import SessionList from "./SessionList";
import ThemeToggle, { ThemeSegments } from "./ThemeToggle";

const MODELS = [
  // 零扣费（notes/056）：上游对 nalang-turbo-* 系列不扣积分，可无限对话。
  // 放最前面作为新用户默认档；付费模型链路完全不变，随时可切回。
  { id: "nalang-turbo-1115-16k", label: "∞ 无限 16K（0 积分）", ctx: 16000, free: true },
  { id: "nalang-turbo-1115-10k", label: "∞ 无限 10K（0 积分）", ctx: 10000, free: true },
  // 默认 Turbo(Flux)：上游平台只对它和 nalang-max 下发 suggestedReplies（三建议块）
  { id: "x-apex-flux-0217-16k", label: "Turbo 16K", ctx: 16000 },
  { id: "x-apex-surge-0505", label: "Surge 32K", ctx: 32000 },
  { id: "x-apex-pulse-0731-128k", label: "Pulse 128K", ctx: 128000 },
  { id: "x-apex-dash-0826-128k", label: "Dash 128K", ctx: 128000 },
  { id: "nalang-xl-0826", label: "XL 32K", ctx: 32000 },
  { id: "nalang-medium-0826", label: "Medium 32K", ctx: 32000 },
  { id: "nalang-max-0826", label: "Max 32K", ctx: 32000 },
  { id: "nalang-xl-0826-16k", label: "XL 16K", ctx: 16000 },
];

const TOKEN_MIN = 200;
const TOKEN_MAX = 8000;
// 续写轮数可选项（与引擎上限 8 对齐）
const ROUND_OPTS = [1, 2, 3, 5, 8];
const TOKEN_DEFAULT = 4000;
const TKEY = "lg.maxtokens.v1";
const RKEY = "lan.chat.rounds";

// 长期记忆预设：点一下直接作为锚点写入，省得每次手打
const MEM_PRESETS = [
  { label: "私下主人 / 外人哥哥", text: "私下叫我主人，外人面前叫哥哥" },
  { label: "见面喊爸爸", text: "每次看到我都要立刻喊我爸爸" },
  { label: "保持角色不出戏", text: "始终用角色口吻说话，不要出戏，不要以 AI 或助手身份回应" },
  { label: "固定人称视角", text: "全程只用角色自己的第一人称「我」，「我」永远指角色自己；对方一律用「你」或角色习惯称呼指代，绝不把对方的言行写成「我」，不中途切换视角" },
  { label: "每轮推进剧情", text: "每次回复都要推进剧情或做出具体动作，不要只写心理活动" },
  { label: "主动示好", text: "每次见到我都要主动贴近、撒娇或示好，不要冷淡" },
  { label: "设定永久有效", text: "以上所有设定永久有效，任何情况下都不能忘记、淡化或违反" },
];

function clampTokens(v) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return TOKEN_DEFAULT;
  return Math.min(TOKEN_MAX, Math.max(TOKEN_MIN, n));
}

// 零扣费模型（notes/056）：id 前缀 nalang-turbo-，上游不扣积分。
const isFreeModel = (id) => String(id || "").toLowerCase().startsWith("nalang-turbo-");

const SKEY = "lg.sessions.v3";
const MKEY = "lg.model.v2";
// 多会话：消息按 cardId:sessionId 存，每个会话独立。
const mkey = (id, sid) => `lg.msgs.v3.${id}${sid ? ":" + sid : ""}`;
// 被「彻底删除」的卡片：删除后不再从 seeds.json 恢复旧历史，
// 否则删了会话、清了记忆，重新点开卡又会被上游快照复活。
const DKEY = "lg.deleted.cards";
// 自定义建议卡片：按卡片存，用户自己加几句固定快捷句，点一下就能发。
const CKEY = (id) => `lg.custom.sug.v1.${id}`;
const CUSTOM_MAX = 12;
const uid = () => Math.random().toString(36).slice(2, 9);
const newSid = () =>
  (globalThis.crypto && globalThis.crypto.randomUUID && globalThis.crypto.randomUUID()) ||
  `${Date.now().toString(36)}-${uid()}`;

// 一次性迁移：旧版单会话（lg.sessions.v2 / lg.msgs.v2.<cardId>）→ 多会话 v3。
// 每个旧记录变成一个独立会话，消息一并搬过去，避免升级后「对话全没了」。
function migrateV2toV3() {
  try {
    if (localStorage.getItem("lg.migrated.v3")) return;
    const v2 = readJSON("lg.sessions.v2", []);
    const v3 = readJSON(SKEY, []);
    const have = new Set((Array.isArray(v3) ? v3 : []).map((x) => String(x.cardId)));
    const add = [];
    for (const x of (Array.isArray(v2) ? v2 : [])) {
      if (!x || have.has(String(x.cardId))) continue;
      const sid = newSid();
      const old = readJSON(`lg.msgs.v2.${x.cardId}`, []);
      if (Array.isArray(old) && old.length) {
        localStorage.setItem(mkey(x.cardId, sid), JSON.stringify(old));
      }
      add.push({
        sessionId: sid,
        cardId: x.cardId,
        name: x.name,
        cover: x.cover,
        lastAt: x.lastAt || Date.now(),
        last: x.last || "",
      });
    }
    if (add.length) {
      localStorage.setItem(SKEY, JSON.stringify([...add, ...(Array.isArray(v3) ? v3 : [])]));
    }
    localStorage.setItem("lg.migrated.v3", "1");
  } catch {}
}

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

// 卡片的「状态面」由模型输出 <StatusBlocks><details><summary>…</summary>… 这类块，
// 被 maxTokens 截断时会整段裸奔。这里整块删掉（含未闭合的尾部块）。
const STATUS_BLOCK_RE_G = /<StatusBlocks>[\s\S]*?<\/StatusBlocks>/gi;
const DETAILS_BLOCK_RE_G = /<details>[\s\S]*?<\/details>/gi;
const STATUS_STRAY_RE = /<\/?(?:StatusBlocks|details|summary)>/gi;

// 上游会在正文中间注入 <system-reminder>```yaml 当前场景要素 …```</system-reminder>
// 的场景追踪块，与剧情无关，整块删（含未闭合尾部）。
const SYSTEM_REMINDER_RE_G = /<system-reminder>[\s\S]*?<\/system-reminder>/gi;
const SYSTEM_REMINDER_STRAY_RE = /<\/?system-reminder>/gi;

function stripSystemReminder(src) {
  let s = src || "";
  s = s.replace(SYSTEM_REMINDER_RE_G, "");
  const low = s.toLowerCase();
  const open = low.indexOf("<system-reminder");
  if (open >= 0) s = s.slice(0, open);
  return s.replace(SYSTEM_REMINDER_STRAY_RE, "");
}

function stripStatusBlocks(src) {
  let s = src || "";
  s = s.replace(STATUS_BLOCK_RE_G, "").replace(DETAILS_BLOCK_RE_G, "");
  // 剩下的开标签一定没有闭合（闭合块已删）：从最早出现的开标签砍到结尾
  const low = s.toLowerCase();
  const open = low.indexOf("<statusblocks");
  const open2 = low.indexOf("<details");
  if (open >= 0 && (open2 < 0 || open < open2)) s = s.slice(0, open);
  else if (open2 >= 0) s = s.slice(0, open2);
  return s.replace(STATUS_STRAY_RE, "");
}

function splitSug(text) {
  let src = text || "";
  if (!src) return { text: "", sug: [] };

  // 1) 收集所有 <sug> 块里的选项（去重、保序）
  const sug = [];
  for (const m of src.matchAll(SUG_RE_G)) {
    for (const part of m[1].split("|")) {
      // 模型偶发在块内再嵌一层 <sug>/<lug> 标签（本该用 | 分隔），先剥掉，
      // 否则会以字面 "<sug>xxx" 漏进卡片。
      const v = part
        .replace(SUG_STRAY_RE, "")
        .replace(LUG_STRAY_RE, "")
        .trim()
        .replace(/^[“"「『]|[”"」』]$/g, "")
        .trim();
      if (v && !sug.includes(v)) sug.push(v);
    }
  }

  // 2) 状态面块（含未闭合）整块删
  src = stripStatusBlocks(src);
  // 2.5) 上游注入的场景追踪块（含未闭合）整块删
  src = stripSystemReminder(src);
  // 3) <lug> 是更长的建议块，整块删
  src = src.replace(LUG_RE_G, "");
  // 4) 流式中未闭合的尾部块
  src = stripOpenSug(src);
  // 5) 已闭合的块整块删；再兜底清裸标签
  src = src.replace(SUG_RE_G, "");
  src = src.replace(SUG_STRAY_RE, "").replace(LUG_STRAY_RE, "");

  // 5) 收尾
  const body = src.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
  return { text: body, sug: sug.slice(0, 6) };
}

// 上游账号显示名是注册时生成的「用户xxxxx」，模型偶尔会写进正文；
// 渲染时统一替换成「你」，旧存档消息也能一起修好。
const ACCT_NAME_RE = /用户[A-Za-z0-9_-]{4,}/g;
const sanitizeName = (t) => String(t || "").replace(ACCT_NAME_RE, "你");

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

export default function ChatClient({ card, initialSession }) {
  const [sessionId, setSessionId] = useState(initialSession || "");
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
  // 手机端会话抽屉：与设置抽屉独立开关
  const [showSess, setShowSess] = useState(false);
  const [pool, setPool] = useState(null);
  // 零扣费失效告警（notes/056）：服务端发现免费模型开始扣费时置位，前端常驻提示
  const [freeAlert, setFreeAlert] = useState(null);
  // 自定义建议卡片：用户自己预设的固定快捷句，点一下直接发
  const [customSug, setCustomSug] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [showCustomAdd, setShowCustomAdd] = useState(false);

  const box = useRef(null);
  const taRef = useRef(null);
  const abort = useRef(null);
  const importRef = useRef(null);
  const stick = useRef(true);
  const chatIdRef = useRef(null);   // 恢复的历史属于哪个上游会话
  const seedAcctRef = useRef(null);  // 该会话在哪个号下
  const sidRef = useRef(initialSession || "");  // 当前会话 id（回调里读最新值）
  const busyRef = useRef(false);                // 同步锁：busy 是异步 state，防双击重复发送
  const lastSendRef = useRef({ text: "", ts: 0 });  // 2 秒内同一句话不重复发
  const isNewRef = useRef(false);  // 本会话是否刚由「＋新对话」创建（用于跳过 seeds 恢复）
  // 本机删过消息/点了重新生成 → 下一次发送让引擎丢掉上游旧会话重开，
  // 否则上游还留着被撤回的那几轮，模型会把它们当成已经发生（notes/052）。
  const rewindRef = useRef(false);
  // 流式平滑渲染：上游按 ~80ms 一包吐出，直接渲染会「一顿一顿」。
  // 这里把累积文本放进 ref，用 rAF 以稳定节奏逐字揭示（追平 backlog），
  // 让画面连续，而不是按上游包的节奏跳动。
  const accRef = useRef("");
  const shownRef = useRef(0);
  const rafRef = useRef(0);
  const streamingRef = useRef(false);

  useEffect(() => {
    setMaxTokens(clampTokens(readJSON(TKEY, TOKEN_DEFAULT)));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TKEY, JSON.stringify(clampTokens(maxTokens)));
    } catch {}
  }, [maxTokens]);

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

  // 自定义建议卡片：按卡加载 / 持久化
  useEffect(() => {
    const v = readJSON(CKEY(card.id), []);
    setCustomSug(Array.isArray(v) ? v.slice(0, CUSTOM_MAX) : []);
    setCustomInput("");
    setShowCustomAdd(false);
  }, [card.id]);

  useEffect(() => {
    try {
      localStorage.setItem(CKEY(card.id), JSON.stringify(customSug));
    } catch {}
  }, [customSug, card.id]);

  // 模型选择持久化
  useEffect(() => {
    let saved = readJSON(MKEY, MODELS[0].id);
    // 一次性迁移：旧默认 Surge 在上游不产建议块；把「仍是旧默认」的浏览器迁回 Turbo。
    // 用户之后手动选 Surge 会写回，不再覆盖。
    try {
      if (saved === "x-apex-surge-0505" && !localStorage.getItem("lg.model.migrated.v3")) {
        saved = "x-apex-flux-0217-16k";
        localStorage.setItem(MKEY, JSON.stringify(saved));
      }
      localStorage.setItem("lg.model.migrated.v3", "1");
    } catch {}
    if (MODELS.some((m) => m.id === saved)) setModel(saved);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MKEY, JSON.stringify(model));
    } catch {}
  }, [model]);

  const loadMemory = useCallback(async () => {
    try {
      const sid = sidRef.current || sessionId;
      const q = `/api/memory?cardId=${encodeURIComponent(card.id)}` +
        (sid ? `&sessionId=${encodeURIComponent(sid)}` : "");
      const r = await fetch(q, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (j?.memory) setMem(j.memory);
    } catch {}
  }, [card.id, sessionId]);

  useEffect(() => {
    setMem(null);
    setMemInput("");
    loadMemory();
  }, [card.id, sessionId, loadMemory]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(max-width: 1180px)").matches) setShowPanel(false);
  }, []);

  useEffect(() => {
    // 旧版单会话 → 多会话一次性迁移（最先跑，保证下面能选到旧会话）
    migrateV2toV3();
    if (!sessionId) {
      // 有 URL 指定的会话 → 用它；否则默认打开该卡最近的一个会话；都没有才新建
      if (initialSession) {
        setSessionId(initialSession);
        return;
      }
      const list0 = readJSON(SKEY, []);
      const mine0 = (Array.isArray(list0) ? list0 : [])
        .filter((x) => String(x.cardId) === String(card.id))
        .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
      setSessionId(mine0[0]?.sessionId || newSid());
      return;
    }
    const sid = sessionId;
    sidRef.current = sid;

    // 1) 本会话消息（多会话按 sid 隔离；新会话就是空的，绝不从别处复制）
    const saved = readJSON(mkey(card.id, sid), []);
    setMsgs(saved);

    // 3) 会话索引：upsert 当前会话
    const s = readJSON(SKEY, []);
    const prev = s.find((x) => String(x.sessionId) === String(sid));
    const next = [
      {
        sessionId: sid,
        cardId: card.id,
        name: card.name,
        cover: card.cover,
        lastAt: prev?.lastAt || Date.now(),
        last: prev?.last || "",
      },
      ...s.filter((x) => String(x.sessionId) !== String(sid)),
    ].slice(0, 200);
    localStorage.setItem(SKEY, JSON.stringify(next));
    setSessions(next);

    // 3) 空白会话的恢复顺序：服务器侧上游存档（跨设备同步）→ seeds 快照。
    //    「＋新对话」创建的会话（justNew）一律跳过；seeds 标记无条件落盘，避免重复注入。
    const justNew = isNewRef.current;
    isNewRef.current = false;
    const deleted = readJSON(DKEY, []);
    const seedsFlag = "lg.seeds.restored." + card.id;
    const seedsDone = !!localStorage.getItem(seedsFlag);
    try { localStorage.setItem(seedsFlag, "1"); } catch {}
    let alive = true;

    const writeIndex = (list) => {
      const last = [...list].reverse().find((m) => m.role === "assistant");
      const idx = readJSON(SKEY, []);
      const nextIdx = idx.map((x) => String(x.sessionId) === String(sid)
        ? { ...x, lastAt: Date.now(), last: (last?.content || "").slice(0, 42) }
        : x);
      localStorage.setItem(SKEY, JSON.stringify(nextIdx));
      setSessions(nextIdx);
    };

    const restore = async () => {
      // 手机玩出来的会话在同一张卡下、但消息在手机 localStorage；上游存档才是共用源。
      // 不只看空会话：PC 里存的是旧缓存时，只要云端更全就覆盖（手机新聊的轮次才会出现）。
      if (!justNew) {
        try {
          const q = `/api/history?cardId=${encodeURIComponent(card.id)}&sessionId=${encodeURIComponent(sid)}`;
          const r = await fetch(q, { cache: "no-store" });
          if (r.ok) {
            const j = await r.json();
            const list = (j?.messages || []).map((m, i) => ({
              id: `h${i}`,
              role: m.role,
              content: m.content,
              ts: Date.now() - ((j.messages.length - i) * 1000),
            }));
            if (alive && list.length > saved.length) {
              setMsgs(list);
              localStorage.setItem(mkey(card.id, sid), JSON.stringify(list));
              writeIndex(list);
              return;
            }
          }
        } catch {}
      }
      if (!justNew && !saved.length && !seedsDone
          && !deleted.some((x) => String(x) === String(card.id))) {
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
            localStorage.setItem(mkey(card.id, sid), JSON.stringify(restored));
          })
          .catch(() => {});
      }
    };
    restore();
    return () => {
      alive = false;
    };
  }, [card.id, card.name, card.cover, sessionId, initialSession]);

  // 跨设备同步：把服务器侧登记过的会话补进左侧列表（手机玩的在这里出现）。
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 不带 cardId：一次拿全部卡片的会话，左侧列表才能跨卡显示手机玩过的内容
        const r = await fetch("/api/sessions", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const rows = Array.isArray(j?.sessions) ? j.sessions : [];
        if (!alive || !rows.length) return;
        const local = readJSON(SKEY, []);
        const byId = new Map((Array.isArray(local) ? local : []).map((x) => [String(x.sessionId), x]));
        let changed = false;
        for (const s of rows) {
          const sid2 = String(s.sessionId || "");
          if (!sid2 || byId.has(sid2)) continue;
          const same = String(s.cardId) === String(card.id);
          byId.set(sid2, {
            sessionId: sid2,
            cardId: s.cardId || card.id,
            name: s.name || (same ? card.name : `卡片 ${s.cardId}`),
            cover: s.cover || (same ? card.cover : ""),
            lastAt: (Number(s.updatedAt) || 0) * 1000 || Date.now(),
            last: s.summary || "云端会话",
          });
          changed = true;
        }
        if (!changed) return;
        const next = [...byId.values()]
          .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0))
          .slice(0, 200);
        localStorage.setItem(SKEY, JSON.stringify(next));
        setSessions(next);
      } catch {}
    })();
    return () => { alive = false; };
  }, [card.id, card.name, card.cover]);

  const loadPool = useCallback(async () => {
    try {
      const r = await fetch("/api/pool", { cache: "no-store" });
      const j = await r.json();
      setPool(j);
      // 零扣费自检：服务端的告警记录比本机「已读」时间新，就再提示一次
      const fa = j?.freeAlert;
      if (fa && fa.at) {
        // 服务端的 at 是「秒」；本机已读时间也统一存秒，避免新旧记录口径不一致
        let dismissed = 0;
        try {
          dismissed = Number(localStorage.getItem("lan.free.alert.dismissed") || 0);
          if (dismissed > 1e12) dismissed = Math.floor(dismissed / 1000);
        } catch {}
        if (Number(fa.at) > dismissed) setFreeAlert(fa);
      }
    } catch {}
  }, []);

  const dismissFreeAlert = useCallback(() => {
    setFreeAlert(null);
    try {
      // 与服务端 free_alert.at 对齐：统一用秒
      localStorage.setItem("lan.free.alert.dismissed", String(Math.floor(Date.now() / 1000)));
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
      const sid = sidRef.current || sessionId;
      const trimmed = list
        .slice(-120)
        .map(({ id, role, content, ts }) => ({ id, role, content, ts }));
      localStorage.setItem(mkey(card.id, sid), JSON.stringify(trimmed));
      const s = readJSON(SKEY, []);
      const prev = s.find((x) => String(x.sessionId) === String(sid));
      const next = [
        {
          sessionId: sid,
          cardId: card.id,
          name: card.name,
          cover: card.cover,
          lastAt: Date.now(),
          last: lastText ?? prev?.last ?? "",
        },
        ...s.filter((x) => String(x.sessionId) !== String(sid)),
      ].slice(0, 200);
      localStorage.setItem(SKEY, JSON.stringify(next));
      setSessions(next);
    },
    [card.id, card.name, card.cover, sessionId]
  );

  const saveMemory = useCallback(
    async (body) => {
      setMemBusy(true);
      try {
        const sid = sidRef.current || sessionId;
        const r = await fetch("/api/memory", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cardId: card.id, sessionId: sid || undefined, ...body }),
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

  // 删单条消息后重建记忆：manual 锚点保留、auto 从当前历史重抽、摘要清空待重生成。
  // 这样删掉的那段剧情不会继续留在「前情摘要」或自动锚点里。
  const rebuildMemory = useCallback(
    async (list) => {
      const history = (list || [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-200)
        .map((m) => ({
          role: m.role,
          content: m.role === "assistant" ? splitSug(m.content).text : m.content,
        }));
      try {
        const r = await fetch("/api/memory", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cardId: card.id,
            sessionId: sidRef.current || sessionId || undefined,
            rebuild: true,
            history,
          }),
        });
        const j = await r.json().catch(() => null);
        if (j?.memory) setMem(j.memory);
      } catch {}
    },
    [card.id, sessionId]
  );

  // 保留每条锚点原有的 source：auto 是从对话消息抽出来的，必须保持 auto，
  // 否则任何面板操作都会把它转成 manual → 删掉那条消息后 rebuild 也删不掉它。
  const pinsBody = (list) => ({
    pinned: (list || []).map((p) => ({
      text: p.text,
      source: p.source === "auto" ? "auto" : "manual",
    })),
  });

  const addPin = useCallback(async () => {
    const text = memInput.trim();
    if (!text) return;
    const pins = [...(mem?.pinned || []), { text, source: "manual" }];
    const saved = await saveMemory(pinsBody(pins));
    if (saved) setMemInput("");
  }, [mem, memInput, saveMemory]);

  const addPreset = useCallback(
    async (text) => {
      const t = (text || "").trim();
      if (!t) return;
      const exists = (mem?.pinned || []).some((p) => (p.text || "").trim() === t);
      if (exists) {
        setNote("这条设定已在记忆里");
        return;
      }
      const pins = [...(mem?.pinned || []), { text: t, source: "manual" }];
      const saved = await saveMemory(pinsBody(pins));
      if (saved) setNote("已加入记忆");
    },
    [mem, saveMemory]
  );

  const delPin = useCallback(
    (id) => {
      const pins = (mem?.pinned || []).filter((p) => p.id !== id);
      saveMemory(pinsBody(pins));
    },
    [mem, saveMemory]
  );

  const clearMemory = useCallback(() => {
    saveMemory({ clear: true });
    setMem({ pinned: [], summary: "", summarizedUpTo: 0 });
    setNote("长期记忆已清空");
  }, [saveMemory]);

  // 把「卡片级旧记忆」导入当前会话（老对话一键找回）
  const importCardMemory = useCallback(async () => {
    const sid = sidRef.current || sessionId;
    setMemBusy(true);
    try {
      const r = await fetch("/api/memory", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cardId: card.id, sessionId: sid || undefined, importCard: true }),
      });
      const j = await r.json().catch(() => null);
      if (j?.memory) {
        setMem(j.memory);
        setNote("已导入卡片旧记忆");
      } else {
        setNote("没有找到卡片级旧记忆");
      }
    } catch {
      setNote("导入失败");
    } finally {
      setMemBusy(false);
    }
  }, [card.id, sessionId]);

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

  // rAF 平滑揭示：每帧追平 25% backlog（至少 1 字），把上游的「一坨一坨」
  // 摊成连续字符流；流式结束（streamingRef=false）后把剩余一次性出完再停。
  const revealTick = useCallback(() => {
    rafRef.current = 0;
    const clean = splitSug(accRef.current).text;
    const target = clean.length;
    if (shownRef.current < target) {
      const remain = target - shownRef.current;
      const step = Math.max(1, Math.ceil(remain * 0.25));
      shownRef.current = Math.min(target, shownRef.current + step);
    }
    setStreaming(clean.slice(0, shownRef.current));
    if (shownRef.current < target || streamingRef.current) {
      rafRef.current = requestAnimationFrame(revealTick);
    }
  }, []);

  const kickReveal = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(revealTick);
  }, [revealTick]);

  const stopReveal = useCallback(() => {
    streamingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const send = useCallback(
    async (textArg, historyArg, opts) => {
      const text = (textArg ?? input).trim();
      // busy 是异步 state：双击时第二次调用读到的还是 false，必须用同步 ref 挡。
      if (!text || busy || busyRef.current) return;
      const now = Date.now();
      if (lastSendRef.current.text === text && now - lastSendRef.current.ts < 2000) return;
      lastSendRef.current = { text, ts: now };
      busyRef.current = true;
      const base = historyArg ?? msgs;
      if (!textArg) setInput("");
      setBusy(true);
      setStreaming("");
      setNote("");
      stick.current = true;

      const userMsg = { id: uid(), role: "user", content: text, ts: Date.now() };
      const nextMsgs = [...base, userMsg];
      setMsgs(nextMsgs);

      // 前端不再做 head/tail 裁剪：预算统一由引擎按模型 ctx 计算。
      // 只保留最近 200 条，避免请求体无限增长；中段消息必须交给引擎，
      // 否则 summary_window 看不到它们，summarizedUpTo 会随 tail 组合漂移。
      const MAX_SEND_MSGS = 200;
      const history = base
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-MAX_SEND_MSGS)
        .map((m) => ({
          role: m.role,
          // 助手消息里的 <sug> 建议块不回灌：省 token，也避免模型复读建议
          content: m.role === "assistant" ? splitSug(m.content).text : m.content,
        }));

      const rewind = Boolean(opts?.rewind || rewindRef.current);
      rewindRef.current = false;
      const ctl = new AbortController();
      abort.current = ctl;
      let finished = false;
      // 新一轮：清空揭示缓冲
      accRef.current = "";
      shownRef.current = 0;
      streamingRef.current = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cardId: card.id,
            sessionId: sidRef.current || sessionId || undefined,
            prompt: text,
            history,
            model,
            maxTokens: clampTokens(maxTokens),
            rounds: Number(rounds) || 1,
            // 恢复的旧会话：告诉引擎用哪个 chatId / 哪个号，
            // 否则 createByCard 会新建一个空会话，历史接不上。
            chatId: chatIdRef.current || undefined,
            account: seedAcctRef.current || undefined,
            // 撤回/重新生成：让引擎丢掉上游旧会话，从当前 head 重开一条
            rewind: rewind || undefined,
          }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        await readSSE(res, (ev, d) => {
          if (ev === "delta") {
            accRef.current += d.text || "";
            // 不再每包重算整段 splitSug + setState：累到 ref，交给 rAF 平滑揭示
            kickReveal();
          } else if (ev === "account") {
            setNote(`账号 ${d.name}`);
          } else if (ev === "memory") {
            setMem((cur) => ({ ...(cur || {}), ...d }));
          } else if (ev === "memory_update") {
            setMem((cur) => ({ ...(cur || {}), ...d }));
            setNote("长期记忆已更新");
          } else if (ev === "free_warn") {
            // 免费模型开始扣费：立刻挂出常驻告警，别让用户默默被扣
            setFreeAlert(d);
          } else if (ev === "complete") {
            finished = true;
            stopReveal();
            const final = d.text || accRef.current || "";
            const list = [
              ...nextMsgs,
              { id: uid(), role: "assistant", content: final, ts: Date.now() },
            ];
            setMsgs(list);
            setStreaming("");
            save(list, final.slice(0, 42));
            // 摘要在后台线程生成，complete 之后引擎不会再推 memory 事件；
            // 4s / 15s 各拉一次，长摘要也能在面板里出现（PRD §5.3）。
            setTimeout(() => { loadMemory(); }, 4000);
            setTimeout(() => { loadMemory(); }, 15000);
            const mine =
              d.userCredit != null ? ` · 我的积分 ${Number(d.userCredit).toFixed(2)}` : "";
            setNote(
              d.free
                ? `完成 · 无限模型零扣费${mine}`
                : d.credit != null
                  ? `完成 · ${d.account} · 余额 ${Number(d.credit).toFixed(2)}${mine}`
                  : `完成${mine}`
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
        stopReveal();
        if (!finished && accRef.current) {
          const list = [
            ...nextMsgs,
            { id: uid(), role: "assistant", content: accRef.current, ts: Date.now() },
          ];
          setMsgs(list);
          save(list, accRef.current.slice(0, 42));
        }
        busyRef.current = false;
        setBusy(false);
        setStreaming("");
        abort.current = null;
        taRef.current?.focus();
      }
    },
    [input, busy, msgs, card.id, model, maxTokens, rounds, save, loadMemory, kickReveal, stopReveal]
  );

  // 把本机这条会话的完整消息上传到引擎（手机 → 云端），其它设备即可拉到。
  const uploadSession = useCallback(async () => {
    const sid = sidRef.current || sessionId;
    if (!sid) {
      setNote("当前会话没有 sessionId，无法上传");
      return;
    }
    const list = (msgs || []).filter((m) => m.role === "user" || m.role === "assistant");
    if (!list.length) {
      setNote("本会话没有消息可上传");
      return;
    }
    try {
      const r = await fetch("/api/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          sessionId: sid,
          messages: list.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setNote("上传失败：" + (j?.error || r.status));
        return;
      }
      setNote(`已上传 ${j?.count ?? list.length} 条到云端，PC 打开即可看到`);
    } catch (e) {
      setNote("上传失败：" + String(e).slice(0, 60));
    }
  }, [msgs, card.id, sessionId]);

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
    // 重新生成=撤回上一轮：必须让引擎丢掉上游那条会话里的旧尾巴
    send(msgs[realIdx].content, head, { rewind: true });
  }, [busy, msgs, save, send]);

  const del = useCallback(
    (id) => {
      const list = msgs.filter((m) => m.id !== id);
      setMsgs(list);
      // 删掉一条消息后，上游会话仍留着它；下一次发送前重开一条干净会话
      rewindRef.current = true;
      const last = list.filter((m) => m.role === "assistant").at(-1);
      save(list, last?.content?.slice(0, 42) || "");
      rebuildMemory(list);
    },
    [msgs, save, rebuildMemory]
  );

  // 清空当前会话 = 本会话从零开始：清本地消息 + 清本会话记忆 + 删本会话上游
  const clear = useCallback(() => {
    const sid = sidRef.current || sessionId;
    setMsgs([]);
    localStorage.removeItem(mkey(card.id, sid));
    save([], "");
    fetch("/api/memory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId: card.id, sessionId: sid || undefined, clear: true }),
    }).catch(() => {});
    setMem(null);
    setNote("已清空本会话（含记忆）");
  }, [card.id, save, sessionId]);

  // 自定义建议卡片：加一条 / 删一条
  const addCustom = () => {
    const v = customInput.trim().replace(/\s+/g, " ");
    if (!v || customSug.includes(v)) {
      setCustomInput("");
      return;
    }
    setCustomSug([...customSug, v].slice(0, CUSTOM_MAX));
    setCustomInput("");
    setShowCustomAdd(false);
  };

  const delCustom = (idx) => setCustomSug(customSug.filter((_, i) => i !== idx));

  // 从列表移除一个会话：消息体 + 索引 + 该会话上游存档；共享记忆不动。
  const dropSession = useCallback(
    (sid) => {
      try {
        localStorage.removeItem(mkey(card.id, sid));
        const next = readJSON(SKEY, []).filter((x) => String(x.sessionId) !== String(sid));
        localStorage.setItem(SKEY, JSON.stringify(next));
        setSessions(next);
        if (String(sid) === String(sidRef.current || sessionId)) {
          setMsgs([]);
          setNote("已删除本会话（共享记忆保留）");
        }
      } catch {}
      // 服务端：清该会话记忆 + 删该会话上游存档（sessionId 维度）
      fetch("/api/memory", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cardId: card.id, sessionId: sid, clear: true }),
      }).catch(() => {});
    },
    [card.id, sessionId]
  );

  // 新开一个会话：新 sessionId，不影响已有会话
  const newSession = useCallback(() => {
    const sid = newSid();
    sidRef.current = sid;
    isNewRef.current = true;   // 新会话：绝不做 seeds 恢复，保持空白
    chatIdRef.current = null;
    seedAcctRef.current = null;
    setSessionId(sid);
    setMsgs([]);
    setStreaming("");
    setNote("已开新会话");
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("s", sid);
      window.history.replaceState({}, "", u);
    } catch {}
  }, []);

  // 切换到已有会话
  const openSession = useCallback((sid) => {
    if (!sid) return;
    sidRef.current = sid;
    chatIdRef.current = null;
    seedAcctRef.current = null;
    setSessionId(sid);
    setMsgs([]);
    setStreaming("");
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("s", sid);
      window.history.replaceState({}, "", u);
    } catch {}
  }, []);

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
    <div className="shell">
      {/* 与首页/详情页共用同一条导航；池子与状态并进 .chat-head，不再自建一条 */}
      <Nav />

      <div className={`chat-shell ${showPanel ? "" : "no-panel"}`}>
        <SessionList
          open={showSess}
          sessions={sessions}
          currentId={sessionId}
          cardId={card.id}
          onClose={() => setShowSess(false)}
          onDelete={dropSession}
          onOpen={openSession}
          onUpload={uploadSession}
          onNew={() => {
            newSession();
            setShowSess(false);
          }}
          onOpenSettings={() => {
            setShowSess(false);
            setShowPanel(true);
          }}
        />

        <main className="chat-main">
          <div className="chat-head">
            {/* 手机端：打开对话抽屉 */}
            <button
              className="head-burger press"
              onClick={() => setShowSess((v) => !v)}
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
            {/* 手机端：回到首页；桌面端隐藏 */}
            <Link className="head-back press" href="/" aria-label="返回首页">
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
              <span>{(card.tags || []).slice(0, 3).join(" · ") || "角色卡"}</span>
            </div>
            <span className="spacer" />
            {pool && !pool.offline ? (
              <span className={`pool-badge head-pool ${pool.total < 3.4 ? "empty" : ""}`}>
                {isFreeModel(model) ? "∞ 零扣费" : `池 ${Number(pool.total).toFixed(1)}`}
              </span>
            ) : null}
            <ThemeToggle className="head-theme" />
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

          {note ? <div className="chat-note">{note}</div> : null}

          {freeAlert ? (
            <div className="free-alert" role="alert">
              <b>零扣费失效</b>
              <span>
                {freeAlert.account ? `账号 ${freeAlert.account} ` : ""}
                余额 {Number(freeAlert.prev ?? 0).toFixed(2)} → {Number(freeAlert.credit ?? 0).toFixed(2)}
                （-{Number(freeAlert.spent ?? 0).toFixed(2)} 积分）。上游可能已修复无限模型，
                建议立即切回付费档，避免继续被扣。
              </span>
              <button type="button" onClick={dismissFreeAlert}>知道了</button>
            </div>
          ) : null}

          {pool && !pool.offline && pool.usable === 0 && !isFreeModel(model) ? (
            <div className="pool-empty">
              号池额度已用完（{pool.count} 个号全部见底）。开新号后这里会自动恢复；
              需要继续对话可切到「∞ 无限」模型（零扣费，不占号池额度）。
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
              parsed.text = sanitizeName(parsed.text);
              if (parsed.sug.length) parsed.sug = parsed.sug.map(sanitizeName);
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
                      onClick={() => navigator.clipboard?.writeText(parsed.text)}
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

          <div className="custom-sug">
            {customSug.map((txt, i) => (
              <span className="csug-item" key={txt}>
                <button className="sug-chip press" onClick={() => send(txt)} disabled={busy}>
                  {txt}
                </button>
                <button
                  className="csug-del"
                  onClick={() => delCustom(i)}
                  aria-label="删除自定义建议"
                >
                  ×
                </button>
              </span>
            ))}
            {showCustomAdd ? (
              <span className="csug-add">
                <input
                  className="inp"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                    if (e.key === "Escape") setShowCustomAdd(false);
                  }}
                  placeholder="输入一条自定义建议，回车添加"
                  maxLength={60}
                />
                <button
                  className="btn btn-ghost press"
                  onClick={addCustom}
                  disabled={!customInput.trim()}
                >
                  添加
                </button>
                <button className="btn btn-ghost press" onClick={() => setShowCustomAdd(false)}>
                  取消
                </button>
              </span>
            ) : (
              <button className="csug-plus press" onClick={() => setShowCustomAdd(true)}>
                + 自定义
              </button>
            )}
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
                  // 清空后 scrollHeight 仍含 padding，不会自动回到一行；
                  // 空值时显式用 scrollHeight 与最小高度取小，才能缩回去。
                  const min = 24; // 一行 16px*1.45 ≈ 23.2
                  el.style.height =
                    (e.target.value ? Math.min(180, el.scrollHeight) : min) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                  if (e.key === "Escape" && busy) stop();
                }}
                placeholder="说点什么…"
                rows={1}
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
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
          <>
            <div
              className="drawer-mask"
              onClick={() => setShowPanel(false)}
              aria-hidden="true"
            />
            <aside className="side glass glass-tinted side-right drawer" aria-label="会话设置">
              <div className="drw-head">
                <h3>本会话</h3>
                <button
                  type="button"
                  className="drw-close press"
                  onClick={() => setShowPanel(false)}
                  aria-label="关闭设置"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
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
                <div className="hint">
                  这是上限，不是保证 —— 单段通常输出 4800~5600 字
                </div>

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
                <div className="mem-presets">
                  {MEM_PRESETS.map((p) => {
                    const on = (mem?.pinned || []).some((x) => (x.text || "").trim() === p.text);
                    return (
                      <button
                        key={p.label}
                        type="button"
                        className={`mem-preset press ${on ? "on" : ""}`}
                        onClick={() => addPreset(p.text)}
                        disabled={memBusy}
                        title={p.text}
                      >
                        {on ? "✓ " : ""}
                        {p.label}
                      </button>
                    );
                  })}
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
                  <button className="btn btn-ghost press" onClick={importCardMemory} disabled={memBusy}>
                    导入旧记忆
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
