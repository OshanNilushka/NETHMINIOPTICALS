import { getImage } from "../constants/images";
import { useEffect, useRef, useState } from "react";

/* ─── SVG Icon Library ────────────────────────────────────────────── */
const icons = {
  cataract: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12C4.5 6 8.5 3 12 3s7.5 3 10 9c-2.5 6-6.5 9-10 9S4.5 18 2 12z" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 3" />
    </svg>
  ),
  oncology: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  ),
  glaucoma: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  vision: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="4" />
    </svg>
  ),
  retina: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  ),
  cornea: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 8v4l3 3" />
      <path d="M18 2v6h6" />
      <path d="M22 2 12 12" />
    </svg>
  ),
  pediatric: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h6" />
      <path d="M12 9v6" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  dryeye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6" />
      <path d="M12 22v-2" />
      <path d="M7 6.3A8 8 0 0 0 4 14a8 8 0 0 0 16 0 8 8 0 0 0-3-7.7" />
      <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
    </svg>
  ),
};

const services = [
  {
    id: 1,
    title: "Cataract & Laser Surgery",
    description: "Advanced phacoemulsification and precision laser cataract treatment with premium multifocal IOL implants for clear vision.",
    icon: icons.cataract,
    imagePath: "/services/newarta-eye-laser-surgery-5016073.jpg",
    image: "about1",
    accent: "from-blue-600 to-indigo-600",
    tag: "Surgical",
  },
  {
    id: 2,
    title: "Ocular Oncology",
    description: "Subspecialty diagnosis, ultrasound biomicroscopy, and micro-surgical management of eye tumors and ocular surface neoplasms.",
    icon: icons.oncology,
    imagePath: "/services/ocularoncology surgeryimages.jpg",
    image: "about2",
    accent: "from-blue-600 to-indigo-600",
    tag: "Oncology",
  },
  {
    id: 3,
    title: "Glaucoma Treatment",
    description: "Specialized intraocular pressure (IOP) tracking, Selective Laser Trabeculoplasty (SLT), and optic nerve preservation.",
    icon: icons.glaucoma,
    imagePath: "/services/Glaucoma Treatment.jpg",
    image: "about3",
    accent: "from-blue-600 to-indigo-600",
    tag: "Medical",
  },
  {
    id: 4,
    title: "Vision Correction & LASIK",
    description: "Blade-free Wavefront-guided Femto-LASIK, PRK, and Contoura Vision to permanently correct myopia and astigmatism.",
    icon: icons.vision,
    imagePath: "/services/Vision Correction.jpg",
    image: "about4",
    accent: "from-blue-600 to-indigo-600",
    tag: "LASIK",
  },
  {
    id: 5,
    title: "Retina Treatment",
    description: "High-definition OCT retinal scanning, intravitreal anti-VEGF therapy, and diabetic retinopathy laser photocoagulation.",
    icon: icons.retina,
    imagePath: "/services/Retina Treatment.jpg",
    image: "about1",
    accent: "from-blue-600 to-indigo-600",
    tag: "Surgical",
  },
  {
    id: 6,
    title: "Cornea Surgery",
    description: "Corneal collagen cross-linking (C3R/CXL), DSAEK micro-transplants, keratoconus management, and corneal ulcer repair.",
    icon: icons.cornea,
    imagePath: "/services/Cornea Surgery.jpg",
    image: "about2",
    accent: "from-blue-600 to-indigo-600",
    tag: "Transplant",
  },
  {
    id: 7,
    title: "Pediatric Eye Care",
    description: "Gentle child-friendly vision screening, amblyopia patching therapy, MiSight® myopia control, and strabismus evaluation.",
    icon: icons.pediatric,
    imagePath: "/services/Pediatric Eye Care.jpg",
    image: "about3",
    accent: "from-blue-600 to-indigo-600",
    tag: "Pediatric",
  },
  {
    id: 8,
    title: "Dry Eye Treatment",
    description: "Meibomian gland diagnostic evaluation, Intense Pulsed Light (IPL) therapy, punctal plugs, and tear-film restoration.",
    icon: icons.dryeye,
    imagePath: "/services/Dry Eye Treatment.jpg",
    image: "about4",
    accent: "from-blue-600 to-indigo-600",
    tag: "Medical",
  },
];

const stats = [
  { value: "25+", label: "Years Experience" },
  { value: "15K+", label: "Patients Treated" },
  { value: "98%", label: "Success Rate" },
  { value: "12+", label: "Specialists" },
];

export default function Services() {
  const servicesRef = useRef(null);
  const prevSlideRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(services.length / CARDS_PER_PAGE);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (servicesRef.current) observer.observe(servicesRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePrevSlide = () => {
    prevSlideRef.current = currentSlide;
    setCurrentSlide((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    prevSlideRef.current = currentSlide;
    setCurrentSlide((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const visibleServices = services.slice(
    currentSlide * CARDS_PER_PAGE,
    currentSlide * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  return (
    <section
      ref={servicesRef}
      id="services"
      className="relative w-full overflow-hidden bg-slate-50 py-24 px-5 border-t border-b border-slate-200"
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <div className="flex-1">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-600 text-[11px] font-bold uppercase tracking-widest mb-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Our Services
            </span>
            <h2
              className={`text-[2.8rem] max-[768px]:text-[2rem] font-extrabold text-slate-800 leading-[1.15] tracking-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              Comprehensive Eye Care
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-300 bg-clip-text text-transparent">
                Tailored for You
              </span>
            </h2>
          </div>

          <div className={`max-w-sm flex flex-col gap-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-slate-400 text-[1rem] leading-relaxed font-medium">
              From routine vision exams to complex surgical procedures — our certified specialists deliver world-class eye care with compassion.
            </p>
            <a
              href="#/services"
              className="group inline-flex items-center gap-2 text-teal-600 text-[14px] font-bold hover:text-teal-700 transition-colors w-fit cursor-pointer"
            >
              Explore All Treatments
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className={`grid grid-cols-4 max-[768px]:grid-cols-2 gap-4 mb-14 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="text-[2rem] font-extrabold text-blue-600 leading-none">{s.value}</span>
              <span className="text-slate-500 text-[13px] font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Service Cards Grid ── */}
        <div className="grid grid-cols-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1 gap-6 mb-10">
          {visibleServices.map((service, index) => (
            <div
              key={`${currentSlide}-${service.id}`}
              onClick={() => { window.location.hash = "#/services"; }}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative rounded-[24px] overflow-hidden cursor-pointer h-[380px] max-[600px]:h-[280px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              style={{
                animationDelay: `${index * 0.08}s`,
                animation: isVisible ? `fadeSlideUp 0.6s ease forwards ${index * 0.08}s` : "none",
                opacity: isVisible ? 1 : 0,
              }}
            >
              {/* Background image */}
              <img
                src={service.imagePath || getImage(service.image)}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark gradient overlay - always visible at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent transition-all duration-500" />

              {/* Hover color accent overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${service.accent} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              {/* Tag badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-slate-950/60 backdrop-blur-md border border-slate-800 text-blue-300 text-[11px] font-bold uppercase tracking-wider rounded-full">
                  {service.tag}
                </span>
              </div>

              {/* Icon — top right, appears on hover */}
              <div className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center text-white shadow-lg transition-all duration-500 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100`}>
                <div className="w-5 h-5">{service.icon}</div>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-6 transition-all duration-500">
                <h3 className="text-white text-[1.1rem] font-extrabold tracking-tight mb-0 group-hover:mb-3 transition-all duration-300 leading-tight">
                  {service.title}
                </h3>
                <p className="text-slate-200 text-[13px] leading-relaxed font-medium max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-500 ease-in-out">
                  {service.description}
                </p>
                <div className="flex items-center gap-1.5 mt-0 max-h-0 overflow-hidden group-hover:mt-4 group-hover:max-h-10 transition-all duration-500 ease-in-out">
                  <span className="text-teal-400 text-[12px] font-semibold">Learn more</span>
                  <svg className="w-3.5 h-3.5 text-teal-400 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination: Dots + Arrows ── */}
        <div className={`flex items-center justify-center gap-6 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {/* Prev button */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous services"
            className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:bg-teal-950/30 hover:scale-110 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide
                    ? "w-8 h-2.5 bg-teal-500"
                    : "w-2.5 h-2.5 bg-slate-600 hover:bg-slate-500"
                  }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNextSlide}
            aria-label="Next services"
            className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 hover:bg-teal-950/30 hover:scale-110 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyframe for card entrance */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
