// Build gate (Nov 7 2026): every playlist in `portfolio` must have exactly one
// line in BUCKET_OF (the kind map that sorts the #/work shelves), and the map
// must name no playlist that does not exist.
// Plain Node, no dependencies, no JSX parsing. Runs as `prebuild`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = readFileSync(fileURLToPath(new URL("../src/Portfolio.jsx", import.meta.url)), "utf8");
const lines = src.split("\n");

const slice = (startLine, endLine) => {
  const start = lines.findIndex(l => l.startsWith(startLine));
  if (start < 0) { console.error(`check-kind-map: could not find "${startLine}"`); process.exit(1); }
  const end = lines.findIndex((l, i) => i > start && l === endLine);
  if (end < 0) { console.error(`check-kind-map: no "${endLine}" after "${startLine}"`); process.exit(1); }
  return lines.slice(start, end + 1).join("\n");
};

const portfolioText = slice("const portfolio = [", "];");
const mapText = slice("const BUCKET_OF = {", "};");

// Comment lines do not count on either side. A playlist row that is commented
// out in `portfolio` (Cannes, pulled Jul 4 2026 on Miles's word) is not live,
// and the browser-side check would throw on a map line for it.
const live = (text) => text.split("\n").filter(l => !l.trim().startsWith("//")).join("\n");

const playlists = new Set([...live(portfolioText).matchAll(/\bevent:\s*"([^"]*)"/g)].map(m => m[1]));
const keys = new Set([...live(mapText).matchAll(/"([^"]*)"\s*:/g)].map(m => m[1]));

const missing = [...playlists].filter(n => !keys.has(n));
const extra = [...keys].filter(n => !playlists.has(n));

if (missing.length || extra.length) {
  for (const n of missing) console.error(`missing from BUCKET_OF: ${n}`);
  for (const n of extra) console.error(`extra in BUCKET_OF (not a playlist): ${n}`);
  process.exit(1);
}
console.log(`kind map OK: ${playlists.size} playlists`);
