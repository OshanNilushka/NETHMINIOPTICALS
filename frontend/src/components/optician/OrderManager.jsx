import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

const dbToUiStatus = (status) => {
  switch (status) {
    case "PENDING": return "Pending";
    case "PROCESSING": return "Processing";
    case "READY_FOR_PICKUP": return "Ready";
    case "SHIPPED": return "Shipped";
    case "DELIVERED": return "Delivered";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
};

const uiToDbStatus = (status) => {
  switch (status) {
    case "Pending": return "PENDING";
    case "Processing": return "PROCESSING";
    case "Ready": return "READY_FOR_PICKUP";
    case "Shipped": return "SHIPPED";
    case "Delivered": return "DELIVERED";
    case "Completed": return "COMPLETED";
    case "Cancelled": return "CANCELLED";
    default: return status.toUpperCase();
  }
};

const STATUS_OPTIONS = ["Pending", "Processing", "Ready", "Shipped", "Delivered", "On Hold", "Completed", "Cancelled"];

// ─── HCI-compliant semantic colour map ────────────────────────────────────────
// Group 1 – Blue  : active / in-progress  (Pending, Processing, Ready, Shipped)
// Group 2 – Green : success / finished    (Delivered, Completed)
// Group 3 – Amber : warning               (On Hold)
// Group 4 – Red   : danger / stopped      (Cancelled)
const UNIFIED_UNSELECTED = "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300";

const statusConfig = {
  "Pending": {
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30",
  },
  "Processing": {
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30",
  },
  "Ready": {
    cls: "bg-blue-50 text-blue-800 border border-blue-300",
    dot: "bg-blue-600",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30",
  },
  "Shipped": {
    cls: "bg-blue-100 text-blue-900 border border-blue-300",
    dot: "bg-blue-700",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30",
  },
  "Delivered": {
    cls: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30",
  },
  "On Hold": {
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-400/25 ring-2 ring-amber-400/30",
  },
  "Completed": {
    cls: "bg-green-100 text-green-800 border border-green-300 font-black",
    dot: "bg-green-600",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30",
  },
  "Cancelled": {
    cls: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-400",
    unselectedCls: UNIFIED_UNSELECTED,
    selectedCls:   "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25 ring-2 ring-red-400/30",
  },
};

const priorityConfig = {
  "High":   "bg-red-50 text-red-600 border border-red-200",
  "Normal": "bg-slate-50 text-slate-600 border border-slate-200",
  "Low":    "bg-slate-50 text-slate-400 border border-slate-200",
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [notification, setNotification] = useState(null);
  const [newNote, setNewNote] = useState("");

  // Courier/Payment inputs
  const [courierNameInput, setCourierNameInput] = useState("");
  const [trackingNumInput, setTrackingNumInput] = useState("");
  const [paymentStatusInput, setPaymentStatusInput] = useState("PENDING");

  // Sync inputs on selected order change
  useEffect(() => {
    if (selected) {
      setCourierNameInput(selected.courierName || "");
      setTrackingNumInput(selected.trackingNumber || "");
      setPaymentStatusInput(selected.paymentStatus || "PENDING");
    } else {
      setCourierNameInput("");
      setTrackingNumInput("");
      setPaymentStatusInput("PENDING");
    }
  }, [selected]);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch orders.");

      const data = await response.json();
      const mapped = data.map(o => ({
        id: o.id.substring(0, 8).toUpperCase(),
        rawId: o.id,
        patient: o.patient?.fullName || "Anonymous Patient",
        patientId: o.patientId,
        date: o.createdAt.split('T')[0],
        items: o.items, // Keep all items in order mapping
        price: o.totalAmount,
        status: dbToUiStatus(o.status),
        priority: "Normal", // Default priority
        prescription: o.prescriptionId ? "Rx Active" : "No Rx Attached",
        notes: "",
        shippingAddress: o.shippingAddress,
        recipientName: o.recipientName,
        recipientPhone: o.recipientPhone,
        shippingCost: o.shippingCost,
        courierName: o.courierName,
        trackingNumber: o.trackingNumber,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
      }));

      setOrders(mapped);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (rawId, id, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const dbStatus = uiToDbStatus(status);
      const response = await fetch(`${API_BASE_URL}/api/orders/${rawId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: dbStatus })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update order status.");
      }

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      notify(`Order status updated to "${status}"`);
    } catch (err) {
      console.error(err);
      alert(`Error updating order: ${err.message}`);
    }
  };

  const updateOrderShippingDetails = async (rawId, courierName, trackingNumber, paymentStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/orders/${rawId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courierName, trackingNumber, paymentStatus })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update shipping details.");
      }

      setOrders(prev => prev.map(o => o.rawId === rawId ? { 
        ...o, 
        courierName, 
        trackingNumber, 
        paymentStatus 
      } : o));
      
      if (selected?.rawId === rawId) {
        setSelected(prev => ({ 
          ...prev, 
          courierName, 
          trackingNumber, 
          paymentStatus 
        }));
      }
      notify("Shipping and payment details saved!");
    } catch (err) {
      console.error(err);
      alert(`Error updating shipping: ${err.message}`);
    }
  };

  const saveNote = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, notes: newNote } : o));
    if (selected?.id === id) setSelected(prev => ({ ...prev, notes: newNote }));
    notify("Notes saved");
  };

  const filtered = orders
    .filter(o => filterStatus === "All" || o.status === filterStatus)
    .filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.patient.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] font-sans">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#1b5e85] animate-spin mb-4"></div>
        <p className="text-slate-500 text-xs font-semibold animate-pulse">Loading orders catalog...</p>
      </div>
    );
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 bg-emerald-500 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {notification}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Manager</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Process eyewear orders and update status in real time</p>
      </div>

      {/* Stat strip */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { label: "Total", value: orders.length, color: "text-slate-700 bg-slate-50 border-slate-200" },
          { label: "Processing", value: counts["Processing"] || 0, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Ready", value: counts["Ready"] || 0, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "On Hold", value: counts["On Hold"] || 0, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Completed", value: counts["Completed"] || 0, color: "text-teal-700 bg-teal-50 border-teal-200 font-extrabold" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border px-5 py-3 flex flex-col ${s.color}`}>
            <span className="text-2xl font-black leading-none">{s.value}</span>
            <span className="text-xs font-bold mt-0.5 opacity-70">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400" />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {["All", ...STATUS_OPTIONS].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${filterStatus === s ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filtered.map(order => {
              const cfg = statusConfig[order.status] || {};
              return (
                <button key={order.id} onClick={() => { setSelected(order); setNewNote(order.notes); }}
                  className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-md
                    ${selected?.id === order.id ? "border-blue-400 ring-2 ring-blue-400/20" : "border-slate-100"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-slate-900 text-sm">{order.id}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityConfig[order.priority]}`}>{order.priority}</span>
                      </div>
                      <p className="text-slate-500 text-xs truncate">{order.patient} · {order.date}</p>
                      <p className="text-slate-400 text-xs mt-1 truncate">
                        {order.items?.map(item => item.frame?.name || "Eyeglasses Frame").join(", ") || "No Frame Selected"}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.cls}`}>{order.status}</span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No orders found</p>}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 space-y-6">
            {/* Card 1: Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selected.id}</h2>
                  <p className="text-slate-500 text-sm">{selected.patient} · Placed {selected.date}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${(statusConfig[selected.status] || {}).cls}`}>{selected.status}</span>
              </div>

              {/* Order details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 sm:col-span-2 space-y-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eyewear Items ({selected.items?.length || 0})</p>
                  <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                    {selected.items?.map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-1.5 shadow-sm">
                        <p className="text-base font-extrabold text-slate-900">{item.frame?.name || "Eyeglasses Frame"}</p>
                        <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                          <span className="text-slate-400">Lens Type:</span> {item.lens?.type || "No Custom Lens"} <span className="text-slate-300">·</span> <span className="text-slate-400">Qty:</span> {item.quantity} <span className="text-slate-300">·</span> <span className="text-slate-400">Price:</span> LKR {item.price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Prescription Ref.</p>
                  <p className="text-slate-900 font-bold text-sm">{selected.prescription}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Price</p>
                  <p className="text-slate-900 font-bold text-sm">LKR {selected.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Status Warning Banners */}
            {selected.status === "Cancelled" && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 text-sm font-bold flex items-center gap-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <span>This order was cancelled and is locked from further edits.</span>
              </div>
            )}
            {selected.status === "Completed" && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-5 text-sm font-bold flex items-center gap-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>This order has been completed and is locked from further edits.</span>
              </div>
            )}

            {/* Update Status (Moved to Top) */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <p className="text-sm font-extrabold text-white uppercase tracking-widest">Update Order Status</p>
                </div>
                {/* Colour legend */}
                <div className="hidden sm:flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/90"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ring-2 ring-white/20"></span>Active</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/90"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block ring-2 ring-white/20"></span>Done</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/90"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ring-2 ring-white/20"></span>Hold</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/90"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-2 ring-white/20"></span>Stopped</span>
                </div>
              </div>
              <div className="bg-white px-5 py-5">
                <div className="flex flex-wrap gap-2.5">
                  {STATUS_OPTIONS.map(s => {
                    const cfg = statusConfig[s] || {};
                    const isCurrent = selected.status === s;
                    const isFinal = selected.status === "Cancelled" || selected.status === "Completed";
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.rawId, selected.id, s)}
                        disabled={isCurrent || isFinal}
                        title={s}
                        className={`px-5 py-3 rounded-2xl text-base font-black border transition-all duration-200 flex items-center shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0
                          ${isCurrent ? cfg.selectedCls : cfg.unselectedCls}
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full inline-block mr-2.5 shrink-0 ${isCurrent ? "bg-white ring-2 ring-white/40" : cfg.dot}`}></span>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* Shipping & Contact (Moved to Bottom) */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-sm font-extrabold text-white uppercase tracking-widest">Shipping & Contact</p>
              </div>

              {/* Info rows */}
              <div className="bg-white px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Recipient Name</p>
                    <p className="text-base font-black text-slate-900">{selected.recipientName || <span className="text-slate-450 font-medium">Not provided</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-base font-black text-slate-900 font-mono">{selected.recipientPhone || <span className="text-slate-450 font-medium">Not provided</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</p>
                    <p className="text-base font-black text-slate-900 leading-relaxed">{selected.shippingAddress || "In-Store Pickup"}</p>
                    <div className="flex items-center gap-2.5 mt-2">
                      <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        🚢 Shipping: LKR {selected.shippingCost?.toLocaleString() || "0"}
                      </span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        selected.paymentMethod === "CARD" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {selected.paymentMethod === "CARD" ? "💳 Card Payment" : "💵 Cash on Delivery"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking & Payment editor */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-5 space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-xs font-black text-slate-650 uppercase tracking-wider">Update Tracking & Payment</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1.5">Courier Partner</label>
                    <input
                      type="text"
                      placeholder="e.g. Prompt Express"
                      value={courierNameInput}
                      onChange={e => setCourierNameInput(e.target.value)}
                      disabled={selected.status === "Cancelled" || selected.status === "Completed"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1.5">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. PE-10293847"
                      value={trackingNumInput}
                      onChange={e => setTrackingNumInput(e.target.value)}
                      disabled={selected.status === "Cancelled" || selected.status === "Completed"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 font-mono placeholder-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1.5">Payment Status</label>
                    <select
                      value={paymentStatusInput}
                      onChange={e => setPaymentStatusInput(e.target.value)}
                      disabled={
                        selected.status === "Cancelled" ||
                        selected.status === "Completed" ||
                        // Lock if PayHere already confirmed a card payment
                        (selected.paymentMethod === "CARD" && selected.paymentStatus === "PAID")
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 transition"
                    >
                      <option value="PENDING">⏳ PENDING</option>
                      <option value="PAID">✅ PAID</option>
                      <option value="FAILED">❌ FAILED</option>
                    </select>
                    {/* PayHere lock notice */}
                    {selected.paymentMethod === "CARD" && selected.paymentStatus === "PAID" && (
                      <div className="mt-2.5 flex items-center gap-3 bg-emerald-600 text-white rounded-xl px-5 py-4 shadow-md shadow-emerald-500/20">
                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <div>
                          <p className="text-sm font-extrabold uppercase tracking-wide">Confirmed by PayHere</p>
                          <p className="text-xs font-semibold opacity-85 mt-0.5">This payment was verified by the gateway and cannot be changed.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => updateOrderShippingDetails(selected.rawId, courierNameInput, trackingNumInput, paymentStatusInput)}
                      disabled={selected.status === "Cancelled" || selected.status === "Completed"}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold py-3 rounded-xl text-sm tracking-wide hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Save Shipping & Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Card 4: Order Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Notes</p>
              <textarea 
                rows={3} 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)}
                disabled={selected.status === "Cancelled" || selected.status === "Completed"}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 resize-none disabled:opacity-60 disabled:bg-slate-100"
                placeholder={selected.status === "Cancelled" || selected.status === "Completed" ? "Order finalized. Notes are locked." : "Add notes about this order..."} 
              />
              {!(selected.status === "Cancelled" || selected.status === "Completed") && (
                <button 
                  onClick={() => saveNote(selected.id)}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Save Notes
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-slate-400 font-semibold">Select an order to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
