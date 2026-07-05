# Timeline Design Decision — the buildable spec

**Decider:** design-judge lens · **Date:** Jul 4, 2026
**Scope:** a NEW `<CareerTimeline />` section added directly under "Selected Work," additive (does not touch WorkPlayer, PlaylistShelf, or the sidebar libraries). Professional work only — jazz/Off The Clock fenced out at the data layer.

---

## VERDICT

**Build the VERTICAL SPINE (Concept A) as the primary — a single continuous top-to-bottom timeline of professional milestones, newest first, with big red sticky YEAR markers you scroll past and category-colored nodes that expand-in-place to play the reel.** Graft two things onto it: (1) Concept C's honest "cadence" read — the year markers carry a derived one-line density stat so the 2025 crescendo is legible at a glance, and (2) Concept B's lighter tap-to-play *default* — collapsed nodes are posters only; exactly one `<video>` mounts on tap. Reject the standalone Gantt and the year-swipe-carousel as the *primary* layout.

### Why the spine beats the other two

1. **Mobile finger-swipe ergonomics (the decider).** The site's hard law is *zero horizontal body scroll; wide content scrolls its own container*. A vertical spine IS the phone's native gesture — you already scroll the page down; the timeline is just more page. Concept B's year-carousel and Concept C's Gantt both make the *timeline itself* a horizontal-scroll container nested inside the vertical page — the exact vertical-inside-horizontal gesture conflict the mobile rule warns against, and on a Gantt the two lanes must scroll-lock together, which is fiddly on touch. The spine has ONE horizontal-scroll element (the other-reels chip strip inside an *opened* node), which is the sanctioned marquee exception, not the primary read.
2. **Recruiter legibility of "what & when."** The spine reads as one continuous "career climbing" motion, newest-first, with the year always on screen labeling what you're looking at. Grafting C's density line onto each year marker ("2025 · 5 events · 12.7M plays") gives the crescendo story *without* the Gantt's fragility. Concept C's Gantt is the most *information-dense* but its truth-telling backfires: In-House Production spans Sep '24 → Jun '26 as one bar that visually swallows the composition, and single-day events collapse to dots needing a 64px floor + greedy row-packing — real complexity for a read most recruiters do in two seconds anyway. Concept B answers "what" but flattens the cadence into equal-looking year tabs.
3. **DNA fidelity + the locked interaction.** Miles's rule is "just expands, no navigation jumps." Concept B's tap-to-play dispatches `ms-play` and smooth-scrolls the viewer UP to the WorkPlayer — that is a nav jump, and it violates the locked requirement literally. The spine expands the reel *in the node* using the proven drawer pattern (line 1409-1423). We still keep a `ms-play` handoff, but only as a secondary "Open in full player →" affordance, never the primary tap.
4. **Buildability.** All three are ~60-120 lines of self-contained inline-styled component reusing the same helpers. The spine needs the *least* new machinery: no axis-mapping math, no greedy row-pack, no scroll-lock between lanes, no snap-point tuning. One `openIdx` state + one scroll ref for the rail fill.

**What would flip it:** if Miles insists on his literal year-swipe sketch, ship Concept B's year-tabs as a filter *on top of* the spine (tap a year = scroll-to that year's sticky marker) rather than as horizontal panels — keeps the vertical spine, honors the sketch. That is the only concession worth making and it's additive.

---

## Layout & orientation — the spine

A vertical rail down the left, editorial and asymmetric (NOT centered-zigzag — centered timelines read wedding-invitation, not recruiter).

```
  2026  ●━━━ [ cover | title · role · window · plays · ▶ ]   ← node card
   │
   │     ●━━━ [ node card ]  ← TAPPED: grows, <video> drops in below, dot pulses
   │
 ──┿─ 2025 ─────────────  5 events · 12.7M plays   (sticky year marker)
   │
   │     ●━━━ [ node card ]
   ...
```

- **The rail:** a 2px vertical line at `left: clamp(20px, 6vw, 64px)`, color `C.border`. Overlaid with a **scroll-fill line** in `C.mint` (#1ED760) whose `height` tracks scroll progress through the section (one ref, `requestAnimationFrame`-throttled, `will-change: height`) — the spine "lights up green" behind you. **Gate this fill behind `prefers-reduced-motion: no-preference`;** the spine renders fine without it.
- **Year markers** are the editorial moment: `position: sticky; top: 72px` (desktop) / `60px` (mobile, under nav + safe-area). Year set in **`C.red` #FA0F00**, `font-size: clamp(40px, 8vw, 88px)`, weight 800, `letterSpacing: -3`. Under it, a small derived density line in `C.gray` (10.5px, letterSpacing 1): `{n} events · {fmtPlays(sumPlays)} plays` for that year. The sticky year pins under the nav, then gets pushed up by the next year's marker — this IS Miles's "swipe through years" feeling delivered vertically, and the density line is the grafted-in cadence read from Concept C.
- **Nodes** sit right of the rail: a **dot** on the rail (14px circle in the node's category color, soft halo `box-shadow: 0 0 0 6px {color}1F`) + a short connector stub + a **card**. Active/open node: dot → 18px, halo brightens.
- **Order:** newest-first. Filter pros, then sort strictly by `Math.max(...reels.map(reelDate))` descending across Events+Evergreen combined (do NOT keep the library-then-recency `portfolio` order — the spine is pure reverse-chronology).

---

## Node card (collapsed face)

Horizontal, real-frame-forward, quiet everywhere except the one red number:

```
┌───────────────────────────────────────────────┐
│ [9:16 cover]  ON LOCATION            ← eyebrow chip (category color, 10px)
│ [ real frame]  ’25 MAX LA            ← title, 800, clamp(20-28px)
│ [ ~84x120  ]  Created, produced & hosted   ← role line (category color, 12px)
│ [ ▶ badge  ]  Oct 2025 – Feb 2026 · 9 reels ← window + count (C.gray)
│               ▶ 6.0M plays                  ← hero metric, C.red, 22px, 800
└───────────────────────────────────────────────┘
```

- Cover = `eventStats[idx].cover` (real frame of the top-played reel — never emoji, honors the "looks fake" kill), 9:16, `loading="lazy"`, with a small `C.mint` ▶ badge bottom-right (fades in on hover for `_finePointer`; always visible on touch).
- **Hero play-count = the event's `totalPlays` in `C.red`**, `fontVariantNumeric: tabular-nums`, ~22px, weight 800 — EOY-deck styling, the proof number. Everything else quiet so it pops.
- Whole card is ONE tap target (≥44px), `cursor: pointer`. Desktop hover (`_finePointer`): `translateY(-2px)`, border → `{categoryColor}A6` — reuse the HeroCard hover recipe.
- Role line preserves "shot, produced, directed" (`eventStats[idx].role` from `EVENT_ROLES`) — Miles's stated must-keep.

---

## Color / label system

Two categories in scope. **Dot + text-label chip only — never a stat-badge grid** (killed taste). ≤2 accents + gray + the EOY red, matching design-judge's standing ≤2-accent rule.

| Category (`LIBRARY_OF`) | Accent | Eyebrow chip text | Where it shows |
|---|---|---|---|
| **Events** (MAX/Summit/NAB/IBC) | `C.mint` #1ED760 | `ON LOCATION` | rail dot + eyebrow chip + role line |
| **Evergreen** (In-House, Side Projects) | `C.gold` #F5C518 | `IN-HOUSE` | rail dot + eyebrow chip + role line |
| Year markers | `C.red` #FA0F00 | — | big sticky year number |
| Hero play-count (per node) | `C.red` #FA0F00 | — | the one big number per card |

- **Add `C.red: "#FA0F00"` and `C.gold: "#F5C518"` to the `C` object** (lines 3-7). Gold is in the taste record but not yet in the palette const; red is used as a literal elsewhere — promote both to tokens. Two-line change.
- Gold (not a 4th hue) is deliberately the "Musician." gold reused as the second professional accent, so events-vs-evergreen scans instantly down the spine (field-work green vs studio-work gold) without inventing a new color. No per-brand rainbow (MAX vs Summit vs NAB all stay green) — that noise is already killed elsewhere.
- No emoji, no icons on cards — the cover frame is the identity.

---

## Tap-to-play — expand INLINE (the locked interaction)

**Clone the specialty drawer's expand-row (lines 1409-1423) verbatim. Do NOT dispatch `ms-play` on the primary tap** — that bus (line 1097) scroll-jumps into WorkPlayer, violating "expand-in-place, no nav jump."

- State: `const [openIdx, setOpenIdx] = useState(null)` — index of the expanded node. **One video mounted at a time** (site's iron rule). `const [reelIdx, setReelIdx] = useState(0)` — which reel of the open event is playing.
- Tap a node → set `openIdx`; tap again (or open another) → collapse. Card body uses the signature grid-height animation: `gridTemplateRows: open ? "1fr" : "0fr"`, `transition: "grid-template-rows 0.4s ease"`, inner `overflow: hidden` (verbatim line 1409-1410). Card grows in place; spine below slides down; dot pulses active.
- Inside the opened region:
  - **One inline `<video ... controls autoPlay muted playsInline preload="metadata">`** playing the event's top-played reel first, `width: min(100%, 260px)`, `aspectRatio: 9/16`, rounded 12 — copy the element + attrs + `onError` → hide fallback from line 1413-1415 (missing mp4 degrades to "Watch on Instagram" gracefully; muted autoplay = iOS-safe, site default).
  - Below the video: the reel's description (`SPECIALTY_ROW_DESCS`-style lookup → `REEL_DESCS[title]` → `reel.role` fallback, same chain as line 1388) + "Open on Instagram ↗" (line 1417).
  - **A slim horizontal chip strip of the event's OTHER reels** (thumb · title · plays). Tap a chip → swap the single `<video src>` via `setReelIdx` (swap, never mount a 2nd element — one-video rule holds). This strip is the ONE `overflow-x: auto; overscroll-behavior-x: contain` container (marquee pattern), the sanctioned wide-content exception.
  - **Footer:** an "Open in full player →" link that DOES dispatch `ms-play` (`{ e: ev.idx, r: reelIdx }`) for the recruiter who wants the full sidebar/transport browse — secondary affordance only, never the primary tap. This is the C/B handoff grafted in without making it the default.

---

## Mobile behavior (first-class)

- **Spine shifts left:** rail at `left: 20px`; year markers `clamp(40-56px)`, still sticky at `top: 60px` (under mobile nav + safe-area-inset). Cards go full-width right of the rail; cover shrinks to ~72px.
- **Zero horizontal body scroll:** the timeline is pure vertical — the whole reason it beats the carousel/Gantt on phones. Only horizontal element = the other-reels chip strip inside an open node (`overflow-x: auto; overscroll-behavior-x: contain`).
- **Touch replaces hover:** the ▶ cover badge + "press to play" hint are always visible on `@media (hover: none)`, never hover-gated. Every card ≥44px tap target by construction; reel chips `min-height: 44px`.
- **No autoplay swarm:** collapsed nodes are **static poster `<img loading="lazy">` only** — video mounts ONLY on tap, one at a time. Baseline video cost ≈ zero (the wall/marquees already carry the live-video load); at most 1 `<video>` in the timeline ever, stricter than `LIVE_WALL`. Respects the phone-CPU rule.
- **Reduced motion:** gate the scroll-fill rail behind `prefers-reduced-motion: no-preference`; expand animation collapses to instant.
- Reuse the `.sp-now`/`.sp-side` media-query conventions in the existing `@media (max-width: 900px)` block rather than inventing new breakpoints.

---

## Data derivation (zero invention — which fields, how years)

Source = existing `portfolio` array + `eventStats`. **One node = one event** (~9 nodes, not 84 reels — the legibility win).

```js
// Fence: professional only (excludes Miles Music Media + Miles.Spearman)
const proEvents = eventStats.filter(ev => LIBRARY_OF[ev.event] !== "Off The Clock");

// Year bucket = year of the event's LATEST reel (matches how Miles thinks about
// "the MAX LA push"; In-House lands in its latest year, window string shows true span)
const yearOf = (ev) => new Date(Math.max(...ev.reels.map(reelDate))).getFullYear();

// Spine order: strict reverse-chronology across Events+Evergreen combined
const timelineNodes = [...proEvents].sort(
  (a, b) => Math.max(...b.reels.map(reelDate)) - Math.max(...a.reels.map(reelDate))
);

// Year markers + density line (the grafted-in cadence read)
const TL_YEARS = [...new Set(timelineNodes.map(yearOf))].sort((a, b) => b - a);
const yearMeta = Object.fromEntries(TL_YEARS.map(y => {
  const evs = timelineNodes.filter(ev => yearOf(ev) === y);
  return [y, { count: evs.length, plays: evs.reduce((s, e) => s + e.totalPlays, 0) }];
}));
```

Per node, every field is already derived — nothing typed:
- **title** = `ev.event` · **window** = `ev.window` (= `fmtWindow`, min→max reel date) · **role** = `ev.role` (`EVENT_ROLES`, keeps "shot/produced/directed") · **cover** = `ev.cover` (real top-reel frame) · **hero metric** = `fmtPlays(ev.totalPlays)` · **reel count** = `ev.reels.length` · **category** = `LIBRARY_OF[ev.event]` → mint (Events) / gold (Evergreen) · **idx** = `ev.idx` (for the `ms-play` handoff).
- Inline player reuses `srcOf`, `thumbOf`, the `REEL_DESCS`/role desc chain, `fmtPlays`, `playsNum`.

**One flag for Miles (don't invent):** In-House Production spans 2024–2026 but lands in one year lane (its latest). Ship it as one node in its latest year with the true `fmtWindow` span shown (simplest, honest). If he wants more spine drama later, split it per-year — his call, don't do it unprompted.

---

## Build checklist for Portfolio.jsx

1. **Palette (lines 3-7):** add `red: "#FA0F00"` and `gold: "#F5C518"` to the `C` object.
2. **Derived consts (near `eventStats`, ~line 296):** add `proEvents`, `yearOf`, `timelineNodes`, `TL_YEARS`, `yearMeta` per the block above. Module scope, alongside the existing derived stats.
3. **New component `<CareerTimeline />`** (self-contained, ~110-130 lines, inline styles, `C.*` palette):
   - State: `openIdx` (open node), `reelIdx` (active reel in open node), one scroll ref for rail fill.
   - Render: section heading block (eyebrow `TIMELINE` in mint uppercase letterSpacing 3 + `h2` "The Work, In Order" clamp(28-48px) 800 — mirror the Selected Work header at 1812-1814, wrapped in `<FadeIn>`).
   - Map `timelineNodes` newest-first; before each node whose `yearOf` differs from the previous, emit a sticky **year marker** (red number + gray density line from `yearMeta`).
   - Node = rail dot (category color) + connector + card (cover, eyebrow chip, title, role, window·count, red hero plays) + the `0fr→1fr` expand region (inline `<video>` cloned from 1413-1415 + desc + IG link + other-reels chip strip + "Open in full player →" `ms-play` handoff).
   - Rail = 2px `C.border` line + `C.mint` scroll-fill overlay (rAF-throttled scroll ref → CSS height), reduced-motion-gated.
4. **Insert** `<CareerTimeline />` as a NEW `<section id="timeline">` **immediately after the `#work` section closes (after line 1821), before `<PlaylistShelf />` (line 1824).** Same section padding rhythm `60px clamp(24px,5vw,80px)`. WorkPlayer, Marquee, PlaylistShelf all stay exactly as-is (additive, per locked scope).
5. **Mobile CSS:** append `@media (max-width: 900px)` rules to the existing style block (rail `left:20px`, year `clamp(40-56px)` sticky `top:60px`, cards full-width, cover ~72px, chip strip `overflow-x:auto`), following the `.sp-side`/`.marquee-scroll` naming convention. Add a `@media (hover: none)` block making the ▶ badge + play hint always-visible.
6. **Verify:** desktop + `preview_resize mobile` — confirm (a) zero horizontal body scroll, (b) exactly one `<video>` mounts on tap, (c) sticky year hands off cleanly, (d) tap target ≥44px, (e) mint/gold/red render as tokens not literals, (f) no jazz/Off-The-Clock node present. Run the mobile-design + design-judge pass before any push. Do NOT push (Miles pushes).

**Reuse map (all exist in Portfolio.jsx):** `eventStats` (285), `LIBRARY_OF` (256), `fmtWindow`/`ev.window` (276/292), `reelDate` (267), `srcOf`/`thumbOf` (48-49), `fmtPlays`/`playsNum` (50-51), `REEL_DESCS` (496) + role-desc chain (1388), inline-video expand (1409-1423), `ms-play` handoff (1097/1262), `FadeIn` (41), `_finePointer`/`_isPhone` (321-322), `C`/`F` (3-8). New: 1 component, 5 derived consts, 2 palette tokens, a handful of media-query rules. No change to WorkPlayer, no second persistent `<video>`, no new global event.
