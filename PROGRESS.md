# Portfolio Site — Progress Log

## 🔄 HANDOFF POINT — fresh session starts HERE (session 5, Jul 4–5 overnight)
**Everything through commit `e3ff732` is PUSHED and live.** Reads: CLAUDE.md → this block → COPY-PRINCIPLES.md → research/PORTFOLIO-PATTERN-SPEC.md (rule 15 = the timeline lens).

### UPDATE (later Jul 5) — Brand Partnerships playlist SHIPPED
Found the last 2 shortcodes via Chrome/Google (GSW `DKAz21sPv0q` @adobe, Photoshop Archives `DVgpCMOkduU` @photoshop — Russell + Matthew Richmond). Ran Apify (`apify/instagram-scraper`) → downloaded 5 mp4s + ffmpeg thumbs + audio-checked (all have audio) → added a new **"Brand Partnerships"** Evergreen playlist (NWSL Creator Club **2.7M**, Marvel Eyes of Wakanda 299K, GSW Creative Threads 225K, Building Murals 243K, Photoshop Archives 85K) with real Apify play counts + per-reel roles ("Produced" only on the 2 Miles produced) → 5 Notion rows in 🎬 Miles Portfolio Links. Site now **89 reels / 27.6M plays**; timeline auto-picked it up (node under 2025). **NFL Kickoff `DOPM4FmkpE_` skipped** — it's a graphics carousel (Sidecar, no single playable video); revisit if Miles wants it as a poster+link entry. Copy: bio + MAX card now say "Social Creative Studio" (his pick). STILL BLOCKED: YouTube-under-Miles-Music (vidiq out of credits).

### Shipped session 5 (all inline, pushed, verified)
- **Mobile About fix** (`807de91`): killed the swipe-synced flipping video tile that dominated ≤700px and buried the text; kept the swipe-WORD text animation; **static headshot now at the bottom** of the About card. DOM-verified: text renders, no console errors.
- **CareerTimeline — vertical-spine timeline** (`414f27f`, review fixes in `f54390d`): NEW `<section id="timeline">` directly under Selected Work (#work), **ADDITIVE** (libraries kept, per Miles "not sure I want to replace yet"). 9 pro work-units newest-first, sticky red year markers (2026/2025/2024) with a derived "{projects} · {reels} · {plays}" density line, category-colored nodes (mint=Events, gold=Evergreen), **tap-to-expand-and-play-in-place** (one `<video>` ever), other-reels chip strip, "Open in full player" ms-play handoff. Jazz fenced out at the data layer. Spec: research/TIMELINE-DESIGN-DECISION.md (decided by an opus+sonnet design workflow).
- **Reviews applied**: recruiter-lens (bucket by MODAL year so '25 events sit under 2025 not 2026; poster == played reel; reel count in density line) + mobile-design (sticky year below nav + safe-area; touch tap-to-play hint; chip momentum/edge-fade; 44px footer links; reduced-motion rail quiet; 240px video).

### The 84→100 video engine — state
- **CONFIRMED IG** (research/IG-LINKS-CONFIRMED.md, Apify-ready): Building Murals `DRQpeMIjeCw` (545K), NWSL Creator Club `DNRX89SpIkC`, Marvel Wakanda `DOWitx1Afr1` (@photoshop), NFL Kickoff carousel `DOPM4FmkpE_` (@adobe, Sep 5 2025).
- **Already IN the data** (Miles was right): Iliza = "'26 Summit: Recap"; Eric = "Coolest Job: Eric".
- **Still needed** (Miles drop / deep-scroll): GSW Creative Threads (@adobe), Photoshop Archives w/ Russell (@photoshop — Miles finding), NFL "Made to Create" 484K YouTube (Longform). Google surfaces only mirrors, not the @adobe/@photoshop-owned reels.
- **Apify gate**: greenlit to run Apify → download + folder + Notion **once the IG set is complete**. Not complete (GSW / Photoshop-Russell outstanding), so NOT run.

### Blocked / needs Miles
1. **Drop the last IG shortcodes** (GSW, Photoshop-Russell) + the NFL Made-to-Create longform URL → I Apify the full set, download mp4s + thumbs + Notion rows, add to the `portfolio` array (the timeline auto-picks them up).
2. **YouTube under the Miles Music library** (his ask): correct channel = "Miles Music & Media" (@milesspearman, 1.86K subs, `UCIcilFbIwXOdH1bYFoF632Q`). BLOCKED: **vidiq is out of credits** + YouTube SPA isn't WebFetch-able → needs a credit top-up OR a Chrome pass for the >2K list. Plus a design call: how to surface YouTube in a library that plays local mp4s (link-out rows? — IG iframes were killed as fragile).
3. Session-4 copy calls still open: WIWON "Social Creative Studio" vs bio "Adobe Brand"; Cannes-in-WIWON.

### Tool notes (session 5)
- **vidiq = OUT OF CREDITS** — blocks channel/video stats; this hung a background YouTube agent ~29 min (silent fail). Do external-data work inline or expect hangs.
- Preview screenshots render BLACK whenever a `<video>` is on screen (compositing) — verify via preview_eval / preview_inspect (DOM = authoritative). Reconfirmed.
- @milesspearman YouTube resolves to the JAZZ channel (1.86K subs), NOT the 102-sub "Miles Spearman" channel (lone NAB 199K).

## 🔄 HANDOFF POINT — fresh session starts HERE (session 4, Jul 4 night)
**FIRST READS: CLAUDE.md → this block → COPY-PRINCIPLES.md → research/PORTFOLIO-PATTERN-SPEC.md.** Everything below (session 3 and earlier) is HISTORY; this block wins. **All work through commit `79c469f` is PUSHED and live.**

### Hard lesson this session (don't repeat)
**Background agents die silently.** An Opus description-writer hung 55 min with zero output, blocking the build; two earlier workflows died the same way. RULE: do all FILE-EDIT work INLINE on the main loop. Use agents only for READ-ONLY review/research, and actively check their output-file mtime/size if they go quiet (a stall monitor script lives at scratchpad/agentmon.sh). Miles: "i do not need silent fails today."

### Shipped session 4 (all inline, pushed, verified)
- **Descriptions filled** (the layer Miles noticed missing): 17 `ALBUM_BLURBS` (Audrey squares per drawer album) + ~48 `REEL_DESCS` (caption-sourced, complete-sentences-only, event names kept, R1-cleaned, 0 em dashes). 6 hand-written spotlight lines preserved.
- **Full wall** (OpeningWall): all reels biggest-first, device-sliced (32 desktop / 12 mobile) after R2 found 84 clips the best cards off-top; top 14 (desktop) / 3 (mobile) live video, rest lazy posters. "84 reels · 24.1M" volume claim lives in Selected Work text.
- **Scroll-dissolve**: triad evaporates (eased 1.25x) + veil lifts fully to 0 → reels brighten to tappable. Ref-based, no re-render, reduced-motion safe.
- **About swipe-clip tile**: top-right in the grey card, 9:16 (clamp 84-112px), synced to the swipe word via shared `useSwipeTick`; headshot (`public/headshot.jpg`, 129KB) = resting frame; word→reel map in `SWIPE_REEL_TITLES` (Creative=MAX London Recap/spit take, Producer=Semaphore, Host=3 Things/T-Pain, Director=Kelley, Teammate=Gatorade).
- **Marquees**: JS scroll-advance = auto-drift AND finger-swipeable; poster-on-touch (`_finePointer`), pointerup/cancel resume, overscroll-contain.
- **Mobile fixes (R3)**: player bar sticky + safe-area, Open-on-Instagram un-hidden (glyph) on mobile, 44px tap targets (drawer close/shelf arrows/player buttons via `@media (hover:none)`).
- **Nav Connect = dropdown** (Email stays here / LinkedIn opens new tab); hero cards open the specialty drawer (Popular-tier seed + scroll-to-row), not the player.
- **8 missing videos FOUND** (hunt succeeded) — see below.

### THE 84→100+ ENGINE (Miles's "huge unlock" — the hunt is DONE, awaiting his calls)
`research/MISSING-VIDEOS.md` (in-repo, leak-scanned clean — Miles ruled the featured people public) has 8 verified public URLs, NO downloads yet (his rule):
- **NFL "Made to Create" LCC — YouTube `emLfQR3DPME`, 484K views** (biggest single number he has; + LinkedIn mirror)
- Photoshop Archives (Russell + Matthew Richmond) YouTube `UQUBT0kw3WA` 145K · Iliza backstage `Yppr9COGl0o` · Marvel Eyes of Wakanda `rcKUba3Q93M` · GSW Creative Threads `epGnepZdfbk` · NWSL Kelley `T9Y612yikpU`+IG `DNRX89SpIkC` · Eric Matisoff BTS `q7yZmnS8Tfg`
- **NOT pinned:** NFL Kickoff carousel (deep in @adobe grid — needs Miles's shortcode). Skip: Parsons, Adobe Voices Exec (not posted).
- **DECISION NEEDED:** most are YouTube LONGFORM but the site is IG-reels. Add a "Longform/YouTube" library row? Fold in as YouTube-type rows? The NFL 484K deserves prominent placement. Then Miles green-lights Apify → download+folder+Notion per [[apify-reel-download-rule]].

### Miles's open calls (nudge, don't invent)
1. YouTube-longform format (above) + NFL Kickoff shortcode + Apify green-light on the 8.
2. R1 copy flags: WIWON says "Social Creative Studio", About bio says "Adobe Brand" (recruiter-read tension, his pick); Cannes reintroduced in WIWON while the Cannes playlist stays pulled (his call — he added the line deliberately); S2/S3 album blurbs are dry inside-jokes (his words, kept).
3. Double-colon titles (Watercolor/Type Lab Sneaks), bare ":Recap" pair, TacoBell vs Taco Bell — cosmetic.

### Deferred mobile polish (R3 P-items, not blocking)
Bottom-sheet swipe-down-to-dismiss (tap-dismiss already works 3 ways); nav `env(safe-area-inset-top)` + `100svh` on app wrapper; `prefers-reduced-motion` on the CSS animations (cuebounce/eqbar/swipe/float/count-up); full tap-target sweep (seek-bar hitbox, TrackRow ↗). Also: **855MB of raw MP4s is a mobile-data bomb** — compression/HLS is a real separate project. Full detail: `research/MOBILE-BEST-PRACTICES.md` + `research/QA-PROD-MOBILE-PERF.md` (never delivered — re-run).

### Gotcha: device detection is module-load
`_isPhone`/`_finePointer` (Portfolio.jsx ~line 320) read matchMedia ONCE at JS load, so they don't react to resize (a desktop→narrow resize won't re-slice the wall). Correct on a fresh device load; if you need live-reactive, lift to a component with a resize listener.

### Standing agent crew (all Miles-requested, in .claude/agents/)
design-judge (desktop/composition) · mobile-design (≤900px/touch, NEW this session) · recruiter-lens (hiring read) · copy-editor (the gate) · org-scribe (keeps PORTFOLIO-PATTERN-SPEC.md true). Run the relevant ones after any change; they're read-only and cheap.

## (session 3) 🔄 HANDOFF POINT — fresh session starts HERE (session 3, Jul 4 late)
**FIRST READS: CLAUDE.md → this block → COPY-PRINCIPLES.md.** The session-2 block below is HISTORY — this block supersedes it.

### Shipped session 3 (commits `88d57a9`→`c13db92`, verify pushed: `git status -sb`)
What I Do rebuilt as Audrey cards (Miles's own bodies, fact-checked; titles: On-Camera Hosting / Content Strategy, Concept to Published / Directing & On-Camera Coaching / Producing: Talent Marketing & Employee Comms) · Navin-style meta lines · **SPECIALTY DRAWER shipped** (card click → right drawer / mobile bottom sheet: proof-reel Highlights with derived sub-lines, Play→Work player, card body verbatim below list; `SPECIALTY_REELS` map in Portfolio.jsx; design-judge + recruiter-lens both verdicted BUILD; anatomy in research/NAVIN-PATTERN-ANATOMY.md) · derived posting windows in playlist headers (`fmtWindow`) · hero eyebrow "Social Creative Producer @Adobe | San Francisco" · exec/quick-turn body fix · stale 10K CTA line removed · heading stays "What I Do" (Career Specialties tried + reverted, his call — don't relitigate) · dead SetList deleted · WORKFRONT-BRIEF-COLLECTOR.md built (repo + ~/Downloads copy; budget=PRIVATE prep-only, partners prioritized) · research/UNTAPPED-LEVERAGE.md (15 ranked items).

### THE STANDING PROMISE to Miles (he asked "can I trust you'll finish this")
When he returns with the filled WORKFRONT-BRIEF-COLLECTOR.md:
1. **Ingest it**: every Found line flows into playlist headers (brief line + shoot window + partner credits) THROUGH the copy gate (7 checks + alignment rules). `[PRIVATE]`-tagged budget lines NEVER touch site copy — they're his interview prep; park them in a research doc he can read before interviews.
2. **IG Chrome research**: he says more video links exist to find on his Instagram once Workfront names the projects — use claude-in-chrome on instagram.com (adobe handles + his accounts), match Workfront project names → find missing public reels → add to `portfolio` array with real data. NO Apify scraping (he said so twice).
3. Apply his H1–H4 held-row answers (MILES-COPY-MARKUP §C) + the two real play counts he owes from IG insights ("Defining a Creative Video Interview Collage", "Be You: Em Siegel" — both `plays:"0"` because his export had blanks).
4. Re-run recruiter-lens after ingest; re-run the QA sweep (died twice this session, never delivered research/QA-PROD-MOBILE-PERF.md).

### Miles's queue (nudge, don't build)
Push (session ended 10 ahead) · run the Workfront collector on his other account · H1–H4 answers · 2 real play counts · MILES-COPY-MARKUP rows (mostly still blank) · spotify-shell worth-it verdict (draft PR #1, Vercel preview in PR comments).

### Watch-outs
Card posters on cards 2/4 still show old art until autoplay (design-pass item) · card 1 title = bare "On-Camera Hosting" (his "& Directing" ask superseded by the overlap fix — flag if he asks) · drawer bodies moved OFF card faces (one-tap revert if he misses them) · another chat's dev server may hold the folder (launch.json has autoPort).

## (older) 🔄 session-2 handoff — SUPERSEDED by the block above
**Created:** Jul 4, 2026 · **Last updated:** Jul 4, 2026 (end of session 2, written at 90% context)

**FIRST READS, in order: CLAUDE.md → this block → COPY-PRINCIPLES.md.** (AGENT-PLAN.md is now PARTIALLY STALE — where it disagrees with this block, this block wins.) All copy work runs through COPY-PRINCIPLES (7 checks + Resume & LinkedIn alignment rules).

**Live through `c51ed9a`** — gh push works; Vercel auto-deploys main (~60s). Prod URL: `gh api repos/milespspearman-portfolio/portfolio/deployments` → statuses[0].environment_url (deployment-hash URLs can be auth-walled; find the public alias).

### 0. Single most important rule
Two background agents were IN FLIGHT when this session ended. **Check their output exists before doing anything else; re-run only what's missing. Do NOT redo today's shipped work (§done below).**
1. **spotify-shell prototype agent** — full Navin-style app shell on branch `spotify-shell`, opens a DRAFT PR (Vercel comments the preview URL). CHECK: `git branch -a | grep spotify-shell` + `gh pr list`. Miles SAW a working preview mid-build (sidebar nav+grouped library, search bar, bottom "Press play — 82 reels" bar) so the build got far. If branch/PR absent, re-run from the plan file `~/.claude/plans/composed-booping-salamander.md` Phase 2 + these mid-flight additions: accent = ACTUAL Spotify green #1ED760; Recognition item reads "Be Genuine CMO Global Marketing **Award** Q4 2025" (Reward was his typo); Navin fidelity screenshots at `~/Downloads/Screenshot 2026-07-04 at 4.27.46 AM.png`, `…4.20.32 AM.png`, `…4.14.47 AM.png` (sidebar logo row, SHOW ALL affordances, bottom-bar "Let's Talk · email" right side — don't invent an email); PR body must note main drifted past the branch point.
2. **QA sweep agent** — prod verify + mobile 375px + Lighthouse → `research/QA-PROD-MOBILE-PERF.md`. If the doc is absent, re-run (spec: prod URL via gh deployments, click a shelf card → video plays on prod, mobile full-scroll layout breaks, Lighthouse perf+a11y desktop/mobile, findings as BLOCKER/BAD/POLISH).

### 1. Miles's queue (waiting on HIM — nudge, don't build)
1. **`MILES-COPY-MARKUP.md` (repo root) — his big one.** Every open copy item with each reel's verbatim IG caption + blank **Miles:** lines: 14 jazz slug-titles, Adobe TBD/LOW titles, What I Do card copy, WIWON paragraph rewrite, stale CTA "10K+" line, award display format. When he returns it: apply EVERYTHING in one pass through the copy gate. Caption-sourced flags inside: "Mansa" is really **Manasa Hari**; the miles.spearman reel's cover art says "BEHIND THE POST with Miles, EP. 1" (vs site "Behind the Product" — he picks canonical, row A15); Summit Over/Under caption = AI-study stats game.
2. **Shell worth-it verdict** once he opens the PR's Vercel preview. Merge-and-reconcile / iterate / kill — his call. Main drifted after the branch cut (Adobe intro killed, nav reorder, Spotify green, closer) — reconcile on merge.

### 2. Tomorrow's build queue (his asks, not yet built)
1. **Wall ring composition** — his ask: reels SURROUND "Creative. Producer. Musician." with a clear center so attention pulls middle. "Curious if that would be a better design choice — if not, keep how it is" → build behind judgment, compare, show him. Session ended mid-start.
2. **Create the design-judge agent** — his explicit ask ("add a design agent… so we are always thinking of designing"). Write `~/Downloads/Claude/.claude/agents/design-judge.md`: verdict-first design critic loaded with his taste record (Spotify green #1ED760 after 3 pale mints, red #FA0F00 stat numbers from his EOY deck, gold #F5C518 Musician, kills fake/pale/message-repetition, likes real video + play-count proof + organized detail + restraint, Navin reference). The Write was interrupted by session wrap, NOT rejected on merits — reconfirm in one line, then create and use it on the wall-ring question.
3. **Run recruiter-lens on R3** (new standing agent — first official revision final; ~/Downloads/Claude/.claude/agents/ now holds design-judge + copy-editor + recruiter-lens, all Miles-requested). Then QA fixes per the findings doc (hero-row viewport pause = known perf debt, likely top item).
4. Logo strip (challenge-pass BUILD verdict, AGENT-PLAN §7b) — still greenlit-in-principle, unbuilt.
5. Standing decisions still open: Be You seasons, YouTube 199K placement, role-line verification (Cannes/"hosted" flags in COPY-INPUTS §5), Summit-2026-own-playlist question, case-study `context` lines (research/COPY-PATTERNS-CASE-STUDY.md, his markup pending).

### 3. Shipped today — session 2, Jul 4 (all pushed, don't redo; details in round notes below + git log `3865924..c51ed9a`)
Titles applied + Dave/Bowen/Mansa→Evergreen · copy-inputs fold (8 rules in COPY-PRINCIPLES) · 50-portfolio freelancer scan + challenge pass · stat badges KILLED · resume = View (new tab) · About = "About the {swipe-word}." (Creative/Producer/Host/Director/Teammate) · red EOY-style stat stack (23.6M plays / 171.1K likes / 82 videos, all derived incl. TOTAL_LIKES) · Off the Clock = ALL @milesmusicmedia reels ≥4K (21 jazz; 14 new mp4s+thumbs in public/) · playlist renames: Behind the Vision→Behind the Product→**"Miles.Spearman"** (reel title still "Behind the Product") · three libraries **Events / Evergreen / Off The Clock** as shelf rows + sidebar headers (LIBRARY_OF map; UC+Upworthy in Evergreen, Miles approved) · newest-first sort · What I Do cards play their reels + click deep-links to playlist (IG links dead) · WIWON card (resume-drafted copy, [MILES: edit me]) + LinkedIn button under it · Adobe-intro section KILLED (his 7th-time doubt; HeroRow now bridges shelves→Work) · nav = Work · What I Do · About · Connect · closer = "And yeah, I'm also a professional trumpet player in San Francisco." with green link on "professional trumpet player" → plays MMM playlist · **accent = ACTUAL Spotify green #1ED760** (supersedes every mint; "stay distinct from Spotify" rule DEAD) · MILES-COPY-MARKUP.md built (26/27 rows with real captions).

### 4. New env/tool knowledge (session 2)
- Jazz captions: vidiq profile tool caps at ~6 reels, NO pagination — use `~/Downloads/Claude/milesmusicmedia-chatsweep/data/apify-enriched_2026-07-03.json` (all 21 by shortcode). Adobe captions: `~/Downloads/Claude/miles-portfolio-reels/PORTFOLIO-LINKS.md` blockquotes.
- Preview screenshots of the wall render BLACK (video compositing) — verify via preview_inspect / innerText evals instead.
- Writing files via python/bash invalidates Edit-tool freshness — Read once before the next Edit.
- LibreOffice mangles TITLE-PROPOSALS tables (escaped `#`, curly quotes, double spaces) — his cell edits win; collapse whitespace, normalize ’ quotes, flag suspect facts (the "MAX 2025" year flag paid off).
- `.claude/launch.json` has autoPort + vite reads PORT env — second session's dev server coexists fine.
- Old handoff said "no git creds" — DEAD: gh auth works, push after every landed commit.

## (older session-2 notes below — SUPERSEDED by the handoff block above, kept as history)

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
5c. **Miles round 4 (approved plan, same day):** page order now wall → **What I'm Working On Now** (Navin-style mint-border card; copy drafted from shipped-resume claims, **[MILES: edit me]**) → **PlaylistShelf** (his option-C pick: all 14 playlists as Navin-style cover-card carousel, ‹ › arrows, scroll-snap, newest-first, Off the Clock divider, click = play track 1 in player) → Adobe intro → Work → **About (relocated here)** → What I Do → CTA. About heading = "About the {swipe-word}." (eyebrow gone); skills chips DELETED; GPA out of bio; `portfolio` runtime-sorted newest-first (Off the Clock pinned last); top-4 highlights row + HighlightCard DELETED (shelf supersedes). NEXT = Phase 2 per plan: `spotify-shell` branch prototyping the full Navin app shell (sidebar nav + library, search, persistent bottom bar, Recognition w/ his "Be Genuine CMO Global Marketing Reward Q4 2025" [MILES: confirm name]) → Vercel branch preview for his worth-it call.
5b. **Miles round 3 (same day):** About counter restyled to his EOY-deck reference (`~/Downloads/numbers.png`, slide "What On Camera Looked Like This Year"): stacked NUMBER-in-red (#FA0F00) + descriptor rows — 23.6M plays / 171.1K likes / 82 videos, all DERIVED (likes parsed from sub strings via `likesNum`/`TOTAL_LIKES`). What I Do cards now PLAY the backing reel (setList mp4, muted loop, poster = old jpg, viewport-paused via usePlayWhenVisible) and click deep-links into the topic playlist in the Work player (ms-play + #work anchor) instead of IG links — supersedes the "keep IG links" decision-log line, Miles asked. Card copy proposals agent → research/WHAT-I-DO-COPY-PROPOSALS.md (his markup next; his sample retitle "On-Camera Hosting & Directing" included).
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
