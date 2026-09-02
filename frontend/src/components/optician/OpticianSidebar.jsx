import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "stock",
    label: "Stock Manager",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
      </svg>
    ),
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Order Manager",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: "patients",
    label: "Patient Records",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "advisor",
    label: "Lens & Frame Advisor",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3M6 12a3 3 0 106 0 3 3 0 10-6 0zm9 0a3 3 0 106 0 3 3 0 10-6 0zm-3 0h3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c0-2 1.5-3 3-3s3 1 3 3m3 0c0-2 1.5-3 3-3s3 1 3 3" />
      </svg>
    ),
  },
  {
    id: "feedbacks",
    label: "Customer Feedbacks",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function OpticianSidebar({ activeTab, setActiveTab, opticianName, onLogout, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-gradient-to-b from-[#0f2d45] to-[#1a4a6b] z-40 flex flex-col transition-transform duration-300 shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 bg-cyan-400/20 border border-cyan-400/30 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-[15px] tracking-tight leading-none">Nethmini<span className="text-cyan-300">Opticals</span></p>
            <p className="text-cyan-400 text-[11px] font-semibold mt-0.5">Optician Portal</p>
          </div>
        </div>

        {/* Optician profile pill */}
        <div className="mx-4 mt-5 mb-2 bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {opticianName ? opticianName.charAt(0).toUpperCase() : "O"}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{opticianName || "Optician"}</p>
            <p className="text-white/50 text-[11px] font-medium">Verified Specialist</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-1">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">Main Navigation</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 text-left group
                ${activeTab === item.id
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
            >
              <span className={`transition-colors ${activeTab === item.id ? "text-cyan-300" : "text-white/40 group-hover:text-white/70"}`}>
                {item.icon}
              </span>
              {item.label}
              {activeTab === item.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 border-t border-white/10 pt-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 text-[14px] font-semibold transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
