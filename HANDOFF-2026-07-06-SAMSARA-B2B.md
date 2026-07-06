# Portfolio Site — B2B / Samsara Push + Domain — Handoff

**Owner:** Miles Spearman (social producer, Adobe Brand)
**Status as of this handoff:** Portfolio live at commit `6ed6c5b` on `main`. Custom domain **milesspearman.com is LIVE** (bought through Vercel, serving the site over HTTPS). This session (Jul 6) shipped the nav/menu bar, split NFL into its own card + built the NFL Kickoff carousel, and — the main thrust — built the **"Making B2B Social Friendly"** square for a **Samsara (B2B) job application**. Two things still open: (1) **real LinkedIn play counts for 6 B2B reels** (Miles must supply — not scrapable), (2) a **thumbnail-cleanup agent** finishing overnight.
**Written for:** a fresh Claude instance picking up with zero prior context.
**Created:** Jul 6, 2026
**Last updated:** Jul 6, 2026

---

## 0. How to use this document
Read §1–4 to orient, then work §5. **The single most important open item is §5.1 (LinkedIn play counts).** Everything is one file: `src/Portfolio.jsx` (single-file React/Vite).

**THREE RULES THAT MATTER MOST — breaking these is how the prior session lost Miles's trust:**
1. **NEVER name the audience in on-screen copy.** Do not write "recruiters" / "hiring managers" anywhere a visitor can read. Sell the *work*, not the site's strategy. (He was furious about an "organized the way recruiters look" line — now removed.)
2. **Numbers are DERIVED in code, never hand-typed, never invented.** `TOTAL_REELS`, `TOTAL_PLAYS`, `eventStats`, the per-square totals are all computed. A play count you don't have = `plays: ""` (blank), never a guess. Numbers exact or absent.
3. **Build → verify in the browser → push, every change.** `npm run build`, then verify via `preview_eval`/DOM (screenshots render black — 60+ `<video>`), then push (`gh` works; Miles wants every change live).

Don't undo §6 decisions. Don't invent answers to §5 — those are Miles's to make.

## 1. Goal
Miles's career portfolio: a Spotify-Web-Player-style single-page site. **Immediate driver: he is sending it to Samsara (B2B enterprise SaaS)**, so the top priority is a polished, comprehensive **B2B showcase** that reads as impressive B2B social production. It doubles as his general job-hunt portfolio, now on a custom domain.

## 2. Current status
- Live at `6ed6c5b`; Vercel auto-deploys `main` (~60s). Also live at **milesspearman.com** (HTTPS) and `portfolio-eosin-mu-38.vercel.app`.
- The **What I Do** section is a row of capability "squares." The **first (top) square is now "Making B2B Social Friendly"** — the Samsara centerpiece — deliberately placed first so a visitor hits it right after the "What I'm Working On Now" block.
- A **thumbnail agent** is running in the background regenerating poster frames; it commits + pushes to `public/thumbs` when done. **Verify its push landed** (see §5.2).

## 3. Constraints & ground rules
- Repo is **PUBLIC** (`milespspearman-portfolio/portfolio`) — no private material.
- **No em dashes** in copy. Miles's hero/nav/CTA words are **locked** — don't rephrase; append a labeled alternate if you'd change them.
- The three rules in §0 govern everything.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Push after each verified change.

## 4. Done so far this session (verified — don't re-discover)
**Nav / menu bar** (friend feedback: "need a menu bar to find everything at once"):
- Added a mobile **bottom tab bar** (Spotify-style, ≤640px): About / Work / Timeline / Library. Desktop nav gained **Timeline** + **Resume**, and "Work" was renamed **"Work Playlist"**.
- `index.html`: added `viewport-fit=cover`; changed the em dash in `<title>`/`og:title` to a colon.
- Play glyph on hero cards now shows on touch (`hover:none`).

**Layout / copy:**
- Reordered: **Selected Work moved below the Career Timeline** (page order: about → what-i-do → timeline → work → library).
- Selected Work intro copy is now: *"Real content from real campaigns: Pitched, Produced and Directed by Me. {TOTAL_REELS} videos · {fmtPlays(TOTAL_PLAYS)} plays. Pick a playlist, press play."* (currently renders **111 videos · 32.2M plays** — both derived).
- Repaired **10 truncated/leaked captions** (e.g. "…coming to!", garbled Coca-Cola quotes).
- Blanked the Iliza reel's weak 765-play/3-like count. Added an "Email me" primary to the mid-page CTA.

**NFL:**
- Split the NFL work into its own **"Adobe × NFL"** event (role "Produced in partnership with the NFL", subtext "Official Creativity Partner").
- Built **"NFL x Adobe: Season Opener Kickoff"** — the 5-slide IG *video* carousel concatenated into one 9:16 mp4 (4:5 slides centered on a blurred fill, audio kept), `public/reels/2025/NFL-Kickoff/`. Stats from the IG post: 1.3K likes, Sep 5 2025, no play count (carousels don't expose one).
- Added a guard so timeline cards **hide the play line when total plays is 0** (no ugly "0 plays").

**Library rename:** the **"Evergreen" library is now "In-House Production"** everywhere (LIB_ORDER, LIBRARY_OF values, the TL_CAT chip key, the year-split check). Shelf reads "In-House Production Library".

**B2B square (the main deliverable):**
- Downloaded **7 LinkedIn videos** with `yt-dlp` (all 9:16). Dates decoded from post IDs (see §8). Compressed to `public/reels/**`, thumbs generated.
- The **"Making B2B Social Friendly"** square is the **first** `capabilities` card. Meta/sub = "Exec Leadership, Customer Stories & Hot Takes". Its drawer is organized into **4 albums** (17 proof reels total), defined in `SPECIALTY_REELS["Making B2B Social Friendly"]`:
  - **Hosting** — '26 Summit (Sneaks Celebrity Host, Anil Chakravarthy, Iliza) + 6× '25 Summit (Ken Jeong, Acrobat Escape Room, Hosted Recap, Describe Your Job, Escalator Hot Takes, Sneaks Emoji Reactions)
  - **Customer Stories** — '25 MAX Customer Story: Wyndham Hotels; '25 MAX Customer Story: Intuit
  - **Exec Thought Leadership** — On TikTok Your Ad Has Just 10 Seconds to Live; Global Consumers Prefer Content in Their Own Language; Humans Now Have a Shorter Attention Span Than a Goldfish
  - **Product Releases** — GenStudio for Performance Marketing Demo; Brand Intelligence B2B Interview; '26 Summit: Behind the Scenes of Sneaks
- Backing card video = the Intuit reel (poster = its thumb). Body copy sells the work (no audience named).
- **Timeline homes** for the B2B reels (both In-House Production library): event **"GenStudio for Performance Marketing"** = the Demo + 3 Exec TL pieces; event **"'25 MAX Customer Stories"** = Intuit + Wyndham. **Anil** was added to the existing **'26 Summit** event.
- A second What I Do square, **"Adobe Summit '25 & '26"**, also exists (see §5.6 — likely redundant now).

**Bug fixed:** `SpecialtyDrawer` grouped album rows only when *consecutive*, so a non-consecutive repeat (the Directing square's '25 MAX LA, split by a Brand-Partnerships row) produced two groups with the same React key. Now groups **merge by album globally** — unique keys, no split sections. Verified 0 dup-key warnings across all drawers.

**Notion** ("🎬 Miles Portfolio Links"): added a **B2B checkbox** property; logged all 7 B2B reels and set `B2B = yes`; synced their names to the renamed titles. The NFL Kickoff reel is also logged (with its mp4 attached to the page).

## 5. Open / not yet decided (do NOT invent — Miles decides)
**5.1 — PLAYS on the 6 LinkedIn B2B reels (THE urgent one).** These show `plays: ""` (blank): `GenStudio for Performance Marketing Demo` (line ~325), the 3 `Exec Thought Leadership:` reels (~326–328), `'25 MAX Customer Story: Intuit` (~334), `'25 MAX Customer Story: Wyndham Hotels` (~335). Miles insists they got real plays on LinkedIn and does not want them reading as no-plays. **LinkedIn view counts are NOT obtainable by any tool tried** (Apify's IG scraper is IG-only; WebFetch → login wall; yt-dlp → None). Paths, in order:
  - (a) **PRIMARY — Miles supplies the numbers** from Adobe/LinkedIn analytics. Then set `plays: "45K"` etc. on those lines; it flows into `TOTAL_PLAYS`, the square total, and the drawer's Popular ranking automatically. The 6 post URLs are in §7.
  - (b) **FALLBACK** — try an Apify *LinkedIn* post-scraper actor for view/reaction counts (uncertain; LinkedIn blocks aggressively).
  - (c) **LAST RESORT (design)** — the B2B drawer shows a "POPULAR" list ranked by plays, so blank LinkedIn reels sink to the bottom and read as flops. If real numbers stay unavailable, consider *not* ranking the B2B square by plays (album grouping only) or showing a "LinkedIn" source tag in place of a blank count, so they don't look like failures.

**5.2 — Thumbnail agent.** A `general-purpose` (opus) agent is regenerating poster frames overnight (centered/clean — the Intuit card face had caught a "TurboTax business unit" lower-third; the TL text frames were mid-transition). It commits + pushes `public/thumbs`. **Verify its commit is on `main`** — commit `6ed6c5b` was pushed *after* the agent launched, so its push may have been rejected; if so, pull its commit or re-run the pass.

**5.3 — Hero title mismatch.** Hero eyebrow reads *"Social Creative Producer @Adobe"*; the shipped resume PDF title is *"Social Lead, Creator & Community | Adobe Brand"*. Three recruiter-lens reviews flagged the conflict. Miles's fact to confirm. Note `COPY-PRINCIPLES.md` bans a bare "Social Lead".

**5.4 — '25 IBC role line.** "Hosted & on-camera talent" vs "Produced" — Miles has said both; unresolved.

**5.5 — Cannes.** Still named in the "What I'm Working On Now" paragraph and the "Cannes Lions Firefly Feature" caption. Miles's standing rule is to remove Cannes; pending his OK to pull.

**5.6 — Summit square redundancy.** The standalone "Adobe Summit '25 & '26" square overlaps the B2B square's Hosting album (both list Summit pieces). Consider dropping the standalone Summit square now that B2B is the one-stop-shop. Raised, not answered.

**5.7 — Share preview (og:image).** `index.html` has no `og:image`, so the link unfurls with no thumbnail in iMessage/LinkedIn — bad for a visual portfolio he shares. Now that the domain exists, add a 1200×630 `og:image` and set `og:url` to `https://milesspearman.com`.

**5.8 — "111 videos".** That's the reel/post count (`TOTAL_REELS`); the NFL Kickoff is 5 videos in one carousel, so the true video count is slightly higher. Miles may want a hand-count rather than the derived value.

**5.9 — "Work Playlist".** Nav label was changed to "Work Playlist"; the section heading is still "Selected Work". May want to align them.

## 6. Decision & reversal log (don't undo)
- **Domain bought through Vercel** (not a separate registrar) — Miles chose easiest; it's live at milesspearman.com.
- **Library "Evergreen" → "In-House Production"** (Miles).
- **B2B square title is "Making B2B Social Friendly"** — reversed from an interim "B2B". It is the **first** What I Do card, 4 albums, sub "Exec Leadership, Customer Stories & Hot Takes".
- **REVERSAL: the B2B body must not name the audience.** An earlier body said "organized the way recruiters look" — removed. Never write "recruiters" in on-screen copy.
- **B2B reels renamed** (final): `'25 MAX Customer Story: {Intuit, Wyndham Hotels}`, `Exec Thought Leadership: {On TikTok…, Global Consumers…, Humans…Goldfish}`, `GenStudio for Performance Marketing Demo`. Events: `GenStudio for Performance Marketing`, `'25 MAX Customer Stories`.
- **NFL is its own "Adobe × NFL" card**, not under Brand Partnerships.
- **Evergreen/In-House-Production events split by year on the timeline** (Events stay whole) — so the GenStudio/customer-story events appear as per-year cards; that's expected, not a bug.
- Miles's "1XX / 32.2M" for Selected Work matched the derived values (111 / 32.2M) — kept derived.

## 7. Key files, links, IDs
- Repo: `~/Downloads/Claude/portfolio-site/` → GitHub `milespspearman-portfolio/portfolio`, `main` → Vercel. **All code + data: `src/Portfolio.jsx`.** Media: `public/reels/**`, `public/thumbs/**`.
- Live: **https://milesspearman.com** (custom) and https://portfolio-eosin-mu-38.vercel.app. Latest commit **`6ed6c5b`** (+ a pending thumbnail-agent commit).
- Notion DB "🎬 Miles Portfolio Links": database `e8435e80-b0aa-45d7-90f9-e94db5229015`, data source `collection://4d7fdf71-f80b-405a-b802-842dd13181f8`. Now has a **B2B checkbox** property; the 7 B2B reels are logged + tagged.
- Prior docs in the repo: `CLAUDE.md` (Spotify build), `HANDOFF-COPY-CONSISTENCY-QA.md`, `HANDOFF-PORTFOLIO-SMALL-FIXES.md`, `COPY-PRINCIPLES.md`.
- **The 6 LinkedIn posts needing play counts (§5.1):**
  - Intuit — `linkedin.com/posts/intuits-audrey-timpe-shares-how-ai-has-become-ugcPost-7403901188343328768-lISN`
  - Wyndham — `linkedin.com/posts/adobe-for-business_everything-good-comes-from-real-human-insight-activity-7419788674906759168-W8Fk`
  - GenStudio Demo — `linkedin.com/posts/adobe-for-business_adobe-genstudio-for-performance-marketing-activity-7262556392153055232-xLqm`
  - TL / TikTok — `linkedin.com/posts/tap-into-tiktoks-18b-monthly-users-with-ugcPost-7389722765508935681-Mov9`
  - TL / Global — `linkedin.com/posts/go-global-with-confidence-genstudio-for-ugcPost-7389692893927698432-6aFM`
  - TL / Goldfish — `linkedin.com/posts/purnimarroy_attention-spans-are-shorter-than-ever-and-ugcPost-7394620260328488961-EbUw`

## 8. Tool & environment knowledge (saves hours)
- **LinkedIn videos:** `yt-dlp <url>` downloads public posts with no login (even when the metadata probe returns NA). **View/play counts are NOT retrievable** by any method here. **Post dates decode from the post ID:** `date = (postId >> 22) / 1000` (Unix seconds) — verified against known launch weeks.
- **IG:** `apify/instagram-scraper` (the `368a9bc0` MCP). IG image/video carousels (`type: "Sidecar"`) expose `likesCount` + `timestamp` but no single play count.
- **Making a site video:** mp4 lives at `/reels/...` (absolute paths pass straight through `srcOf`); thumb mirrors the path `.mp4 → .jpg` under `/thumbs/`. Compress with `ffmpeg -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart`. A 4:5 carousel → 9:16 via a blurred-fill pad (`split` → `boxblur` bg + scaled sharp fg `overlay`); **keep audio** (normalize each clip to identical codec/params, then `concat -c copy`).
- **Verify in the browser, NOT screenshots** (60+ `<video>` render black). Use `preview_eval` (reload, then read the DOM: `getBoundingClientRect` works; `IntersectionObserver` is frozen; wait ~400–700ms after a `.click()` for React state). Dev server = launch.json name "portfolio-dev".
- **Data model** (all in `src/Portfolio.jsx`): the `portfolio` array = events → reels. Event-keyed maps: `EVENT_ROLES` (role line), `EVENT_BRANDS` (subtext), `LIBRARY_OF` (event → library). Reel-keyed: `REEL_DESCS` (by exact title). Timeline: **In-House-Production events split by year, Events stay whole**; chip from `TL_CAT[library]`. **What I Do squares** = the `capabilities` array (array order = display order) + `CAPABILITY_REEL_TITLE` + `SPECIALTY_REELS` + `SPECIALTY_ROW_DESCS` — **all four are keyed by the card title; keep them in sync when renaming a square.** `SPECIALTY_REELS` references reels by exact title, so renaming a reel means updating its refs. The drawer groups rows by `album` and now merges non-consecutive same-album rows — don't reintroduce consecutive-only grouping (it caused duplicate React keys).
- **Notion:** `query_data_sources` (SQL) is unavailable on Miles's plan (use `fetch`). Select values must pre-exist — add via `update-data-source` `ALTER COLUMN … SET SELECT(...)` before creating a page with a new value. Checkbox values are `"__YES__"` / `"__NO__"`. Dates use the expanded `date:Posted:start`. To attach a video to a page: `create-attachment` with `source_url` = the public Vercel mp4 URL (≤5 MiB), then insert `<video src="file-upload://…">` via `update-page`.
- **Push:** `gh` works in Claude's shell. If a background agent and the main thread both push, the later push just needs a rebase (different files = clean merge).
