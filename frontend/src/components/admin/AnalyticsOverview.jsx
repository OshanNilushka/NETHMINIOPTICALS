import { useState, useEffect } from "react";

const API = "http://localhost:3000";

function StatCard({ label, value, change, color, bg, icon, onClick, clickable }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border p-5 transition-all duration-200 ${bg} ${
        clickable ? "cursor-pointer hover:-translate-y-1 hover:shadow-md active:scale-[0.98]" : ""
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} bg-white shadow-sm`}>
        {icon}
      </div>
      <p className={`text-3xl font-black tracking-tight ${color}`}>{value ?? "—"}</p>
      <p className="text-slate-700 font-bold text-sm mt-0.5">{label}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-slate-400 text-xs font-medium">{change}</p>
        {clickable && (
          <span className={`text-[10px] font-bold ${color} opacity-60`}>View →</span>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsOverview({ adminName, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Patients",
      value: stats?.totalPatients,
      change: "Registered customers",
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-100",
      tab: "users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Total Opticians",
      value: stats?.totalOpticians,
      change: "Active specialists",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
      tab: "opticians",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3M6 12a3 3 0 106 0 3 3 0 10-6 0zm9 0a3 3 0 106 0 3 3 0 10-6 0zm-3 0h3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c0-2 1.5-3 3-3s3 1 3 3m3 0c0-2 1.5-3 3-3s3 1 3 3" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      change: `${stats?.pendingOrders ?? 0} pending`,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      tab: "revenue",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: stats?.totalRevenue != null ? `Rs. ${Number(stats.totalRevenue).toLocaleString()}` : "—",
      change: "Click to see breakdown",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      tab: "revenue",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Frame Catalog",
      value: stats?.totalProducts,
      change: "Products in catalog",
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
        </svg>
      ),
    },
    {
      label: "Pending Prescriptions",
      value: stats?.pendingPrescriptions,
      change: "Awaiting review",
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, <span style={{ color: "#7c3aed" }}>{adminName || "Admin"} 👋</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          System overview — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Click hint */}
      <div className="flex items-center gap-2 mb-4 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-2.5 w-fit">
        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-violet-700 text-xs font-semibold">Click on the highlighted cards to navigate to that section</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 font-semibold">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-7">
          {cards.map((c, i) => (
            <StatCard
              key={i}
              {...c}
              clickable={!!c.tab}
              onClick={c.tab ? () => setActiveTab(c.tab) : undefined}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Manage Patients", icon: "👤", tab: "users" },
            { label: "Add Optician", icon: "🔬", tab: "opticians" },
            { label: "Revenue Report", icon: "📊", tab: "revenue" },
            { label: "Send Notice", icon: "🔔", tab: "notifications" },
          ].map((a) => (
            <button
              key={a.tab}
              onClick={() => setActiveTab(a.tab)}
              className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm font-bold text-slate-700 hover:border-violet-200"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-center text-xs leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <div
        className="mt-2 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #2d1557 100%)" }}
      >
        <div>
          <p className="font-extrabold text-base">System is operating normally ✅</p>
          <p className="text-white/60 text-sm mt-0.5">
            {stats?.totalOpticians ?? 0} optician(s) active · {stats?.pendingOrders ?? 0} order(s) pending · {stats?.pendingPrescriptions ?? 0} prescription(s) awaiting review
          </p>
        </div>
        <button
          onClick={() => setActiveTab("revenue")}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-all hover:bg-violet-400/30"
          style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)", color: "#c4b5fd" }}
        >
          View Revenue →
        </button>
      </div>
    </div>
  );
}
