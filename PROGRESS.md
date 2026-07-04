# Portfolio Site — Progress Log

## 🔄 HANDOFF POINT (Jul 4 ~mid-day session) — fresh session starts HERE

**FIRST READS, in order: CLAUDE.md → this block → AGENT-PLAN.md → COPY-PRINCIPLES.md** (7 checks + the new "Resume & LinkedIn alignment" rules; ALL copy work runs through both).

**Pushed live through `96f6864`.** gh push works from Claude's shell. Vercel auto-deploys main (~60s).

**DONE this session (don't redo):**
- **Miles's title markup APPLIED** (`3865924`): ~40 retitles from his hand-edited TITLE-PROPOSALS.md; Kelley O'Hara fix; TBD rows skipped; untouched LOW rows keep current title. Per his "NOT MAX" notes, **Dave Werner / Bowen / Mansa reels MOVED from MAX 2025 LA → Evergreen Producing** (now 9 + 12 reels, stats re-derive, verified in browser: playback from new slot works, 0 console errors). "SUMMIT 2026" → "Summit 2026 Recap", parked LAST in Evergreen pending his "where are these?" answer (data has only that one Summit-2026 reel; say the word and it becomes its own playlist). CAPABILITY_REEL_TITLE synced.
- **Copy-inputs job DONE** (`29e1749`): resume + LinkedIn sweeps read from disk (no API pull needed), verbatim extracts → `research/COPY-INPUTS-RESUME-LINKEDIN.md`; COPY-PRINCIPLES.md gained 8 alignment rules (exact Adobe title string, 225k context rule, PDF-cleared numbers list, no em dashes, NDA line, voice rules, jazz-one-line + Off-the-Clock exception).
- **Freelancer scan DONE** (`96f6864`): `research/FREELANCER-LIST-PORTFOLIO-SCAN.md` — 100-person sheet, 50 portfolios read. Headlines: 1/50 shows any metric; ~30/46 lead with a work grid; 0/46 put About before Work; ~35/47 carry client names/logos.
- **Owed challenge pass DELIVERED** (`96f6864`): `research/CHALLENGE-PASS-LAYOUT.md` — 6 attacks with verdicts + ranked cheap-fix list.
- Dev-server note: `.claude/launch.json` now has `autoPort: true` + vite reads `PORT` env, so a second session can run its own preview alongside another.

**Miles's decision queue (nothing below gets built until he says):**
1. **Challenge-pass calls** (research/CHALLENGE-PASS-LAYOUT.md): nav reorder to Work-first (rec: yes), page-order swap Work-above-About (his `6c60184` order vs 46-site data), logo strip greenlight (§7b), video cap on mid viewports. Metric inversion + Spotify pattern + Off the Clock = argued and KEPT.
2. **Title leftovers** (TITLE-PROPOSALS.md): TBD rows (MAX Miami 6 + 8, Summit Over/Under — his cell has two candidate titles), LOW rows he left (Acrobat, Navin, Russell), his open Qs. Also flag: his "Adobe MAX 2025: In-Office MAX Trivia" title sits on an Oct 2024 MAX-Miami reel (year looks off — one-tap revert if unintended); "TacoBell" vs marquee's "Taco Bell" spelling.
3. **Case-study lines** (research/COPY-PATTERNS-CASE-STUDY.md) — his markup still pending; when it lands, apply through the 7 checks + the new alignment rules (esp. exact-numbers + em-dash + NDA rules).
4. ~~Stat-badge collision~~ **RESOLVED by Miles ("do we want this? fifth time asking")**: 3-badge stat grid REMOVED from Adobe-intro (matches resume-rule kill). Also shipped on his word: resume button now VIEWS the PDF (new tab) instead of downloading; About section eyebrow → "About the Artist". His trumpet-player closer line: 3 drafts offered, awaiting his pick (current closer line untouched until then).
5. **Miles round 2 (same day):** Off the Clock now = ALL @milesmusicmedia reels ≥4K plays from `reels_work/manifest.json` — 14 added (21 jazz total, playlist 247.7K plays, site 82 reels · 23.6M). NEW TITLES = mechanically cleaned caption slugs, Miles retitles at will. "Behind the Vision" → **"Behind the Product"** everywhere (playlist, reel, roles, pins; mp4 paths unchanged). About the Artist: swipe-word stack (Creative→Producer→Host→Director→Teammate, same-direction, 2.2s) + scroll-triggered count-up of derived TOTAL_PLAYS. Wall one-liner under triad DELETED (was unreadable); its message lives at the About counter now. Both LinkedIn buttons hover → LinkedIn blue #0A66C2. FLAG for Miles: CTA jazz line still says "10K+ views per reel" — stale now that 4K-tier reels are visible (locked copy, his edit); Musician-yellow animate alternative NOT taken (counter-at-About chosen), available if preferred.
5. Standing: What I Do concept pick (research/WHAT-I-DO-CONCEPTS.md), role-line verification per playlist (now with COPY-INPUTS flags: Cannes mentions, "hosted" strings), Be You seasons, YouTube 199K placement.

## ✅ ROUND 9 — SHIPPED (commits `6fc19e0`→`0cb6f69`): opening wall (16 live muted videos under "Creative. Producer. Musician." — his triad, my layout), mint→#0FE07C, card frames finalized (park mid-sip / Kelley / Mansa red — spit-take literally doesn't exist in sampled frames of all 4 London reels). Figma connected+verified (view seat), token harvest deferred to design pass. 11 commits UNPUSHED.

## (superseded in-flight notes below — kept for context)

Miles's round-9 asks, state at pause:
1. **Green STILL too pale** (3rd flag; #5DE8C5→#14E39A wasn't enough). Next: bump `C.mint` more vivid/green (candidate ~#0FE07C; Spotify's own is #1ED760 — stay distinct). Also update: `GRADS[0][1]` (#14E39A literal) + HeroCard hover border `rgba(20,227,154,0.45)`. NOT DONE YET.
2. **Card reassignments** (data in `capabilities`, files in `public/cards/`):
   - Directing & Coaching → best **Kelley O'Hara** frame (person on camera; card copy says "professional athlete"). 
   - Video Production → **MAX London PARK SPIT-TAKE** moment (Miles is sure it exists; first agent scanned only fonts+recap at 4s — now have all 4 London reels dense).
   - Content Strategy → most **EYE-CATCHING** frame across Mansa / Dave Werner / Bowen (Miles: "be you... mansa, dave and bowen").
   - Hosting keeps Fonts Creator f_03 (already shipped).
3. **Candidate frames EXTRACTED** to scratchpad (dies with session!): `cardframes2/{kelley 10, castle, firefly, recap-dense, fonts-dense, bowen 20}` = 167 imgs + older `cardframes/{dave-werner, mansa}`. Re-extract in ~60s if gone (from `portfolio-site/public/reels`): `ffmpeg -y -i <mp4> -vf "fps=1/3,scale=360:-2" -q:v 6 out/f_%02d.jpg` (fps=1/2 for the 4 MAX-London reels).
4. **Next action queued:** launch ONE sonnet vision agent → 3 picks (spit-take, Kelley, eye-catching BeYou) with face-center-y %s → re-extract picks hi-res (`-ss <(N-1)/fps> -vf scale=720:-2` → `public/cards/`) → update `imgPos` in `capabilities` → build → commit.
5. **Figma**: Miles connected his Figma + gave the Unofficial Spotify Design System file (`eL9fpJVwiuiGoCkZYnZJHd`, node 12-1339, dev mode). UNCHECKED — try figma MCP tools (ToolSearch "figma"); if auth works, harvest spacing/type tokens for the design pass. Palette stays Miles's.
6. **8 commits local, UNPUSHED** — Miles runs `git push origin main`.

One line per shipped round + what a subagent can sharpen next. Full state/rules: `CLAUDE.md`. All commits local until Miles pushes (`git push origin main`).

## Shipped (Jul 4, 2026 — one session)

| Round | Commit | What |
|---|---|---|
| 1 | `ab2233a` | Work section rebuilt as Spotify-pattern player (12 event playlists, track lists w/ real plays, single `<video>`, transport bar, highlight cards). Resume button, @milesmusicmedia CTA link. IG iframes deleted. |
| 2 | `2a9844e` | All 60 Adobe reel mp4s (496MB) + ffmpeg poster thumbs into `public/`. |
| 3 | `2f771ae` | Mint #5DE8C5→#14E39A (pale→punchy), "Event"→"Playlist", per-playlist role lines, brands-as-artist (handles in header + player bar), CLAUDE.md handoff. |
| 4 | `cce7303` | Emoji tiles → real video-frame covers (top-played reel per playlist). CTA button pink→mint. |
| 5 | `9895e85` | In-house role overrides (Dave Werner, Bowen, Mansa, Kelley O'Hara) + per-reel role in Now Playing. |
| 6 | `925cfe9` | "Off the Clock": Behind the Vision (ProRes master→80MB H.264, live IG stats 287·21·Jul 3) + Miles Music Media (7 jazz winners 13.1K–40K, mp4s from local library). |
| 7 | (carousel) | Hero reel carousel (11 top reels, auto-scroll, deep-links into player), face-aware thumbnail crops (`object-position 50% 20%`). |
| 8 | (this) | What I Do cards: emoji→real frames (sonnet vision agent picked from 111 extracted candidates), 1-Person Production role line on personal playlists, PROGRESS.md. |

## Agent-produced docs
- `TITLE-PROPOSALS.md` (opus) — 60 title cleanups: 42 HIGH / 8 MED / 10 LOW awaiting Miles.
- `PERSONAL-CONTENT-SCOUT.md` (general) — jazz winners + mp4 locations + miles.spearman audit.

## Sharpening queue — delegate per CLAUDE.md §4b
1. **Apply approved titles** (sonnet builder) — after Miles marks TITLE-PROPOSALS.md.
2. **Card frame upgrades** (sonnet vision) — Coolest Job pick is weak (Miles small in frame; only usable frame found). Re-run with denser extraction (`fps=1/2`) on Coolest Job + hunt the MAX London water-spit moment (not found at 4s sampling).
3. **Design-fidelity pass** (opus + screenshots) — compare against Spotify design refs Miles supplied: developer.spotify.com/documentation/design + Figma community file 1228124136292619260. Keep MILES's palette; borrow spacing/hierarchy only.
4. **Mobile QA** (claude agent + Chrome) — full flow at 375px after push.
5. **Prod verify** (claude agent + Chrome) — post-push: 3 reels play on Vercel, resume downloads, no 404s.
6. **Reddit-inspired narrative pass** (opus, Miles-gated) — groompl post takeaway: scroll-story + personal-life closer reads human; Miles's equivalent = Off the Clock section + About performing line. Optional copy/motion polish only, locked copy stays.

## YouTube (decided data, unplaced)
Personal channel outlier: "what's going on with @AdobeVideo at #NAB2026?" — 199K views (Apr 19 2026, ID YyvrjaG2kBw) = 97% of channel views. Miles decides if/where it appears.
