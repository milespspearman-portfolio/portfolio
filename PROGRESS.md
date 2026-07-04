# Portfolio Site — Progress Log

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
