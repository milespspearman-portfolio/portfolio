import { useState, useEffect, useRef, Fragment } from "react";

const C = {
  bg: "#0A0A0A", mint: "#1ED760", pink: "#FF6B9D", red: "#FA0F00", gold: "#F5C518",
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
const srcOf = (r) => r.mp4.startsWith("/reels/") ? r.mp4 : r.mp4.replace("~/Downloads/Claude/miles-portfolio-reels", "/reels");
const thumbOf = (r) => srcOf(r).replace("/reels/", "/thumbs/").replace(/\.mp4$/, ".jpg");
const playsNum = (p) => { const n = parseFloat(p); if (isNaN(n)) return 0; return /m/i.test(p) ? n * 1e6 : /k/i.test(p) ? n * 1e3 : n; };
// LinkedIn never exposes video view counts (verified: scrapers return
// reactions/comments/shares only) — show "N/A" instead of a blank that reads
// as zero. Display-only; the plays field stays "" so no derived total moves.
const playsLabel = (r) => r.plays || (r.postUrl && r.postUrl.includes("linkedin.com") ? "N/A" : "");
const fmtPlays = (n) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : String(Math.round(n));
const fmtTime = (s) => { if (!isFinite(s)) return "0:00"; const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

const GRADS = [
  ["#0C4A2E", "#1ED760"], ["#4A0C26", "#FF6B9D"], ["#0C3A4A", "#2BC8F0"], ["#2E0C4A", "#B44CF0"],
];
const gradFor = (i) => `linear-gradient(135deg, ${GRADS[i % GRADS.length][0]}, ${GRADS[i % GRADS.length][1]})`;

// What Miles did on each playlist's videos — his words, retag per playlist as needed
const EVENT_ROLES = {
  "Side Projects": "Created, produced & hosted",
  "’24 IBC Amsterdam": "Concepted, scripted, hosted & creatively directed",
  "’24 MAX Miami": "Concepted, scripted, hosted & creatively directed",
  "’24 NAB Vegas": "Concepted, scripted, hosted & creatively directed",
  "’25 Summit Vegas": "Concepted, scripted, hosted & creatively directed",
  "’25 MAX LA": "Created, produced & hosted",
  "’25 MAX London": "Concepted, scripted, hosted & creatively directed",
  "’25 NAB Vegas": "Concepted, scripted, hosted & creatively directed",
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
  "Brand Partnerships": "Produced with the Social Creative Studio team",
  "Adobe × NFL": "Produced in partnership with the NFL",
  "GenStudio for Performance Marketing": "Produced, creatively directed & coached",
  "’25 MAX Customer Stories": "Produced, creatively directed & coached",
  "Miles.Spearman": "Brainstormed, Researched, Shot, Scripted, Edited & Posted: 1-Person Production",
  "Miles Music Media": "Brainstormed, Researched, Shot, Scripted, Edited & Posted: 1-Person Production",
};
// External production partners per playlist — Miles's locked map (Jul 4),
// Audrey pattern: share the agency. Only Miles-confirmed credits appear.
// Brand roster surfaced on the timeline node (recruiter-legible names, one quiet line — not a badge grid).
const EVENT_BRANDS = {
  "Brand Partnerships": "Adobe × NWSL · Marvel · Golden State Warriors · Photoshop",
  "Adobe × NFL": "Official Creativity Partner",
  "GenStudio for Performance Marketing": "Adobe GenStudio · Exec Thought Leadership",
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
  "’26 Summit Vegas": "Adobe Summit 2026, Las Vegas. The latest event recap work.",
};
const EVENT_PARTNERS = {
  "’24 MAX Miami": "T13",
  "’25 Summit Vegas": "T13",
  "’25 MAX London": "Workhouse",
  "’25 MAX LA": "Addison Interactive",
};
// The "artist" on a playlist = the brands it published to, derived from each reel's handle
const handlesOf = (ev) => [...new Set(ev.reels.map(r => r.sub.split(" · ")[0]))].join(", ");

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
      { title: "’26 Summit: Words of Wisdom with Iliza Shlesinger", sub: "YouTube · Apr 30, 2026", plays: "", role: "Produced & Coached", landscape: true, mp4: "/reels/2026/Summit-2026/Words-of-Wisdom-Iliza.mp4", postUrl: "https://youtu.be/Yppr9COGl0o" },
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
    event: "GenStudio for Performance Marketing",
    reels: [
      { title: "GenStudio for Performance Marketing Demo", sub: "LinkedIn · 58 reactions · Nov 13, 2024", plays: "", role: "Hosted; content strategy; concept to published", mp4: "/reels/2024/GenStudio/GenStudio-Performance-Marketing.mp4", postUrl: "https://www.linkedin.com/posts/adobe-for-business_adobe-genstudio-for-performance-marketing-activity-7262556392153055232-xLqm" },
      { title: "Exec Thought Leadership: On TikTok Your Ad Has Just 10 Seconds to Live", sub: "LinkedIn · 19 reactions · Oct 30, 2025", plays: "", role: "Produced, creatively directed & coached", mp4: "/reels/2025/GenStudio-TL/TikTok-10-Seconds.mp4", postUrl: "https://www.linkedin.com/posts/tap-into-tiktoks-18b-monthly-users-with-ugcPost-7389722765508935681-Mov9" },
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
      { title: "Don't Forget to Follow @milesmusicmedia", sub: "@milesmusicmedia · 1.8K likes · May 26, 2026", plays: "19.5K", mp4: "/reels/2026/Miles-Music-Media/Dont-Forget-to-Follow-Milesmusicmedia_5.26.26.mp4", postUrl: "https://www.instagram.com/p/DYy-G16IFKZ/" },
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
];

// Miles's three libraries — every playlist belongs to exactly one.
const LIBRARY_OF = {
  "’24 MAX Miami": "Events", "’25 MAX LA": "Events", "’25 MAX London": "Events",
  "’25 Summit Vegas": "Events", "’24 NAB Vegas": "Events", "’25 NAB Vegas": "Events", "’26 NAB Vegas": "Events",
  "’24 IBC Amsterdam": "Events", "’25 IBC Amsterdam": "Events", // Cannes pulled Jul 4 (Miles)
  "Employee Spotlights: Season 1": "In-House Production", "Employee Spotlights: Season 2": "In-House Production", "Employee Spotlights: Season 3": "In-House Production",
  "’26 Summit": "Events", "Artist Spotlights": "In-House Production", "Always-On": "In-House Production", "Photoshop Archives": "In-House Production",
  "Side Projects": "In-House Production", "Brand Partnerships": "In-House Production", "Adobe × NFL": "In-House Production", "GenStudio for Performance Marketing": "In-House Production", "’25 MAX Customer Stories": "In-House Production",
  "Miles Music Media": "Off The Clock", "Miles.Spearman": "Off The Clock",
};
const LIB_ORDER = ["Events", "In-House Production", "Off The Clock"];

// Library order first, most recent projects first within each (Miles's call).
// Off The Clock keeps his authored order: Miles Music Media, then Miles.Spearman.
const reelDate = (r) => Date.parse(r.sub.split(" · ").pop()) || 0;
portfolio.sort((a, b) => {
  const la = LIB_ORDER.indexOf(LIBRARY_OF[a.event]), lb = LIB_ORDER.indexOf(LIBRARY_OF[b.event]);
  if (la !== lb) return la - lb;
  if (LIBRARY_OF[a.event] === "Off The Clock") return 0; // authored order
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
const TOTAL_REELS = portfolio.reduce((s, ev) => s + ev.reels.length, 0);
const TOTAL_PLAYS = eventStats.reduce((s, ev) => s + ev.totalPlays, 0);
// Likes live inside each reel's sub string ("· 1.8K likes ·") — derived, never typed
const likesNum = (sub) => { const m = sub.match(/([\d.]+K|[\d.]+M|\d+) likes/i); return m ? playsNum(m[1]) : 0; };
const TOTAL_LIKES = portfolio.reduce((s, ev) => s + ev.reels.reduce((a, r) => a + likesNum(r.sub), 0), 0);

// ===== CAREER TIMELINE data (professional work only; jazz/Off The Clock fenced out) =====
const TL_CAT = { Events: { accent: C.mint, chip: "ON LOCATION" }, "In-House Production": { accent: C.gold, chip: "IN-HOUSE" } };
const proEvents = eventStats.filter(ev => LIBRARY_OF[ev.event] !== "Off The Clock");
// Year bucket = the event's MODAL year (the year most of its reels landed in), tie-break to the
// later year. Keeps "'25 MAX LA" under 2025 even though a couple of reels slipped into 2026.
const yearOf = (ev) => {
  const h = {}; ev.reels.forEach(r => { const t = reelDate(r); if (!t) return; const y = new Date(t).getFullYear(); h[y] = (h[y] || 0) + 1; });
  let best = 0, bc = -1; for (const y in h) { if (h[y] > bc || (h[y] === bc && +y > best)) { bc = h[y]; best = +y; } } return best;
};
// Spine nodes: Events-library events stay whole (one on-location trip); Evergreen
// projects split into one node PER year, each carrying that year's reels, so an
// ongoing series lands each reel where it actually happened. Library playlists
// stay whole — only the chronological spine splits.
const _spineNode = (ev, reels, uid) => {
  const top = [...reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return { ...ev, idx: uid, reels, cover: thumbOf(top), coverLandscape: !!top.landscape, totalPlays: reels.reduce((s, r) => s + playsNum(r.plays), 0), window: fmtWindow({ reels }) };
};
const timelineNodes = [];
proEvents.forEach(ev => {
  if (LIBRARY_OF[ev.event] === "In-House Production") {
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
const yearMeta = Object.fromEntries(TL_YEARS.map(y => {
  const evs = timelineNodes.filter(ev => yearOf(ev) === y);
  return [y, { count: evs.length, reels: evs.reduce((s, e) => s + e.reels.length, 0), plays: evs.reduce((s, e) => s + e.totalPlays, 0) }];
}));

// Opening wall: top Adobe reels + MAX London + the personal side (musician line earns its backdrop)
const _allFlat = (() => {
  const flat = [];
  portfolio.forEach((ev, e) => ev.reels.forEach((r, i) => flat.push({ ...r, e, r: i, event: ev.event })));
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
    img: "/cards/content-strategy.jpg", imgPos: "50% 27%", title: "Content Strategy, Concept to Published",
    meta: "IBC · MAX · Summit · 2024–2026",
    body: "“Make the Firefly Video product release fun” was my brief. So as a creative producer on this piece, I built content strategy with PMMs, PR, and editorial, then wrote the scripts myself. The proof is a format: emoji reactions, 1.5M at IBC 2024, repeated at NAB and Summit.",
    linkUrl: "https://www.instagram.com/reel/DJC2KUPPwh3/", linkLabel: "Play: ’24 IBC Amsterdam →",
  },
  {
    img: "/cards/directing-coaching.jpg", imgPos: "50% 32%", title: "Directing & On-Camera Coaching",
    meta: "Adobe MAX · Summit · @adobelife · 2025–2026",
    body: "At MAX 2025 in LA I coached James Gunn, Mark Rober, and Kelley O'Hara on camera. That meant coordinating with strategy and our Social Creative Studio team to craft talking tracks: I wrote the words, got them approved, then made sure we delivered them in our 10 minute time slot. The Rober reel sits at 2.2M plays.",
    linkUrl: "https://www.instagram.com/reel/DA6zD2MA7Jh/", linkLabel: "Play: ’25 MAX LA →",
  },
  {
    img: "/cards/video-production.jpg", imgPos: "50% 28%", title: "Producing: Talent Marketing & Employee Comms",
    meta: "@adobelife · 2025–2026",
    body: "Talent marketing at Adobe means making employees the story. I produced and creatively directed the Dave interview feature in-house, and it hit 1.9M plays on @adobelife. On the San Jose Semaphore piece I handled directing and on-camera coaching.",
    linkUrl: "https://www.instagram.com/reel/DNgTb3hthgJ/", linkLabel: "Play: In-House Production →",
  },
];

// "The Set List" — each capability (copy verbatim above) is paired to a reel in
// the portfolio. Indices {e,r} are DERIVED by title lookup (never hardcoded) so
// clicking a capability deep-links into the Work player via the ms-play event.
const reelIndexByTitle = (title) => {
  for (let e = 0; e < portfolio.length; e++) {
    const r = portfolio[e].reels.findIndex(x => x.title === title);
    if (r !== -1) return { e, r };
  }
  return null;
};
// Which portfolio reel backs each capability card, by that reel's exact title.
const CAPABILITY_REEL_TITLE = {
  "On-Camera Hosting & Producing": "’25 Summit: Acrobat Escape Room",                          // Adobe Summit 2025 — 2.6M, the one most people know him by
  "Content Strategy, Concept to Published": "’24 IBC: Premiere Pro AI: Emoji Reactions",    // IBC 2024 — 1.5M, the repeatable format
  "Directing & On-Camera Coaching": "Kelley O'Hara x NWSL x Adobe",                               // MAX 2025 LA
  "Producing: Talent Marketing & Employee Comms": "Dave Werner Employee Spotlight", // Evergreen Producing — 1.9M
  "Making B2B Social Friendly": "’25 MAX Customer Story: Intuit",
};
const setList = capabilities.map(c => {
  const idx = reelIndexByTitle(CAPABILITY_REEL_TITLE[c.title]);
  return { ...c, reelIdx: idx, mp4: idx ? portfolio[idx.e].reels[idx.r].mp4 : null };
});

// ===== SPECIALTY DRAWER data — reels that PROVE each specialty, cross-playlist,
// by EXACT reel title (indices derived, never hardcoded). Row sub-lines are 100%
// DERIVED (handle + month/year from the reel's own sub string): no verbs, no new
// résumé claims. Rows HELD pending Miles's confirm (see MILES-COPY-MARKUP §C):
// Acrobat Booth + both NAB ’24 reaction reels (on-camera confirm, hosting),
// Watercolor Sneaks (meta-date conflict, directing), Jessica Williams (not
// claimed in card copy). Cannes stays out everywhere, standing rule.
// Each row carries an `album` — the body of work it belongs to (Miles's series/
// season map where one exists, the event playlist otherwise). Rows group under
// album sub-headers in the drawer, Spotify artist-page style.
const SPECIALTY_REELS = {
  // Miles's layout Jul 4: chronological event albums, his labels. Reel picks per
  // album are on-camera-evident selections, listed in chat for his pruning.
  // NAB '26 album pending: no reels in data yet (see REELS-TO-ADD).
  "On-Camera Hosting & Producing": [
    { t: "’24 MAX: Project Watercolor Master: Adobe Researcher Sneaks Interview", album: "’24 MAX Miami" },
    { t: "’24 MAX: Attendee Scavenger Hunt", album: "’24 MAX Miami" },
    { t: "’24 MAX: In-Office Trivia", album: "’24 MAX Miami" },
    { t: "’24 MAX: Project Type Lab: Adobe Researcher Sneaks Interview", album: "’24 MAX Miami" },
    { t: "’24 MAX: Project Generative Physics", album: "’24 MAX Miami" },
    { t: "’25 Summit: Acrobat Escape Room", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Over & Under AI Enterprise Activity", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Coca-Cola Activation", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Hosted Event Recap", album: "’25 Summit Vegas" },
    { t: "’25 Summit: “Describe Your Job” Interviews", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Ken Jeong Interview", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Escalator ‘Hot’ Takes", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Coolest Job @Adobe S1", album: "’25 Summit Vegas" },
    { t: "’25 Summit: Sneaks Emoji Reactions", album: "’25 Summit Vegas" },
    { t: "’25 NAB: Premiere Pro Releases", album: "’25 NAB Vegas" },
    { t: "’25 NAB: Generative Extend Demo", album: "’25 NAB Vegas" },
    { t: "’25 NAB: Event Coverage", album: "’25 NAB Vegas" },
    { t: "’25 MAX: “Coolest Job” @Adobe | Firefly Feature", album: "’25 MAX LA" },
    { t: "’25 MAX London: Recap", album: "’25 MAX London" },
    { t: "’25 MAX London: Fonts Creator Game", album: "’25 MAX London" },
    { t: "’25 MAX London: Arches of Inspiration", album: "’25 MAX London" },
  ],
  // Strategy albums = FORMATS, not events (Miles + recruiter consolidation,
  // Jul 4): repeatability across shows IS the concept-to-published story.
  // Reels cross-list from Hosting freely; his on-record claim covers it
  // ("I pitch the concepts and write the scripts for every video I host").
  // HELD: both NAB '24 emoji reels until Miles resolves the H2 date wrinkle.
  "Content Strategy, Concept to Published": [
    { t: "’24 IBC: Premiere Pro AI: Emoji Reactions", album: "Emoji Reactions" },
    { t: "’24 MAX: Sneaks Reactions One Emoji", album: "Emoji Reactions" },
    { t: "’25 Summit: Sneaks Emoji Reactions", album: "Emoji Reactions" },
    { t: "’25 Summit: Acrobat Escape Room", album: "Games & Activations" },
    { t: "’25 Summit: Over & Under AI Enterprise Activity", album: "Games & Activations" },
    { t: "’25 MAX London: Fonts Creator Game", album: "Games & Activations" },
    { t: "’24 MAX: In-Office Trivia", album: "Games & Activations" },
    { t: "’25 Summit: “Describe Your Job” Interviews", album: "Games & Activations" },
    { t: "’25 Summit: Escalator ‘Hot’ Takes", album: "Games & Activations" },
    { t: "’25 MAX London: Arches of Inspiration", album: "Games & Activations" },
    { t: "’25 MAX: “Coolest Job” @Adobe | Firefly Feature", album: "Coolest Job" },
    { t: "’25 Summit: Coolest Job @Adobe S1", album: "Coolest Job" },
    { t: "Coolest Job: Eric", album: "Coolest Job" },
    { t: "Coolest Job: Tongyu", album: "Coolest Job" },
    { t: "’25 MAX: Navin’s Coolest Job", album: "Coolest Job" },
    { t: "’25 MAX: Sarah Shen’s Coolest Job", album: "Coolest Job" },
    { t: "Firefly Interview Demo", album: "Always On" },
    { t: "Creative Cloud for Students Black Friday Discount", album: "Always On" },
  ],
  // Directing expanded per Miles Jul 4: "i did on camera coaching with ken jeong,
  // and all the be you content as well too, along with the coolest job."
  // Em Siegel joined once her real count landed (50.7K via Apify, Jul 4).
  "Directing & On-Camera Coaching": [
    { t: "’25 MAX: Mark Rober’s Creator Assignment", album: "’25 MAX LA" },
    { t: "’25 MAX: James Gunn’s Filmmaking Assignment", album: "’25 MAX LA" },
    { t: "Kelley O'Hara x NWSL x Adobe", album: "Brand Partnerships" },
    { t: "’25 MAX: Jessica Williams’ Creator Assignment", album: "’25 MAX LA" },
    { t: "’25 Summit: Ken Jeong Interview", album: "’25 Summit Vegas" },
    { t: "Dave Werner Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Manasa Hari Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Bowen Wang Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Gizem Dal Employee Spotlight", album: "Employee Spotlights · Season 2" },
    { t: "Amanda Valenzuela Employee Spotlight", album: "Employee Spotlights · Season 2" },
    { t: "Em Siegel Employee Spotlight", album: "Employee Spotlights · Season 3" },
    { t: "Imran Idzqandar Employee Spotlight", album: "Employee Spotlights · Season 3" },
    { t: "’25 MAX: “Coolest Job” @Adobe | Firefly Feature", album: "Coolest Job" },
    { t: "’25 Summit: Coolest Job @Adobe S1", album: "Coolest Job" },
    { t: "Coolest Job: Eric", album: "Coolest Job" },
    { t: "Coolest Job: Tongyu", album: "Coolest Job" },
    { t: "’25 MAX: Navin’s Coolest Job", album: "Coolest Job" },
    { t: "’25 MAX: Sarah Shen’s Coolest Job", album: "Coolest Job" },
    { t: "San Jose Semaphore", album: "In-House Production" },
  ],
  "Producing: Talent Marketing & Employee Comms": [
    { t: "Dave Werner Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Manasa Hari Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Bowen Wang Employee Spotlight", album: "Employee Spotlights · Season 1" },
    { t: "Gizem Dal Employee Spotlight", album: "Employee Spotlights · Season 2" },
    { t: "Amanda Valenzuela Employee Spotlight", album: "Employee Spotlights · Season 2" },
    { t: "Em Siegel Employee Spotlight", album: "Employee Spotlights · Season 3" },
    { t: "Imran Idzqandar Employee Spotlight", album: "Employee Spotlights · Season 3" },
    { t: "’25 MAX: “Coolest Job” @Adobe | Firefly Feature", album: "’25 MAX LA" },
    { t: "’25 Summit: Coolest Job @Adobe S1", album: "’25 Summit Vegas" },
    { t: "Coolest Job: Eric", album: "Coolest Job · Summit ’26" },
    { t: "Coolest Job: Tongyu", album: "Coolest Job · Summit ’26" },
    { t: "Russell Preston Brown Employee Spotlight", album: "In-House Production" },
    { t: "’25 MAX: Navin’s Coolest Job", album: "Coolest Job · MAX ’25" },
    { t: "’25 MAX: Sarah Shen’s Coolest Job", album: "Coolest Job · MAX ’25" },
    { t: "San Jose Semaphore", album: "In-House Production" },
    { t: "Intern Day Creative Cloud", album: "Intern Day ’25" },
  ],
  // Miles's Jul 6 spec verbatim ("one stop shop", his album list): Summit
  // pieces grouped BY EVENT YEAR, not under a "Hosting" label — the 3 '26
  // pieces (Sneaks Celebrity Host, Anil, Iliza) were produced, NOT hosted
  // by Miles, so a Hosting album misstates his role on them.
  "Making B2B Social Friendly": [
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
    { t: "Exec Thought Leadership: On TikTok Your Ad Has Just 10 Seconds to Live", album: "Exec Thought Leadership" },
    { t: "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language", album: "Exec Thought Leadership" },
    { t: "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish", album: "Exec Thought Leadership" },
    { t: "GenStudio for Performance Marketing Demo", album: "Product Releases" },
    { t: "Brand Intelligence B2B Interview", album: "Product Releases" },
    { t: "’26 Summit: Behind the Scenes of Sneaks", album: "Product Releases" },
  ],
};
// Lens-specific row descriptions — the same reel carries a DIFFERENT line per
// specialty (hosted it / concepted it / coached the talent / produced it).
// Keyed [specialty title][reel title]; falls back to REEL_DESCS, then `role`.
// Miles's words or Workfront-brief lines only. NEVER invent entries.
const SPECIALTY_ROW_DESCS = {
  "On-Camera Hosting & Producing": {},
  "Content Strategy, Concept to Published": {},
  "Directing & On-Camera Coaching": {},
  "Producing: Talent Marketing & Employee Comms": {},
  "Making B2B Social Friendly": {},
};
// Per-reel drawer descriptions — published IG caption lines (verbatim, emoji/CTA
// trimmed) or Miles's own words; more land with the Workfront ingest. Rows with
// no entry fall back to the reel's on-record `role` field. NEVER invent entries.
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
  "Exec Thought Leadership: On TikTok Your Ad Has Just 10 Seconds to Live": "Tap into TikTok's 1.8 billion monthly users with content that performs. GenStudio for Performance Marketing powers fast, on-brand creation and optimization at scale.",
  "Exec Thought Leadership: Global Consumers Prefer Content in Their Own Language": "Go global with confidence. GenStudio for Performance Marketing helps you localize personalized content at scale to reach every market, faster.",
  "Exec Thought Leadership: Humans Now Have a Shorter Attention Span Than a Goldfish": "Attention spans are shorter than ever, and that's exactly why video has become one of the most powerful ways to connect with audiences everywhere they are. I loved helping bring this piece to life to showcase the innovations Adobe is delivering around video.",
  "’25 MAX Customer Story: Intuit": "Intuit's Audrey Timpe shares how AI has become the team's ultimate brainstorming partner, helping them create faster, react quicker, and stay focused on bold, standout ideas with Adobe GenStudio for Performance Marketing.",
  "’25 MAX Customer Story: Wyndham Hotels": "Everything good comes from real human insight. Wyndham Hotels & Resorts' Marissa Yoss shares how AI is closing the gap between ideas and execution, turning data into personalized experiences, faster.",
  "’26 Summit: Anil Chakravarthy Exec Interview": "We asked Adobe's President of Customer Experience Orchestration Business, Anil Chakravarthy, some burning questions about AI ahead of Adobe Summit. Here's the real talk on agentic AI.",
};
const monthYear = (r) => { const t = reelDate(r); return t ? new Date(t).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""; };
const specialtyHighlights = Object.fromEntries(capabilities.map(c => [c.title,
  (SPECIALTY_REELS[c.title] || []).map(({ t, album }) => {
    const idx = reelIndexByTitle(t);
    if (!idx) return null;
    const reel = portfolio[idx.e].reels[idx.r];
    return { idx, reel, album, event: portfolio[idx.e].event, handle: reel.sub.split(" · ")[0], when: monthYear(reel) };
  }).filter(Boolean),
]));

const marqueeItems = ["Adobe MAX", "Adobe MAX London", "Adobe Summit", "NAB Show Las Vegas", "IBC Amsterdam", "NFL", "NWSL", "Taco Bell"];

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
    // output" — career total, his number. Site-playable count stays TOTAL_REELS.
    [String(Math.round(100 * p)) + (p >= 1 ? "+" : ""), "videos created"],
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

// ===== MARQUEE =====
function Marquee() {
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems];
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "20px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", gap: 48, whiteSpace: "nowrap", animation: "marquee 30s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: C.gray, letterSpacing: 2, textTransform: "uppercase", flexShrink: 0 }}>
            {item} <span style={{ color: C.mint, margin: "0 8px" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ===== HERO REEL WALL — live muted videos =====
const TILTS = [-3, 2, -1.5, 2.5, -2, 1.5];
function HeroCard({ reel, i, live = true }) {
  const [h, setH] = useState(false);
  const open = () => {
    // Recruiters care about the skill a reel proves (Miles Jul 4): land on the
    // specialty drawer holding this reel; player only for reels in no drawer.
    const spec = Object.entries(SPECIALTY_REELS).find(([, rows]) => rows.some(x => x.t === reel.title));
    if (spec) {
      document.getElementById("what-i-do")?.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("ms-open-specialty", { detail: { title: spec[0], reel: reel.title } }));
    } else {
      const work = document.getElementById("work");
      if (work) work.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("ms-play", { detail: { e: reel.e, r: reel.r } }));
    }
  };
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
      {live
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

// Hero marquee rows (Miles Jul 4): square album-art tiles drifting left in an
// infinite loop. Hover pauses the row so the magnet/click still work. Sets are
// duplicated for a seamless -50% loop. Two placements: top row (biggest plays,
// About -> WIWON) and fun row (emotion picks, What I Do -> Selected Work).
// JS scroll-advance marquee (Miles Jul 4 + mobile research): auto-drifts AND is
// finger-swipeable. rAF nudges scrollLeft; hover, pointer-down, or any manual
// scroll pauses it, then it resumes after a short idle. Native momentum + a
// hidden scrollbar give touch users a real swipe. reduced-motion: no drift.
function HeroMarqueeRow({ reels, duration, offset }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, idle = 0, paused = false;
    const speed = () => Math.max(0.3, (el.scrollWidth / 2) / (duration * 60)); // px/frame ~ old loop feel
    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed();
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half; // seamless wrap
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
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
    return () => { cancelAnimationFrame(raf); clearTimeout(idle);
      el.removeEventListener("mouseenter", pause); el.removeEventListener("mouseleave", resume);
      el.removeEventListener("pointerdown", pause); el.removeEventListener("pointerup", pauseIdle); el.removeEventListener("pointercancel", pauseIdle);
      el.removeEventListener("touchstart", pause); el.removeEventListener("touchend", pauseIdle); el.removeEventListener("wheel", pauseIdle);
    };
  }, [duration]);
  return (
    <div ref={ref} className="marquee-scroll" style={{ overflowX: "auto", overflowY: "hidden", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", margin: "0 calc(-1 * clamp(24px, 5vw, 80px))", maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)" }}>
      <div style={{ display: "flex", alignItems: "center", width: "max-content", padding: "10px clamp(24px, 5vw, 80px)" }}>
        {[0, 1].map(copy => (
          <div key={copy} style={{ display: "flex", alignItems: "center", gap: 18, paddingRight: 18 }}>
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
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 4, display: "block", marginBottom: 18 }}>Social Creative Producer @Adobe | San Francisco</span>
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
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: isSourceOfAudio ? C.mint : C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event}</span>
        <span style={{ display: "block", fontSize: 11.5, color: C.gray, marginTop: 2 }}>{ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"}{ev.totalPlays > 0 ? ` · ${fmtPlays(ev.totalPlays)} plays` : ""}</span>
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
        background: h ? "rgba(255,255,255,0.07)" : active ? "rgba(30,215,96,0.06)" : "transparent",
        transition: "background 0.15s",
      }}>
      <span style={{ fontFamily: F, fontSize: 13, color: C.gray, textAlign: "center" }}>
        {active && playing ? <EqBars /> : h ? <IcPlay s={11} c={C.white} /> : i + 1}
      </span>
      <Thumb reel={reel} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: F, fontSize: 14, fontWeight: 600, color: active ? C.mint : C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reel.title}</span>
        <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reel.sub}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href={reel.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="Open on Instagram" className="tracklist-ig"
          style={{ fontFamily: F, fontSize: 12, color: C.gray, textDecoration: "none", padding: "6px", minWidth: 24, textAlign: "center", opacity: h ? 1 : 0, transition: "opacity 0.15s" }}
          onMouseEnter={e => e.target.style.color = C.mint} onMouseLeave={e => e.target.style.color = C.gray}
        >↗</a>
        <span style={{ fontFamily: F, fontSize: 13, color: active ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>{playsLabel(reel)}</span>
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
            onMouseEnter={e => { e.target.style.color = C.mint; e.target.style.borderColor = "rgba(30,215,96,0.3)"; }}
            onMouseLeave={e => { e.target.style.color = C.gray; e.target.style.borderColor = C.border; }}
          ><span className="sp-ig-label">Open on Instagram </span>↗</a>
        )}
      </div>
    </div>
  );
}

function WorkPlayer() {
  const [libIdx, setLibIdx] = useState(() => Math.max(0, portfolio.findIndex(e => e.event === "’25 MAX LA")));
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

  const playTrack = (e, r) => { setVidErr(false); setProg(0); setDur(0); setTrack({ e, r }); };

  // Hero carousel / capability cards dispatch ms-play to deep-link into the library
  useEffect(() => {
    const h = (ev) => { setLibIdx(ev.detail.e); setVidErr(false); setProg(0); setDur(0); setTrack({ e: ev.detail.e, r: ev.detail.r }); };
    window.addEventListener("ms-play", h);
    return () => window.removeEventListener("ms-play", h);
  }, []);

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
                <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, whiteSpace: "nowrap" }}>{TOTAL_REELS} reels · {fmtPlays(TOTAL_PLAYS)} plays</span>
              </div>
              <div className="sp-side-list">
                {eventStats.map(ev => (
                  <Fragment key={ev.event}>
                    {(ev.idx === 0 || LIBRARY_OF[eventStats[ev.idx - 1].event] !== LIBRARY_OF[ev.event]) && (
                      <div className="sp-side-divider" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px 4px", flexShrink: 0 }}>
                        <span style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>{LIBRARY_OF[ev.event]}</span>
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
              <div style={{ padding: "28px 24px 20px", display: "flex", alignItems: "flex-end", gap: 20, background: `linear-gradient(180deg, ${GRADS[viewing.idx % GRADS.length][0]}, rgba(13,13,13,0) 96%)` }}>
                <span className="sp-cover" style={{ width: 120, height: 120, borderRadius: 12, flexShrink: 0, background: gradFor(viewing.idx), overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <img src={viewing.cover} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", display: "block" }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 2 }}>Playlist</span>
                  <h3 style={{ fontFamily: F, fontSize: "clamp(24px, 3.4vw, 44px)", fontWeight: 800, color: C.white, margin: "4px 0 8px", letterSpacing: -1, lineHeight: 1.05 }}>{viewing.event}</h3>
                  {viewing.role && <p style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", margin: "0 0 5px" }}>{viewing.role} by Miles Spearman</p>}
                  <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{viewing.event} · {viewing.reels.length} {viewing.reels.length === 1 ? "reel" : "reels"}{viewing.totalPlays > 0 ? ` · ${fmtPlays(viewing.totalPlays)} plays` : ""}{viewing.window ? ` · ${viewing.window}` : ""}{EVENT_PARTNERS[viewing.event] ? ` · with ${EVENT_PARTNERS[viewing.event]}` : ""}</p>
                </div>
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
                    const h = r.sub.split(" · ")[0];
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
                <div style={{ position: "relative" }}>
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
                    style={{ width: "100%", aspectRatio: "9 / 16", objectFit: "cover", borderRadius: 12, background: "#000", cursor: "pointer", display: "block" }}
                  />
                  {vidErr && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(10,10,10,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
                      <span style={{ fontSize: 26 }}>🎬</span>
                      <p style={{ fontFamily: F, fontSize: 13, color: C.gray, margin: 0, lineHeight: 1.5 }}>This file hasn't landed on the server yet.</p>
                      <a href={cur.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.bg, background: C.mint, padding: "8px 18px", borderRadius: 100, textDecoration: "none" }}>Watch on Instagram ↗</a>
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white, margin: "12px 0 2px" }}>{cur.title}</p>
                <p style={{ fontFamily: F, fontSize: 12, color: C.gray, margin: 0 }}>{cur.sub}</p>
                <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.mint, margin: "6px 0 0", lineHeight: 1.4 }}>{cur.role || EVENT_ROLES[portfolio[track.e].event] || ""}</p>
              </div>
            )}
          </div>

          <PlayerBar
            cur={cur}
            eventName={cur ? `${cur.sub.split(" · ")[0]} · ${portfolio[track.e].event}` : ""}
            playing={playing} prog={prog} dur={dur} muted={muted}
            onToggle={toggle} onStep={step} onSeek={seek} onMute={() => setMuted(m => !m)}
          />
        </div>
      </FadeIn>
    </>
  );
}

// ===== PLAYLIST SHELF — Your Library as a Navin-style cover-card carousel =====
function ShelfCard({ ev }) {
  const [h, setH] = useState(false);
  return (
    <a href="#work" onClick={() => window.dispatchEvent(new CustomEvent("ms-play", { detail: { e: ev.idx, r: 0 } }))}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        textDecoration: "none", flexShrink: 0, width: 200, scrollSnapAlign: "start",
        background: h ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${h ? "rgba(30,215,96,0.25)" : C.border}`, borderRadius: 14, padding: 14,
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

function ShelfRow({ title, items }) {
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
          {items.map(ev => <ShelfCard key={ev.event} ev={ev} />)}
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
          <div style={{ position: "relative", width: "min(66%, 220px)", aspectRatio: "9 / 16", borderRadius: 14, overflow: "hidden", background: "#000" }}>
            {play ? (
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
                  {near ? (
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

function CareerTimeline() {
  const [openIdx, setOpenIdx] = useState(null); // eventStats idx of the open node
  const [reelIdx, setReelIdx] = useState(0);    // active reel within the open node
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
    <section id="timeline" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
      <FadeIn>
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Timeline</span>
        <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>The Work, In Order</h2>
        <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 20px 0", maxWidth: 520 }}>Every event and in-house project on one scroll. Tap a milestone to play it. Newest first.</p>
      </FadeIn>

      <div className="tl-wrap" style={{ position: "relative", paddingLeft: "var(--gap)" }}>
        <div ref={railRef} aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: "var(--rail)", width: 2, background: C.border }}>
          <div ref={fillRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "0%", background: C.mint, boxShadow: `0 0 12px ${C.mint}`, transition: "height 0.12s linear" }} />
        </div>

        {timelineNodes.map((ev) => {
          const yr = yearOf(ev);
          const cat = TL_CAT[LIBRARY_OF[ev.event]] || { accent: C.mint, chip: "" };
          const open = openIdx === ev.idx;
          const showYear = yr !== lastYear; lastYear = yr;
          const meta = yearMeta[yr] || { count: 0, plays: 0 };
          // Chronological within a project — newest reel first — so the carousel
          // reads in order (e.g. Brand Partnerships: Eyes of Wakanda → NWSL → GSW).
          const reels = [...ev.reels].sort((x, y) => (Number(!!y.landscape) - Number(!!x.landscape)) || (reelDate(y) - reelDate(x)));
          const active = reels[Math.min(reelIdx, reels.length - 1)] || reels[0];
          const desc = active ? (REEL_DESCS[active.title] || "") : "";
          return (
            <Fragment key={ev.idx}>
              {showYear && (
                <div className="tl-year" style={{ position: "sticky", top: 76, zIndex: 3, padding: "16px 0 8px", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg} 82%, transparent)` }}>
                  <span style={{ fontFamily: F, fontSize: "clamp(40px, 8vw, 84px)", fontWeight: 800, color: C.red, letterSpacing: -3, lineHeight: 0.9, display: "block" }}>{yr}</span>
                  <span style={{ fontFamily: F, fontSize: 10.5, color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase" }}>{meta.count} {meta.count === 1 ? "project" : "projects"} · {meta.reels} reels · {fmtPlays(meta.plays)}</span>
                </div>
              )}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <span aria-hidden="true" style={{ position: "absolute", left: "calc(var(--rail) - var(--gap) - 7px)", top: 22, width: open ? 18 : 14, height: open ? 18 : 14, borderRadius: "50%", background: cat.accent, boxShadow: `0 0 0 6px ${cat.accent}1F`, transition: "all 0.2s" }} />
                <div role="button" tabIndex={0} aria-expanded={open} className="tl-card"
                  onClick={() => toggle(ev.idx)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(ev.idx); } }}
                  onMouseEnter={e => { if (!open) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 16, alignItems: "center", padding: 14, borderRadius: 14, cursor: "pointer", background: open ? "rgba(30,215,96,0.06)" : C.glass, border: `1px solid ${open ? cat.accent + "66" : C.border}`, transition: "border-color 0.2s, background 0.2s, transform 0.2s" }}>
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
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

function PlaylistShelf() {
  return (
    <section id="library" style={{ padding: "36px 0 12px clamp(24px, 5vw, 80px)" }}>
      {LIB_ORDER.map(lib => (
        <ShelfRow key={lib} title={`${lib} Library`} items={eventStats.filter(ev => LIBRARY_OF[ev.event] === lib)} />
      ))}
    </section>
  );
}

// ===== WHAT I DO — cards open the Specialty Drawer (Navin pattern): proof index
// with numbered Highlights. Rows expand and play IN the drawer (Miles's call,
// supersedes the zero-video drawer rule); one expanded row = one mounted video.
// Card bodies moved verbatim INTO the drawer (no message repetition). =====
function SpecialtyDrawer({ cap, onClose, onSwitch }) {
  const [closing, setClosing] = useState(false);
  const asideRef = useRef(null);
  const close = () => { setClosing(true); setTimeout(onClose, 250); };
  // Prev/next specialty (wrap-around) — the drawer never dead-ends.
  const capIdx = setList.findIndex(c => c.title === cap.title);
  const prevCap = setList[(capIdx - 1 + setList.length) % setList.length];
  const nextCap = setList[(capIdx + 1) % setList.length];
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);
  // Mobile bottom-sheet: drag the sheet down to dismiss. Only hijacks the touch
  // when content is scrolled to the top and the finger pulls DOWN, so inner
  // scrolling is untouched. Native non-passive listener so preventDefault works
  // (React binds touchmove passive). Gated to the ≤900px sheet layout.
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
  const drag = useRef({ startY: 0, active: false });
  const setDrag = (v) => { dragYRef.current = v; setDragY(v); };
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const isSheet = () => window.matchMedia("(max-width: 900px)").matches;
    const onStart = (e) => {
      if (!isSheet()) return;
      drag.current = { startY: e.touches[0].clientY, active: true };
    };
    const onMove = (e) => {
      if (!drag.current.active) return;
      const dy = e.touches[0].clientY - drag.current.startY;
      if (el.scrollTop <= 0 && dy > 0) { e.preventDefault(); setDrag(dy); }
      else if (dragYRef.current) setDrag(0);
    };
    const onEnd = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      if (dragYRef.current > 90) close();
      else setDrag(0);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);
  const rows = specialtyHighlights[cap.title] || [];
  const proofPlays = rows.reduce((s, h) => s + playsNum(h.reel.plays), 0);
  // Rows play INSIDE the drawer (Miles: "it should just play inside of the
  // specialty tab when i push play, just expands" — no jump to Selected Work).
  // One expanded row at a time = the only <video> mounted in the drawer.
  const initial = cap.initialReel ? (specialtyHighlights[cap.title] || []).find(h => h.reel.title === cap.initialReel) : null;
  // Recruiter-lens flip fix: if the arriving reel is in the Popular top-6, open
  // it THERE (first screen); otherwise open its album row and scroll to it.
  // B2B square skips the plays-ranked POPULAR tier: 6 of its LinkedIn reels
  // have no retrievable play count, and a plays ranking would sink them to the
  // bottom as false flops. Album grouping only until real numbers land (§5.1).
  const NO_POPULAR = cap.title === "Making B2B Social Friendly";
  const popular = rows.length > 8 && !NO_POPULAR ? [...rows].sort((a, b) => playsNum(b.reel.plays) - playsNum(a.reel.plays)).slice(0, 6) : null;
  const initialInPop = !!(initial && popular && popular.some(h => h.reel.title === cap.initialReel));
  const [openRow, setOpenRow] = useState(initial ? (initialInPop ? "pop:" : "alb:") + cap.initialReel : null); // keyed by tier-prefixed reel title
  const toggleRow = (t) => setOpenRow(cur => (cur === t ? null : t));
  useEffect(() => {
    if (initial && !initialInPop) {
      requestAnimationFrame(() => asideRef.current?.querySelector('[data-open-row]')?.scrollIntoView({ block: "center" }));
    }
  }, []);
  // Navin structure (Miles's call): in big drawers, events are the rows —
  // one row per body of work, tap to unfold its brief + reels. Space for
  // per-event descriptions (Workfront briefs) lives in ALBUM_BLURBS.
  const [openAlbum, setOpenAlbum] = useState(initial && !initialInPop ? initial.album : null);
  // Album groups (order of first appearance) — Spotify artist-page style.
  const groups = [];
  const _byAlbum = {};
  rows.forEach(h => {
    if (_byAlbum[h.album]) _byAlbum[h.album].rows.push(h);
    else { const g = { album: h.album, rows: [h] }; _byAlbum[h.album] = g; groups.push(g); }
  });
  const yearSpan = (() => {
    const ys = rows.map(h => { const t = reelDate(h.reel); return t ? new Date(t).getFullYear() : 0; }).filter(Boolean);
    if (!ys.length) return "";
    const a = Math.min(...ys), b = Math.max(...ys);
    return a === b ? String(a) : `${a}–${b}`;
  })();
  const chipsEl = groups.length > 1 ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 8px" }}>
      {groups.map(g => (
        <button key={g.album}
          onClick={() => asideRef.current?.querySelector(`[data-album="${g.album}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.gray, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 100, padding: "5px 12px", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.color = C.mint; e.currentTarget.style.borderColor = "rgba(30,215,96,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.gray; e.currentTarget.style.borderColor = C.border; }}>
          {g.album} · {g.rows.length}</button>
      ))}
    </div>
  ) : null;
  // One row renderer, two tiers; tier prefix keeps open-state keys distinct so
  // the same reel never mounts two videos at once.
  const renderRow = (h, i, tier) => {
    const key = tier + h.reel.title;
    const open = openRow === key;
    const desc = (SPECIALTY_ROW_DESCS[cap.title] || {})[h.reel.title] || REEL_DESCS[h.reel.title] || h.reel.role || "";
    return (
    <div key={key} {...(open ? { "data-open-row": "" } : {})}>
    <div role="button" tabIndex={0} aria-expanded={open}
      onClick={() => toggleRow(key)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRow(key); } }}
      onMouseEnter={e => e.currentTarget.style.background = open ? "rgba(30,215,96,0.06)" : "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = open ? "rgba(30,215,96,0.06)" : "transparent"}
      style={{ display: "grid", gridTemplateColumns: "26px 44px 1fr auto", gap: 12, alignItems: "center", padding: "10px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s", background: open ? "rgba(30,215,96,0.06)" : "transparent" }}>
      <span style={{ fontFamily: F, fontSize: 13, color: open ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {open ? <EqBars /> : i + 1}
      </span>
      <span style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: "#111" }}>
        <img src={thumbOf(h.reel)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: F, fontSize: 14, fontWeight: 600, color: open ? C.mint : C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.reel.title}</span>
        <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 2 }}>{h.handle}{h.when ? ` · ${h.when}` : ""}</span>
      </span>
      <span style={{ fontFamily: F, fontSize: 13, color: C.mint, fontVariantNumeric: "tabular-nums" }}>{playsLabel(h.reel)}</span>
    </div>
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
      <div style={{ overflow: "hidden" }}>
        {open && (
          <div style={{ padding: "10px 8px 18px 82px" }}>
            <video src={srcOf(h.reel)} poster={thumbOf(h.reel)} controls autoPlay muted playsInline preload="metadata"
              style={{ width: "min(100%, 240px)", aspectRatio: "9 / 16", objectFit: "cover", borderRadius: 12, background: "#000", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", display: "block" }}
              onError={e => { e.currentTarget.style.display = "none"; }} />
            {desc && <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: "12px 0 0", maxWidth: 340 }}>{desc}</p>}
            <a href={h.reel.postUrl} target="_blank" rel="noreferrer"
              style={{ display: "inline-block", fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textDecoration: "none", marginTop: 10 }}>
              Open on Instagram ↗</a>
          </div>
        )}
      </div>
    </div>
    </div>
    );
  };
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(10,10,10,0.6)", opacity: closing ? 0 : 1, transition: "opacity 0.25s", animation: "drawerFade 0.3s" }}>
      <aside ref={asideRef} role="dialog" aria-modal="true" aria-label={cap.title} onClick={e => e.stopPropagation()} className="spec-drawer"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 92vw)", zIndex: 1201, background: "#0D0D0D", borderLeft: `1px solid ${C.border}`, boxShadow: "-24px 0 80px rgba(0,0,0,0.6)", overflowY: "auto", padding: 24, opacity: closing ? 0 : 1, transform: `translateY(${dragY}px)`, transition: drag.current.active ? "none" : "opacity 0.25s, transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="spec-grabber" aria-hidden="true" style={{ display: "none", width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 2 }}>Specialty</span>
          <button onClick={close} autoFocus aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.06)", color: C.white, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
          <span style={{ width: 96, height: 96, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#111" }}>
            <img src={cap.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: cap.imgPos, display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: F, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: C.white, margin: 0, letterSpacing: -0.5, lineHeight: 1.15 }}>{cap.title}</h3>
            {cap.meta && <span style={{ display: "block", fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 8 }}>{cap.meta}</span>}
            <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 4 }}>{rows.length} proof reels · {fmtPlays(proofPlays)} plays</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", margin: "16px 0 20px" }}>
          {rows.length > 0 && (
            <button onClick={() => toggleRow(openRow === null ? (popular ? "pop:" + popular[0].reel.title : "alb:" + rows[0].reel.title) : openRow)} aria-label={cap.linkLabel}
              style={{ width: 48, height: 48, borderRadius: "50%", border: "none", background: C.mint, color: C.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 6px 24px ${C.mint}35`, flexShrink: 0 }}>
              <IcPlay s={17} />
            </button>
          )}
          <p style={{ fontFamily: F, fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: 0, borderLeft: `3px solid ${C.mint}`, paddingLeft: 14 }}>{cap.body}</p>
        </div>
        {/* Organization at a glance (no Popular tier): chips above the list */}
        {!popular && chipsEl}
        <div style={{ display: "grid", gridTemplateColumns: "26px 44px 1fr auto", gap: 12, alignItems: "center", padding: "0 8px 8px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, textAlign: "center" }}>#</span>
          <span />
          <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray, letterSpacing: 1 }}>{popular ? "POPULAR" : "HIGHLIGHTS"}</span>
          <span style={{ fontFamily: F, fontSize: 10.5, color: C.gray }}>PLAYS</span>
        </div>
        {popular && popular.map((h, i) => renderRow(h, i, "pop:"))}
        {popular && (
          <div style={{ fontFamily: F, fontSize: 10.5, color: C.gray, letterSpacing: 1, padding: "22px 8px 8px", borderBottom: `1px solid ${C.border}` }}>
            ALL EVENTS · {rows.length} REELS{yearSpan ? ` · ${yearSpan}` : ""}
          </div>
        )}
        {popular ? groups.map((g, gi) => {
          const gOpen = openAlbum === g.album;
          const gPlays = g.rows.reduce((s, h) => s + playsNum(h.reel.plays), 0);
          const gTop = [...g.rows].sort((a, b) => playsNum(b.reel.plays) - playsNum(a.reel.plays))[0];
          return (
          <div key={g.album} data-album={g.album} style={{ scrollMarginTop: 12 }}>
            <div role="button" tabIndex={0} aria-expanded={gOpen}
              onClick={() => setOpenAlbum(cur => (cur === g.album ? null : g.album))}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenAlbum(cur => (cur === g.album ? null : g.album)); } }}
              onMouseEnter={e => e.currentTarget.style.background = gOpen ? "rgba(30,215,96,0.06)" : "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = gOpen ? "rgba(30,215,96,0.06)" : "transparent"}
              style={{ display: "grid", gridTemplateColumns: "26px 44px 1fr auto", gap: 12, alignItems: "center", padding: "12px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s", background: gOpen ? "rgba(30,215,96,0.06)" : "transparent" }}>
              <span style={{ fontFamily: F, fontSize: 13, color: gOpen ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", textAlign: "center" }}>{gi + 1}</span>
              <span style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: "#111" }}>
                <img src={thumbOf(gTop.reel)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: F, fontSize: 14, fontWeight: 700, color: gOpen ? C.mint : C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.album}</span>
                <span style={{ display: "block", fontFamily: F, fontSize: 12, color: C.gray, marginTop: 2 }}>{g.rows.length} {g.rows.length === 1 ? "reel" : "reels"} · {fmtPlays(gPlays)} plays</span>
              </span>
              <span aria-hidden="true" style={{ display: "inline-flex", transform: gOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s", color: gOpen ? C.mint : C.gray }}>
                <IcPlay s={11} c={gOpen ? C.mint : C.gray} />
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateRows: gOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
              <div style={{ overflow: "hidden" }}>
                {gOpen && (
                  <div style={{ padding: "2px 0 10px 26px" }}>
                    {ALBUM_BLURBS[g.album] && <div style={{ fontFamily: F, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, padding: "4px 8px 8px", borderLeft: `3px solid ${C.mint}`, marginLeft: 8, paddingLeft: 12 }}>{ALBUM_BLURBS[g.album]}</div>}
                    {g.rows.map((h, i) => renderRow(h, i, "alb:"))}
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        }) : groups.map((g) => (
        <div key={g.album}>
        {g.album && (
          <div data-album={g.album} style={{ padding: "16px 8px 6px", scrollMarginTop: 12 }}>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5 }}>{g.album}</div>
            {ALBUM_BLURBS[g.album] && <div style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{ALBUM_BLURBS[g.album]}</div>}
          </div>
        )}
        {g.rows.map((h, i) => renderRow(h, i, "alb:"))}
        </div>
        ))}
        {/* Never a dead end: previous / up-next specialty previews */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          {[{ label: "← Previous", c: prevCap, align: "left" }, { label: "Up next →", c: nextCap, align: "right" }].map(({ label, c, align }) => (
            <button key={label} onClick={() => onSwitch(c)}
              style={{ display: "flex", flexDirection: align === "right" ? "row-reverse" : "row", alignItems: "center", gap: 10, textAlign: align, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, cursor: "pointer", transition: "border-color 0.2s, background 0.2s", minWidth: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(30,215,96,0.35)"; e.currentTarget.style.background = "rgba(30,215,96,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <span style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#111" }}>
                <img src={c.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.imgPos, display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: F, fontSize: 10, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
                <span style={{ display: "block", fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function WhatIDoCards() {
  const gridRef = useRef(null);
  const [drawerCap, setDrawerCap] = useState(null);
  usePlayWhenVisible(gridRef); // reels only play while the section is on screen
  useEffect(() => {
    const h = (e) => {
      const cap = setList.find(c => c.title === e.detail.title);
      if (cap) setDrawerCap({ ...cap, initialReel: e.detail.reel });
    };
    window.addEventListener("ms-open-specialty", h);
    return () => window.removeEventListener("ms-open-specialty", h);
  }, []);
  return (
    <>
    <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
      {setList.map((c, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <div role="button" tabIndex={0}
            onClick={() => setDrawerCap(c)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerCap(c); } }}
            style={{
              background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderRadius: 16, padding: 28,
              transition: "all 0.3s", display: "flex", flexDirection: "column", gap: 12,
              height: "100%", cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(30,215,96,0.2)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(30,215,96,0.06)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden", background: "#111" }}>
              {c.mp4
                ? <video src={srcOf(c)} poster={c.img} muted loop playsInline preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.imgPos, display: "block" }}
                    onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />
                : <img src={c.img} alt={c.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.imgPos, display: "block" }} onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />}
            </div>
            {c.meta && <span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5 }}>{c.meta}</span>}
            <h4 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, margin: 0, flex: 1 }}>{c.title}</h4>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, marginTop: 8 }}>Highlights →</span>
          </div>
        </FadeIn>
      ))}
    </div>
    {drawerCap && <SpecialtyDrawer key={drawerCap.title} cap={drawerCap} onClose={() => setDrawerCap(null)} onSwitch={setDrawerCap} />}
    </>
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
          {[["About", "#about", false], ["What I Do", "#what-i-do", false], ["Work Playlist", "#work", false], ["Timeline", "#timeline", false], ["Resume", "/Miles-Spearman-Resume.pdf", true]].map(([label, href, ext]) => (
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
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(30,215,96,0.08)"}
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
function MobileTabBar() {
  const tabs = [
    ["About", "#about", "M12 11.5a3.4 3.4 0 100-6.8 3.4 3.4 0 000 6.8zM5.5 20c0-3.3 2.9-5.2 6.5-5.2s6.5 1.9 6.5 5.2"],
    ["Work", "#work", "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"],
    ["Timeline", "#timeline", "M12 3v18M6 7h10M6 12h8M6 17h6"],
    ["Library", "#library", "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"],
  ];
  return (
    <nav className="mobile-tabbar" aria-label="Sections">
      {tabs.map(([label, href, d]) => (
        <a key={label} href={href}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

// ===== MAIN =====
export default function Portfolio() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
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
        /* R4 mobile fix: About renders as normal block flow; static headshot at card bottom, no floating swipe clip. */
        @keyframes drawerIn { from { transform: translateX(100%); } }
        @keyframes sheetIn { from { transform: translateY(100%); } }
        .spec-drawer { animation: drawerIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @media (max-width: 900px) {
          .spec-drawer { top: auto !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; max-height: 86svh; border-radius: 16px 16px 0 0; border-left: none !important; animation: sheetIn 0.35s cubic-bezier(0.22,1,0.36,1); }
          .spec-drawer .spec-grabber, .spec-grabber { display: block !important; }
        }
        @media (max-width: 900px) { .tl-brands { white-space: normal !important; overflow: visible !important; } }
        @media (max-width: 640px) { .nav-links { display: none !important; } }
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
        .tl-wrap { --rail: clamp(20px, 6vw, 60px); --gap: clamp(52px, 12vw, 108px); }
        @media (max-width: 900px) {
          .tl-wrap { --rail: 18px; --gap: 46px; }
          .tl-year { top: calc(64px + env(safe-area-inset-top)) !important; }
          .tl-card { grid-template-columns: 68px 1fr !important; gap: 16px !important; padding: 16px !important; }
        }
        /* R3 B5: 44px tap targets on touch devices */
        @media (hover: none) {
          .spec-drawer [aria-label="Close"], .shelf-arrow { width: 44px !important; height: 44px !important; }
          .sp-bar button { min-width: 44px; min-height: 44px; }
          .tracklist-ig { opacity: 1 !important; }
          .shelf-card-play { opacity: 1 !important; transform: translateY(0) !important; }
          .wall-card .wall-play { opacity: 1 !important; transform: translate(-50%,-50%) scale(0.85) !important; }
          .nav-connect { min-height: 44px !important; }
          .tl-card { position: relative; }
          .tl-card::after { content: "TAP \\25B6"; position: absolute; bottom: 12px; right: 14px; font: 700 9px/1 'Outfit', sans-serif; letter-spacing: 1px; color: #888; pointer-events: none; }
          .tl-card[aria-expanded="true"]::after { content: "PLAYING"; color: #1ED760; }
          .tl-chips { -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent); mask-image: linear-gradient(90deg, #000 92%, transparent); scroll-padding-right: 16px; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.darkGray}; border-radius: 3px; }
        a:focus-visible { outline: 2px solid ${C.mint}; outline-offset: 2px; }
      `}</style>

      <div className="app-root" style={{ background: C.bg, minHeight: "100svh", color: C.white }}>
        {/* Film grain */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <Nav />
        <MobileTabBar />

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
              <PlaysCounter />
              <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                I'm a social producer and content creator on Adobe's Social Creative Studio team in San Francisco. I direct on-location video at events like Adobe MAX and Summit, coach executives on camera, and produce talent interviews end-to-end (James Gunn, Ken Jeong, Mark Rober). I also host, present, and work in front of the camera. I studied Marketing and Music at UC. The music background shows up in how I think about rhythm, pacing, and storytelling. And yeah, I'm also a{" "}
                <a href="#work"
                  onClick={() => { const e = portfolio.findIndex(ev => ev.event === "Miles Music Media"); if (e !== -1) window.dispatchEvent(new CustomEvent("ms-play", { detail: { e, r: 0 } })); }}
                  style={{ color: C.mint, textDecoration: "none", borderBottom: `1px solid ${C.mint}55`, cursor: "pointer" }}
                  onMouseEnter={ev => ev.target.style.borderBottomColor = C.mint}
                  onMouseLeave={ev => ev.target.style.borderBottomColor = `${C.mint}55`}
                >professional trumpet player</a> in San Francisco. Reach me anytime at{" "}
                <a href="mailto:milespspearman@gmail.com"
                  style={{ color: C.mint, textDecoration: "none", borderBottom: `1px solid ${C.mint}55` }}
                >milespspearman@gmail.com</a>.
              </p>
              <a href="/Miles-Spearman-Resume.pdf" target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28,
                  border: "1px solid rgba(30,215,96,0.3)", padding: "10px 24px", borderRadius: 100,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(30,215,96,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >View Resume →</a>
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
            <div style={{ maxWidth: 860, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.mint}`, borderRadius: 14, padding: "26px 30px" }}>
              <h3 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, color: C.white, margin: "0 0 10px" }}>What I'm Working On Now</h3>
              <p style={{ fontFamily: F, fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, margin: 0 }}>
                At Adobe, I run in-house productions for the Social Creative Studio team: talking tracks for execs, employee interviews, and creator spotlights. Right now I'm also deep in post production on our Cannes social work. All of it is video that taps into our audience's culture and shows how Adobe's tools empower people to create.
              </p>
              <span style={{ fontFamily: F, display: "block", marginTop: 14, fontSize: 12, color: C.gray }}>Last updated: July 2026</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <a href="mailto:milespspearman@gmail.com"
                style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: C.bg, background: C.mint, padding: "14px 36px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 40px ${C.mint}20` }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
              >Email me →</a>
              <a href="https://www.linkedin.com/in/milesspearman/" target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: C.white, background: "transparent", border: `1px solid ${C.border}`, padding: "13px 36px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, background 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.background = "#0A66C2"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.background = "transparent"; e.target.style.color = C.white; }}
              >View My LinkedIn →</a>
            </div>
          </FadeIn>
        </section>

        {/* ===== WHAT I DO — clickable cards ===== */}
        <section id="what-i-do" style={{ padding: "80px clamp(24px, 5vw, 80px) 60px" }}>
          <FadeIn>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 48px 0", letterSpacing: -0.5 }}>What I Do</h2>
          </FadeIn>
          <WhatIDoCards />
        </section>

        {/* ===== FUN ROW — emotion picks bridging What I Do into Selected Work ===== */}
        <section style={{ padding: "12px clamp(24px, 5vw, 80px) 28px" }}>
          <FadeIn>
            <HeroRow reels={funReels} duration={90} />
          </FadeIn>
        </section>

        {/* ===== CAREER TIMELINE ===== */}
        <CareerTimeline />

        {/* ===== SELECTED WORK — moved below the timeline, right above the library
             (Miles: tapping a library video should link straight back up to the player) ===== */}
        <section id="work" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>Selected Work</h2>
            <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 32px 0", maxWidth: 500 }}>Real content from real campaigns: Pitched, Produced and Directed by Me. {TOTAL_REELS} videos · {fmtPlays(TOTAL_PLAYS)} plays. Pick a playlist, press play.</p>
          </FadeIn>

          <WorkPlayer />

          <div style={{ marginTop: 64 }}><Marquee /></div>
        </section>

        {/* ===== PLAYLIST SHELF ===== */}
        <PlaylistShelf />


        {/* ===== CTA ===== */}
        <section style={{ padding: "100px clamp(24px, 5vw, 80px)", textAlign: "center", position: "relative" }}>
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

        {/* ===== FOOTER ===== */}
        <footer style={{ padding: "32px clamp(24px, 5vw, 80px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: F, fontSize: 12, color: C.gray }}>© 2026 Miles Spearman</span>
        </footer>
      </div>
    </>
  );
}
