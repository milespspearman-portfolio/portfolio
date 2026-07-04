# Personal Content Scout — for a "Personal" Playlist on the Portfolio Site

**Date:** 2026-07-04 · **Scope:** @milesmusicmedia (jazz IG), @miles.spearman (Behind the Vision only), local YouTube evidence.
**Primary sources:** `reels_work/manifest.json` (59 reels, Apify), `@milesmusicmedia-project-docs/WINNERS-VERBATIM.md`, `FULL-PLAN-2026-07-03-1841.md`, `miles.spearman/` folder. No invented numbers.

---

## 1. Top 12 @milesmusicmedia reels by plays (manifest.json)

**Big finding: all 59 reels already exist as local mp4s** in
`…/outputs/reels_work/videos/` (620 MB, named `NN_SHORTCODE.mp4`, 720×1280).
Every top-12 file verified on disk (4.1–14 MB each). Full base path:
`/Users/milesspearman/Downloads/Claude/local-agent-mode-sessions/b21e4918-4c24-4acb-875e-331863a38c75/f63a9189-061b-4501-826f-fea68424f196/local_66f9c5db-c35e-4e98-b195-04085bcb58f4/outputs/reels_work/videos/`

| # | Reel (slug / ledger name) | Plays | Likes | Date | URL (instagram.com/p/…) | mp4 on disk |
|---|---|---|---|---|---|---|
| 1 | happy-100th-birthday-to-the-legendary (MD-100th "Four" anniversary) | 40,037 | 3,742 | 2026-05-25 | DYwEdpmIGwt | YES (49_) |
| 2 | three-people-told-three-different-stories (In Walked Bud) | 25,819 | 1,560 | 2026-04-06 | DWxVESoDCR5 | YES (36_) |
| 3 | orinithology-was-written-by-a-trumpet (Ornithology, pinned) | 20,633 | 1,160 | 2026-04-21 | DXaB8HAkn42 | YES (55_) |
| 4 | donna-lee-is-one-of-my (Donna Lee, pinned; channel-best 334 shares) | 19,986 | 1,320 | 2026-02-22 | DVDOzkiCOJ7 | YES (56_) |
| 5 | don-t-forget-to-follow-milesmusicmedia (follow-CTA / Sonny-wave tribute) | 19,526 | 1,784 | 2026-05-26 | DYy-G16IFKZ | YES (50_) |
| 6 | charlie-parker-wrote-this-in-1945 (Confirmation) | 18,925 | 1,081 | 2026-03-12 | DVxcAn_jWt3 | YES (19_) |
| 7 | the-most-famous-jazz-songs-are (Contrafacts; channel-best 70 comments) | 15,403 | 824 | 2026-04-04 | DWsh2AHCF1z | YES (41_) |
| 8 | miles-davis-might-be-a-thief (Four, 73s re-cut) | 13,113 | 823 | 2026-03-05 | DVfdB5aDRDA | YES (09_) |
| 9 | what-s-the-difference-between-the | 13,093 | 860 | 2026-03-09 | DVp_PjbiHwO | YES (22_) |
| 10 | now-watch-again-what-color-was (Ornithology "watch again" re-hook) | 7,328 | 421 | 2026-05-02 | DX03tWKORZB | YES (44_) |
| 11 | ornithology-was-written-by-a-trumpet (Ornithology, first cut) | 6,692 | 367 | 2026-04-21 | DXaBNKyEoDF | YES (38_) |
| 12 | guess-who-i-ve-been-listening | 5,751 | 301 | 2026-05-29 | DY8JAhlvSX_ | YES (58_) |

Notes: #10 and #11 are variants of #3 (same tune) and #8 is a variant of #1's subject —
a curated playlist probably wants ~8 unique pieces, not all 12 rows.
Sibling `thumbs/` folder has 8 candidate cover frames + contact sheets per reel (720×1280 JPG).

### Cross-check vs. winner ledgers
`WINNERS-VERBATIM.md` names 6 winners + the MD-100th peg; all 7 match manifest plays **exactly**
(In Walked Bud 25,819 · Ornithology 20,633 · Donna Lee 19,986 · Confirmation 18,925 ·
Contrafacts 15,403 · Four 13,113 · MD-100th 40,037). `FULL-PLAN` spot-check independently
confirms "WINNERS' 7 core stat rows match Apify exactly." Only variance: FULL-PLAN cites the
Ornithology re-hook at 6.6K (earlier capture); manifest says 7,328 — use manifest.
Caution from FULL-PLAN: WINNERS-VERBATIM transcripts contain ~9 garbled ASR proper nouns —
verify any names before putting text on the site.

---

## 2. @miles.spearman — "Behind the Vision"

**Verdict: no posted "Behind the Vision" content exists.** It is a *stalled, unshipped idea*:
"Behind the Vision / Behind the Shoot — LCC," a producer-process video for the Producer's
Playbook pillar (format modeled on sarinasoriano's run-and-gun breakdown). It stalled because
Miles never supplied the LCC shoot details or footage. Evidence:
- `miles.spearman/chat-scrapes/2026-06-29_behind-vision-lcc-shoot.md` — "IDEA (stalled)… No SCRIPT."
- `miles.spearman/digests/2026-06-29.md` §3 — "stalled at the gate."

The account's actual local dataset (`miles.spearman/data/apify_instagram-reels_2026-06-27.json`,
12 reels + `ALL-TRANSCRIPTS-miles.spearman.md` + `miles.spearman_reels_transcripts_2026-06-27.md`):
zero captions mention "vision." The 12 posted reels are Adobe-producer content (channel intro 337
plays, T-Pain pitch story 365, Creative Apprenticeship 264, Premiere Color Mode 417, Summit/NAB
BTS 1,302 — the account's best, plus tutorials), all sub-1.4K plays. No local mp4s for these —
JSON has (expiring) CDN videoUrls only.

Where I looked: `/Users/milesspearman/Downloads/Claude/` (recursive name + `grep -ril` on
json/md/csv/txt), one level of `~/Downloads/`, `miles.spearman/` folder tree, skill files.

---

## 3. YouTube (local evidence only)

No local YouTube videos, stats, or data files found. Only branding assets in `~/Downloads/`:
"YouTube profile and banner.pdf," "youtube logo.jpg" — evidence a channel identity exists,
nothing more. Defer to the live-stats agent.

---

## 4. What a "Personal" playlist can truthfully hold TODAY

With zero new downloads, a "Personal / Jazz" playlist is fully buildable today: all 59
@milesmusicmedia reels are already on disk as mp4s, so the top ~8 unique winners (MD-100th 40K,
In Walked Bud 25.8K, Ornithology 20.6K, Donna Lee 20K, Confirmation 18.9K, Contrafacts 15.4K,
Four 13.1K, plus what's-the-difference 13.1K) drop straight into the existing player with real
play/like counts and ready-made cover frames from `thumbs/`. The only caveat is quality: sources
are 720×1280 with some burned-in IG captions. By contrast, a "Behind the Vision" lane for
@miles.spearman cannot ship — the concept was never filmed or posted; the account's 12 real
producer reels exist only as stats + transcripts locally (no mp4s), and none is a Behind the
Vision piece. If Miles wants any @miles.spearman content on the site, the mp4s must be fetched
first — and "Behind the Vision" itself must first be made.
