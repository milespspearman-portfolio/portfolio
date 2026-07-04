# Visual build queue — pending, blocked on the Opus description writer (same file)

Build these in src/Portfolio.jsx AFTER the Opus writer commits its descriptions (both edit Portfolio.jsx; no parallel edits). Then run R1 copy → R2 design-judge → R3 mobile-design, apply fixes, push, handoff.

## 1. Full-84 video wall (opening) — Miles: "fill this front part with all the reels, show volume"
- Opening wall / hero area carries ALL 84 reels (not 16), as stacked infinite marquee rows behind the "Creative. Producer. Musician." triad.
- PERF: don't play 84 videos. Poster frames (thumbOf) for most tiles + a couple of rows running live muted video. Motion = the drift; volume = the wall never repeating for minutes. Reuse the seamless -50% loop mechanics already in HeroMarqueeRow.
- Scales as library grows toward 100+.

## 2. About swipe-clips + headshot (Miles's exact placement Jul 4)
- Location: INSIDE the grey About card, TOP-RIGHT, aligned with the "About the {swipe-word}." heading (word left, clip right, same row). Stats/bio/resume flow below, unchanged.
- The 9:16 clip tile swaps IN SYNC with the swipe word (SWIPE_WORDS = Creative/Producer/Host/Director/Teammate). Map (all reels live on site):
  - Creative → '25 MAX London: Recap (the spit take is in this reel)
  - Producer → San Jose Semaphore
  - Host → '24 MAX: 3 Things We Didn't Expect (the T-Pain jump)
  - Director → '25 MAX: Kelley O'Hara x NWSL x Adobe
  - Teammate → '24 MAX: Adobe x Gatorade Activation
- HEADSHOT = the resting frame / poster of the tile (shows before + between clips). File: `~/Downloads/ADOBE SOCIAL HEADSHOTS-093 2.jpg` → copy to public/ (e.g. public/headshot.jpg). Miles: placement flexible, resting-frame is fine.
- Muted loop, no link needed, viewport-paused. Mobile: tile stacks full-width under the heading.

## 3. Touch-swipe on ALL marquee rows (Miles's mobile ask + spec rule 14)
- The CSS-animation marquees have no touch-drag and hover-pause is a no-op on touch. Add: on touchstart pause the auto-drift + enable native momentum scroll (overflow-x:auto), resume drift on touchend. Applies to hero rows, fun row, and the new full-84 wall rows.
- mobile-design agent (R3) verifies + specs anything missed; reference research/MOBILE-BEST-PRACTICES.md (Opus research, incoming).

## Review gate (all Opus)
R1 copy-editor (new descriptions + any copy) → R2 design-judge (composition, About tile, wall, vs Navin) → R3 mobile-design (375px + touch, armed with MOBILE-BEST-PRACTICES.md). Apply, verify lookups + build, push, then chat-handoff doc.

## 4. Scroll-dissolve opening (Miles Jul 4)
As the user scrolls the opening wall: the "Creative. Producer. Musician." triad EVAPORATES (opacity 1→0 over ~1 viewport of scroll), and around the midpoint (passing "Producer") the wall's dim veil LIFTS (currently ~0.55 → ~0.12) so the reels brighten to full and become clearly tappable. Reels don't move — only text fades + veil lifts. Scroll-linked, transform/opacity only, rAF-throttled (no layout thrash). `prefers-reduced-motion` → skip the scrub, reels just show. mobile-design (R3) verifies scroll perf on phone (scroll-linked effects are the #1 jank source — reference MOBILE-BEST-PRACTICES.md). design-judge (R2) tunes the exact veil floor + fade curve.
