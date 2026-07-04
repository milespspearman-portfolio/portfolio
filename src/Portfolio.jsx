import { useState, useEffect, useRef, Fragment } from "react";

const C = {
  bg: "#0A0A0A", mint: "#1ED760", pink: "#FF6B9D",
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
const fmtPlays = (n) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : String(Math.round(n));
const fmtTime = (s) => { if (!isFinite(s)) return "0:00"; const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

const GRADS = [
  ["#0C4A2E", "#1ED760"], ["#4A0C26", "#FF6B9D"], ["#0C3A4A", "#2BC8F0"], ["#2E0C4A", "#B44CF0"],
];
const gradFor = (i) => `linear-gradient(135deg, ${GRADS[i % GRADS.length][0]}, ${GRADS[i % GRADS.length][1]})`;

// What Miles did on each playlist's videos — his words, retag per playlist as needed
const EVENT_ROLES = {
  "UC": "Created, produced & hosted",
  "Employee & Always On": "Concepted, scripted, hosted & creatively directed",
  "IBC 2024": "Concepted, scripted, hosted & creatively directed",
  "MAX Miami 2024": "Concepted, scripted, hosted & creatively directed",
  "NAB 2024": "Concepted, scripted, hosted & creatively directed",
  "Upworthy": "Created, produced & hosted",
  "Adobe Summit 2025": "Concepted, scripted, hosted & creatively directed",
  "MAX 2025 LA": "Created, produced & hosted",
  "MAX London 2025": "Concepted, scripted, hosted & creatively directed",
  "NAB 2025": "Concepted, scripted, hosted & creatively directed",
  "Cannes": "Produced",
  "Evergreen Producing": "Produced",
  "Miles.Spearman": "Brainstormed, Researched, Shot, Scripted, Edited & Posted — 1-Person Production",
  "Miles Music Media": "Brainstormed, Researched, Shot, Scripted, Edited & Posted — 1-Person Production",
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
    event: "UC",
    reels: [
      { title: "@UofCincy Social", sub: "@uofcincy · 621 likes · Jul 7, 2022", plays: "5.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2022/UC/UC_7.7.22.mp4", postUrl: "https://www.instagram.com/p/CfuYwU7J0Zv/" },
    ],
  },
  {
    event: "Employee & Always On",
    reels: [
      { title: "Firefly Interview Demo", sub: "@adobevideo · 979 likes · Sep 12, 2024", plays: "728.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Employee-and-Always-On/Firefly-Interview-Demo_9.12.24.mp4", postUrl: "https://www.instagram.com/p/C_0rxmZPxif/" },
      { title: "Creative Cloud for Students Black Friday Discount", sub: "@adobe · 439 likes · Nov 30, 2024", plays: "831.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Employee-and-Always-On/Students-Black-Friday-Discount_11.30.24.mp4", postUrl: "https://www.instagram.com/p/DDAM0ZNCvo2/" },
    ],
  },
  {
    event: "IBC 2024",
    reels: [
      { title: "Premiere Pro AI: Emoji Reactions", sub: "@adobevideo · 2K likes · Sep 17, 2024", plays: "1.5M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/Emoji-Reactions-to-Premiere-Pro-AI-Features_9.17.24.mp4", postUrl: "https://www.instagram.com/p/DAB_Fb0BUWZ/" },
      { title: "IBC Premiere Pro Release (Customer Interviews)", sub: "@adobevideo · 724 likes · Sep 17, 2024", plays: "570.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/Premiere-Pro-Real-Life-Features_9.17.24.mp4", postUrl: "https://www.instagram.com/p/DACI4I7O8GK/" },
      { title: "IBC 2024 Event Recap", sub: "@adobevideo · 843 likes · Sep 18, 2024", plays: "684.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/IBC-2024/IBC-Event-Coverage-Recap_9.18.24.mp4", postUrl: "https://www.instagram.com/p/DAEf4XeN5HT/" },
    ],
  },
  {
    event: "MAX Miami 2024",
    reels: [
      { title: "Project Watercolor Master: Adobe Researcher Sneaks Interview", sub: "@adobe · 1.8K likes · Oct 9, 2024", plays: "1M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Watercolor-Master-Sneaks-Interview_10.9.24.mp4", postUrl: "https://www.instagram.com/p/DA6zD2MA7Jh/" },
      { title: "Project Type Lab: Adobe Researcher Sneaks Interview", sub: "@adobe · 415 likes · Oct 10, 2024", plays: "111.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Project-Type-Lab-Sneaks-Interview_10.10.24.mp4", postUrl: "https://www.instagram.com/p/DA9EA1Mh0uv/" },
      { title: "Animations & Presets: Adobe Researcher Sneaks Interview", sub: "@adobe · 381 likes · Oct 11, 2024", plays: "51.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Animations-Presets-Sneaks-Interview_10.11.24.mp4", postUrl: "https://www.instagram.com/p/DA_f8ShPIDZ/" },
      { title: "Adobe MAX 2025: In-Office MAX Trivia", sub: "@adobe · 917 likes · Oct 11, 2024", plays: "143K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/In-Office-Event-Trivia_10.11.24.mp4", postUrl: "https://www.instagram.com/p/DA_xlkkJYTb/" },
      { title: "Adobe MAX Day 1 Vibe", sub: "@adobe · 897 likes · Oct 15, 2024", plays: "183.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Grabbing-the-Vibe-of-Adobe-MAX-Day-1_10.15.24.mp4", postUrl: "https://www.instagram.com/p/DBKMzc2v1M5/" },
      { title: "Interactive Event Activation Coverage", sub: "@adobecreativecloud · 586 likes · Oct 17, 2024", plays: "57.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Interactive-Event-Activation-Coverage_10.17.24.mp4", postUrl: "https://www.instagram.com/p/DBOzrP1IsyY/" },
      { title: "Event Recap Reactions: Sneaks in One Emoji", sub: "@adobe · 683 likes · Oct 17, 2024", plays: "47.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Reaction-to-SNEAKS-in-One-Emoji_10.17.24.mp4", postUrl: "https://www.instagram.com/p/DBPd7jKvT9p/" },
      { title: "Defining a Creative Video Interview Collage", sub: "@adobecreativecloud · 446 likes · Oct 18, 2024", plays: "0", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Defining-a-Creative-Video-Interview-Collage_10.18.24.mp4", postUrl: "https://www.instagram.com/p/DBSAnTctwG3/" },
      { title: "Photoshop Feature Demo", sub: "@photoshop · 1.1K likes · Nov 4, 2024", plays: "82.6K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Photoshop-Interview-Demo_11.4.24.mp4", postUrl: "https://www.instagram.com/p/DB9foJNJh8L/" },
      { title: "Premiere Pro Demo", sub: "@adobevideo · 335 likes · Nov 13, 2024", plays: "233.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/MAX-Miami-2024/Premiere-Pro-Interview-Demo_11.13.24.mp4", postUrl: "https://www.instagram.com/p/DCUlhpMAWvB/" },
      { title: "Adobe x Gatorade Collaboration @AdobeMAX", sub: "@adobe · 544 likes · Jan 8, 2025", plays: "52.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-Miami-2024/Gatorade-Activation-Partnership-Video_1.8.25.mp4", postUrl: "https://www.instagram.com/p/DElERFPtRwq/" },
    ],
  },
  {
    event: "NAB 2024",
    reels: [
      { title: "NAB ’24: Emoji Reaction Interviews", sub: "@adobevideo · 1.9K likes · Apr 16, 2024", plays: "350.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Emoji-Reaction-Interviews_4.16.24.mp4", postUrl: "https://www.instagram.com/p/C51y-zEKwAr/" },
      { title: "NAB ’24: Premiere Pro AI Announcement Reactions", sub: "@adobevideo · 4.7K likes · Apr 18, 2024", plays: "1.4M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Premiere-Pro-AI-Feature-Interviews_4.18.24.mp4", postUrl: "https://www.instagram.com/p/C56vDmUBrJI/" },
      { title: "NAB ’24: Premiere Enhanced Speech Live Test", sub: "@adobevideo · 163 likes · Apr 22, 2024", plays: "12.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Audio-Enhancements-Real-Time-Testing_4.22.24.mp4", postUrl: "https://www.instagram.com/p/C6E43DDsUfP/" },
      { title: "NAB ’24: Day-in-the-Life Recap", sub: "@adobevideo · 160 likes · Apr 23, 2024", plays: "11.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/NAB-2024/NAB-Day-in-the-Life-Event-Recap_4.23.24.mp4", postUrl: "https://www.instagram.com/p/C6HqT-KLF9R/" },
    ],
  },
  {
    event: "Upworthy",
    reels: [
      { title: "TacoBell x Upworthy Feature", sub: "@upworthy · 6.6K likes · Dec 4, 2024", plays: "425.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2024/Upworthy/Upworthy_12.4.24.mp4", postUrl: "https://www.instagram.com/p/DDKtoQgSz8q/" },
    ],
  },
  {
    event: "Adobe Summit 2025",
    reels: [
      { title: "Adobe Summit ’25: Coca-Cola Activation", sub: "@adobe · 1.5K likes · Mar 20, 2025", plays: "350.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Coca-Cola-Activation-Interview_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHZsBK7qAht/" },
      { title: "Over & Under AI Enterprise Activity", sub: "@adobe · 1.4K likes · Mar 20, 2025", plays: "711.8K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Over-Under-AI-Enterprise-Activity_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHbh4advyRR/" },
      { title: "Summit ’25: Acrobat Escape Room", sub: "@adobeacrobat · 7K likes · Mar 20, 2025", plays: "2.6M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Acrobat-Escape-Room-Activity_3.20.25.mp4", postUrl: "https://www.instagram.com/p/DHb0O45vPtj/" },
      { title: "“Describe Your Job” Interviews", sub: "@adobe · 318 likes · Mar 21, 2025", plays: "72.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Describe-Your-Job-Interview_3.21.25.mp4", postUrl: "https://www.instagram.com/p/DHef1x_M1uJ/" },
      { title: "Summit ’25: Coolest Job @Adobe S1", sub: "@adobelife · 684 likes · Mar 25, 2025", plays: "28.8K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Talent-Marketing-Best-Job_3.25.25.mp4", postUrl: "https://www.instagram.com/p/DHor6j0vyYS/" },
      { title: "Summit ’25: Sneaks Emoji Reactions", sub: "@adobe · 291 likes · Mar 26, 2025", plays: "23.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Summit-Reactions-Recap_3.26.25.mp4", postUrl: "https://www.instagram.com/p/DHq_NIfo-wC/" },
      { title: "Summit ’25: Hosted Event Recap", sub: "@adobe · 417 likes · Mar 28, 2025", plays: "72K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Adobe-Summit-Event-Recap_3.28.25.mp4", postUrl: "https://www.instagram.com/p/DHwsrpri58C/" },
      { title: "Summit ’25: Ken Jeong Interview", sub: "@adobe · 249 likes · Mar 31, 2025", plays: "66K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Celebrity-Interview-Game_3.31.25.mp4", postUrl: "https://www.instagram.com/p/DH4N4rztmXU/" },
      { title: "Summit ’25: Escalator ‘Hot’ Takes", sub: "@adobe · 245 likes · Apr 2, 2025", plays: "51K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/Adobe-Summit-2025/Summit-Hot-Takes_4.2.25.mp4", postUrl: "https://www.instagram.com/p/DH9hfTmBvr-/" },
    ],
  },
  {
    event: "MAX 2025 LA",
    reels: [
      { title: "Acrobat Booth", sub: "@adobeacrobat · 1.3K likes · Oct 31, 2025", plays: "1.6M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Acrobat-Booth_10.31.25.mp4", postUrl: "https://www.instagram.com/p/DQe3K4Zjpv9/" },
      { title: "Acrobat", sub: "@adobeacrobat · 257 likes · Nov 7, 2025", plays: "30.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Acrobat_11.7.25.mp4", postUrl: "https://www.instagram.com/p/DQxFwiPDDxp/" },
      { title: "James Gunn", sub: "@adobe · 4.8K likes · Nov 13, 2025", plays: "705.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/James-Gunn_11.13.25.mp4", postUrl: "https://www.instagram.com/p/DRAp2luAU89/" },
      { title: "“Coolest Job” Series", sub: "@adobelife · 30.5K likes · Nov 14, 2025", plays: "747.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Coolest-Job_11.14.25.mp4", postUrl: "https://www.instagram.com/p/DRC8V6JAkO1/" },
      { title: "Kelley O'Hara", sub: "@adobe · 12.7K likes · Nov 17, 2025", plays: "366.7K", role: "In-house production — produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Kelley-Ohara_11.17.25.mp4", postUrl: "https://www.instagram.com/p/DRLSGTLgiZS/" },
      { title: "Mark Rober", sub: "@adobe · 11.3K likes · Nov 19, 2025", plays: "2.2M", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Mark-Rober_11.19.25.mp4", postUrl: "https://www.instagram.com/p/DRN6VRIjVhq/" },
      { title: "Jessica Williams", sub: "@adobe · 6.8K likes · Nov 20, 2025", plays: "264.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Jessica-Williams_11.20.25.mp4", postUrl: "https://www.instagram.com/p/DRQdSOoDjDv/" },
      { title: "Navin", sub: "@adobe · 201 likes · Feb 13, 2026", plays: "85.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/MAX-2025-LA/Navin_2.13.26.mp4", postUrl: "https://www.instagram.com/p/DUtyVGskjGb/" },
      { title: "Firefly Coolest Job: Sarah", sub: "@adobe · 198 likes · Feb 20, 2026", plays: "35.7K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/MAX-2025-LA/Firefly-Coolest-Job-Deep-Dives-Sarah_2.20.26.mp4", postUrl: "https://www.instagram.com/p/DU9ZnA-D_Xu/" },
    ],
  },
  {
    event: "MAX London 2025",
    reels: [
      { title: "MAX London Recap", sub: "@adobe · 690 likes · Apr 26, 2025", plays: "58.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/MAX-London-Event-Recap_4.26.25.mp4", postUrl: "https://www.instagram.com/p/DI7IQhWM2L3/" },
      { title: "Illustrator Castle Game", sub: "@adobe · 188 likes · Apr 28, 2025", plays: "18.3K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Castle-Illustrator-Game_4.28.25.mp4", postUrl: "https://www.instagram.com/p/DJAQvZFp_Tl/" },
      { title: "Fonts Creator Game", sub: "@adobe · 1.4K likes · Apr 28, 2025", plays: "425K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Fonts-Creator-Game_4.28.25.mp4", postUrl: "https://www.instagram.com/p/DJAQxdstxfx/" },
      { title: "Firefly Explainer", sub: "@adobefirefly · 278 likes · Apr 29, 2025", plays: "24K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-London-2025/Firefly-Informational_4.29.25.mp4", postUrl: "https://www.instagram.com/p/DJC2KUPPwh3/" },
    ],
  },
  {
    event: "NAB 2025",
    reels: [
      { title: "Premiere Pro 2025 Releases", sub: "@adobevideo · 951 likes · Apr 16, 2025", plays: "839.7K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/Premiere-Pro-Releases-2025-Interviews_4.16.25.mp4", postUrl: "https://www.instagram.com/p/DIhgGMSs2jJ/" },
      { title: "Generative Extend Demo", sub: "@adobevideo · 289 likes · Apr 17, 2025", plays: "84.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/Generative-Extend-Activity_4.17.25.mp4", postUrl: "https://www.instagram.com/p/DIjjpFOMwm2/" },
      { title: "NAB 2025 Event Coverage", sub: "@adobevideo · 155 likes · Apr 17, 2025", plays: "39.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/NAB-2025/NAB-General-Event-Coverage-Interviews_4.17.25.mp4", postUrl: "https://www.instagram.com/p/DIkB_V8STy1/" },
    ],
  },
  {
    event: "Cannes",
    reels: [
      { title: "Cannes Lions Firefly Feature", sub: "@adobefirefly · 243 likes · Jun 26, 2026", plays: "27.9K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Cannes/Cannes-Produced-but-not-Hosted_6.26.26.mp4", postUrl: "https://www.instagram.com/p/DaEAIkyDrdo/" },
    ],
  },
  {
    event: "Evergreen Producing",
    reels: [
      { title: "Dave Employee Comms Interview", sub: "@adobelife · 26K likes · Aug 18, 2025", plays: "1.9M", role: "In-house production — produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Dave-Werner_8.18.25.mp4", postUrl: "https://www.instagram.com/p/DNgTb3hthgJ/" },
      { title: "Bowen Employee Comms Interview", sub: "@adobelife · 2.5K likes · Aug 19, 2025", plays: "233.9K", role: "In-house production — produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Produced-and-Storyboarded-Bowen_8.19.25.mp4", postUrl: "https://www.instagram.com/p/DNixXhgNCbp/" },
      { title: "Mansa Employee Comms Interview", sub: "@adobelife · 6.5K likes · Aug 20, 2025", plays: "809.5K", role: "In-house production — produced & creatively directed", mp4: "~/Downloads/Claude/miles-portfolio-reels/2025/MAX-2025-LA/Mansa_8.20.25.mp4", postUrl: "https://www.instagram.com/p/DNlh970un2W/" },
      { title: "Russell", sub: "@adobe · 2.8K likes · May 4, 2026", plays: "143.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Russell_5.4.26.mp4", postUrl: "https://www.instagram.com/p/DX7hTuSErBK/" },
      { title: "Artist Spotlight: Aaron Gonzalez", sub: "@adobe · 268 likes · May 5, 2026", plays: "16.5K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Artist-Spotlight-Aaron-Gonzalez_5.5.26.mp4", postUrl: "https://www.instagram.com/p/DX9u5N4gPbd/" },
      { title: "Be You: Em Siegel", sub: "@adobe · 337 likes · May 11, 2026", plays: "0", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Be-You-Em-Siegel_5.11.26.mp4", postUrl: "https://www.instagram.com/p/DYNfjdwkYSU/" },
      { title: "Coolest Job: Eric", sub: "@adobe · 254 likes · May 14, 2026", plays: "17.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Eric-Coolest-Job_5.14.26.mp4", postUrl: "https://www.instagram.com/p/DYU72ovgswY/" },
      { title: "Coolest Job: Tongyu", sub: "@adobe · 230 likes · May 15, 2026", plays: "18.1K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Tongyu-Coolest-Job_5.15.26.mp4", postUrl: "https://www.instagram.com/p/DYX7HIrkqyB/" },
      { title: "Brand Intelligence B2B Interview", sub: "@adobe · 277 likes · May 18, 2026", plays: "19.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/B2B-Interview-Brand-Intelligence_5.18.26.mp4", postUrl: "https://www.instagram.com/p/DYfgGfajprE/" },
      { title: "Be You: Imran", sub: "@adobe · 449 likes · May 27, 2026", plays: "28.4K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/Be-You-Imran_5.27.26.mp4", postUrl: "https://www.instagram.com/p/DY2y6jbCesw/" },
      { title: "San Jose Semaphore", sub: "@adobe · 3K likes · Jun 18, 2026", plays: "90.6K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/San-Jose-Semaphore_6.18.26.mp4", postUrl: "https://www.instagram.com/p/DZvKdPzFG65/" },
      { title: "Summit 2026 Recap", sub: "@adobe · 202 likes · Apr 30, 2026", plays: "22.2K", mp4: "~/Downloads/Claude/miles-portfolio-reels/2026/Evergreen-Producing/SUMMIT-2026_4.30.26.mp4", postUrl: "https://www.instagram.com/p/DXw69j_E2U3/" },
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
  "MAX Miami 2024": "Events", "MAX 2025 LA": "Events", "MAX London 2025": "Events",
  "Adobe Summit 2025": "Events", "NAB 2024": "Events", "NAB 2025": "Events",
  "IBC 2024": "Events", "Cannes": "Events",
  "Evergreen Producing": "Evergreen", "Employee & Always On": "Evergreen", "Upworthy": "Evergreen", "UC": "Evergreen",
  "Miles Music Media": "Off The Clock", "Miles.Spearman": "Off The Clock",
};
const LIB_ORDER = ["Events", "Evergreen", "Off The Clock"];

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
const eventStats = portfolio.map((ev, i) => {
  const top = [...ev.reels].sort((a, b) => playsNum(b.plays) - playsNum(a.plays))[0];
  return {
    ...ev, idx: i,
    cover: thumbOf(top), // playlist art = frame from its top-played reel
    role: EVENT_ROLES[ev.event] || "",
    totalPlays: ev.reels.reduce((s, r) => s + playsNum(r.plays), 0),
  };
});
const TOTAL_REELS = portfolio.reduce((s, ev) => s + ev.reels.length, 0);
const TOTAL_PLAYS = eventStats.reduce((s, ev) => s + ev.totalPlays, 0);
// Likes live inside each reel's sub string ("· 1.8K likes ·") — derived, never typed
const likesNum = (sub) => { const m = sub.match(/([\d.]+K|[\d.]+M|\d+) likes/i); return m ? playsNum(m[1]) : 0; };
const TOTAL_LIKES = portfolio.reduce((s, ev) => s + ev.reels.reduce((a, r) => a + likesNum(r.sub), 0), 0);

// Opening wall: top Adobe reels + MAX London + the personal side (musician line earns its backdrop)
const heroReels = (() => {
  const flat = [];
  portfolio.forEach((ev, e) => ev.reels.forEach((r, i) => flat.push({ ...r, e, r: i, event: ev.event })));
  flat.sort((a, b) => playsNum(b.plays) - playsNum(a.plays));
  const top = flat.slice(0, 12);
  ["Fonts Creator Game", "Behind the Product", "Happy 100th Birthday Miles Davis", "Donna Lee"].forEach(t => {
    const x = flat.find(f => f.title === t);
    if (x && !top.includes(x)) top.push(x);
  });
  return top;
})();

const capabilities = [
  {
    img: "/cards/on-camera-hosting.jpg", imgPos: "50% 27%", title: "On-Camera Hosting & Directing",
    body: "Event activations, brand segments, interviews, and live hosting — comfortable on camera and on a stage.",
    linkUrl: "https://www.instagram.com/reel/DH9hfTmBvr-/", linkLabel: "Watch: Summit Hot Takes →",
  },
  {
    img: "/cards/video-production.jpg", imgPos: "50% 28%", title: "Video Production",
    body: "Shoot, edit, and publish on mobile and DSLR. Same-day for event coverage, full prep for executive shoots.",
    linkUrl: "https://www.instagram.com/reel/DCUlhpMAWvB/", linkLabel: "Watch: Premiere Pro Demo →",
  },
  {
    img: "/cards/content-strategy.jpg", imgPos: "50% 27%", title: "Content Strategy",
    body: "Data-driven concepts backed by social listening and platform analytics — every video starts with a reason to exist.",
    linkUrl: "https://www.instagram.com/reel/DJC2KUPPwh3/", linkLabel: "Watch: Firefly Informational →",
  },
  {
    img: "/cards/directing-coaching.jpg", imgPos: "50% 32%", title: "Directing & On-Camera Coaching",
    body: "I make people who aren't natural on camera look great — writing talking tracks, asking questions multiple ways, pulling the right sound bites whether it's an exec or a professional athlete.",
    linkUrl: "https://www.instagram.com/reel/DA6zD2MA7Jh/", linkLabel: "Watch: Sneaks Interview →",
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
  "On-Camera Hosting & Directing": "Summit ’25: Acrobat Escape Room",     // Adobe Summit 2025 — 2.6M, the one most people know him by
  "Video Production": "MAX London Recap",                                  // MAX London 2025
  "Content Strategy": "Mansa Employee Comms Interview",                    // Evergreen Producing (moved from MAX LA per Miles)
  "Directing & On-Camera Coaching": "Kelley O'Hara",                       // MAX 2025 LA
};
const setList = capabilities.map(c => {
  const idx = reelIndexByTitle(CAPABILITY_REEL_TITLE[c.title]);
  return { ...c, reelIdx: idx, mp4: idx ? portfolio[idx.e].reels[idx.r].mp4 : null };
});

const marqueeItems = ["Adobe MAX", "Adobe MAX London", "Adobe Summit", "NAB Show Las Vegas", "IBC Amsterdam", "NFL", "NWSL", "Taco Bell"];

// "About the Artist" swipe stack — one word at a time, always swiping the same
// direction: the labels come and go, the person stays.
const SWIPE_WORDS = ["Creative", "Producer", "Host", "Director", "Teammate"];
function SwipeWord() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 2200); return () => clearInterval(t); }, []);
  const idx = tick % SWIPE_WORDS.length;
  const prev = (idx + SWIPE_WORDS.length - 1) % SWIPE_WORDS.length;
  return (
    <span style={{ position: "relative", display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
      {tick > 0 && (
        <span key={`out${tick}`} style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", animation: "swipeOut 0.5s cubic-bezier(0.55,0,0.45,1) both" }}>
          {SWIPE_WORDS[prev]}
        </span>
      )}
      <span key={`in${tick}`} style={{ display: "inline-block", whiteSpace: "nowrap", animation: tick > 0 ? "swipeIn 0.5s cubic-bezier(0.55,0,0.45,1) both" : "none" }}>
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
    [String(Math.round(TOTAL_REELS * p)), "videos"],
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
function HeroCard({ reel, i }) {
  const [h, setH] = useState(false);
  const open = () => {
    const work = document.getElementById("work");
    if (work) work.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("ms-play", { detail: { e: reel.e, r: reel.r } }));
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
      <video src={srcOf(reel)} poster={thumbOf(reel)} muted loop playsInline autoPlay preload="metadata"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* per-card veil — lifts on hover so the card spotlights out of the dim */}
      <span style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.55)", opacity: h ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,10,10,0.9))" }} />
      <span style={{ position: "absolute", left: 10, right: 10, bottom: 9, textAlign: "left" }}>
        <span style={{ fontFamily: F, fontSize: 11.5, fontWeight: 700, color: C.white, lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{reel.title}</span>
        <span style={{ display: "block", fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.mint, marginTop: 3 }}>▶ {reel.plays} plays</span>
      </span>
      <span style={{
        position: "absolute", top: "38%", left: "50%", transform: `translate(-50%,-50%) scale(${h ? 1 : 0.6})`,
        width: 44, height: 44, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center",
        justifyContent: "center", opacity: h ? 1 : 0, transition: "all 0.2s", boxShadow: `0 6px 24px ${C.mint}50`,
      }}><IcPlay s={15} /></span>
    </button>
  );
}

// Restored hero row of playing cards (below the stat badges). Shares the
// viewport-pause hook with the opening wall so its videos don't run off-screen.
function HeroRow() {
  const rowRef = useRef(null);
  usePlayWhenVisible(rowRef);
  return (
    <div ref={rowRef} style={{ overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", margin: "0 calc(-1 * clamp(24px, 5vw, 80px))", maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, width: "max-content", padding: "16px clamp(24px, 5vw, 80px)" }}>
        {heroReels.map((reel, i) => <HeroCard key={`row-${reel.postUrl}`} reel={reel} i={i} />)}
      </div>
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
  // Play the wall only while it's on screen — 16 muted videos otherwise burn CPU.
  usePlayWhenVisible(wrapRef);

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
        {heroReels.map((reel, i) => (
          // Parallax layer: rAF writes translate3d here; HeroCard owns hover/tilt
          // on its own element, so the two transforms never fight.
          <div key={reel.postUrl} ref={n => { cardRefs.current[i] = n; }} style={{ flexShrink: 0, willChange: "transform" }}>
            <HeroCard reel={reel} i={i} />
          </div>
        ))}
      </div>
      {/* dim so type owns the frame */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0.55) 100%)", pointerEvents: "none" }} />
      {/* the words */}
      <div style={{ position: "relative", textAlign: "center", padding: "0 24px", pointerEvents: "none" }}>
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
        <span style={{ display: "block", fontSize: 11.5, color: C.gray, marginTop: 2 }}>{ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"} · {fmtPlays(ev.totalPlays)} plays</span>
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
        <a href={reel.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="Open on Instagram"
          style={{ fontFamily: F, fontSize: 12, color: C.gray, textDecoration: "none", opacity: h ? 1 : 0, transition: "opacity 0.15s" }}
          onMouseEnter={e => e.target.style.color = C.mint} onMouseLeave={e => e.target.style.color = C.gray}
        >↗</a>
        <span style={{ fontFamily: F, fontSize: 13, color: active ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>{reel.plays}</span>
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
          <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, margin: 0 }}>Pick a reel — {TOTAL_REELS} in the library</p>
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
          >Open on Instagram ↗</a>
        )}
      </div>
    </div>
  );
}

function WorkPlayer() {
  const [libIdx, setLibIdx] = useState(() => Math.max(0, portfolio.findIndex(e => e.event === "MAX 2025 LA")));
  const [track, setTrack] = useState(null); // { e, r } indices into portfolio
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
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
                  <p style={{ fontFamily: F, fontSize: 12.5, color: C.gray, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{handlesOf(viewing)} · {viewing.reels.length} {viewing.reels.length === 1 ? "reel" : "reels"} · {fmtPlays(viewing.totalPlays)} plays</p>
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
                {viewing.reels.map((r, i) => (
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

// ===== WHAT I DO — "The Set List" (concept C) =====
// A Spotify-style numbered track list that rhymes with the Work player below.
// Accordion: one row open at a time (first open by default). Only the OPEN row
// mounts a <video> (one playing video in the section, max) — collapsed rows show
// their /cards/*.jpg still. Clicking the link label deep-links into the Work
// player via ms-play. All capability copy is verbatim.
const num2 = (n) => String(n + 1).padStart(2, "0");

function SetListRow({ cap, i, open, onToggle }) {
  const [h, setH] = useState(false);
  const playInWork = (e) => {
    e.stopPropagation();
    if (!cap.reelIdx) return; // no mapped reel: fall through to the IG link
    e.preventDefault();
    const work = document.getElementById("work");
    if (work) work.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("ms-play", { detail: cap.reelIdx }));
  };
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      {/* Collapsed row: number · thumb · title · action */}
      <div role="button" tabIndex={0} aria-expanded={open}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          display: "grid", gridTemplateColumns: "34px 48px minmax(0,1fr) auto", gap: 14, alignItems: "center",
          padding: "14px 16px", cursor: "pointer",
          background: open ? "rgba(30,215,96,0.06)" : h ? "rgba(255,255,255,0.05)" : "transparent",
          transition: "background 0.2s",
        }}>
        <span style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: open ? C.mint : C.gray, fontVariantNumeric: "tabular-nums", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {open ? <EqBars /> : num2(i)}
        </span>
        <span style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#111" }}>
          <img src={cap.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: cap.imgPos, display: "block" }} onError={e => { e.currentTarget.style.display = "none"; }} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: F, fontSize: 15.5, fontWeight: 700, color: open ? C.mint : C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cap.title}</span>
        </span>
        {/* Right action: link label (wide) collapses to a play/expand glyph on narrow via CSS */}
        <span className="setlist-action" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="setlist-linklabel" onClick={playInWork} role="link" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playInWork(e); } }}
            style={{ fontFamily: F, fontSize: 12.5, fontWeight: 600, color: h || open ? C.mint : C.gray, whiteSpace: "nowrap", transition: "color 0.2s" }}>{cap.linkLabel}</span>
          <span aria-hidden="true" style={{ display: "inline-flex", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s", color: open ? C.mint : C.gray }}>
            <IcPlay s={11} c={open ? C.mint : C.gray} />
          </span>
        </span>
      </div>
      {/* Expanded panel: grid-rows 0fr->1fr (CSS-only height animation, no JS measure) */}
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="setlist-panel" style={{ display: "flex", gap: 20, padding: open ? "6px 16px 22px 84px" : "0 16px 0 84px", alignItems: "flex-start", transition: "padding 0.35s ease" }}>
            {/* Only the OPEN row mounts the video element (one playing video max) */}
            {open && cap.mp4 && (
              <video src={srcOf(cap)} poster={thumbOf(cap)} muted loop playsInline autoPlay preload="metadata"
                className="setlist-video"
                style={{ width: 150, aspectRatio: "9 / 16", objectFit: "cover", borderRadius: 12, background: "#000", flexShrink: 0, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.65, margin: "0 0 16px" }}>{cap.body}</p>
              <button onClick={playInWork}
                style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.bg, background: C.mint, border: "none", padding: "10px 22px", borderRadius: 100, cursor: "pointer", boxShadow: `0 6px 24px ${C.mint}35`, transition: "transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>{cap.linkLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetList() {
  const [openIdx, setOpenIdx] = useState(0); // first row open by default
  const wrapRef = useRef(null);
  // Pause the one open-row video when the section scrolls off-screen.
  usePlayWhenVisible(wrapRef);
  return (
    <div ref={wrapRef} style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", background: "#0D0D0D" }}>
      {setList.map((cap, i) => (
        <SetListRow key={cap.title} cap={cap} i={i} open={openIdx === i}
          onToggle={() => setOpenIdx(cur => cur === i ? -1 : i)} />
      ))}
    </div>
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
        <span style={{ position: "absolute", right: 10, bottom: 10, width: 42, height: 42, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", opacity: h ? 1 : 0, transform: h ? "translateY(0)" : "translateY(6px)", transition: "all 0.25s", boxShadow: `0 6px 24px ${C.mint}50` }}><IcPlay s={16} /></span>
      </span>
      <span style={{ display: "block", marginTop: 12, fontFamily: F, fontSize: 14.5, fontWeight: 700, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event}</span>
      <span style={{ display: "block", marginTop: 4, fontFamily: F, fontSize: 11.5, color: C.gray }}>{ev.reels.length} {ev.reels.length === 1 ? "reel" : "reels"} · {fmtPlays(ev.totalPlays)} plays</span>
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
              <button key={glyph} onClick={() => scroll(d)} aria-label={`Scroll ${title} ${d < 0 ? "left" : "right"}`}
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

function PlaylistShelf() {
  return (
    <section style={{ padding: "36px 0 12px clamp(24px, 5vw, 80px)" }}>
      {LIB_ORDER.map(lib => (
        <ShelfRow key={lib} title={`${lib} Library`} items={eventStats.filter(ev => LIBRARY_OF[ev.event] === lib)} />
      ))}
    </section>
  );
}

// ===== WHAT I DO — cards play the reel that backs each capability and
// deep-link into that topic's playlist in the Work player (ms-play). =====
function WhatIDoCards() {
  const gridRef = useRef(null);
  usePlayWhenVisible(gridRef); // reels only play while the section is on screen
  return (
    <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
      {setList.map((c, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <a href="#work"
            onClick={() => { if (c.reelIdx) window.dispatchEvent(new CustomEvent("ms-play", { detail: c.reelIdx })); }}
            style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <div style={{
              background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderRadius: 16, padding: 28,
              transition: "all 0.3s", display: "flex", flexDirection: "column", gap: 12,
              height: "100%", cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(30,215,96,0.2)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(30,215,96,0.06)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ height: 150, borderRadius: 12, overflow: "hidden", background: "#111" }}>
                {c.mp4
                  ? <video src={srcOf(c)} poster={c.img} muted loop playsInline preload="metadata"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.imgPos, display: "block" }}
                      onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />
                  : <img src={c.img} alt={c.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.imgPos, display: "block" }} onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />}
              </div>
              <h4 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, margin: 0 }}>{c.title}</h4>
              <p style={{ fontFamily: F, fontSize: 13, color: C.gray, lineHeight: 1.6, margin: 0, flex: 1 }}>{c.body}</p>
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, marginTop: 8 }}>{c.linkLabel}</span>
            </div>
          </a>
        </FadeIn>
      ))}
    </div>
  );
}

// ===== NAV =====
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 clamp(24px, 5vw, 80px)", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>
      <a href="#" style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, letterSpacing: -0.5, textDecoration: "none" }}>Miles Spearman</a>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {[["Work", "#work"], ["What I Do", "#services"], ["About", "#about"]].map(([label, href]) => (
          <a key={label} href={href} style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: C.gray, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.white}
            onMouseLeave={e => e.target.style.color = C.gray}
          >{label}</a>
        ))}
        <a href="https://www.linkedin.com/in/miles-spearman/" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.bg, background: C.mint, padding: "8px 20px", borderRadius: 100, textDecoration: "none", transition: "opacity 0.2s" }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >Connect</a>
      </div>
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
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes eqbar { 0%, 100% { height: 4px; } 50% { height: 13px; } }
        @keyframes cuebounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes swipeOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-110%); opacity: 0; } }
        @keyframes swipeIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 900px) { .wall-card:nth-child(n+9) { display: none; } }
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
          .sp-bar { grid-template-columns: minmax(0,1fr) auto !important; }
          .sp-progress { width: 100% !important; }
          .sp-ig-link { display: none; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.darkGray}; border-radius: 3px; }
        a:focus-visible { outline: 2px solid ${C.mint}; outline-offset: 2px; }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", color: C.white }}>
        {/* Film grain */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <Nav />

        {/* ===== OPENING WALL ===== */}
        <OpeningWall />

        {/* ===== WHAT I'M WORKING ON NOW ===== */}
        <section style={{ padding: "72px clamp(24px, 5vw, 80px) 8px" }}>
          <FadeIn>
            <div style={{ maxWidth: 860, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.mint}`, borderRadius: 14, padding: "26px 30px" }}>
              <h3 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, color: C.white, margin: "0 0 10px" }}>What I'm Working On Now</h3>
              <p style={{ fontFamily: F, fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, margin: 0 }}>
                At Adobe, I lead creator and community social for the Brand team. Right now that means running the influencer-hosted sizzle format I built for Adobe MAX and Summit, and owning Creator Camp end to end, giving product marketing a direct window into how real pros use Adobe's tools.
              </p>
              <span style={{ fontFamily: F, display: "block", marginTop: 14, fontSize: 12, color: C.gray }}>Last updated: July 2026</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <a href="https://www.linkedin.com/in/miles-spearman/" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: C.bg, background: C.mint, padding: "14px 36px", borderRadius: 100, textDecoration: "none", display: "inline-block", marginTop: 24, transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 40px ${C.mint}20` }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.background = "#0A66C2"; e.target.style.color = "#fff"; e.target.style.boxShadow = "0 0 60px rgba(10,102,194,0.45)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.background = C.mint; e.target.style.color = C.bg; e.target.style.boxShadow = `0 0 40px ${C.mint}20`; }}
            >View My LinkedIn →</a>
          </FadeIn>
        </section>

        {/* ===== PLAYLIST SHELF ===== */}
        <PlaylistShelf />

        {/* ===== HERO ROW — the playing cards, bridging the shelves into Work ===== */}
        <section style={{ padding: "12px clamp(24px, 5vw, 80px) 28px" }}>
          <FadeIn>
            <HeroRow />
          </FadeIn>
        </section>

        {/* ===== WORK — 3 visual grid buckets ===== */}
        <section id="work" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>Selected Work</h2>
            <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 32px 0", maxWidth: 500 }}>Real content from real campaigns — shot, edited, and published by me. {TOTAL_REELS} reels · {fmtPlays(TOTAL_PLAYS)} plays. Pick an event, press play.</p>
          </FadeIn>

          <WorkPlayer />

          <div style={{ marginTop: 64 }}><Marquee /></div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" style={{ padding: "60px clamp(24px, 5vw, 80px) 80px" }}>
          <FadeIn>
            <div style={{
              maxWidth: 720, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderRadius: 24, padding: "48px 40px",
            }}>
              <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(30px, 4vw, 54px)", lineHeight: 1.05, letterSpacing: -1, color: C.white, margin: "0 0 20px" }}>
                About the <SwipeWord /><span style={{ color: C.mint }}>.</span>
              </h2>
              <PlaysCounter />
              <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                I'm a social producer and content creator at Adobe Brand in San Francisco — I direct on-location video at events like Adobe MAX and Summit, coach executives on camera, and produce talent interviews end-to-end (James Gunn, Ken Jeong, Mark Rober). I also host, present, and work in front of the camera. I studied Marketing and Music at UC — the music background shows up in how I think about rhythm, pacing, and storytelling. And yeah, I'm also a{" "}
                <a href="#work"
                  onClick={() => { const e = portfolio.findIndex(ev => ev.event === "Miles Music Media"); if (e !== -1) window.dispatchEvent(new CustomEvent("ms-play", { detail: { e, r: 0 } })); }}
                  style={{ color: C.mint, textDecoration: "none", borderBottom: `1px solid ${C.mint}55`, cursor: "pointer" }}
                  onMouseEnter={ev => ev.target.style.borderBottomColor = C.mint}
                  onMouseLeave={ev => ev.target.style.borderBottomColor = `${C.mint}55`}
                >professional trumpet player</a> in San Francisco.
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
            </div>
          </FadeIn>
        </section>

        {/* ===== WHAT I DO — clickable cards ===== */}
        <section id="services" style={{ padding: "80px clamp(24px, 5vw, 80px) 60px" }}>
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Services</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 48px 0", letterSpacing: -0.5 }}>What I Do</h2>
          </FadeIn>
          <WhatIDoCards />
        </section>

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
            <a href="https://www.linkedin.com/in/miles-spearman/" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.bg, background: C.mint, padding: "16px 48px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 50px ${C.mint}30` }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.background = "#0A66C2"; e.target.style.color = "#fff"; e.target.style.boxShadow = "0 0 70px rgba(10,102,194,0.5)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.background = C.mint; e.target.style.color = C.bg; e.target.style.boxShadow = `0 0 50px ${C.mint}30`; }}
            >Connect on LinkedIn →</a>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p style={{ fontFamily: F, fontSize: 13, margin: "28px 0 0" }}>
              <a href="https://www.instagram.com/milesmusicmedia" target="_blank" rel="noopener noreferrer"
                style={{ color: C.gray, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.mint}
                onMouseLeave={e => e.target.style.color = C.gray}
              >Off the clock: 🎷 @milesmusicmedia — my jazz content ↗</a>
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
