import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0A0A0A", mint: "#5DE8C5", pink: "#FF6B9D",
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

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }}>{children}</div>;
}

// IG embed component
function IGEmbed({ shortcode, title, size = "normal" }) {
  const h = size === "large" ? 520 : 420;
  const w = size === "large" ? "100%" : "100%";
  return (
    <iframe
      src={`https://www.instagram.com/reel/${shortcode}/embed/captioned/`}
      style={{ width: w, height: h, border: "none", background: "#111", borderRadius: 12 }}
      loading="lazy"
      allowTransparency="true"
      title={title}
    />
  );
}

// TikTok embed
function TTEmbed({ videoId, title }) {
  return (
    <iframe
      src={`https://www.tiktok.com/embed/v2/${videoId}`}
      style={{ width: "100%", height: 420, border: "none", background: "#111", borderRadius: 12 }}
      loading="lazy"
      title={title}
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

// Smart embed - auto picks platform
function Embed({ url, title, size }) {
  if (url.includes("tiktok")) {
    const m = url.match(/video\/(\d+)/);
    if (m) return <TTEmbed videoId={m[1]} title={title} />;
  }
  const m = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (m) return <IGEmbed shortcode={m[1]} title={title} size={size} />;
  return null;
}

// Video grid item
function GridItem({ video, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay} style={{ height: "100%" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 14, overflow: "hidden",
          border: `1px solid ${hovered ? "rgba(93,232,197,0.2)" : C.border}`,
          transition: "border-color 0.3s, transform 0.3s",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          background: "#111",
          display: "flex", flexDirection: "column",
        }}
      >
        <Embed url={video.url} title={video.title} />
        <div style={{ padding: "12px 14px" }}>
          <p style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.white, margin: 0, lineHeight: 1.3 }}>{video.title}</p>
          {video.sub && <p style={{ fontFamily: F, fontSize: 11, color: C.gray, margin: "4px 0 0", lineHeight: 1.3 }}>{video.sub}</p>}
        </div>
      </div>
    </FadeIn>
  );
}

// ===== DATA =====

const portfolioBuckets = [
  {
    id: "hosting",
    title: "Hosting & Engagements",
    subtitle: "On the ground at global events — directing, hosting, and delivering same-day content.",
    tag: "Events",
    preview: [
      { title: "Firefly Informational", sub: "MAX London", url: "https://www.instagram.com/reel/DJC2KUPPwh3/" },
      { title: "Grabbing the Vibe — MAX Day 1", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBKMzc2v1M5/" },
      { title: "Fonts Creator Game", sub: "MAX London", url: "https://www.instagram.com/reel/DJAQxdstxfx/" },
      { title: "SNEAKS Emoji Reactions", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBPd7jKvT9p/" },
      { title: "IBC Emoji Reactions", sub: "IBC Amsterdam", url: "https://www.instagram.com/reel/DAB_Fb0BUWZ/" },
      { title: "NAB Emoji Reactions", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/C51y-zEKwAr/" },
    ],
    all: [
      { title: "Firefly Informational", sub: "MAX London", url: "https://www.instagram.com/reel/DJC2KUPPwh3/" },
      { title: "Grabbing the Vibe — MAX Day 1", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBKMzc2v1M5/" },
      { title: "Fonts Creator Game", sub: "MAX London", url: "https://www.instagram.com/reel/DJAQxdstxfx/" },
      { title: "SNEAKS Emoji Reactions", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBPd7jKvT9p/" },
      { title: "IBC Emoji Reactions", sub: "IBC Amsterdam", url: "https://www.instagram.com/reel/DAB_Fb0BUWZ/" },
      { title: "NAB Emoji Reactions", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/C51y-zEKwAr/" },
      { title: "Castle Illustrator Game", sub: "MAX London", url: "https://www.instagram.com/reel/DJAQvZFp_Tl/" },
      { title: "MAX London Event Recap", sub: "MAX London", url: "https://www.instagram.com/reel/DI7IQhWM2L3/" },
      { title: "Interactive Event Activation", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBOzrP1IsyY/" },
      { title: "Defining a Creative — Collage", sub: "MAX Miami", url: "https://www.instagram.com/reel/DBSAnTctwG3/" },
      { title: "Gatorade Activation & Partnership", sub: "MAX Miami", url: "https://www.instagram.com/reel/DElERFPtRwq/" },
      { title: "In Office Event Trivia", sub: "MAX Miami", url: "https://www.instagram.com/reel/DA_xlkkJYTb/" },
      { title: "IBC Event Recap", sub: "IBC Amsterdam", url: "https://www.instagram.com/reel/DAEf4XeN5HT/" },
      { title: "Premiere Pro AI Features", sub: "IBC Amsterdam", url: "https://www.instagram.com/reel/DACI4I7O8GK/" },
      { title: "NAB AI Feature Interviews", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/C56vDmUBrJI/" },
      { title: "NAB Audio Real-Time Testing", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/C6E43DDsUfP/" },
      { title: "NAB Day in the Life Recap", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/C6HqT-KLF9R/" },
      { title: "NAB General Coverage", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/DIkB_V8STy1/" },
      { title: "Premiere Pro 2025 Interviews", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/DIhgGMSs2jJ/" },
      { title: "Generative Extend Activity", sub: "NAB Las Vegas", url: "https://www.instagram.com/reel/DIjjpFOMwm2/" },
    ],
  },
  {
    id: "b2b",
    title: "B2B Conferences",
    subtitle: "Capturing the energy of Adobe's enterprise flagship — hot takes, activations, and executive content.",
    tag: "Adobe Summit",
    preview: [
      { title: "Summit Hot Takes", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DH9hfTmBvr-/" },
      { title: "Celebrity Interview Game", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DH4N4rztmXU/" },
      { title: "Coca Cola Activation", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHZsBK7qAht/" },
      { title: "Summit Reactions Recap", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHq_NIfo-wC/" },
      { title: "Watercolor Master Sneaks", sub: "Pre-Event Interview", url: "https://www.instagram.com/reel/DA6zD2MA7Jh/" },
      { title: "Photoshop Interview Demo", sub: "Product Launch", url: "https://www.instagram.com/reel/DB9foJNJh8L/" },
    ],
    all: [
      { title: "Summit Hot Takes", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DH9hfTmBvr-/" },
      { title: "Celebrity Interview Game", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DH4N4rztmXU/" },
      { title: "Coca Cola Activation", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHZsBK7qAht/" },
      { title: "Summit Reactions Recap", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHq_NIfo-wC/" },
      { title: "Watercolor Master Sneaks", sub: "Pre-Event Interview", url: "https://www.instagram.com/reel/DA6zD2MA7Jh/" },
      { title: "Photoshop Interview Demo", sub: "Product Launch", url: "https://www.instagram.com/reel/DB9foJNJh8L/" },
      { title: "Adobe Summit Event Recap", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHwsrpri58C/" },
      { title: "Best Job — Talent Marketing", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHor6j0vyYS/" },
      { title: "Describe Your Job Interview", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHef1x_M1uJ/" },
      { title: "Acrobat Escape Room", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHb0O45vPtj/" },
      { title: "Over & Under AI Activity", sub: "Adobe Summit", url: "https://www.instagram.com/reel/DHbh4advyRR/" },
      { title: "Premiere Pro Interview Demo", sub: "Product Launch", url: "https://www.instagram.com/reel/DCUlhpMAWvB/" },
      { title: "Firefly Interview Demo", sub: "Product Launch", url: "https://www.instagram.com/reel/C_0rxmZPxif/" },
      { title: "Animations & Presets Sneaks", sub: "Pre-Event Interview", url: "https://www.instagram.com/reel/DA_f8ShPIDZ/" },
      { title: "Project Type Lab Sneaks", sub: "Pre-Event Interview", url: "https://www.instagram.com/reel/DA9EA1Mh0uv/" },
      { title: "Students Black Friday", sub: "Always On", url: "https://www.instagram.com/reel/DDAM0ZNCvo2/" },
    ],
  },
  {
    id: "collabs",
    title: "Collaborations",
    subtitle: "Brand partnerships, creator content, agency work, and university production.",
    tag: "Partnerships & Agency",
    preview: [
      { title: "NFL Kickoff", sub: "NFL", url: "https://www.instagram.com/p/DOPM4FmkpE_/" },
      { title: "NWSL", sub: "NWSL", url: "https://www.instagram.com/reel/DRLSGTLgiZS/" },
      { title: "Taco Bell", sub: "Brand Partnership", url: "https://www.instagram.com/reel/CYkEVhTIoSU/" },
      { title: "Upworthy", sub: "Creator Collab", url: "https://www.instagram.com/reel/DDKtoQgSz8q/" },
      { title: "Beyond the Classroom", sub: "University of Cincinnati", url: "https://www.instagram.com/tv/CfuYwU7J0Zv/" },
      { title: "OTOTO Design", sub: "Branded Agency — TikTok", url: "https://www.tiktok.com/@ototo_design/video/7199760275300486443" },
    ],
    all: [
      { title: "NFL Kickoff", sub: "NFL", url: "https://www.instagram.com/p/DOPM4FmkpE_/" },
      { title: "NWSL", sub: "NWSL", url: "https://www.instagram.com/reel/DRLSGTLgiZS/" },
      { title: "Taco Bell", sub: "Brand Partnership", url: "https://www.instagram.com/reel/CYkEVhTIoSU/" },
      { title: "Upworthy", sub: "Creator Collab", url: "https://www.instagram.com/reel/DDKtoQgSz8q/" },
      { title: "Beyond the Classroom", sub: "University of Cincinnati", url: "https://www.instagram.com/tv/CfuYwU7J0Zv/" },
      { title: "OTOTO Design", sub: "Branded Agency — TikTok", url: "https://www.tiktok.com/@ototo_design/video/7199760275300486443" },
      { title: "Level Up Ep. 1", sub: "University of Cincinnati", url: "https://www.instagram.com/reel/ClOeARAJa3z/" },
      { title: "Level Up Ep. 2", sub: "University of Cincinnati", url: "https://www.instagram.com/reel/ClRTLhOL3vu/" },
      { title: "Classroom Highlights", sub: "University of Cincinnati", url: "https://www.instagram.com/reel/ClTyzSxPtJH/" },
      { title: "KeyNutrients", sub: "Branded Agency — TikTok", url: "https://www.tiktok.com/@key_nutrients/video/7163713049256414506" },
      { title: "Aquafit", sub: "Branded Agency — TikTok", url: "https://www.tiktok.com/@aquafit_official/video/7293681500464090375" },
    ],
  },
];

const capabilities = [
  {
    icon: "🎙", title: "On-Camera Hosting & Presenting",
    body: "Event activations, brand segments, interviews, and live hosting — comfortable on camera and on a stage.",
    linkUrl: "https://www.instagram.com/reel/DH9hfTmBvr-/", linkLabel: "Watch: Summit Hot Takes →",
  },
  {
    icon: "🎬", title: "Video Production",
    body: "Shoot, edit, and publish — mobile and DSLR, same-day turnaround, from product demos to executive interviews.",
    linkUrl: "https://www.instagram.com/reel/DCUlhpMAWvB/", linkLabel: "Watch: Premiere Pro Demo →",
  },
  {
    icon: "📊", title: "Content Strategy",
    body: "Data-driven concepts backed by social listening and platform analytics — every video starts with a reason to exist.",
    linkUrl: "https://www.instagram.com/reel/DJC2KUPPwh3/", linkLabel: "Watch: Firefly Informational →",
  },
  {
    icon: "🎯", title: "Directing & On-Camera Coaching",
    body: "I make people who aren't natural on camera look great — writing talking tracks, asking questions multiple ways, pulling the right sound bites whether it's an exec or a professional athlete.",
    linkUrl: "https://www.instagram.com/reel/DA6zD2MA7Jh/", linkLabel: "Watch: Sneaks Interview →",
  },
];

const skills = ["Video Production", "On-Camera Hosting", "Executive Interviews", "Event Coverage", "Short-Form Content", "TikTok Strategy", "Instagram Reels", "YouTube Shorts", "Premiere Pro", "After Effects", "Brandwatch", "Sprinklr", "Creative Briefs", "Influencer Management", "DSLR + Mobile"];
const marqueeItems = ["Adobe MAX", "Adobe MAX London", "Adobe Summit", "NAB Show Las Vegas", "IBC Amsterdam", "NFL", "NWSL", "Taco Bell"];
const statBadges = [
  { number: "50+", label: "videos/month", detail: "across 8 Adobe priority channels" },
  { number: "7", label: "global events", detail: "MAX, MAX London, Summit, IBC, NAB & more" },
  { number: "250+", label: "videos in 4 months", detail: "script to publish at Branded agency" },
];

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

// ===== PORTFOLIO BUCKET =====
function PortfolioBucket({ bucket }) {
  const [expanded, setExpanded] = useState(false);
  const videos = expanded ? bucket.all : bucket.preview;
  const extraCount = bucket.all.length - bucket.preview.length;

  return (
    <FadeIn>
      <div style={{ marginBottom: 80 }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 8 }}>{bucket.tag}</span>
          <h3 style={{ fontFamily: F, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: C.white, margin: 0, letterSpacing: -0.5 }}>{bucket.title}</h3>
          <p style={{ fontFamily: F, fontSize: 14, color: C.gray, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 550 }}>{bucket.subtitle}</p>
        </div>

        {/* Video grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {videos.map((v, i) => (
            <GridItem key={`${bucket.id}-${i}`} video={v} delay={Math.min(i * 0.05, 0.3)} />
          ))}
        </div>

        {extraCount > 0 && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              fontFamily: F, fontSize: 13, fontWeight: 600, color: C.mint,
              background: "rgba(93,232,197,0.06)", border: `1px solid rgba(93,232,197,0.15)`,
              padding: "10px 28px", borderRadius: 100, cursor: "pointer", transition: "background 0.2s",
            }}
              onMouseEnter={e => e.target.style.background = "rgba(93,232,197,0.12)"}
              onMouseLeave={e => e.target.style.background = "rgba(93,232,197,0.06)"}
            >
              {expanded ? "Show fewer ↑" : `Show all ${bucket.all.length} pieces ↓`}
            </button>
          </div>
        )}
      </div>
    </FadeIn>
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
        {[["Services", "#services"], ["About", "#about"], ["Work", "#work"]].map(([label, href]) => (
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

        {/* ===== HERO ===== */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px clamp(24px, 5vw, 80px) 60px", position: "relative" }}>
          <div style={{ position: "absolute", top: "12%", right: "5%", width: 500, height: 500, background: `radial-gradient(circle, ${C.mint}06, transparent 70%)`, pointerEvents: "none" }} />
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 20, display: "block" }}>
              Content Creator & Social Producer
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 800, color: C.white, lineHeight: 1.05, margin: "0 0 24px 0", maxWidth: 820, letterSpacing: -1.5 }}>
              The creative behind Adobe's social — from strategy to feed.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontFamily: F, fontSize: "clamp(16px, 1.8vw, 20px)", color: C.gray, lineHeight: 1.6, margin: "0 0 40px 0", maxWidth: 600 }}>
              Social Producer & Creator at Adobe Brand. I build short-form content systems that turn cultural moments into measurable growth.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <a href="https://www.linkedin.com/in/miles-spearman/" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: C.bg, background: C.mint, padding: "14px 36px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 40px ${C.mint}20` }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 0 60px ${C.mint}30`; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 0 40px ${C.mint}20`; }}
            >View My LinkedIn →</a>
          </FadeIn>
          <FadeIn delay={0.45} style={{ marginTop: 56 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {statBadges.map((b, i) => (
                <div key={i} style={{
                  background: C.glass, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 24px",
                  display: "inline-flex", flexDirection: "column", gap: 4,
                  transition: "transform 0.3s, border-color 0.3s", cursor: "default",
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.mint; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                >
                  <span style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: C.mint, lineHeight: 1 }}>{b.number}</span>
                  <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.white, lineHeight: 1.2 }}>{b.label}</span>
                  <span style={{ fontFamily: F, fontSize: 11, color: C.gray, lineHeight: 1.3 }}>{b.detail}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ===== WHAT I DO — clickable cards ===== */}
        <section id="services" style={{ padding: "80px clamp(24px, 5vw, 80px) 60px" }}>
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Services</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 48px 0", letterSpacing: -0.5 }}>What I Do</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
            {capabilities.map((c, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div style={{
                    background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                    border: `1px solid ${C.border}`, borderRadius: 16, padding: 28,
                    transition: "all 0.3s", display: "flex", flexDirection: "column", gap: 12,
                    height: "100%", cursor: "pointer",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(93,232,197,0.2)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(93,232,197,0.06)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <span style={{ fontSize: 28 }}>{c.icon}</span>
                    <h4 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, margin: 0 }}>{c.title}</h4>
                    <p style={{ fontFamily: F, fontSize: 13, color: C.gray, lineHeight: 1.6, margin: 0, flex: 1 }}>{c.body}</p>
                    <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, marginTop: 8 }}>{c.linkLabel}</span>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" style={{ padding: "60px clamp(24px, 5vw, 80px) 80px" }}>
          <FadeIn>
            <div style={{
              maxWidth: 720, background: C.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderRadius: 24, padding: "48px 40px",
            }}>
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 16, display: "block" }}>About</span>
              <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                I'm a social producer and content creator at Adobe Brand in San Francisco — I direct on-location video at events like Adobe MAX and Summit, coach executives on camera, and produce talent interviews end-to-end (James Gunn, Ken Jeong, Mark Rober). I also host, present, and work in front of the camera. I studied Marketing and Music at UC (3.94 GPA) — the music background shows up in how I think about rhythm, pacing, and storytelling. And yes, you will see me out in the city performing around San Francisco.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map(s => (
                  <span key={s} style={{
                    fontFamily: F, fontSize: 12, fontWeight: 500, color: C.white,
                    background: "rgba(93,232,197,0.08)", border: "1px solid rgba(93,232,197,0.15)",
                    padding: "6px 14px", borderRadius: 100, whiteSpace: "nowrap",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ===== WORK — 3 visual grid buckets ===== */}
        <section id="work" style={{ padding: "60px clamp(24px, 5vw, 80px) 40px" }}>
          <FadeIn>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.mint, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, display: "block" }}>Portfolio</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: C.white, margin: "0 0 8px 0", letterSpacing: -0.5 }}>Selected Work</h2>
            <p style={{ fontFamily: F, fontSize: 16, color: C.gray, margin: "0 0 48px 0", maxWidth: 500 }}>Real content from real campaigns — shot, edited, and published by me.</p>
          </FadeIn>

          {portfolioBuckets.map(b => <PortfolioBucket key={b.id} bucket={b} />)}

          <Marquee />
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
              style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.white, background: C.pink, padding: "16px 48px", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 50px ${C.pink}25` }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 0 70px ${C.pink}35`; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 0 50px ${C.pink}25`; }}
            >Connect on LinkedIn →</a>
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
