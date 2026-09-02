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
    id: "users",
    label: "User Management",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "opticians",
    label: "Optician Accounts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3M6 12a3 3 0 106 0 3 3 0 10-6 0zm9 0a3 3 0 106 0 3 3 0 10-6 0zm-3 0h3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c0-2 1.5-3 3-3s3 1 3 3m3 0c0-2 1.5-3 3-3s3 1 3 3" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: "revenue",
    label: "Revenue Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ activeTab, setActiveTab, adminName, onLogout, mobileOpen, setMobileOpen }) {
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
        className={`fixed top-0 left-0 h-full w-[260px] z-40 flex flex-col transition-transform duration-300 shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2d1557 60%, #3b1f6e 100%)" }}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <svg className="w-5 h-5" style={{ color: "#c4b5fd" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="font-extrabold text-[15px] tracking-tight leading-none" style={{ color: "white" }}>
              Nethmini<span style={{ color: "#c4b5fd" }}>Opticals</span>
            </p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#a78bfa" }}>Admin Portal</p>
          </div>
        </div>

        {/* Admin profile pill */}
        <div className="mx-4 mt-5 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{adminName || "Administrator"}</p>
            <p className="text-[11px] font-medium" style={{ color: "rgba(167,139,250,0.7)" }}>System Administrator</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Main Navigation</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 text-left group`}
              style={
                activeTab === item.id
                  ? { background: "rgba(167,139,250,0.15)", color: "white" }
                  : { color: "rgba(255,255,255,0.55)" }
              }
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              <span style={{ color: activeTab === item.id ? "#c4b5fd" : "rgba(255,255,255,0.35)" }}>
                {item.icon}
              </span>
              {item.label}
              {activeTab === item.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#a78bfa" }} />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ color: "rgba(255,255,255,0.55)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; }}
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
