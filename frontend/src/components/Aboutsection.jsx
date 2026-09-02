import { getImage } from "../constants/images";
import { useEffect, useRef, useState } from "react";

export default function InfoCards() {
  const aboutImage = getImage("about1");
  const aboutImage2 = getImage("about2");
  const aboutImage3 = getImage("about3");
  const aboutImage5 = getImage("about5");

  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
      },
      { threshold: 0.15 }
    );
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setTitleVisible(true); titleObserver.unobserve(entry.target); }
      },
      { threshold: 0.25 }
    );
    if (titleRef.current) titleObserver.observe(titleRef.current);
    return () => titleObserver.disconnect();
  }, []);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setSectionVisible(true); sectionObserver.unobserve(entry.target); }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    return () => sectionObserver.disconnect();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 text-slate-700">
      {/* ─── Ambient glow blobs ─────────────────────────── */}
      <div className="absolute top-0 left-[-15%] w-[500px] h-[500px] rounded-full bg-blue-400/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[450px] h-[450px] rounded-full bg-cyan-400/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[30%] w-[400px] h-[400px] rounded-full bg-blue-300/6 blur-[100px] pointer-events-none" />

      {/* ─── Section Header ─────────────────────────────── */}
      <div ref={sectionRef} className="max-w-[1280px] mx-auto px-6 pt-20 pb-12 text-center">
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-600 text-[11px] font-bold uppercase tracking-widest mb-5 transition-all duration-700 ${sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
          Clinic Information
        </span>
        <h2 className={`text-[2.2rem] md:text-[2.8rem] font-extrabold text-slate-800 leading-tight tracking-tight transition-all duration-700 delay-100 ${sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          Everything You Need to Know <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">About Our Practice</span>
        </h2>
        <p className={`text-slate-500 text-base md:text-[17px] font-medium leading-relaxed max-w-[600px] mx-auto mt-4 transition-all duration-700 delay-200 ${sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          From convenient hours to special offers and specialist schedules — we make every visit worth your while.
        </p>
      </div>

      {/* ─── Top 3 Info Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1280px] mx-auto px-6 mb-20 items-stretch">

        {/* Card 1: Doctors Timetable */}
        <div className="group bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 relative overflow-hidden flex flex-col min-h-[360px]">
          {/* Subtle top color bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-3xl" />
          <div className="p-7 flex flex-col flex-1">
            {/* Icon */}
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-5 shadow-sm border border-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-blue-700 text-xl font-extrabold mb-2 tracking-tight">Doctors Timetable</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-5 flex-1">
              Our board-certified ophthalmologists and optometrists hold structured schedules. Book your slot and get expert care on time.
            </p>
            <a
              href="#/services"
              className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors group/link w-fit cursor-pointer"
            >
              View DR Schedule
              <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          {/* Bottom image strip */}
          <div className="relative h-[170px] overflow-hidden border-t border-slate-100">
            <img
              src={aboutImage}
              alt="Doctor Specialist Equipment"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800/40 to-transparent" />
          </div>
        </div>

        {/* Card 2: Schedule Hours — Premium Light Design */}
        <div className="group bg-white border border-slate-100 rounded-3xl shadow-md hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-400 relative overflow-hidden flex flex-col min-h-[360px]">

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-7 pt-6 pb-7 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
              </span>
              <span className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">We're Open</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center border border-white/25 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight leading-none">Schedule Hours</h2>
                <p className="text-blue-100 text-[11px] font-medium mt-0.5">Clinic operating times</p>
              </div>
            </div>
          </div>

          {/* Hours Body */}
          <div className="flex flex-col flex-1 px-7 py-5">
            <div className="flex flex-col gap-0 flex-1">
              {[
                { days: "Mon — Thu", time: "9:00 AM – 8:00 PM", active: true },
                { days: "Friday", time: "9:00 AM – 6:00 PM", active: true },
                { days: "Saturday", time: "9:00 AM – 4:00 PM", active: true },
                { days: "Sunday", time: "Closed", active: false },
              ].map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center py-3.5 ${idx < 3 ? "border-b border-slate-100" : ""}`}>
                  <span className="text-slate-600 text-sm font-semibold">{item.days}</span>
                  {item.active ? (
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full">
                      {item.time}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-0.5 rounded-full">
                      Closed
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hours may vary on public holidays. Call ahead to confirm.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: 10% Off */}
        <div className="group bg-gradient-to-br from-blue-600 to-cyan-500 border-0 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-400 relative overflow-hidden flex flex-col min-h-[360px]">
          {/* Floating badge */}
          <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/30 text-white py-1 px-3 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Limited Offer</span>
          </div>

          {/* Eyewear image — takes the top portion */}
          <div className="relative h-[200px] overflow-hidden bg-white/10 border-b border-white/20 flex items-center justify-center">
            <img
              src={aboutImage2}
              alt="Premium Eyewear"
              className="absolute inset-0 w-full h-full object-contain object-center scale-110 transition-transform duration-700 group-hover:scale-125 p-4"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-700/40" />
          </div>

          {/* Text content at bottom */}
          <div className="flex flex-col flex-1 justify-end p-7 z-10">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Exclusive for</p>
            <h1 className="text-[3.5rem] font-black tracking-tight leading-none text-white mb-1">10% Off</h1>
            <p className="text-blue-100 font-semibold text-sm mb-5">Premium adult eyewear &amp; designer frames</p>
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all w-fit cursor-pointer"
            >
              Browse Collection
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* ─── About Clinic Section ──────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 pb-20 flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

        {/* Left: Image with decorative layering */}
        <div className="relative w-full lg:w-[45%] flex justify-center shrink-0">
          {/* Decorative tilted BG block */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-[36px] rotate-2 scale-[0.96] blur-sm pointer-events-none" />
          {/* Small dot pattern accent */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-400/15 blur-xl pointer-events-none" />
          <img
            ref={imageRef}
            src={aboutImage5}
            alt="InsightOpticals Clinical Team"
            className={`relative z-10 w-full max-w-[520px] h-[540px] object-cover object-top rounded-[30px] shadow-2xl border-[5px] border-white ring-1 ring-slate-200 transition-all duration-[1100ms] ease-out ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-[0.97]"
              }`}
          />
          {/* Floating stat badge */}
          <div className="absolute bottom-6 left-0 z-20 bg-white backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-5 py-4 flex items-center gap-4 max-w-[220px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">25+</div>
            <div>
              <p className="text-slate-800 text-sm font-bold leading-tight">Years of Excellence</p>
              <p className="text-slate-500 text-xs font-medium">In Eye Care</p>
            </div>
          </div>
        </div>

        {/* Right: Clinic Content */}
        <div className="flex-1 flex flex-col gap-6 max-w-[620px]">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-600 text-[11px] font-extrabold uppercase tracking-widest w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            About Our Clinic
          </span>

          <h2
            ref={titleRef}
            className={`text-slate-800 text-[2.2rem] md:text-[2.8rem] font-extrabold leading-[1.15] tracking-tight transition-all duration-[900ms] ease-out ${titleVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
          >
            Clear vision begins here at <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              our eye hospital
            </span>
          </h2>

          <p className="text-slate-500 text-[15px] md:text-base leading-[1.75] font-medium">
            Our team of highly skilled ophthalmologists, optometrists, and support staff leverage cutting-edge diagnostic imaging and AI-assisted tools to deliver precise, personalized eye care — from simple vision checks to complex surgical treatment.
          </p>

          {/* Feature cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-700 text-sm font-extrabold mb-0.5">Qualified Specialists</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Board-certified experts in diagnosis and treatment of complex eye conditions.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-700 text-sm font-extrabold mb-0.5">Free Initial Consultation</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Start your journey to better vision at no cost with our expert assessment team.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-700 text-sm font-extrabold mb-0.5">Advanced Diagnostics</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">AI-powered OCR, retinal imaging, and 3D virtual frame try-on technology.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-700 text-sm font-extrabold mb-0.5">Transparent Pricing</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Affordable care packages with clear billing and zero hidden charges.</p>
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-5 border-t border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 shrink-0">
                <span className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Talk to an Expert</p>
                <a href="tel:+94112345678" className="text-blue-600 hover:text-blue-700 text-lg font-extrabold tracking-tight transition-colors">
                  +94 11 234 5678
                </a>
              </div>
            </div>
            <a
              href="#/services"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}