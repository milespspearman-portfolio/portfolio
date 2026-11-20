// Build gate (Nov 7 2026): every playlist in `portfolio` must have exactly one
// line in BUCKET_OF and in CHAPTER_OF (Nov 20 2026), and neither map may name
// a playlist that does not exist.
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

// Comment lines do not count on either side. A playlist row that is commented
// out in `portfolio` (Cannes, pulled Jul 4 2026 on Miles's word) is not live,
// and the browser-side check would throw on a map line for it.
const live = (text) => text.split("\n").filter(l => !l.trim().startsWith("//")).join("\n");
const playlists = new Set([...live(portfolioText).matchAll(/\bevent:\s*"([^"]*)"/g)].map(m => m[1]));

// Nov 20 2026 (Tyler build): CHAPTER_OF, the campaign-chapter map that sorts
// #/work, gets the same two-way check as BUCKET_OF.
let failed = false;
for (const name of ["BUCKET_OF", "CHAPTER_OF"]) {
  const mapText = slice(`const ${name} = {`, "};");
  const keys = new Set([...live(mapText).matchAll(/"([^"]*)"\s*:/g)].map(m => m[1]));
  for (const n of [...playlists].filter(n => !keys.has(n))) { console.error(`missing from ${name}: ${n}`); failed = true; }
  for (const n of [...keys].filter(n => !playlists.has(n))) { console.error(`extra in ${name} (not a playlist): ${n}`); failed = true; }
}
if (failed) process.exit(1);
console.log(`kind map OK: ${playlists.size} playlists (BUCKET_OF + CHAPTER_OF)`);
