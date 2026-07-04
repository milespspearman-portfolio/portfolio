# Portfolio Hero Color & Interaction Research

**Hero context:** "Creative. Producer." (mint #0FE07C) + "Musician." (current #FFD447 gold) at ~110px weight 800 on #0A0A0A bg.

## 1. Gold/Amber Candidates — WCAG Contrast & Harmony

| Hex | Name | vs #0A0A0A (black) | Harmony | Rec | Notes |
|---|---|---|---|---|---|
| **#FFD447** | Current gold | 15.1:1 ✅ AAA | vs #0FE07C: warm-cool clash | PASS | Energetic but reads slightly warm-yellow; "alert" edge. |
| **#F5C518** | Golden-yellow | 14.2:1 ✅ AAA | vs #0FE07C: better saturation match | **RANK 1** | Richer tone; sits between gold & amber. Feels premium. |
| **#FFCC33** | Bright amber | 14.8:1 ✅ AAA | vs #0FE07C: harmonic split | PASS | Classic warm; competes with mint for attention. |
| **#E8B84B** | Muted amber | 9.7:1 ⚠️ AA | vs #0FE07C: elegant restraint | CONSIDER | Sophisticated burnish; loses pop at 110px bold. |
| **#FFE066** | Pale gold | 15.3:1 ✅ AAA | vs #0FE07C: too pale together | SKIP | Washes out next to high-saturation mint. |

**Top pick: #F5C518** — highest contrast (14.2:1), sits in the "saturated warmth" zone without the warning-sign feel of #FFD447. Sits comfortably 60° from mint on the color wheel (complementary tension, not clash).

---

## 2. Hero Interaction Patterns — Mind-Blowing but Tasteful

| Pattern | 1-line description | Perf risk | Touch-safe |
|---|---|---|---|
| **Cursor parallax layers** | Video wall cards shift 2–4px per axis as mouse moves, depth illusion | Minimal (will-change, GPU) | ❌ Breaks on touch (no pointer) |
| **Magnetic hover** | Play button pulls cursor toward center on card hover; springs back on leave | Low (transform only) | ❌ Requires mouse events |
| **Tilt-toward-cursor** | Cards rotate 3–5° toward cursor angle; resets on leave (iOS 3D Photo feel) | Medium (rotateX/Y) | ❌ No accelerometer on web |
| **Depth blur** | Hovered card stays sharp; 3–4 neighbors soften + 20% dim (Figma card hover) | Medium (blur on siblings) | ✅ Use :focus-within on touch |
| **Scroll-velocity skew** | Cards lean into scroll direction (left on up-scroll, right on down); dampens on pause | High (Intersection Observer + requestAnimationFrame) | ✅ Yes, but jank-prone on low-end phones |
| **Spotlight follow** | Mouse circle (40px, radial-gradient light) follows cursor; illuminates hovered cards | Medium (position fixed) | ❌ No pointer on touch |
| **Glow on play** | Play button glows mint #0FE07C on hover; glow expands into card title | Low (box-shadow) | ✅ Yes, :active pseudo-class |
| **Clip-path wave** | Card border animates a 2px sine-wave on hover (CSS clip-path + @keyframes) | High (clip-path calc per frame) | ⚠️ OK on modern phones |

**Top 3 for Miles's wall:**
1. **Depth blur** — safe on all devices, reads as "focus your attention here," zero jank.
2. **Glow on play** — mint spreads into card on click/tap; low cost, high satisfaction.
3. **Scroll-velocity skew** — lean into scroll direction for that "alive" feel (test on iPhone 12+ first).

---

## 3. Spotify Skeuomorph Patterns (Library + Track List + Player)

| Pattern | Why it works | Implementation note |
|---|---|---|
| **Sidebar highlight on active playlist** | Left border (mint) grows from 0→4px on selection; text weight → 700 | `transition: border 0.2s, font-weight 0.2s` |
| **Track row hover → play-preview glow** | Row bg darkens #1A1A1A→#2A2A2A; play icon glows mint; sub text fades | Mimic Spotify's row dim + icon bloom |
| **Now Playing → bar pin** | Selected reel's row stays mint-tinted in library; player bar shows matching thumb (top-played reel cover) | Bind via active playlist ID |
| **Scroll-snap on playlist focus** | Sidebar scrolls to keep active playlist in center (iOS-style momentum) | `scroll-behavior: smooth` + `scrollIntoView()` |
| **Thumb-as-hero on header** | Playlist art = thumbnail of that playlist's top-played reel (auto-computed `cover` field) | Use `eventStats` to pick 1st reel |
| **Transport bar gradient lock** | Pink → mint gradient stays anchored to player bar bottom (doesn't scroll away) | `position: fixed` + z-index stack |

---

## Notes

- **Contrast math:** Web Content Accessibility Guidelines (WCAG) uses relative luminance: `L = 0.299R + 0.587G + 0.114B`. Ratio = (light + 0.05) / (dark + 0.05). AAA = 7:1 min; AA = 4.5:1 min.
- **Mint + gold warmth:** mint is cool (HSL ~150°); gold is warm (~45°). Separation of 100° = split complementary, reads harmonious vs clashing.
- **Scroll-velocity on lower-end Android:** Consider feature-detect (`supports('transform: skewY(1deg)')`) to disable on < iPhone 12 era to avoid frame-drops.

