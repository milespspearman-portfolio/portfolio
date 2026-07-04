# Navin drawer pattern — observed live Jul 4 2026 (navinthepmm.netlify.app)

Captured by driving the live site in Chrome. This is the interaction Miles wants his Career Specialties cards to have.

## The interaction

Home shows a "Career Highlights" card shelf (one card per employer: logo art, brand name, role subtitle, years · category meta). **Clicking a card slides a RIGHT-SIDE DRAWER over the page** (page dims behind; × top-right closes). No navigation, no playlist jump.

## Drawer anatomy, top to bottom (Adobe card observed)

1. **Header**: square brand art (~96px) + eyebrow `EMPLOYER` + huge brand name "Adobe".
2. **Action row**: green Play circle · Follow (pill) · Share (pill) · heart.
3. **Role line, bold**: "Sr. PMM, Firefly → Sr. GTM Strategist, Express" — the arrow shows promotion inside one employer.
4. **Meta line**: "2025–Present · Firefly Aug–Dec 2025 · Express Dec 2025–Present" + a category chip ("Creative AI").
5. **Summary paragraph** with a green left border (Spotify-verified-artist-bio energy): 3 sentences, numbers-forward, first person. Observed text pattern: scale hook ("Adobe reaches nearly one in ten humans on the planet every month"), then "I lead GTM for Express, now used by 99% of US Fortune companies and growing MAU 3x year-over-year…", then a prior-chapter line ("Before Express, I led GTM for Firefly… grew ARR 75% year-over-year and earned Google Play Best App of 2025").
6. **"Highlights" — the core**: a NUMBERED TRACK LIST of projects. Each row = number · small square art · **project title** ("Adobe Firefly GTM Strategy", "Express Photos Business Strategy", "Firefly Launch Performance", "Partner & Ecosystem Launch"…) · **micro-description sub-line** ("Generative AI launch · 2025", "10x MAU growth ambition · $XXXM ARR protected…", "Adobe MAX · +154% orders · +53% generations · 2…", "ChatGPT · Microsoft Copilot · Claude · 2025–2026") · a duration-style number on the right (4:55, 3:33, 4:18) keeping the Spotify metaphor.
7. **"Featured Work"**: horizontal row of playable video thumbnails.

## Mapping to Miles's site (for the agents to judge, not settled)

- Miles's cards = specialties (skills), not employers; his "projects" = reels/playlists.
- Candidate mapping: click specialty card → drawer with: `SPECIALTY` eyebrow + title · role-style line · his project-story body as the green-border summary · **Highlights = the reels that PROVE that specialty across playlists** (numbered rows: reel thumb · reel title · micro-description = brand handle · plays · date) · Featured Work / Play button → jumps into the Work player for the mapped playlist.
- Micro-descriptions per reel are the "small description" Miles asked for; play counts replace durations on the right to keep the metaphor.
- Current implementation (main, commit 2b8d26b): card click deep-links straight into the Work player playlist — the drawer layer does not exist yet.
