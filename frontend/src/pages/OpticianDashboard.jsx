import { useState, useEffect } from "react";
import OpticianSidebar from "../components/optician/OpticianSidebar";
import StockManager from "../components/optician/StockManager";
import PrescriptionReview from "../components/optician/PrescriptionReview";
import OrderManager from "../components/optician/OrderManager";
import PatientRecords from "../components/optician/PatientRecords";
import AppointmentScheduler from "../components/optician/AppointmentScheduler";
import LensFrameAdvisor from "../components/optician/LensFrameAdvisor";
import FeedbackReviewManager from "../components/optician/FeedbackReviewManager";
import PickupNotificationModal from "../components/optician/PickupNotificationModal";
import { API_BASE_URL } from "../config/api";

// ─── Overview Panel ────────────────────────────────────────────────
function OverviewPanel({ opticianName, setActiveTab, onOpenPickupModal }) {
  const stats = [
    { label: "Pending Orders", value: "5", change: "+2 today", color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { label: "Rx Awaiting Review", value: "3", change: "1 urgent", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: "Low Stock Items", value: "2", change: "Action needed", color: "text-red-600", bg: "bg-red-50 border-red-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" /></svg> },
    { label: "Today's Appointments", value: "2", change: "Next: 10:00 AM", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  const recentActivity = [
    { time: "10 min ago", text: "Order ORD-8942 moved to Processing", type: "order" },
    { time: "25 min ago", text: "Prescription RX-1001 validated for Amara Silva", type: "rx" },
    { time: "1 hr ago", text: "Stock updated: Classic Aviator +5 units", type: "stock" },
    { time: "2 hr ago", text: "New appointment scheduled: Ravi Kumara at 2:00 PM", type: "appt" },
    { time: "3 hr ago", text: "Order ORD-8850 marked as Ready", type: "order" },
  ];

  const activityColors = {
    order: "bg-blue-100 text-blue-600",
    rx: "bg-amber-100 text-amber-600",
    stock: "bg-violet-100 text-violet-600",
    appt: "bg-emerald-100 text-emerald-600",
  };

  const quickActions = [
    { label: "Add Appointment", icon: "📅", tab: "appointments" },
    { label: "Review Prescription", icon: "📋", tab: "prescriptions" },
    { label: "Update Stock", icon: "📦", tab: "stock" },
    { label: "Process Order", icon: "🛍️", tab: "orders" },
    { label: "Find Patient", icon: "👤", tab: "patients" },
    { label: "Frame Advisor", icon: "👓", tab: "advisor" },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Good morning, <span className="text-[#1b5e85]">{opticianName || "Optician"} 👋</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening in your clinic today — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-3xl border p-5 ${s.bg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color} bg-white shadow-sm`}>
              {s.icon}
            </div>
            <p className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-slate-700 font-bold text-sm mt-0.5">{s.label}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((a, i) => (
              <button key={i}
                onClick={() => setActiveTab(a.tab)}
                className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm font-bold text-slate-700 hover:text-[#1b5e85] hover:border-blue-200 cursor-pointer">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-center text-xs leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${activityColors[item.type]}`}>
                  {item.type === "order" ? "🛍" : item.type === "rx" ? "📋" : item.type === "stock" ? "📦" : "📅"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm font-medium leading-snug">{item.text}</p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="mt-6 bg-gradient-to-r from-[#0f2d45] to-[#1a4a6b] rounded-3xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-extrabold text-base">Orders are ready for customer pickup 🎉</p>
          <p className="text-white/60 text-sm mt-0.5">Click below to review customer details and dispatch notification emails.</p>
        </div>
        <button
          onClick={onOpenPickupModal}
          className="shrink-0 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Send Email Notifications
        </button>
      </div>
    </div>
  );
}

// ─── Main Optician Dashboard ───────────────────────────────────────
export default function OpticianDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [opticianName, setOpticianName] = useState("Sarah Perera");
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPickupEmailModal, setShowPickupEmailModal] = useState(false);

  const fetchNotifications = async (isInitial = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        const unread = data.filter(n => !n.isRead);
        setUnreadCount(unread.length);
        if (isInitial && unread.length > 0) {
          setShowNotifDropdown(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    // Fetch profile
    fetch(`${API_BASE_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then(d => setOpticianName(d.fullName))
      .catch(() => { });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id, type) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchNotifications();
        // Redirect to corresponding tab
        if (type === "APPOINTMENT_BOOKED") {
          setActiveTab("appointments");
        } else if (type === "PRESCRIPTION_PENDING") {
          setActiveTab("prescriptions");
        } else if (type === "ORDER_PLACED") {
          setActiveTab("orders");
        }
        setShowNotifDropdown(false);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
      {/* Sidebar */}
      <OpticianSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        opticianName={opticianName}
        onLogout={() => setShowLogoutModal(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
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
            <p className="text-slate-900 font-extrabold text-lg capitalize leading-tight">
              {activeTab === "overview" ? "Dashboard Overview" :
                activeTab === "stock" ? "Stock Manager" :
                  activeTab === "prescriptions" ? "Prescription Review" :
                    activeTab === "orders" ? "Order Manager" :
                      activeTab === "patients" ? "Patient Records" :
                        activeTab === "appointments" ? "Appointment Scheduler" :
                          activeTab === "advisor" ? "Lens & Frame Advisor" :
                            "Customer Feedbacks"}
            </p>
          </div>

          {/* Header right: notifications + profile */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Refresh Button */}
            <button
              onClick={() => {
                setRefreshKey(prev => prev + 1);
                fetchNotifications();
              }}
              title="Refresh Data"
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 active:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 flex flex-col overflow-hidden max-h-[400px]">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-800">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id, notif.type)}
                          className={`px-4 py-3 cursor-pointer transition-colors text-left flex gap-2.5 items-start ${notif.isRead ? "hover:bg-slate-50" : "bg-blue-50/20 hover:bg-blue-55/30"
                            }`}
                        >
                          <div className="mt-1 shrink-0">
                            {!notif.isRead ? (
                              <span className="block w-1.5 h-1.5 rounded-full bg-blue-500" />
                            ) : (
                              <span className="block w-1.5 h-1.5 rounded-full bg-transparent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-800 truncate">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile avatar */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {opticianName?.charAt(0) || "O"}
              </div>
              <span className="text-slate-800 font-bold text-sm hidden sm:block">{opticianName}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <OverviewPanel
              key={refreshKey}
              opticianName={opticianName}
              setActiveTab={setActiveTab}
              onOpenPickupModal={() => setShowPickupEmailModal(true)}
            />
          )}
          {activeTab === "stock" && <StockManager key={refreshKey} />}
          {activeTab === "prescriptions" && <PrescriptionReview key={refreshKey} />}
          {activeTab === "orders" && <OrderManager key={refreshKey} />}
          {activeTab === "patients" && <PatientRecords key={refreshKey} />}
          {activeTab === "appointments" && <AppointmentScheduler key={refreshKey} />}
          {activeTab === "advisor" && <LensFrameAdvisor key={refreshKey} />}
          {activeTab === "feedbacks" && <FeedbackReviewManager key={refreshKey} />}
        </main>
      </div>

      {/* Pickup Email Notification Modal */}
      <PickupNotificationModal
        isOpen={showPickupEmailModal}
        onClose={() => setShowPickupEmailModal(false)}
        onRefresh={() => setRefreshKey((prev) => prev + 1)}
      />

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
              Are you sure you want to sign out of your optician account? Any unsaved changes will be lost.
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