# Mobile Best Practices — Miles Spearman's Portfolio Site

**Created:** Jul 4, 2026
**For:** `~/Downloads/Claude/portfolio-site` (`src/Portfolio.jsx`, single-file React/Vite, Spotify skeuomorph, video-heavy SPA)
**Why this doc exists:** Recruiters open the link on phones; Miles browses and shares on his phone. This is the reference for making the site a *mobile creative portfolio*, not a desktop site that shrinks. Every finding = the practice → why it matters → a concrete recommendation mapped to a named part of the site, with sources.
**Scope note:** This is a research + spec doc. It does **not** edit `Portfolio.jsx`. It is the input a builder agent (or Miles) works from.

Named parts of the site referenced throughout:
- **Opening Wall** — `OpeningWall` / `HeroCard`: full-viewport video collage behind the "Creative. Producer. Musician." headline, ~16 autoplaying muted looping videos, cursor parallax.
- **Marquee rows** — `HeroRow` / `HeroMarqueeRow`: the two infinite CSS-animation rows of reel cards (top row + "fun row"), plus the text `Marquee` ("Adobe MAX ✦ …").
- **Player** — `WorkPlayer`: the Spotify library (sidebar playlists → album track list → single `<video>` "Now Playing" pane).
- **Player bar** — `PlayerBar`: the transport row (prev/play/next, seek, mute, Open on Instagram).
- **Playlist Shelf** — `PlaylistShelf` / `ShelfRow` / `ShelfCard`: three horizontal `scroll-snap` cover-card rows with ‹ › arrow buttons.
- **What I Do cards** — `WhatIDoCards`: 4 glass cards that open the **Drawer** (`SpecialtyDrawer`) — side panel on desktop, bottom sheet under 900px.
- **Nav** — `Nav`: fixed top bar, inline links (About / What I Do / Work) + "Connect ▾" dropdown.

---

## TL;DR — Ranked top 10 (highest impact first)

| # | Fix | Site part | Severity |
|---|-----|-----------|----------|
| 1 | Ship real posters + gate/kill mass autoplay; don't run 8–16 live videos at once on a phone | Opening Wall, Marquee rows | 🔴 Critical |
| 2 | 855 MB of plain MP4s is the mobile-data bomb — compress + serve HLS/adaptive, poster-first, `preload="none"` off-screen | all video, Player | 🔴 Critical |
| 3 | Marquee rows have **no touch drag** and `:hover`-pause is a **no-op on touch** — cards drift under the finger, un-stoppable | Marquee rows | 🔴 Critical |
| 4 | Player bar isn't sticky on mobile + no safe-area inset — the transport a phone user expects "pinned to the thumb" scrolls away and can hide behind the home bar | Player bar | 🔴 Critical |
| 5 | Tap targets under 44px: nav links (13px text), ‹ › arrows (34px), row ↗ links, mute/seek | Nav, Playlist Shelf, Player | 🟠 High |
| 6 | Bottom sheet: add real swipe-down-to-dismiss + honor `env(safe-area-inset-bottom)`; grabber is currently decorative | Drawer | 🟠 High |
| 7 | `100svh` opening + `overflow-x:hidden` is right, but audit every `100vh`/fixed height for the mobile URL-bar and the notch | Opening Wall, root | 🟠 High |
| 8 | Mobile Player sidebar is a horizontal scroller with **no scroll-snap** and thin scrollbar hidden — plus nested horizontal scrollers fight the page's vertical scroll | Player (mobile) | 🟠 High |
| 9 | Honor `prefers-reduced-motion` for the marquees, swipe words, and count-up — parallax already does, the CSS animations don't | Marquee rows, About | 🟡 Medium |
| 10 | Nav: inline 4-item row + dropdown is cramped at 375px; move to a thumb-reachable pattern and make "Connect" tap-safe | Nav | 🟡 Medium |

**Source count: 24 distinct sources** (web.dev/Google, NN/G, Apple HIG, Material Design, Mux, Cloudinary, WCAG/W3C, Smashing, Nolan Lawson, and others — full list at the bottom, cited inline by number).

---

## The findings

### 1. Do not run 8–16 live autoplaying videos at once on a phone. Poster-first, play few. 🔴

**Practice.** Muted autoplay is the correct pattern for looping background video (`autoplay muted loop playsinline` together) [1][7][12], but *how many* play simultaneously is a performance and battery decision. The Opening Wall mounts ~16 `<video>` elements and the two Marquee rows duplicate their card sets (each reel rendered twice for the seamless loop), so a phone can be decoding well over a dozen H.264 streams at once. On iOS, **Low Power Mode blocks autoplay entirely** and Android **Data Saver** blocks it too [9][13] — so on exactly the devices most likely to be conserving battery, the Wall degrades to black/poster frames anyway. Meanwhile each live video is real CPU/GPU/thermal load [9].

**Why it matters.** This is the first screen a recruiter sees on a phone. Sixteen decoders spinning up tanks LCP and INP (the page "loads but reacts slowly to taps" is the classic INP failure [10][16]), heats the device, and drains battery — and if Low Power Mode is on, it doesn't even play. A creative producer's site stuttering on the hero is a credibility hit [22].

**Recommendation.**
- **Opening Wall:** on touch/small screens, render **posters** (the ffmpeg thumbs already exist, 2.9 MB total for all 85) and autoplay **at most 2–4** videos — or none, letting the poster collage carry it and playing a single hero clip. The existing `usePlayWhenVisible` only gates *on-screen vs off* — it does not cap *concurrent* count; add a mobile cap. Note the current build already hides wall cards 9+ under 900px (`.wall-card:nth-child(n+9){display:none}`) — good instinct, but the visible 8 still all autoplay.
- **Marquee rows:** these should be poster tiles that play on tap, not live video (see #3). If any stay live, cap to the 2–3 actually in view.
- Add a `prefers-reduced-motion` and Low-Power fallback that shows posters and a play affordance instead of dead black frames [13][14].
- Keep `preload="metadata"` only for the few that autoplay; everything else `preload="none"` [1][12].

Sources: [1] Mux, [7] Cloudinary, [9] iOS Low Power autoplay, [10] web.dev Vitals, [12] robsimpson autoplay, [13] prefers-reduced-motion, [14] WHATWG issue, [16] Core Web Vitals 2025/26, [22] Creative Bloq.

---

### 2. 855 MB of plain MP4s is the biggest mobile-data liability on the site. 🔴

**Practice.** For web video in 2025, serve **adaptive bitrate (HLS/DASH)** with a rendition ladder rather than single full-size MP4 files; poster-first for instant visual feedback; `preload="none"` for anything off-screen; respect Data Saver [1][12][17]. Short vertical clips should be compressed hard (a 9:16 social clip does not need to be 20–80 MB).

**Why it matters.** `public/reels` is **855 MB across 85 files** — largest single file **80 MB** (Behind-the-Vision), with several **20–52 MB** (Eric 52, Russell 37, UC 28, Amanda 27). These are served as **static MP4s straight from `/public`** (per the build's own CLAUDE.md). On a phone on cellular, the Player loads a full multi-megabyte MP4 per tapped reel with no adaptive downshift; on a slow/metered connection this is slow-to-first-frame and burns a recruiter's data. The thumbs, by contrast, are tiny (2.9 MB for all 85) — proof the poster path is cheap and should carry more of the weight.

**Recommendation.**
- **Compress the library.** Re-encode the short reels to a sane web bitrate (most 9:16 clips land well under 5–8 MB at 720p). The 80/52/37 MB outliers especially. This alone is the single biggest mobile win.
- **Adaptive delivery:** the site is on Vercel — move heavy video to an HLS/streaming host (Mux, Cloudflare Stream, Bunny) or at minimum generate a 480p + 720p pair and pick by connection. Vercel static MP4 has no bitrate switching [17].
- **Player:** keep the single-`<video>` model (already good), but `preload="none"` until a track is chosen, and always show the poster first (already wired via `poster={thumbOf(cur)}`).
- Gate on the **Save-Data** request header / `navigator.connection.saveData` where available: on data-saver, don't preload video, lean on posters [9][13].

Sources: [1] Mux, [9] data-saver autoplay, [12] robsimpson, [13] prefers-reduced-motion, [16] Core Web Vitals, [17] Mux playback guide.

---

### 3. The Marquee rows can't be dragged and hover-pause does nothing on touch. 🔴

**Practice.** Horizontal carousels on touch should be **native scroll containers** (`overflow-x:auto` + `scroll-snap-type`), which give momentum, drag physics, keyboard access, and hardware-accelerated performance *for free* — the browser does the heavy lifting, no `touchmove`/`requestAnimationFrame` needed [18][19][21]. Animating position with a CSS `transform` translate (a "slider") throws all of that away [19].

**Why it matters — this is a concrete bug in the current build.** `HeroMarqueeRow` moves via `@keyframes heroloop { to { transform: translateX(-50%) } }` on `.hero-marquee`, paused by `.hero-marquee:hover { animation-play-state: paused }`. On a phone:
- **There is no hover** — so the row **never pauses**. A finger cannot stop it.
- **There is no scroll/drag** — it's a transform animation, not a scroll container, so you can't swipe through the cards. They just drift left continuously.
- Trying to **tap a card** that's sliding under your finger is a moving target — bad for the very interaction (open a reel) the cards exist for.

So the marquee rows are a desktop hover-toy that becomes an un-interactive conveyor belt on mobile. This is the textbook "CSS-animation marquee = no touch drag, hover-pause is a no-op" failure.

**Recommendation.**
- On touch/small screens, **convert the marquee rows to a real scroll-snap carousel**: `overflow-x:auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;` with `scroll-snap-align:start` on each `HeroCard`, and **drop the auto-scroll animation entirely** (or make it a gentle auto-advance that *yields to touch* — but native swipe is what top sites ship [18][19]). Users swipe, it snaps, momentum feels native, tapping a still card is easy.
- Reuse the pattern already correct elsewhere in the file: `PlaylistShelf`'s `.shelf-row` **already** does `overflow-x:auto; scroll-snap-type:x mandatory` — the marquee rows should adopt that same approach instead of the transform loop.
- If Miles wants the "drifting" look on desktop, keep it behind `(hover:hover)` and give touch the scroll-snap version.
- Add `overscroll-behavior-x: contain` so horizontal swipes don't trigger browser back-nav or rubber-band the page [18].

Sources: [18] scroll-snap 2026 guide / DEV, [19] Nolan Lawson native carousel, [21] Embla (why draggable libs exist).

---

### 4. The Player transport bar isn't a mobile sticky bar — and ignores the home-bar safe area. 🔴

**Practice.** A persistent media transport is a "sticky bar" pattern: on mobile it should stay reachable (pinned), sit in the **thumb zone** (bottom third), not cover content, and respect `env(safe-area-inset-bottom)` so it isn't hidden behind the iPhone home indicator [2 (thumb reach), NN/G sticky-header value, safe-area guidance in 3/24]. Sticky/persistent bars measurably speed navigation (~22% faster in NN/G testing).

**Why it matters.** `PlayerBar` renders as the bottom row **inside** the `.sp-shell` card — it is **not** `position:sticky/fixed`. On mobile the whole player is a tall stacked block (video on top, sidebar chips, track list, then the bar), so the transport **scrolls off** with the card. A phone user reading Spotify semantics expects the transport glued to the bottom of the screen ("controls are always under my thumb"); here they have to scroll back to it. And because nothing uses `env(safe-area-inset-bottom)`, a fixed bar would tuck under the home indicator on notched iPhones. On mobile the bar also collapses to 2 columns and **hides the "Open on Instagram" link** (`.sp-ig-link { display:none }`) — losing the single most useful CTA (go watch it natively) on the platform where that matters most.

**Recommendation.**
- On mobile, make the transport a **`position: fixed; bottom: 0`** bar (only while a track is playing / the Player is in view) with `padding-bottom: env(safe-area-inset-bottom)` and `padding-bottom: max(10px, env(safe-area-inset-bottom))` so it clears the home bar [3][24].
- Ensure page content below the Player has bottom padding equal to the bar height so the bar never **covers** the last track / footer.
- Keep the primary buttons (play, next, mute) in the **thumb-reachable** center-bottom; that's exactly where the thumb zone research says primary actions belong [2][20].
- **Don't hide "Open on Instagram" on mobile** — shrink it to an IG glyph button instead. Native IG is where a phone viewer wants to land.

Sources: [2] Smashing tap sizes/reach, [3] viewport+safe-area, [20] thumb-zone UX, [24] NN/G bottom sheet (safe-area + reach), plus NN/G sticky-header value cited in [15].

---

### 5. Several tap targets are below the 44px floor. 🟠

**Practice.** WCAG 2.2 SC 2.5.8 requires ≥ **24×24 CSS px** (AA), but the platform floors are higher and are what users actually expect: **Apple iOS 44×44 pt, Android 48×48 dp, Microsoft 44×44** [4 (W3C), 5 (WCAG guides), 8 (Smashing)]. Sub-44px targets have ~3× the tap-error rate; at the *bottom* of the screen you want ~46px, top ~42px [8]. Text links inside sentences are exempt [5][8].

**Why it matters.** Small controls = rage taps and mis-taps, which read as "this doesn't work on my phone."
- **Nav links** are 13px text with no padded hit-area — thin horizontal targets.
- **Playlist Shelf arrows** (`ShelfRow`) are **34×34px** — under 44.
- **Player**: mute button (`padding:4`), seek bar is **4px tall**, the per-row **↗ IG link** is a tiny glyph, prev/next are `padding:4` around a ~14px icon.
- **TrackRow ↗** relies on `opacity:0 → 1 on hover` — on touch there's no hover, so the reveal-on-hover affordance is invisible/unreliable.

**Recommendation.**
- Bump every interactive control to a **min 44×44px hit area** on touch (pad the element even if the glyph stays small): nav links, Shelf ‹ › arrows (→ 44px), mute, prev/next, the IG ↗.
- **Seek bar:** keep the 4px *visual* track but give it a ~24–44px tall transparent hit area (padded wrapper) so a thumb can grab it. Consider a bigger draggable knob on touch.
- **Kill hover-only reveals on touch:** the TrackRow ↗ link and the play-glyph-on-hover should be always-visible (or tap-toggled) on touch devices, since `:hover` never fires [18][20].
- In-sentence links (About paragraph, footer) are exempt from the size rule — leave them, just keep them visually distinct [5][8].

Sources: [4] W3C SC 2.5.5, [5] WCAG 2.5.8 guides, [8] Smashing tap-target cheatsheet, [18] scroll-snap/touch, [20] thumb-zone.

---

### 6. Make the bottom sheet actually swipe-to-dismiss and respect the safe area. 🟠

**Practice.** A mobile bottom sheet should offer **multiple dismiss paths** — a visible **Close (×)**, a **backdrop tap**, and **swipe-down** — because swipe-only is "easy to ignore" and creates "swipe ambiguity" (may fire the OS notification drawer/control center instead) [24 NN/G][6 LogRocket]. It should size in **`svh`/`dvh`** not `vh`, cap height so the backdrop stays tappable, lock body scroll, and pad the bottom with `env(safe-area-inset-bottom)` [3][6][24].

**Why it matters — partly right, partly missing.** `SpecialtyDrawer` under 900px already does a lot correctly: it becomes a bottom sheet (`sheetIn` animation), uses `max-height: 86svh` (correct unit choice), locks `document.body.style.overflow='hidden'` (scroll-lock ✓), dims a backdrop that **taps to close** (`onClick={close}` on the overlay ✓), has a Close **×** button ✓, and Escape-to-close ✓. What's missing for a phone:
- The **grabber** (`.spec-grabber`) is shown but **purely decorative** — there's no swipe-down gesture wired to it. Users on iOS expect to drag the handle down to dismiss; here it does nothing.
- **No `env(safe-area-inset-bottom)`** padding — the last row / "Up next" buttons can sit under the home indicator on notched iPhones.
- The sheet holds a **lot** of content (proof lists, expanding video rows, prev/next) — NN/G warns sheets are for *transient* tasks, not long reading [24]. It's borderline; if it grows, consider a full page on mobile instead.

**Recommendation.**
- Wire **swipe-down-to-dismiss** on the grabber/sheet (touch drag past a threshold → `close()`), so all three dismiss paths exist [6][24].
- Add `padding-bottom: max(24px, env(safe-area-inset-bottom))` to the sheet so bottom content and the prev/next buttons clear the home bar [3][24].
- Consider `max-height: 90dvh` if you want the sheet to track the live viewport as the URL bar moves; `svh` (current) is the safe stable choice — either is fine, just not plain `vh` [3].
- Keep the × button (already there) — it's the accessibility-critical path for screen readers who won't discover swipe [24].

Sources: [3] viewport/safe-area, [6] LogRocket bottom sheets, [24] NN/G bottom sheet guidelines.

---

### 7. Audit every full-height / fixed element for the mobile URL bar and the notch. 🟠

**Practice.** `100vh` on mobile "lies" — it's the *largest* viewport (URL bar hidden), so `100vh` sections overflow when the bar is showing. Use **`svh`** for stable full-height, **`dvh`** when you *want* it to track the collapsing URL bar, and combine with `env(safe-area-inset-*)` on edge-to-edge screens [3]. Supported in Safari 15.4+/Chrome 108+ (~90%+) [3].

**Why it matters.** `OpeningWall` already uses **`min-height: 100svh`** — correct, good. But the outer app wrapper uses `min-height: 100vh` (line ~1541), and the film-grain overlay and Nav use full-viewport `100%` fixed positioning. Mixing `100vh` and `100svh` can cause the first-paint hero to be a hair off and the grain layer to under/overshoot as the URL bar animates. None of the fixed elements account for the notch.

**Recommendation.**
- Standardize full-height on **`svh`** (or `dvh` where the collapse should be tracked) across the wrapper and any `100vh`. Keep the Opening Wall's `100svh`.
- Nav is `position:fixed; top:0` — add `padding-top: env(safe-area-inset-top)` so the bar clears the Dynamic Island / notch in landscape and on notched devices [3].
- Verify `body { overflow-x: hidden }` (already set ✓) actually holds once the marquee rows become scroll containers (#3) — nested horizontal scrollers must not create a page-level horizontal scroll.

Sources: [3] svh/dvh/lvh + safe-area guide.

---

### 8. The mobile Player is a stack of nested horizontal scrollers with no snap. 🟠

**Practice.** Nested scroll regions on touch are fragile: an inner horizontal scroller inside a vertically-scrolling page needs `scroll-snap` for control and `overscroll-behavior` so gestures don't leak; and stacking several scrollers vertically makes the page hard to read [18][19]. Prefer few, snap-aligned, clearly-bounded scrollers.

**Why it matters.** Under 900px the Player (`.sp-body`) reflows to: video pane (`order:-1`) → the **sidebar becomes a horizontal chip scroller** (`.sp-side-list { flex-direction:row; overflow-x:auto }`, 210px min chips) → the track list (`.sp-main { max-height:460px; overflow-y:auto }`, an **inner vertical scroller**) → the (non-sticky) bar. So a phone user has: a horizontal scroller (playlists) with **no `scroll-snap`**, immediately above a capped inner vertical scroller (tracks) inside the outer page scroll. The playlist chips don't snap, the thin scrollbar is hidden, and the inner 460px track list traps vertical scroll. It's a lot of competing gestures for the core task (pick a reel, play it).

**Recommendation.**
- Add `scroll-snap-type: x proximity` + `scroll-snap-align:start` to the mobile `.sp-side-list` chips so playlist selection snaps cleanly [18].
- Add `overscroll-behavior: contain` to both the chip scroller and the `.sp-main` track list so their gestures don't leak into page scroll [18].
- Reconsider the **capped 460px inner track list** on mobile — an inner scroll box inside page scroll is a known mobile annoyance; letting the list flow into the page (with the playlist header sticky) is usually calmer.
- This ties to #4: with a proper fixed transport bar, the mobile Player becomes "scroll the list, controls stay under thumb" — much closer to real Spotify.

Sources: [18] scroll-snap/overscroll, [19] native carousel.

---

### 9. Honor `prefers-reduced-motion` for the CSS animations, not just the parallax. 🟡

**Practice.** Respect `prefers-reduced-motion: reduce` — swap continuous motion for static states; it's an accessibility expectation (vestibular disorders) and reduces needless work [13][14]. (Note: browsers still autoplay *video* even under reduced-motion, so this is about the *decorative* animation, and you should pair it with a poster fallback [14].)

**Why it matters.** The Opening Wall's cursor **parallax already checks** `prefers-reduced-motion` and bails — good. But the always-on CSS animations do **not**: `heroloop` (marquees), `swipeIn/swipeOut` (the "Creative/Producer/Host…" `SwipeWord`), `cuebounce` (scroll cue), `eqbar`, `float`, and the `PlaysCounter` count-up all run regardless. For a motion-sensitive user on a phone, the two continuously-scrolling marquees plus the flipping word plus the bouncing cue is a lot of unrequested movement.

**Recommendation.**
- Add a global `@media (prefers-reduced-motion: reduce)` block that pauses/*disables* `heroloop`, `swipeIn/out`, `cuebounce`, `eqbar`, `float`, and freezes the count-up at its final value (show `TOTAL_PLAYS` directly).
- When you convert marquees to scroll-snap (#3), reduced-motion users simply get a static swipeable row — ideal.

Sources: [13] prefers-reduced-motion background video, [14] WHATWG autoplay+reduced-motion.

---

### 10. Rework the top nav for a 375px thumb — the inline row + dropdown is cramped and top-anchored. 🟡

**Practice.** On phones, primary nav should be discoverable and **thumb-reachable**; ~49% of users navigate one-thumbed and the reachable zone is the **bottom third** [20][23]. Options: keep a slim top bar for identity but move actions toward the thumb; hamburger is acceptable for a small site *if* it doesn't hide the key CTA (hidden menus cut task completion ~21% per NN/G) [23]; bottom-anchored actions convert best [20][23]. Top sticky headers do help navigation speed [15][23] — the issue is *reach* and *density*, not stickiness.

**Why it matters.** `Nav` is a fixed top bar with **four inline items** (identity + About + What I Do + Work) **plus** a "Connect ▾" button that opens a dropdown — all crammed on one 64px row at the top, the *hardest* place for a thumb to reach on a modern tall phone. At 375px, `gap:28` between 13px links plus a pill button will be tight and the link hit-areas are thin (#5). The "Connect" dropdown opens *upward-adjacent* content at the top of the screen (far from the thumb), and closes on any outside click.

**Recommendation.**
- **Simplest high-value fix:** since the site is one long scroll, the top nav is more decorative than load-bearing. On mobile, slim it to **identity + a single primary action** (Email/Connect) and let the page scroll be the navigation; or add a compact menu.
- If keeping section links on mobile, consider a **bottom-anchored** mini action bar or a hamburger that reveals About/What I Do/Work/Connect — but keep **Email/Connect always visible** (don't bury the recruiter CTA) [23].
- Make "Connect" a proper 44px tap target and ensure the dropdown opens **toward the thumb** / doesn't get clipped by the fixed bar on small screens.
- Add `env(safe-area-inset-top)` (see #7).

Sources: [15] Core Web Vitals/sticky context, [20] thumb-zone UX, [23] mobile nav 2025 (NN/G hidden-menu stat).

---

## What separates a GOOD mobile creative portfolio from a desktop-site-that-shrinks

Distilled from the field research [22][23] and mapped to this site:

1. **Designed *for* the thumb and the vertical scroll**, not reflowed. Big tap targets, one-thumb reach, swipe-native carousels, controls in the bottom third. → Fix the marquees (#3), the transport bar (#4), tap targets (#5). *(A creative producer's site that mis-taps on a phone reads as "doesn't get mobile" [22].)*
2. **Fast and light on cellular.** Posters carry the first paint; video is compressed and adaptive; nothing autoplays a 20 MB file on a metered connection. → #1, #2. This is the biggest gap given 855 MB of static MP4.
3. **Touch affordances that exist without hover.** Every reveal-on-hover, pause-on-hover, and cursor effect needs a touch equivalent (or graceful omission). The build is disciplined about `(hover:hover)` for the *parallax* — extend that discipline to marquees, TrackRow ↗, and card play-glyphs.
4. **Motion is a choice, not a default.** Reduced-motion honored across all decorative animation (#9), and Low-Power/Data-Saver gracefully falls back to posters (#1).
5. **The core action is one tap away and obvious.** For Miles that's "watch a reel." On mobile, native IG ("Open on Instagram") is often the best destination — so *don't hide it on mobile* (#4). Play buttons should be visible without hover.
6. **Vertical (9:16) content shown vertically.** The site already uses `aspectRatio: 9/16` for reel tiles and the Now Playing video — correct and on-brand for a Reels producer; keep it, and make sure a single tapped reel fills a comfortable share of a phone screen without the page needing to scroll to see controls.

The build's **strengths to preserve:** `usePlayWhenVisible` (on-screen gating), single-`<video>` source-of-truth, `100svh` opening, `svh` sheet height, scroll-lock + backdrop-tap + Escape on the drawer, existing ffmpeg posters, `PlaylistShelf` already using scroll-snap (the pattern to copy), and the reduced-motion check on parallax. The mobile work is mostly **extending patterns the build already got right in one place to the places that still assume a mouse.**

---

## Sources

1. Mux — *Best Practices for Video Playback: A Complete Guide (2025)* — https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025
2. Smashing Magazine — *Accessible Target Sizes Cheatsheet* — https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
3. Medium (Tharunbalaji) — *Understanding Mobile Viewport Units: svh, lvh, dvh* — https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a
4. W3C WAI — *Understanding SC 2.5.5 Target Size* — https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
5. TestParty — *WCAG 2.5.8 Target Size (Minimum) guide* — https://testparty.ai/blog/wcag-target-size-guide
6. LogRocket — *How to design bottom sheets for optimized UX* — https://blog.logrocket.com/ux-design/bottom-sheets-optimized-ux/
7. Cloudinary — *4 Do's and Don'ts When Using Video Autoplay in HTML* — https://cloudinary.com/guides/video-effects/video-autoplay-in-html
8. Smashing Magazine (tap targets, as [2]) / TetraLogical — *Foundations: target sizes* — https://tetralogical.com/blog/2022/12/20/foundations-target-size/
9. Shakti Singh Cheema — *Autoplay video on mobile in low power mode* — https://shaktisinghcheema.com/how-to-autoplay-video-on-mobile-devices-on-low-power-mode/
10. web.dev (Google) — *Web Vitals* — https://web.dev/articles/vitals
11. Google Search Central — *Understanding Core Web Vitals and Google Search* — https://developers.google.com/search/docs/appearance/core-web-vitals
12. Rob Simpson — *Autoplay HTML5 video on iOS, Android and desktop* — https://robsimpson.digital/articles/autoplay-html5-video/
13. Swarmify — *Autoplaying Background Video: HTML & CSS Guide* (prefers-reduced-motion / data-saver) — https://swarmify.com/blog/how-to-make-an-autoplaying-background-video/
14. WHATWG/html — *Make autoplay respect prefers-reduced-motion (Issue #11605)* — https://github.com/whatwg/html/issues/11605
15. Core Web Vitals 2026 — *INP, LCP & CLS Optimization* — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide
16. Core Web Vitals — *LCP, INP & CLS Explained (2026)* — https://www.corewebvitals.io/core-web-vitals
17. Mux — playback guide (adaptive bitrate ladder, as [1]) — https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025
18. W3Tweaks — *CSS scroll-snap: Build a CSS Carousel Without JavaScript (2026)* — https://www.w3tweaks.com/css/css-scroll-snap-explained/
19. Nolan Lawson — *Building a modern carousel with CSS scroll snap* — https://nolanlawson.com/2019/02/10/building-a-modern-carousel-with-css-scroll-snap-smooth-scrolling-and-pinch-zoom/
20. Parachute Design — *Mastering the Thumb Zone: Mobile UX & UI Design Guide* — https://parachutedesign.ca/blog/thumb-zone-ux/
21. CSS Script — *Embla Carousel: Draggable & Touch-friendly Carousel* — https://www.cssscript.com/draggable-touch-embla-carousel/
22. Creative Bloq — *10 ways to make your portfolio mobile-friendly* — https://www.creativebloq.com/portfolios/10-ways-make-your-portfolio-mobile-friendly-41620134
23. Webstacks — *Mobile Menu Design: Best Practices (2025)* (incl. NN/G hidden-menu stat) — https://www.webstacks.com/blog/mobile-menu-design
24. NN/G (Nielsen Norman Group) — *Bottom Sheets: Definition and UX Guidelines* — https://www.nngroup.com/articles/bottom-sheet/

Supporting (Apple/Google platform floors cited under #5): Apple Human Interface Guidelines — *Sheets* (https://developer.apple.com/design/human-interface-guidelines/sheets) and 44pt targets; Material Design — *Bottom sheets* (https://m1.material.io/components/bottom-sheets.html) and 48dp targets.
