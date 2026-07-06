# Portfolio Timeline — Copy & Consistency QA — Handoff

**Owner:** Miles Spearman
**Status as of this handoff:** Career Timeline is LIVE at commit `c652622` (Vercel auto-deploys `main` ~60s). A long build-out session added ~15 reels across several new/renamed projects. Everything renders + builds clean; what remains is a **human/QA verify pass on copy facts** (roles, a few approximate dates, titles, captions) — NOT new features.
**Written for:** a fresh Claude instance picking up with zero prior context.
**Created:** Jul 5, 2026
**Last updated:** Jul 5, 2026

---

## 0. How to use this document
Read §1–2, then work the **§5 checklist** with Miles — those are the only open items. **SINGLE MOST IMPORTANT RULE: this is a QA/verify pass, not a rebuild. All the play counts/likes/dates that came from real metadata are correct and Miles-supplied-fact — do NOT "clean up" or invent numbers (COPY-PRINCIPLES: numbers exact or absent).** Only the items explicitly flagged in §5 are uncertain. Don't undo §6 decisions. Verify the live site via `preview_eval`/`preview_inspect` (DOM), **never screenshots** — the page has 60+ `<video>` elements and screenshots render black. All data + code is in one file: `src/Portfolio.jsx`.

## 1. Goal
Make the Career Timeline résumé-grade: every title, role line, caption, date, and event name accurate and internally consistent, so Miles can share it and cite it. The structure and interaction are done; this is the final copy audit.

## 2. Current status
Timeline expand = **poster carousel → tap poster or "Expand" → swipe video view (captions) → Minimize back**. Projects are split from the old "In-House Production" bucket and reorganized. Evergreen projects **split by year on the timeline** (Events library stays whole); carousel reels sort **landscape/longform first, then newest-first by date**. Landscape (16:9) videos render 16:9 (poster, swipe player, and card cover) via a per-reel `landscape: true` flag. Every reel added this session also has a row in the Notion "🎬 Miles Portfolio Links" DB.

## 3. Constraints & ground rules
- Repo is **PUBLIC** — never commit private material.
- Copy gate: `COPY-PRINCIPLES.md` (no em dashes; numbers exact or absent; Miles's words win — append labeled alternates, never overwrite).
- `npm run build` before every push (esbuild passes on undefined free identifiers — a crash can hide until runtime; trigger the actual interaction in-browser).
- Push: `gh` works, but the **auto-mode classifier blocks a bare push-to-`main` unless Miles authorized it in-chat that turn** (say so, or he pushes). He wants live updates → push after each verified change.
- Dev preview: `preview_start "portfolio-dev"` (launch.json at `~/Downloads/Claude/`, port 5173).

## 4. Done so far (verified — don't re-discover)
Projects on the timeline now, with the reels added/moved **this session**:
- **Employee Spotlights: Season 1/2/3** — split from In-House Production (S1 = 2025, 2.9M).
- **'26 Summit** (Events / ON LOCATION) — Sneaks Celebrity Host Interview, Brand Intelligence B2B Interview, Coolest Job Tongyu/Eric, **Behind the Scenes of Sneaks** (landscape, LinkedIn), **Words of Wisdom with Iliza Shlesinger** (landscape, YouTube). 6 reels.
- **'26 NAB Vegas** (Events / ON LOCATION) — Object Matte OTG (1.1M), Color Mode OTG (452.6K). Apify→CDN.
- **'25 IBC Amsterdam** (Events / ON LOCATION) — Recap, Favorite Premiere Transitions, Premiere Pro Transitions Release, **Premiere on Mobile Release** (landscape, LinkedIn). The 3 IG reels are **360p** (IG only served that res).
- **Artist Spotlights** — San Jose Semaphore (IG), Artist Spotlight Aaron, Building Murals: Laura Garcia (moved in from Brand Partnerships), **Cracking the Semaphore Code** (landscape longform, YouTube, compressed 102→57MB).
- **Photoshop Archives** (NEW, Evergreen / IN-HOUSE — a podcast series, moved OUT of Brand Partnerships) — the **longform podcast** (landscape, 35min, compressed 73→53MB) first, then 4 promos: Power of Small Tools (829.9K), Tools Don't Know When Something is Good (713.7K), 1st Satisfying Project (734.8K), Tools Don't Make Things (85.5K).
- **Brand Partnerships** — Kelley O'Hara x NWSL x Adobe (moved in from '25 MAX LA, now first), NFL x Adobe: Behind the Lens / LCC (landscape, moved in from the deleted "Made to Create" project), Eyes of Wakanda, NWSL, GSW.
- **Made to Create** project was created then **deleted** — its LCC video lives in Brand Partnerships now (§6).

Interaction/plumbing done and verified: carousel↔swipe view, three minimize affordances, auto-collapse-on-scroll-out-of-view, reduced-motion gating, landscape rendering, landscape-first + chronological sort, the caption-line guard for empty play counts.

## 5. Open / QA checklist (do NOT invent — Miles verifies each)
1. **Role lines — all best-guess, verify per project** (`EVENT_ROLES` map + per-reel `role` fields):
   - `'26 Summit` = "Produced" — but it's now ON LOCATION; may want a hosting-style line.
   - `'25 IBC Amsterdam` = "Hosted & on-camera talent" — Miles's message both said "only hosted + added as talent" AND "just produce"; **unresolved — confirm**.
   - `'26 NAB Vegas` = "Produced". `Photoshop Archives` = "Produced". Employee Spotlights S1/2/3 + Artist Spotlights = "Produced & creatively directed". Always-On = "Produced".
   - Per-reel roles: Iliza + BTS Sneaks = "Produced & Coached"; Premiere on Mobile = "Concepted, scripted, coached & produced"; Kelley kept "In-house production: produced & creatively directed".
2. **Approximate date**: `'25 IBC: Premiere on Mobile Release` = **"Sep 30, 2025"** is my estimate (LinkedIn hides the date; Premiere-on-mobile launch week). Correct if off. (BTS Sneaks date was corrected to May 29, 2026 — confirmed.)
3. **Library playlist meta line** now shows the **playlist name** instead of @channels — it **echoes the big title right above it**. Miles floated this but never confirmed it's what he wants. Confirm keep / change to parent-series / drop.
4. **Three Sneaks-adjacent pieces in '26 Summit** (Sneaks Celebrity Host Interview + Behind the Scenes of Sneaks + Words of Wisdom with Iliza). Confirm this isn't redundant/confusing.
5. **Empty play counts** (`plays: ""`) on BTS Sneaks + Premiere on Mobile (no public count) — the caption line drops "plays" gracefully; eyeball it reads clean.
6. **Titles/prefix consistency**: mix of `'26 …`, `'25 …`, `PS Archives`, full names. Skim for a consistent voice.
7. **Low-signal items**: Iliza = 765 plays; IBC reels 360p (softer). Fine to keep, but Miles's call whether the tiny-number reels earn a slot.

## 6. Decision & reversal log (don't undo)
- **"Made to Create" project deleted; its LCC video moved into Brand Partnerships** as "NFL x Adobe: Behind the Lens (LCC)" — it's the NFL × Adobe partnership (Miles's call).
- **Photoshop Archives moved OUT of Brand Partnerships** into its own In-House podcast-series project; longform podcast leads, IG reels are promos.
- **Kelley O'Hara moved OUT of '25 MAX LA into Brand Partnerships** (not a MAX piece) and is first there.
- **'26 Summit is ON LOCATION (Events)**, not In-House (Miles corrected).
- **Building Murals: Laura Garcia → Artist Spotlights** (not Brand Partnerships), shows at 2025.
- **Carousel sort = landscape-first, then newest-first** (Miles wanted Brand Partnerships = Wakanda→NWSL→GSW and PS podcast leading its promos).
- **LCC uses the official YouTube 16:9 title-card thumbnail**; card cover renders 16:9 for landscape leads (fixed the crop).
- **Instagram links removed from the timeline** (kept in library/drawer).
- **Notion Event select options added this session**: `NAB 2026`, `IBC 2025`, `Adobe Summit 2026`.

## 7. Key files, links, IDs
- Repo: `~/Downloads/Claude/portfolio-site/` → GitHub `milespspearman-portfolio/portfolio`, `main` → Vercel. All code/data: `src/Portfolio.jsx` (single-file React/Vite). Reels: `public/reels/**`, thumbs `public/thumbs/**`.
- Notion DB "🎬 Miles Portfolio Links": database `e8435e80-b0aa-45d7-90f9-e94db5229015`, data source `collection://4d7fdf71-f80b-405a-b802-842dd13181f8`. Every reel added this session has a row.
- Other handoffs: `HANDOFF-PORTFOLIO-SMALL-FIXES.md` (interaction history, session 6/7), `COPY-PRINCIPLES.md`, `research/MOBILE-BEST-PRACTICES.md`, `research/MISSING-VIDEOS.md`.
- **BLOCKED / still to add**: `'26 Summit Brand Intelligence Launch` (YouTube `mn8h7nvSYXk`) — Miles wanted it; hit the YouTube bot wall, never downloaded. Needs cookies or Miles supplies the mp4.
- **Flagged bug (task_290a95d9)**: `SpecialtyDrawer` logs a duplicate-key React warning (`key="In-House Production"` / duplicate `San Jose Semaphore` rows in `SPECIALTY_REELS`) — different surface from the timeline, pre-existing.

## 8. Tool & environment knowledge (earned this session — saves hours)
- **Downloading reels — the methods that actually work:**
  - **YouTube / LinkedIn** → `yt-dlp` (free, no Apify). LinkedIn public post videos download fine even when the metadata probe returns NA. **YouTube intermittently hits a "Sign in to confirm you're not a bot" wall** — same video may work later or need `--cookies-from-browser chrome` (Miles must approve the Keychain prompt; he has denied it before).
  - **Instagram** → `apify/instagram-scraper` (the `368a9bc0` MCP): one run with all reel URLs in `directUrls`, `resultsType: "posts"` → the dataset's `videoUrl` is a **CDN link that `curl` downloads with no login**. ~$0.002 compute units per run — cheap; do ONE batch run, not per-reel. IG image *carousels* (`type: "Sidecar"`) have no single `videoUrl` — nothing to download. CDN URLs expire (the `oe=` param) — download promptly.
  - Always `--write-info-json` for YouTube to get title/date/views/likes/description; `rm` the `.info.json` before committing (don't serve it). Make a thumb with `ffmpeg -ss N -frames:v 1`.
- **Notion**: `query_data_sources` (SQL) is **unavailable on Miles's plan** — can't dedup by query; use `fetch`. **Select values must already exist** — creating a page with a new Event/Category value errors; add the option first via `update_data_source` `ALTER COLUMN "Event" SET SELECT(...all existing + new...)` (re-list ALL options by name so existing rows are preserved). Date props use expanded `date:Posted:start`.
- **Preview is frozen**: `IntersectionObserver` never fires, `window.scrollTo` is pinned at 0, CSS animations stick mid-keyframe. So scroll-based behavior (auto-collapse) and the swipe *gesture* can't be exercised in-sandbox — verify by logic + on device. Layout/`getBoundingClientRect` DO work. React state updates are async — wait ~400-500ms after a `.click()` before reading the DOM.
- **Landscape videos**: reel gets `landscape: true`; the carousel poster, swipe player, and card cover then render 16:9 instead of 9:16. Longforms are big — compress with `ffmpeg -c:v libx264 -crf 28 -preset medium -c:a aac -movflags +faststart` (roughly halves size, no visible loss).
- **macOS gotchas**: `timeout` isn't installed (use the Bash tool's own timeout). Screen-recording filenames use a narrow no-break space before AM/PM — glob them, don't type the literal path. Bash cwd resets to the project dir between calls — use absolute paths or `cd` inside the command.
