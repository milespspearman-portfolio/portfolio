# Portfolio Site — Spotify-Pattern Work Section — Handoff

**Owner:** Miles Spearman
**Status:** Build COMPLETE locally (3 commits on `main`), **NOT PUSHED — Claude's shell has no GitHub credential; Miles must run `git push origin main` here.** Live site updates ~60s after push (Vercel auto-deploys this repo's main).
**Written for:** a fresh Claude instance picking up with zero prior context.
**Created:** Jul 4, 2026 · **Last updated:** Jul 4, 2026

## 0. How to use this doc

Everything is in `src/Portfolio.jsx` (single-file React, Vite). Read section 2 for what exists, section 4 for open items. **RULE: hero/nav/services/about/CTA/footer copy is LOCKED verbatim (original spec in Miles's Jul 4 build prompt) — never rephrase. Data in the `portfolio` array is Miles-supplied fact: never invent titles/numbers/rows; all stats on screen are DERIVED in code (`eventStats`, `TOTAL_PLAYS`), never hand-typed.**

## 1. What the Work section is

Spotify Web Player skeuomorph: "Your Library" sidebar = 12 playlists (events/campaigns) → album-style detail panel (playlist header w/ role line + brand handles, numbered track list: thumb · title · sub · play count) → clicking a row plays the real mp4 in a Now Playing pane (single `<video>`, element = source of truth) → persistent bottom transport bar (prev/play/next, seek, mute, Open on Instagram). Top-4 highlight cards (computed by plays) as entry point. Mobile: sidebar → chip strip, video stacks on top.

## 2. Done (verified in browser Jul 4)

- 60 reels / 12 events, 496MB mp4s at `public/reels/**` (mirrors `~/Downloads/Claude/miles-portfolio-reels/` — 241 stray scraper files stripped, only mp4s committed); ffmpeg posters at `public/thumbs/**` (60/60 ok).
- Playback, pause, next-advance, transport bar, error-fallback ("Watch on Instagram") all click-tested; 0 console errors; `npm run build` clean.
- Resume: `public/Miles-Spearman-Resume.pdf` + About button. Jazz link (`@milesmusicmedia`) under CTA LinkedIn button (smaller, non-competing).
- **Round 2 (Miles's markup):** mint token `C.mint` **#5DE8C5 → #14E39A** (he called old green "really pale" — this supersedes the original locked-token spec, his call); richer `GRADS`; "Event" → "Playlist"; per-playlist role line ("{role} by Miles Spearman") via `EVENT_ROLES` map; brands-as-artist: header meta + player bar artist slot show IG handles (derived by `handlesOf`, e.g. "@adobelife, @adobeacrobat, @adobe").

## 3. Environment knowledge

- **No git credentials in Claude's shell** (https prompts fail "Device not configured", no SSH key, no gh CLI; auto-mode classifier blocks credential probing — don't retry that). Miles pushes from his own Terminal.
- Dev preview: `.claude/launch.json` at `~/Downloads/Claude/` → server name `portfolio-dev`, port 5173, runs `npm --prefix portfolio-site run dev`.
- Thumbs pipeline: `ffmpeg -ss 1 -frames:v 1 -vf scale=480:-2` per mp4, mirrored path `.mp4→.jpg` under `public/thumbs/`.
- Path convention: data keeps Miles's local `~/Downloads/...` strings verbatim; `srcOf()/thumbOf()` map them to `/reels/` + `/thumbs/` at render.

## 4. Open — Miles decides (do NOT invent)

1. **Campaign playlists** (e.g. "Be You Season 1/2/3"): data has only 2 "Be You" reels (Em Siegel, Imran, both in Evergreen Producing). Restructuring into seasons needs Miles's reel→season mapping; the `portfolio` array shape already supports any grouping.
2. **Role retags:** `EVENT_ROLES` defaults were best-guess (MAX LA + UC + Upworthy = "Created, produced & hosted"; Cannes + Evergreen = "Produced"; rest = "Concepted, scripted, hosted & creatively directed"). Miles verifies per playlist — résumé-grade claims, one string each.
3. **Push** (see Status). After push, spot-check live: video plays on Vercel (496MB static assets — expected fine, unverified in prod).

## 5. Decision log (don't undo)

- IG iframe embeds KILLED (fragile) — never reintroduce; mp4s are local files by design.
- Mint = #14E39A now (Miles overrode his own locked #5DE8C5).
- Capabilities card links still point at IG posts — "keep link" read literally; only change if Miles asks.
- `plays: "0"` rows display "0" — data verbatim rule.
- One `<video>` element ever; element is playback source of truth.
