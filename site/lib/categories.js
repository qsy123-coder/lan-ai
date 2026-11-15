import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 分类数据来自 dzmm.ai 的 category.list（2026-11-15 实测 21 条），
// 落在 site/data/categories.json，随源码一起同步/部署。
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(HERE, "..", "data", "categories.json");
const FILE = process.env.CATEGORIES_FILE || DEFAULT_FILE;

let CACHE = null;
let MTIME = 0;

function raw() {
  try {
    const st = fs.statSync(FILE);
    if (CACHE && st.mtimeMs === MTIME) return CACHE;
    const j = JSON.parse(fs.readFileSync(FILE, "utf8"));
    CACHE = Array.isArray(j) ? j : [];
    MTIME = st.mtimeMs;
    return CACHE;
  } catch (e) {
    if (!CACHE) console.error(`[categories] 读取失败 ${FILE}: ${e.code || e.message}`);
    return CACHE || [];
  }
}

const norm = (s) => String(s || "").trim().toLowerCase();

export function loadCategories() {
  return raw();
}

export function getCategory(key) {
  const k = String(key || "");
  return raw().find((c) => c.name === k || String(c.id) === k) || null;
}

export function categoryTagSet(cat) {
  return new Set((cat.tags || []).map(norm));
}

export function matchesCategory(card, cat) {
  const tags = categoryTagSet(cat);
  if (!tags.size) return false;
  return (card.tags || []).some((t) => tags.has(norm(t)));
}

export function categoriesWithCounts(cards) {
  return raw().map((c) => ({
    ...c,
    count: (cards || []).reduce((n, card) => n + (matchesCategory(card, c) ? 1 : 0), 0),
  }));
}
