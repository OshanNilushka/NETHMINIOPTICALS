import { useState, useEffect } from "react";
import { getImage } from "../constants/images";

const slides = [
  {
    key: "hero1",
    tag: "AI-Powered Eye Care",
    headline: ["Expert Vision", "Starts Here"],
    sub: "Discover frames tailored to your face shape with our AI Virtual Mirror and instant prescription scanning.",
    cta1: { label: "Browse Frames", href: "#catalog" },
    cta2: { label: "Try Virtual Mirror", href: "#/virtual-mirror" },
  },
  {
    key: "hero2",
    tag: "Premium Optical Collection",
    headline: ["Find Your", "Perfect Frame"],
    sub: "From classic aviators to modern geometric styles — curated collections for every face shape and lifestyle.",
    cta1: { label: "Shop Collection", href: "#catalog" },
    cta2: { label: "Prescription OCR", href: "#/login" },
  },
  {
    key: "hero3",
    tag: "Smart Prescription Tech",
    headline: ["Digitize Your", "Prescription Instantly"],
    sub: "Upload your eye report and let our OCR technology extract your prescription values in seconds.",
    cta1: { label: "Get Started", href: "#/login" },
    cta2: { label: "Learn More", href: "#/services" },
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState(0);

  const DURATION = 6000;

  useEffect(() => {
    setProgress(0);
    setAnimKey((k) => k + 1);
    const start = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    const timeout = setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [current]);

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];
  const heroImage = getImage(slide.key);

  return (
    <section className="relative h-screen w-[92%] max-w-[1700px] mt-0 mx-auto overflow-hidden rounded-[28px] shadow-2xl">

      {/* Background image */}
      <img
        key={heroImage}
        src={heroImage}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover animate-[imageFade_1.2s_ease]"
      />

      {/* Layered gradient overlay (Light blue/cyan style) */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(37,99,235,0.45) 50%, rgba(15,23,42,0.88) 100%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Animated glow rings */}
      <div
        className="absolute z-[2] pointer-events-none"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="w-[600px] h-[600px] md:w-[820px] md:h-[820px] rounded-full border border-white/[0.05] animate-[pulseCircle_5s_infinite_ease-in-out]" />
        <div className="absolute inset-[60px] rounded-full border border-white/[0.07] animate-[pulseCircle_5s_1.5s_infinite_ease-in-out]" />
        <div className="absolute inset-[130px] rounded-full border border-blue-400/[0.12] animate-[pulseCircle_5s_3s_infinite_ease-in-out]" />
        <div className="absolute inset-[200px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Floating accent orbs */}
      <div className="absolute top-[15%] right-[8%] w-36 h-36 rounded-full bg-blue-400/15 blur-3xl z-[2] animate-[pulseCircle_7s_infinite_ease-in-out]" />
      <div className="absolute bottom-[20%] left-[5%] w-52 h-52 rounded-full bg-cyan-600/15 blur-3xl z-[2] animate-[pulseCircle_9s_2s_infinite_ease-in-out]" />

      {/* Main center content */}
      <div
        key={animKey}
        className="absolute inset-0 z-[4] flex flex-col items-center justify-center text-center px-6"
      >
        {/* Tag pill */}
        <div className="mb-5 opacity-0 animate-[popupFadeUp_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_forwards]">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {slide.tag}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-white font-extrabold leading-[1.08] tracking-tight mb-5 opacity-0 animate-[popupFadeUp_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_forwards]"
          style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}
        >
          {slide.headline[0]}
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #60a5fa, #a855f7, #818cf8)",
              backgroundSize: "200%",
              animation: "heroShimmer 4s linear infinite",
            }}
          >
            {slide.headline[1]}
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-slate-300 font-medium leading-[1.75] max-w-[600px] mb-9 opacity-0 animate-[popupFadeUp_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.45s_forwards]"
          style={{ fontSize: "clamp(0.95rem, 2vw, 1.2rem)" }}
        >
          {slide.sub}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-[popupFadeUp_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.65s_forwards]">
          <a
            href={slide.cta1.href}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-white/15 border border-white/40 backdrop-blur-md shadow-xl hover:bg-white/25 hover:-translate-y-1 transition-all duration-300 text-sm cursor-pointer"
          >
            <span className="relative">{slide.cta1.label}</span>
            <svg
              className="relative w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href={slide.cta2.href}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-3 pl-4 pr-6 py-[14px] font-bold text-white bg-white/10 border border-white/30 backdrop-blur-md shadow-xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 text-sm cursor-pointer"
            style={{ borderRadius: "14px" }}
          >
            <span className="relative flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "rgba(96,165,250,0.15)", border: "1.5px solid rgba(96,165,250,0.30)" }}>
              {/* Red record indicator dot */}
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.7)] animate-pulse" />
              {/* Camera SVG */}
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="7" width="15" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 10l4.553-2.276A1 1 0 0123 8.618v6.764a1 1 0 01-1.447.894L17 14" />
              </svg>
            </span>
            <span className="relative flex flex-col items-start leading-tight">
              <span className="text-[10px] text-blue-300/80 font-medium uppercase tracking-widest">AI Powered</span>
              <span>{slide.cta2.label}</span>
            </span>
          </a>
        </div>
      </div>

      {/* Trust feature bar (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-[4] pb-[68px] flex justify-center px-4">
        <div className="hidden md:flex items-stretch gap-3"
          style={{
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "12px 20px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {[
            {
              svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path strokeLinecap="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                </svg>
              ),
              label: "AI Face Analysis",
              sub: "Real-time detection",
              color: "rgba(96,165,250,0.18)",
              stroke: "rgba(96,165,250,0.5)",
              text: "#93c5fd",
            },
            {
              svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              label: "Prescription OCR",
              sub: "Instant scan & parse",
              color: "rgba(34,211,238,0.18)",
              stroke: "rgba(34,211,238,0.5)",
              text: "#67e8f9",
            },
            {
              svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" d="M2 12c2-5 5-8 10-8s8 3 10 8c-2 5-5 8-10 8s-8-3-10-8z" />
                  <rect x="1" y="9" width="22" height="6" rx="3" strokeDasharray="3 2" opacity="0.35" />
                </svg>
              ),
              label: "3D Virtual Try-On",
              sub: "AR frame fitting",
              color: "rgba(96,165,250,0.18)",
              stroke: "rgba(96,165,250,0.5)",
              text: "#93c5fd",
            },
            {
              svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              label: "Instant Booking",
              sub: "Same-day confirmed",
              color: "rgba(250,204,21,0.15)",
              stroke: "rgba(250,204,21,0.45)",
              text: "#fde68a",
            },
          ].map((f, i, arr) => (
            <div key={i} className="flex items-center gap-3 px-4 relative">
              {/* Icon badge */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: f.color, border: `1px solid ${f.stroke}`, color: f.text }}
              >
                {f.svg}
              </div>
              {/* Text */}
              <div className="flex flex-col">
                <span className="text-white text-[12px] font-bold leading-tight">{f.label}</span>
                <span className="text-white/45 text-[10px] font-medium">{f.sub}</span>
              </div>
              {/* Divider */}
              {i < arr.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-px bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute top-1/2 -translate-y-1/2 left-5 z-[5] w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-lg cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        className="absolute top-1/2 -translate-y-1/2 right-5 z-[5] w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-lg cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress-based slide indicators */}
      <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 z-[5] flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`relative overflow-hidden h-[5px] rounded-full transition-all duration-500 cursor-pointer ${i === current ? "w-10 bg-white/30" : "w-5 bg-white/30 hover:bg-white/50"
              }`}
          >
            {i === current && (
              <span
                className="absolute left-0 top-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes heroShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
}