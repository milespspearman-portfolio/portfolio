# AGENT PLAN — finish the portfolio site (written at 90% context, Jul 4 2026)

For the next Claude session + subagents. **Read `CLAUDE.md` (state, rules, locked copy) and `PROGRESS.md` (round log) FIRST.** Everything below is Miles-approved direction, not speculation. Repo = this folder; single file `src/Portfolio.jsx`; dev server config at `~/Downloads/Claude/.claude/launch.json` (`portfolio-dev`, port 5173). **13 commits UNPUSHED — Miles runs `git push origin main` (Claude's shell has no GitHub credential; do NOT credential-hunt).**

## State as of pause
- Opening wall: 16 muted looping reels + "Creative. Producer. Musician." (Musician = gold #FFD447 — pink was "horrendous", gold = Miles's idea, UNREVIEWED by him). Sub-line = derived "{N} videos · {plays} cumulative plays · inside and outside of work".
- Hero row of playing cards RESTORED below stat badges (Miles: "beautiful, don't lose it").
- Work section = Spotify player, 14 playlists incl. Off the Clock (Behind the Vision + 7 jazz). All local mp4s. Mint = #0FE07C.
- What I Do cards = video frames (park mid-sip / Kelley / Mansa red / Fonts hosting).

## Tasks, in priority order

### 1. Color pass on the opening triad (Miles-flagged, cheap)
Haiku agent + Claude-in-Chrome (or Preview tools) on localhost:5173: screenshot opening, judge "Musician." gold #FFD447 vs 2–3 alternates (#F5C518, #FFCC33, warm amber) against bg #0A0A0A / mint #0FE07C. Criteria: legibility at 110px, doesn't fight mint, feels premium not warning-sign. Report side-by-side, Miles picks. One-string change in `OpeningWall`.

### 2. "What I Do" section redesign (Miles: "still weak" — needs BRAINSTORM, not tweaks)
Opus agent, judge-panel pattern (3 independent concepts → score → synthesize). Constraints: locked card copy (titles/bodies/link labels verbatim), video-frame imagery stays, palette fixed. Directions Miles hinted: cards feel static next to the live hero — consider hover-plays-video cards (mp4s already local per card subject), bigger editorial layout, or stat-badges-integrated. Deliver mockup screenshots via Preview before touching main.

### 3. Opening wall interactivity ("add more on the top so it can be interactive… wow")
Ideas Miles reacted to: cards respond to cursor (parallax/magnet), click-through already works. Keep perf guardrails: IntersectionObserver pause (wall has it; ADD IT to the restored hero row — currently those ~16 videos play unconditionally = known perf debt), mobile trim (.wall-card:nth-child(n+9) hidden ≤900px).
Also queued idea from Miles: "if they wanted a hype type of video they could have words" — interpret: a toggle/CTA in the opening for a hype-reel experience (e.g. auto-playing sequence with big words). UNSPECED — get his one-line confirm before building.

### 4. Apply title cleanups
`TITLE-PROPOSALS.md`: Miles marks rows → sonnet builder edits `title:` strings only in the `portfolio` array. Never touch mp4 paths/subs/plays.

### 5. Campaign playlists (blocked on Miles)
Be You seasons etc. — needs his reel→playlist mapping. Array regroup only.

### 6. Post-push production QA
After Miles pushes: Chrome agent on the Vercel URL — 3 reels play (one per year folder), resume PDF downloads, opening wall renders, mobile 375px flow, no 404s in network log.

### 7. Figma design-fidelity pass (connected & verified — account milespspearman, view seat)
Unofficial Spotify Design System file `eL9fpJVwiuiGoCkZYnZJHd` node 12-1339. `get_variable_defs`/`get_design_context` → harvest spacing/type/radius tokens; apply ONLY layout polish, never Spotify's colors (Miles's palette locked).

### 8. Known debt
- Hero row videos lack viewport pause (see §3).
- `EVENT_ROLES` defaults unverified by Miles for the 12 Adobe playlists (résumé-grade claims).
- YouTube 199K outlier (`YyvrjaG2kBw`) still unplaced — Miles decides.
- Two h1s (opening + hero) — merge to h1/h2 in any cleanup pass.
- Spit-take frame doesn't exist in the 4 MAX London reels on-site; if Miles supplies the file, swap video-production.jpg (2 min).

## Working rules for every agent
Locked copy verbatim; data facts never invented (stats on screen are DERIVED); one commit per task, don't push; verify in Preview before claiming done; Miles reviews anything user-visible; update `PROGRESS.md` per round.
