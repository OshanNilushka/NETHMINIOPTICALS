import { useState } from "react";

const SERVICES_LIST = [
  {
    id: "cataract-laser",
    title: "Cataract & Laser Eye Surgery",
    category: "Surgical Care",
    badge: "Most Popular",
    shortDesc: "Advanced phacoemulsification and precision femtosecond laser cataract surgery with premium intraocular lens (IOL) implants.",
    fullDesc: "Eliminate cloudiness and restore crystal-clear vision with micro-incision cataract surgery and customized monofocal, multifocal, or toric IOL implants tailored to your sight goals.",
    features: [
      "No-Stitch Phacoemulsification Cataract Removal",
      "Premium Multifocal & Toric IOL Lens Implants",
      "Femtosecond Laser Precision Surgery",
      "Comprehensive Post-Operative Vision Care"
    ],
    duration: "15 - 30 Minutes",
    price: "From LKR 45,000",
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    localImage: "/services/newarta-eye-laser-surgery-5016073.jpg",
    defaultImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
  },
  {
    id: "ocular-oncology",
    title: "Ocular Oncology Surgery",
    category: "Oncology Care",
    badge: "Specialized Care",
    shortDesc: "Specialized subspecialty diagnosis, targeted therapy, and micro-surgical management of eye tumors and ocular surface neoplasms.",
    fullDesc: "Comprehensive ocular oncology care utilizing high-resolution ultrasound biomicroscopy, biopsy, micro-surgical tumor excision, and ocular surface reconstruction to protect eye health.",
    features: [
      "High-Resolution Ocular Ultrasonography (UBM)",
      "Targeted Biopsy & Histopathological Analysis",
      "Micro-Surgical Tumor Excision",
      "Ocular Surface Reconstruction & Preservation"
    ],
    duration: "60 - 90 Minutes",
    price: "Consultation Required",
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    localImage: "/services/ocularoncology surgeryimages.jpg",
    defaultImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80"
  },
  {
    id: "glaucoma-treatment",
    title: "Glaucoma Treatment & IOP Care",
    category: "Medical Care",
    badge: "Essential Care",
    shortDesc: "Specialized intraocular pressure (IOP) monitoring, Selective Laser Trabeculoplasty (SLT), and optic nerve fiber preservation.",
    fullDesc: "Early glaucoma detection and visual field protection using advanced perimetry, SLT laser therapy, hypotensive drops, and micro-invasive glaucoma surgery (MIGS) to prevent vision loss.",
    features: [
      "Computerized Visual Field Analysis (Perimetry)",
      "Selective Laser Trabeculoplasty (SLT Laser)",
      "Continuous Intraocular Pressure (IOP) Tracking",
      "Optic Nerve Fiber Layer (OCT) Scanning"
    ],
    duration: "30 - 45 Minutes",
    price: "LKR 3,500",
    icon: (
      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    localImage: "/services/Glaucoma Treatment.jpg",
    defaultImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
  },
  {
    id: "vision-correction",
    title: "Vision Correction & LASIK",
    category: "Laser Refraction",
    badge: "Life Changing",
    shortDesc: "Blade-free Wavefront-guided Femto-LASIK, PRK, and Contoura Vision to permanently correct myopia, hyperopia, and astigmatism.",
    fullDesc: "Achieve 20/20 visual independence from glasses or contacts through sub-micron corneal laser reshaping, topography-guided precision, and rapid 24-hour visual recovery.",
    features: [
      "Blade-Free Femto-LASIK & PRK Surgery",
      "Contoura™ Vision Topography-Guided Laser",
      "Customized Astigmatism & Myopia Correction",
      "Rapid 24-Hour Visual Recovery Protocol"
    ],
    duration: "20 Minutes",
    price: "From LKR 85,000",
    icon: (
      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    localImage: "/services/Vision Correction.jpg",
    defaultImage: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80"
  },
  {
    id: "retina-treatment",
    title: "Retina Treatment & Macular Care",
    category: "Retinal Care",
    badge: "Advanced Retina",
    shortDesc: "High-definition OCT retinal scanning, intravitreal anti-VEGF therapy, and diabetic retinopathy laser photocoagulation.",
    fullDesc: "Specialized vitreoretinal care for macular degeneration, retinal tears, diabetic retinopathy, and retinal vein occlusion to safeguard your central vision.",
    features: [
      "High-Definition OCT Retinal Scanning",
      "Diabetic Retinopathy Laser Photocoagulation",
      "Anti-VEGF Intravitreal Injection Therapy",
      "Macular Degeneration (AMD) Management"
    ],
    duration: "45 Minutes",
    price: "From LKR 6,500",
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    localImage: "/services/Retina Treatment.jpg",
    defaultImage: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80"
  },
  {
    id: "cornea-surgery",
    title: "Cornea Surgery & Transplant",
    category: "Corneal Care",
    badge: "Transplant Optics",
    shortDesc: "Corneal collagen cross-linking (C3R/CXL), DSAEK partial transplants, keratoconus management, and corneal ulcer repair.",
    fullDesc: "Advanced corneal surgery and collagen cross-linking to strengthen corneal tissue, treat progressive keratoconus, and perform micro-endothelial transplants.",
    features: [
      "Corneal Collagen Cross-Linking (C3R / CXL)",
      "DSAEK & DMEK Partial Corneal Transplants",
      "Keratoconus Specialty Scleral Lens Fitting",
      "Corneal Ulcer & Trauma Surgical Repair"
    ],
    duration: "45 - 60 Minutes",
    price: "From LKR 35,000",
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477" />
      </svg>
    ),
    localImage: "/services/Cornea Surgery.jpg",
    defaultImage: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"
  },
  {
    id: "pediatric-care",
    title: "Pediatric Eye Care & Screening",
    category: "Pediatric Care",
    badge: "Family Focused",
    shortDesc: "Gentle child-friendly vision evaluations, amblyopia patching therapy, MiSight® myopia control, and strabismus alignment.",
    fullDesc: "Comprehensive pediatric eye assessments for infants, kids, and teens to treat lazy eye (amblyopia), correct strabismus, and slow down myopia progression.",
    features: [
      "Child-Friendly Visual Acuity & Color Testing",
      "Myopia Control Therapy (MiSight Lenses & Drops)",
      "Amblyopia (Lazy Eye) Patching & Vision Therapy",
      "Strabismus (Crossed Eyes) Clinical Evaluation"
    ],
    duration: "30 - 40 Minutes",
    price: "LKR 2,800",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    localImage: "/services/Pediatric Eye Care.jpg",
    defaultImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80"
  },
  {
    id: "dry-eye-treatment",
    title: "Dry Eye Treatment & IPL Therapy",
    category: "Therapeutic Care",
    badge: "Relief Care",
    shortDesc: "Meibomian gland evaluation, Intense Pulsed Light (IPL) therapy, punctal plug insertion, and tear-film restoration.",
    fullDesc: "Long-lasting relief for burning, watery, or irritated eyes through thermal meibomian gland expression, IPL light therapy, and custom lubricating drops.",
    features: [
      "Meibography & Tear Film Breakdown Diagnostics",
      "Intense Pulsed Light (IPL) Gland Stimulation",
      "Thermal Punctal Plug Insertion",
      "Prescription Ocular Lubricant Customization"
    ],
    duration: "30 Minutes",
    price: "LKR 4,000",
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    localImage: "/services/Dry Eye Treatment.jpg",
    defaultImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-24">
      {/* Creative & Professional Dual-Column Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-slate-50 to-white pt-16 pb-20 border-b border-slate-200/80">
        {/* Decorative Ambient Radial Glow Spheres */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-700 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>✨ Advanced Ophthalmic & Vision Care</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Comprehensive Clinical Excellence &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600">
                  Surgical Eye Services
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                Combining board-certified ophthalmologists, digital eye testing, laser vision correction, and 3D AI virtual fitting to protect your sight with uncompromised precision.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#/virtual-mirror"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center gap-2.5"
                >
                  <span>Try 3D AI Mirror</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>

                <a
                  href="#/contact"
                  className="px-7 py-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-extrabold text-sm rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Contact Eye Clinic</span>
                </a>
              </div>

              {/* Key Trust Statistics Bar */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-xl">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-blue-600">15,000+</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Patients Treated</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-indigo-600">25+ Yrs</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Clinical Experience</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-cyan-600">99.4%</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Satisfaction Rating</p>
                </div>
              </div>
            </div>

            {/* Right Visual Creative Hero Image Column (Pure Image Only) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-2xl shadow-blue-500/20 bg-slate-100 group transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="h-[440px] sm:h-[480px] w-full overflow-hidden">
                    <img
                      src="/services/newarta-eye-laser-surgery-5016073.jpg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80";
                      }}
                      alt="Optical Clinical Surgery"
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid (Clean Information Display) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Our Clinical & Surgical Services</h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Explore our 8 specialized optical, surgical, and diagnostic treatments</p>
          </div>
          <div className="mt-4 md:mt-0 text-slate-600 text-xs font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Comprehensive Eye Care Details
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_LIST.map((service) => (
            <div
              key={service.id}
              className="group bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <img
                  src={service.localImage}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = service.defaultImage;
                  }}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-blue-700 border border-blue-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {service.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                    {service.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="p-3 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-md">
                    {service.icon}
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shadow-sm">
                    {service.price}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-xs mt-2.5 leading-relaxed font-normal">
                    {service.shortDesc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-5 space-y-2">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated Duration: {service.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
