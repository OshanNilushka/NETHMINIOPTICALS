import React from 'react';
import { getImage } from "../constants/images";

const Aboutsection2 = () => {
  const about6 = getImage("about6");

  const features = [
    {
      id: 1,
      title: 'Cutting-Edge Technology',
      description: 'State-of-the-art diagnostic equipment and advanced AI imaging for early, precise vision care.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-blue-600 to-blue-500',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-100',
      accentHover: 'hover:border-blue-300 hover:shadow-blue-100',
      numberColor: 'text-blue-600',
    },
    {
      id: 2,
      title: 'Qualified Specialists',
      description: 'Board-certified ophthalmologists and consultants certified to treat complex ophthalmic conditions.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-cyan-400',
      accentBg: 'bg-cyan-50',
      accentBorder: 'border-cyan-100',
      accentHover: 'hover:border-cyan-300 hover:shadow-cyan-100',
      numberColor: 'text-cyan-600',
    },
    {
      id: 3,
      title: 'Transparent Pricing',
      description: 'Affordable diagnostic packages and fully transparent billing with zero hidden costs.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-500',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-100',
      accentHover: 'hover:border-indigo-300 hover:shadow-indigo-100',
      numberColor: 'text-indigo-600',
    },
    {
      id: 4,
      title: 'Premium Eyewear',
      description: 'Curated designer frames — light, high-durability, tailored to complement every face shape.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3M6 12a3 3 0 106 0 3 3 0 10-6 0zm9 0a3 3 0 106 0 3 3 0 10-6 0zm-3 0h3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c0-2 1.5-3 3-3s3 1 3 3m3 0c0-2 1.5-3 3-3s3 1 3 3" />
        </svg>
      ),
      gradient: 'from-cyan-600 to-blue-500',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-100',
      accentHover: 'hover:border-blue-300 hover:shadow-blue-100',
      numberColor: 'text-blue-600',
    },
  ];

  return (
    <section className="py-24 px-5 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100 overflow-hidden">
      {/* Subtle background shapes */}
      <div className="absolute left-0 w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none -translate-x-1/2" />
      <div className="absolute right-0 w-[300px] h-[300px] rounded-full bg-cyan-100/40 blur-[80px] pointer-events-none translate-x-1/2" />

      <div className="max-w-[1400px] mx-auto relative">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4 inline-block">
            Our Key Values
          </span>
          <h2 className="text-[2.4rem] font-extrabold text-slate-800 tracking-tight leading-[1.2] mb-4">
            Why Patients Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Vision Care Center?
            </span>
          </h2>
          <p className="text-[1rem] text-slate-500 font-medium leading-[1.65]">
            We combine advanced diagnostics, certified specialists, and premium eyewear to deliver clinical excellence at every visit.
          </p>
        </div>

        {/* Feature Cards Grid + Center Image */}
        <div className="grid grid-cols-[1fr_340px_1fr] grid-rows-[auto_auto] gap-x-10 gap-y-8 items-center justify-items-center max-[1024px]:grid-cols-[1fr_280px_1fr] max-[1024px]:gap-x-6 max-[768px]:grid-cols-1 max-[768px]:gap-y-6">

          {/* Top Left Card */}
          <div className={`group bg-white border ${features[0].accentBorder} rounded-3xl p-7 shadow-sm ${features[0].accentHover} hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 max-w-[300px] w-full col-[1] row-[1] justify-self-end max-[768px]:justify-self-center`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${features[0].gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform duration-300`}>
              {features[0].icon}
            </div>
            <h3 className="text-[1.05rem] font-extrabold text-slate-800 mb-2 tracking-tight">{features[0].title}</h3>
            <p className="text-[0.84rem] font-medium text-slate-500 leading-relaxed">{features[0].description}</p>
            <div className={`mt-4 text-xs font-bold ${features[0].numberColor} flex items-center gap-1.5`}>
              <span className="w-5 h-px bg-current opacity-40 inline-block" />
              01
            </div>
          </div>

          {/* Center Image Portrait */}
          <div className="col-[2] row-[1/3] w-full flex flex-col items-center justify-center gap-5 max-[768px]:col-[1] max-[768px]:row-[3] max-[768px]:order-3 py-2">
            <div className="relative group/img w-[300px] h-[380px] max-[1024px]:w-[250px] max-[1024px]:h-[320px] max-[768px]:w-[220px] max-[768px]:h-[280px] rounded-[28px] overflow-hidden shadow-2xl shadow-blue-200/40 ring-4 ring-white border-4 border-white transition-transform duration-500 hover:scale-[1.02]">
              <img
                src={about6}
                alt="Vision Care Treatment"
                className="w-full h-full object-cover transform scale-100 group-hover/img:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/25 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
            </div>
            {/* Stats below image */}
            <div className="flex items-center gap-6 bg-white border border-slate-100 rounded-2xl px-6 py-3 shadow-md">
              <div className="text-center">
                <p className="text-xl font-black text-blue-600">98%</p>
                <p className="text-[11px] text-slate-400 font-semibold">Satisfaction</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-xl font-black text-cyan-600">25+</p>
                <p className="text-[11px] text-slate-400 font-semibold">Years</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-xl font-black text-blue-600">10k+</p>
                <p className="text-[11px] text-slate-400 font-semibold">Patients</p>
              </div>
            </div>
          </div>

          {/* Top Right Card */}
          <div className={`group bg-white border ${features[1].accentBorder} rounded-3xl p-7 shadow-sm ${features[1].accentHover} hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 max-w-[300px] w-full col-[3] row-[1] justify-self-start max-[768px]:col-[1] max-[768px]:row-[2] max-[768px]:justify-self-center`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${features[1].gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-cyan-200 group-hover:scale-110 transition-transform duration-300`}>
              {features[1].icon}
            </div>
            <h3 className="text-[1.05rem] font-extrabold text-slate-800 mb-2 tracking-tight">{features[1].title}</h3>
            <p className="text-[0.84rem] font-medium text-slate-500 leading-relaxed">{features[1].description}</p>
            <div className={`mt-4 text-xs font-bold ${features[1].numberColor} flex items-center gap-1.5`}>
              <span className="w-5 h-px bg-current opacity-40 inline-block" />
              02
            </div>
          </div>

          {/* Bottom Left Card */}
          <div className={`group bg-white border ${features[2].accentBorder} rounded-3xl p-7 shadow-sm ${features[2].accentHover} hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 max-w-[300px] w-full col-[1] row-[2] justify-self-end max-[768px]:col-[1] max-[768px]:row-[4] max-[768px]:justify-self-center`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${features[2].gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform duration-300`}>
              {features[2].icon}
            </div>
            <h3 className="text-[1.05rem] font-extrabold text-slate-800 mb-2 tracking-tight">{features[2].title}</h3>
            <p className="text-[0.84rem] font-medium text-slate-500 leading-relaxed">{features[2].description}</p>
            <div className={`mt-4 text-xs font-bold ${features[2].numberColor} flex items-center gap-1.5`}>
              <span className="w-5 h-px bg-current opacity-40 inline-block" />
              03
            </div>
          </div>

          {/* Bottom Right Card */}
          <div className={`group bg-white border ${features[3].accentBorder} rounded-3xl p-7 shadow-sm ${features[3].accentHover} hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 max-w-[300px] w-full col-[3] row-[2] justify-self-start max-[768px]:col-[1] max-[768px]:row-[5] max-[768px]:justify-self-center`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${features[3].gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform duration-300`}>
              {features[3].icon}
            </div>
            <h3 className="text-[1.05rem] font-extrabold text-slate-800 mb-2 tracking-tight">{features[3].title}</h3>
            <p className="text-[0.84rem] font-medium text-slate-500 leading-relaxed">{features[3].description}</p>
            <div className={`mt-4 text-xs font-bold ${features[3].numberColor} flex items-center gap-1.5`}>
              <span className="w-5 h-px bg-current opacity-40 inline-block" />
              04
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Aboutsection2;
