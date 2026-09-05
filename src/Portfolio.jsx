import { useState, useEffect, useRef, Fragment } from "react";

// Sep 4 2026 — Miles retired the Spotify green sitewide. Aug 26: "the green
// spotify was honestly not great if we didn't fully drive into it"; Aug 27:
// "sweep the green". `mint` keeps its name (it still means "playing / press
// this" everywhere it reads) and now resolves to white, so nothing green
// renders on any route. The green site lives at tag spotify-live-2026-09-04.
const C = {
  bg: "#0A0A0A", mint: "#FFFFFF", pink: "#FF6B9D", red: "#FA0F00", gold: "#F5C518",
  white: "#FFFFFF", gray: "#888888", darkGray: "#1A1A1A",
  glass: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)",
};
const F = `'Outfit', sans-serif`;

function useInView(t = 0.08) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return [ref, v];
}

// Play every <video> inside `ref` only while the container is on screen —
// muted autoplay tiles otherwise burn CPU/battery off-screen. Shared by the
// opening wall AND the restored hero row (both hold ~16 looping videos).
function usePlayWhenVisible(ref, threshold = 0.05) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.querySelectorAll("video").forEach(v => {
        if (entry.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      });
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }}>{children}</div>;
}

// ===== PLAYER HELPERS =====
// Local library paths in the data map 1:1 onto files served from /public
const srcOf = (r) => !r.mp4 ? "" : (r.mp4.startsWith("/reels/") ? r.mp4 : r.mp4.replace("~/Downloads/Claude/miles-portfolio-reels", "/reels"));
// A row may carry an explicit `thumb` instead of deriving one from its mp4 —
// that is how a WATCH-ONLY row (below) gets art with no local video file.
const thumbOf = (r) => r.thumb || (r.mp4 ? srcOf(r).replace("/reels/", "/thumbs/").replace(/\.mp4$/, ".jpg") : "");
// ===== WATCH-ONLY ROWS (Aug 10 2026) =====
// A row with NO `mp4` is real published work that is not hosted here. Built for
// the six Photoshop Archives longform episodes: they run 27 to 61 minutes, and
// committing an hour of 1080p to make a portfolio row playable is the wrong
// trade — the episode lives on YouTube, so the row carries its official
// thumbnail and sends you there. Everywhere the site would mount a <video> it
// mounts the poster + a watch affordance instead. The row is otherwise a normal
// reel: it counts, it sorts, it carries chips, it appears in every total.
const watchOnly = (r) => !r.mp4;
const playsNum = (p) => { const n = parseFloat(p); if (isNaN(n)) return 0; return /m/i.test(p) ? n * 1e6 : /k/i.test(p) ? n * 1e3 : n; };
// Some platforms never publish view counts (LinkedIn — verified: scrapers
// return reactions/comments/shares only — and IG carousels). Blank plays
// render "N/A" so absence can't be misread as zero or a data error.
// Display-only; the plays field stays "" so no derived total moves.
const playsLabel = (r) => r.plays || "N/A";
// Platform name from a reel's post URL — link labels say the real source.
const platformOf = (r) => r.postUrl?.includes("linkedin.com") ? "LinkedIn" : (r.postUrl?.includes("youtu") ? "YouTube" : "Instagram");
// Miles Jul 6: bare "@adobe" is vague now that LinkedIn/YouTube reels carry
// source tags — IG handles get an explicit " IG" suffix at display time.
// Data subs stay verbatim; likes/date parsing is untouched.
const handleTag = (r) => r.sub.split(" · ")[0] + (r.postUrl?.includes("instagram.com") ? " IG" : "");
const subTag = (r) => { const p = r.sub.split(" · "); return [handleTag(r), ...p.slice(1)].join(" · "); };
const fmtPlays = (n) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : String(Math.round(n));
const fmtTime = (s) => { if (!isFinite(s)) return "0:00"; const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

// What a watch-only row renders in place of the <video>: its real thumbnail,
// with a mint watch button over it. Deliberately NOT dressed up as a broken
// player — the runtime is printed on it, so the click is an informed one
// ("this is 27 minutes, it opens on YouTube") rather than a dead play button.
// Reused at every playback surface so the behaviour is identical everywhere.
function WatchFrame({ reel, radius = 12, minH }) {
  return (
    <a href={reel.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
      aria-label={`Watch ${reel.title} on ${platformOf(reel)}`}
      style={{ position: "relative", display: "block", width: "100%", aspectRatio: reel.landscape ? "16 / 9" : "9 / 16", minHeight: minH, borderRadius: radius, overflow: "hidden", background: "#000", textDecoration: "none" }}>
      {thumbOf(reel) && <img src={thumbOf(reel)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.15) 40%, rgba(10,10,10,0.82))" }} />
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 12px" }}>
        {reel.runtime && <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.82)", letterSpacing: 1.5, textTransform: "uppercase" }}>Full episode · {reel.runtime}</span>}
        <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.bg, background: C.mint, padding: "9px 20px", borderRadius: 100, whiteSpace: "nowrap" }}>Watch on {platformOf(reel)} ↗</span>
      </span>
    </a>
  );
}

// ===== PROSE (Aug 10 2026) — the description presentation layer =====
// Spec: research/DESCRIPTION-FORMATTING-SPEC-2026-08-10.md. Miles's ask was
// "each sentence is their own paragraph"; the research landed on one IDEA per
// paragraph (NN/G), which on his own copy is his instinct minus one break.
//
// TWO NUMBERS THIS FIXES, both measured on his running dev server:
//  - `60ch` in Outfit renders ~88 real characters, not 60. CSS `ch` measures the
//    `0` glyph, which in this font is ~47% wider than the average prose
//    character. 88 is over Baymard's 75 and over WCAG 1.4.8's 80 ceiling.
//    Conversion for Outfit: real chars ≈ ch × 1.47, so 46ch ≈ 68 characters.
//    Hard ceiling is 54ch (80 chars) — never write more.
//  - A 10px paragraph gap against a 23.25px line-height is 0.43 of a line. That
//    does not read as a paragraph break, it reads as a loose line. 1.5em ≈ one
//    full line-height, which is what makes a chunk look like a chunk.
//
// Takes an authored ARRAY (breaks Miles chose) or a plain STRING (breaks derived
// at sentence boundaries). That split matters: BUCKET_INTROS reads its strings
// out of `capabilities[].body` specifically so the role page renders the same
// bytes he wrote, so the breaking happens in the renderer and the data stays
// byte-identical. If a body ever needs two sentences riding together, author
// that entry as an array — which is why this takes both.
// The lookahead needs whitespace + a capital, so decimals survive ("2.6M plays"
// has no space after the period). It would mis-split "U.S. Bank"; none exists,
// and array-authoring is the escape hatch if one ever does.
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z“"'(])/;
function Prose({ text, as = "div", size = 15, gap = "1.5em", measure = "46ch", color = "rgba(255,255,255,0.84)", lh = 1.55, style }) {
  const paras = Array.isArray(text) ? text : String(text).split(SENTENCE_SPLIT);
  // `as="span"` exists because one caller sits inside an <a>, where <div><p>
  // would be invalid nesting. Same look, legal DOM.
  const Wrap = as, Para = as === "span" ? "span" : "p";
  const paraStyle = (n) => ({ fontFamily: F, fontSize: size, color, lineHeight: lh, textWrap: "pretty", margin: n ? `${gap} 0 0` : 0, ...(as === "span" ? { display: "block" } : null) });
  // fontFamily + fontSize on the WRAPPER are load-bearing, not decoration.
  // `ch` resolves against the font of the element it is written on. The measure
  // lives on this wrapper, so without these the browser sizes `46ch` using the
  // inherited fallback font's zero glyph (8.0px here) instead of Outfit's
  // (9.84px) — a 368px column instead of 453px, ~52 characters instead of ~64.
  // Caught by measuring the rendered line, not by reading the CSS.
  return (
    <Wrap style={{ fontFamily: F, fontSize: size, maxWidth: measure, ...(as === "span" ? { display: "block" } : null), ...style }}>
      {paras.map((p, n) => <Para key={n} style={paraStyle(n)}>{p}</Para>)}
    </Wrap>
  );
}

const GRADS = [
  ["#2A2A2A", "#E8E8E8"], ["#4A0C26", "#FF6B9D"], ["#0C3A4A", "#2BC8F0"], ["#2E0C4A", "#B44CF0"],
];
const gradFor = (i) => `linear-gradient(135deg, ${GRADS[i % GRADS.length][0]}, ${GRADS[i % GRADS.length][1]})`;

// What Miles did on each playlist's videos — his words, retag per playlist as needed.
// Aug 7 2026: the six hosted event runs read "Creative Directed, Hosted, & Produced"
// — Miles's exact line for those runs (his comma before the ampersand, verbatim).
const EVENT_ROLES = {
  "Side Projects": "Created, produced & hosted",
  "’24 IBC Amsterdam": "Creative Directed, Hosted, & Produced",
  "’24 MAX Miami": "Creative Directed, Hosted, & Produced",
  "’24 NAB Vegas": "Creative Directed, Hosted, & Produced",
  "’25 Summit Vegas": "Creative Directed, Hosted, & Produced",
  // Aug 10 2026, Miles's own correction — "MAX LA i concpeted,scripted,
  // produced and hosted and directed i did it all". The old line ("Created,
  // produced & hosted") dimmed Concept/Script and Directed, contradicting his
  // signed MAX case text on the same page. This is the standard line of its
  // group, his comma style, verbatim.
  "’25 MAX LA": "Creative Directed, Hosted, & Produced",
  "’25 MAX London": "Creative Directed, Hosted, & Produced",
  "’25 NAB Vegas": "Creative Directed, Hosted, & Produced",
  "Cannes": "Produced",
  "Employee Spotlights: Season 1": "Produced & creatively directed",
  "Employee Spotlights: Season 2": "Produced & creatively directed",
  "Employee Spotlights: Season 3": "Produced & creatively directed",
  "’26 Summit": "Produced",
  "’26 NAB Vegas": "Produced",
  "Artist Spotlights": "Produced & creatively directed",
  "Always-On": "Produced",
  "Photoshop Archives": "Produced",
  "’25 IBC Amsterdam": "Hosted & on-camera talent",
  "Brand Partnerships": "Produced with the in-house team",
  "Adobe × NFL": "Produced in partnership with the NFL",
  "Adobe MAX Product Demos": "Produced, creatively directed & coached",
  "’25 MAX Customer Stories": "Produced, creatively directed & coached",
  "Miles.Spearman": "Brainstormed, Researched, Shot, Scripted, Edited & Posted: 1-Person Production",
  "Miles Music Media": "Brainstormed, Researched, Shot, Scripted, Edited & Posted: 1-Person Production",
  "Miles on YouTube": "Brainstormed, Researched, Shot, Scripted, Edited & Posted: 1-Person Production",
  "Making B2B Social Friendly": "Pitched, Produced and Directed",
};
// What a playlist was FOR, in one line — the goal, not the job. Sits directly
// under the role line in the playlist header, small and gray, the same quiet
// register the reel counts and credits use, so the loud line on the header
// stays the role line.
// DEFAULT PLACEMENT, pending Miles's veto: on Aug 10 he wrote this sentence for
// the product-demo playlist but did not say where it should live, and this is
// the slot that reads as "why this existed" without competing with anything. If
// he wants it elsewhere, move the one string; if he kills it, delete the key.
// One entry today on purpose. The map is the pattern for the rest, and a
// playlist with no entry renders exactly as it does now.
const EVENT_GOALS = {
  "Adobe MAX Product Demos": "Show the people behind our product launches",
};
// ===== ROLE CREDITS (Aug 7 2026) — Miles's own wording from his sent email
// (Aug 1, "The edit breakdown you asked for"), applied ONLY to the reels that
// email names. Keyed by the Instagram shortcode inside each reel's postUrl, so
// a chip can never drift onto a retitled or re-sorted reel. NEVER add an entry
// that isn't in that email — the Employee Spotlights stay "produced &
// creatively directed" (Miles's own guardrail) and get no chip.
// EXTENSIBLE BY DESIGN (Aug 9 2026): "what was my role" is the first question a
// hiring manager asks, so the chip is primary information, not metadata. Miles
// is tagging the rest of the library now; every new reel is one more
// `"<shortcode>": "<his words>"` line here and it renders everywhere the chip
// renders, with zero layout work. A reel with no verified entry shows NOTHING —
// silence is the honesty floor, never a guessed credit.
const ROLE_CREDITS = {
  // "videos I've cut myself"
  "C51y-zEKwAr": "Cut myself", // ’24 NAB: Emoji Reaction Interviews
  "C56vDmUBrJI": "Cut myself", // ’24 NAB: Premiere Pro AI Announcement Reactions
  "C6E43DDsUfP": "Cut myself", // ’24 NAB: Premiere Enhanced Speech Live Test
  "C6HqT-KLF9R": "Cut myself", // ’24 NAB: Day-in-the-Life Recap
  "DAB_Fb0BUWZ": "Cut myself", // ’24 IBC: Premiere Pro AI: Emoji Reactions
  "DACI4I7O8GK": "Cut myself", // ’24 IBC: Premiere Pro Release (Customer Interviews)
  "DAEf4XeN5HT": "Cut myself", // ’24 IBC: Event Recap
  // "The pre-show and post-show content is mine end to end"
  "DBOzrP1IsyY": "Mine end to end", // ’24 MAX: 3 Things We Didn’t Expect
  "DBSAnTctwG3": "Mine end to end", // ’24 MAX: Beyond Your Job Title
  "DU9ZnA-D_Xu": "Mine end to end", // ’25 MAX: Sarah Shen’s Coolest Job
};
const shortcodeOf = (r) => { const m = (r.postUrl || "").match(/instagram\.com\/(?:p|reel)\/([^\/?#]+)/); return m ? m[1] : ""; };
const creditOf = (r) => ROLE_CREDITS[shortcodeOf(r)] || "";

// ===== REEL TAGS (Aug 10 2026) — Miles's completed role-tagging pass =====
// research/ROLE-TAGGING-2026-08-09.md: he filled the MILES column on every row.
// His codes, verbatim from that doc's header:
//   E  = cut myself
//   EE = mine end to end
//   H  = hosted/on-camera
//   D  = concepted/hosted/directed, agency cut
//   P  = produced
// Keyed by reel TITLE because the title column is the one he filled. All 111 of
// his rows matched exactly one reel in the data — no guesses, no near-misses.
// The 12 "Miles on YouTube" reels had no row in that doc, so they carried no
// chip. Aug 10 2026 he supplied the missing row himself, verbatim: "did
// everything it's the same as the jazz — they join cut by me". So all 12 are EE
// below, the same code the jazz library carries, and they join the Cut by Me
// mirror. This is his own answer filling his own gap, not an inference.
//
// WHAT A CODE IS ALLOWED TO CLAIM
// - Chips say the code and nothing more: E "Cut myself" · EE "Mine end to end" ·
//   H "Hosted" · D "Directed" · P "Produced".
// - In the role matrix, D lights Concept/Script and Directed. It does NOT light
//   Hosted, even though his written definition of D mentions hosting: he used a
//   separate H on exactly the runs he fronted ('25 Summit, MAX, IBC) and left it
//   off the produced work ('26 Summit, NFL, Brand Partnerships, Spotlights), so
//   H is his hosting signal and D on its own is not.
//   CONFIRMED by Miles Aug 10 2026, asked directly whether a D row should count
//   as hosted: "D doesn't count as hosted... i was behind the scenes". The read
//   above was already what shipped, so this is a confirmation, not a change —
//   no code moved, and H stays the only hosting signal.
// - EE lights Edited only. "Mine end to end" is a summary, not an itemisation,
//   and reading four more claims into it would be inventing them.
// - A parenthetical he wrote stays in the string verbatim and is read as a note,
//   not a code. "no concept" strips the Concept half of that row's D.
const REEL_TAGS = {
  // Side Projects
  "@UofCincy Social": "EE, H",
  "TacoBell x Upworthy Feature": "H",
  // ’24 IBC Amsterdam
  "’24 IBC: Premiere Pro AI: Emoji Reactions": "EE, E, H",
  "’24 IBC: Premiere Pro Release (Customer Interviews)": "EE, E, H",
  "’24 IBC: Event Recap": "EE, E, H",
  // ’24 MAX Miami — the two held rows are RELEASED (Aug 10). Miles settled the
  // email-vs-column conflict himself, verbatim: "i owned both of those end to
  // end". So EE stands (and the "Mine end to end" chip his sent email already
  // earns them still renders, because ROLE_CREDITS outranks both codes), H
  // stands because his column says these are hosted pieces, and the D his
  // column also carried is dropped: end to end subsumes directing, and his
  // ruling was for two chips, not three.
  "’24 MAX: 3 Things We Didn’t Expect": "EE, H",
  "’24 MAX: Beyond Your Job Title": "EE, H",
  "’24 MAX: Project Watercolor Master: Adobe Researcher Sneaks Interview": "D, H",
  "’24 MAX: Project Type Lab: Adobe Researcher Sneaks Interview": "D, H",
  "’24 MAX: Project Generative Physics": "D, H",
  "’24 MAX: In-Office Trivia": "D, H",
  "’24 MAX: Attendee Scavenger Hunt": "D, H",
  "’24 MAX: Sneaks Reactions One Emoji": "D, H",
  "’24 MAX: Photoshop New Feature Demo": "D, H",
  "’24 MAX: Premiere Pro Demo": "D, H",
  "’24 MAX: Adobe x Gatorade Activation": "D, H",
  // ’24 NAB Vegas
  "’24 NAB: Emoji Reaction Interviews": "EE, E, H",
  "’24 NAB: Premiere Pro AI Announcement Reactions": "EE, E, H",
  "’24 NAB: Premiere Enhanced Speech Live Test": "EE, E, H",
  "’24 NAB: Day-in-the-Life Recap": "EE, E, H",
  // ’25 Summit Vegas
  "’25 Summit: Coca-Cola Activation": "D, P, H",
  "’25 Summit: Over & Under AI Enterprise Activity": "D, P, H",
  "’25 Summit: Acrobat Escape Room": "D, P, H",
  "’25 Summit: “Describe Your Job” Interviews": "D, P, H",
  "’25 Summit: Coolest Job @Adobe S1": "D, P, H",
  "’25 Summit: Sneaks Emoji Reactions": "D, P, H",
  "’25 Summit: Hosted Event Recap": "D, P, H",
  "’25 Summit: Ken Jeong Interview": "D, P, H",
  "’25 Summit: Escalator ‘Hot’ Takes": "D, P, H",
  // ’25 MAX LA
  "’25 MAX: Acrobat Booth": "D, P, H",
  "’25 MAX: PDF Spaces is Everywhere": "D, P, H",
  "’25 MAX: James Gunn’s Filmmaking Assignment": "D, P, H",
  "’25 MAX: “Coolest Job” @Adobe | Firefly Feature": "D, P, H",
  "’25 MAX: Mark Rober’s Creator Assignment": "D, P, H",
  "’25 MAX: Jessica Williams’ Creator Assignment": "D, P, H",
  "’25 MAX: Navin’s Coolest Job": "D, P, H",
  "’25 MAX: Sarah Shen’s Coolest Job": "D, P, H",
  // ’25 MAX London
  "’25 MAX London: Recap": "D, P, H",
  "’25 MAX London: Arches of Inspiration": "D, P, H",
  "’25 MAX London: Fonts Creator Game": "D, P, H",
  "’25 MAX London: Firefly Explainer": "D, P, H",
  // ’25 NAB Vegas
  "’25 NAB: Premiere Pro Releases": "EE",
  "’25 NAB: Generative Extend Demo": "EE",
  "’25 NAB: Event Coverage": "EE",
  // Employee Spotlights: Season 1
  "Dave Werner Employee Spotlight": "D, P",
  "Manasa Hari Employee Spotlight": "D, P",
  "Bowen Wang Employee Spotlight": "D, P",
  // Employee Spotlights: Season 2
  "Amanda Valenzuela Employee Spotlight": "D, P",
  "Gizem Dal Employee Spotlight": "D, P",
  // Employee Spotlights: Season 3
  "Imran Idzqandar Employee Spotlight": "D, P",
  "Russell Preston Brown Employee Spotlight": "D, P",
  "Em Siegel Employee Spotlight": "D, P",
  // ’26 Summit
  "’26 Summit: Sneaks Celebrity Host Interview": "D, P, Directed (no concept)",
  "Brand Intelligence B2B Interview": "D, P",
  "Coolest Job: Tongyu": "D, P",
  "Coolest Job: Eric": "D, P",
  "’26 Summit: Behind the Scenes of Sneaks": "D, P",
  "’26 Summit: Words of Wisdom with Iliza Shlesinger": "D, P",
  "’26 Summit: Anil Chakravarthy Exec Interview": "D, P, (Directed but no concept)",
  // ’26 NAB Vegas
  "’26 NAB: Object Matte (OTG)": "D, P",
  "’26 NAB: Color Mode (OTG)": "D, P",
  // ’25 IBC Amsterdam
  "’25 IBC: Recap": "P, H",
  "’25 IBC: Favorite Premiere Transitions": "P, H",
  "’25 IBC: Premiere Pro Transitions Release": "P, H",
  "’25 IBC: Premiere on Mobile Release": "P, H",
  // Artist Spotlights
  "San Jose Semaphore": "P",
  "Artist Spotlight: Aaron Gonzalez": "P, D",
  "Building Murals: Laura Garcia": "P, D",
  "Cracking the Semaphore Code": "P, D",
  // Always-On
  "Creative Cloud for Students Black Friday Discount": "EE",
  "Firefly Interview Demo": "P, D, H",
  "Intern Day Creative Cloud": "P, D, H",
  // Brand Partnerships
  "Kelley O'Hara x NWSL x Adobe": "P, D",
  "Photoshop x Marvel: Eyes of Wakanda": "P, D",
  "Adobe x NWSL: 2025 Creator Club": "P, D",
  "Adobe x Golden State Warriors: Creative Threads": "P, D",
  // Adobe × NFL
  "NFL x Adobe: Behind the Lens (LCC)": "P, D",
  "NFL x Adobe: Season Opener Kickoff": "P, D",
  // Adobe MAX Product Demos — Aug 10: the rename his tagging doc floated is
  // SUPERSEDED. He ruled the playlist keeps this name, so nothing is renamed.
  "GenStudio for Performance Marketing Demo": "P, D",
  "Exec Thought Leadership: TikTok Your Ad Has Just 10 Seconds to Live": "P, D",
  "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language": "P, D",
  "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish": "P, D",
  // ’25 MAX Customer Stories
  "’25 MAX Customer Story: Intuit": "P, D",
  "’25 MAX Customer Story: Wyndham Hotels": "P, D",
  // Photoshop Archives
  "’26 PS Archives: Russell Brown x Matthew Richmond (Podcast)": "P, D",
  "’26 PS Archives: The Power of Small Tools": "P, D",
  "’26 PS Archives: 1st Satisfying Project": "P, D",
  "’26 PS Archives: Tools Don’t Make Things": "P, D",
  "’26 PS Archives: Tools Don’t Know When Something is Good": "P, D",
  // The 4 hunted cutdowns + the 6 longform episodes (Aug 10 2026). Same "P, D"
  // as every Photoshop Archives row above — his tagging for the series, and for
  // the episodes his own words tonight: "concpeted directed and produced".
  "’26 PS Archives: Why Layers Exist": "P, D",
  "’26 PS Archives: Experiment, Fail, Repeat": "P, D",
  "’26 PS Archives: Renee Robyn’s Top Tools": "P, D",
  "’25 PS Archives: Renee Robyn on Harmonize": "P, D",
  "’25 PS Archives Episode: Renee Robyn": "P, D",
  "’25 PS Archives Episode: The Design Journey": "P, D",
  "’25 PS Archives Episode: John & Thomas Knoll": "P, D",
  "’25 PS Archives Episode: Jeff Schewe": "P, D",
  "’25 PS Archives Episode: Michael Shainblum": "P, D",
  "’25 PS Archives Episode: Joel Grimes": "P, D",
  // Miles Music Media
  "Happy 100th Birthday Miles Davis": "EE",
  "In Walked Bud": "EE",
  "Ornithology": "EE",
  "Donna Lee": "EE",
  "Sonny Rollins Tribute": "EE",
  "Confirmation": "EE",
  "Contrafacts": "EE",
  "Miles Davis Might Be a Thief (Four)": "EE",
  "What's the Difference Between the": "EE",
  "Now Watch Again What Color Was": "EE",
  "Ornithology Was Written by a Trumpet": "EE",
  "Guess Who I've Been Listening": "EE",
  "Miles Davis Might Be a Thief": "EE",
  "Have You Ever Just Binged Research": "EE",
  "You Either Love the Tune or": "EE",
  "Sonny Rollins to Pay Tribute Rest": "EE",
  "Bruh First Time Playing a Transcription": "EE",
  "Ear Training Is the Most Underrated": "EE",
  "Happy Jazz History Month More to": "EE",
  "Back in New York I Had": "EE",
  "Confirmation Is a Beast but Hopefully": "EE",
  // Miles.Spearman
  "Behind the Product": "P, D",
  // Miles on YouTube — Aug 10 2026, his own words: "did everything it's the
  // same as the jazz — they join cut by me". Same code as the jazz library
  // above, so the 12 YouTube videos now read the same way the reels do.
  "Trying Out My First Marching Band Meme": "EE",
  "Play THIS if You Want to Sound Good in Jazz": "EE",
  "Play THIS Lick if You Want to Sound Good in Jazz": "EE",
  "POV: Your Trumpet Lips Are Feeling Good": "EE",
  "Day 12 of Testing My High Range on Trumpet": "EE",
  "Play THIS if You Sound Good in Jazz Pt 3": "EE",
  "How to SOLO Over Autumn Leaves | Full Jazz Improvisation Lesson": "EE",
  "Day 7 of Testing My High Range on Trumpet": "EE",
  "How to Solo Over “Take the A-Train” | Full Jazz Improvisation Lesson": "EE",
  "Funkytown / I Got You (Lucky Chops)": "EE",
  "There Will Never Be Another You": "EE",
  "Play This Jazz Lick in Your Next Solo": "EE",
};

// RESOLVED Aug 10 2026 — the hold is over, the map is empty, and it stays here
// as the shape any future conflict gets parked in. The two rows that lived here
// ("’24 MAX: 3 Things We Didn’t Expect", "’24 MAX: Beyond Your Job Title") had a
// sent email calling them "mine end to end" against a column reading "D, H".
// Miles broke the tie in one sentence: "i owned both of those end to end".
// Both rows moved up into REEL_TAGS as "EE, H" and now render two chips each.
const REEL_TAGS_ON_HOLD = {};

const TAG_CODES = ["E", "EE", "H", "D", "P"];
const TAG_CHIP = { E: "Cut myself", EE: "Mine end to end", H: "Hosted", D: "Directed", P: "Produced" };
const _tagParts = (r) => (REEL_TAGS[r.title] || "").split(",").map(s => s.trim()).filter(Boolean);
const tagsOf = (r) => _tagParts(r).filter(p => TAG_CODES.includes(p));
// Anything in his column that isn't one of the five codes is a note he wrote.
const tagNoConcept = (r) => _tagParts(r).some(p => !TAG_CODES.includes(p) && /no concept/i.test(p));
// Did he cut this one? Either the sent email names it, or his column says so.
const cutByMeReel = (r) => !!creditOf(r) || tagsOf(r).some(c => c === "E" || c === "EE");
// The chips a reel earns, in his own code order. The edit credit is ONE chip,
// never two: EE subsumes E, and a verified ROLE_CREDITS entry (his sent email)
// outranks both, so the Hansen wording always wins where the two overlap.
const roleChipsOf = (r) => {
  const t = tagsOf(r);
  const edit = creditOf(r) || (t.includes("EE") ? TAG_CHIP.EE : t.includes("E") ? TAG_CHIP.E : "");
  const rest = ["H", "D", "P"].filter(c => t.includes(c)).map(c => TAG_CHIP[c]);
  return edit ? [edit, ...rest] : rest;
};
// The MAX split, verbatim from the same email (only "During" recapitalized at
// the head of the sentence). Case text on the MAX event playlists' headers.
const MAX_SPLIT = "During the event itself we're at 12 to 15 deliverables in four days, so the hero sizzles go to our agency and I concept, host and direct those. The pre-show and post-show content is mine end to end.";
// The split is TWO sentences and the second one — "The pre-show and post-show
// content is mine end to end" — is the sharpest line in it. Rendered as one
// block it sits in the tail position, which is exactly where NN/G's one-idea
// finding says a second idea gets skipped. So it renders as two paragraphs
// everywhere, DERIVED from the single string rather than retyped, because his
// wording must exist in this file exactly once. `MAX_SPLIT` itself is
// byte-unchanged and still works anywhere it is used whole.
// Safe split: the string carries no decimals and no abbreviations (checked).
const MAX_SPLIT_PARAS = MAX_SPLIT.split(/(?<=\.)\s+/);
// Aug 10 panel review: printed on all three MAX playlists it landed verbatim
// three times on one page and read as boilerplate by the third. It says one
// true thing about how a MAX run splits, so it is said ONCE — on '25 MAX LA,
// where the case text already absorbs it (the absorb branch below wins, so it
// still never renders twice on that playlist).
const MAX_SPLIT_PLAYLISTS = ["’25 MAX LA"];
// ===== MILES'S MAX GOAL CLAUSE (Aug 11 2026) =====
// His pick, in chat at ~3:21 AM: "max clause 1" — option 1 of the two
// byte-exact options in research/HOMEWORK-2026-08-10.md §B, carried into
// research/DECISION-BATCH-2026-08-11.md Q5. Copied character for character
// from that doc; nothing here is reworded, and no existing MAX word moved.
// The homework's stated mechanism is that a goal clause PREPENDS the case text
// as its opening line, so it becomes a new leading paragraph and the case text
// that follows is untouched. With this, all three case texts open on the goal
// (NWSL and Escape Room already did), which was tyler-lens's 3/3 note.
const MAX_GOAL_CLAUSE = "The goal: carry MAX's launches past the venue by putting them in creators' voices.";
// The MAX case, wherever it renders. There are TWO render sites in this file —
// the player's album header (MAX_SPLIT_PLAYLISTS branch) and the playlist
// section header on the role pages — and the clause has to open BOTH, so both
// read this one array instead of MAX_SPLIT_PARAS directly. CASE_TEXTS below
// spreads it too, so the clause exists in exactly one place.
const MAX_CASE_PARAS = [MAX_GOAL_CLAUSE, ...MAX_SPLIT_PARAS];
// External production partners per playlist — Miles's locked map (Jul 4),
// Audrey pattern: share the agency. Only Miles-confirmed credits appear.
// Brand roster surfaced on the timeline node (recruiter-legible names, one quiet line — not a badge grid).
const EVENT_BRANDS = {
  "Brand Partnerships": "Adobe × NWSL · Marvel · Golden State Warriors · Photoshop",
  "Adobe × NFL": "Official Creativity Partner",
  "Adobe MAX Product Demos": "Adobe GenStudio · Exec Thought Leadership",
  "’25 MAX Customer Stories": "Adobe × Intuit · Wyndham Hotels & Resorts",
};
// Per-album Workfront-brief lines shown when an album group unfolds in a drawer.
// Restored Jul 5 — was accidentally dropped in commit 7175fb7, causing a runtime
// crash (ReferenceError) when any album group expanded. Miles's lines verbatim.
const ALBUM_BLURBS = {
  "Emoji Reactions": "One format, three shows. Real creators react to a new AI feature in a single emoji. It pulled 1.5M at IBC 2024, then traveled to NAB and Summit.",
  "Games & Activations": "Booth games and floor activations turned into social. The Acrobat Escape Room alone reached 2.6M plays.",
  "Coolest Job": "A recurring series putting Adobe's most interesting roles on camera, from employees to Sneaks presenters, across Summit and MAX.",
  "Coolest Job · MAX ’25": "The MAX 2025 deep dives: longer, narrative cuts of the Coolest Job format.",
  "Coolest Job · Summit ’26": "The Summit 2026 class of Coolest Job, built to grow the series.",
  "Employee Spotlights · Season 1": "Where the series started. Three employees, three creative lives outside work. Dave Werner's reached 1.9M plays.",
  "Employee Spotlights · Season 2": "The punishment for good work is more work.",
  "Employee Spotlights · Season 3": "Our approach to employee highlights has succeeded three times.",
  "Always On": "Always-on demand content: product demos and seasonal moments that run year round.",
  "In-House Production": "Employee stories, activations, and talent pieces produced end to end, in house.",
  "Intern Day ’25": "A look inside Adobe's internship, made to recruit the next class of creatives.",
  "’24 MAX Miami": "Adobe MAX 2024, Miami. Sneaks interviews, floor activations, and the show's trivia format.",
  "’25 Summit Vegas": "Adobe Summit 2025, Las Vegas. The flagship hosting run: escape rooms, celebrity interviews, and hosted recaps.",
  "’25 MAX LA": "Adobe MAX 2025, Los Angeles. Celebrity and talent on camera: James Gunn, Mark Rober, Kelley O'Hara, Jessica Williams.",
  "’25 MAX London": "Adobe MAX London 2025. Interactive booth games and event recaps, including the 425K Fonts Creator game.",
  "’25 NAB Vegas": "NAB 2025, Las Vegas. Premiere Pro release coverage and live feature demos for the video community.",
  "’26 Summit": "Adobe Summit 2026, Las Vegas. The latest event recap work.",
};
const EVENT_PARTNERS = {
  "’24 MAX Miami": "T13",
  "’25 Summit Vegas": "T13",
  "’25 MAX London": "Workhouse",
  "’25 MAX LA": "Addison Interactive",
};
// ===== PLAYLIST CREDITS (Aug 9 2026) — every line copied out of
// `~/Downloads/Claude/workfront-ingest/PARTNER-MAP.md`, header "LOCKED by Miles
// Jul 4, 2026". Tyler grammar: "Role: Name", one credit per line.
// Three hard rules, in force forever:
//   1. A name whose ROLE the map does not record gets NO invented title and is
//      not published. (Emily Skaer and Genevieve Rico were held out on that
//      rule until Miles supplied their exact roles on Aug 9; they now live in
//      REEL_CREDITS below, attached to the one reel the map records them on.)
//   2. The map's "NEVER credit" row is absolute: those two agencies are never
//      published here, on any playlist, for any reason.
//   3. The individual Miles struck from the Employee Spotlights credit does not
//      come back. Read the map before adding any name to this object.
// Unruled names in the raw records (Gen Liu on Semaphore, Eli James on Creator
// Club) wait on Miles; they are not here.
const EVENT_CREDITS = {
  "’24 MAX Miami": ["Agency: T13"],
  "’25 Summit Vegas": ["Agency: T13"],
  "’25 MAX London": ["Agency: Workhouse"],
  "’25 MAX LA": ["Agency: Addison Interactive"],
  "’26 Summit": ["Agency: Addison Interactive"],
  // Aug 11 2026 — Miles answering Q6a of the decision batch, his words verbatim:
  // "T13 shot and edited". T13 is already a locked PARTNER-MAP name (it credits
  // the '24 MAX Miami and '25 Summit Vegas playlists above), so no new name
  // enters the site here; only the role changes, because on the Archives they
  // did camera and post rather than the whole production. Set in the same
  // "Role: Name" grammar every other credit line uses. His exact phrasing was a
  // sentence, so the ROLE is written the way the site writes roles and the words
  // are his ("shot and edited" -> "Shot & Edited"); flagged for his glance.
  "Photoshop Archives": ["Shot & Edited: T13"],
  // The map's "Be You (series)" row — the site's public name for it is
  // Employee Spotlights (the codename stays private, Miles Jul 4).
  "Employee Spotlights: Season 1": ["Editor: Tim Forster", "Graphic Designer: Didima Arrieta Martinez"],
  "Employee Spotlights: Season 2": ["Editor: Tim Forster", "Graphic Designer: Didima Arrieta Martinez"],
  "Employee Spotlights: Season 3": ["Editor: Tim Forster", "Graphic Designer: Didima Arrieta Martinez"],
};

// ===== PER-REEL CREDITS (Aug 9 2026) =====
// Some crew worked one reel, not a whole playlist. Those credits are keyed by
// IG shortcode, exactly like ROLE_CREDITS, and render inside the expanded row
// rather than in the playlist header — a playlist-level block would have put
// this crew's names over the Marvel and Golden State Warriors reels, which are
// other people's work. Nothing here is inferred: PARTNER-MAP records Emily
// Skaer and Genevieve Rico against the Kelley O'Hara piece specifically, so
// they attach to that reel and to nothing else. The Creator Club reel is a
// SEPARATE row in the records (agency T13, plus one individual Miles has never
// ruled on), so it carries no crew line until he does.
const REEL_CREDITS = {
  // Kelley O'Hara x NWSL x Adobe (the map's "Career Reinvention" row —
  // codename private, public title used here)
  "DRLSGTLgiZS": ["Graphic Designer & 3D Motion: Emily Skaer", "Camera Operator: Genevieve Rico"],
};
const reelCreditsOf = (r) => REEL_CREDITS[shortcodeOf(r)] || [];

// ===== ROLE MATRIX (Aug 9 2026, Miles's design) =====
// His words: "Concept/Script, Produced, Directed, Edited. Then highlight the
// tabs that I did or didn't that way they don't have to read every
// description." All four ALWAYS render — the dimmed ones do the credibility
// work, because a portfolio that only ever claims is a portfolio nobody
// believes. Every cell is DERIVED from data that already exists:
// Tabs run in pipeline order, Edited closing.
//   Concept/Script  the playlist's role line names concept, script, or creative
//                   direction (creative direction is both a concept and a
//                   directing credit, so it lights two cells)
//   Produced        the role line names producing
//   Directed        the role line names directing
//   Hosted          the role line names hosting or being on camera
//   Edited          reel-level ROLE_CREDITS exist inside this playlist (his own
//                   email naming the cuts as his), or it is his 1-person work
// A playlist whose line supports none of them stays ALL dimmed rather than
// guessed. Nothing here reads a description, a caption, or a hunch. Note that
// the off-the-clock playlists do NOT light Hosted: his line never claims it,
// and the performing speaks for itself inside the videos.
const ROLE_TABS = ["Concept/Script", "Produced", "Directed", "Hosted", "Edited"];
// Aug 10 2026, Miles: "let's add colors to each of the 5 tabs". One hue per
// role, the same hue everywhere the matrix renders. Mint (#1ED760) is NOT in
// this list on purpose — mint means playing, or press this, and it means one
// thing at a time. Gold and pink are already in the site's accent history.
// Only the LIT chip takes its hue: the dimmed chip keeps the gray treatment,
// because the dimmed state is the honesty signal and colour would flatter it.
// Measured on the near-black bed (#0A0A0A under the chip's own 8% tint), every
// hue clears 4.5:1 as chip text — 5.8:1 at worst (purple), 7.5:1 (blue),
// 7.0:1 (coral), 6.7:1 (pink), gold higher still. Each hex is a one-word swap.
const ROLE_TAB_COLORS = {
  "Concept/Script": C.gold, // #F5C518
  "Produced": "#4EA8DE",
  "Directed": "#FF6A38",
  "Hosted": "#E667C0",
  "Edited": "#9B7BFF",
};
// Chip alphas as hex suffixes: 14 = 8% fill, 66 = 40% border.
const tabFill = (hue) => `${hue}14`;
const tabEdge = (hue) => `${hue}66`;
// ===== PLAYLIST-LEVEL MATRIX OVERRIDES (Aug 10 2026) =====
// Where Miles corrects a derived cell in his own words, his word wins over the
// regex. His words: "i did not edit for MAX LA 25". The '25 MAX LA header was
// lighting Edited off the one reel in that playlist carrying a "Mine end to
// end" ROLE_CREDITS entry (his Aug-1 email). That entry STAYS — the reel's own
// row chip is his sent-email fact, and the Cut by Me mirror still holds it —
// but the playlist-level claim is his to correct, and he says no.
// Keys are ROLE_TABS names; false dims a cell, true lights one. This map is the
// cheap correction path for every future retag: one line, one word.
// Scoped to the real playlist header on purpose: the Cut by Me mirror passes
// forceEdited, and dimming Edited on the page that exists BECAUSE he cut those
// reels would have the site contradict itself.
const MATRIX_OVERRIDES = {
  "’25 MAX LA": { "Edited": false },
};
// A playlist cell lights if the role LINE says so, or if any reel inside it
// carries the matching tag from Miles's pass (Aug 10) — union, never override,
// so nothing that was already true can be turned off by the new data. Only
// MATRIX_OVERRIDES, which is his own correction, can dim a cell.
const roleTabsFor = (ev, forceEdited = false) => {
  const line = EVENT_ROLES[ev.event] || "";
  const anyTag = (c) => ev.reels.some(x => tagsOf(x).includes(c));
  const derived = [
    /concept|script|creative(ly)? direct/i.test(line) || ev.reels.some(x => tagsOf(x).includes("D") && !tagNoConcept(x)),
    /produc/i.test(line) || anyTag("P"),
    /direct/i.test(line) || anyTag("D"),
    /host|on-camera/i.test(line) || anyTag("H"),
    forceEdited || /1-Person Production/i.test(line) || ev.reels.some(x => cutByMeReel(x)),
  ];
  const fix = forceEdited ? null : MATRIX_OVERRIDES[ev.event];
  return fix ? derived.map((on, n) => (ROLE_TABS[n] in fix ? fix[ROLE_TABS[n]] : on)) : derived;
};

// ===== CASE TEXT (Aug 9 2026) — MILES'S FINAL WORDS, signed off =====
// He read every draft at the push gate, rewrote all three himself, then sent one
// more revision pass. This is that last pass, verbatim, and it supersedes
// everything before it. No DRAFT tag: these are his.
// Nothing here is edited. The two mechanical fixes an earlier pass needed both
// went away when he rewrote: he now names the Summit floor himself, and his new
// wording never names the internal team, which his own rule bars from case
// text, credits, role lines and work descriptions (COPY-PRINCIPLES rule 9; the
// About paragraph is the one permanent exemption).
// On '25 MAX LA the case text still LEADS with his split sentence, by reference
// rather than retyped, so that sentence never renders twice on the page.
const CASE_TEXTS = {
  // Aug 10, Miles's revision: the how-to clause at the end of paragraph 1 gave
  // way to the goal of the campaign, and the companion piece is now described by
  // what it followed rather than what it taught. His words, assembled in his
  // order. Paragraph 2 is his signed text from Aug 9, untouched.
  // RE-SPLIT Aug 10 per research/DESCRIPTION-FORMATTING-SPEC-2026-08-10.md §D1.
  // Words, spelling and sentence ORDER are byte-identical to the two-paragraph
  // version above it — only the break positions moved. The rule is one IDEA per
  // paragraph (NN/G), which lands one break short of his strict
  // sentence-per-paragraph instinct here: sentences 1 and 2 are a setup pair and
  // "The goal:" has no referent without the sentence before it, so they ride
  // together. His credit opens paragraph 3 and the metric is paragraph 4 alone,
  // which is what puts both in the position a scanner actually reads.
  // TO TAKE HIS STRICT VERSION: split paragraph 1 at "The goal:" → 5 paragraphs.
  "Brand Partnerships": [
    "The 2025 NWSL Creator Club was a partnership between Adobe and the NWSL. The goal: get fans creating with Adobe Express by making team pride the on-ramp.",
    "USWNT star Kelley O'Hara carried it on camera, and a companion piece followed her from the pitch to producing.",
    "My part ran from the pitch to the concept to directing the talent, working with O'Hara and her team alongside a freelance crew.",
    "The Creator Club reel reached 2.7M plays on @adobe.",
  ],
  // Aug 10, three paragraphs now: a new opener he wrote naming the problem the
  // format solved, his signed Aug-9 body unchanged in the middle, and a closer
  // he revised to name where the franchise actually travelled. The only touch
  // on his closer is one word: his raw line read "Summit's after", set here as
  // "the Summits after" so the possessive does not read as a typo on the page.
  // RE-SPLIT Aug 10 per the same spec, §D2. Words byte-identical, breaks only.
  // The one merge: the last two sentences are the result pair — the number, then
  // what the number led to — so they ride together. The metric still OPENS that
  // paragraph, which is the requirement. This is also the one case text where
  // the metric is not the final sentence: his franchise line closes it, and that
  // is his ordering, so it stays. The merge is what makes his closer read as one
  // deliberate result beat instead of a stray addendum.
  // TO TAKE HIS STRICT VERSION: split paragraph 4 after "@adobeacrobat."
  "’25 Summit Vegas": [
    "One-off influencer posts do not scale, so Adobe's flagship events needed a repeatable hosted format instead of a new idea every show.",
    "The Acrobat Escape Room was a real escape room built on the Summit 2025 show floor, solved on camera with AI Assistant doing the code-cracking.",
    "I pitched the concept, wrote the script and hosted it, one of nine posts shipped across a three-day show with T13 on production.",
    "The Escape Room reel reached 2.6M plays on @adobeacrobat. This started a franchise that continued for all future events including MAX London and the Summits after.",
  ],
  // RE-SPLIT Aug 10 per the same spec, §D3 — and this one is his strict instinct
  // EXACTLY: five ideas, five paragraphs, no merge. Where his rule was right the
  // spec agrees with him. The split sentence spreads via MAX_SPLIT_PARAS so his
  // "mine end to end" line stops being the tail of a 38-word block.
  // Aug 11 2026: MAX_CASE_PARAS replaces MAX_SPLIT_PARAS here, which prepends
  // his goal clause as the opening paragraph (Change 2, his pick "max clause 1").
  // Everything after it is byte-unchanged.
  "’25 MAX LA": [
    ...MAX_CASE_PARAS,
    "MAX 2025 was hosted in LA and we ran a creator assignment series with James Gunn, Mark Rober and Jessica Williams: ten-minute slots, no second takes, every talking track written by me and approved before the talent walked in.",
    "I wrote those tracks with strategy and directed the talent on camera, with Addison Interactive on production.",
    "The Rober reel reached 2.2M plays on @adobe.",
  ],
};
// (The role-page summary map that used to sit here now lives right after
// `capabilities`, because it is filled from Miles's own What I Do card bodies.)
// The "artist" on a playlist = the brands it published to, derived from each reel's handle
const handlesOf = (ev) => [...new Set(ev.reels.map(r => handleTag(r)))].join(", ");

// Transport icons
const IcPlay = ({ s = 14, c = C.bg }) => <svg width={s} height={s} viewBox="0 0 16 16" fill={c} aria-hidden="true"><path d="M4 1.5l10.5 6.5L4 14.5z" /></svg>;
const IcPause = ({ s = 14, c = C.bg }) => <svg width={s} height={s} viewBox="0 0 16 16" fill={c} aria-hidden="true"><path d="M3.5 2h3.2v12H3.5zM9.3 2h3.2v12H9.3z" /></svg>;
const IcPrev = ({ s = 14, c = C.white }) => <svg width={s} height={s} viewBox="0 0 16 16" fill={c} aria-hidden="true"><path d="M13 2.5v11L5.5 8zM3 2.5h2v11H3z" /></svg>;
const IcNext = ({ s = 14, c = C.white }) => <svg width={s} height={s} viewBox="0 0 16 16" fill={c} aria-hidden="true"><path d="M3 2.5v11L10.5 8zM11 2.5h2v11h-2z" /></svg>;
const IcVol = ({ s = 16, c = C.gray, muted = false }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill={c} aria-hidden="true">
    <path d="M2 6h2.5L8 3v10L4.5 10H2z" />
    {muted
      ? <path d="M10.2 5.8l4 4M14.2 5.8l-4 4" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      : <path d="M10.5 5.5a3.5 3.5 0 010 5M12 3.5a6 6 0 010 9" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" />}
  </svg>
);

// ===== DATA =====

const portfolio = [
  {
    event: "Side Projects",
    reels: [
      { title: "@UofCincy Social", sub: "@uofcincy · 621 likes · Jul 7, 2022", plays: "5.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2022/UC/UC_7.7.22.mp4", postUrl: "https://www.instagram.com/p/CfuYwU7J0Zv/" },
      { title: "TacoBell x Upworthy Feature", sub: "@upworthy · 6.6K likes · Dec 4, 2024", plays: "425.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Upworthy/Upworthy_12.4.24.mp4", postUrl: "https://www.instagram.com/p/DDKtoQgSz8q/" },
    ],
  },

  {
    event: "’24 IBC Amsterdam",
    reels: [
      { title: "’24 IBC: Premiere Pro AI: Emoji Reactions", sub: "@adobevideo · 2K likes · Sep 17, 2024", plays: "1.5M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/Emoji-Reactions-to-Premiere-Pro-AI-Features_9.17.24.mp4", postUrl: "https://www.instagram.com/p/DAB_Fb0BUWZ/" },
      { title: "’24 IBC: Premiere Pro Release (Customer Interviews)", sub: "@adobevideo · 724 likes · Sep 17, 2024", plays: "570.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/Premiere-Pro-Real-Life-Features_9.17.24.mp4", postUrl: "https://www.instagram.com/p/DACI4I7O8GK/" },
      { title: "’24 IBC: Event Recap", sub: "@adobevideo · 843 likes · Sep 18, 2024", plays: "684.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/IBC-Event-Coverage-Recap_9.18.24.mp4", postUrl: "https://www.instagram.com/p/DAEf4XeN5HT/" },
    ],
  },
  {
    event: "’24 MAX Miami",
    reels: [
      { title: "’24 MAX: Project Watercolor Master: Adobe Researcher Sneaks Interview", sub: "@adobe · 1.8K likes · Oct 9, 2024", plays: "1M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Watercolor-Master-Sneaks-Interview_10.9.24.mp4", postUrl: "https://www.instagram.com/p/DA6zD2MA7Jh/" },
      { title: "’24 MAX: Project Type Lab: Adobe Researcher Sneaks Interview", sub: "@adobe · 415 likes · Oct 10, 2024", plays: "111.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Project-Type-Lab-Sneaks-Interview_10.10.24.mp4", postUrl: "https://www.instagram.com/p/DA9EA1Mh0uv/" },
      { title: "’24 MAX: Project Generative Physics", sub: "@adobe · 381 likes · Oct 11, 2024", plays: "51.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Animations-Presets-Sneaks-Interview_10.11.24.mp4", postUrl: "https://www.instagram.com/p/DA_f8ShPIDZ/" },
      { title: "’24 MAX: In-Office Trivia", sub: "@adobe · 917 likes · Oct 11, 2024", plays: "143K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/In-Office-Event-Trivia_10.11.24.mp4", postUrl: "https://www.instagram.com/p/DA_xlkkJYTb/" },
      { title: "’24 MAX: Attendee Scavenger Hunt", sub: "@adobe · 897 likes · Oct 15, 2024", plays: "183.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Grabbing-the-Vibe-of-Adobe-MAX-Day-1_10.15.24.mp4", postUrl: "https://www.instagram.com/p/DBKMzc2v1M5/" },
      { title: "’24 MAX: 3 Things We Didn’t Expect", sub: "@adobecreativecloud · 586 likes · Oct 17, 2024", plays: "57.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Interactive-Event-Activation-Coverage_10.17.24.mp4", postUrl: "https://www.instagram.com/p/DBOzrP1IsyY/" },
      { title: "’24 MAX: Sneaks Reactions One Emoji", sub: "@adobe · 683 likes · Oct 17, 2024", plays: "47.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Reaction-to-SNEAKS-in-One-Emoji_10.17.24.mp4", postUrl: "https://www.instagram.com/p/DBPd7jKvT9p/" },
      { title: "’24 MAX: Beyond Your Job Title", sub: "@adobecreativecloud · 446 likes · Oct 18, 2024", plays: "41.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Defining-a-Creative-Video-Interview-Collage_10.18.24.mp4", postUrl: "https://www.instagram.com/p/DBSAnTctwG3/" },
      { title: "’24 MAX: Photoshop New Feature Demo", sub: "@photoshop · 1.1K likes · Nov 4, 2024", plays: "82.6K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Photoshop-Interview-Demo_11.4.24.mp4", postUrl: "https://www.instagram.com/p/DB9foJNJh8L/" },
      { title: "’24 MAX: Premiere Pro Demo", sub: "@adobevideo · 335 likes · Nov 13, 2024", plays: "233.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Premiere-Pro-Interview-Demo_11.13.24.mp4", postUrl: "https://www.instagram.com/p/DCUlhpMAWvB/" },
      { title: "’24 MAX: Adobe x Gatorade Activation", sub: "@adobe · 544 likes · Jan 8, 2025", plays: "52.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-Miami-2024/Gatorade-Activation-Partnership-Video_1.8.25.mp4", postUrl: "https://www.instagram.com/p/DElERFPtRwq/" },
    ],
  },
  {
    event: "’24 NAB Vegas",
    reels: [
      { title: "’24 NAB: Emoji Reaction Interviews", sub: "@adobevideo · 1.9K likes · Apr 16, 2024", plays: "350.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Emoji-Reaction-Interviews_4.16.24.mp4", postUrl: "https://www.instagram.com/p/C51y-zEKwAr/" },
      { title: "’24 NAB: Premiere Pro AI Announcement Reactions", sub: "@adobevideo · 4.7K likes · Apr 18, 2024", plays: "1.4M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Premiere-Pro-AI-Feature-Interviews_4.18.24.mp4", postUrl: "https://www.instagram.com/p/C56vDmUBrJI/" },
      { title: "’24 NAB: Premiere Enhanced Speech Live Test", sub: "@adobevideo · 163 likes · Apr 22, 2024", plays: "12.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Audio-Enhancements-Real-Time-Testing_4.22.24.mp4", postUrl: "https://www.instagram.com/p/C6E43DDsUfP/" },
      { title: "’24 NAB: Day-in-the-Life Recap", sub: "@adobevideo · 160 likes · Apr 23, 2024", plays: "11.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Day-in-the-Life-Event-Recap_4.23.24.mp4", postUrl: "https://www.instagram.com/p/C6HqT-KLF9R/" },
    ],
  },

  {
    event: "’25 Summit Vegas",
    reels: [
      { title: "’25 Summit: Coca-Cola Activation", sub: "@adobe · 1.5K likes · Mar 20, 2025", plays: "350.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Coca-Cola-Activation-Interview_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHZsBK7qAht/" },
      { title: "’25 Summit: Over & Under AI Enterprise Activity", sub: "@adobe · 1.4K likes · Mar 20, 2025", plays: "711.8K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Over-Under-AI-Enterprise-Activity_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHbh4advyRR/" },
      { title: "’25 Summit: Acrobat Escape Room", sub: "@adobeacrobat · 7K likes · Mar 20, 2025", plays: "2.6M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Acrobat-Escape-Room-Activity_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHb0O45vPtj/" },
      { title: "’25 Summit: “Describe Your Job” Interviews", sub: "@adobe · 318 likes · Mar 21, 2025", plays: "72.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Describe-Your-Job-Interview_3.21.25.mp4", postUrl: "https://www.instagram.com/p/DHef1x_M1uJ/" },
      { title: "’25 Summit: Coolest Job @Adobe S1", sub: "@adobelife · 684 likes · Mar 25, 2025", plays: "28.8K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Talent-Marketing-Best-Job_3.25.25.mp4", postUrl: "https://www.instagram.com/p/DHor6j0vyYS/" },
      { title: "’25 Summit: Sneaks Emoji Reactions", sub: "@adobe · 291 likes · Mar 26, 2025", plays: "23.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Summit-Reactions-Recap_3.26.25.mp4", postUrl: "https://www.instagram.com/p/DHq_NIfo-wC/" },
      { title: "’25 Summit: Hosted Event Recap", sub: "@adobe · 417 likes · Mar 28, 2025", plays: "72K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Summit-Event-Recap_3.28.25.mp4", postUrl: "https://www.instagram.com/p/DHwsrpri58C/" },
      { title: "’25 Summit: Ken Jeong Interview", sub: "@adobe · 249 likes · Mar 31, 2025", plays: "66K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Celebrity-Interview-Game_3.31.25.mp4", postUrl: "https://www.instagram.com/p/DH4N4rztmXU/" },
      { title: "’25 Summit: Escalator ‘Hot’ Takes", sub: "@adobe · 245 likes · Apr 2, 2025", plays: "51K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Summit-Hot-Takes_4.2.25.mp4", postUrl: "https://www.instagram.com/p/DH9hfTmBvr-/" },
    ],
  },
  {
    event: "’25 MAX LA",
    reels: [
      { title: "’25 MAX: Acrobat Booth", sub: "@adobeacrobat · 1.3K likes · Oct 31, 2025", plays: "1.6M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Acrobat-Booth_10.31.25.mp4", postUrl: "https://www.instagram.com/p/DQe3K4Zjpv9/" },
      { title: "’25 MAX: PDF Spaces is Everywhere", sub: "@adobeacrobat · 257 likes · Nov 7, 2025", plays: "30.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Acrobat_11.7.25.mp4", postUrl: "https://www.instagram.com/p/DQxFwiPDDxp/" },
      { title: "’25 MAX: James Gunn’s Filmmaking Assignment", sub: "@adobe · 4.8K likes · Nov 13, 2025", plays: "705.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/James-Gunn_11.13.25.mp4", postUrl: "https://www.instagram.com/p/DRAp2luAU89/" },
      { title: "’25 MAX: “Coolest Job” @Adobe | Firefly Feature", sub: "@adobelife · 30.5K likes · Nov 14, 2025", plays: "747.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Coolest-Job_11.14.25.mp4", postUrl: "https://www.instagram.com/p/DRC8V6JAkO1/" },
      { title: "’25 MAX: Mark Rober’s Creator Assignment", sub: "@adobe · 11.3K likes · Nov 19, 2025", plays: "2.2M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Mark-Rober_11.19.25.mp4", postUrl: "https://www.instagram.com/p/DRN6VRIjVhq/" },
      { title: "’25 MAX: Jessica Williams’ Creator Assignment", sub: "@adobe · 6.8K likes · Nov 20, 2025", plays: "264.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Jessica-Williams_11.20.25.mp4", postUrl: "https://www.instagram.com/p/DRQdSOoDjDv/" },
      { title: "’25 MAX: Navin’s Coolest Job", sub: "@adobe · 201 likes · Feb 13, 2026", plays: "85.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/MAX-2025-LA/Navin_2.13.26.mp4", postUrl: "https://www.instagram.com/p/DUtyVGskjGb/" },
      { title: "’25 MAX: Sarah Shen’s Coolest Job", sub: "@adobe · 198 likes · Feb 20, 2026", plays: "35.7K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/MAX-2025-LA/Firefly-Coolest-Job-Deep-Dives-Sarah_2.20.26.mp4", postUrl: "https://www.instagram.com/p/DU9ZnA-D_Xu/" },
    ],
  },
  {
    event: "’25 MAX London",
    reels: [
      { title: "’25 MAX London: Recap", sub: "@adobe · 690 likes · Apr 26, 2025", plays: "58.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/MAX-London-Event-Recap_4.26.25.mp4", postUrl: "https://www.instagram.com/p/DI7IQhWM2L3/" },
      { title: "’25 MAX London: Arches of Inspiration", sub: "@adobe · 188 likes · Apr 28, 2025", plays: "18.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Castle-Illustrator-Game_4.28.25.mp4", postUrl: "https://www.instagram.com/p/DJAQvZFp_Tl/" },
      { title: "’25 MAX London: Fonts Creator Game", sub: "@adobe · 1.4K likes · Apr 28, 2025", plays: "425K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Fonts-Creator-Game_4.28.25.mp4", postUrl: "https://www.instagram.com/p/DJAQxdstxfx/" },
      { title: "’25 MAX London: Firefly Explainer", sub: "@adobefirefly · 278 likes · Apr 29, 2025", plays: "24K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Firefly-Informational_4.29.25.mp4", postUrl: "https://www.instagram.com/p/DJC2KUPPwh3/" },
    ],
  },
  {
    event: "’25 NAB Vegas",
    reels: [
      { title: "’25 NAB: Premiere Pro Releases", sub: "@adobevideo · 951 likes · Apr 16, 2025", plays: "839.7K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/Premiere-Pro-Releases-2025-Interviews_4.16.25.mp4", postUrl: "https://www.instagram.com/p/DIhgGMSs2jJ/" },
      { title: "’25 NAB: Generative Extend Demo", sub: "@adobevideo · 289 likes · Apr 17, 2025", plays: "84.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/Generative-Extend-Activity_4.17.25.mp4", postUrl: "https://www.instagram.com/p/DIjjpFOMwm2/" },
      { title: "’25 NAB: Event Coverage", sub: "@adobevideo · 155 likes · Apr 17, 2025", plays: "39.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/NAB-General-Event-Coverage-Interviews_4.17.25.mp4", postUrl: "https://www.instagram.com/p/DIkB_V8STy1/" },
    ],
  },
  // Cannes pulled Jul 4 per Miles ("just take out cannes for now, i post
  // production producing on it but now it just looks weird") — restore by
  // uncommenting when the story around it is right.
  // {
  //   event: "Cannes",
  //   reels: [
  //     { title: "Cannes Lions Firefly Feature", sub: "@adobefirefly · 243 likes · Jun 26, 2026", plays: "27.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Cannes/Cannes-Produced-but-not-Hosted_6.26.26.mp4", postUrl: "https://www.instagram.com/p/DaEAIkyDrdo/" },
  //   ],
  // },
  {
    event: "Employee Spotlights: Season 1",
    reels: [
      { title: "Dave Werner Employee Spotlight", sub: "@adobelife · 26K likes · Aug 18, 2025", plays: "1.9M", role: "In-house production: produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Dave-Werner_8.18.25.mp4", postUrl: "https://www.instagram.com/p/DNgTb3hthgJ/" },
      { title: "Manasa Hari Employee Spotlight", sub: "@adobelife · 6.5K likes · Aug 20, 2025", plays: "809.5K", role: "In-house production: produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Mansa_8.20.25.mp4", postUrl: "https://www.instagram.com/p/DNlh970un2W/" },
      { title: "Bowen Wang Employee Spotlight", sub: "@adobelife · 2.5K likes · Aug 19, 2025", plays: "233.9K", role: "In-house production: produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Produced-and-Storyboarded-Bowen_8.19.25.mp4", postUrl: "https://www.instagram.com/p/DNixXhgNCbp/" },
    ],
  },
  {
    event: "Employee Spotlights: Season 2",
    reels: [
      { title: "Amanda Valenzuela Employee Spotlight", sub: "@adobe · 753 likes · Feb 9, 2026", plays: "171.4K", mp4: "/reels/2026/Evergreen-Producing/Amanda-Valenzuela-Employee-Spotlight_2.9.26.mp4", postUrl: "https://www.instagram.com/reel/DUjGBECDvM9/" },
      { title: "Gizem Dal Employee Spotlight", sub: "@adobelife · 115 likes · Mar 4, 2026", plays: "5.2K", mp4: "/reels/2026/Evergreen-Producing/Gizem-Dal-Employee-Spotlight_3.4.26.mp4", postUrl: "https://www.instagram.com/reel/DVe1rvOE2ME/" },
    ],
  },
  {
    event: "Employee Spotlights: Season 3",
    reels: [
      { title: "Imran Idzqandar Employee Spotlight", sub: "@adobe · 449 likes · May 27, 2026", plays: "281K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Be-You-Imran_5.27.26.mp4", postUrl: "https://www.instagram.com/p/DY2y6jbCesw/" },
      { title: "Russell Preston Brown Employee Spotlight", sub: "@adobe · 2.8K likes · May 4, 2026", plays: "143.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Russell_5.4.26.mp4", postUrl: "https://www.instagram.com/p/DX7hTuSErBK/" },
      { title: "Em Siegel Employee Spotlight", sub: "@adobe · 337 likes · May 11, 2026", plays: "50.7K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Be-You-Em-Siegel_5.11.26.mp4", postUrl: "https://www.instagram.com/p/DYNfjdwkYSU/" },
    ],
  },
  {
    event: "’26 Summit",
    reels: [
      { title: "’26 Summit: Sneaks Celebrity Host Interview", sub: "@adobe · 202 likes · Apr 30, 2026", plays: "22.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/SUMMIT-2026_4.30.26.mp4", postUrl: "https://www.instagram.com/p/DXw69j_E2U3/" },
      { title: "Brand Intelligence B2B Interview", sub: "@adobe · 277 likes · May 18, 2026", plays: "19.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/B2B-Interview-Brand-Intelligence_5.18.26.mp4", postUrl: "https://www.instagram.com/p/DYfgGfajprE/" },
      { title: "Coolest Job: Tongyu", sub: "@adobe · 230 likes · May 15, 2026", plays: "18.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Tongyu-Coolest-Job_5.15.26.mp4", postUrl: "https://www.instagram.com/p/DYX7HIrkqyB/" },
      { title: "Coolest Job: Eric", sub: "@adobe · 254 likes · May 14, 2026", plays: "17.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Eric-Coolest-Job_5.14.26.mp4", postUrl: "https://www.instagram.com/p/DYU72ovgswY/" },
      { title: "’26 Summit: Behind the Scenes of Sneaks", sub: "@adobe · 94 likes · May 29, 2026", plays: "", role: "Produced & Coached", landscape: true, mp4: "/reels/2026/Summit-2026/BTS-Sneaks-2026.mp4", postUrl: "https://www.linkedin.com/posts/adobe-for-business_inside-adobe-summit-sneaks-2026-activity-7466192897889996800-UEnr" },
      { title: "’26 Summit: Words of Wisdom with Iliza Shlesinger", sub: "YouTube · Apr 30, 2026", plays: "766", role: "Produced & Coached", landscape: true, mp4: "/reels/2026/Summit-2026/Words-of-Wisdom-Iliza.mp4", postUrl: "https://youtu.be/Yppr9COGl0o" },
      { title: "’26 Summit: Anil Chakravarthy Exec Interview", sub: "LinkedIn · Apr 17, 2026", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2026/Summit-2026/Anil-Chakravarthy-Pre-Summit.mp4", postUrl: "https://www.linkedin.com/posts/adobe_adobe-summit-anil-chakravarthy-ugcPost-7451028793734926336-5JmJ" },
    ],
  },
  {
    event: "’26 NAB Vegas",
    reels: [
      { title: "’26 NAB: Object Matte (OTG)", sub: "@adobevideo · 9.7K likes · Apr 23, 2026", plays: "1.1M", mp4: "/reels/2026/NAB-2026/Object-Matte-OTG_4.23.26.mp4", postUrl: "https://www.instagram.com/reel/DXfDr0Kj6Ug/" },
      { title: "’26 NAB: Color Mode (OTG)", sub: "@adobevideo · 2K likes · Apr 22, 2026", plays: "452.6K", mp4: "/reels/2026/NAB-2026/ColorMode-OTG_4.22.26.mp4", postUrl: "https://www.instagram.com/reel/DXcYL0dFCYo/" },
    ],
  },
  {
    event: "’25 IBC Amsterdam",
    reels: [
      { title: "’25 IBC: Recap", sub: "@adobevideo · 165 likes · Sep 23, 2025", plays: "23.2K", mp4: "/reels/2025/IBC-2025/IBC-Recap_9.23.25.mp4", postUrl: "https://www.instagram.com/reel/DO9bJcDCb1R/" },
      { title: "’25 IBC: Favorite Premiere Transitions", sub: "@adobevideo · 147 likes · Sep 19, 2025", plays: "44.8K", mp4: "/reels/2025/IBC-2025/Favorite-Transitions_9.19.25.mp4", postUrl: "https://www.instagram.com/reel/DOzGcIukzUD/" },
      { title: "’25 IBC: Premiere Pro Transitions Release", sub: "@adobevideo · 90 likes · Sep 19, 2025", plays: "30.5K", mp4: "/reels/2025/IBC-2025/Premiere-Transitions-Release_9.19.25.mp4", postUrl: "https://www.instagram.com/reel/DOy_iA-jPsD/" },
      { title: "’25 IBC: Premiere on Mobile Release", sub: "@adobe · 190 likes · Sep 30, 2025", plays: "", role: "Concepted, scripted, coached & produced", landscape: true, mp4: "/reels/2025/IBC-2025/Premiere-on-Mobile_9.30.25.mp4", postUrl: "https://www.linkedin.com/posts/mikefolgner_check-out-premiere-on-mobile-today-activity-7378906399935987714-kaDd" },
    ],
  },
  {
    event: "Artist Spotlights",
    reels: [
      { title: "San Jose Semaphore", sub: "@adobe · 3K likes · Jun 18, 2026", plays: "90.6K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/San-Jose-Semaphore_6.18.26.mp4", postUrl: "https://www.instagram.com/p/DZvKdPzFG65/" },
      { title: "Artist Spotlight: Aaron Gonzalez", sub: "@adobe · 268 likes · May 5, 2026", plays: "16.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Artist-Spotlight-Aaron-Gonzalez_5.5.26.mp4", postUrl: "https://www.instagram.com/p/DX9u5N4gPbd/" },
      { title: "Building Murals: Laura Garcia", sub: "@adobe · 546 likes · Nov 20, 2025", plays: "243.3K", role: "Produced", mp4: "/reels/2025/Brand-Partnerships/Building-Murals-Laura-Garcia_11.20.25.mp4", postUrl: "https://www.instagram.com/reel/DRQpeMIjeCw/" },
      { title: "Cracking the Semaphore Code", sub: "@adobe · 63 likes · Jun 18, 2026", plays: "2.1K", landscape: true, mp4: "/reels/2026/Artist-Spotlights/Cracking-the-Semaphore-Code_6.18.26.mp4", postUrl: "https://youtu.be/AipvOopN0M8" },
    ],
  },
  {
    event: "Always-On",
    reels: [
      { title: "Creative Cloud for Students Black Friday Discount", sub: "@adobe · 439 likes · Nov 30, 2024", plays: "831.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Employee-and-Always-On/Students-Black-Friday-Discount_11.30.24.mp4", postUrl: "https://www.instagram.com/p/DDAM0ZNCvo2/" },
      { title: "Firefly Interview Demo", sub: "@adobevideo · 979 likes · Sep 12, 2024", plays: "728.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Employee-and-Always-On/Firefly-Interview-Demo_9.12.24.mp4", postUrl: "https://www.instagram.com/p/C_0rxmZPxif/" },
      { title: "Intern Day Creative Cloud", sub: "@adobecreativecloud · 201 likes · Jul 31, 2025", plays: "28.1K", mp4: "/reels/2025/Evergreen-Producing/Intern-Day-Creative-Cloud_7.31.25.mp4", postUrl: "https://www.instagram.com/reel/DMyLF09uG1i/" },
    ],
  },
  {
    event: "Brand Partnerships",
    reels: [
      { title: "Kelley O'Hara x NWSL x Adobe", sub: "@adobe · 12.7K likes · Nov 17, 2025", plays: "366.7K", role: "In-house production: produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Kelley-Ohara_11.17.25.mp4", postUrl: "https://www.instagram.com/p/DRLSGTLgiZS/" },
      { title: "Photoshop x Marvel: Eyes of Wakanda", sub: "@photoshop · 2.7K likes · Sep 8, 2025", plays: "299K", mp4: "/reels/2025/Brand-Partnerships/Marvel-Eyes-of-Wakanda-Photoshop_9.8.25.mp4", postUrl: "https://www.instagram.com/reel/DOWitx1Afr1/" },
      { title: "Adobe x NWSL: 2025 Creator Club", sub: "@adobe · 896 likes · Aug 12, 2025", plays: "2.7M", mp4: "/reels/2025/Brand-Partnerships/NWSL-Creator-Club_8.12.25.mp4", postUrl: "https://www.instagram.com/reel/DNRX89SpIkC/" },
      { title: "Adobe x Golden State Warriors: Creative Threads", sub: "@adobe · 1.5K likes · May 23, 2025", plays: "225.2K", mp4: "/reels/2025/Brand-Partnerships/GSW-Creative-Threads_5.23.25.mp4", postUrl: "https://www.instagram.com/reel/DKAz21sPv0q/" },
    ],
  },
  {
    event: "Adobe × NFL",
    reels: [
      { title: "NFL x Adobe: Behind the Lens (LCC)", sub: "@adobe · 108 likes · Jun 8, 2026", plays: "484.9K", landscape: true, mp4: "/reels/2026/Made-to-Create/Behind-the-Lens-NFL-LCC.mp4", postUrl: "https://youtu.be/emLfQR3DPME" },
      { title: "NFL x Adobe: Season Opener Kickoff", sub: "@adobe · 1.3K likes · Sep 5, 2025", plays: "", mp4: "/reels/2025/NFL-Kickoff/NFL-Season-Opener-Carousel.mp4", postUrl: "https://www.instagram.com/p/DOPM4FmkpE_/" },
    ],
  },
  {
    event: "Adobe MAX Product Demos",
    reels: [
      { title: "GenStudio for Performance Marketing Demo", sub: "LinkedIn · 58 reactions · Nov 13, 2024", plays: "", role: "Hosted; content strategy; concept to published", mp4: "/reels/2024/GenStudio/GenStudio-Performance-Marketing.mp4", postUrl: "https://www.linkedin.com/posts/adobe-for-business_adobe-genstudio-for-performance-marketing-activity-7262556392153055232-xLqm" },
      { title: "Exec Thought Leadership: TikTok Your Ad Has Just 10 Seconds to Live", sub: "LinkedIn · 19 reactions · Oct 30, 2025", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2025/GenStudio-TL/TikTok-10-Seconds.mp4", postUrl: "https://www.linkedin.com/posts/tap-into-tiktoks-18b-monthly-users-with-ugcPost-7389722765508935681-Mov9" },
      { title: "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language", sub: "LinkedIn · 33 reactions · Oct 30, 2025", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2025/GenStudio-TL/Go-Global.mp4", postUrl: "https://www.linkedin.com/posts/go-global-with-confidence-genstudio-for-ugcPost-7389692893927698432-6aFM" },
      { title: "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish", sub: "LinkedIn · 23 reactions · Nov 13, 2025", plays: "", role: "Produced", mp4: "/reels/2025/GenStudio-TL/Goldfish-Attention.mp4", postUrl: "https://www.linkedin.com/posts/purnimarroy_attention-spans-are-shorter-than-ever-and-ugcPost-7394620260328488961-EbUw" },
    ],
  },
  {
    event: "’25 MAX Customer Stories",
    reels: [
      { title: "’25 MAX Customer Story: Intuit", sub: "LinkedIn · 26 reactions · Dec 8, 2025", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2025/GenStudio-Customer-Stories/Intuit-Audrey-Timpe.mp4", postUrl: "https://www.linkedin.com/posts/intuits-audrey-timpe-shares-how-ai-has-become-ugcPost-7403901188343328768-lISN" },
      { title: "’25 MAX Customer Story: Wyndham Hotels", sub: "LinkedIn · 148 reactions · Jan 21, 2026", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2026/GenStudio-Customer-Stories/Wyndham-Marissa-Yoss.mp4", postUrl: "https://www.linkedin.com/posts/adobe-for-business_everything-good-comes-from-real-human-insight-activity-7419788674906759168-W8Fk" },
    ],
  },
  {
    event: "Photoshop Archives",
    reels: [
      { title: "’26 PS Archives: Russell Brown x Matthew Richmond (Podcast)", sub: "@photoshop · 104 likes · Mar 3, 2026", plays: "145.5K", landscape: true, mp4: "/reels/2026/Photoshop-Archives/PS-Archives-Podcast.mp4", postUrl: "https://youtu.be/UQUBT0kw3WA" },
      { title: "’26 PS Archives: The Power of Small Tools", sub: "@photoshop · 4.5K likes · Mar 30, 2026", plays: "829.9K", mp4: "/reels/2026/Photoshop-Archives/Power-of-Small-Tools_3.30.26.mp4", postUrl: "https://www.instagram.com/reel/DWhcBanEvld/" },
      { title: "’26 PS Archives: 1st Satisfying Project", sub: "@photoshop · 2.1K likes · Mar 9, 2026", plays: "734.8K", mp4: "/reels/2026/Photoshop-Archives/1st-Satisfying-Project_3.9.26.mp4", postUrl: "https://www.instagram.com/reel/DVrH3rxiUdw/" },
      { title: "’26 PS Archives: Tools Don’t Make Things", sub: "@photoshop · 361 likes · Mar 5, 2026", plays: "85.5K", mp4: "/reels/2026/Brand-Partnerships/Photoshop-Archives-Russell-Matthew_3.5.26.mp4", postUrl: "https://www.instagram.com/reel/DVgpCMOkduU/" },
      { title: "’26 PS Archives: Tools Don’t Know When Something is Good", sub: "@photoshop · 2.8K likes · Mar 16, 2026", plays: "713.7K", mp4: "/reels/2026/Photoshop-Archives/Tools-Dont-Know-Whats-Good_3.16.26.mp4", postUrl: "https://www.instagram.com/reel/DV9Idx2AInv/" },
      // ===== THE 4 HUNTED CUTDOWNS (added Aug 10 2026) =====
      // Found by the Aug-7 hunt (research/HUNT-RESULTS-2026-08-07.md §3) and held
      // out of the site until attribution was confirmed, because a caption proves
      // a reel is Photoshop Archives content, not that it is Miles's deliverable.
      // He confirmed tonight: "yes these are my deliverables." Every field below
      // is copied from that doc's table — shortcode, date, plays, likes — nothing
      // re-derived and nothing rounded except likes, which follow the playlist's
      // existing K convention (the five rows above are rounded the same way).
      // TITLES ARE DRAFTS from his captions, flagged for his glance. They take
      // this playlist's ’YY prefix because all five rows above have it and a row
      // without one reads as a mistake.
      { title: "’26 PS Archives: Why Layers Exist", sub: "@photoshop · 1.4K likes · Jun 19, 2026", plays: "123.7K", mp4: "/reels/2026/Photoshop-Archives/PS-Archives-Why-Layers-Exist_6.19.26.mp4", postUrl: "https://www.instagram.com/reel/DZvGcEsgR_A/" },
      { title: "’26 PS Archives: Experiment, Fail, Repeat", sub: "@photoshop · 555 likes · Jan 22, 2026", plays: "130.2K", mp4: "/reels/2026/Photoshop-Archives/PS-Archives-Renee-Robyn-Experiment-Fail-Repeat_1.22.26.mp4", postUrl: "https://www.instagram.com/reel/DTyz50kkfNZ/" },
      { title: "’26 PS Archives: Renee Robyn’s Top Tools", sub: "@photoshop · 1.3K likes · Jan 5, 2026", plays: "181K", mp4: "/reels/2026/Photoshop-Archives/PS-Archives-Renee-Robyn-Top-Tools_1.5.26.mp4", postUrl: "https://www.instagram.com/reel/DTIwMzuiI57/" },
      { title: "’25 PS Archives: Renee Robyn on Harmonize", sub: "@photoshop · 973 likes · Dec 18, 2025", plays: "152.5K", mp4: "/reels/2025/Photoshop-Archives/PS-Archives-Renee-Robyn-Harmonize_12.18.25.mp4", postUrl: "https://www.instagram.com/reel/DSaSU5xjrBJ/" },
      // ===== THE 6 LONGFORM EPISODES (added Aug 10 2026) — WATCH-ONLY =====
      // His ruling tonight, verbatim: "all of the archives episodes that you
      // shared are mine, concpeted directed and produced." These are the full
      // YouTube episodes behind the cutdowns above, 27 to 61 minutes each. No
      // mp4 by design (see `watchOnly`): the row carries YouTube's own official
      // thumbnail and opens the episode there. View counts are verbatim from
      // HUNT-RESULTS §3's longform table, formatted to the site's K convention.
      // Subs follow the Miles-on-YouTube rows' shape ("YouTube · <date>") — that
      // is the house pattern for YouTube-sourced rows, and YouTube publishes no
      // like count in that data, so no likes segment is invented.
      // TITLES ARE DRAFTS from the guest names, flagged for his glance.
      { title: "’25 PS Archives Episode: Renee Robyn", sub: "YouTube · Dec 18, 2025", plays: "41.7K", landscape: true, runtime: "27:32", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Renee-Robyn.jpg", postUrl: "https://www.youtube.com/watch?v=brXMscxoJI4" },
      { title: "’25 PS Archives Episode: The Design Journey", sub: "YouTube · Oct 16, 2025", plays: "1.5K", landscape: true, runtime: "47:06", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Design-Journey.jpg", postUrl: "https://www.youtube.com/watch?v=KVAmneBxEqU" },
      { title: "’25 PS Archives Episode: John & Thomas Knoll", sub: "YouTube · Sep 11, 2025", plays: "3.6K", landscape: true, runtime: "1:01:08", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Knoll-Brothers.jpg", postUrl: "https://www.youtube.com/watch?v=rqf6vsFPYcg" },
      { title: "’25 PS Archives Episode: Jeff Schewe", sub: "YouTube · May 29, 2025", plays: "5.1K", landscape: true, runtime: "36:49", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Jeff-Schewe.jpg", postUrl: "https://www.youtube.com/watch?v=wQmtF3J0L2I" },
      { title: "’25 PS Archives Episode: Michael Shainblum", sub: "YouTube · Feb 27, 2025", plays: "3.2K", landscape: true, runtime: "29:08", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Michael-Shainblum.jpg", postUrl: "https://www.youtube.com/watch?v=13GWPb-c2Ec" },
      { title: "’25 PS Archives Episode: Joel Grimes", sub: "YouTube · Feb 19, 2025", plays: "5.6K", landscape: true, runtime: "28:41", thumb: "/thumbs/2025/Photoshop-Archives/PS-Archives-Ep-Joel-Grimes.jpg", postUrl: "https://www.youtube.com/watch?v=Q6xZoFSdEnw" },
    ],
  },
  // ——— Personal / Off the Clock ———
  {
    event: "Miles Music Media",
    reels: [
      { title: "Happy 100th Birthday Miles Davis", sub: "@milesmusicmedia · 3.7K likes · May 25, 2026", plays: "40K", mp4: "/reels/2026/Miles-Music-Media/Happy-100th-Birthday-Miles-Davis_5.25.26.mp4", postUrl: "https://www.instagram.com/p/DYwEdpmIGwt/" },
      { title: "In Walked Bud", sub: "@milesmusicmedia · 1.6K likes · Apr 6, 2026", plays: "25.8K", mp4: "/reels/2026/Miles-Music-Media/In-Walked-Bud_4.6.26.mp4", postUrl: "https://www.instagram.com/p/DWxVESoDCR5/" },
      { title: "Ornithology", sub: "@milesmusicmedia · 1.2K likes · Apr 21, 2026", plays: "20.6K", mp4: "/reels/2026/Miles-Music-Media/Ornithology_4.21.26.mp4", postUrl: "https://www.instagram.com/p/DXaB8HAkn42/" },
      { title: "Donna Lee", sub: "@milesmusicmedia · 1.3K likes · Feb 22, 2026", plays: "20K", mp4: "/reels/2026/Miles-Music-Media/Donna-Lee_2.22.26.mp4", postUrl: "https://www.instagram.com/p/DVDOzkiCOJ7/" },
      { title: "Sonny Rollins Tribute", sub: "@milesmusicmedia · 1.8K likes · May 26, 2026", plays: "19.5K", mp4: "/reels/2026/Miles-Music-Media/Dont-Forget-to-Follow-Milesmusicmedia_5.26.26.mp4", postUrl: "https://www.instagram.com/p/DYy-G16IFKZ/" },
      { title: "Confirmation", sub: "@milesmusicmedia · 1.1K likes · Mar 12, 2026", plays: "18.9K", mp4: "/reels/2026/Miles-Music-Media/Confirmation_3.12.26.mp4", postUrl: "https://www.instagram.com/p/DVxcAn_jWt3/" },
      { title: "Contrafacts", sub: "@milesmusicmedia · 824 likes · Apr 4, 2026", plays: "15.4K", mp4: "/reels/2026/Miles-Music-Media/Contrafacts_4.4.26.mp4", postUrl: "https://www.instagram.com/p/DWsh2AHCF1z/" },
      { title: "Miles Davis Might Be a Thief (Four)", sub: "@milesmusicmedia · 823 likes · Mar 5, 2026", plays: "13.1K", mp4: "/reels/2026/Miles-Music-Media/Miles-Davis-Might-Be-a-Thief_3.5.26.mp4", postUrl: "https://www.instagram.com/p/DVfdB5aDRDA/" },
      { title: "What's the Difference Between the", sub: "@milesmusicmedia · 860 likes · Mar 9, 2026", plays: "13.1K", mp4: "/reels/2026/Miles-Music-Media/Whats-the-Difference-Between-the_3.9.26.mp4", postUrl: "https://www.instagram.com/p/DVp_PjbiHwO/" },
      { title: "Now Watch Again What Color Was", sub: "@milesmusicmedia · 421 likes · May 2, 2026", plays: "7.3K", mp4: "/reels/2026/Miles-Music-Media/Now-Watch-Again-What-Color-was_5.2.26.mp4", postUrl: "https://www.instagram.com/p/DX03tWKORZB/" },
      { title: "Ornithology Was Written by a Trumpet", sub: "@milesmusicmedia · 367 likes · Apr 21, 2026", plays: "6.7K", mp4: "/reels/2026/Miles-Music-Media/Ornithology-was-Written-by-a-Trumpet_4.21.26.mp4", postUrl: "https://www.instagram.com/p/DXaBNKyEoDF/" },
      { title: "Guess Who I've Been Listening", sub: "@milesmusicmedia · 301 likes · May 29, 2026", plays: "5.8K", mp4: "/reels/2026/Miles-Music-Media/Guess-Who-Ive-Been-Listening_5.29.26.mp4", postUrl: "https://www.instagram.com/p/DY8JAhlvSX_/" },
      { title: "Miles Davis Might Be a Thief", sub: "@milesmusicmedia · 393 likes · Mar 4, 2026", plays: "5.7K", mp4: "/reels/2026/Miles-Music-Media/Miles-Davis-Might-Be-a-Thief_3.4.26.mp4", postUrl: "https://www.instagram.com/p/DVd7SiIlCid/" },
      { title: "Have You Ever Just Binged Research", sub: "@milesmusicmedia · 248 likes · Apr 12, 2026", plays: "5.2K", mp4: "/reels/2026/Miles-Music-Media/Have-You-Ever-Just-Binged-Research_4.12.26.mp4", postUrl: "https://www.instagram.com/p/DXBii0_DhKB/" },
      { title: "You Either Love the Tune or", sub: "@milesmusicmedia · 394 likes · Feb 23, 2026", plays: "5.1K", mp4: "/reels/2026/Miles-Music-Media/You-Either-Love-the-Tune-or_2.23.26.mp4", postUrl: "https://www.instagram.com/p/DVFcFplCAHW/" },
      { title: "Sonny Rollins to Pay Tribute Rest", sub: "@milesmusicmedia · 379 likes · May 27, 2026", plays: "4.6K", mp4: "/reels/2026/Miles-Music-Media/Sonny-Rollins-to-Pay-Tribute-Rest_5.27.26.mp4", postUrl: "https://www.instagram.com/p/DY0p3nZoWrp/" },
      { title: "Bruh First Time Playing a Transcription", sub: "@milesmusicmedia · 208 likes · May 25, 2026", plays: "4.4K", mp4: "/reels/2026/Miles-Music-Media/Bruh-First-Time-Playing-a-Transcription_5.25.26.mp4", postUrl: "https://www.instagram.com/p/DYxliOySZLr/" },
      { title: "Ear Training Is the Most Underrated", sub: "@milesmusicmedia · 87 likes · Mar 11, 2026", plays: "4.4K", mp4: "/reels/2026/Miles-Music-Media/Ear-Training-is-the-Most-Underrated_3.11.26.mp4", postUrl: "https://www.instagram.com/p/DVutESTiEm-/" },
      { title: "Happy Jazz History Month More to", sub: "@milesmusicmedia · 248 likes · Apr 2, 2026", plays: "4.1K", mp4: "/reels/2026/Miles-Music-Media/Happy-Jazz-History-Month-More-to_4.2.26.mp4", postUrl: "https://www.instagram.com/p/DWnr7lKiI15/" },
      { title: "Back in New York I Had", sub: "@milesmusicmedia · 114 likes · Mar 4, 2026", plays: "4K", mp4: "/reels/2026/Miles-Music-Media/Back-in-New-York-I-Had_3.4.26.mp4", postUrl: "https://www.instagram.com/p/DVc0W4SCFnI/" },
      { title: "Confirmation Is a Beast but Hopefully", sub: "@milesmusicmedia · 301 likes · Mar 14, 2026", plays: "4K", mp4: "/reels/2026/Miles-Music-Media/Confirmation-is-a-Beast-but-Hopefully_3.14.26.mp4", postUrl: "https://www.instagram.com/p/DV2e_-DiJf7/" },
    ],
  },
  {
    event: "Miles.Spearman",
    reels: [
      { title: "Behind the Product", sub: "@miles.spearman · 21 likes · Jul 3, 2026", plays: "287", mp4: "/reels/2026/Behind-the-Vision/Behind-the-Vision_7.3.26.mp4", postUrl: "https://www.instagram.com/reel/DaVOW5YB-nb/" },
    ],
  },
  {
    // "Miles Music & Media" YouTube channel (UCIcilFbIwXOdH1bYFoF632Q) — the
    // 12 highest-viewed of the 41 videos clearing 2K views (harvested Jul 6
    // via yt-dlp, exact public counts). Remaining 29 listed in the handoff.
    event: "Miles on YouTube",
    reels: [
      { title: "Trying Out My First Marching Band Meme", sub: "YouTube · Feb 9, 2024", plays: "12.2K", mp4: "/reels/2024/Miles-on-YouTube/Marching-Band-Meme.mp4", postUrl: "https://www.youtube.com/watch?v=s2zRgn_c8nE" },
      { title: "Play THIS if You Want to Sound Good in Jazz", sub: "YouTube · Jan 28, 2024", plays: "11.6K", mp4: "/reels/2024/Miles-on-YouTube/Play-This-Sound-Good-Jazz.mp4", postUrl: "https://www.youtube.com/watch?v=hAA_rZcaOYI" },
      { title: "Play THIS Lick if You Want to Sound Good in Jazz", sub: "YouTube · Apr 11, 2024", plays: "11.5K", mp4: "/reels/2024/Miles-on-YouTube/Play-This-Lick-Sound-Good-Jazz.mp4", postUrl: "https://www.youtube.com/watch?v=bPA8Br0JBCM" },
      { title: "POV: Your Trumpet Lips Are Feeling Good", sub: "YouTube · Mar 5, 2024", plays: "10.1K", mp4: "/reels/2024/Miles-on-YouTube/POV-Trumpet-Lips.mp4", postUrl: "https://www.youtube.com/watch?v=-uUmEoFVeFI" },
      { title: "Day 12 of Testing My High Range on Trumpet", sub: "YouTube · Mar 22, 2024", plays: "8.6K", mp4: "/reels/2024/Miles-on-YouTube/Day-12-High-Range.mp4", postUrl: "https://www.youtube.com/watch?v=zwae6cauLlU" },
      { title: "Play THIS if You Sound Good in Jazz Pt 3", sub: "YouTube · Mar 10, 2024", plays: "8.5K", mp4: "/reels/2024/Miles-on-YouTube/Play-This-Sound-Good-Jazz-Pt3.mp4", postUrl: "https://www.youtube.com/watch?v=v69bdadlUJY" },
      { title: "How to SOLO Over Autumn Leaves | Full Jazz Improvisation Lesson", sub: "YouTube · Mar 11, 2024", plays: "7.5K", landscape: true, mp4: "/reels/2024/Miles-on-YouTube/Autumn-Leaves-Improv-Lesson.mp4", postUrl: "https://www.youtube.com/watch?v=Oq86rsWwyzU" },
      { title: "Day 7 of Testing My High Range on Trumpet", sub: "YouTube · Mar 15, 2024", plays: "7.1K", mp4: "/reels/2024/Miles-on-YouTube/Day-7-High-Range.mp4", postUrl: "https://www.youtube.com/watch?v=YPkEz-51QzY" },
      { title: "How to Solo Over “Take the A-Train” | Full Jazz Improvisation Lesson", sub: "YouTube · Feb 6, 2024", plays: "6.9K", landscape: true, mp4: "/reels/2024/Miles-on-YouTube/A-Train-Improv-Lesson.mp4", postUrl: "https://www.youtube.com/watch?v=NCzKGl8uunU" },
      { title: "Funkytown / I Got You (Lucky Chops)", sub: "YouTube · Dec 1, 2018", plays: "6.6K", landscape: true, mp4: "/reels/2024/Miles-on-YouTube/Funkytown-Lucky-Chops.mp4", postUrl: "https://www.youtube.com/watch?v=gIKN0Ddz4F4" },
      { title: "There Will Never Be Another You", sub: "YouTube · Feb 5, 2024", plays: "6.3K", mp4: "/reels/2024/Miles-on-YouTube/There-Will-Never-Be-Another-You.mp4", postUrl: "https://www.youtube.com/watch?v=G9UHGABsRhU" },
      { title: "Play This Jazz Lick in Your Next Solo", sub: "YouTube · Feb 5, 2024", plays: "5.6K", mp4: "/reels/2024/Miles-on-YouTube/Play-This-Lick-Next-Solo.mp4", postUrl: "https://www.youtube.com/watch?v=501sl93NYy0" },
    ],
  },
];

// Miles's four TYPE buckets (confirmed Aug 7 2026) — every playlist belongs to
// exactly one. Supersedes the old 3-library split (Events / In-House / Off The
// Clock): Brand Partnerships is now its own type, and it is built to grow.
const BUCKET_OF = {
  // Event Coverage — the on-location event runs
  "’24 MAX Miami": "Event Coverage", "’25 MAX LA": "Event Coverage", "’25 MAX London": "Event Coverage",
  "’25 Summit Vegas": "Event Coverage", "’24 NAB Vegas": "Event Coverage", "’25 NAB Vegas": "Event Coverage", "’26 NAB Vegas": "Event Coverage",
  "’24 IBC Amsterdam": "Event Coverage", "’25 IBC Amsterdam": "Event Coverage", "’26 Summit": "Event Coverage", // Cannes pulled Jul 4 (Miles)
  // In-House Production — evergreen producing, employee/always-on, side projects
  "Employee Spotlights: Season 1": "In-House Production", "Employee Spotlights: Season 2": "In-House Production", "Employee Spotlights: Season 3": "In-House Production",
  "Artist Spotlights": "In-House Production", "Always-On": "In-House Production", "Photoshop Archives": "In-House Production",
  "Side Projects": "In-House Production", "Adobe MAX Product Demos": "In-House Production", "’25 MAX Customer Stories": "In-House Production",
  // Brand Partnerships — the NWSL/O'Hara playlist plus the NFL partnership.
  // More reels land here later; the group grows, no placeholder rows.
  "Brand Partnerships": "Brand Partnerships", "Adobe × NFL": "Brand Partnerships",
  // Off the Clock — unchanged
  "Miles Music Media": "Off the Clock", "Miles.Spearman": "Off the Clock", "Miles on YouTube": "Off the Clock",
  // "Making B2B Social Friendly" (pinned) is deliberately ABSENT: it mirrors
  // reels from three different buckets, so it belongs to none. It stays pinned
  // at the top of the full sidebar and is skipped by every bucket total.
};
const BUCKET_ORDER = ["Event Coverage", "In-House Production", "Brand Partnerships", "Off the Clock"];
const bucketSlug = (b) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Bucket order first, most recent projects first within each (Miles's call).
// Off the Clock keeps his authored order: Miles Music Media, then Miles.Spearman.
const reelDate = (r) => Date.parse(r.sub.split(" · ").pop()) || 0;
// ===== B2B playlist (Miles Jul 6): the same reels as the "Making B2B Social
// Friendly" square, surfaced as a playlist PINNED to the top of the sidebar.
// The event is `pinned` — reels are REFERENCES to reels
// that already live in other playlists, so every derived total (TOTAL_REELS,
// TOTAL_PLAYS, likes), the timeline, and the opening wall skip it to avoid
// double-counting.
const B2B_PLAYLIST_SPEC = [
  { t: "’26 Summit: Sneaks Celebrity Host Interview", album: "’26 Summit" },
  { t: "’26 Summit: Anil Chakravarthy Exec Interview", album: "’26 Summit" },
  { t: "’26 Summit: Words of Wisdom with Iliza Shlesinger", album: "’26 Summit" },
  { t: "’25 Summit: Ken Jeong Interview", album: "’25 Summit" },
  { t: "’25 Summit: Acrobat Escape Room", album: "’25 Summit" },
  { t: "’25 Summit: Hosted Event Recap", album: "’25 Summit" },
  { t: "’25 Summit: “Describe Your Job” Interviews", album: "’25 Summit" },
  { t: "’25 Summit: Escalator ‘Hot’ Takes", album: "’25 Summit" },
  { t: "’25 Summit: Sneaks Emoji Reactions", album: "’25 Summit" },
  { t: "’25 MAX Customer Story: Wyndham Hotels", album: "Customer Stories" },
  { t: "’25 MAX Customer Story: Intuit", album: "Customer Stories" },
  { t: "Exec Thought Leadership: TikTok Your Ad Has Just 10 Seconds to Live", album: "Exec Thought Leadership" },
  { t: "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language", album: "Exec Thought Leadership" },
  { t: "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish", album: "Exec Thought Leadership" },
  { t: "GenStudio for Performance Marketing Demo", album: "Product Releases" },
  { t: "Brand Intelligence B2B Interview", album: "Product Releases" },
  { t: "’26 Summit: Behind the Scenes of Sneaks", album: "Product Releases" },
  { t: "’25 IBC: Premiere on Mobile Release", album: "Product Releases" },
];
portfolio.unshift({
  event: "Making B2B Social Friendly",
  pinned: true,
  reels: B2B_PLAYLIST_SPEC.map(({ t }) => {
    for (const ev of portfolio) { const r = ev.reels.find(x => x.title === t); if (r) return r; }
    return null;
  }).filter(Boolean),
});
portfolio.sort((a, b) => {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1; // B2B stays on top
  const la = BUCKET_ORDER.indexOf(BUCKET_OF[a.event]), lb = BUCKET_ORDER.indexOf(BUCKET_OF[b.event]);
  if (la !== lb) return la - lb;
  if (BUCKET_OF[a.event] === "Off the Clock") return 0; // authored order
  return Math.max(...b.reels.map(reelDate)) - Math.max(...a.reels.map(reelDate));
});

// Derived stats (computed from the data above, never hand-typed)
const fmtWindow = (ev) => {
  const ds = ev.reels.map(reelDate).filter(Boolean);
  if (!ds.length) return "";
  const a = new Date(Math.min(...ds)), b = new Date(Math.max(...ds));
  const md = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (a.getTime() === b.getTime()) return `${md(a)}, ${a.getFullYear()}`;
  if (a.getFullYear() === b.getFullYear()) return `${md(a)} – ${md(b)}, ${a.getFullYear()}`;
  return `${md(a)}, ${a.getFullYear()} – ${md(b)}, ${b.getFullYear()}`;
};
const eventStats = portfolio.map((ev, i) => {
  const top = [...ev.reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return {
    ...ev, idx: i,
    cover: thumbOf(top), // playlist art = frame from its top-played reel
    role: EVENT_ROLES[ev.event] || "",
    totalPlays: ev.reels.reduce((s, r) => s + playsNum(r.plays), 0),
    window: fmtWindow(ev), // posting window, derived from reel dates only
  };
});
// Pinned virtual playlists hold REFERENCES to reels owned by other events —
// every total skips them so nothing is counted twice.
const TOTAL_REELS = portfolio.reduce((s, ev) => s + (ev.pinned ? 0 : ev.reels.length), 0);
const TOTAL_PLAYS = eventStats.reduce((s, ev) => s + (ev.pinned ? 0 : ev.totalPlays), 0);
// Likes live inside each reel's sub string ("· 1.8K likes ·") — derived, never typed
const likesNum = (sub) => { const m = sub.match(/([\d.]+K|[\d.]+M|\d+) likes/i); return m ? playsNum(m[1]) : 0; };
const TOTAL_LIKES = portfolio.reduce((s, ev) => s + (ev.pinned ? 0 : ev.reels.reduce((a, r) => a + likesNum(r.sub), 0)), 0);

// ===== ROLE GROUPS (Aug 9 2026, "Scheme 1" — Miles confirmed) =====
// #/work groups by WHAT MILES DID, not by what kind of shoot it was. The type
// buckets above are NOT deleted: they still drive the homepage sidebar, the
// sort and the timeline, and they now also supply the small type word on each
// playlist section, so the "Event coverage" fact survives without new copy.
//
// Membership is DERIVED by reading each playlist's own EVENT_ROLES line. No
// playlist is hand-assigned to a group and none can be dropped: a role line
// that names hosting is a hosted run, the "1-Person Production" line is the
// off-the-clock class, and every remaining credit is a produced credit.
const ROLE_CUT = "Cut by Me";
// Aug 10 2026 — Miles renamed both cards. The old labels stacked his whole
// credit line into the group name ("Hosted, Creative Directed, & Produced" /
// "Produced & Creatively Directed") and read as a resume line on a card that is
// meant to be a shelf label. His new names are short and plain.
// SCOPE OF THE RENAME: the GROUP DISPLAY NAME only. Every playlist's own
// EVENT_ROLES line is untouched and still says exactly what he did on that run,
// membership still derives from those lines (roleClassOf below reads the line,
// never the group name), the chips are untouched, and BUCKET_INTROS stays keyed
// by these constants so each page keeps the same summary it had.
// Slugs re-derive from the name, so #/work/hosted-on-camera and
// #/work/produced-in-house are the new routes. The two OLD slugs now miss
// ROLE_BY_SLUG, and routeFromHash already falls back to the #/work grid for an
// unknown slug (never a 404), which is the graceful landing for an old link.
const ROLE_HOSTED = "Hosted on Camera";
const ROLE_PRODUCED = "Produced In-House";
const ROLE_OFF = "Off the Clock";
const ROLE_GROUP_ORDER = [ROLE_CUT, ROLE_HOSTED, ROLE_PRODUCED, ROLE_OFF];
const roleClassOf = (ev) => {
  if (ev.pinned) return null; // the B2B mirror spans three roles, so it joins none
  const r = EVENT_ROLES[ev.event] || "";
  if (/1-Person Production/i.test(r)) return ROLE_OFF;
  if (/hosted/i.test(r)) return ROLE_HOSTED;
  // Everything else is a produced credit. Written as a fallback on purpose:
  // a playlist with an unfamiliar role line lands in the closest class rather
  // than falling off the site.
  return ROLE_PRODUCED;
};

// "Cut by Me" is a REEL-level collection, not a playlist. It mirrors every reel
// Miles names as his own edit — his Aug-1 email (ROLE_CREDITS, keyed by
// shortcode) plus every E / EE row from his Aug-10 tagging pass — grouped under
// the playlist each reel actually lives in so provenance stays visible.
// Aug 10: this is the group the tagging doc was written to grow, and it did:
// the jazz library, '25 NAB, the Students Black Friday spot and @UofCincy all
// join the IBC/NAB/MAX reels that were already here. Later the same day his
// answer on the YouTube channel ("did everything it's the same as the jazz —
// they join cut by me") added a ninth section, "Miles on YouTube", 12 more
// reels: 36 becomes 48. Mirrors move no derived
// total — TOTAL_REELS / TOTAL_PLAYS read `portfolio`, which this never joins —
// exactly how the pinned B2B playlist behaves.
const cutByMeSections = eventStats.flatMap(ev => {
  if (ev.pinned) return [];
  const reels = ev.reels.filter(cutByMeReel);
  if (!reels.length) return [];
  const top = [...reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return [{
    ...ev, reels, cover: thumbOf(top),
    totalPlays: reels.reduce((s, r) => s + playsNum(r.plays), 0),
    window: fmtWindow({ reels }),
  }];
});

// Group-level stats for the #/work grid. Every number DERIVED from the same
// rows the player uses, never hand-typed. Card art follows the playlist-cover
// rule: the real frame from the group's top-played reel, never emoji/stock.
const roleStats = ROLE_GROUP_ORDER.map(name => {
  const mirror = name === ROLE_CUT;
  const found = mirror ? cutByMeSections : eventStats.filter(ev => !ev.pinned && roleClassOf(ev) === name);
  // Panel review Aug 10: the Produced page opened on a 77.9K playlist of N/A
  // rows while the 2.7M run sat eleventh. Its sections lead with reach. Only
  // this group is re-sorted — the hosted event runs read as a run of shows and
  // their order is the order they happened in.
  const playlists = name === ROLE_PRODUCED ? [...found].sort((a, b) => b.totalPlays - a.totalPlays) : found;
  const reels = playlists.flatMap(ev => ev.reels);
  const top = [...reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return {
    name, slug: bucketSlug(name), playlists, mirror,
    reelCount: reels.length,
    totalPlays: reels.reduce((s, r) => s + playsNum(r.plays), 0),
    cover: top ? thumbOf(top) : "",
  };
}).filter(g => g.playlists.length);
const ROLE_BY_SLUG = Object.fromEntries(roleStats.map(g => [g.slug, g.name]));
// The one derived count string every role surface prints, card and page. A
// mirror group's "playlists" are the homes its reels were pulled from, not
// collections of its own, so that segment is dropped rather than reworded.
const groupCount = (g) => `${g.mirror ? "" : `${g.playlists.length} ${g.playlists.length === 1 ? "playlist" : "playlists"} · `}${g.reelCount} ${g.reelCount === 1 ? "reel" : "reels"}${g.totalPlays > 0 ? ` · ${fmtPlays(g.totalPlays)} plays` : ""}`;

// ===== CAREER TIMELINE data (professional work only; jazz/Off the Clock fenced out) =====
const TL_CAT = {
  "Event Coverage": { accent: C.gold, chip: "ON LOCATION" },
  "In-House Production": { accent: "#4EA8DE", chip: "IN-HOUSE" },
  // New Aug 7 bucket — the chip is the bucket name itself, no new claim.
  "Brand Partnerships": { accent: "#FF6A38", chip: "BRAND PARTNERSHIPS" },
};
const proEvents = eventStats.filter(ev => BUCKET_OF[ev.event] !== "Off the Clock" && !ev.pinned);
// Year bucket = the event's MODAL year (the year most of its reels landed in), tie-break to the
// later year. Keeps "'25 MAX LA" under 2025 even though a couple of reels slipped into 2026.
const yearOf = (ev) => {
  const h = {}; ev.reels.forEach(r => { const t = reelDate(r); if (!t) return; const y = new Date(t).getFullYear(); h[y] = (h[y] || 0) + 1; });
  let best = 0, bc = -1; for (const y in h) { if (h[y] > bc || (h[y] === bc && +y > best)) { bc = h[y]; best = +y; } } return best;
};
// Spine nodes: Event Coverage runs stay whole (one on-location trip); ongoing
// projects (In-House Production, Brand Partnerships) split into one node PER
// year, each carrying that year's reels, so an ongoing series lands each reel
// where it actually happened. Playlists stay whole — only the spine splits.
const _spineNode = (ev, reels, uid) => {
  const top = [...reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return { ...ev, idx: uid, reels, cover: thumbOf(top), coverLandscape: !!top.landscape, totalPlays: reels.reduce((s, r) => s + playsNum(r.plays), 0), window: fmtWindow({ reels }) };
};
const timelineNodes = [];
proEvents.forEach(ev => {
  if (BUCKET_OF[ev.event] !== "Event Coverage") {
    const byYear = {};
    ev.reels.forEach(r => { const y = new Date(reelDate(r)).getFullYear() || 0; (byYear[y] = byYear[y] || []).push(r); });
    Object.keys(byYear).forEach(y => timelineNodes.push(_spineNode(ev, byYear[y], `${ev.idx}:${y}`)));
  } else {
    timelineNodes.push(_spineNode(ev, ev.reels, `e${ev.idx}`));
  }
});
// Modal-year desc, then most-recently-active within the year — buckets and order agree.
timelineNodes.sort((a, b) => (yearOf(b) - yearOf(a)) || (Math.max(...b.reels.map(reelDate)) - Math.max(...a.reels.map(reelDate))));
const TL_YEARS = [...new Set(timelineNodes.map(yearOf))].sort((a, b) => b - a);
// The three numbers a year header prints, over ANY set of nodes. Pulled out as a
// function (Aug 10) so the filtered timeline can recompute them over just the
// nodes still on screen instead of printing the unfiltered year totals over a
// filtered list. Same arithmetic either way — nothing here is ever hand-typed.
const metaOf = (evs) => ({ count: evs.length, reels: evs.reduce((s, e) => s + e.reels.length, 0), plays: evs.reduce((s, e) => s + e.totalPlays, 0) });
const yearMeta = Object.fromEntries(TL_YEARS.map(y => [y, metaOf(timelineNodes.filter(ev => yearOf(ev) === y))]));
// The whole spine in one line, in the exact shape the year headers already
// print (projects · reels · plays). Nothing new is said: it is the same three
// derived numbers, summed over every year instead of one. The homepage's slim
// Timeline block uses it as its summary now that the scroll lives on #/timeline.
const TL_TOTAL = {
  count: timelineNodes.length,
  reels: timelineNodes.reduce((s, e) => s + e.reels.length, 0),
  plays: timelineNodes.reduce((s, e) => s + e.totalPlays, 0),
};
const TL_SUMMARY = `${TL_TOTAL.count} ${TL_TOTAL.count === 1 ? "project" : "projects"} · ${TL_TOTAL.reels} reels · ${fmtPlays(TL_TOTAL.plays)} plays`;

// ===== TIMELINE ROLE FILTER (Aug 10 2026) =====
// Miles: "i need the timeline to be updated now that we have the role tagging
// completed so it can populate based on the things i owned" — and his original
// spec for it: "the 5 tabs up above and it can categorize, the things i hosted,
// and it will populate on the timeline, and for the produced, it will highlight
// so people can see it at a glance".
// The five booleans per node come from `roleTabsFor`, the SAME derivation the
// playlist-header matrix prints: his reel tags OR'd with the playlist's role
// line, with MATRIX_OVERRIDES still able to dim a cell. There is deliberately
// no second source of truth here — retag a reel and the timeline moves with the
// matrix, in one place, forever.
// Note on the year-split nodes: an ongoing project splits into one node per
// year and each node carries only that year's reels, so a node's tag-derived
// cells describe that year's work. That is the point, not a rounding error.
const TL_NODE_ROLES = Object.fromEntries(timelineNodes.map(ev => [ev.idx, roleTabsFor(ev)]));

// Opening wall: top Adobe reels + MAX London + the personal side (musician line earns its backdrop)
const _allFlat = (() => {
  const flat = [];
  portfolio.forEach((ev, e) => { if (ev.pinned) return; ev.reels.forEach((r, i) => flat.push({ ...r, e, r: i, event: ev.event })); });
  flat.sort((a, b) => playsNum(b.plays) - playsNum(a.plays));
  return flat;
})();
const heroReels = (() => {
  const top = _allFlat.slice(0, 12);
  ["’25 MAX London: Fonts Creator Game", "Behind the Product", "Happy 100th Birthday Miles Davis", "Donna Lee"].forEach(t => {
    const x = _allFlat.find(f => f.title === t);
    if (x && !top.includes(x)) top.push(x);
  });
  return top;
})();
// The wall (Miles: "show volume") — biggest plays first. R2 design: at 84 the
// collage is 2x viewport, center-clipped, hiding the best cards off-top; cap to
// what fills one screen densely (the literal "84 reels · 24.1M" volume claim
// lives in Selected Work). R3 mobile: never 80+ videos on a phone; cap live +
// card count by device, read once at module load.
const _isPhone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
const _finePointer = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const _reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wallReels = _allFlat.slice(0, _isPhone ? 12 : 32);
const LIVE_WALL = _isPhone ? 3 : 14;

// Card copy = Miles's own words (Jul 4 picks), fact-checked against the
// portfolio array; meta lines are Navin-style (events · years), facts only.
const capabilities = [
  {
    img: "/thumbs/2025/GenStudio-Customer-Stories/Intuit-Audrey-Timpe.jpg", imgPos: "50% 22%", title: "Making B2B Social Friendly",
    meta: "Exec Leadership, Customer Stories & Hot Takes",
    body: "My B2B social work at Adobe, end to end: hosting at Adobe Summit, customer stories with Intuit and Wyndham Hotels, executive thought leadership, and product releases. I pitch, produce, direct, and coach the talent, from concept to published. Making B2B social friendly.",
    linkUrl: "https://www.linkedin.com/posts/intuits-audrey-timpe-shares-how-ai-has-become-ugcPost-7403901188343328768-lISN", linkLabel: "Play: Customer Story →",
  },
  {
    img: "/cards/on-camera-hosting.jpg", imgPos: "50% 27%", title: "On-Camera Hosting & Producing",
    meta: "Adobe MAX · Summit · NAB · 2024–Present",
    body: "One-off influencer posts don't scale, so I concepted a repeatable hosted sizzle format for Adobe's flagship events. Summit 2025 was a hosted run: I pitched the concepts, wrote the scripts, and hosted on camera. Created 9 posts over a 3 day event, published between March 20 and April 2, including a Ken Jeong interview and the Acrobat Escape Room at 2.6M plays.",
    linkUrl: "https://www.instagram.com/reel/DH9hfTmBvr-/", linkLabel: "Play: ’25 Summit Vegas →",
  },
  {
    img: "/cards/content-strategy.jpg", imgPos: "50% 40%", title: "Content Strategy, Concept to Published",
    meta: "IBC · MAX · Summit · 2024–2026",
    body: "“Make the Firefly Video product release fun” was my brief. So as a creative producer on this piece, I built content strategy with PMMs, PR, and editorial, then wrote the scripts myself. The proof is a format: emoji reactions, 1.5M at IBC 2024, repeated at NAB and Summit.",
    linkUrl: "https://www.instagram.com/reel/DJC2KUPPwh3/", linkLabel: "Play: ’24 IBC Amsterdam →",
  },
  {
    img: "/cards/directing-coaching.jpg", imgPos: "50% 32%", title: "Directing & On-Camera Coaching",
    meta: "Adobe MAX · Summit · @adobelife · 2025–2026",
    body: "At MAX 2025 in LA I coached James Gunn, Mark Rober, and Kelley O'Hara on camera. That meant coordinating with strategy to craft talking tracks: I wrote the words, got them approved, then made sure we delivered them in our 10 minute time slot. The Rober reel sits at 2.2M plays.",
    linkUrl: "https://www.instagram.com/reel/DA6zD2MA7Jh/", linkLabel: "Play: ’25 MAX LA →",
  },
  {
    img: "/cards/video-production.jpg", imgPos: "50% 28%", title: "Producing: Talent Marketing & Employee Comms",
    meta: "@adobelife · 2025–2026",
    body: "Talent marketing at Adobe means making employees the story. I produced and creatively directed the Dave interview feature in-house, and it hit 1.9M plays on @adobelife. On the San Jose Semaphore piece I handled directing and on-camera coaching.",
    linkUrl: "https://www.instagram.com/reel/DNgTb3hthgJ/", linkLabel: "Play: In-House Production →",
  },
  {
    img: "/thumbs/2026/Miles-Music-Media/Happy-100th-Birthday-Miles-Davis_5.25.26.jpg", imgPos: "50% 30%", title: "Staying Busy Off The Clock",
    meta: "@MilesMusicMedia IG & MilesSpearman YT",
    body: "Off the clock I'm a creator myself: jazz history lessons and trumpet performances on @milesmusicmedia, plus my own YouTube channel. Brainstormed, researched, shot, scripted, edited, and posted as a one-person production. It keeps me fluent in how creators actually build an audience.",
    linkUrl: "https://www.instagram.com/milesmusicmedia/", linkLabel: "Play: Miles Music Media →",
  },
];

// ===== ROLE-PAGE SUMMARIES (Aug 9 2026) =====
// The green-border summary at the top of each role page is Miles's own What I
// Do card body, moved verbatim. Looked up BY CARD TITLE rather than retyped, so
// the string on the role page is byte-identical to the one he wrote and editing
// his copy in one place still changes it everywhere.
// Mapping (flagged in the report): hosting body -> the hosted-run page;
// talent-marketing body -> the produced page; the concept-to-published body ->
// Cut by Me, because the reels it names (the emoji-reaction format, 1.5M at IBC
// 2024) are literally the reels on that page; off-the-clock body -> Off the
// Clock. Two bodies stay on no role page: "Making B2B Social Friendly" (its
// work is the pinned playlist on the homepage) and "Directing & On-Camera
// Coaching" (its page already carries the hosting body).
const capBody = (t) => (capabilities.find(c => c.title === t) || {}).body || "";
// Cut by Me carries its own summary rather than a What I Do body: Miles wrote
// this one for the page at the push gate. His words, unedited.
const CUT_BY_ME_INTRO = "I came up hands-on at the camera, shooting and editing short-form for Adobe's channels, and these are the videos I've cut myself. The NAB recap went out the same day, cut on site between sessions. The emoji reaction format I built and cut first, then it ran again at NAB and Summit.";
const BUCKET_INTROS = {
  [ROLE_CUT]: CUT_BY_ME_INTRO,
  [ROLE_HOSTED]: capBody("On-Camera Hosting & Producing"),
  [ROLE_PRODUCED]: capBody("Producing: Talent Marketing & Employee Comms"),
  [ROLE_OFF]: capBody("Staying Busy Off The Clock"),
};

// ===== DESIGN NORTH STAR (Aug 10 2026) — Miles's three words =====
// His answer to Tyler's exercise, exactly as he wrote them, periods included.
// It RENDERED on the About card for part of Aug 10 and he killed it the same
// day, verbatim: "i don't love this, i think it's supposed to be unconscious it
// shouldn't be shared like that." He is right, and the rule generalises: a site
// that TELLS you it is organized is doing the opposite of being organized.
// So this is the brief, not the copy. It is what every layout call on this site
// should be measured against, and it must RENDER NOWHERE — nothing reads it,
// and putting it back on screen reverses his decision.
const DESIGN_NORTH_STAR = ["Creative.", "Organized.", "Easy to work with."];

// ===== MEANING PICKS (Aug 10 2026) — Miles's Tyler-homework answer =====
// Tyler's note was that a portfolio should say which pieces MATTER to the maker,
// not just which ones performed. Asked for his, he named three. Recorded here
// verbatim and keyed to the exact reel titles in the data, so the future
// curation surface can look them up the same way every other surface does
// (by title, never by hardcoded index).
// RENDERS NOWHERE TONIGHT — on purpose. This is the answer captured before it
// gets lost; the surface that shows it is a later decision, and inventing one
// now would put copy on the site he has not seen. Nothing reads this constant.
// His note on the second pick, verbatim: "the IBC emoji format".
const MEANING_PICKS = [
  "’25 MAX: Mark Rober’s Creator Assignment",
  "’24 IBC: Premiere Pro AI: Emoji Reactions",
  "San Jose Semaphore",
];

// "The Set List" — each capability (copy verbatim above) is paired to a reel in
// the portfolio. Indices {e,r} are DERIVED by title lookup (never hardcoded) so
// clicking a capability deep-links into the Work player via the ms-play event.
const reelIndexByTitle = (title) => {
  for (let e = 0; e < portfolio.length; e++) {
    if (portfolio[e].pinned) continue; // resolve to the reel's HOME playlist, not the pinned mirror
    const r = portfolio[e].reels.findIndex(x => x.title === title);
    if (r !== -1) return { e, r };
  }
  return null;
};

// Phase-1 deep-links: #/case/<slug> opens one reel playing. The slug is DERIVED
// from the reel title (never hardcoded) so links track the data. Pinned mirror is
// skipped so a slug resolves to the reel's HOME playlist; first title wins on ties.
const slugify = (s) => (s || "").toLowerCase().replace(/['’"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const CASE_INDEX = {};
portfolio.forEach((ev, e) => {
  if (ev.pinned) return;
  ev.reels.forEach((reel, r) => { const s = slugify(reel.title); if (s && !(s in CASE_INDEX)) CASE_INDEX[s] = { e, r }; });
});
// Parse #/case/<slug> → {e,r} (or null). Unknown/malformed slug returns null (no-op).
const caseFromHash = () => { const m = window.location.hash.match(/^#\/case\/(.+?)\/?$/); return m ? CASE_INDEX[m[1].toLowerCase()] || null : null; };

// Per-reel descriptions, shown when a bucket-page row expands — published IG
// caption lines (verbatim, emoji/CTA trimmed) or Miles's own words; more land
// with the Workfront ingest. A reel with no entry shows none. NEVER invent one.
const REEL_DESCS = {
  "Adobe x NWSL: 2025 Creator Club": "Say hello to the 2025 Creator Club, brought to you by Adobe and the NWSL. A love letter to the fans who bring the game to life, with Adobe Express templates to rep your team your way.",
  "Adobe x Golden State Warriors: Creative Threads": "At the Adobe x Warriors Creative Threads workshops, emerging Bay Area artists design sneakers that speak louder than words, facilitated by The Campus Worldwide.",
  "Photoshop x Marvel: Eyes of Wakanda": "How the team behind Marvel Animation's Eyes of Wakanda illustrated the series, and how custom brushes in Photoshop helped bring it to life.",
  "Building Murals: Laura Garcia": "Illustrator Laura Garcia brings her Nicaraguan roots to life at Adobe's San Francisco office, transforming a window into a vibrant mural that celebrates creativity, culture, and community.",
  "’26 PS Archives: Russell Brown x Matthew Richmond (Podcast)": "Matthew Richmond, Adobe VP of Design for Pro Products, joins Russell Preston Brown to reflect on his early career, from having Adobe as a client to the early days of Photoshop, and where AI and creative control go next.",
  "’26 PS Archives: The Power of Small Tools": "Not every feature is front and center, but for someone, it's the whole workflow.",
  "’26 PS Archives: 1st Satisfying Project": "What was your first satisfying Photoshop project? The Photoshop Archives crew shares theirs.",
  "’26 PS Archives: Tools Don’t Make Things": "Tools don't make things, people do. Matthew Richmond, Adobe VP of Design, joins Russell Preston Brown on Photoshop Archives to discuss the early days of Photoshop and the future of Adobe's professional tools.",
  "’26 PS Archives: Tools Don’t Know When Something is Good": "Creative tools can generate possibilities, but knowing what's good is still a human skill.",
  "’26 Summit: Words of Wisdom with Iliza Shlesinger": "We went backstage at Adobe Summit to chat with Iliza Shlesinger, comedian and celebrity co-host of Adobe Sneaks, about how creativity shows up around her stand-up specials.",
  // Hand-written spotlight lines (verbatim):
  "Dave Werner Employee Spotlight": "Meet Dave Werner, Senior Staff Designer in our Video and Animation team. From designs that help bring animated characters to life to performing in local theatre productions, Dave's creativity thrives both inside and outside of work.",
  "Gizem Dal Employee Spotlight": "Meet Gizem Dal, Graphic Software Engineer at Adobe and drummer.",
  "Amanda Valenzuela Employee Spotlight": "Meet Amanda Valenzuela, Business Development Representative at Adobe and a multi-disciplinary artist.",
  "Bowen Wang Employee Spotlight": "Meet Bowen Wang, Manager of Machine Learning at Adobe. From developing AI models that help marketers understand performance to crafting projects in his woodworking shop, Bowen thrives on creativity and problem-solving.",
  "Manasa Hari Employee Spotlight": "Meet Manasa Hari, Software Development Engineer at Adobe. From building features for Adobe's Real-Time Customer Data Platform to performing as a singer and dancer, Manasa brings creativity, discipline, and stage presence into everything she does.",
  "Intern Day Creative Cloud": "Welcome to Adobe Intern Day! From real-world projects to exclusive perks, here's what building your future with us gets you.",
  // Caption-sourced (complete sentences only, event names kept, R1-clean):
  "TacoBell x Upworthy Feature": "Play it loud Miles! Miles is a @tacobell Foundation Live Más Scholarship recipient who's passionate about jazz and playing the trumpet.",
  "’24 IBC: Premiere Pro AI: Emoji Reactions": "At IBC, we asked our attendees to describe their excitement for the new Adobe Firefly Video Model. Watch as their imaginations run wild with the new updates.",
  "’24 IBC: Event Recap": "We're all heading back into the office, but emotionally, we're still at IBC! Check out some of our fave highlights, including the latest cinema camera releases from @CanonUSA and @Sony and, of course, our new updates.",
  "’24 MAX: Project Watercolor Master: Adobe Researcher Sneaks Interview": "What if you could paint, blend, and flow like a watercolor master on a digital canvas? Introducing Web-Based Painting, an experimental technology developed by our team in Paris.",
  "’24 MAX: Project Type Lab: Adobe Researcher Sneaks Interview": "Take your text effects to the next level with Project Type Lab! This cutting edge tech allows you to generate, edit and reposition text seamlessly within your design using generative AI.",
  "’24 MAX: Project Generative Physics": "Create life in your scenes with a single click with Project Generative Physics! In this Adobe Research Sneak, realistic physics are a snap with a simple text prompt.",
  "’24 MAX: In-Office Trivia": "How much do YOU know about Adobe MAX? In addition to having amazing Sneaks, it's the perfect place to brush up on your creative skills and learn some new ones.",
  "’24 MAX: Attendee Scavenger Hunt": "They come from near and far, but our incredible community all agrees: the best thing about Adobe MAX is everything!",
  "’24 MAX: 3 Things We Didn’t Expect": "From secret escape rooms to birthday ambushes, Adobe MAX was full of surprises! What captured your delight or broke your brain over the past few days?",
  "’24 MAX: Sneaks Reactions One Emoji": "Adobe MAX Sneaks = next-level creativity.",
  "’24 MAX: Premiere Pro Demo": "Still reeling from Adobe MAX! From dropping Generative Extend in (beta) to Firefly's Generate Video (beta), the future of video editing is looking bright.",
  "’24 MAX: Adobe x Gatorade Activation": "In case you missed this iconic partnership at Adobe MAX, @gatorade and Firefly have teamed up to take your hydration game to the next level.",
  "’24 NAB: Emoji Reaction Interviews": "Firefly is coming to NAB! Drop an emoji that sums up your reaction.",
  "’24 NAB: Premiere Pro AI Announcement Reactions": "Generative AI in Premiere Pro is around the corner. Which feature do you think you'll use the most, Object Addition, Object Removal, or Generative Extend?",
  "’24 NAB: Premiere Enhanced Speech Live Test": "Last week at NAB we put Enhance Speech and all of the new audio features to the test: can they beat the noise of the crowd?",
  "’25 Summit: Coca-Cola Activation": "Refreshing. Legendary.",
  "’25 Summit: Over & Under AI Enterprise Activity": "The sky is the limit for AI! Our recent study shows AI is streamlining the way we travel, shop, and more.",
  "’25 Summit: Acrobat Escape Room": "Cracking codes, unlocking clues and winning escape rooms at Adobe Summit thanks, AI Assistant!",
  "’25 Summit: “Describe Your Job” Interviews": "No titles, no problem. We put Adobe Summit attendees on the spot, and their answers were priceless!",
  "’25 Summit: Coolest Job @Adobe S1": "\"Who do you think has the coolest job at Adobe?\" Easy question, right?",
  "’25 Summit: Sneaks Emoji Reactions": "Big ideas, bold innovations! We unveiled potential new features at Adobe Summit Sneaks on the keynote stage, and our dedicated correspondent Miles was on the ground capturing attendee reactions.",
  "’25 Summit: Hosted Event Recap": "Have you heard that Adobe Summit's celebrity host @KenJeong can't stop talking about this new technology? Agentic AI blew us away this year and totally stole the spotlight.",
  "’25 Summit: Escalator ‘Hot’ Takes": "We asked the experts at Adobe Summit to serve up their best rapid-fire insights on agentic AI. The takeaway?",
  "’25 MAX: James Gunn’s Filmmaking Assignment": "That project sitting in your drafts? @jamesgunn has a message for you.",
  "’25 MAX: “Coolest Job” @Adobe | Firefly Feature": "We asked: who has the coolest job at Adobe? The @adobefirefly team had a few ideas.",
  "Kelley O'Hara x NWSL x Adobe": "From the pitch to producing, former @NWSL athlete @kelleyohara is redefining success. We are teaming up with Kelley, who is using our tools to empower her next chapter, growing the game, on and off the field.",
  "’25 MAX: Mark Rober’s Creator Assignment": "\"Your most viral clips are the ones that create the biggest visceral response.\" Adobe MAX keynote speaker @markrober offers advice on how to level up your content.",
  "’25 MAX: Jessica Williams’ Creator Assignment": "\"Follow your instinct, not the trends.\" Adobe MAX Sneaks host @msjwilly reminds us that our instinct is the most powerful thing we can tap into as creators.",
  "’25 MAX: Navin’s Coolest Job": "What's it like to work on the Adobe Firefly team? Navin Watumull, Senior Product Marketing Manager, gives us a peek inside his role helping shape how creators experience our generative AI tools.",
  "’25 MAX: Sarah Shen’s Coolest Job": "Designing generative AI tools for creators looks like this: Sarah Shen, Director of Design for @adobefirefly, shares how she connects cutting-edge technology with real creative needs.",
  "’25 MAX London: Recap": "No matter where you traveled from, we're so grateful you're part of our bold, brilliant creative community. Thanks for making Adobe MAX London unforgettable.",
  "’25 MAX London: Fonts Creator Game": "Helvetica vs. Times New Roman: the ultimate font-off.",
  "’25 MAX London: Firefly Explainer": "We stopped in at Adobe MAX London to reveal 5 simple steps to better prompts for video generation. Let's see what fun scenes we came up with using the latest updates in Firefly.",
  "’25 NAB: Premiere Pro Releases": "Brewing groundbreaking innovations = our cup of tea. Steep yourself in all the NAB buzz as we recap your favorite new features.",
  "’25 NAB: Generative Extend Demo": "Adobe content producers, they're just like us. We all need a little Generative Extend sometimes.",
  "’25 NAB: Event Coverage": "Out: Scouring your media library for a misplaced shot. In: Empowering your editing workflow with Media Intelligence. Using casual language, you can search for filmed subject matter, video specs, and more.",
  "Cannes Lions Firefly Feature": "Cannes we just take a moment? Take a look back at Firefly's Creator Beach at.",
  "Firefly Interview Demo": "Current office mood: excitedly experimenting with the new Firefly Video Model. Go behind the curtain as the team generates powerful outputs with Text-to-Video and Image-to-Video, coming soon to beta.",
  "Creative Cloud for Students Black Friday Discount": "Deal Alert! Unlock 70% OFF @AdobeCreativeCloud with your student email.",
  "Russell Preston Brown Employee Spotlight": "Meet Russell Preston Brown, Senior Principal Designer, who has worked at Adobe for 41 years! Outside the office, Russell is a costume maker, designer, and photographer.",
  "Artist Spotlight: Aaron Gonzalez": "We love seeing creativity come to life! Aaron Gonzalez of @flosseditions took a risk to start creating art.",
  "Em Siegel Employee Spotlight": "Meet @ecs.ceramics, Staff Product Designer at Adobe.",
  "Coolest Job: Eric": "Cool job alert! @ericmatisoff is a Customer Experience Orchestration at Adobe, but he's also been the host of Adobe Summit's Sneaks for the last four years!",
  "Coolest Job: Tongyu": "Adobe Research Scientist Tongyu Zhou levels up her passion for gaming through the projects she leads every day at Adobe.",
  "Brand Intelligence B2B Interview": "At Adobe Summit, we introduced Adobe Brand Intelligence. It took a diverse team of individuals from all over the globe at different stages of their careers to work together and launch something this big.",
  "Imran Idzqandar Employee Spotlight": "Meet Imran Idzqandar, Enterprise Architect at Adobe. Outside of work, Imran is a pilot and part of the Adobe Aviators community.",
  "San Jose Semaphore": "The San Jose Semaphore has been solved! The puzzle, created by Ben Rubin, featured rotating discs at the top of Adobe's Almaden Tower that hid a message through data points of bytes and numbered colors.",
  "’26 Summit: Sneaks Celebrity Host Interview": "We went backstage at Adobe Summit to chat with @ilizas, comedian and celebrity co-host of Adobe Sneaks. Here's what she had to say about creativity, failure, and technology.",
  "NFL x Adobe: Behind the Lens (LCC)": "When seconds count, creativity can't wait. Diego Galicia and Payton Gygax are NFL Live Content Correspondents, who capture, edit, and publish from the sidelines in real time. Every game, every play, every post has a deadline measured in seconds. From the field to fans, they're using Adobe tools to move at the speed of the game without sacrificing their creative vision.",
  "NFL x Adobe: Season Opener Kickoff": "It's time for a new season, and we're teaming up with the @NFL to make fandom more personal than ever. From AI-powered fan experiences to My Cause My Cleats designs and @AdobeExpress templates, fans can get closer to the game, the players, and the culture of football. Creativity is officially on the field 🏈",
  "’26 NAB: Object Matte (OTG)": "If we could be anywhere in the world right now, we'd be at #NABShow demoing our new Object Matte feature in After Effects. This just-announced tool overhauls rotoscoping, so you can now instantly isolate and track your subjects with just a click. Say goodbye to manual tasks and hello to intuitive masks. Try it today in After Effects!",
  "’26 NAB: Color Mode (OTG)": "Live from #NABShow, it's Color Mode! We introduced attendees to our brand-new color grading experience in Premiere (beta), and we made sure to capture their hot takes on the technology. (Spoiler alert: they loved it). Try it for yourself by downloading the beta today.",
  "’25 IBC: Recap": "\"You look happier.\" Thanks, we just updated our Premiere Pro to 25.5 and gained 90+ new effects, faster timelines, and more intuitive workflows.",
  "’25 IBC: Favorite Premiere Transitions": "Jump cut: the camera holds to reveal IBC 2025 attendees sharing their favorite editing transitions. Discover your fave with our 90+ new effects, transitions, and animations now live in the latest Premiere Pro.",
  "’25 IBC: Premiere Pro Transitions Release": "Three words. Five syllables. (Hint: It's \"Update Premiere Pro!\") Get the latest and greatest features, effects, and performance by upgrading to Premiere Pro 25.5 today.",
  "’25 IBC: Premiere on Mobile Release": "Our team at Adobe is thrilled to bring Premiere to the iPhone. A favorite feature: the ability to use your voice to generate sound effects. If you create video, give it a try.",
  "Cracking the Semaphore Code": "After three years, the San Jose Semaphore has been solved. The puzzle, created by Ben Rubin, uses rotating discs atop Adobe's Almaden Tower to hide a secret message in data. Here's the story of cracking the code.",
  "’26 Summit: Behind the Scenes of Sneaks": "Go behind the scenes of Adobe Summit Sneaks with host and Principal Evangelist Eric Matisoff and Research Scientist Yuzhe You. What it takes to bring the biggest innovations from the Adobe lab to the main stage.",
  "GenStudio for Performance Marketing Demo": "At Adobe MAX, we showcased the possibilities of Adobe GenStudio for Performance Marketing, including how work that could have taken weeks can now be done in minutes.",
  "Exec Thought Leadership: TikTok Your Ad Has Just 10 Seconds to Live": "Tap into TikTok's 1.8 billion monthly users with content that performs. GenStudio for Performance Marketing powers fast, on-brand creation and optimization at scale.",
  "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language": "Go global with confidence. GenStudio for Performance Marketing helps you localize personalized content at scale to reach every market, faster.",
  "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish": "Attention spans are shorter than ever, and that's exactly why video has become one of the most powerful ways to connect with audiences everywhere they are. I loved helping bring this piece to life to showcase the innovations Adobe is delivering around video.",
  "’25 MAX Customer Story: Intuit": "Intuit's Audrey Timpe shares how AI has become the team's ultimate brainstorming partner, helping them create faster, react quicker, and stay focused on bold, standout ideas with Adobe GenStudio for Performance Marketing.",
  "’25 MAX Customer Story: Wyndham Hotels": "Everything good comes from real human insight. Wyndham Hotels & Resorts' Marissa Yoss shares how AI is closing the gap between ideas and execution, turning data into personalized experiences, faster.",
  "’26 Summit: Anil Chakravarthy Exec Interview": "We asked Adobe's President of Customer Experience Orchestration Business, Anil Chakravarthy, some burning questions about AI ahead of Adobe Summit. Here's the real talk on agentic AI.",
};

// ===== "WHY IT MATTERED" (Aug 11 2026) — Semaphore =====
// Q7 of research/DECISION-BATCH-2026-08-11.md. Tyler's frame was "it can be
// projects that were the most challenging", and the Semaphore is the one pick
// whose number is small on purpose. Miles's answer, ~3:21 AM: "line 1 + his add
// 'NYC & San Jose Shoot'". Both strings are copied byte for byte — line 1 from
// Q7 draft (1), which was itself grounded only in the existing description, and
// the second is his own addition, typed as he typed it.
// TWO STRINGS, two registers: the first is the reason, the second is a
// production detail, so it renders smaller and quieter beneath it (the same
// gray the site uses for meta lines) rather than as a second claim.
const SEMAPHORE_WHY = [
  "A three-year puzzle on Adobe's own tower finally cracked, and I produced the story.",
  "NYC & San Jose Shoot",
];
// Keyed by reel title so the pattern is data, not a hardcoded branch: any reel
// Miles later writes a why-line for is one entry here and renders everywhere
// this map is read (the Set List tile + the expanded track row).
const REEL_WHY = {
  "San Jose Semaphore": SEMAPHORE_WHY,
};

// ===== THE SET LIST (Aug 11 2026) — the homepage work section =====
// Heading is Miles's own ("i love the set list"). Layout is mock D, his pick at
// ~3:32 AM after a first pass at C: "sorry im in love with D, maybe do that?...
// as long as we make it so the links hyper link to the full playlist, or the way
// the bottom is organized makes sense". Visual target:
// research/mock-2026-08-11-d.html.
//
// D = TWO TIERS. Five featured works as IG-native 3:4 tiles, each carrying its
// own write-up, then the rest of the catalog beneath them as art + title + count
// and nothing else. The demoted tier is deliberately thin: tyler-lens's rule is
// that a fill tile with no description is only honest if it stops pretending to
// be a case, so down there it is a link, not a claim.
//
// WHAT LEFT THIS SLOT: the full 23-playlist WorkPlayer and the four shelf
// carousels. Neither was deleted — both still render at #/playlist, which is now
// the only place the Spotify shell lives. The homepage had been showing the
// entire library twice over before a reader had been given a reason to care
// about any single piece of it.
//
// HIS ROUTING CONSTRAINT, absolute: "i just don't think for D, we should be
// linking outside of the portfolio." Every tile in both tiers is an in-site
// link. No tile carries a postUrl.
const SET_LIST_TITLES = [
  "Adobe x NWSL: 2025 Creator Club",
  "’25 Summit: Acrobat Escape Room",
  "’25 MAX: Mark Rober’s Creator Assignment",
  "’24 IBC: Premiere Pro AI: Emoji Reactions",
  "San Jose Semaphore",
];
// Indices DERIVED by title lookup, the pinned-mirror pattern the B2B strip and
// the Cut by Me sections already use — these are references into the one reel
// table, never copied rows, so a play count or a file path changes in exactly
// one place. A title that stops matching drops out rather than rendering blank.
const SET_LIST_ITEMS = SET_LIST_TITLES
  .map(t => { const at = reelIndexByTitle(t); return at ? { ...at, reel: portfolio[at.e].reels[at.r] } : null; })
  .filter(Boolean);

// ===== THE FIVE WRITE-UPS — selection, not authorship =====
// Every paragraph is LIFTED whole from copy that already exists in this file.
// Nothing is retyped, re-split, trimmed inside a sentence, or newly written.
// What follows documents WHICH paragraphs each tile takes and why:
//
//   NWSL     CASE_TEXTS["Brand Partnerships"]
//              [0] his opener, which already carries "The goal:"
//              [3] the metric paragraph
//            (skipped: [1] the O'Hara companion piece and [2] his crew credit —
//             both belong to the case page, neither is this reel's story)
//   ESCAPE   CASE_TEXTS["’25 Summit Vegas"]
//              [0] the goal-framed opener (the problem the format solved)
//              [1] what the thing actually was
//              [3] the metric paragraph, which carries his franchise line
//            (skipped: [2], the credit paragraph)
//   MAX      CASE_TEXTS["’25 MAX LA"]
//              [0] his goal clause (Change 2 above)
//              [3] what the thing actually was
//              [5] the metric paragraph
//            (skipped: [1] and [2], the split; [4], the credit paragraph)
//   IBC      REEL_DESCS entry, whole, one paragraph
//   SEMAPHORE REEL_DESCS entry, whole, one paragraph
//
// The goal-framed openers on ESCAPE and MAX are here on purpose: the mocks
// trimmed them and tyler-lens's single note on treatment C was that dropping
// them is what turns a case into a caption.
const pickParas = (paras, idx) => idx.map(n => paras[n]).filter(Boolean);
const SET_LIST_DESCS = {
  "Adobe x NWSL: 2025 Creator Club": pickParas(CASE_TEXTS["Brand Partnerships"], [0, 3]),
  "’25 Summit: Acrobat Escape Room": pickParas(CASE_TEXTS["’25 Summit Vegas"], [0, 1, 3]),
  "’25 MAX: Mark Rober’s Creator Assignment": pickParas(CASE_TEXTS["’25 MAX LA"], [0, 3, 5]),
  "’24 IBC: Premiere Pro AI: Emoji Reactions": pickParas([REEL_DESCS["’24 IBC: Premiere Pro AI: Emoji Reactions"]], [0]),
  "San Jose Semaphore": pickParas([REEL_DESCS["San Jose Semaphore"]], [0]),
};

// The role chips a SINGLE reel earns, in the site's five-tab vocabulary. Same
// clauses `roleTabsFor` runs per reel (D lights Concept/Script unless his column
// says "no concept"; P, D, H light theirs; a cut credit lights Edited) — the
// playlist's own role LINE is deliberately not consulted, because a tile makes a
// claim about one video, not about the run it came from. No new mapping: the
// names are ROLE_TABS, the hues are ROLE_TAB_COLORS, the tags are his.
const reelRoleTabs = (r) => {
  const t = tagsOf(r);
  return [
    t.includes("D") && !tagNoConcept(r),
    t.includes("P"),
    t.includes("D"),
    t.includes("H"),
    cutByMeReel(r),
  ];
};

// ===== TIER 2 — the catalog =====
// The next 15 by plays, DERIVED: every non-pinned reel in the table, minus the
// featured five, sorted by its own play count. Nothing is hand-listed, so the
// grid re-ranks itself the moment the data moves. Pinned playlists are skipped
// for the same reason every derived total skips them (they mirror reels that
// already live elsewhere, so including them would show the same tile twice).
const CATALOG_COUNT = 15;
const CATALOG_ITEMS = portfolio
  .flatMap((ev, e) => (ev.pinned ? [] : ev.reels.map((reel, r) => ({ e, r, reel }))))
  .filter(x => !SET_LIST_TITLES.includes(x.reel.title))
  .sort((a, b) => playsNum(b.reel.plays) - playsNum(a.reel.plays))
  .slice(0, CATALOG_COUNT);

// Where a tile goes. #/case/<slug> is the deep link this site already had, and
// it now resolves to the full playlist with that reel selected and playing (see
// routeFromHash) — which is literally his condition, "the links hyper link to
// the full playlist". Slug is derived from the title by the same `slugify`
// CASE_INDEX is built with, so a tile can only ever point at a real entry.
const caseHref = (reel) => { const s = slugify(reel.title); return s && CASE_INDEX[s] ? `#/case/${s}` : "#/playlist"; };

// The play glyph + count that rides the bottom-left of every tile, both tiers.
function TilePlays({ reel }) {
  return (
    <span style={{
      position: "absolute", left: 12, bottom: 10, display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: F, fontSize: 13, fontWeight: 600, color: C.white, fontVariantNumeric: "tabular-nums",
      textShadow: "0 1px 3px rgba(0,0,0,0.6)", pointerEvents: "none",
    }}><IcPlay s={11} c={C.white} />{playsLabel(reel)}</span>
  );
}

// ONE <video> in this whole section, mounted inside whichever featured tile is
// active — the site's one-video law, kept the way the rest of the file keeps it.
// Active = the tile with the most of itself on screen (phones, where the tiles
// stack and you scroll through them one at a time), or the tile the pointer is
// on (desktop, where all five are on screen at once and the hover is the tell).
// Every other tile is its poster, which is what `thumbOf` exists for.
function SetListTile({ item, live, onActivate, innerRef }) {
  const reel = item.reel;
  const tabs = reelRoleTabs(reel);
  const paras = SET_LIST_DESCS[reel.title] || [];
  const why = REEL_WHY[reel.title] || null;
  return (
    <div style={{ minWidth: 0 }}>
      <a href={caseHref(reel)} ref={innerRef}
        onMouseEnter={onActivate} onFocus={onActivate}
        aria-label={`Play ${reel.title}`}
        style={{ position: "relative", display: "block", aspectRatio: "3 / 4", overflow: "hidden", background: "#111", textDecoration: "none" }}>
        {live
          ? <video src={srcOf(reel)} poster={thumbOf(reel)} muted loop playsInline autoPlay preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <img src={thumbOf(reel)} alt="" loading="lazy" decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />}
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.60))", pointerEvents: "none" }} />
        <TilePlays reel={reel} />
      </a>
      <div style={{ padding: "13px 16px 0 0" }}>
        <p style={{ fontFamily: F, fontSize: 14.5, fontWeight: 700, color: C.white, lineHeight: 1.3, margin: "0 0 4px" }}>{reel.title}</p>
        <p style={{ fontFamily: F, fontSize: 12, color: "#888", margin: "0 0 8px", fontVariantNumeric: "tabular-nums" }}>{playsLabel(reel)} plays</p>
        {/* Chips: only the roles this reel earned, lit in the role's own hue —
            the same word in the same colour the matrix and the timeline use. */}
        <span style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "0 0 7px" }}>
          {tabs.map((on, n) => on && (
            <span key={ROLE_TABS[n]} style={{
              fontFamily: F, fontSize: 10.5, fontWeight: 600, lineHeight: 1.3, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap",
              color: ROLE_TAB_COLORS[ROLE_TABS[n]], background: tabFill(ROLE_TAB_COLORS[ROLE_TABS[n]]), border: `1px solid ${tabEdge(ROLE_TAB_COLORS[ROLE_TABS[n]])}`,
            }}>{ROLE_TABS[n]}</span>
          ))}
        </span>
        {paras.map((p, n) => (
          <p key={n} style={{ fontFamily: F, fontSize: 13, color: "#b8b8b8", lineHeight: 1.55, margin: "0 0 9px", maxWidth: "46ch", textWrap: "pretty" }}>{p}</p>
        ))}
        {/* Why it mattered, his two strings, reason then production detail. */}
        {why && (
          <>
            <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.84)", lineHeight: 1.55, margin: "0 0 3px", maxWidth: "46ch" }}>{why[0]}</p>
            <p style={{ fontFamily: F, fontSize: 12, color: C.gray, lineHeight: 1.5, margin: 0, maxWidth: "46ch" }}>{why[1]}</p>
          </>
        )}
      </div>
    </div>
  );
}

// Tier 2 tile: poster, count, and a title bar that comes up on hover (and stays
// up on touch, where there is no hover to reveal it). No video, no chips, no
// description — the demotion is the point.
function CatalogTile({ reel }) {
  return (
    <a className="cat-tile" href={caseHref(reel)} aria-label={`Play ${reel.title}`}
      style={{ position: "relative", display: "block", aspectRatio: "3 / 4", overflow: "hidden", background: "#111", textDecoration: "none" }}>
      <img src={thumbOf(reel)} alt="" loading="lazy" decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.60))", pointerEvents: "none" }} />
      <span className="cat-bar" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 11px 32px",
        fontFamily: F, fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: C.white,
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.80))",
        textShadow: "0 1px 3px rgba(0,0,0,0.7)", pointerEvents: "none",
      }}>{reel.title}</span>
      <TilePlays reel={reel} />
    </a>
  );
}

function SetList() {
  const [active, setActive] = useState(-1);
  const tiles = useRef([]);
  const ratios = useRef(new Map());
  const io = useRef(null);
  const attachers = useRef([]);
  // Which tile owns the section's single <video>. On a phone the tiles stack, so
  // the observer hands it to whichever one is most on screen. On a desktop all
  // five are fully visible at once and every ratio is 1, so the strictly-greater
  // test below leaves it on the first tile until the pointer moves it — no
  // thrash, no five tiles fighting over one element.
  //
  // The observer is wired from the REF CALLBACK, not from a mount effect, and
  // that is load-bearing: under StrictMode React detaches every ref and
  // re-attaches it around the double-invoked mount, so an effect that reads
  // `tiles.current` on mount can read an array of nulls and silently observe
  // nothing. Measured, not guessed — the first build of this did exactly that
  // and the video never left tile 1. Observing as each node attaches cannot
  // race, because there is no moment where the node exists and the observer
  // has not been told about it.
  const observer = () => {
    if (!io.current && typeof IntersectionObserver !== "undefined") {
      io.current = new IntersectionObserver(entries => {
        entries.forEach(en => ratios.current.set(en.target, en.intersectionRatio));
        let best = 0, bestIdx = -1;
        tiles.current.forEach((el, i) => { const r = el ? (ratios.current.get(el) || 0) : 0; if (r > best) { best = r; bestIdx = i; } });
        setActive(bestIdx);
      }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    }
    return io.current;
  };
  // One STABLE callback per tile: a fresh closure each render would make React
  // detach and re-attach on every state change, which is a churn loop.
  const attach = (i) => (attachers.current[i] || (attachers.current[i] = (el) => {
    const o = observer();
    const prev = tiles.current[i];
    if (prev && o) { o.unobserve(prev); ratios.current.delete(prev); }
    tiles.current[i] = el;
    if (el && o) o.observe(el);
  }));
  useEffect(() => () => { if (io.current) { io.current.disconnect(); io.current = null; } ratios.current.clear(); }, []);
  return (
    <section id="work" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
      {/* 1400 so five text columns are five readable columns. At the old
          860-ish measure each one lands near 30 characters, which is a word a
          line and reads as broken rather than as five write-ups. */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <FadeIn>
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
          <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 26px 0", letterSpacing: -0.5 }}>The Set List</h2>
        </FadeIn>
        <div className="set-grid">
          {SET_LIST_ITEMS.map((item, i) => (
            <SetListTile key={item.reel.title} item={item} live={i === active}
              onActivate={() => setActive(i)}
              innerRef={attach(i)} />
          ))}
        </div>
        <div className="cat-grid">
          {CATALOG_ITEMS.map(x => <CatalogTile key={x.reel.postUrl} reel={x.reel} />)}
        </div>
        {/* The door. Both numbers are the site's own derived totals, the same
            two every other count line on the site reads. */}
        <a href="#/playlist" style={{
          display: "block", textAlign: "center", margin: "34px auto 0", fontFamily: F, fontSize: 13,
          color: "#8a8a8a", textDecoration: "none", fontVariantNumeric: "tabular-nums", padding: "12px 0", minHeight: 44,
        }}
          onMouseEnter={e => e.currentTarget.style.color = C.mint}
          onMouseLeave={e => e.currentTarget.style.color = "#8a8a8a"}
        >{TOTAL_REELS} videos · {fmtPlays(TOTAL_PLAYS)} plays · full playlist →</a>
      </div>
    </section>
  );
}

// ===== CLIENT STRIP (Aug 10 2026) — logos, not text =====
// Miles: "I like this marquee label, just use the logos again like tyler did".
// So the label stays and the row below it becomes real marks.
//
// SOURCING RULE, absolute: an OFFICIAL mark or nothing. Every logo here is the
// brand's real file off Wikimedia Commons, licensed Public domain (PD-textlogo
// — below the threshold of originality, so the copyright is free and only the
// trademark remains, which is exactly the nominative use a portfolio makes).
// No redraws, no lookalikes, no tracing. A brand with no officially sourceable
// mark stays TEXT in the same row rather than getting a fake one — the four
// text entries below are that rule doing its job, not an oversight.
//   Adobe     commons File:Adobe logo and wordmark (2017).svg
//   NFL       commons File:NFL wordmark logo 2008.svg
//   Warriors  commons File:Golden State Warriors wordmark logo.svg
//   Marvel    commons File:Marvel Logo.svg (background plate removed, see the
//             comment inside public/logos/marvel.svg — letterforms untouched)
// NOT SOURCEABLE, kept as text: NAB Show and IBC have no free SVG on Commons at
// all (NAB only as a dated JPG, which has no transparency and would render as a
// white box here); Taco Bell and NWSL have no current mark on Commons either.
//
// The three Adobe shows (MAX, MAX London, Summit) collapse into the one Adobe
// mark: three near-identical wordmarks in an eight-item row read as padding, and
// the shows are named in full on the timeline and every playlist header anyway.
const clientStrip = [
  { name: "Adobe", logo: "/logos/adobe.svg" },
  { name: "NAB Show" },
  { name: "IBC" },
  { name: "NFL", logo: "/logos/nfl.svg" },
  { name: "NWSL" },
  { name: "Marvel", logo: "/logos/marvel.svg" },
  { name: "Golden State Warriors", logo: "/logos/warriors.svg", wide: true },
  { name: "Taco Bell" },
];

// "About the Artist" swipe stack — one word at a time; the labels come and
// go, the person stays. A shared module ticker (useSwipeTick) advances them.
const SWIPE_WORDS = ["Creative", "Producer", "Host", "Director", "Teammate"];
let _swipeTick = 0; const _swipeSubs = new Set(); let _swipeTimer = null;
function useSwipeTick() {
  const [, force] = useState(0);
  useEffect(() => {
    _swipeSubs.add(force);
    if (!_swipeTimer) _swipeTimer = setInterval(() => { _swipeTick++; _swipeSubs.forEach(f => f(v => v + 1)); }, 2600);
    return () => { _swipeSubs.delete(force); if (!_swipeSubs.size && _swipeTimer) { clearInterval(_swipeTimer); _swipeTimer = null; } };
  }, []);
  return _swipeTick;
}
function SwipeWord() {
  const tick = useSwipeTick();
  const idx = tick % SWIPE_WORDS.length;
  const prev = (idx + SWIPE_WORDS.length - 1) % SWIPE_WORDS.length;
  return (
    <span style={{ position: "relative", display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
      {tick > 0 && (
        <span key={`out${tick}`} style={{ position: "absolute", left: 0, top: 0, color: C.mint, whiteSpace: "nowrap", animation: "swipeOut 0.5s cubic-bezier(0.55,0,0.45,1) both" }}>
          {SWIPE_WORDS[prev]}
        </span>
      )}
      <span key={`in${tick}`} style={{ display: "inline-block", color: C.mint, whiteSpace: "nowrap", animation: tick > 0 ? "swipeIn 0.5s cubic-bezier(0.55,0,0.45,1) both" : "none" }}>
        {SWIPE_WORDS[idx]}
      </span>
    </span>
  );
}
// Scroll-triggered count-up stack, styled after Miles's EOY deck: number in
// red, descriptor beside it. Every number is DERIVED from the data, never typed.
function PlaysCounter() {
  const ref = useRef(null);
  const [p, setP] = useState(0); // eased 0..1 progress shared by all rows
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(1); return; }
    let started = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true; io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const x = Math.min(1, (t - t0) / dur);
        setP(1 - Math.pow(1 - x, 3));
        if (x < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const rows = [
    [fmtPlays(Math.round(TOTAL_PLAYS * p)), "plays"],
    [fmtPlays(Math.round(TOTAL_LIKES * p)), "likes"],
    // MILES-CLAIM Jul 4: "100+ ... it's a cumulative on all of my creative
    // output" — career total. Floor is now DERIVED (library count rounded
    // down to a ten, "+"), so the counter can never read smaller than the
    // playable library beneath it (123 reels made "100+" an undersell).
    [String(Math.round(Math.floor(TOTAL_REELS / 10) * 10 * p)) + (p >= 1 ? "+" : ""), "videos created"],
  ];
  return (
    <div ref={ref} style={{ margin: "0 0 32px" }}>
      {rows.map(([num, label]) => (
        <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4 }}>
          <span style={{ fontFamily: F, fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, color: "#FA0F00", lineHeight: 1.2, letterSpacing: -1, minWidth: "3.2ch" }}>{num}</span>
          <span style={{ fontFamily: F, fontSize: "clamp(22px, 2.8vw, 32px)", fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ===== CLIENT STRIP =====
// The label (Aug 10 2026, kept on Miles's "I like this marquee label"): the row
// used to drift eight brand names past with nothing saying what they were, so a
// first-time reader had to guess whether they were clients, credits or
// decoration. Styling is the site's QUIET eyebrow (11px, 700, gray, uppercase,
// 0.16em) rather than the loud mint one, so the marks stay the loudest thing in
// the block. Kill the <span> to kill the label.
const MARQUEE_LABEL = "Selected Clients & Stages";
// STATIC, NOT DRIFTING — my call, flagged for him. Two reasons the motion came
// off: logos are scanned, not read, and a moving row makes the eye chase marks
// it is trying to identify; and he asked for the row to WRAP on mobile, which a
// single-line marquee cannot do (wrapping and horizontal drift are mutually
// exclusive). The @keyframes marquee rule is deliberately left in the
// stylesheet so restoring the drift is a one-line change if he wants it back.
//
// Uniform white-on-dark via filter: every mark is a different brand colour
// (Adobe red, NFL red, Warriors blue, Marvel's white knockout), and a row of
// clashing brand colours reads as a sponsor board, not a credit list.
// brightness(0) flattens each mark to black at full alpha, invert(1) lifts it
// to white — shape and transparency survive, colour does not. Opacity 0.72
// keeps them quiet against the work.
const LOGO_H = 28;      // uniform mark height (his 26-30 range)
const LOGO_MAX_W = 112; // ...but a very wide wordmark (Warriors, 5:1) is capped
                        // by width too and scales down inside the box, so one
                        // long mark cannot dominate the row optically.
function Marquee() {
  return (
    <div style={{ width: "100%", padding: "20px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ display: "block", fontFamily: F, fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16 }}>{MARQUEE_LABEL}</span>
      {/* flexWrap + row-gap: wraps to as many rows as the width needs, on a
          phone as well as a narrow desktop window. alignItems center puts the
          text entries on the marks' optical centre line. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "clamp(24px, 4vw, 44px)", rowGap: 18 }}>
        {clientStrip.map(c => c.logo ? (
          <img key={c.name} src={c.logo} alt={c.name} loading="lazy"
            style={{
              height: LOGO_H, maxWidth: LOGO_MAX_W, width: "auto", objectFit: "contain",
              filter: "brightness(0) invert(1)", opacity: 0.72, display: "block", flexShrink: 0,
            }} />
        ) : (
          // Text fallback for the four brands with no officially sourceable
          // mark. Sized to sit at the marks' weight rather than shrink away:
          // a text entry here is a real client, not a placeholder.
          <span key={c.name} style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.72)", letterSpacing: 2, textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap" }}>{c.name}</span>
        ))}
      </div>
    </div>
  );
}

// ===== HERO REEL WALL — live muted videos =====
const TILTS = [-3, 2, -1.5, 2.5, -2, 1.5];
function HeroCard({ reel, i, live = true }) {
  const [h, setH] = useState(false);
  // Aug 9 2026: the Specialty Drawer is retired, so every wall card now takes
  // the case-link path that half of them already took — scroll to the player and
  // play this exact reel. The player's own URL-reflect effect then writes
  // #/case/<slug>, so the card lands on the reel's case link without a page swap.
  // Aug 11: the destination moved to #/playlist with the player, so this goes
  // through goPlay. Same reel, same "press a card and it plays" behaviour.
  const open = () => goPlay(reel.e, reel.r);
  const vh = [26, 21, 30, 23][i % 4];
  return (
    <button className="wall-card" onClick={open} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      aria-label={`Play ${reel.title}`}
      style={{
        position: "relative", height: `clamp(170px, ${vh}vh, 300px)`, aspectRatio: "9 / 16", borderRadius: 14, overflow: "hidden", flexShrink: 0,
        border: `1px solid ${h ? `${C.mint}A6` : C.border}`, padding: 0, cursor: "pointer",
        background: "#111",
        boxShadow: h ? `0 26px 70px rgba(0,0,0,0.55), 0 0 0 1px ${C.mint}40, 0 10px 40px ${C.mint}33` : "0 16px 48px rgba(0,0,0,0.45)",
        // Magnet: the hovered card straightens (rotate 0), lifts, and scales up.
        transform: h ? "translateY(-10px) scale(1.06) rotate(0deg)" : `rotate(${TILTS[i % TILTS.length]}deg)`,
        transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s ease, border-color 0.32s ease",
        zIndex: h ? 5 : 1,
      }}>
      {live && !watchOnly(reel)
        ? <video src={srcOf(reel)} poster={thumbOf(reel)} muted loop playsInline autoPlay preload="metadata"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <img src={thumbOf(reel)} alt="" loading="lazy" decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />}
      {/* per-card veil — lifts on hover so the card spotlights out of the dim */}
      <span style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.55)", opacity: h ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,10,10,0.9))" }} />
      <span style={{ position: "absolute", left: 10, right: 10, bottom: 9, textAlign: "left" }}>
        <span style={{ fontFamily: F, fontSize: 11.5, fontWeight: 700, color: C.white, lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{reel.title}</span>
        <span style={{ display: "block", fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.mint, marginTop: 3 }}>▶ {reel.plays} plays</span>
      </span>
      <span className="wall-play" style={{
        position: "absolute", top: "38%", left: "50%", transform: `translate(-50%,-50%) scale(${h ? 1 : 0.6})`,
        width: 44, height: 44, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center",
        justifyContent: "center", opacity: h ? 1 : 0, transition: "all 0.2s", boxShadow: `0 6px 24px ${C.mint}50`,
      }}><IcPlay s={15} /></span>
    </button>
  );
}

// Fun row set (Miles Jul 4: "focus on fun emotion and happiness") — games,
// reactions, activations, celebrations. Curated titles, indices derived.
const FUN_ROW_TITLES = [
  "’25 Summit: Ken Jeong Interview",
  "’25 Summit: Acrobat Escape Room",
  "’25 MAX London: Fonts Creator Game",
  "’24 MAX: Attendee Scavenger Hunt",
  "’24 MAX: In-Office Trivia",
  "’25 Summit: Escalator ‘Hot’ Takes",
  "’25 Summit: Over & Under AI Enterprise Activity",
  "’25 Summit: Coca-Cola Activation",
  "’24 MAX: Adobe x Gatorade Activation",
  "TacoBell x Upworthy Feature",
  "’25 MAX London: Arches of Inspiration",
  "Intern Day Creative Cloud",
  "Happy 100th Birthday Miles Davis",
];
const funReels = (() => {
  const flat = [];
  portfolio.forEach((ev, e) => ev.reels.forEach((r, i) => flat.push({ ...r, e, r: i })));
  return FUN_ROW_TITLES.map(t => flat.find(f => f.title === t)).filter(Boolean);
})();

// ===== #/work CARD ROSTERS (Aug 9 2026) — the moments each role card swipes
// through, IG-stories style. DERIVED, never hand-typed: Miles's own
// FUN_ROW_TITLES curation ("focus on fun emotion and happiness") filtered to the
// group, then padded with that group's top-played reels until there are at
// least 4, capped at 6. Re-tagging FUN_ROW_TITLES re-cuts every card for free.
// The cap is a legibility floor, not a data limit: a card 158px wide on a phone
// cannot show ten progress dashes, so a big group cycles its best six.
const CARD_ROSTER_MIN = 4, CARD_ROSTER_MAX = 6;
const roleRosters = Object.fromEntries(roleStats.map(b => {
  const reels = b.playlists.flatMap(ev => ev.reels);
  const roster = FUN_ROW_TITLES.map(t => reels.find(r => r.title === t)).filter(Boolean);
  [...reels].sort((x, y) => playsNum(y.plays) - playsNum(x.plays)).forEach(r => {
    if (roster.length < CARD_ROSTER_MIN && !roster.includes(r)) roster.push(r);
  });
  return [b.slug, roster.slice(0, CARD_ROSTER_MAX)];
}));
// Where each moment starts, in seconds — a card seeks here BEFORE it shows the
// reel, so it opens on the fun beat instead of a title card. Keyed by IG
// shortcode; anything missing uses the default. TUNABLE: Miles can change any
// single number (or add a row) without touching the card component. The four
// seeded values are the ones from his approved mock, variant D
// (research/card-mock-2026-08-09.html).
const FUN_AT_DEFAULT = 3;
const FUN_AT = {
  "DHb0O45vPtj": 3, // ’25 Summit: Acrobat Escape Room
  "DJAQxdstxfx": 4, // ’25 MAX London: Fonts Creator Game
  "DH9hfTmBvr-": 5, // ’25 Summit: Escalator ‘Hot’ Takes
  "DA_xlkkJYTb": 3, // ’24 MAX: In-Office Trivia
};
const funAtOf = (r) => {
  const at = FUN_AT[shortcodeOf(r)];
  return typeof at === "number" ? at : FUN_AT_DEFAULT;
};

// Hero marquee rows (Miles Jul 4): square album-art tiles drifting left in an
// infinite loop. Hover pauses the row so the magnet/click still work. Sets are
// duplicated for a seamless -50% loop. Two placements: top row (biggest plays,
// About -> WIWON) and fun row (emotion picks, What I Do -> Selected Work).
// JS scroll-advance marquee (Miles Jul 4 + mobile research): auto-drifts AND is
// finger-swipeable. rAF nudges scrollLeft; hover, pointer-down, or any manual
// scroll pauses it, then it resumes after a short idle. Native momentum + a
// hidden scrollbar give touch users a real swipe. reduced-motion: no drift.
// One drift loop for every marquee on the site: the hero rows and the Type Cut
// rows share it, so touch-swipe, hover-pause, and reduced-motion behave the same.
function useDriftScroll(ref, duration) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, idle = 0, paused = false;
    // The loop period is exactly one copy of the cards (the first copy's box,
    // trailing gap included), never scrollWidth / 2: the track's own side padding
    // made that half a copy-and-some, so every wrap jumped ~72 px (design check,
    // Sep 4 2026). A row that fits in one copy has nothing to loop and stays put.
    const copy0 = el.querySelector('[data-copy="0"]');
    if (!el.querySelector('[data-copy="1"]')) return;
    const period = () => (copy0 ? copy0.offsetWidth : el.scrollWidth / 2);
    const speed = () => Math.max(0.3, period() / (duration * 60)); // px/frame ~ old loop feel
    // No frames while the row is off screen (five rows plus the hero rows would
    // otherwise write scrollLeft 60 times a second from the bottom of the page).
    let offscreen = false;
    const io = new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    // Chrome snaps scrollLeft to whole pixels, so a sub-pixel step on its own
    // never moves the row (measured Sep 4 2026 in headless Chrome: a 0.415 px
    // step read back as 0 and the hero row sat still). Carry the remainder
    // across frames and write whole pixels; a finger-scroll still lands in
    // scrollLeft and is picked up on the next frame.
    let frac = 0;
    const step = () => {
      if (!paused && !offscreen && el.scrollWidth > el.clientWidth) {
        const pos = el.scrollLeft + frac + speed();
        let whole = Math.floor(pos);
        frac = pos - whole;
        const p = period();
        if (whole >= p) whole -= p; // seamless wrap at exactly one copy
        el.scrollLeft = whole;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Wrap on the scroll event too — native touch momentum keeps scrolling
    // while `paused`, and without this the "infinite" row dead-ends at both
    // seams under a finger.
    const onScroll = () => {
      const p = period();
      if (el.scrollLeft >= p) el.scrollLeft -= p;
      else if (el.scrollLeft < 2 && p > el.clientWidth) el.scrollLeft += p;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    const pauseIdle = () => { paused = true; clearTimeout(idle); idle = setTimeout(() => { paused = false; }, 1800); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", pauseIdle);       // R3 B3: browsers firing pointer but not touch don't pause forever
    el.addEventListener("pointercancel", pauseIdle);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", pauseIdle, { passive: true });
    el.addEventListener("wheel", pauseIdle, { passive: true });
    return () => { cancelAnimationFrame(raf); clearTimeout(idle); io.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mouseenter", pause); el.removeEventListener("mouseleave", resume);
      el.removeEventListener("pointerdown", pause); el.removeEventListener("pointerup", pauseIdle); el.removeEventListener("pointercancel", pauseIdle);
      el.removeEventListener("touchstart", pause); el.removeEventListener("touchend", pauseIdle); el.removeEventListener("wheel", pauseIdle);
    };
  }, [ref, duration]);
}
function HeroMarqueeRow({ reels, duration, offset }) {
  const ref = useRef(null);
  useDriftScroll(ref, duration);
  return (
    <div ref={ref} className="marquee-scroll" style={{ overflowX: "auto", overflowY: "hidden", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", margin: "0 calc(-1 * clamp(24px, 5vw, 80px))", maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)" }}>
      <div style={{ display: "flex", alignItems: "center", width: "max-content", padding: "10px clamp(24px, 5vw, 80px)" }}>
        {[0, 1].map(copy => (
          <div key={copy} data-copy={copy} style={{ display: "flex", alignItems: "center", gap: 18, paddingRight: 18 }}>
            {reels.map((reel, i) => <HeroCard key={`c${copy}-${reel.postUrl}`} reel={reel} i={i + offset} live={_finePointer} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
function HeroRow({ reels = heroReels, duration = 80 }) {
  const rowRef = useRef(null);
  usePlayWhenVisible(rowRef);
  return (
    <div ref={rowRef}>
      <HeroMarqueeRow reels={reels} duration={duration} offset={0} />
    </div>
  );
}

// Parallax depth per card — alternating so neighbours drift at different rates
// (the depth illusion). Deterministic, spread ~0.35 (back) .. ~1.35 (front).
const depthFor = (i) => 0.55 + ((i * 37) % 100) / 100; // 0.55 .. 1.55, pseudo-random but stable

// Full-viewport opening: the work plays behind the words.
// THE HEADLINE ACT — cursor-driven parallax on the wall (transform-only,
// requestAnimationFrame-throttled, no layout thrash) + per-card magnet in HeroCard.
// Touch / no-hover pointers skip the pointer effects entirely.
function OpeningWall() {
  const wrapRef = useRef(null);
  const collageRef = useRef(null);
  const cardRefs = useRef([]);
  const wordsRef = useRef(null);
  const veilRef = useRef(null);
  // Play the wall only while it's on screen — muted videos otherwise burn CPU.
  usePlayWhenVisible(wrapRef);

  // Scroll-dissolve (Miles Jul 4): as you scroll the opening, the triad
  // EVAPORATES and the dim veil LIFTS so the reels brighten into tappability.
  // Applied imperatively via refs (no setState) so the 84-card wall never
  // re-renders on scroll. reduced-motion: leave everything at rest.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const h = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.85))); // 0..1 over ~first screen
      if (wordsRef.current) { wordsRef.current.style.opacity = String(1 - Math.min(1, p * 1.25)); wordsRef.current.style.transform = `translateY(${(-p * 26).toFixed(1)}px)`; }
      if (veilRef.current) veilRef.current.style.opacity = String(1 - p); // veil lifts fully -> reels reach true brightness
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Cursor parallax: pointer position drives a per-card translate, applied
  // imperatively to each wrapper's style (never React state) so 60fps pointer
  // moves cause zero re-renders and no layout thrash — transform only, on GPU.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return; // touch / reduced-motion: no parallax

    const el = wrapRef.current;
    if (!el) return;
    const target = { x: 0, y: 0 };  // where the pointer wants the cards
    const cur = { x: 0, y: 0 };     // eased current offset
    let raf = 0;
    let running = false;

    const MAXX = 26, MAXY = 16; // px budget at the deepest layer

    const frame = () => {
      // ease toward target for a soft, springy follow
      cur.x += (target.x - cur.x) * 0.09;
      cur.y += (target.y - cur.y) * 0.09;
      cardRefs.current.forEach((node, i) => {
        if (!node) return;
        const d = depthFor(i);
        node.style.transform = `translate3d(${(cur.x * MAXX * d).toFixed(2)}px, ${(cur.y * MAXY * d).toFixed(2)}px, 0)`;
      });
      // keep running until we've essentially reached the target
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };

    const onMove = (e) => {
      const w = window.innerWidth || 1, h = window.innerHeight || 1;
      // normalize to [-1, 1] around screen center; negate so cards drift AWAY
      // from the cursor (subject leans in, background parallaxes out)
      target.x = -((e.clientX / w) * 2 - 1);
      target.y = -((e.clientY / h) * 2 - 1);
      kick();
    };
    const onLeave = () => { target.x = 0; target.y = 0; kick(); };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={wrapRef} style={{ position: "relative", minHeight: "100svh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* video collage backdrop */}
      <div ref={collageRef} style={{ position: "absolute", inset: "-6% -5%", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "center", alignContent: "center", transform: "rotate(-3deg)" }}>
        {wallReels.map((reel, i) => {
          const live = i < LIVE_WALL;
          // Parallax refs only on live cards (cheap set); poster cards stay static.
          return (
            <div key={reel.postUrl} ref={live ? (n => { cardRefs.current[i] = n; }) : undefined} style={{ flexShrink: 0, willChange: live ? "transform" : "auto" }}>
              <HeroCard reel={reel} i={i} live={live} />
            </div>
          );
        })}
      </div>
      {/* dim so type owns the frame — lifts on scroll (opacity via ref, no re-render) */}
      <div ref={veilRef} style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(10,10,10,0.34) 0%, rgba(10,10,10,0.62) 100%)", pointerEvents: "none", willChange: "opacity" }} />
      {/* the words — evaporate on scroll */}
      <div ref={wordsRef} style={{ position: "relative", textAlign: "center", padding: "0 24px", pointerEvents: "none", willChange: "opacity, transform" }}>
        {/* Aug 27 2026, Miles: "remove the green social producer at adobe maybe make
            it something that it like a sticky note or something more creatively
            chill". Same words, on a sticky note. */}
        <span className="tc-sticky" data-eyebrow="" style={{ display: "inline-block", position: "relative", fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 600, lineHeight: 1.15, color: "#3A3323", background: "#FFE97A", padding: "12px 18px 14px", borderRadius: 2, transform: "rotate(-2.5deg)", boxShadow: "0 8px 20px rgba(0,0,0,0.45)", marginBottom: 18 }}>Social Producer @Adobe | San Francisco</span>
        <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(44px, 8.5vw, 110px)", lineHeight: 0.98, letterSpacing: -2.5, margin: 0, color: C.white }}>
          Creative<span style={{ color: C.mint }}>.</span><br />
          Producer<span style={{ color: C.mint }}>.</span><br />
          <span style={{ color: "#F5C518" }}>Musician.</span>
        </h1>
        <span style={{ display: "inline-flex", marginTop: 34, animation: "cuebounce 1.8s ease-in-out infinite", fontFamily: F, fontSize: 13, fontWeight: 600, color: C.gray, border: `1px solid ${C.border}`, borderRadius: 100, padding: "9px 18px", background: "rgba(10,10,10,0.6)" }}>↓ scroll</span>
      </div>
    </section>
  );
}

// ===== WORK — Spotify-pattern library player =====

function Thumb({ reel, size = 44, radius = 6 }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #16302A, #0D1F2E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {failed
        ? <IcPlay s={Math.round(size * 0.3)} c="rgba(255,255,255,0.35)" />
        : <img src={thumbOf(reel)} alt="" loading="lazy" onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />}
    </div>
  );
}

// Role credit chips — Spotify's "E" tag idiom: small and quiet, riding the sub
// line next to the handle. The words are Miles's own: his Aug-1 email wording
// (ROLE_CREDITS) for the edit credit, then his Aug-10 tag codes spelled out.
// A reel he never tagged renders nothing at all.
// `big` = the Now Playing pane, where the chips sit on their own and can breathe.
// `md` = the bucket-page track rows (Aug 9): Miles's "what was your role in the
// video, it should be super clear, in the first glance" — a recruiter runs their
// eye down a track list, so the credit is set at 13px there, above the 12px
// floor, and never hidden behind hover.
// THREE OR MORE chips drop back to 12px and share one wrapping flex box: a row
// carrying "Mine end to end · Hosted · Directed · Produced" at 13px squeezes the
// handle line out of the track row entirely on a laptop, let alone a phone.
function CreditChip({ reel, big = false, md = false }) {
  const chips = roleChipsOf(reel);
  if (!chips.length) return null;
  const sz = (big || md) && chips.length < 3 ? 13 : 12;
  return (
    // The GROUP may shrink and wrap; an individual chip never may. That split
    // is what lets a four-chip row keep its handle line: the chips take the
    // width they need, wrap among themselves, and the sub line drops to the
    // next line instead of being crushed to zero.
    <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginRight: big ? 7 : 0, verticalAlign: "0.5px" }}>
      {chips.map(credit => (
        <span key={credit} title={`${credit} (Miles Spearman)`} style={{
          // Never mint: mint already means "playing" or "press this" on this site.
          display: "inline-block", fontFamily: F, fontSize: sz, fontWeight: 600, color: "rgba(255,255,255,0.72)",
          background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 4,
          padding: big ? "4px 9px" : md ? "2px 8px" : "1px 6px", whiteSpace: "nowrap", lineHeight: 1.3,
          // Never shrink: a half-rendered credit reads as a different claim.
          flexShrink: 0,
        }}>{credit}</span>
      ))}
    </span>
  );
}

function EqBars() {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 14 }} aria-label="Playing">
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 3, background: C.mint, borderRadius: 1, animation: `eqbar 0.9s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
    </span>
  );
}

function SideRow({ ev, active, isSourceOfAudio, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button className="sp-side-row" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        padding: 8, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: F,
        background: active ? "rgba(255,255,255,0.08)" : h ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.15s",
      }}>
      <span style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: gradFor(ev.idx), overflow: "hidden" }}>
        <img src={ev.cover} alt="" loading="lazy" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: isSourceOfAudio ? C.white : "rgba(255,255,255,0.72)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event}</span>
        <span style={{ display: "block", fontSize: 11.5, color: C.gray, marginTop: 2 }}>
          {ev.pinned && <span style={{ fontFamily: F, fontSize: 9, fontWeight: 800, color: C.bg, background: C.mint, borderRadius: 3, padding: "1px 4px", letterSpacing: 0.5, marginRight: 5, verticalAlign: "1px" }}>PINNED</span>}
          {ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"}{ev.totalPlays > 0 ? ` · ${fmtPlays(ev.totalPlays)} plays` : ""}</span>
      </span>
      {isSourceOfAudio && <EqBars />}
    </button>
  );
}

function TrackRow({ reel, i, active, playing, onPlay }) {
  const [h, setH] = useState(false);
  return (
    <div role="button" tabIndex={0} onClick={onPlay} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPlay(); } }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "grid", gridTemplateColumns: "26px 44px minmax(0,1fr) auto", gap: 12, alignItems: "center",
        padding: "8px 12px", borderRadius: 8, cursor: "pointer",
        background: h ? "rgba(255,255,255,0.07)" : active ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "background 0.15s",
      }}>
      <span style={{ fontFamily: F, fontSize: 13, color: C.gray, textAlign: "center" }}>
        {active && playing ? <EqBars /> : h ? <IcPlay s={11} c={C.white} /> : i + 1}
      </span>
      <Thumb reel={reel} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: F, fontSize: 14, fontWeight: 600, color: active ? C.white : "rgba(255,255,255,0.72)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reel.title}</span>
        {/* Flex, not one nowrap span: the chips keep their full width and the
            handle line ellipsizes around them (a clipped "Cut my" is a lie).
            Wrapping (Aug 10): with up to four chips on a row, the handle line
            takes the next line rather than collapsing to nothing. */}
        <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 2, minWidth: 0 }}>
          <CreditChip reel={reel} />
          <span style={{ fontFamily: F, fontSize: 12, color: C.gray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{subTag(reel)}</span>
        </span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href={reel.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title={`Open on ${platformOf(reel)}`} className="tracklist-ig"
          style={{ fontFamily: F, fontSize: 12, color: C.gray, textDecoration: "none", padding: "6px", minWidth: 24, textAlign: "center", opacity: h ? 1 : 0, transition: "opacity 0.15s" }}
          onMouseEnter={e => e.target.style.color = C.mint} onMouseLeave={e => e.target.style.color = C.gray}
        >↗</a>
        <span className="track-plays" style={{ fontFamily: F, fontSize: 13, color: active ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>{playsLabel(reel)}</span>
      </span>
    </div>
  );
}

function PlayerBar({ cur, eventName, playing, prog, dur, muted, onToggle, onStep, onSeek, onMute }) {
  const pct = dur ? (prog / dur) * 100 : 0;
  return (
    <div className="sp-bar" style={{ borderTop: `1px solid ${C.border}`, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", padding: "10px 16px", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 12 }}>
      {/* Left: track + "artist" */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {cur ? (
          <>
            <Thumb reel={cur} size={48} radius={8} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: F, fontSize: 13.5, fontWeight: 600, color: C.white, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.title}</p>
              <p style={{ fontFamily: F, fontSize: 11.5, color: C.gray, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{eventName}</p>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, margin: 0 }}>Pick a reel · {TOTAL_REELS} in the library</p>
        )}
      </div>
      {/* Center: transport + progress */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button onClick={() => onStep(-1)} disabled={!cur} aria-label="Previous reel" style={{ background: "none", border: "none", cursor: cur ? "pointer" : "default", opacity: cur ? 0.85 : 0.3, padding: 4 }}><IcPrev /></button>
          <button onClick={onToggle} disabled={!cur} aria-label={playing ? "Pause" : "Play"}
            style={{ width: 36, height: 36, borderRadius: "50%", background: cur ? C.mint : "rgba(255,255,255,0.15)", border: "none", cursor: cur ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }}
            onMouseEnter={e => { if (cur) e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            {playing ? <IcPause s={13} /> : <IcPlay s={13} />}
          </button>
          <button onClick={() => onStep(1)} disabled={!cur} aria-label="Next reel" style={{ background: "none", border: "none", cursor: cur ? "pointer" : "default", opacity: cur ? 0.85 : 0.3, padding: 4 }}><IcNext /></button>
        </div>
        <div className="sp-progress" style={{ display: "flex", alignItems: "center", gap: 8, width: "min(38vw, 420px)" }}>
          <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, fontVariantNumeric: "tabular-nums", width: 30, textAlign: "right" }}>{fmtTime(prog)}</span>
          <div onClick={cur ? onSeek : undefined} role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(dur || 0)} aria-valuenow={Math.round(prog || 0)}
            style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", cursor: cur ? "pointer" : "default", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 2, background: C.mint }} />
          </div>
          <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, fontVariantNumeric: "tabular-nums", width: 30 }}>{fmtTime(dur)}</span>
        </div>
      </div>
      {/* Right: volume + IG */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
        <button onClick={onMute} aria-label={muted ? "Unmute" : "Mute"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><IcVol muted={muted} /></button>
        {cur && (
          <a className="sp-ig-link" href={cur.postUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: F, fontSize: 11.5, fontWeight: 600, color: C.gray, textDecoration: "none", border: `1px solid ${C.border}`, padding: "6px 12px", borderRadius: 100, whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s" }}
            onMouseEnter={e => { e.target.style.color = C.mint; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.target.style.color = C.gray; e.target.style.borderColor = C.border; }}
          ><span className="sp-ig-label">Open on {platformOf(cur)} </span>↗</a>
        )}
      </div>
    </div>
  );
}

// The homepage Work Playlist. The old `bucket` prop that scoped this player to
// one type bucket was RETIRED Aug 9 2026: #/work/<bucket> is now the Navin page
// (BucketPage), which needs no sidebar, no second Now Playing pane and no
// transport bar. This component is the single-page player and nothing else.
function WorkPlayer() {
  const rows = eventStats;
  // Open on the pinned B2B playlist (index 0 after the pinned-first sort) —
  // the chip that reads first should also be the one that's selected.
  const [libIdx, setLibIdx] = useState(() => Math.max(0, portfolio.findIndex(e => e.pinned)));
  const [track, setTrack] = useState(null); // { e, r } indices into portfolio
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);
  // Start muted (Miles Jul 4): autoplay never surprises with sound; the bar unmutes and it sticks.
  const [muted, setMuted] = useState(true);
  const [vidErr, setVidErr] = useState(false);
  const vidRef = useRef(null);
  const shellRef = useRef(null);

  const cur = track ? portfolio[track.e].reels[track.r] : null;
  const viewing = eventStats[libIdx];
  // "Your Library" totals describe what this sidebar actually holds (derived).
  const sideReels = TOTAL_REELS;
  const sidePlays = TOTAL_PLAYS;

  const playTrack = (e, r) => { setVidErr(false); setProg(0); setDur(0); setTrack({ e, r }); };

  // Hero carousel / capability cards dispatch ms-play to deep-link into the library
  useEffect(() => {
    const h = (ev) => { setLibIdx(ev.detail.e); setVidErr(false); setProg(0); setDur(0); setTrack({ e: ev.detail.e, r: ev.detail.r }); };
    window.addEventListener("ms-play", h);
    // A request parked by goPlay before this player existed (Aug 11): the link
    // that fired it was on another route, so there was no listener to hear it.
    // Consumed exactly once.
    if (PENDING_PLAY) { const p = PENDING_PLAY; PENDING_PLAY = null; h({ detail: p }); }
    return () => window.removeEventListener("ms-play", h);
  }, []);

  // #/case/<slug> deep-link: play the matching reel on initial load + on hash
  // change, reusing the ms-play path. Unknown slug = no-op. Must sit AFTER the
  // ms-play listener above so it's registered before the on-load dispatch.
  useEffect(() => {
    const open = () => {
      const hit = caseFromHash();
      if (!hit) return;
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("ms-play", { detail: hit }));
      // Cold load: images/videos above #work land AFTER this scroll and push the
      // player down the page, so re-aim once everything has its real height.
      window.addEventListener("load", () => document.getElementById("work")?.scrollIntoView(), { once: true });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  // Reflect the open reel into the URL so the link is copy-pasteable.
  // replaceState (not location.hash) => no hashchange loop, no history spam.
  useEffect(() => {
    if (!track) return;
    const slug = slugify(portfolio[track.e].reels[track.r].title);
    if (slug) history.replaceState(null, "", `#/case/${slug}`);
  }, [track]);

  // Single <video> is the source of truth; on track change, load + play.
  useEffect(() => {
    const v = vidRef.current;
    if (!v || !cur) return;
    v.load();
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => { const v = vidRef.current; if (!v || !cur) return; if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); };
  const step = (d) => { if (!track) return; const list = portfolio[track.e].reels; const n = track.r + d; if (n >= 0 && n < list.length) playTrack(track.e, n); };
  const seek = (ev) => { const v = vidRef.current; if (!v || !dur) return; const rect = ev.currentTarget.getBoundingClientRect(); v.currentTime = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)) * dur; };
  const openEvent = (i) => { setLibIdx(i); if (shellRef.current) shellRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <>
      {/* Player shell */}
      <FadeIn>
        <div ref={shellRef} className="sp-shell" style={{ border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", background: "#0D0D0D", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          <div className="sp-body">
            {/* Sidebar — Your Library */}
            <aside className="sp-side">
              <div style={{ padding: "16px 16px 10px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white }}>Your Library</span>
                <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, whiteSpace: "nowrap" }}>{sideReels} reels · {fmtPlays(sidePlays)} plays</span>
              </div>
              <div className="sp-side-list">
                {rows.map((ev, n) => (
                  <Fragment key={ev.event}>
                    {/* Type-bucket dividers (Miles's 4 buckets). The pinned B2B
                        mirror sits above them all, unlabelled — it spans three
                        buckets. */}
                    {!ev.pinned && (n === 0 || rows[n - 1].pinned || BUCKET_OF[rows[n - 1].event] !== BUCKET_OF[ev.event]) && (
                      <div className="sp-side-divider" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px 4px", flexShrink: 0 }}>
                        <span style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>{BUCKET_OF[ev.event]}</span>
                        <span style={{ flex: 1, height: 1, background: C.border }} />
                      </div>
                    )}
                    <SideRow ev={ev} active={ev.idx === libIdx} isSourceOfAudio={!!track && track.e === ev.idx && playing} onClick={() => setLibIdx(ev.idx)} />
                  </Fragment>
                ))}
              </div>
            </aside>

            {/* Detail panel — album view */}
            <main className="sp-main">
              <div style={{ padding: "28px 24px 20px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 20, background: `linear-gradient(180deg, ${GRADS[viewing.idx % GRADS.length][0]}, rgba(13,13,13,0) 96%)` }}>
                <span className="sp-cover" style={{ width: 120, height: 120, borderRadius: 12, flexShrink: 0, background: gradFor(viewing.idx), overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <img src={viewing.cover} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 2 }}>Playlist</span>
                  <h3 style={{ fontFamily: F, fontSize: "clamp(24px, 3.4vw, 44px)", fontWeight: 800, color: C.white, margin: "4px 0 8px", letterSpacing: -1, lineHeight: 1.05 }}>{viewing.event}</h3>
                  {viewing.role && <p style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", margin: "0 0 5px" }}>{viewing.role} by Miles Spearman</p>}
                  <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{viewing.event} · {viewing.reels.length} {viewing.reels.length === 1 ? "reel" : "reels"}{viewing.totalPlays > 0 ? ` · ${fmtPlays(viewing.totalPlays)} plays` : ""}{viewing.window ? ` · ${viewing.window}` : ""}{EVENT_PARTNERS[viewing.event] ? ` · with ${EVENT_PARTNERS[viewing.event]}` : ""}</p>
                  {viewing.reels.some(r => !r.plays) && (
                    <p style={{ fontFamily: F, fontSize: 11, color: C.gray, margin: "6px 0 0" }}>LinkedIn and Instagram carousel posts don't publish view counts, so those show N/A.</p>
                  )}
                </div>
                {/* The MAX split is a paragraph, not a caption: it gets the full
                    header width (last child, 100% basis) instead of towering in
                    the text column beside the cover. Never truncated. */}
                {/* MAX render site 1 of 2. MAX_CASE_PARAS (Aug 11) = his goal
                    clause + the split, so the clause opens the MAX case here
                    exactly as it does on the role pages. */}
                {MAX_SPLIT_PLAYLISTS.includes(viewing.event) && (
                  <Prose text={MAX_CASE_PARAS} style={{ flexBasis: "100%", margin: "14px 0 0" }} />
                )}
              </div>
              <div style={{ padding: "12px 24px 8px" }}>
                <button onClick={() => playTrack(viewing.idx, 0)} aria-label={`Play ${viewing.event}`}
                  style={{ width: 48, height: 48, borderRadius: "50%", background: C.mint, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 24px ${C.mint}35`, transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <IcPlay s={17} />
                </button>
              </div>
              {/* Track list */}
              <div style={{ padding: "4px 12px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "26px 44px minmax(0,1fr) auto", gap: 12, padding: "4px 12px 8px", borderBottom: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <span style={{ fontFamily: F, fontSize: 11, color: C.gray, textAlign: "center" }}>#</span>
                  <span />
                  <span style={{ fontFamily: F, fontSize: 11, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase" }}>Title</span>
                  <span style={{ fontFamily: F, fontSize: 11, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase" }}>Plays</span>
                </div>
                {viewing.groupBy === "year-channel" ? (() => {
                  // Miles's In-House layout: year (desc) -> channel sections,
                  // all derived from each reel's sub string. Numbering restarts
                  // per channel; original indices keep playback wiring intact.
                  const byYear = new Map();
                  viewing.reels.forEach((r, i) => {
                    const y = new Date(reelDate(r)).getFullYear() || 0;
                    const h = handleTag(r);
                    if (!byYear.has(y)) byYear.set(y, new Map());
                    const ch = byYear.get(y);
                    if (!ch.has(h)) ch.set(h, []);
                    ch.get(h).push({ r, i });
                  });
                  return [...byYear.entries()].sort((a, b) => b[0] - a[0]).map(([year, channels]) => (
                    <div key={year}>
                      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 800, color: C.white, letterSpacing: 1, padding: "18px 12px 2px" }}>{year || "Undated"}</div>
                      {[...channels.entries()].map(([handle, items]) => (
                        <div key={handle}>
                          <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.mint, letterSpacing: 1, padding: "10px 12px 4px" }}>{handle}</div>
                          {items.map(({ r, i }, n) => (
                            <TrackRow key={r.postUrl} reel={r} i={n}
                              active={!!track && track.e === viewing.idx && track.r === i}
                              playing={playing}
                              onPlay={() => playTrack(viewing.idx, i)} />
                          ))}
                        </div>
                      ))}
                    </div>
                  ));
                })() : viewing.reels.map((r, i) => (
                  <TrackRow key={r.postUrl} reel={r} i={i}
                    active={!!track && track.e === viewing.idx && track.r === i}
                    playing={playing}
                    onPlay={() => playTrack(viewing.idx, i)} />
                ))}
              </div>
            </main>

            {/* Now Playing — the one real <video> */}
            {cur && (
              <div className="sp-now">
                <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Now Playing</p>
                <div className={cur.landscape ? "sp-now-ls" : ""} style={{ position: "relative" }}>
                  {/* A watch-only row has no file to mount, so the poster +
                      watch button stands in for the player. The transport bar
                      below keeps working on the rest of the playlist. */}
                  {watchOnly(cur) ? <WatchFrame reel={cur} /> : (
                  <video
                    ref={vidRef}
                    src={srcOf(cur)}
                    poster={thumbOf(cur)}
                    playsInline
                    muted={muted}
                    preload="metadata"
                    onClick={toggle}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onTimeUpdate={e => setProg(e.target.currentTime)}
                    onLoadedMetadata={e => setDur(e.target.duration)}
                    onEnded={() => step(1)}
                    onError={() => { setVidErr(true); setPlaying(false); }}
                    style={{ width: "100%", aspectRatio: cur && cur.landscape ? "16 / 9" : "9 / 16", objectFit: cur && cur.landscape ? "contain" : "cover", borderRadius: 12, background: "#000", cursor: "pointer", display: "block" }}
                  />
                  )}
                  {vidErr && !watchOnly(cur) && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(10,10,10,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
                      <span style={{ fontSize: 26 }}>🎬</span>
                      <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: 0, lineHeight: 1.5 }}>This file hasn't landed on the server yet.</p>
                      <a href={cur.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.bg, background: C.mint, padding: "8px 18px", borderRadius: 100, textDecoration: "none" }}>Watch on {platformOf(cur)} ↗</a>
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white, margin: "12px 0 2px" }}>{cur.title}</p>
                <p style={{ fontFamily: F, fontSize: 12, color: C.gray, margin: 0 }}><CreditChip reel={cur} big />{subTag(cur)}</p>
                <p style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint, margin: "6px 0 0", lineHeight: 1.4 }}>{cur.role || EVENT_ROLES[(portfolio[track.e].pinned && reelIndexByTitle(cur.title)) ? portfolio[reelIndexByTitle(cur.title).e].event : portfolio[track.e].event] || ""}</p>
              </div>
            )}
          </div>

          <PlayerBar
            cur={cur}
            eventName={cur ? `${handleTag(cur)} · ${portfolio[track.e].event}` : ""}
            playing={playing} prog={prog} dur={dur} muted={muted}
            onToggle={toggle} onStep={step} onSeek={seek} onMute={() => setMuted(m => !m)}
          />
        </div>
      </FadeIn>
    </>
  );
}

// ===== PLAYLIST SHELF — Your Library as a Navin-style cover-card carousel =====
// `inPage` = this shelf is rendered on the #/playlist PAGE rather than the
// homepage. Same card, same select path (the ms-play event the player already
// listens for); the only difference is that the anchor must NOT navigate. On
// the homepage `href="#work"` is a real in-page jump, but on a page route it
// would set the hash to "#work", which routeFromHash reads as "home" and would
// tear the player down mid-select. So in-page clicks preventDefault and scroll
// the player into view by hand — the B2BStrip / HeroCard path.
function ShelfCard({ ev, inPage = false }) {
  const [h, setH] = useState(false);
  return (
    <a href="#work"
      onClick={(e) => {
        if (inPage) {
          e.preventDefault();
          (document.getElementById("playlist-player") || document.getElementById("work"))?.scrollIntoView({ behavior: "smooth" });
        }
        window.dispatchEvent(new CustomEvent("ms-play", { detail: { e: ev.idx, r: 0 } }));
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        textDecoration: "none", flexShrink: 0, width: 200, scrollSnapAlign: "start",
        background: h ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${h ? "rgba(255,255,255,0.25)" : C.border}`, borderRadius: 14, padding: 14,
        transform: h ? "translateY(-5px)" : "none", transition: "all 0.25s", display: "block",
      }}>
      <span style={{ display: "block", width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: gradFor(ev.idx), position: "relative" }}>
        <img src={ev.cover} alt="" loading="lazy" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
        <span className="shelf-card-play" style={{ position: "absolute", right: 10, bottom: 10, width: 42, height: 42, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", opacity: h ? 1 : 0, transform: h ? "translateY(0)" : "translateY(6px)", transition: "all 0.25s", boxShadow: `0 6px 24px ${C.mint}50` }}><IcPlay s={16} /></span>
      </span>
      <span style={{ display: "block", marginTop: 12, fontFamily: F, fontSize: 14.5, fontWeight: 700, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event}</span>
      <span style={{ display: "block", marginTop: 4, fontFamily: F, fontSize: 11.5, color: C.gray }}>{ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"}{ev.totalPlays > 0 ? ` · ${fmtPlays(ev.totalPlays)} plays` : ""}</span>
    </a>
  );
}

function ShelfRow({ title, items, inPage = false }) {
  const rowRef = useRef(null);
  const scroll = (d) => rowRef.current && rowRef.current.scrollBy({ left: d * 600, behavior: "smooth" });
  return (
    <div style={{ marginBottom: 34 }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "clamp(24px, 5vw, 80px)", marginBottom: 16 }}>
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3 }}>{title}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {[["‹", -1], ["›", 1]].map(([glyph, d]) => (
              <button key={glyph} className="shelf-arrow" onClick={() => scroll(d)} aria-label={`Scroll ${title} ${d < 0 ? "left" : "right"}`}
                style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.white, fontFamily: F, fontSize: 18, cursor: "pointer", lineHeight: 1, transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >{glyph}</button>
            ))}
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.08}>
        <div ref={rowRef} className="shelf-row" style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, paddingRight: "clamp(24px, 5vw, 80px)" }}>
          {items.map(ev => <ShelfCard key={ev.event} ev={ev} inPage={inPage} />)}
        </div>
      </FadeIn>
    </div>
  );
}

// ===== CAREER TIMELINE — vertical spine, newest first, tap a node to play in place =====
// ── Timeline expand: poster carousel (won the 3-way prototype). Tap a project →
// swipe its reels as 9:16 posters, tap ▶ to play one inline; "Expand" opens a
// detail sheet with the reel's caption + which project it lived under.
function TLMiniBtn({ onMinimize }) {
  return (
    <button onClick={e => { e.stopPropagation(); onMinimize(); }} aria-label="Minimize this reel"
      style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.gray, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 100, padding: "7px 14px", minHeight: 40, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      ▲ Minimize</button>
  );
}
function TLMinimizeX({ onMinimize }) {
  return (
    <button onClick={e => { e.stopPropagation(); onMinimize(); }} aria-label="Minimize this reel"
      style={{ position: "absolute", top: 8, right: 2, width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.border}`, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", color: C.white, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, zIndex: 5 }}>✕</button>
  );
}
const nearestChildIdx = (el) => {
  const center = el.scrollLeft + el.clientWidth / 2;
  let best = 0, bestD = Infinity;
  for (let i = 0; i < el.children.length; i++) {
    const c = el.children[i];
    const cc = c.offsetLeft + c.offsetWidth / 2;
    const d = Math.abs(cc - center);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
};
const reelDateStr = (r) => ((r.sub || "").split(" · ").pop() || "").trim();

// The "Expand" detail sheet — a bigger view of one reel with its caption and the
// project it lived under. Poster → tap to play. Esc / scrim / ✕ to close.
function TLDetail({ ev, reel, cat, onClose }) {
  const [play, setPlay] = useState(false);
  const caption = REEL_DESCS[reel.title] || "";
  const date = reelDateStr(reel);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1400, background: "rgba(10,10,10,0.72)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "drawerFade 0.25s" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={reel.title}
        style={{ width: "min(460px, 100%)", maxHeight: "92svh", overflowY: "auto", background: "#0D0D0D", borderRadius: "18px 18px 0 0", border: `1px solid ${C.border}`, padding: 20, animation: "sheetIn 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 700, color: cat.accent, textTransform: "uppercase", letterSpacing: 1.5, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.chip ? cat.chip + " · " : ""}{ev.event}</span>
          <button onClick={onClose} aria-label="Close" style={{ flex: "0 0 auto", width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.06)", color: C.white, fontSize: 15, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: reel.landscape ? "min(94%, 380px)" : "min(66%, 220px)", aspectRatio: reel.landscape ? "16 / 9" : "9 / 16", borderRadius: 14, overflow: "hidden", background: "#000" }}>
            {watchOnly(reel) ? <WatchFrame reel={reel} radius={14} /> : play ? (
              <video src={srcOf(reel)} poster={thumbOf(reel)} controls autoPlay muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <button onClick={() => setPlay(true)} aria-label={`Play ${reel.title}`}
                style={{ position: "absolute", inset: 0, border: "none", padding: 0, background: "transparent", cursor: "pointer" }}>
                <img src={thumbOf(reel)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 54, height: 54, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</span>
              </button>
            )}
          </div>
        </div>
        <h3 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, color: C.white, margin: "16px 0 0", letterSpacing: -0.3, lineHeight: 1.22 }}>{reel.title}</h3>
        <span style={{ display: "block", fontFamily: F, fontSize: 12.5, color: C.gray, marginTop: 6 }}>{[reel.plays ? `${reel.plays} plays` : null, date].filter(Boolean).join(" · ")}</span>
        {caption ? (
          <p style={{ fontFamily: F, fontSize: 13.5, color: "rgba(255,255,255,0.84)", lineHeight: 1.65, margin: "14px 0 4px", whiteSpace: "pre-line" }}>{caption}</p>
        ) : (
          <p style={{ fontFamily: F, fontSize: 13, color: C.gray, fontStyle: "italic", margin: "14px 0 4px" }}>No caption saved for this reel yet.</p>
        )}
      </div>
    </div>
  );
}

function TLExpand({ ev, reels, cat, onMinimize }) {
  const [idx, setIdx] = useState(0);              // active reel (carousel + swipe share it)
  const [playing, setPlaying] = useState(null);   // carousel: which poster is playing
  const [view, setView] = useState("carousel");   // "carousel" | "swipe"
  const scRef = useRef(null);                      // carousel pager
  const swRef = useRef(null);                      // swipe pager
  const rafRef = useRef(0);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  // Entering swipe view, jump the pager to the reel you were on in the carousel.
  useEffect(() => { if (view === "swipe" && swRef.current) { const el = swRef.current; el.scrollLeft = idx * el.clientWidth; } }, [view]);
  const track = (ref) => {
    const el = ref.current; if (!el || rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => { rafRef.current = 0; setIdx(nearestChildIdx(el)); });
  };
  const onCarouselScroll = () => {
    const el = scRef.current; if (!el || rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const n = nearestChildIdx(el);
      setIdx(prev => { if (n !== prev) setPlaying(null); return n; });
    });
  };
  const active = reels[Math.min(idx, reels.length - 1)] || reels[0];
  const desc = active ? (REEL_DESCS[active.title] || "") : "";

  // EXPANDED SWIPE VIEW — full videos, swipe left/right through the project's
  // reels, caption under each. "Minimize" / ✕ returns to the carousel.
  if (view === "swipe") {
    return (
      <div data-tl-open="" style={{ position: "relative", padding: "12px 0 8px" }}>
        <button onClick={e => { e.stopPropagation(); setView("carousel"); }} aria-label="Back to carousel"
          style={{ position: "absolute", top: 8, right: 2, width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.border}`, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", color: C.white, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, zIndex: 5 }}>✕</button>
        <div ref={swRef} onScroll={() => track(swRef)} className="tl-pager"
          style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          {reels.map((r, i) => {
            const near = Math.abs(i - idx) <= 1;
            return (
              <div key={r.postUrl} style={{ flex: "0 0 100%", scrollSnapAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", padding: "0 8px" }}>
                <div style={{ position: "relative", width: r.landscape ? "min(94%, 380px)" : "min(80%, 260px)", aspectRatio: r.landscape ? "16 / 9" : "9 / 16", borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: i === idx ? "0 12px 40px rgba(0,0,0,0.5)" : "none", opacity: i === idx ? 1 : 0.45, transition: "opacity 0.25s" }}>
                  {watchOnly(r) ? (
                    <WatchFrame reel={r} radius={14} />
                  ) : near ? (
                    <video key={r.postUrl} src={srcOf(r)} poster={thumbOf(r)} controls muted playsInline autoPlay={i === idx}
                      ref={el => { if (el) { i === idx ? el.play().catch(() => {}) : el.pause(); } }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <img src={thumbOf(r)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
          {reels.map((r, i) => (
            <span key={r.postUrl} aria-hidden="true" style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? cat.accent : "rgba(255,255,255,0.25)", transition: "width 0.2s, background 0.2s" }} />
          ))}
        </div>
        <div style={{ maxWidth: 420, margin: "12px auto 0", padding: "0 18px" }}>
          <span style={{ display: "block", fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.25, textAlign: "center" }}>{active.title}</span>
          <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 4, textAlign: "center" }}>{[active.plays ? `${active.plays} plays` : null, reelDateStr(active) || null, `${idx + 1} / ${reels.length}`, "swipe"].filter(Boolean).join(" · ")}</span>
          {desc ? (
            <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.84)", lineHeight: 1.6, margin: "12px 0 0", whiteSpace: "pre-line" }}>{desc}</p>
          ) : (
            <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, fontStyle: "italic", margin: "12px 0 0", textAlign: "center" }}>No caption saved for this reel yet.</p>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button onClick={e => { e.stopPropagation(); setView("carousel"); }} aria-label="Minimize to carousel"
            style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.bg, background: cat.accent, border: "none", borderRadius: 100, padding: "9px 20px", minHeight: 40, cursor: "pointer" }}>
            ▲ Minimize</button>
        </div>
      </div>
    );
  }

  return (
    <div data-tl-open="" style={{ position: "relative", padding: "16px 0 8px" }}>
      <TLMinimizeX onMinimize={onMinimize} />
      <div ref={scRef} onScroll={onCarouselScroll} className="tl-pager"
        style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", padding: "0 18%", scrollbarWidth: "none" }}>
        {reels.map((r, i) => (
          <div key={r.postUrl} style={{ flex: r.landscape ? "0 0 88%" : "0 0 70%", maxWidth: r.landscape ? 340 : 250, scrollSnapAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: r.landscape ? "16 / 9" : "9 / 16", borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: i === idx ? "0 12px 40px rgba(0,0,0,0.5)" : "none", opacity: i === idx ? 1 : 0.5, transition: "opacity 0.25s" }}>
              <button onClick={() => { setIdx(i); setView("swipe"); }} aria-label={`Open ${r.title}`}
                style={{ position: "absolute", inset: 0, border: "none", padding: 0, background: "transparent", cursor: "pointer" }}>
                <img src={thumbOf(r)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
        {reels.map((r, i) => (
          <span key={r.postUrl} aria-hidden="true" style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? cat.accent : "rgba(255,255,255,0.25)", transition: "width 0.2s, background 0.2s" }} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 12, padding: "0 16px" }}>
        <span style={{ display: "block", fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.25 }}>{active.title}</span>
        <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 4 }}>{[active.plays ? `${active.plays} plays` : null, reelDateStr(active) || null, "tap to open"].filter(Boolean).join(" · ")}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={e => { e.stopPropagation(); setView("swipe"); }}
            style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.bg, background: cat.accent, border: "none", borderRadius: 100, padding: "9px 20px", minHeight: 40, cursor: "pointer" }}>
            Expand</button>
          <TLMiniBtn onMinimize={onMinimize} />
        </div>
      </div>
    </div>
  );
}

// ===== #/timeline — the career timeline as its own page (Miles, Aug 9: "the
// timeline should also be it's own page along with the work playlist, that way
// everything lives in a spot"). Same spine, same nodes, same carousel — it just
// has a permanent address now instead of being a stop on the homepage scroll.
// The homepage keeps TimelineSummary below as the door. =====
// ===== The timeline's role-filter chips =====
// Five tappable chips, one per ROLE_TABS entry, plus All. Single-select — a
// person is asking one question at a time ("what did he host?"), and two answers
// at once is a different question.
// Aug 10 2026, REPLACES the dim behaviour this comment used to describe. Miles
// used the live filter and said: "when i push something i want the other things
// to collapse, so it's easy to see the kind of work that i have done". So a
// miss no longer sits there at 0.25 opacity — it collapses out of the flow and
// the spine becomes a short list of just that kind of work. The old reasoning
// (keep the career shape visible) lost to the thing he actually wanted the
// filter FOR, which is reading one kind of work without the rest in the way.
// Colour: with nothing selected every chip carries its own hue, because with no
// filter running these are five available choices, not five claims. Select one
// and the rest go to the gray treatment, which is the same visual language the
// header matrix uses for off. The selected chip takes the full lit styling —
// hue text, hue fill, hue border — identical to a lit matrix chip, so the same
// word is the same colour everywhere on the site.
function TLRoleFilter({ value, onPick }) {
  const base = { fontFamily: F, fontSize: 12.5, fontWeight: 700, lineHeight: 1, borderRadius: 100, padding: "11px 14px", minHeight: 40, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s, background 0.2s, border-color 0.2s" };
  return (
    <div role="group" aria-label="Filter the timeline by role" className="tl-filter"
      style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 26px" }}>
      <button type="button" aria-pressed={value === null} onClick={() => onPick(null)}
        style={{ ...base, color: value === null ? C.white : "rgba(255,255,255,0.45)", background: value === null ? "rgba(255,255,255,0.08)" : "transparent", border: `1px solid ${value === null ? "rgba(255,255,255,0.22)" : C.border}` }}>All</button>
      {ROLE_TABS.map(tab => {
        const hue = ROLE_TAB_COLORS[tab];
        const on = value === tab;
        const idle = value === null; // nothing selected: every chip shows its hue
        return (
          <button key={tab} type="button" aria-pressed={on}
            // Tapping the live chip clears the filter, so the chip is its own
            // off switch and All is a shortcut rather than the only way back.
            onClick={() => onPick(on ? null : tab)}
            style={{
              ...base,
              color: on || idle ? hue : "rgba(255,255,255,0.30)",
              background: on ? tabFill(hue) : "transparent",
              border: `1px solid ${on ? tabEdge(hue) : idle ? `${hue}3D` : "rgba(255,255,255,0.07)"}`,
            }}>{tab}</button>
        );
      })}
    </div>
  );
}

function CareerTimeline() {
  const [openIdx, setOpenIdx] = useState(null); // eventStats idx of the open node
  const [reelIdx, setReelIdx] = useState(0);    // active reel within the open node
  const [role, setRole] = useState(null);       // active role filter, null = all lit
  const railRef = useRef(null);
  const fillRef = useRef(null);

  // The rail "lights up green" behind you as you scroll — rAF-throttled, reduced-motion-gated.
  useEffect(() => {
    const rail = railRef.current, fill = fillRef.current;
    if (!rail || !fill) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { fill.style.height = "0%"; return; }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = rail.getBoundingClientRect();
        const prog = Math.max(0, Math.min(1, (window.innerHeight * 0.5 - r.top) / (r.height || 1)));
        fill.style.height = `${prog * 100}%`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const toggle = (idx) => { setOpenIdx(o => (o === idx ? null : idx)); setReelIdx(0); };

  // ===== FILTER MODEL (Aug 10 2026) =====
  // One predicate, read in four places (the nodes, the year headers, the year
  // stat lines, the spine hue) so they can never disagree about what is showing.
  const nodeLit = (ev) => role === null || !!(TL_NODE_ROLES[ev.idx] || [])[ROLE_TABS.indexOf(role)];
  const shown = timelineNodes.filter(nodeLit);
  // A year header survives only if that year still has a node under it. Which
  // node OWNS the header is recomputed over the surviving list, so the header
  // always sits on the first VISIBLE node of its year rather than on a collapsed
  // one further up.
  const headerOwner = new Set();
  { let last = null; shown.forEach(ev => { const y = yearOf(ev); if (y !== last) { headerOwner.add(ev.idx); last = y; } }); }
  // Year stat lines recomputed over the filtered set. Miles's brief said these
  // could stay as the unfiltered year totals; I recomputed them instead, because
  // "8 projects · 24 reels · 5.4M plays" printed above three visible cards is the
  // page contradicting itself, and this site's whole rule is that a number on
  // screen describes what is on screen. It is the SAME derivation (metaOf), just
  // run over the filtered nodes — nothing hand-typed, and reverting is one word:
  // swap `filteredYearMeta[yr]` back to `yearMeta[yr]` below.
  const filteredYearMeta = {};
  shown.forEach(ev => { const y = yearOf(ev); (filteredYearMeta[y] = filteredYearMeta[y] || []).push(ev); });
  Object.keys(filteredYearMeta).forEach(y => { filteredYearMeta[y] = metaOf(filteredYearMeta[y]); });
  // The spine takes the active role's hue — his words: "i want the line to
  // change to the color of the label for example 'Hosted'". Mint is the default
  // (no filter), and mint keeps meaning "playing / press this" everywhere else,
  // so it only ever appears here when nothing is filtered.
  const spineHue = role === null ? C.mint : (ROLE_TAB_COLORS[role] || C.mint);

  // A node that is open when the filter changes under it would collapse with a
  // playing <video> sealed inside. Close it instead.
  useEffect(() => {
    if (openIdx === null) return;
    const ev = timelineNodes.find(x => x.idx === openIdx);
    if (ev && !nodeLit(ev)) setOpenIdx(null);
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-collapse the open node once it has scrolled fully out of view — "moved
  // on = closed" (also unmounts its <video>). Guarded so it only fires AFTER the
  // card has been seen once, so tapping a card low on the screen (its expanded
  // body rendering below the fold) doesn't snap shut immediately.
  useEffect(() => {
    if (openIdx === null) return;
    const el = document.querySelector("[data-tl-open]");
    if (!el) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) seen = true;
      else if (seen) setOpenIdx(null);
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [openIdx]);

  let lastYear = null;
  return (
    <section id="timeline" style={{ padding: "calc(104px + env(safe-area-inset-top)) clamp(24px, 5vw, 80px) 40px" }}>
      <FadeIn>
        {/* 44px tap target, the BucketPage back-link pattern: the back link is
            the only way out of a page route. Lands on the homepage's slim
            Timeline block, where the trip started. */}
        <a href="#timeline" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 13, color: C.gray, textDecoration: "none", minHeight: 44, padding: "10px 12px 10px 0", marginBottom: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = C.mint} onMouseLeave={e => e.currentTarget.style.color = C.gray}>← Back</a>
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Timeline</span>
        <h1 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>The Work, In Order</h1>
        <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 20px 0", maxWidth: 520 }}>Every event and in-house project on one scroll. Tap a milestone to play it. Newest first.</p>
      </FadeIn>

      {/* ===== Role filter — BUILT Aug 10 (was the deferred mount point) =====
          The five role tabs as tappable chips. Booleans come from TL_NODE_ROLES,
          which is `roleTabsFor` run over the spine, so the header matrix and the
          timeline can never disagree. */}
      <FadeIn><TLRoleFilter value={role} onPick={setRole} /></FadeIn>

      <div className="tl-wrap" style={{ position: "relative", paddingLeft: "var(--gap)" }}>
        {/* The spine takes the filter's colour. The TRACK gets the hue at low
            alpha and the scroll FILL gets it at full strength, so the whole line
            reads as that role rather than only the part you have scrolled past.
            The fill's `height` is written imperatively by the scroll effect
            above; React's style diff only rewrites properties that changed
            between renders, and height is "0%" in the JSX on every render, so
            re-colouring the fill never resets the scroll progress. */}
        <div ref={railRef} aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: "var(--rail)", width: 2, background: role === null ? C.border : `${spineHue}38`, transition: _reduceMotion ? "none" : "background 0.3s ease" }}>
          <div ref={fillRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "0%", background: spineHue, boxShadow: `0 0 12px ${spineHue}`, transition: _reduceMotion ? "height 0.12s linear" : "height 0.12s linear, background 0.3s ease, box-shadow 0.3s ease" }} />
        </div>

        {timelineNodes.map((ev) => {
          const yr = yearOf(ev);
          const cat = TL_CAT[BUCKET_OF[ev.event]] || { accent: C.mint, chip: "" };
          const open = openIdx === ev.idx;
          // A year header renders only where the FILTERED list says it should:
          // on the first surviving node of a year that still has one. A year
          // filtered down to nothing loses its header with it. (`lastYear` is
          // kept for the unfiltered pass so `All` behaves exactly as before.)
          const showYear = role === null ? (yr !== lastYear) : headerOwner.has(ev.idx); lastYear = yr;
          const meta = (role === null ? yearMeta[yr] : filteredYearMeta[yr]) || { count: 0, reels: 0, plays: 0 };
          // Chronological within a project — newest reel first — so the carousel
          // reads in order (e.g. Brand Partnerships: Eyes of Wakanda → NWSL → GSW).
          const reels = [...ev.reels].sort((x, y) => (Number(!!y.landscape) - Number(!!x.landscape)) || (reelDate(y) - reelDate(x)));
          const active = reels[Math.min(reelIdx, reels.length - 1)] || reels[0];
          const desc = active ? (REEL_DESCS[active.title] || "") : "";
          // Filter = COLLAPSE (Aug 10, his call). A node whose booleans don't
          // carry the picked role animates its height to zero and leaves the
          // flow, so what remains is only that kind of work. It stays mounted
          // for the transition, which is why it also goes aria-hidden and
          // untabbable below — an invisible node must not be reachable by
          // keyboard or read by a screen reader. A node with no data behind it
          // has five false cells and collapses like any other miss.
          const lit = nodeLit(ev);
          // Node dots follow the spine's colour while a filter is running; with
          // no filter they keep their TYPE-bucket accent (mint / gold / pink),
          // which is separate information. The card's chip and border keep the
          // bucket accent either way, so "what kind of shoot" never gets
          // overwritten by "what was my role".
          const dotHue = role === null ? cat.accent : spineHue;
          return (
            <Fragment key={ev.idx}>
              {showYear && (
                <div className="tl-year" style={{ position: "sticky", top: 76, zIndex: 3, padding: "16px 0 8px", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg} 82%, transparent)` }}>
                  <span style={{ fontFamily: F, fontSize: "clamp(40px, 8vw, 84px)", fontWeight: 800, color: C.red, letterSpacing: -3, lineHeight: 0.9, display: "block" }}>{yr}</span>
                  <span style={{ fontFamily: F, fontSize: 10.5, color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase" }}>{meta.count} {meta.count === 1 ? "project" : "projects"} · {meta.reels} reels · {fmtPlays(meta.plays)} plays</span>
                </div>
              )}
              {/* COLLAPSE SHELL. The 1fr→0fr grid trick is the same animated
                  height collapse the expanded-node body below already uses, so
                  there is one collapse mechanism on this page, not two.
                  The negative-margin / positive-padding pair on the clipping
                  div is load-bearing: the node's dot sits at a NEGATIVE left
                  offset (rail 18px minus gap 46px on a phone = -35px), so a
                  plain overflow:hidden box would clip the dot off every node.
                  Widening the box leftwards past the dot and padding the
                  content back puts the dot inside the clip region while leaving
                  every node's on-screen position exactly where it was. */}
              <div aria-hidden={!lit} style={{ display: "grid", gridTemplateRows: lit ? "1fr" : "0fr", opacity: lit ? 1 : 0, transition: _reduceMotion ? "none" : "grid-template-rows 0.28s ease, opacity 0.22s ease" }}>
                <div style={{ overflow: "hidden", marginLeft: "calc(-1 * (var(--gap) - var(--rail) + 24px))", paddingLeft: "calc(var(--gap) - var(--rail) + 24px)" }}>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <span aria-hidden="true" style={{ position: "absolute", left: "calc(var(--rail) - var(--gap) - 7px)", top: 22, width: open ? 18 : 14, height: open ? 18 : 14, borderRadius: "50%", background: dotHue, boxShadow: `0 0 0 6px ${dotHue}1F`, transition: _reduceMotion ? "width 0.2s, height 0.2s" : "width 0.2s, height 0.2s, background 0.3s ease, box-shadow 0.3s ease" }} />
                <div role="button" tabIndex={lit ? 0 : -1} aria-expanded={open} className="tl-card"
                  onClick={() => toggle(ev.idx)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(ev.idx); } }}
                  onMouseEnter={e => { if (!open) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 16, alignItems: "center", padding: 14, borderRadius: 14, cursor: "pointer", background: open ? "rgba(255,255,255,0.06)" : C.glass, border: `1px solid ${open ? cat.accent + "66" : C.border}`, transition: "border-color 0.2s, background 0.2s, transform 0.2s" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, alignSelf: open ? "start" : "center" }}>
                    <span style={{ position: "relative", width: "100%", aspectRatio: ev.coverLandscape ? "16 / 9" : "9 / 16", borderRadius: 10, overflow: "hidden", background: "#111", display: "block" }}>
                      <img src={ev.cover} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                      <span aria-hidden="true" style={{ position: "absolute", right: 6, bottom: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.62)", color: cat.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>▶</span>
                    </span>
                    {open && (
                      <button onClick={e => { e.stopPropagation(); toggle(ev.idx); }} aria-label="Minimize this reel"
                        style={{ width: "100%", fontFamily: F, fontSize: 10, fontWeight: 700, color: C.bg, background: cat.accent, border: "none", borderRadius: 8, padding: "8px 2px", cursor: "pointer", letterSpacing: 0.2, whiteSpace: "nowrap" }}>
                        ▲ Minimize</button>
                    )}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: F, fontSize: 10, fontWeight: 700, color: cat.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{cat.chip}</span>
                    <span style={{ display: "block", fontFamily: F, fontSize: "clamp(18px, 2.4vw, 26px)", fontWeight: 800, color: C.white, letterSpacing: -0.4, lineHeight: 1.12 }}>{ev.event}</span>
                    {ev.role && <span style={{ display: "block", fontFamily: F, fontSize: 12.5, color: "rgba(255,255,255,0.72)", marginTop: 4, lineHeight: 1.4 }}>{ev.role}</span>}
                    {EVENT_BRANDS[ev.event] && <span className="tl-brands" style={{ display: "block", fontFamily: F, fontSize: 11.5, color: C.gray, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{EVENT_BRANDS[ev.event]}</span>}
                    <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 6 }}>{reels.length} {reels.length === 1 ? "reel" : "reels"}</span>
                    {ev.totalPlays > 0 && <span style={{ display: "inline-block", fontFamily: F, fontSize: 22, fontWeight: 800, color: C.red, fontVariantNumeric: "tabular-nums", marginTop: 6 }}>{fmtPlays(ev.totalPlays)} plays</span>}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", gridTemplateColumns: "minmax(0, 1fr)", transition: "grid-template-rows 0.4s ease" }}>
                  <div style={{ overflow: "hidden", minWidth: 0 }}>
                    {open && active && (
                      <TLExpand ev={ev} reels={reels} cat={cat} onMinimize={() => toggle(ev.idx)} />
                    )}
                  </div>
                </div>
              </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

// ===== The homepage's slim Timeline presence =====
// Heading, the derived count line the year headers already print, and a door to
// #/timeline. The scroll itself (every node, every carousel, every <video>)
// moved to the page, so the homepage stays a summary and the phone stops
// scrolling through the whole spine to reach the work below it.
function TimelineSummary() {
  const [h, setH] = useState(false);
  return (
    <section id="timeline" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
      <FadeIn>
        <a href="#/timeline" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
          style={{
            display: "block", maxWidth: 720, textDecoration: "none",
            padding: "26px 30px", borderRadius: 16,
            background: h ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${h ? "rgba(255,255,255,0.25)" : C.border}`,
            transition: "background 0.25s, border-color 0.25s",
            WebkitTapHighlightColor: "transparent",
          }}>
          <span style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>Timeline</span>
          <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>The Work, In Order</h2>
          <span style={{ display: "block", fontFamily: F, fontSize: 16, color: C.gray, fontVariantNumeric: "tabular-nums" }}>{TL_SUMMARY}</span>
          {/* 44px tap target on its own line — on a phone the whole card is the
              target, but the cue has to look pressable by itself. */}
          <span style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontFamily: F, fontSize: 14, fontWeight: 600, color: C.mint, marginTop: 6 }}>Open Timeline →</span>
        </a>
      </FadeIn>
    </section>
  );
}

// ===== #/playlist — the Work Playlist player as its own page =====
// The same shell the homepage runs, at a permanent address. The homepage
// section is untouched this round; only ONE of the two ever mounts, because the
// homepage sections don't render on a page route (the #/work pages already work
// this way), so the player's single <video> stays single. `id="work"` is kept so
// the player's own #/case scroll-into-view target exists here too.
// Aug 10 rider (Miles, with screenshots of the four homepage shelves): "also the
// playlist — add these cards to the playlist only tab of the website." So the
// four library carousels render here too, BELOW the player: the player stays the
// page's opening act and the shelves are the browse layer under it. Same
// components, same copy, same derived count lines — the shelf takes one boolean
// and nothing else changes. The homepage shelves are untouched.
// The shelf is a SIBLING of the section, not a child: it draws its own left
// padding and bleeds its rows off the right edge, which double-padding inside
// the section would undo.
function PlaylistPage() {
  return (
    <>
    <section id="work" style={{ padding: "calc(104px + env(safe-area-inset-top)) clamp(24px, 5vw, 80px) 64px" }}>
      <FadeIn>
        {/* 44px tap target: lands on the homepage's player section. */}
        <a href="#work" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 13, color: C.gray, textDecoration: "none", minHeight: 44, padding: "10px 12px 10px 0", marginBottom: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = C.mint} onMouseLeave={e => e.currentTarget.style.color = C.gray}>← Back</a>
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
        <h1 style={{ fontFamily: F, fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>Work Playlist</h1>
        {/* Same line as the homepage section, same deletion (panel review Aug 10). */}
        <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 32px 0", maxWidth: 500 }}>Real content from real campaigns: {TOTAL_REELS} videos · {fmtPlays(TOTAL_PLAYS)} plays. Pick a playlist, press play.</p>
      </FadeIn>

      {/* id is the scroll target a shelf card below aims at, so picking a
          playlist lands on the player itself rather than the page heading. */}
      <div id="playlist-player"><WorkPlayer /></div>
    </section>
    <PlaylistShelf inPage />
    </>
  );
}

function PlaylistShelf({ inPage = false }) {
  return (
    <section id="library" style={{ padding: "36px 0 12px clamp(24px, 5vw, 80px)" }}>
      {BUCKET_ORDER.map(b => (
        <ShelfRow key={b} title={`${b} Library`} items={eventStats.filter(ev => BUCKET_OF[ev.event] === b && !ev.pinned)} inPage={inPage} />
      ))}
    </section>
  );
}

// ===== ROLE CARD GRID — the four variant-D swipe cards. ONE component, two
// placements: the homepage "What I Do" section and the #/work page. Miles's
// call Aug 9: What I Do stops being an abstract skill list and becomes the same
// four role groups the work is filed under, so the claim and the proof are the
// same object. The Specialty Drawer it replaced is retired; the pattern is
// preserved in git and in research/NAVIN-PATTERN-ANATOMY.md. =====
// ===== B2B STRIP — the one body of work the four role groups cannot hold.
// "Making B2B Social Friendly" spans three roles at once, which is why its
// playlist is PINNED rather than filed, and why the role re-map left its story
// with nowhere to live while the CTA still offers executive communications.
// One quiet wide row restores the surface and links into the pinned playlist by
// the same ms-play path every other in-page link uses. Every string here
// already existed: Miles's card title, his meta line, his body verbatim, and
// counts derived from the playlist itself. =====
function B2BStrip() {
  const [h, setH] = useState(false);
  const idx = portfolio.findIndex(e => e.pinned);
  const ev = idx >= 0 ? eventStats[idx] : null;
  const cap = capabilities.find(c => c.title === "Making B2B Social Friendly");
  if (!ev || !cap) return null;
  return (
    <FadeIn delay={0.16}>
      {/* preventDefault + manual scroll, the HeroCard path. Letting the anchor
          navigate to #work queues a hashchange that lands AFTER the player has
          replaceState'd the URL to the reel's own #/case link; the deep-link
          listener then reads that fresh hash and re-opens the reel in its HOME
          playlist, bouncing the sidebar off the pinned mirror. Same reason
          HeroCard scrolls by hand instead of using an href. */}
      <a href="#/playlist"
        onClick={(e) => {
          e.preventDefault();
          goPlay(idx, 0);
        }}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        aria-label={`Open ${ev.event}`}
        className="b2b-strip"
        style={{
          // alignment lives in CSS so the phone breakpoint can stack it: at
          // 375 a centred flex row squeezes the body into a 15-line ribbon
          // with the thumb and the play circle floating in dead space.
          display: "flex", gap: 18, marginTop: 20, maxWidth: 1180,
          padding: 16, borderRadius: 16, textDecoration: "none",
          background: h ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${h ? "rgba(255,255,255,0.25)" : C.border}`,
          transition: "background 0.25s, border-color 0.25s",
          WebkitTapHighlightColor: "transparent",
        }}>
        <span style={{ width: 72, height: 72, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: gradFor(ev.idx) }}>
          <img src={ev.cover} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.16em" }}>{cap.meta}</span>
          <span style={{ display: "block", fontFamily: F, fontSize: 18, fontWeight: 800, color: C.white, letterSpacing: -0.3, margin: "5px 0 0" }}>{ev.event}</span>
          {/* as="span": this sits inside an <a>, so <div><p> would be invalid
              nesting. 70ch was the widest prose on the site at ~103 real
              characters; 46ch brings it to ~68. His body string is untouched —
              Prose derives the breaks. */}
          <Prose as="span" text={cap.body} style={{ margin: "7px 0 0" }} />
          <span style={{ display: "block", fontFamily: F, fontSize: 13, color: C.gray, margin: "7px 0 0", fontVariantNumeric: "tabular-nums" }}>
            {ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"}{ev.totalPlays > 0 ? ` · ${fmtPlays(ev.totalPlays)} plays` : ""}
          </span>
        </span>
        <span className="shelf-card-play" style={{ width: 44, height: 44, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 24px ${C.mint}50` }}><IcPlay s={16} /></span>
      </a>
    </FadeIn>
  );
}


// ===== THE TYPE CUT (Sep 4 2026) — What I Do, inverted the way Miles asked =====
// Aug 26, his words: "the colors that you used for event coverage (add
// commercial), in house productions, off the clock, brand partnerships, etc.
// should be the ones at top and then it goes into produced directed, etc.
// inside of those blocks after we push into them." Aug 27: "yes hosting/talent
// should be its own tab." One row per TYPE of work in its band hue, a fifth
// row for every hosted reel across the types, role chips inside each row.
// A pressed chip DIMS the cards that role does not cover; it never hides,
// reorders, or scrolls (his UI law, Aug 26). A pressed tab keeps that row alone
// under the tabs; pressing it again brings the rest back. Every number is
// derived from the same rows the player uses. The mock this is built from:
// research/mock-2026-08-26-type-cut-floating.html (v5.1, his three rulings in).
const TYPE_CUT_HOSTING = "Hosting / Talent";
const TYPE_CUT_SHOW = 10; // newest ten per row on the page; the rest live at #/playlist
const TYPE_CUT = [
  { key: "Event Coverage", label: "Commercial Event Coverage", hue: C.gold },
  { key: "In-House Production", label: "In-House Productions", hue: "#4EA8DE" },
  { key: "Brand Partnerships", label: "Brand Partnerships", hue: "#FF6A38" },
  { key: "Off the Clock", label: "Off the Clock", hue: "#9B7BFF" },
  { key: TYPE_CUT_HOSTING, label: TYPE_CUT_HOSTING, hue: "#E667C0" },
];
// Newest first in every row. Pinned mirrors are skipped so nothing counts twice.
const _typeReels = portfolio
  .filter(ev => !ev.pinned)
  .flatMap(ev => ev.reels.map(r => ({ reel: r, type: BUCKET_OF[ev.event], roles: reelRoleTabs(r) })))
  .sort((a, b) => reelDate(b.reel) - reelDate(a.reel));
// The ten a row shows are picked across its pressable chips (newest first
// within each chip), then laid out newest first. Newest-ten alone left the
// hosting row all Event reels, so its In-House chip dimmed every card: a press
// that lights nothing reads as broken. This way every chip you can press lights
// at least one card, and the mock's mixed hosting row falls out of the data.
const pickShown = (items, chips, n) => {
  const live = chips.filter(c => c.count > 0);
  const cap = Math.min(n, items.length);
  if (!live.length) return items.slice(0, cap);
  // Slots in proportion to each chip's count, at least one each, the rest by
  // largest remainder: "Hosted 43" now shows its share of the ten, not two.
  const total = live.reduce((sum, c) => sum + c.count, 0);
  const ideal = live.map(c => c.count / total * cap);
  const slots = ideal.map(v => Math.max(1, Math.floor(v)));
  let left = cap - slots.reduce((sum, v) => sum + v, 0);
  const byRemainder = live.map((c, k) => k).sort((a, b) => (ideal[b] - slots[b]) - (ideal[a] - slots[a]));
  for (let i = 0; left > 0 && byRemainder.length; i = (i + 1) % byRemainder.length, left--) slots[byRemainder[i]]++;
  while (left < 0) { slots[slots.indexOf(Math.max(...slots))]--; left++; }
  const chosen = new Set();
  live.forEach((c, k) => { let want = slots[k]; for (const x of items) { if (want <= 0) break; if (!chosen.has(x) && c.test(x)) { chosen.add(x); want--; } } });
  for (const x of items) { if (chosen.size >= cap) break; chosen.add(x); }
  return [...chosen].sort((a, b) => reelDate(b.reel) - reelDate(a.reel));
};
const TYPE_CUT_ROWS = TYPE_CUT.map(t => {
  const hosting = t.key === TYPE_CUT_HOSTING;
  const items = hosting ? _typeReels.filter(x => x.roles[3]) : _typeReels.filter(x => x.type === t.key);
  // Inside a type row the chips are the five roles. Inside the hosting row
  // they are the four types, so the same press shows where the hosting happened.
  const chips = hosting
    ? TYPE_CUT.slice(0, 4).map(u => ({ id: u.key, label: u.label, hue: u.hue, count: items.filter(x => x.type === u.key).length, test: (x) => x.type === u.key }))
    : ROLE_TABS.map((name, n) => ({ id: name, label: name, hue: ROLE_TAB_COLORS[name], count: items.filter(x => x.roles[n]).length, test: (x) => x.roles[n] }));
  return { ...t, items, shown: pickShown(items, chips, TYPE_CUT_SHOW), count: items.length, plays: items.reduce((sum, x) => sum + playsNum(x.reel.plays), 0), chips };
});

const TC_MASK = "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)";
function TypeCard({ item, dim, tilt, copy = 0 }) {
  const { reel } = item;
  return (
    <a className="tc-card" data-card="" data-dim={dim ? "1" : "0"} tabIndex={dim || copy === 1 ? -1 : 0} aria-hidden={copy === 1 ? "true" : undefined} data-type={item.type || ""} data-roles={item.roles.map((on, n) => on ? ROLE_TABS[n] : null).filter(Boolean).join("|")} href={caseHref(reel)} aria-label={`Play ${reel.title}`}
      style={{ flex: "none", width: 150, display: "block", background: C.white, padding: "5px 5px 4px", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.45)", transform: `rotate(${tilt}deg)`, opacity: dim ? 0.14 : 1, textDecoration: "none" }}>
      <img src={thumbOf(reel)} alt="" loading="lazy" decoding="async"
        style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 5, display: "block", background: "#e6e6e6" }}
        onError={e => { e.currentTarget.style.visibility = "hidden"; }} />
      <span style={{ display: "block", padding: "5px 3px 3px" }}>
        <span className="tc-title" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: F, fontSize: 9.5, lineHeight: 1.25, color: "#111", fontWeight: 600 }}>{reel.title}</span>
        <span className="tc-plays" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: F, fontSize: 9, color: "#555", marginTop: 3, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}><IcPlay s={8} c="#555" />{playsLabel(reel)} plays</span>
      </span>
    </a>
  );
}

function TypeRow({ row, hidden }) {
  const [lens, setLens] = useState(null);
  const ref = useRef(null);
  useDriftScroll(ref, 70);
  const show = row.shown;
  const active = row.chips.find(c => c.id === lens) || null;
  // Two copies only when one does not fit the screen: six Brand cards on a wide
  // screen showed the same six twice (rambling + design checks, Sep 4 2026).
  const copies = show.length * (150 + 18) > (typeof window !== "undefined" ? window.innerWidth : 1280) ? [0, 1] : [0];
  // A pressed chip brings the first card it lights into the track's view, so
  // the press shows its effect at once, on a phone that shows two cards at a time
  // as much as on a desktop (his UI law). Inside the track only; the page never moves.
  useEffect(() => {
    const el = ref.current; if (!el || !lens) return;
    const first = el.querySelector('[data-copy="0"] [data-card][data-dim="0"]');
    if (!first) return;
    const pad = parseFloat(getComputedStyle(el.firstElementChild).paddingLeft) || 0;
    el.scrollLeft = Math.max(0, first.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft - pad);
  }, [lens]);
  return (
    <div data-type-row={row.key} hidden={hidden} style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
        <b style={{ fontFamily: F, fontSize: 17, fontWeight: 800, color: C.white, borderLeft: `10px solid ${row.hue}`, paddingLeft: 10 }}>{row.label}</b>
        <span style={{ fontFamily: F, fontSize: 12, color: "#9a9a9a", fontVariantNumeric: "tabular-nums" }}>{row.count} videos · {fmtPlays(row.plays)} plays</span>
        <span className="tc-chips" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
          {/* Only the roles he has on this type's reels: a "Hosted 0" chip on a
              six-reel row advertised an absence (recruiter check, Sep 4 2026).
              12px is the site's own floor for role words (see the track list). */}
          {row.chips.filter(c => c.count > 0).map(c => {
            const on = lens === c.id;
            return (
              <button key={c.id} type="button" data-role-chip={c.id} aria-pressed={on}
                onClick={() => setLens(on ? null : c.id)}
                style={{ fontFamily: F, fontSize: 12, fontWeight: 600, padding: "6px 10px", minHeight: 30, borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${on ? c.hue : "#2c2c2c"}`, background: on ? c.hue : "#141414", color: on ? "#111" : "#cfcfcf" }}>
                {c.label}<span style={{ marginLeft: 5, color: on ? "#111" : "#8a8a8a", fontVariantNumeric: "tabular-nums" }}>{c.count}</span>
              </button>
            );
          })}
        </span>
      </div>
      <div ref={ref} className="marquee-scroll" style={{ overflowX: "auto", overflowY: "hidden", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", margin: "0 calc(-1 * clamp(24px, 5vw, 80px))", maskImage: TC_MASK, WebkitMaskImage: TC_MASK }}>
        <div style={{ display: "flex", width: "max-content", padding: "8px clamp(24px, 5vw, 80px) 12px" }}>
          {copies.map(copy => (
            <div key={copy} data-copy={copy} style={{ display: "flex", gap: 18, paddingRight: 18 }}>
              {show.map((item, i) => <TypeCard key={`${copy}-${item.reel.postUrl || item.reel.title}`} item={item} copy={copy} dim={!!active && !active.test(item)} tilt={i % 2 ? 1.4 : -1.6} />)}
            </div>
          ))}
        </div>
      </div>
      {row.count > show.length && (
        <a href="#/playlist" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontFamily: F, fontSize: 12, color: "#8a8a8a", textDecoration: "none", margin: 0 }}>+ {row.count - show.length} more · full playlist →</a>
      )}
    </div>
  );
}

function TypeCut() {
  const [focus, setFocus] = useState(null);
  return (
    <div data-type-cut="">
      <div className="tc-tabs" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 26 }}>
        {TYPE_CUT_ROWS.map(t => {
          const on = focus === t.key;
          return (
            <button key={t.key} type="button" className="tc-tab" data-type-tab={t.key} aria-pressed={on} onClick={() => setFocus(on ? null : t.key)}
              style={{ fontFamily: F, textAlign: "left", cursor: "pointer", minHeight: 44, background: on ? `${t.hue}29` : "#111", border: `1.5px solid ${on ? t.hue : "#262626"}`, borderLeft: `10px solid ${t.hue}`, borderRadius: 14, padding: "12px 16px", color: C.white }}>
              <b style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{t.label}</b>
              <span style={{ fontSize: 11.5, color: "#9a9a9a", fontVariantNumeric: "tabular-nums" }}>{t.count} videos · {fmtPlays(t.plays)}</span>
            </button>
          );
        })}
      </div>
      {TYPE_CUT_ROWS.map(t => <TypeRow key={t.key} row={t} hidden={!!focus && focus !== t.key} />)}
    </div>
  );
}

function RoleCardGrid() {
  const gridRef = useRef(null);
  usePlayWhenVisible(gridRef);          // offscreen cards stop decoding
  const onScreen = useOnScreen(gridRef); // ...and stop cycling
  return (
    <div className="work-grid" ref={gridRef}>
      {roleStats.map((b, i) => <BucketCard key={b.slug} b={b} i={i} onScreen={onScreen} />)}
    </div>
  );
}

// ===== ROUTES (hash only, no router lib) =====
// `#/work` = the category grid, `#/work/<bucket-slug>` = that bucket's page,
// `#/timeline` = the career timeline, `#/playlist` = the Work Playlist player.
// Everything else (including `#/case/<slug>` and plain #anchors) falls through
// to the single-page site, so old links behave exactly as before — `#/case`
// deep-links still open the reel playing on the HOMEPAGE player, untouched.
const routeFromHash = () => {
  const h = window.location.hash || "";
  if (/^#\/timeline\/?$/.test(h)) return { kind: "timeline", bucket: null };
  if (/^#\/playlist\/?$/.test(h)) return { kind: "playlist", bucket: null };
  // ===== #/case/<slug> (rewritten Aug 11 2026) =====
  // A case link used to fall through to the homepage because the homepage was
  // where the player lived. The Set List replaced that player, so the link now
  // resolves to #/playlist — the same full player, at its own address, which
  // then reads the very same hash and opens the reel (WorkPlayer's deep-link
  // effect is untouched). Same destination it always had, one route over.
  // A slug that resolves to NOTHING still falls through to the homepage exactly
  // as before: an old or malformed link lands on the site, never on a 404 and
  // never on an empty player. That fallthrough is the rule; this is not it.
  const c = h.match(/^#\/case\/(.+?)\/?$/);
  if (c && CASE_INDEX[c[1].toLowerCase()]) return { kind: "playlist", bucket: null };
  const m = h.match(/^#\/work(?:\/([^\/?#]+))?\/?$/);
  if (!m) return { kind: "home", bucket: null };
  const bucket = m[1] ? ROLE_BY_SLUG[m[1].toLowerCase()] : null;
  return bucket ? { kind: "bucket", bucket } : { kind: "work", bucket: null };
};
// ===== goPlay (Aug 11 2026) — "play this exact reel" from anywhere =====
// The homepage links that used to scroll down to the player and fire ms-play
// (the opening wall cards, the fun row, the B2B strip, the trumpet line in the
// About paragraph) have no player to scroll to now. They keep their exact
// behaviour by going to the player's page instead: park the request, switch
// route, and WorkPlayer picks it up the moment it mounts. Already on the
// playlist page, it is the same ms-play dispatch it always was.
// A parked request is deliberately NOT a case slug: the B2B strip opens the
// PINNED playlist, and a slug resolves to a reel's home playlist, which would
// bounce the sidebar off the mirror (the bug the strip's own comment records).
let PENDING_PLAY = null;
const goPlay = (e, r) => {
  if (routeFromHash().kind === "playlist") {
    (document.getElementById("playlist-player") || document.getElementById("work"))?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("ms-play", { detail: { e, r } }));
    return;
  }
  PENDING_PLAY = { e, r };
  window.location.hash = "#/playlist";
};

function useHashRoute() {
  const [route, setRoute] = useState(routeFromHash);
  useEffect(() => {
    const h = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return route;
}

// ===== #/work — category grid, variant D (Miles's approved swipe collage,
// research/card-mock-2026-08-09.html: "yeah keep D"). One 9:16 card per type
// bucket, edge to edge, swiping through the bucket's fun moments IG-stories
// style with progress dashes. Every number is derived, never hand-typed. =====
const CARD_HOLD = 2600;   // ms a moment holds (mock's HOLD)
const CARD_SWIPE = 450;   // ms slide (mock's .45s)
const CARD_EASE = "cubic-bezier(0.22,1,0.36,1)";

// Is the container on screen? Offscreen cards stop cycling (and
// usePlayWhenVisible stops their video decode) instead of burning battery.
function useOnScreen(ref, threshold = 0.05) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

// ONE media node per moment. Fine pointers get the muted video, seeked to its
// fun beat before it shows; touch devices get the still at the same beat, so a
// phone decodes zero video on this page.
function CardMoment({ reel, live }) {
  const box = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" };
  const still = <img src={thumbOf(reel)} alt="" loading="eager" decoding="async" style={box} onError={e => { e.currentTarget.style.display = "none"; }} />;
  if (!live) return still;
  // The still is a LAYER, not just the video's poster attribute (panel review
  // Aug 10: the cards read as "bare color gradients for 8+ seconds" on desktop).
  // A poster attribute stops covering the moment the element seeks — and this
  // one seeks to its fun beat on loadedmetadata — so the frame can blank out
  // while the media pipeline works. An <img> underneath is painted by the image
  // decoder on its own schedule and never goes away, so the first thing anyone
  // sees on the main proof surface is the work. The gradient stays behind both,
  // as the last-resort fallback it was always meant to be.
  return (
    <>
      {still}
      {watchOnly(reel) ? null : (
      <video src={srcOf(reel)} poster={thumbOf(reel)} muted playsInline preload="metadata" style={box}
        onLoadedMetadata={e => {
          const v = e.currentTarget;
          try { v.currentTime = funAtOf(reel); } catch { /* seek before buffer: the still below covers it */ }
          const p = v.play(); if (p && p.catch) p.catch(() => {});
        }} />
      )}
    </>
  );
}

function BucketCard({ b, i, onScreen }) {
  const roster = roleRosters[b.slug] || [];
  const live = _finePointer;
  const [h, setH] = useState(false);
  // Two layers max, ever: the moment on screen and the one sliding in behind
  // it (the mock's double-buffer). `id` is monotonic so React keeps the
  // outgoing node mounted through the slide instead of remounting the video.
  const [cur, setCur] = useState({ id: 0, i: 0 });
  const [out, setOut] = useState(null);
  const [armed, setArmed] = useState(false); // one frame with the incoming still offstage
  const curRef = useRef(cur);
  curRef.current = cur;
  // Cycling stops on hover (the moment someone inspects, it holds still),
  // offscreen, under prefers-reduced-motion, and when there is nothing to cycle.
  const cycling = onScreen && !h && !_reduceMotion && roster.length > 1;
  useEffect(() => {
    if (!cycling) return;
    let raf1 = 0, raf2 = 0, drop = 0;
    const tick = () => {
      const from = curRef.current;
      setOut(from);
      setCur({ id: from.id + 1, i: (from.i + 1) % roster.length });
      setArmed(true);
      raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setArmed(false)); });
      drop = setTimeout(() => setOut(null), CARD_SWIPE + 160);
    };
    const t = setInterval(tick, CARD_HOLD);
    return () => { clearInterval(t); clearTimeout(drop); cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [cycling, roster.length]);

  const layerStyle = (isCur) => ({
    position: "absolute", inset: 0,
    transform: armed ? (isCur ? "translateX(100%)" : "translateX(0)") : (isCur ? "translateX(0)" : "translateX(-100%)"),
    transition: armed ? "none" : `transform ${CARD_SWIPE}ms ${CARD_EASE}`,
  });
  // Reduced motion: no auto-cycling, no video, first moment only.
  const layers = _reduceMotion ? [cur] : [out, cur].filter(Boolean);

  return (
    <a href={`#/work/${b.slug}`} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      aria-label={`Open ${b.name}`}
      style={{
        // Edge to edge, 9:16, no mat and no tilt (Miles, Aug 9): the frame is
        // the card. Nothing sits between the work and the eye.
        // Card bed is opaque: the 12%-white border would otherwise sit over the
        // gradient fallback and read as a coloured ring around every card.
        position: "relative", display: "block", textDecoration: "none", aspectRatio: "9 / 16",
        borderRadius: 14, overflow: "hidden", background: "#111",
        border: `1px solid ${h ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)"}`,
        WebkitTapHighlightColor: "transparent",
        transform: h ? "translateY(-6px)" : "none",
        transition: `transform 0.25s ${CARD_EASE}, border-color 0.25s, box-shadow 0.25s`,
        boxShadow: h ? "0 24px 64px rgba(0,0,0,0.55)" : "0 16px 48px rgba(0,0,0,0.45)",
      }}>
      {/* Gradient sits INSIDE the border, as the media load fallback */}
      <span style={{ position: "absolute", inset: 0, overflow: "hidden", display: "block", background: gradFor(i) }}>
        {layers.map(L => (
          <span key={L.id} style={layerStyle(L.id === cur.id)}>
            <CardMoment reel={roster[L.i]} live={live && !_reduceMotion} />
          </span>
        ))}
      </span>
      {/* IG-story progress dashes: how many moments, which one you are on */}
      <span aria-hidden="true" style={{ position: "absolute", top: 10, left: 12, right: 12, display: "flex", gap: 5, zIndex: 3 }}>
        {roster.map((r, n) => (
          <span key={r.postUrl} style={{ flex: 1, height: 2.5, borderRadius: 2, background: n === cur.i ? C.white : "rgba(255,255,255,0.35)", transition: "background 0.25s" }} />
        ))}
      </span>
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,10,10,0.92))", pointerEvents: "none" }} />
      {/* Play circle sits ABOVE the caption rather than beside it. The role
          names are long ("Creative Directed, Hosted & Produced" wraps to three
          lines on a 158px phone card), and a circle floated over the title
          would land on top of the words. Stacked, it cannot collide at any
          width and still reads as the mock's affordance. */}
      <span style={{ position: "absolute", left: 14, right: 14, bottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="shelf-card-play" style={{ alignSelf: "flex-end", width: 40, height: 40, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 24px ${C.mint}50` }}><IcPlay s={15} /></span>
        <span style={{ display: "block" }}>
          <span style={{ display: "block", fontFamily: F, fontSize: "clamp(15px, 1.1vw + 11px, 19px)", fontWeight: 800, color: C.white, letterSpacing: -0.3, lineHeight: 1.1 }}>{b.name}</span>
          <span style={{ display: "block", fontFamily: F, fontSize: 12, color: "#b8b8b8", marginTop: 5, lineHeight: 1.35, fontVariantNumeric: "tabular-nums" }}>{groupCount(b)}</span>
        </span>
      </span>
    </a>
  );
}

function WorkGridPage() {
  return (
    <section id="work" style={{ padding: "calc(104px + env(safe-area-inset-top)) clamp(24px, 5vw, 80px) 60px" }}>
      <FadeIn>
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
        <h1 style={{ fontFamily: F, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>Work</h1>
        <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 36px 0", maxWidth: 560 }}>{TOTAL_REELS} videos · {fmtPlays(TOTAL_PLAYS)} plays. Pick a category, press play.</p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <RoleCardGrid />
      </FadeIn>
    </section>
  );
}

// ===== #/work/<bucket> — the Navin page =====
// One section per playlist; numbered rows; a row TAP expands playback in place.
// Exactly ONE <video> is ever mounted on this page (the open row's), because the
// open row is held at PAGE level: opening a row in one playlist closes the row
// in another. No scoped player, no second Now Playing pane, no transport bar.

// The gated category intro. Renders nothing until Miles's picks land in
// BUCKET_INTROS — the layout is already here, so the copy is a one-line drop.
function BucketIntro({ bucket }) {
  const copy = BUCKET_INTROS[bucket];
  if (!copy) return null;
  return (
    // All four intros are exactly 3 clean sentences with no setup or result
    // pair among them (checked individually), so the derived split gives one
    // idea per paragraph. They were the worst wall on the site: 3 sentences in
    // one solid block behind a mint rule.
    <Prose text={copy} lh={1.6} style={{ margin: "0 0 34px", borderLeft: `3px solid ${C.mint}`, paddingLeft: 16 }} />
  );
}

function BucketTrackRow({ reel, n, open, onToggle, roleLine }) {
  const [h, setH] = useState(false);
  const desc = REEL_DESCS[reel.title] || "";
  const why = REEL_WHY[reel.title] || null;
  return (
    <div>
      <div role="button" tabIndex={0} aria-expanded={open}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          display: "grid", gridTemplateColumns: "26px 44px minmax(0,1fr) auto", gap: 12, alignItems: "center",
          padding: "10px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s",
          background: open ? "rgba(255,255,255,0.06)" : h ? "rgba(255,255,255,0.05)" : "transparent",
        }}>
        <span style={{ fontFamily: F, fontSize: 13, color: open ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {open ? <EqBars /> : n + 1}
        </span>
        <Thumb reel={reel} size={44} radius={8} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: F, fontSize: 14, fontWeight: 600, color: open ? C.white : "rgba(255,255,255,0.72)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reel.title}</span>
          {/* Credit chip FIRST and always visible: "what was your role in the
              video" is the question, so it is never hover-gated and never lets
              the handle text push it out of frame. */}
          <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 3, minWidth: 0 }}>
            <CreditChip reel={reel} md />
            <span style={{ fontFamily: F, fontSize: 13, color: C.gray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{subTag(reel)}</span>
          </span>
        </span>
        <span style={{ fontFamily: F, fontSize: 13, color: C.mint, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{playsLabel(reel)}</span>
      </div>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
        <div style={{ overflow: "hidden" }}>
          {open && (
            <div className="spec-row-expand" style={{ padding: "10px 8px 18px 82px" }}>
              {/* Role first, plainly, right under the title. */}
              {(roleLine || roleChipsOf(reel).length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, margin: "0 0 8px" }}>
                  <CreditChip reel={reel} md />
                  {roleLine && <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint, lineHeight: 1.4 }}>{roleLine}</span>}
                </div>
              )}
              {/* Crew who worked THIS reel, directly under the role line. Reel
                  level, never playlist level: a header block would credit them
                  over the neighbouring reels, which are other people's work. */}
              {reelCreditsOf(reel).map(line => (
                <p key={line} style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "0 0 2px", lineHeight: 1.45 }}>{line}</p>
              ))}
              <div style={{ height: 10 }} />
              {watchOnly(reel) ? (
                <div style={{ width: reel.landscape ? "100%" : "min(100%, 240px)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", borderRadius: 12 }}><WatchFrame reel={reel} /></div>
              ) : (
              <video src={srcOf(reel)} poster={thumbOf(reel)} controls autoPlay muted playsInline preload="metadata"
                style={{ width: reel.landscape ? "100%" : "min(100%, 240px)", aspectRatio: reel.landscape ? "16 / 9" : "9 / 16", objectFit: reel.landscape ? "contain" : "cover", borderRadius: 12, background: "#000", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", display: "block" }}
                onError={e => { e.currentTarget.style.display = "none"; }} />
              )}
              {desc && <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.84)", lineHeight: 1.6, margin: "12px 0 0", maxWidth: "46ch" }}>{desc}</p>}
              {/* Why it mattered (Aug 11) — the clean slot this row already had:
                  directly under the description, in the same column. Reason
                  first at description weight, his production detail beneath it
                  in the meta gray. Renders only for reels he has written one
                  for; today that is the Semaphore. */}
              {why && (
                <>
                  <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.84)", lineHeight: 1.6, margin: "10px 0 0", maxWidth: "46ch" }}>{why[0]}</p>
                  <p style={{ fontFamily: F, fontSize: 12, color: C.gray, lineHeight: 1.5, margin: "3px 0 0", maxWidth: "46ch" }}>{why[1]}</p>
                </>
              )}
              {!reel.plays && (
                <p style={{ fontFamily: F, fontSize: 13, color: C.gray, lineHeight: 1.5, margin: "8px 0 0", maxWidth: "46ch" }}>
                  LinkedIn and Instagram carousel posts don't publish view counts, so those show N/A.</p>
              )}
              <a href={reel.postUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint, textDecoration: "none", marginTop: 10 }}>
                Open on {platformOf(reel)} ↗</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// `mirror` = this section is a SUBSET of its playlist (the Cut by Me page),
// so the playlist's case text is suppressed: those paragraphs describe the whole
// run and name reels that are not on this page (the MAX draft cites the Rober
// reel, which Cut by Me does not list). Header facts stay, the story does not.
function PlaylistSection({ ev, openKey, onToggle, si, mirror = false }) {
  const credits = EVENT_CREDITS[ev.event] || [];
  const handles = handlesOf(ev);
  return (
    <section style={{ marginTop: 44 }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        {/* Cover is the real frame from this playlist's top-played reel */}
        <span style={{ width: 72, height: 72, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: gradFor(ev.idx) }}>
          <img src={ev.cover} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
        </span>
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          {/* Type identity survives the role re-map as one small word, read
              straight out of BUCKET_OF. Neutral, never mint: the mint in this
              block is the role line, and mint means one thing at a time. */}
          {BUCKET_OF[ev.event] && (
            <span style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 5 }}>{BUCKET_OF[ev.event]}</span>
          )}
          <h2 style={{ fontFamily: F, fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: 800, color: C.white, letterSpacing: -0.5, lineHeight: 1.15, margin: 0 }}>{ev.event}</h2>
          {ev.role && <p style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint, margin: "6px 0 0", lineHeight: 1.4 }}>{ev.role} by Miles Spearman</p>}
          {/* The goal line: what this playlist was for, one quiet gray sentence
              under the role line. Only playlists Miles has written one for. */}
          {EVENT_GOALS[ev.event] && <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "4px 0 0", lineHeight: 1.4 }}>{EVENT_GOALS[ev.event]}</p>}
          {/* The five tabs, always all five. Lit = did it, dimmed = did not.
              Lit takes the role's own hue from ROLE_TAB_COLORS (Miles Aug 10);
              dimmed keeps the gray, because the dimmed state is the honesty
              signal. Mint appears on neither: mint means playing, or press. */}
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "9px 0 0" }}>
            {roleTabsFor(ev, mirror).map((on, n) => {
              const hue = ROLE_TAB_COLORS[ROLE_TABS[n]];
              return (
                <span key={ROLE_TABS[n]} title={`${ROLE_TABS[n]}: ${on ? "yes" : "no"}`} aria-label={`${ROLE_TABS[n]}: ${on ? "yes" : "no"}`}
                  style={{
                    fontFamily: F, fontSize: 12, fontWeight: 600, lineHeight: 1.3, borderRadius: 4,
                    padding: "3px 8px", whiteSpace: "nowrap",
                    color: on ? hue : "rgba(255,255,255,0.30)",
                    background: on ? tabFill(hue) : "transparent",
                    border: `1px solid ${on ? tabEdge(hue) : "rgba(255,255,255,0.07)"}`,
                  }}>{ROLE_TABS[n]}</span>
              );
            })}
          </span>
          <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "5px 0 0", fontVariantNumeric: "tabular-nums" }}>
            {ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"}{ev.totalPlays > 0 ? ` · ${fmtPlays(ev.totalPlays)} plays` : ""}{ev.window ? ` · ${ev.window}` : ""}
          </p>
          {handles && <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "3px 0 0" }}>{handles}</p>}
          {/* Credits, Tyler grammar, one per line. Locked names only. */}
          {credits.map(line => (
            <p key={line} style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "3px 0 0" }}>{line}</p>
          ))}
        </div>
        {/* Case text. A staged DRAFT wins the slot where one exists, and on
            '25 MAX LA that draft opens WITH the MAX split sentence, so the
            sentence renders once on this page, not twice. */}
        {mirror ? null : CASE_TEXTS[ev.event] ? (
          <Prose text={CASE_TEXTS[ev.event]} style={{ flexBasis: "100%", margin: "10px 0 0" }} />
        ) : MAX_SPLIT_PLAYLISTS.includes(ev.event) && (
          /* MAX render site 2 of 2. On '25 MAX LA the CASE_TEXTS branch above
             wins and already opens with the clause (it spreads MAX_CASE_PARAS);
             this fallback carries it too so a future MAX playlist without a
             case text still opens on his goal. */
          <Prose text={MAX_CASE_PARAS} style={{ flexBasis: "100%", margin: "6px 0 0" }} />
        )}
      </header>
      <div style={{ paddingTop: 8 }}>
        {ev.reels.map((r, n) => {
          const key = `${si}:${n}`;
          return (
            <BucketTrackRow key={r.postUrl} reel={r} n={n}
              open={openKey === key}
              onToggle={() => onToggle(key)}
              roleLine={r.role || ev.role || ""} />
          );
        })}
      </div>
    </section>
  );
}

function BucketPage({ bucket }) {
  const b = roleStats.find(x => x.name === bucket);
  // One open row for the WHOLE page = one <video> on the page, ever.
  const [openKey, setOpenKey] = useState(null);
  useEffect(() => { setOpenKey(null); }, [bucket]);
  if (!b) return <WorkGridPage />;
  return (
    // maxWidth matches the #/work grid cap: past ~1180 a track row stretches
    // until the title and the play count stop reading as one line.
    <section id="work" style={{ padding: "calc(104px + env(safe-area-inset-top)) clamp(24px, 5vw, 80px) 64px", maxWidth: 1180 + 160, margin: "0 auto" }}>
      <FadeIn>
        {/* 44px tap target: the back link is the only way out of a bucket page. */}
        <a href="#/work" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 13, color: C.gray, textDecoration: "none", minHeight: 44, padding: "10px 12px 10px 0", marginBottom: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = C.mint} onMouseLeave={e => e.currentTarget.style.color = C.gray}>← All work</a>
        <span style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.16em" }}>Work</span>
        <h1 style={{ fontFamily: F, fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 800, color: C.white, margin: "6px 0 10px", letterSpacing: -1, lineHeight: 1.05 }}>{b.name}</h1>
        <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: "0 0 26px", fontVariantNumeric: "tabular-nums" }}>{groupCount(b)}</p>
        <BucketIntro bucket={b.name} />
      </FadeIn>
      {b.playlists.map((ev, si) => (
        <PlaylistSection key={ev.event} ev={ev} si={si} openKey={openKey} mirror={b.mirror}
          onToggle={(k) => setOpenKey(cur => (cur === k ? null : k))} />
      ))}
    </section>
  );
}

// ===== NAV =====
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  useEffect(() => {
    if (!connectOpen) return;
    const close = () => setConnectOpen(false);
    const t = setTimeout(() => window.addEventListener("click", close), 0);
    return () => { clearTimeout(t); window.removeEventListener("click", close); };
  }, [connectOpen]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, boxSizing: "border-box",
      padding: "env(safe-area-inset-top) clamp(24px, 5vw, 80px) 0", height: "calc(64px + env(safe-area-inset-top))",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>
      <a href="#" style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, letterSpacing: -0.5, textDecoration: "none" }}>Miles Spearman</a>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <span className="nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {/* Resume tag removed Aug 9 2026 (Miles: show the body of work cleaner
              than a basic resume). Timeline keeps its slot. The resume PDF is
              still one click away from the About card, deliberately. */}
          {/* "Work" and "Playlist" are two different destinations: the role grid
              vs the player, each at its own address. The label matches the
              mobile tab bar's word for the same page (panel review Aug 10). */}
          {[["Work", "#/work", false], ["About", "#about", false], ["What I Do", "#what-i-do", false], ["Timeline", "#/timeline", false], ["Playlist", "#/playlist", false]].map(([label, href, ext]) => (
            <a key={label} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: C.gray, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.white}
              onMouseLeave={e => e.target.style.color = C.gray}
            >{label}</a>
          ))}
        </span>
        <div style={{ position: "relative" }}>
          <button onClick={() => setConnectOpen(o => !o)} aria-expanded={connectOpen} aria-haspopup="true" className="nav-connect"
            style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.bg, background: C.mint, padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.target.style.opacity = "0.85"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >Connect {connectOpen ? "▴" : "▾"}</button>
          {connectOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", background: "#141414", border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, minWidth: 220, boxShadow: "0 18px 50px rgba(0,0,0,0.6)", zIndex: 1100 }}>
              {[["Email me", "mailto:milespspearman@gmail.com", "stays right here", false],
                ["Connect on LinkedIn ↗", "https://www.linkedin.com/in/milesspearman/", "opens LinkedIn in a new tab", true]].map(([label, href, sub, ext]) => (
                <a key={label} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setConnectOpen(false)}
                  style={{ display: "block", padding: "10px 14px", borderRadius: 8, textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ display: "block", fontFamily: F, fontSize: 13.5, fontWeight: 600, color: C.white }}>{label}</span>
                  <span style={{ display: "block", fontFamily: F, fontSize: 11, color: C.gray, marginTop: 2 }}>{sub}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ===== MOBILE TAB BAR =====
// Spotify-style bottom nav so phones can jump between sections at a glance
// (friend feedback: "need a menu bar to find everything at once"). Only renders
// <=640px, where the top-bar links are hidden. Kept easy: 4 always-visible
// destinations, no dropdown, no hamburger. Contact stays the top-bar pill.
// Which tab owns which route. The Work tab owns the grid AND every bucket page
// under it; Timeline and Playlist own their own pages, so the bar says where you
// are instead of looking identical on all five destinations. Home lights none.
const TAB_FOR_ROUTE = { work: "#/work", bucket: "#/work", timeline: "#/timeline", playlist: "#/playlist" };
function MobileTabBar({ route }) {
  const tabs = [
    // "Work" = the #/work category grid (the top-bar links are hidden on phones,
    // so the new page needs a tab of its own to be reachable).
    ["Work", "#/work", "M4 7.5h16v12H4zM9 7.5V5.5a2 2 0 012-2h2a2 2 0 012 2v2"],
    ["About", "#about", "M12 11.5a3.4 3.4 0 100-6.8 3.4 3.4 0 000 6.8zM5.5 20c0-3.3 2.9-5.2 6.5-5.2s6.5 1.9 6.5 5.2"],
    ["What I Do", "#what-i-do", "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"],
    ["Timeline", "#/timeline", "M12 3v18M6 7h10M6 12h8M6 17h6"],
    ["Playlist", "#/playlist", "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"],
  ];
  const activeTab = route ? TAB_FOR_ROUTE[route.kind] : null;
  return (
    <nav className="mobile-tabbar" aria-label="Sections">
      {tabs.map(([label, href, d]) => (
        <a key={label} href={href} {...(activeTab === href ? { "aria-current": "page" } : {})}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

// ===== MAIN =====
export default function Portfolio() {
  const route = useHashRoute();
  // Route changes are page changes: the work pages start at the top. On the way
  // back to the single page, a plain #anchor has to be re-applied by hand — the
  // browser already tried to scroll before the sections mounted.
  useEffect(() => {
    if (route.kind !== "home") { window.scrollTo(0, 0); return; }
    const h = window.location.hash;
    if (!h || h.length < 2 || h.startsWith("#/")) return;
    const el = document.getElementById(h.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }, [route.kind, route.bucket]);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; overflow-x: hidden; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes eqbar { 0%, 100% { height: 4px; } 50% { height: 13px; } }
        @keyframes cuebounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes swipeOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-110%); opacity: 0; } }
        @keyframes swipeIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes heroloop { to { transform: translateX(-50%); } }
        .hero-marquee { animation-name: heroloop; animation-timing-function: linear; animation-iteration-count: infinite; }
        .hero-marquee:hover { animation-play-state: paused; }
        @keyframes drawerFade { from { opacity: 0; } }
        .marquee-scroll::-webkit-scrollbar { display: none; }
        .tl-pager::-webkit-scrollbar { display: none; }
        /* ===== THE SET LIST (Aug 11 2026), grids from research/mock-2026-08-11-d.html.
           1px gutters on purpose: the tiles are meant to read as one IG-native
           block, not as five cards. Below the step the top two go half-width and
           the bottom three go thirds; 640 stacks them, which is the phone
           reading order (watch, then read, then the next one).
           THE STEP IS 1400, MEASURED, not the mock's 1100: five columns inside
           the 1400 wrap are 264px of prose, and on a 1280 laptop (the common
           one) the same five are 212px, which in Outfit is about 30 characters
           a line. Thirty characters is a word a line, and five columns of it
           read as broken rather than as five write-ups. So the five-across only
           runs where the wrap is actually at full width. */
        .set-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; }
        .cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; margin-top: 34px; }
        @media (max-width: 1400px) {
          .set-grid { grid-template-columns: repeat(6, 1fr); }
          .set-grid > *:nth-child(1), .set-grid > *:nth-child(2) { grid-column: span 3; }
          .set-grid > *:nth-child(3), .set-grid > *:nth-child(4), .set-grid > *:nth-child(5) { grid-column: span 2; }
        }
        @media (max-width: 900px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
          /* Mobile-gate fix 2: the 641-900 band (iPhone landscape, iPad mini
             portrait) kept the 3+2 span layout, whose ~200px prose columns are
             the same broken measure the 1400 step exists to prevent. */
          .set-grid { grid-template-columns: repeat(2, 1fr); }
          .set-grid > * { grid-column: span 1 !important; }
        }
        @media (max-width: 640px) {
          .set-grid { grid-template-columns: 1fr; row-gap: 28px; }
          .set-grid > * { grid-column: span 1 !important; }
          .cat-bar { font-size: 11px !important; padding: 16px 8px 28px !important; }
        }
        /* Tier-2 title bar: hover reveals it on a desktop. On touch there is no
           hover, so it is simply always up: a tile you cannot name is not a
           link, it is a picture. */
        .cat-bar { opacity: 0; transition: opacity 0.18s ease; }
        .cat-tile:hover .cat-bar, .cat-tile:focus-visible .cat-bar { opacity: 1; }
        @media (hover: none) { .cat-bar { opacity: 1; } }
        /* R4 mobile fix: About renders as normal block flow; static headshot at card bottom, no floating swipe clip. */
        @keyframes drawerIn { from { transform: translateX(100%); } }
        @keyframes sheetIn { from { transform: translateY(100%); } }
        .spec-drawer { animation: drawerIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @media (max-width: 900px) {
          .spec-drawer { top: auto !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; max-height: 86svh; border-radius: 16px 16px 0 0; border-left: none !important; animation: sheetIn 0.35s cubic-bezier(0.22,1,0.36,1); padding-bottom: calc(24px + env(safe-area-inset-bottom)) !important; }
          .spec-drawer .spec-grabber, .spec-grabber { display: block !important; }
        }
        @media (max-width: 900px) { .tl-brands { white-space: normal !important; overflow: visible !important; } }
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          /* Phones: the row-level IG link costs the title cell ~44px it can't
             spare, and the transport bar already carries the IG CTA. */
          .tracklist-ig { display: none !important; }
          .track-plays { min-width: 40px !important; }
        }
        /* Mobile section nav — Spotify-style bottom tab bar (friend: "menu bar to
           find everything at once"). Only on phones, where the top links are hidden. */
        .mobile-tabbar { display: none; }
        @media (max-width: 640px) {
          .mobile-tabbar {
            display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 1300;
            background: rgba(10,10,10,0.94); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid ${C.border}; padding-bottom: env(safe-area-inset-bottom);
          }
          .mobile-tabbar a {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 4px; min-height: 54px; text-decoration: none; color: ${C.gray};
            font: 600 10px/1 'Outfit', sans-serif; letter-spacing: 0.2px; -webkit-tap-highlight-color: transparent;
            transition: color 0.15s;
          }
          .mobile-tabbar a:active { color: ${C.mint}; }
          .mobile-tabbar a[aria-current="page"] { color: ${C.mint}; }
          /* keep page content clear of the fixed tab bar */
          .app-root { padding-bottom: calc(56px + env(safe-area-inset-bottom)); }
          /* the player's sticky transport stacks ABOVE the tab bar (Spotify pattern) */
          .sp-bar { bottom: calc(56px + env(safe-area-inset-bottom)) !important; }
        }
        /* section jumps land below the fixed top nav, not tucked under it */
        #about, #what-i-do, #work, #timeline, #library { scroll-margin-top: calc(64px + env(safe-area-inset-top)); }
        .sp-shell { scroll-margin-top: 84px; }
        .shelf-row { scrollbar-width: none; }
        .shelf-row::-webkit-scrollbar { display: none; }
        .sp-body { display: flex; align-items: stretch; height: 640px; }
        .sp-side { width: 280px; min-width: 280px; border-right: 1px solid ${C.border}; display: flex; flex-direction: column; }
        .sp-side-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; display: flex; flex-direction: column; gap: 2px; }
        .sp-main { flex: 1; min-width: 0; overflow-y: auto; }
        .sp-now { width: 300px; min-width: 300px; border-left: 1px solid ${C.border}; padding: 16px; overflow-y: auto; }
        @media (max-width: 1080px) { .sp-now { width: 250px; min-width: 250px; } }
        @media (max-width: 900px) {
          .sp-body { flex-direction: column; height: auto; }
          .sp-side { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid ${C.border}; }
          .sp-side-list { flex-direction: row; overflow-x: auto; overflow-y: hidden; gap: 6px; padding: 4px 12px 12px; }
          .sp-side-row { min-width: 210px; }
          .sp-main { max-height: 460px; }
          .sp-now { width: 100%; min-width: 0; border-left: none; border-bottom: 1px solid ${C.border}; order: -1; display: flex; flex-direction: column; align-items: center; }
          .sp-now > div { width: min(62vw, 300px); }
          .sp-now p { align-self: center; text-align: center; }
          .sp-cover { width: 84px !important; height: 84px !important; font-size: 36px !important; }
          /* R3 B4: transport bar sticky so play/seek stay under the thumb; keep IG CTA (glyph only) */
          .sp-bar { grid-template-columns: minmax(0,1fr) auto !important; position: sticky; bottom: 0; z-index: 5; background: ${C.bg}; padding-bottom: max(10px, env(safe-area-inset-bottom)); }
          .sp-progress { width: 100% !important; }
          .sp-ig-link { padding: 11px !important; }
          .sp-ig-link .sp-ig-label { display: none; }
        }
        /* #/work category grid, variant D: four 9:16 swipe cards across on a
           desktop, two up on a phone. */
        .work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 20px; max-width: 1180px; }
        @media (max-width: 640px) { .work-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } }
        @media (hover: none) { .work-grid a:active { transform: scale(0.985); } }
        /* B2B strip: one wide row on a desktop, stacked on a phone */
        .b2b-strip { align-items: center; }
        @media (max-width: 720px) { .b2b-strip { flex-direction: column; align-items: flex-start; } }
        .tl-wrap { --rail: clamp(20px, 6vw, 60px); --gap: clamp(52px, 12vw, 108px); }
        @media (max-width: 900px) {
          .tl-wrap { --rail: 18px; --gap: 46px; }
          .tl-year { top: calc(64px + env(safe-area-inset-top)) !important; }
          .tl-card { grid-template-columns: 68px 1fr !important; gap: 16px !important; padding: 16px !important; }
        }
        /* Landscape reels in the mobile Now Playing pane need the wide escape */
        @media (max-width: 900px) {
          .sp-now > div.sp-now-ls { width: 100%; max-width: 400px; }
          .sp-side-divider { padding: 0 4px !important; align-items: center; }
          .sp-side-divider > span:last-child { display: none; }
          /* Horizontal strip: a bare word floats. The rule anchors it to the
             group of chips that follows it. */
          .sp-side-divider > span:first-child { border-left: 2px solid rgba(255,255,255,0.55); padding-left: 8px; font-size: 11px !important; }
          .spec-row-expand { padding: 10px 8px 18px 26px !important; }
        }
        /* R3 B5: 44px tap targets on touch devices */
        @media (hover: none) {
          [role="dialog"] [aria-label="Close"], .shelf-arrow { width: 44px !important; height: 44px !important; }
          .sp-bar button { min-width: 44px; min-height: 44px; }
          .tracklist-ig { opacity: 1 !important; padding: 12px 10px !important; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; }
          .album-chip { padding: 11px 16px !important; min-height: 44px; }
          .shelf-card-play { opacity: 1 !important; transform: translateY(0) !important; }
          .wall-card .wall-play { opacity: 1 !important; transform: translate(-50%,-50%) scale(0.85) !important; }
          .nav-connect { min-height: 44px !important; }
          .tl-card { position: relative; }
          .tl-card::after { content: "TAP \\25B6"; position: absolute; bottom: 12px; right: 14px; font: 700 9px/1 'Outfit', sans-serif; letter-spacing: 1px; color: #888; pointer-events: none; }
          .tl-card[aria-expanded="true"]::after { content: "PLAYING"; color: #FFFFFF; }
          .tl-chips { -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent); mask-image: linear-gradient(90deg, #000 92%, transparent); scroll-padding-right: 16px; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.darkGray}; border-radius: 3px; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${C.mint}; outline-offset: 2px; }
        /* ===== THE TYPE CUT (Sep 4 2026) ===== */
        .tc-sticky::before { content: ""; position: absolute; top: -9px; left: 50%; transform: translateX(-50%) rotate(1deg); width: 74px; height: 18px; background: rgba(255,255,255,0.28); border-left: 1px dashed rgba(0,0,0,0.08); border-right: 1px dashed rgba(0,0,0,0.08); }
        .tc-tab:hover { border-color: #3a3a3a; }
        .tc-card { transition: opacity 0.22s ease; }
        @media (max-width: 900px) {
          .tc-chips { margin-left: 0 !important; }
          .tc-chips button { min-height: 44px !important; padding: 8px 12px !important; font-size: 12px !important; }
          /* Phones: the five tabs ride one scrollable line, so the first row of work
             sits right under them in the first screen and a pressed tab's row is
             already in view (mobile + web checks, Sep 4 2026). */
          .tc-tabs { flex-wrap: nowrap !important; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; margin: 0 calc(-1 * clamp(24px, 5vw, 80px)) 18px; padding: 0 clamp(24px, 5vw, 80px) 6px; }
          .tc-tabs::-webkit-scrollbar { display: none; }
          .tc-tab { flex: 0 0 auto; }
          .tc-title { font-size: 11px !important; }
          .tc-plays { font-size: 10px !important; }
        }
        @media (max-width: 640px) { .tc-sticky { font-size: 18px !important; padding: 10px 14px 12px !important; } }
      `}</style>

      <div className="app-root" style={{ background: C.bg, minHeight: "100svh", color: C.white }}>
        {/* Film grain */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <Nav />
        <MobileTabBar route={route} />

        {/* ===== #/work — category grid ===== */}
        {route.kind === "work" && <WorkGridPage />}
        {/* ===== #/work/<bucket> — the bucket's own page ===== */}
        {route.kind === "bucket" && <BucketPage bucket={route.bucket} />}
        {/* ===== #/timeline — the career timeline as its own page ===== */}
        {route.kind === "timeline" && <CareerTimeline />}
        {/* ===== #/playlist — the Work Playlist player as its own page ===== */}
        {route.kind === "playlist" && <PlaylistPage />}

        {/* ===== Default route: the single-page site, unchanged ===== */}
        {route.kind === "home" && (<>
        {/* ===== OPENING WALL ===== */}
        <OpeningWall />

        {/* ===== ABOUT ===== */}
        <section id="about" style={{ padding: "60px clamp(24px, 5vw, 80px) 80px" }}>
          <FadeIn>
            <div style={{
              position: "relative", maxWidth: 720, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderRadius: 24, padding: "48px 40px",
            }}>
              <h2 className="about-heading" style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(30px, 4vw, 54px)", lineHeight: 1.05, letterSpacing: -1, color: C.white, margin: "0 0 20px" }}>
                About the <SwipeWord /><span style={{ color: C.mint }}>.</span>
              </h2>
              {/* The "Creative. Organized. Easy to work with." line that sat
                  here is REMOVED (Aug 10 2026). His ruling on seeing it on the
                  About card: "i don't love this, i think it's supposed to be
                  unconscious it shouldn't be shared like that." The three words
                  survive as DESIGN_NORTH_STAR above — they steer the work, they
                  are not a claim the work makes out loud. The About heading now
                  runs straight into the numbers, which are the proof anyway. */}
              <PlaysCounter />
              <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                I'm a social producer and content creator on Adobe's Social Creative Studio team in San Francisco. I direct on-location video at events like Adobe MAX and Summit, coach executives on camera, and produce talent interviews end-to-end (James Gunn, Ken Jeong, Mark Rober). I also host, present, and work in front of the camera. I studied Marketing and Music at UC. The music background shows up in how I think about rhythm, pacing, and storytelling. And yeah, I'm also a{" "}
                <a href="#/playlist"
                  onClick={(ev) => { const e = portfolio.findIndex(x => x.event === "Miles Music Media"); if (e !== -1) { ev.preventDefault(); goPlay(e, 0); } }}
                  style={{ color: C.mint, textDecoration: "none", borderBottom: `1px solid ${C.mint}55`, cursor: "pointer" }}
                  onMouseEnter={ev => ev.target.style.borderBottomColor = C.mint}
                  onMouseLeave={ev => ev.target.style.borderBottomColor = `${C.mint}55`}
                >professional trumpet player</a> in San Francisco. Reach me anytime at{" "}
                <a href="mailto:milespspearman@gmail.com"
                  style={{ color: C.mint, textDecoration: "none", borderBottom: `1px solid ${C.mint}55` }}
                >milespspearman@gmail.com</a>.
              </p>
              {/* ===== THE ONE BUTTON (Aug 10 2026) =====
                  "View Resume →" is GONE from this slot, Miles's call tonight:
                  "remove 'view resume'". It was the last resume affordance on
                  the site (the nav tag went Aug 9), so the PDF at
                  public/Miles-Spearman-Resume.pdf is now UNLINKED — the file
                  stays in the repo, nothing points at it. Flagged for him.
                  What sits here instead is the work door. He saw this slot on
                  his phone and said "link it to the what i do, section", so the
                  About region's three old buttons (View Resume here, plus
                  "Email me" and "View My LinkedIn" under the Now box) collapse
                  into exactly ONE, here, in the position he was looking at.
                  Label is his final wording, third revision tonight and the one
                  that stands: "Watch the Work". Mint primary, matching the
                  buttons it replaces, with the → the rest of the site uses.
                  Contact is NOT gone: the paragraph directly above still ends
                  on his email as an inline link, and the nav Connect dropdown
                  and the closing "Let's make something." section both keep
                  email + LinkedIn. */}
              <a href="#what-i-do"
                style={{
                  fontFamily: F, fontSize: 15, fontWeight: 600, color: C.bg, background: C.mint, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28,
                  padding: "14px 36px", borderRadius: 100, minHeight: 44,
                  transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 40px ${C.mint}20`,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >Watch the Work →</a>
              {/* Static headshot at the bottom of the About card (R4: no longer part of the swipe clip) */}
              <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-start" }}>
                <img src="/headshot.jpg" alt="Miles Spearman"
                  style={{ width: "clamp(120px, 30vw, 168px)", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "50% 20%", borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: "0 16px 44px rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ===== HERO ROW — the playing cards, twin marquees between About and WIWON ===== */}
        <section style={{ padding: "12px clamp(24px, 5vw, 80px) 28px" }}>
          <FadeIn>
            <HeroRow />
          </FadeIn>
        </section>

        {/* ===== WHAT I'M WORKING ON NOW ===== */}
        <section style={{ padding: "72px clamp(24px, 5vw, 80px) 8px" }}>
          <FadeIn>
            <div style={{ maxWidth: 860, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 14, padding: "26px 30px" }}>
              <h3 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, color: C.white, margin: "0 0 10px" }}>What I'm Working On Now</h3>
              {/* Aug 10 2026 — opening sentence DELETED on Miles's instruction.
                  It read: "At Adobe, I run in-house productions: talking tracks
                  for execs, employee interviews, and creator spotlights." His
                  reason, verbatim: "delete the section, that removes the section
                  about me being a host" — the line defined him as the person who
                  runs in-house productions, which reads past the hosting the
                  rest of the site is built on.
                  INTERPRETATION FLAG: he said "the section", and I read that as
                  this SENTENCE, not the whole Now box — the box's other two
                  sentences are current facts he wrote and nothing he said asks
                  for them to go. If he meant the whole box, deleting this
                  <div> (and the FadeIn around it) is the one edit.
                  The remaining text is his, untouched and unreworded. */}
              <p style={{ fontFamily: F, fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, margin: 0 }}>
                Right now I'm working on National Intern Day content, Creative Cloud campaign work, new Photoshop Archives episodes, and the product release videos I host. All of it is video that taps into our audience's culture and shows how Adobe's tools empower people to create.
              </p>
              <span style={{ fontFamily: F, display: "block", marginTop: 14, fontSize: 12, color: C.gray }}>Last updated: August 2026</span>
            </div>
          </FadeIn>
          {/* Aug 10 2026 — the "Email me" / "View My LinkedIn" PAIR that sat here
              is GONE and nothing replaced it in this slot. The pair asked a
              stranger to contact him before he had seen any work, which is the
              ask arriving ahead of the reason for it.
              An earlier pass tonight put a work button here; his follow-up
              (looking at the About card on his phone) put the one button up
              THERE instead, in the slot "View Resume" used to hold. One button
              in this region, not two — so this slot stays empty and the Now box
              runs straight into What I Do. */}
        </section>

        {/* ===== WHAT I DO — clickable cards ===== */}
        <section id="what-i-do" style={{ padding: "80px clamp(24px, 5vw, 80px) 60px" }}>
          <FadeIn>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 48px 0", letterSpacing: -0.5 }}>What I Do</h2>
          </FadeIn>
          <TypeCut />
          <B2BStrip />
        </section>

        {/* ===== FUN ROW — emotion picks bridging What I Do into Selected Work ===== */}
        <section style={{ padding: "12px clamp(24px, 5vw, 80px) 28px" }}>
          <FadeIn>
            <HeroRow reels={funReels} duration={90} />
          </FadeIn>
        </section>

        {/* ===== CAREER TIMELINE — slim: heading, derived line, door to #/timeline ===== */}
        <TimelineSummary />

        {/* ===== THE SET LIST (Aug 11 2026) — this slot's whole contents changed.
             OUT: <WorkPlayer /> (the 23-playlist library shell) and the four
             <PlaylistShelf /> carousels under it. Both still exist and both
             still render — at #/playlist, which now holds the only copy. The
             homepage was showing the entire library twice before a reader had
             been given a reason to care about one piece of it.
             IN: the Set List, Miles's pick (mock D + his heading). Same slot,
             same `id="work"`, so every existing #work anchor still lands here.
             The client-strip Marquee that closed this section is unmoved. ===== */}
        <SetList />

        <section style={{ padding: "0 clamp(24px, 5vw, 80px)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", paddingTop: 64 }}><Marquee /></div>
        </section>


        {/* ===== CTA ===== */}
        {/* overflowX clip: the pink glow below is a fixed 500px square centred
            with translate(-50%), so on a 375 phone it spans -62.5 to 437.5 and
            drags the whole page into a horizontal scroll (documentElement
            scrollWidth 437 against a 375 viewport). Clipping it here contains
            the bleed at the section edge. `clip` rather than `hidden` on
            purpose: hidden would make this section a scroll container and force
            overflow-y to auto, and the glow would lose its vertical bleed. */}
        <section style={{ padding: "100px clamp(24px, 5vw, 80px)", textAlign: "center", position: "relative", overflowX: "clip", overflowY: "visible" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, background: `radial-gradient(circle, ${C.pink}08, transparent 70%)`, pointerEvents: "none" }} />
          <FadeIn>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: C.white, margin: "0 0 16px 0", letterSpacing: -0.5 }}>Let's make something.</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 auto 40px", maxWidth: 500 }}>
              Currently open to new opportunities in social production, content creation, and executive communications.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:milespspearman@gmail.com"
              style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.bg, background: C.mint, padding: "16px 48px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 50px ${C.mint}30` }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
            >Email Me →</a>
            <a href="https://www.linkedin.com/in/milesspearman/" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, background: "transparent", border: `1px solid ${C.border}`, padding: "15px 48px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s, background 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.background = "#0A66C2"; e.target.style.color = "#fff"; e.target.style.boxShadow = "0 0 70px rgba(10,102,194,0.5)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.background = "transparent"; e.target.style.color = C.white; e.target.style.boxShadow = "none"; }}
            >Connect on LinkedIn ↗</a>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p style={{ fontFamily: F, fontSize: 13, margin: "28px 0 0" }}>
              <a href="https://www.instagram.com/milesmusicmedia" target="_blank" rel="noopener noreferrer"
                style={{ color: C.gray, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.mint}
                onMouseLeave={e => e.target.style.color = C.gray}
              >Off the clock: 🎷 @milesmusicmedia — my jazz content ↗</a>
            </p>
            <p style={{ fontFamily: F, fontSize: 12.5, margin: "10px 0 0", display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
              {[["Instagram · @miles.spearman", "https://www.instagram.com/miles.spearman/"], ["YouTube · @MilesSpearman", "https://www.youtube.com/@MilesSpearman"]].map(([label, href]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ color: C.gray, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = C.mint}
                  onMouseLeave={e => e.target.style.color = C.gray}
                >{label} ↗</a>
              ))}
            </p>
          </FadeIn>
        </section>
        </>)}

        {/* ===== FOOTER ===== */}
        <footer style={{ padding: "32px clamp(24px, 5vw, 80px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: F, fontSize: 12, color: C.gray }}>© 2026 Miles Spearman</span>
        </footer>
      </div>
    </>
  );
}
