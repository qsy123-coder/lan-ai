import fs from "node:fs";

const FILE = process.env.CARDS_FILE || "Z:\\project\\captures\\site\\cards.json";

export function loadCards() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

export function getCard(id) {
  return loadCards().find((c) => String(c.id) === String(id)) || null;
}

export function allTags(cards) {
  const m = new Map();
  for (const c of cards) for (const t of c.tags || []) m.set(t, (m.get(t) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
