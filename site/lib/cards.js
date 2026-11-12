import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 默认按本仓库定位，别写死某台机器的盘符（原为 Z:\project\...，换机后静默读空 → 首页无卡）。
// site/lib/cards.js -> 仓库根在上一级的上一级。
// 服务器上构建产物不在仓库内，用 CARDS_FILE 覆盖指向数据目录。
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(HERE, "..", "..", "captures", "site", "cards.json");
const FILE = process.env.CARDS_FILE || DEFAULT_FILE;

let CACHE = null;
let MTIME = 0;

// 生产环境缓存：只读一次磁盘，文件变了才重读（原来每次调用都全量 JSON.parse 1.4 MB）
function raw() {
  try {
    const st = fs.statSync(FILE);
    if (CACHE && st.mtimeMs === MTIME) return CACHE;
    const j = JSON.parse(fs.readFileSync(FILE, "utf8"));
    CACHE = Array.isArray(j) ? j : [];
    MTIME = st.mtimeMs;
    return CACHE;
  } catch (e) {
    // 静默返回空数组会让「路径写错」表现成「首页没有卡」，排查成本极高。
    if (!CACHE) console.error(`[cards] 读取失败 ${FILE}: ${e.code || e.message}`);
    return CACHE || [];
  }
}

// 列表页只需要这几个字段，其余（images/creatorNotes/popularity…）2.6 KB/张 白传给浏览器
const LIGHT = [
  "id",
  "name",
  "cover",
  "tags",
  "creator",
  "creatorAvatar",
  "likes",
  "popularity",
  "isSensitive",
  "publishedAt",
];

export function loadCards() {
  return raw();
}

// 部分卡片的 tags 极长（实测一张 140 个），全量会撑爆 HTML 且把顶部标签栏冲成稀有词。
// 列表页只用 tags 做筛选与计数，取前 6 个足够；详情页走 getCard() 拿全量。
const LIGHT_TAGS = 6;

export function lightCards() {
  return raw().map((c) => {
    const o = {};
    for (const k of LIGHT) {
      if (c[k] === undefined) continue;
      o[k] = k === "tags" && Array.isArray(c[k]) ? c[k].slice(0, LIGHT_TAGS) : c[k];
    }
    return o;
  });
}

export function getCard(id) {
  const s = String(id);
  return raw().find((c) => String(c.id) === s) || null;
}

export function allTags(cards) {
  const m = new Map();
  for (const c of cards) for (const t of c.tags || []) m.set(t, (m.get(t) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
