# Challenge Pass — the current layout argued AGAINST, with peer data

**What this is:** Miles asked for the current page order/design to be adversarially challenged using real peer-portfolio data once the freelancer scan existed. Scan = `FREELANCER-LIST-PORTFOLIO-SCAN.md` (50 sites read, 100-person sheet). Also draws on `FIELD-SCAN-CD-PRODUCER-PORTFOLIOS.md` (11 sites). Each argument: the attack, the evidence, then a verdict. Verdicts are recommendations — Miles decides.

**Current site (what's being attacked):** opening wall (16 autoplay muted reels + "Creative. Producer. Musician.") → About → Adobe intro (badges/stats/hero cards) → Work (Spotify-player library, 14 playlists, play counts everywhere) → What I Do cards → CTA. Nav: Services · About · Work · Connect.

---

## Attack 1 — Work is buried under two sections nobody else puts first

**The attack:** ~30 of 46 peers put a work grid IMMEDIATELY under a one-line tagline. Nav order is near-universal: Work first, About second-to-last, Contact last. **Zero of 46 sites put About before Work.** Miles puts About AND an Adobe-intro section between the opening and the Work player. A recruiter skimming 40 portfolios gives each one seconds; every scroll-length between them and playable work is attrition.

**The defense:** the opening wall IS work — 16 real reels playing on load, each click-through deep-links into the player. Arguably Miles satisfies "work first" harder than a thumbnail grid does.

**The hole in the defense:** the wall reads as *backdrop*, not *catalog*. Nothing on it says "this is the work, browse it." A backdrop of your work is not the same signal as work-you-can-browse; peers' grids are labeled, clickable inventory.

**Verdict: CHANGE (cheap, reversible).** Two moves, either or both:
1. Reorder nav to `Work · Services · About · Connect` — one-line change, matches the 46-site convention exactly.
2. Swap page order to opening → Work → Adobe-intro → About. NOTE: current order was Miles's own reorder (`6c60184`), so this specifically needs his call — but the data says his order is the field's least-common denominator, found ~0 times in 50 sites.

## Attack 2 — The metric inversion is now a 49-to-1 deviation

**The attack:** exactly ONE person across the whole freelancer sheet (Benjamin Apple, writer/producer) shows any performance number. Zero of 17 editors/DPs, zero of 10 production companies, zero CDs. The field carries credibility via client names (~35 of 47 sites) and logo walls — not stats. Play counts on every row, every card, every wall tile risks reading "social-metrics person" to a craft-culture hiring manager, and any number invites "what was paid vs organic?" scrutiny that a clean brand name never does.

**The defense (already on record):** Miles inverts deliberately — he's selling growth outcomes for staff roles, not freelance craft vibes. COPY-PRINCIPLES.md codifies it; the earlier field scan marked play counts a KEEP differentiator. In a stack of 40 metric-silent portfolios, being the one with receipts is the memorable move — same logic as Apple being the one memorable outlier in this scan.

**Verdict: KEEP — but with one honest risk flag.** The inversion is a bet on WHO reads the site. For social/growth staff roles (the actual target) it's right. If Miles ever points this site at craft-CD or agency-producer roles, this is the first thing to soften. No change now.

## Attack 3 — 16+ autoplay videos where the field uses GIF thumbnails

**The attack:** only 3 of 46 sites lead with a playable reel; even editors mostly use stills or animated GIF thumbs linking out. Miles autoplays ~16 wall videos PLUS a restored hero card row that plays unconditionally (known perf debt, AGENT-PLAN §3/§8). The field's restraint isn't timidity — it's fan noise, battery, and first-paint time on a recruiter's laptop.

**The defense:** local mp4s, muted, IntersectionObserver pause on the wall; video-as-proof is the site's structural advantage (proof adjacency, check #5).

**Verdict: KEEP the concept, PAY the debt.** The differentiator survives only if it never janks. Concrete: add the missing viewport-pause to the hero card row (already queued), and consider capping simultaneous playing videos (~8) on smaller viewports (mobile trim exists; mid-range laptops are the gap).

## Attack 4 — "Services" first in nav is agency-speak nobody in the field uses

**The attack:** peers barely have a Services page at all — they ARE the service. Leading nav with "Services" frames Miles as a vendor shop, while the site's actual pitch (per COPY-PRINCIPLES) is a staff hire. The field's nav-first slot goes to Work in effectively every readable site.

**Verdict: CHANGE — fold into Attack 1's nav reorder.** Consider renaming "Services" → "What I Do" to match the section it points at (title already locked copy; the NAV label is not the locked section title — Miles confirms).

## Attack 5 — No client logo/name strip

**The attack:** the single most common trust signal in the scan — client/brand names on ~35 of 47 sites, explicit logo walls on 4+, festival laurels, press logos. Miles has @-handles inside playlist metadata and a marquee (NFL/NWSL/Taco Bell/Gatorade), but no dedicated at-a-glance brand strip near the top.

**Verdict: BUILD (already queued as AGENT-PLAN §7b, peer data doubles the case).** Derive from data already on site — zero invention needed. Placement: under the Adobe-intro badges.

## Attack 6 — The Spotify metaphor itself: 0 of 50 do anything like it

**The attack:** the universal pattern is thumbnail grid → project detail page. A library sidebar + playlists + track rows demands decoding before browsing. Novelty can read as gimmick; the metaphor gates the work behind its own cleverness.

**The defense:** 0-of-50 is also the definition of differentiation. The metaphor natively justifies the play counts (Attack 2), carries the musician identity (triad line, Off the Clock), and the scan shows personality-openers (Machine Shop's clock, Haller's joke bio) are exactly what made sites memorable in a 50-site blur. Structurally it IS grid→detail, restyled.

**Verdict: KEEP — it's the site's identity and Miles built the record around it. But it raises the stakes on Attacks 1/3: the metaphor must never be the thing standing between a recruiter and a playing video.**

## What the scan says Miles already does RIGHT (no change)
- **Per-reel/playlist role attribution** — producer-lane norm (~7 sites explicit: "Shot | Edited | Colored"). Miles's role lines match the pattern; just VERIFY the unconfirmed `EVENT_ROLES` defaults (known debt, résumé-grade claims).
- **Resume access** — 2 sites make CV first-class nav; Miles's About-button PDF is within norm.
- **Work/Personal split** — top-level split on 2 sites; Off the Clock divider = same move, plus it's the human closer the Reddit-narrative note wanted. Locked KEEP anyway.
- **Warm CTA copy** — "Let's chat!"-class copy recurs across the field; "Let's make something." sits right in the register.
- **Short 2-beat case lines (pending Miles's markup)** — only 1 of 50 sites leads with case-study narrative; the field validates thumbnail-first + terse context, which is exactly the COPY-PATTERNS plan.

## Ranked cheap-to-expensive change list (if Miles buys the attacks)
1. Nav reorder: `Work · What I Do · About · Connect` (minutes).
2. Hero-row viewport pause (perf debt, queued).
3. Brand/logo name strip under Adobe-intro badges (queued §7b).
4. Page-order swap: Work above About/Adobe-intro (his `6c60184` reorder argued against by 46-site data — HIS call).
5. Simultaneous-video cap on mid-size viewports.

Nothing here touches locked copy, play counts, Off the Clock, or the Spotify pattern itself.
