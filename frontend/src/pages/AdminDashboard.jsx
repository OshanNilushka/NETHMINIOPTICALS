import { useState, useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AnalyticsOverview from "../components/admin/AnalyticsOverview";
import UserManagement from "../components/admin/UserManagement";
import OpticianManagement from "../components/admin/OpticianManagement";
import NotificationsManager from "../components/admin/NotificationsManager";
import RevenueReports from "../components/admin/RevenueReports";

const TAB_TITLES = {
  overview: "Dashboard Overview",
  users: "User Management",
  opticians: "Optician Accounts",
  notifications: "Notifications Manager",
  revenue: "Revenue Reports",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    fetch("http://localhost:3000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((d) => {
        if (d.role !== "ADMIN") {
          // Not an admin — redirect away
          window.location.hash = "#/login";
          return;
        }
        setAdminName(d.fullName);
      })
      .catch(() => {
        window.location.hash = "#/login";
      });
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#f1f5f9]">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminName={adminName}
        onLogout={() => setShowLogoutModal(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <div className="hidden lg:block">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">NethminiOpticals</p>
            <p className="text-slate-900 font-extrabold text-lg leading-tight">
              {TAB_TITLES[activeTab] || "Admin Dashboard"}
            </p>
          </div>

          {/* Admin badge + profile */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Refresh Button */}
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              title="Refresh Data"
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 active:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            <span
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: "#ede9fe", color: "#7c3aed" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ADMIN
            </span>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
              >
                {adminName?.charAt(0) || "A"}
              </div>
              <span className="text-slate-800 font-bold text-sm hidden sm:block">{adminName || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" && <AnalyticsOverview key={refreshKey} adminName={adminName} setActiveTab={setActiveTab} />}
          {activeTab === "users" && <UserManagement key={refreshKey} />}
          {activeTab === "opticians" && <OpticianManagement key={refreshKey} />}
          {activeTab === "notifications" && <NotificationsManager key={refreshKey} />}
          {activeTab === "revenue" && <RevenueReports key={refreshKey} />}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Confirm Sign Out</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
              Are you sure you want to sign out of your administrator account? You will need to log back in to manage system settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer border-none text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user_email");
                  window.location.hash = "#/login";
                }}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer border-none text-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
