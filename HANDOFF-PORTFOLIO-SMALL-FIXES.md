# Portfolio Site — Small Fixes — Handoff

**Owner:** Miles Spearman
**Status as of this handoff:** Site is LIVE at commit `eba3647`. Timeline is the active work surface. Session-7 (Jul 5) reworked the whole timeline expand interaction + restructured the 2026 data into named projects.
**Written for:** a fresh Claude instance picking up with zero prior context.
**Created:** Jul 5, 2026 · **Last updated:** Jul 5, 2026 (session 7)

### Session 7 — shipped + pushed (Jul 5) — TIMELINE overhaul
Final timeline interaction (carousel won): tap a project card → **carousel** of 9:16 posters (swipe, grey ▶ + "tap to open") → tapping a poster OR the yellow **Expand** button opens the **swipe view** (full-width video pager, swipe L/R, publish date + full caption under each) → **▲ Minimize / ✕** returns to the carousel; carousel's own ▲ Minimize collapses the card. No inline native player anymore (killed the 3-dot menu). `TLExpand` has a local `view` state (`"carousel"|"swipe"`); `TLDetail` is now dead code (unused). Key commits: `8e827a1` (carousel+swipe+captions, dropped card date-range), `4e56322` (poster→Expand; renamed reel "'26 Summit: Recap" → **"'26 Summit: Sneaks Celebrity Host Interview"** across data title + `SPECIALTY_REELS` + `REEL_DESCS`).

**Data restructure** — `2e437ec`: split the old 17-reel "In-House Production" event into 6 named projects (Employee Spotlights: Season 1/2/3, '26 Summit, Artist Spotlights, Always-On); updated `LIBRARY_OF` + `EVENT_ROLES`. `eba3647`: moved **Building Murals: Laura Garcia** from Brand Partnerships → Artist Spotlights, and **made the timeline split every Evergreen project into one spine node PER year** (`_spineNode` + the `timelineNodes` loop near the `LIBRARY_OF`-gated build; Events library stays whole). Library playlists stay whole — only the chronological spine splits. Split nodes get unique string ids (`${idx}:${year}`) so they open independently; `<Fragment key={ev.idx}>`. Result: Building Murals at 2025, UofCincy at 2022 (new section), TacoBell at 2024, Brand Partnerships splits 2025/2026, Always-On 2024/2025.

**Also `eba3647`:** Selected-Work playlist meta line now leads with the **playlist name** (`viewing.event`) instead of `handlesOf` @channels — BUT it echoes the big title right above it; **Miles hasn't confirmed this is what he meant** (he may want the parent series name, e.g. "Employee Spotlight Series", or something else — ASK before changing further).

**Open for Miles (do NOT invent):**
1. **Made to Create** project — blocked: the LCC/NFL "Made to Create" reel is a YouTube video (`emLfQR3DPME`, 484K, in `research/MISSING-VIDEOS.md`) not yet downloaded. Miles will send the link/mp4 → then download/transcode/add as a project.
2. **Season assignments + event-level roles** on the 6 new projects are best-guess — Miles to verify (Russell → S3; roles "Produced & creatively directed" / "Produced").
3. **@channels meta line** — see above; confirm intent before further change.
4. **Evergreen-split side effects** — if Miles wants Brand Partnerships kept as one 3.6M node (not split 2025/2026), exempt it in the `timelineNodes` loop.
5. **Pre-existing bug (flagged, task_290a95d9):** `SpecialtyDrawer` logs a duplicate-key React warning (`key="In-House Production"` / duplicate `San Jose Semaphore` rows in `SPECIALTY_REELS`). Different surface; not from timeline work.

### Session 6 — shipped + pushed (Jul 5)
- **`16d0596`** — (1) reduced-motion gating: global CSS reset that neutralizes every keyframe + transition under `prefers-reduced-motion: reduce`, plus a JS early-out in `PlaysCounter` (jumps the count-up to final). (2) Mobile bottom-sheet swipe-down-to-dismiss on `SpecialtyDrawer`: native **non-passive** `touchmove` (React binds it passive, so `preventDefault` needs a raw `addEventListener`), only hijacks at `scrollTop<=0 && dy>0`, `dy>90` closes, gated `≤900px`; tap/scrim/Esc unchanged. (3) Dead-code removal: the never-rendered `AboutClip` + its orphans `SWIPE_REEL_TITLES`, `swipeReelBy`, and the `clipFade` keyframe.
- **`4990548`** — timeline mobile polish. Root-caused the "hugging thumbnail": the thumb span was hard-set `width: 84px` but the mobile `.tl-card` grid track is smaller, so it overflowed its lane. Fixed to `width: 100%` (fills the track) + mobile card now `68px / gap 16 / padding 16`. Added a **Minimize** action to the expanded reel card: a filled, `cat.accent`-colored pill leading the action row (`onClick` → `toggle(ev.idx)`), so collapsing back to the timeline is the encouraged path; Open-on-Instagram / Open-in-full-player stay secondary text links.
- Verified via DOM (screenshots render black — 65 `<video>` on the page): thumb 68px no-overflow / 16px gap; Minimize renders (gold pill, dark text, 44px) and collapses `aria-expanded`; build clean; 0 console errors.
- **`19be77f`** — timeline expand/collapse UX round 2 (Miles asked). (a) Added the app-convention **top-right ✕** minimize button on the expanded card, alongside the labeled pill (both call `toggle(ev.idx)`). (b) **Auto-collapse when the open card scrolls fully out of view**, via a guarded `IntersectionObserver` (`[data-tl-open]`, `threshold 0`, only collapses after the card has been `seen` once so tapping a card low on the screen doesn't snap shut). Accordion single-open was already in place (`openIdx` is a single index). **Decision:** rejected collapse-on-*any*-scroll — it would nuke the card the moment the user scrolls down to read the description / chips / buttons that live *below* the video. Out-of-view is the safe, intuitive variant.
- **`c0166af`** — minimize under the header thumbnail (left column, category-colored, fits the 68px track, `stopPropagation`); removed the redundant bottom action-row pill. Minimize controls now: under-thumb + the top-right ✕.
- **`a9dff7f`** — ✅ **RESOLVED: Miles picked the poster carousel.** Switcher + `tlMode` + swipe/list branches removed; `TLExpand` is carousel-only. Carousel caption line now shows the publish date ("1.9M plays · Aug 18, 2025 · tap to play"). "Open in full player" → an **"Expand" button** opening a new **`TLDetail`** bottom-sheet: reel poster→tap-to-play, title, `plays · date`, the full caption (`REEL_DESCS[title]`, italic fallback if none), and the project it lived under (`cat.chip · ev.event`). Date derived via `reelDateStr` (last ` · ` segment of `reel.sub`). Instagram links stay REMOVED from the timeline (still present in the library/drawer sections by design).
- ~~**`d9ca340`** — 3 open-behavior prototypes behind a "Preview:" switcher~~ (superseded by `a9dff7f`) at the top of `CareerTimeline`. Miles is choosing how a project card opens. `tlMode` state (`carousel` | `swipe` | `list`) drives a new `TLExpand` component with three renderers: **carousel** (swipeable 9:16 posters, tap ▶ to play inline, no autoplay — default + Claude's rec), **swipe** (opens playing the top reel, horizontal scroll-snap pager; intentionally exposes the scrubber-vs-swipe conflict), **list** (vertical numbered tracklist, tap row to play, matches the Spotify shelf). Old single-video autoplay expand + chip strip were REMOVED. **NEXT SESSION: once Miles picks one mode, delete the switcher JSX (the `Preview:` block), the `tlMode` state, and the two unused branches of `TLExpand`; keep the winner.** The swipe/scroll gesture (onScroll→`nearestChildIdx`→active reel) is NOT sandbox-testable (frozen preview) — only verified render + tap-to-play + no console errors; Miles judges swipe feel on device.
- ⚠️ **Auto-collapse is NOT browser-verified** — this headless preview's render pipeline is frozen (IntersectionObserver never fires its initial callback, `window.scrollTo` is pinned at 0, CSS animations stick mid-keyframe). Verified by logic + clean build only. The ✕ + pill collapses ARE browser-verified. Miles to gut-check auto-collapse on his phone (the real surface). If it ever needs removing, delete the `useEffect` with the `[data-tl-open]` observer in `CareerTimeline`.

---

## 0. How to use this document
Read in order: `CLAUDE.md` → the session-5 block at the top of `PROGRESS.md` → `COPY-PRINCIPLES.md` → `research/PORTFOLIO-PATTERN-SPEC.md`. Everything through `ded4f86` is pushed + live (Vercel auto-deploys `main` ~60s). **SINGLE MOST IMPORTANT RULE: do all file edits INLINE yourself — background agents die silently and block work. Use agents only for read-only review/research.** Second rule: **preview screenshots render BLACK whenever a `<video>` is on screen (video compositing) — verify via `preview_eval`/`preview_inspect` (DOM), never screenshots.** Don't undo section-6 decisions. Don't invent answers to section-5 items.

## 1. Goal
Knock out the small/deferred polish. The timeline, Brand Partnerships playlist, descriptions, and mobile are DONE. This is cleanup, not new features.

## 2. Current status
Live at `ded4f86`. This session added: `CareerTimeline` vertical-spine section under Selected Work; a "Brand Partnerships" Evergreen playlist (5 brand reels); the mobile About fix (static headshot, killed the flipping tile); 3 rounds of design-judge + mobile-design review, all applied; and the `ALBUM_BLURBS` crash fix. `gh` push works; push after each verified change.

## 3. Constraints & ground rules
- Repo is **PUBLIC** — never commit internal/private material (budgets, Workfront names, the resume Bible).
- Copy gate: `COPY-PRINCIPLES.md` (7 checks + resume/LinkedIn alignment). **No em dashes. Numbers exact or absent. Miles's words win** (append labeled alternates, never overwrite).
- Locked-verbatim copy: hero / nav / About / CTA — edit only when Miles directs.
- Run the app: `preview_start "portfolio-dev"` (`.claude/launch.json` at `~/Downloads/Claude/`, port 5173). Always `npm run build` before pushing (esbuild passes on undefined free identifiers — a crash can hide until runtime, so test the actual interaction).

## 4. Done so far (verified — don't re-discover)
- `CareerTimeline` — additive section under Selected Work: modal-year buckets, sticky red year markers, mint(Events)/gold(Evergreen) nodes, tap-to-expand-and-play-in-place (one `<video>` ever), other-reels chip strip, brand-roster line on the Brand Partnerships node. Spec: `research/TIMELINE-DESIGN-DECISION.md`.
- Brand Partnerships playlist (5 reels, real Apify plays): NWSL 2.7M, Marvel 299K, GSW 225K, Building Murals 243K, Photoshop Archives 85K. mp4s + thumbs committed; 5 Notion rows in 🎬 Miles Portfolio Links.
- 3 design rounds applied: nav mobile-collapse + notch safe-area, ShelfCard + TrackRow touch affordances, sticky-year gradient, mint swipe-word, `ALBUM_BLURBS` crash fix.

## 5. Open / small fixes to do (confirm scope per item before big effort)
- ✅ **DONE `16d0596`** — ~~Bottom-sheet swipe-down-to-dismiss~~ (native non-passive touchmove; see session-6 note).
- ✅ **DONE `16d0596`** — ~~`prefers-reduced-motion`~~ (global CSS reset + `PlaysCounter` JS gate).
- **855MB of raw MP4s** = mobile-data bomb → compression/HLS is a real separate project (`research/MOBILE-BEST-PRACTICES.md`). STILL OPEN — the biggest remaining item.
- ✅ **DONE `16d0596`** — ~~Dead code `AboutClip`~~ removed (+ its orphans `SWIPE_REEL_TITLES` / `swipeReelBy` / `clipFade`).
- **Nav on mobile**: currently hides the 3 section links at ≤640px and keeps the Connect pill (no hamburger). If Miles wants nav on mobile, add a hamburger reusing the Connect popover pattern.
- **NFL Kickoff** (`DOPM4FmkpE_`) is skipped — it's a graphics carousel (no single playable video). Add as a poster + IG-link entry only if Miles asks.
- **YouTube-under-Miles-Music** (Miles's ask): BLOCKED — vidiq out of credits. Correct channel = the jazz "Miles Music & Media" (@milesspearman, 1.86K subs, `UCIcilFbIwXOdH1bYFoF632Q`), NOT the 102-sub decoy. Needs a vidiq top-up or a Chrome scrape of that channel for videos >2K views, then a design call on how to surface YouTube in a library that plays local mp4s (IG iframes were killed as fragile).

## 6. Decision & reversal log (don't undo)
- Timeline is **ADDITIVE** (under Selected Work), **NOT** replacing the libraries (Miles: "not sure I want to replace yet").
- Jazz is **fenced OUT** of the timeline (professional work only).
- Brand Partnerships = Evergreen; per-reel role `"Produced"` **only** on the 2 Miles produced (Building Murals, Photoshop Archives); NWSL/GSW/Marvel = creative-team (playlist role "Produced with the Social Creative Studio team") — do NOT upgrade these to sole "Produced".
- Copy: bio + MAX card say **"Social Creative Studio"** (Miles's pick over "Adobe Brand").
- **`ALBUM_BLURBS` was accidentally deleted in `7175fb7`** and restored in `ded4f86` — do NOT delete it again; it's referenced at the drawer album-expand path.
- Data corrections: Building Murals real plays = **243K** (old doc's 545K was wrong); NWSL = **2.7M**.
- **Cannes** = Miles was post-production producer (if a Cannes playlist is re-added, `EVENT_ROLES["Cannes"]` = "Post-production producer").

## 7. Key files, links, IDs
- Repo: `~/Downloads/Claude/portfolio-site/` → GitHub `milespspearman-portfolio/portfolio`, `main` auto-deploys to Vercel (~60s). All code in `src/Portfolio.jsx` (single-file React/Vite, ~2080 lines).
- `research/`: `PORTFOLIO-PATTERN-SPEC.md` (rule 15 = the timeline lens), `TIMELINE-DESIGN-DECISION.md`, `IG-LINKS-CONFIRMED.md`, `MOBILE-BEST-PRACTICES.md`.
- `PROGRESS.md` (session-5 handoff block at top), `COPY-PRINCIPLES.md`.
- Standing review agents (read-only, run after any change): `design-judge`, `mobile-design`, `recruiter-lens`, `copy-editor`, `org-scribe` (`~/Downloads/Claude/.claude/agents/`).

## 8. Tool & environment knowledge
- **Preview screenshots render BLACK with any `<video>` on screen** — verify via `preview_eval`/`preview_inspect`. This burned time; trust DOM, not screenshots.
- `npm run build` passes on undefined free identifiers (esbuild) — that's how the `ALBUM_BLURBS` crash hid. Always trigger the actual interaction in-browser after a change.
- `gh` push works; Vercel deploys `main` ~60s. Push after each verified commit (Miles wants live updates).
- Timeline internals: `yearOf` = modal year (year most of an event's reels landed); `reels` sorted by plays so `reels[0]` == the cover; exactly one `<video>` mounts on tap.
- `body { overflow-x: hidden }` is the horizontal-scroll backstop; the only intended horizontal scrollers are marquees + the timeline/sidebar chip strips (each `overflow-x:auto` in a bounded container).
