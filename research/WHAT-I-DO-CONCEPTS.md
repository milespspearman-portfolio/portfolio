# What I Do — 3 Redesign Concepts

**Brief:** Miles's verdict on the current section: "still weak" next to the new opening (full-viewport wall of playing videos) and the Spotify-style Work section. Both of those neighbors are *loud* and *alive* — 16 autoplaying muted videos in a collage, then a real media-player skeuomorph with transport bar. The current What I Do section is 4 static glass cards: a still frame, a title, two lines of body copy, a text link. Next to moving video walls, a static card reads flat by comparison — that's the whole problem to solve.

**Locked inputs (verbatim, not touched by any concept below):**
- Card copy — titles, bodies, link labels — all 4 cards, character-for-character from `capabilities` array in `src/Portfolio.jsx` (lines 246–267).
- 4 source images at `public/cards/*.jpg` (`on-camera-hosting.jpg`, `video-production.jpg`, `content-strategy.jpg`, `directing-coaching.jpg`) + their `imgPos` crop offsets.
- Palette: bg `#0A0A0A` · mint `#0FE07C` · pink `#FF6B9D` · gold `#FFD447`. Font: Outfit.
- Architecture: single-file inline-style React (`Portfolio.jsx`), no new libraries. Section id stays `services` (nav anchors to it).

**What already exists in the codebase that any concept can lean on:** the `HeroCard` component (lines 295–327) already proves out a muted-autoplay `<video>` card with poster fallback, hover-lift, and glow-ring border — that exact plumbing is reusable for hover-to-video upgrades. The `ms-play` custom window event already exists to deep-link a click into the Spotify Work player's Now Playing pane (`window.dispatchEvent(new CustomEvent("ms-play", { detail: { e, r } }))`) — any concept could fire this instead of (or alongside) opening the Instagram link directly, which would make What I Do feel like an entry point into Selected Work rather than a dead end to IG.

Per-card mp4s are confirmed local (e.g. production card ↔ `/reels/2025/MAX-London-2025/MAX-London-Event-Recap_4.26.25.mp4`), so "hover = video" is a real option, not a hope.

---

## Concept A — "Come Alive" (minimal upgrade)

**Pitch:** Keep the exact card grid Miles already has — same 4 tiles, same order, same copy placement — and fix the one thing that makes it look dead next to the video wall: the image doesn't move. On hover (desktop) or on-scroll-into-view (mobile, staggered), the still frame cross-fades into the same muted looping mp4 already sitting in `public/reels/`, exactly the way `HeroCard` already does it above the fold. Everything else — glass card, border glow, link label — stays. This is the "make it not embarrassing" fix, not a redesign; it borrows the opening wall's language (video moves) without asking Miles to rethink the section's shape.

**Layout sketch (unchanged from current):**
```
┌────────────────────┐  ┌────────────────────┐
│ ▓▓▓▓ still→video ▓▓ │  │ ▓▓▓▓ still→video ▓▓ │
│ [img 150px, cover]  │  │ [img 150px, cover]  │
├────────────────────┤  ├────────────────────┤
│ On-Camera Hosting & │  │ Video Production    │
│ Presenting          │  │                     │
│ Event activations,  │  │ Shoot, edit, and    │
│ brand segments...   │  │ publish — mobile... │
│ Watch: Summit Hot   │  │ Watch: Premiere Pro │
│ Takes →             │  │ Demo →              │
└────────────────────┘  └────────────────────┘
┌────────────────────┐  ┌────────────────────┐
│  (Content Strategy) │  │ (Directing/Coaching)│
└────────────────────┘  └────────────────────┘
grid: repeat(auto-fill, minmax(280px,1fr)), gap 20 — same as today
```

**Interaction spec:**
- Desktop: `onMouseEnter` swaps a `poster`-only `<img>` for a `<video muted loop playsInline autoPlay preload="metadata">` (same tag shape as `HeroCard`), 300ms cross-fade via opacity, not a hard cut. `onMouseLeave` pauses and fades back to the still frame (saves CPU when 4 cards aren't in focus).
- Mobile (no hover): use the existing `useInView` hook — video autoplays muted once the card crosses ~40% into viewport, pauses when it scrolls out. Same battery-conscious IntersectionObserver pattern `OpeningWall` already uses for its 16-video collage.
- Card lift + mint border-glow on hover stay exactly as-is (lines 842–843) — layer on top of, don't replace.
- Link label and click-through behavior unchanged (still opens IG in new tab) — OR optionally fire `ms-play` first so the video keeps playing in the Work section player instead of leaving the site (nice-to-have, not required for this concept).

**Why it beats the current cards:** The single biggest gap Miles is reacting to is "video wall above it, static grid here" — this closes exactly that gap with the least risk. It reuses proven code (literally the same video-tag recipe as `HeroCard`), so there's no new interaction to invent or user-test. It's the safest bet to ship this week.

**Implementation cost:** S. New: a stateful hover/inView swap per card (~15–20 lines), reusing `srcOf`/`thumbOf`-style helpers already in the file (cards would need a `mp4` field added alongside `img` — a small, additive data change, zero copy rewrites). No new component needed; extend the existing `.map()` block in place.

**Perf risk:** Low-medium. 4 more muted looping videos if all are hovered/in-view simultaneously (worst case on a tall viewport where 2 rows are visible) — same order of magnitude as the 4-per-row hero strip already shipping. Mitigate with `preload="metadata"` (already the convention in this file) and pausing off-screen videos via the same IntersectionObserver idiom already proven in `OpeningWall`.

---

## Concept B — "Editorial Split" (big media + text rail)

**Pitch:** Break the 2×2 grid of equal tiles and give the section an editorial magazine rhythm instead: one large, tall media panel on one side (alternating left/right per row, like a Sunday-edition feature spread) and a text rail beside it carrying the title, body, and link — set apart with more whitespace and a bigger title than the cramped current card allows. This treats the 4 capabilities as 4 short "stories" rather than 4 icons in a row, which reads as more considered and less templated — a deliberate contrast to the dense, uniform Spotify grid coming right after it, so the two sections don't visually blur together.

**Layout sketch:**
```
Row 1 (media left):
┌───────────────────────┐   On-Camera Hosting & Presenting
│                        │   ───────────────────────────
│    ▓▓▓ video/img ▓▓▓   │   Event activations, brand segments,
│      (tall, ~4:5)      │   interviews, and live hosting —
│                        │   comfortable on camera and on a stage.
└───────────────────────┘
                              Watch: Summit Hot Takes →

Row 2 (media right — alternates):
   Video Production           ┌───────────────────────┐
   ───────────────────        │                        │
   Shoot, edit, and           │    ▓▓▓ video/img ▓▓▓   │
   publish — mobile and       │      (tall, ~4:5)      │
   DSLR, same-day...          │                        │
                              └───────────────────────┘
   Watch: Premiere Pro Demo →

Row 3 (media left) — Content Strategy ...
Row 4 (media right) — Directing & On-Camera Coaching ...

Each row: 2-col grid (media ~55% / text ~45%), full-bleed-ish media,
generous vertical gap between rows (~72–96px) instead of a tight grid gutter.
```

**Interaction spec:**
- Media panel is the same still→muted-video swap as Concept A on hover/in-view (reuse, don't reinvent) — but bigger, so the motion actually reads as a moment rather than a small icon twitching.
- Scroll-linked reveal: media panel fades/slides in from its side (left row slides from left, right row slides from right) using the existing `FadeIn` component's direction logic extended with a horizontal variant — currently `FadeIn` only does vertical `translateY`; this concept needs a small `direction` prop added (`"up" | "left" | "right"`).
- Title sizes up notably vs. today's `fontSize: 16` — editorial-scale text (`clamp(22px, 3vw, 32px)`) makes it read as a mini-headline, not a card label.
- On mobile, rows stack: media on top, text below, same order for every row (no left/right alternation — alternation only works with 2-col width).
- Link label keeps current click-through behavior; could gain a small arrow-nudge-on-hover micro-interaction (4px translateX) for polish, consistent with the ↗ / → treatment already used elsewhere in the file (Instagram link, resume download).

**Why it beats the current cards:** Right now all 4 capabilities are visually equal-weight and slightly cramped (150px image, 13px body copy squeezed under a 16px title) — this concept gives each one room to breathe and reads as curated rather than filled-in-a-template. The alternating layout also creates a distinct visual rhythm from both neighbors: the hero wall is a chaotic collage, the Work section is a dense uniform grid — this is neither, which helps it not get visually absorbed by whichever section is nearest.

**Implementation cost:** M. Requires: a new row-based layout block (replacing the `grid-template-columns: auto-fill` block), a `direction` extension to `FadeIn` (small, additive — doesn't touch its existing vertical callers), and larger media assets/crop decisions since a 4:5 or 3:4 tall panel will crop the existing 150px-tall source images differently than today's wide `imgPos` crops were tuned for (`on-camera-hosting.jpg` etc. currently use `imgPos: "50% 27%"` for a short landscape-ish strip — a tall panel will need those revisited, image by image, ideally by Miles or with his approval since they were hand-tuned).

**Perf risk:** Low. Same number of media elements as today (4), just larger on screen — no additional videos beyond what Concept A already proposes if video is layered in. Larger images do mean slightly heavier initial paint if not lazy-loaded, but `loading="lazy"` is already the convention here.

---

## Concept C — "The Set List" (braver — rhymes with the Spotify skeuomorph)

**Pitch:** Instead of cards, treat "What I Do" as a **track list** — the four capabilities become numbered rows in a mini "artist page" section that visually rhymes with the Work section directly below it (same numbered-row DNA: index number, thumb, title + one-line sub, a right-aligned action). This reframes the section from "4 services in boxes" to "here's my set list" — literally an extension of the Spotify metaphor Miles already committed to, applied one section earlier, so a first-time visitor gets primed for the skeuomorph before they hit the real player. Each row expands on click/tap into a larger "Now Playing"-style preview panel with the muted video and full body copy — collapsing any previously expanded row, accordion-style — rather than 4 things permanently open at once.

**Layout sketch:**
```
  WHAT I DO                                    (section title, same as today)
  ┌─────────────────────────────────────────────────────────┐
  │ 01  [▓▓]  On-Camera Hosting & Presenting            ▶    │  ← row, collapsed
  ├─────────────────────────────────────────────────────────┤
  │ 02  [▓▓]  Video Production                          ▶    │
  ├─────────────────────────────────────────────────────────┤   ← row 02 EXPANDED:
  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
  │ ▓▓▓▓▓▓▓▓  muted video, playing, 16:9-ish  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
  │ Shoot, edit, and publish — mobile and DSLR, same-day     │
  │ turnaround, from product demos to executive interviews.  │
  │                                    Watch: Premiere Pro → │
  ├─────────────────────────────────────────────────────────┤
  │ 03  [▓▓]  Content Strategy                          ▶    │  ← collapses back
  ├─────────────────────────────────────────────────────────┤
  │ 04  [▓▓]  Directing & On-Camera Coaching            ▶    │
  └─────────────────────────────────────────────────────────┘
  (single column, full-width rows — no grid at all; this is a LIST not a grid)
```

**Interaction spec:**
- Collapsed row = index number (`01`–`04`, monospace-tabular like the existing library track-list convention), small thumb (44px, same `Thumb` component pattern already used in the Work player), title, and a chevron/play-glyph on the right. Row height ~64px — deliberately dense, list-like, not card-like.
- Click/tap a row → it expands in place (height auto-animate, ~350ms ease) to reveal: the video (autoplays muted the moment it opens, pauses/rewinds on collapse), the full body copy, and the link label — any other currently-expanded row collapses first (accordion, one open at a time, mirroring how the Work section's Now Playing pane holds exactly one active track).
- Hover on a collapsed row (desktop): subtle bg lightening (`rgba(255,255,255,0.03)` → `0.06`, same increment the Work section's row-hover already uses) plus the thumb crossfades to a video loop preview — small taste before commit, same idea as Concept A but scaled down to thumb size.
- Row numbers and the accordion mechanic are new UI, but the visual materials (thumb sizing, hover-dim, mint accent on active state, EqBars-style "now playing" indicator) all already exist verbatim in `WorkPlayer`/`Thumb`/`EqBars` — this concept's ask is "reuse those components in a new context," not invent new visual language.
- Mobile: same accordion, full width, no layout change needed (list is already single-column-friendly).
- Optional flourish: give the expanded panel's video a tiny animated equalizer icon (reusing `EqBars`) next to the row number while it's playing, exactly mirroring the "currently playing" signal already used in the Work library — this is the detail that makes it *feel* like the same instrument as the section below rather than a lookalike.

**Why it beats the current cards:** This is the concept that actually answers "why does What I Do feel weak next to the Spotify section" at the root — not by making the cards busier, but by making What I Do and Selected Work feel like two views of *the same system* (a numbered list that expands to play video), the way an artist's "Popular" track list and their full discography feel related on a real streaming service. It also solves a real content problem for free: today's cards show the still frame and text always-on, competing for eye space in a small box; the accordion means only one capability is "loud" at a time, and the collapsed state is dense enough that a scanning visitor sees all 4 titles instantly without scrolling past big boxes.

**Implementation cost:** L. This is a new component, not a modification of the existing grid: an accordion-row component (open/expand state management, height-transition CSS or a measured-height animate, one-open-at-a-time coordination), reusing `Thumb`, `EqBars`, and the video-swap logic from Concept A. Also needs `mp4` fields added to the `capabilities` data (same additive change as A/B) and per-card crop decisions for the expanded video panel. This is the most code and the most new interaction surface of the three, though every individual piece it's built from already has a working precedent elsewhere in this same file — it's assembly of proven parts, not invention from zero, which caps the risk even at L.

**Perf risk:** Low-medium. Only one video plays at a time (accordion is exclusive), which is actually *lighter* than Concept A or B's "up to 4 simultaneously in view" worst case — the tradeoff is JS-driven height animation (measuring scrollHeight or using a grid-rows trick) which needs care to stay smooth on lower-end phones; a CSS `grid-template-rows: 0fr → 1fr` transition (no JS measurement) is the safer implementation route and should be specified up front rather than discovered mid-build.

---

## Recommendation

**Concept A.** Miles's stated problem is narrow and specific — the section looks flat *next to* two sections that move — and Concept A is the direct, low-risk fix for exactly that, using code that already exists and already works (`HeroCard`'s video-swap recipe, copy-pasted and scaled down). Concepts B and C are both legitimately stronger *destinations* — B reads more premium, C is the most thematically coherent with the Spotify bet — but both are bigger swings on a section where the copy is locked and the actual complaint is narrowly about static-vs-alive, not about layout or information architecture. Ship A first; if Miles still feels an "energy gap" between sections after seeing video-on-hover live, escalate to C, since it's the concept that would make the biggest structural difference and it fits Miles's evident appetite for skeuomorphic risk-taking (he's the one who pushed the Spotify metaphor and the killed-then-revived mint token in the first place — Round 3 of the Work-section decision log shows he keeps pulling toward "make it feel real," not "make it safe").

## One question for Miles

Do you want What I Do to stay a self-contained dead-end to Instagram (as it is today), or should clicking a capability instead jump into the Work section's player and start playing that reel there — using the `ms-play` event that already exists in the code for exactly this kind of deep link?
