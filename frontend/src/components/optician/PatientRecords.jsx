import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

const statusBadge = (status) => {
  const map = {
    "VALIDATED":   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Validated":   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "REJECTED":    "bg-red-50 text-red-700 border border-red-200",
    "Rejected":    "bg-red-50 text-red-700 border border-red-200",
    "PENDING":     "bg-amber-50 text-amber-700 border border-amber-200",
    "Pending Review": "bg-amber-50 text-amber-700 border border-amber-200",
    "PROCESSING":  "bg-blue-50 text-blue-700 border border-blue-200",
    "Processing":  "bg-blue-50 text-blue-700 border border-blue-200",
    "COMPLETED":   "bg-slate-100 text-slate-600 border border-slate-200",
    "Completed":   "bg-slate-100 text-slate-600 border border-slate-200",
    "READY":       "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Ready":       "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "READY_FOR_PICKUP": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "CANCELLED":   "bg-red-50 text-red-700 border border-red-200",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeDetail, setActiveDetail] = useState("profile");
  const [notification, setNotification] = useState(null);

  // Form states
  const [showRxForm, setShowRxForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [frames, setFrames] = useState([]);
  const [lenses, setLenses] = useState([]);

  // Prescription Form Data
  const [rxForm, setRxForm] = useState({
    odSph: "", odCyl: "", odAxis: "",
    osSph: "", osCyl: "", osAxis: "",
    pd: "",
  });

  // Order Form Data
  const [orderForm, setOrderForm] = useState({
    frameId: "",
    lensId: "",
    quantity: 1,
    prescriptionId: "",
  });

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPatients = async (selectedIdToKeep = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/patients`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch patient records.");
      const data = await response.json();
      
      const adapted = data.map(p => ({
        id: p.id,
        name: p.fullName,
        dob: p.dob ? p.dob.split('T')[0] : "N/A",
        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : "N/A",
        phone: p.phoneNumber || "N/A",
        email: p.email,
        gender: p.gender || "N/A",
        bloodType: "O+", 
        address: "Insight Opticals Walk-in Patient", 
        conditions: ["Walk-in Care"], 
        allergies: [], 
        prescriptions: p.prescriptionsAsPatient.map(r => ({
          id: r.id,
          date: r.createdAt.split('T')[0],
          od: { 
            sph: r.odSph !== null ? String(r.odSph) : "-", 
            cyl: r.odCyl !== null ? String(r.odCyl) : "-", 
            axis: r.odAxis !== null ? String(r.odAxis) : "-" 
          },
          os: { 
            sph: r.osSph !== null ? String(r.osSph) : "-", 
            cyl: r.osCyl !== null ? String(r.osCyl) : "-", 
            axis: r.osAxis !== null ? String(r.osAxis) : "-" 
          },
          pd: r.pd !== null ? String(r.pd) : "-",
          doctor: "Dr. John Doe", 
          status: r.status,
        })),
        orders: p.orders.map(o => ({
          id: o.id,
          date: o.createdAt.split('T')[0],
          item: o.items.map(item => {
            let text = item.frame?.name || "Frame";
            if (item.lens?.type) text += ` + ${item.lens.type}`;
            return text;
          }).join(", "),
          price: `LKR ${o.totalAmount.toLocaleString()}`,
          status: o.status,
        }))
      }));

      setPatients(adapted);
      if (selectedIdToKeep) {
        const updatedSelected = adapted.find(p => p.id === selectedIdToKeep);
        if (updatedSelected) {
          setSelected(updatedSelected);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const framesRes = await fetch(`${API_BASE_URL}/api/products`);
      if (framesRes.ok) {
        const framesData = await framesRes.json();
        setFrames(framesData);
      }
      const lensesRes = await fetch(`${API_BASE_URL}/api/products/lenses`);
      if (lensesRes.ok) {
        const lensesData = await lensesRes.json();
        setLenses(lensesData);
      }
    } catch (err) {
      console.error("Error loading products/lenses catalog:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchCatalog();
  }, []);

  const handleRxSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          patientId: selected.id,
          odSph: rxForm.odSph || null,
          odCyl: rxForm.odCyl || null,
          odAxis: rxForm.odAxis || null,
          osSph: rxForm.osSph || null,
          osCyl: rxForm.osCyl || null,
          osAxis: rxForm.osAxis || null,
          pd: rxForm.pd || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to log prescription.");
      }

      notify("Prescription logged and validated successfully!");
      setShowRxForm(false);
      setRxForm({
        odSph: "", odCyl: "", odAxis: "",
        osSph: "", osCyl: "", osAxis: "",
        pd: "",
      });
      await fetchPatients(selected.id);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    if (!orderForm.frameId) {
      notify("Please select a frame.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          patientId: selected.id,
          frameId: orderForm.frameId,
          lensId: orderForm.lensId || null,
          quantity: parseInt(orderForm.quantity) || 1,
          prescriptionId: orderForm.prescriptionId || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create order.");
      }

      notify("Order created successfully!");
      setShowOrderForm(false);
      setOrderForm({
        frameId: "",
        lensId: "",
        quantity: 1,
        prescriptionId: "",
      });
      await fetchPatients(selected.id);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Notification banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 transition-all
          ${notification.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {notification.type === "error"
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          }
          {notification.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Records</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Access prescription records, clinical history, and order history</p>
      </div>

      {loading && patients.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-bold">Loading patient records...</div>
      ) : error && patients.length === 0 ? (
        <div className="py-12 text-center text-red-500 font-bold">Error: {error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Patient list */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400" />
            </div>

            {filtered.map(p => (
              <button key={p.id} onClick={() => { setSelected(p); setActiveDetail("profile"); setShowRxForm(false); setShowOrderForm(false); }}
                className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-md
                  ${selected?.id === p.id ? "border-blue-400 ring-2 ring-blue-400/20" : "border-slate-100"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                    <p className="text-slate-400 text-xs truncate">{p.email}</p>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">No matching patients found</p>
            )}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Patient header */}
              <div className="bg-gradient-to-r from-[#0f2d45] to-[#1a4a6b] p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-black">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">{selected.name}</h2>
                    <p className="text-white/70 text-sm">DOB: {selected.dob} · Gender: {selected.gender}</p>
                    <p className="text-white/60 text-xs mt-0.5">{selected.phone} · {selected.email}</p>
                  </div>
                </div>
              </div>

              {/* Detail tabs */}
              <div className="flex border-b border-slate-100 px-6 bg-slate-50">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "prescriptions", label: `Prescriptions (${selected.prescriptions.length})` },
                  { id: "orders", label: `Order History (${selected.orders.length})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => { setActiveDetail(tab.id); setShowRxForm(false); setShowOrderForm(false); }}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                      ${activeDetail === tab.id ? "border-[#1b5e85] text-[#1b5e85]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Profile tab */}
                {activeDetail === "profile" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", value: selected.name },
                      { label: "Date of Birth", value: selected.dob },
                      { label: "Age", value: `${selected.age} years` },
                      { label: "Phone", value: selected.phone },
                      { label: "Email", value: selected.email },
                      { label: "Gender", value: selected.gender },
                    ].map((f, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                        <p className="text-slate-900 font-semibold text-sm">{f.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescriptions tab */}
                {activeDetail === "prescriptions" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-extrabold text-slate-800 text-base">Prescription Records</h3>
                      <button 
                        onClick={() => setShowRxForm(!showRxForm)}
                        className="bg-[#1b5e85] hover:bg-[#154d70] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        {showRxForm ? "Cancel" : "+ Log Prescription"}
                      </button>
                    </div>

                    {/* Prescription Form */}
                    {showRxForm && (
                      <form onSubmit={handleRxSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4 animate-fadeIn">
                        <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">Log New Validated Prescription</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Right Eye (OD) */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Right Eye (OD)</h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">SPH</label>
                                <input type="number" step="0.25" placeholder="-1.50" value={rxForm.odSph}
                                  onChange={e => setRxForm(p => ({ ...p, odSph: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">CYL</label>
                                <input type="number" step="0.25" placeholder="-0.50" value={rxForm.odCyl}
                                  onChange={e => setRxForm(p => ({ ...p, odCyl: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">AXIS</label>
                                <input type="number" step="1" min="0" max="180" placeholder="90" value={rxForm.odAxis}
                                  onChange={e => setRxForm(p => ({ ...p, odAxis: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                            </div>
                          </div>

                          {/* Left Eye (OS) */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Left Eye (OS)</h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">SPH</label>
                                <input type="number" step="0.25" placeholder="-1.25" value={rxForm.osSph}
                                  onChange={e => setRxForm(p => ({ ...p, osSph: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">CYL</label>
                                <input type="number" step="0.25" placeholder="-0.25" value={rxForm.osCyl}
                                  onChange={e => setRxForm(p => ({ ...p, osCyl: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">AXIS</label>
                                <input type="number" step="1" min="0" max="180" placeholder="95" value={rxForm.osAxis}
                                  onChange={e => setRxForm(p => ({ ...p, osAxis: e.target.value }))}
                                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Pupillary Distance (PD) *</label>
                          <input type="number" step="0.5" placeholder="63" required value={rxForm.pd}
                            onChange={e => setRxForm(p => ({ ...p, pd: e.target.value }))}
                            className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none max-w-[200px]" />
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                          <button type="button" onClick={() => setShowRxForm(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                          <button type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1b5e85] text-white hover:bg-[#154d70] transition-colors">Submit Validated Rx</button>
                        </div>
                      </form>
                    )}

                    {selected.prescriptions.map((rx, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div>
                            <p className="font-bold text-slate-900 text-xs">ID: {rx.id}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{rx.date} · Optician Checked</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge(rx.status)}`}>{rx.status}</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                          {[
                            { label: "OD SPH", val: rx.od.sph }, { label: "OD CYL", val: rx.od.cyl }, { label: "OD AXIS", val: rx.od.axis },
                            { label: "OS SPH", val: rx.os.sph }, { label: "OS CYL", val: rx.os.cyl }, { label: "OS AXIS", val: rx.os.axis },
                            { label: "PD", val: rx.pd + " mm" },
                          ].map((f, j) => (
                            <div key={j} className="bg-white rounded-xl p-2 border border-slate-100">
                              <p className="text-slate-400 text-[9px] font-bold uppercase">{f.label}</p>
                              <p className="text-slate-900 font-extrabold text-xs mt-0.5">{f.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {selected.prescriptions.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-6">No prescription records found</p>
                    )}
                  </div>
                )}

                {/* Orders tab */}
                {activeDetail === "orders" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-extrabold text-slate-800 text-base">Order History</h3>
                      <button 
                        onClick={() => setShowOrderForm(!showOrderForm)}
                        className="bg-[#1b5e85] hover:bg-[#154d70] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        {showOrderForm ? "Cancel" : "+ Create Order"}
                      </button>
                    </div>

                    {/* Order Form */}
                    {showOrderForm && (
                      <form onSubmit={handleOrderSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4 animate-fadeIn">
                        <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">Create New Direct Order</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Frame Select */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Select Frame *</label>
                            <select 
                              required 
                              value={orderForm.frameId}
                              onChange={e => setOrderForm(p => ({ ...p, frameId: e.target.value }))}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            >
                              <option value="">Choose a Frame...</option>
                              {frames.map(f => (
                                <option key={f.id} value={f.id} disabled={f.stockLevel === 0}>
                                  {f.brand} - {f.name} (LKR {f.price.toLocaleString()}) {f.stockLevel === 0 ? "(OUT OF STOCK)" : `[Stock: ${f.stockLevel}]`}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Lens Select */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Select Lens (Optional)</label>
                            <select 
                              value={orderForm.lensId}
                              onChange={e => setOrderForm(p => ({ ...p, lensId: e.target.value }))}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            >
                              <option value="">None (Frame Only)</option>
                              {lenses.map(l => (
                                <option key={l.id} value={l.id} disabled={l.stockLevel === 0}>
                                  {l.type} - LKR {l.price.toLocaleString()} {l.stockLevel === 0 ? "(OUT OF STOCK)" : `[Stock: ${l.stockLevel}]`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Quantity */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Quantity *</label>
                            <input 
                              type="number" min="1" max="10" required 
                              value={orderForm.quantity}
                              onChange={e => setOrderForm(p => ({ ...p, quantity: e.target.value }))}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none bg-white"
                            />
                          </div>

                          {/* Prescription Link */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Link Prescription (Optional)</label>
                            <select 
                              value={orderForm.prescriptionId}
                              onChange={e => setOrderForm(p => ({ ...p, prescriptionId: e.target.value }))}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            >
                              <option value="">None</option>
                              {selected.prescriptions.map(rx => (
                                <option key={rx.id} value={rx.id}>
                                  Rx: {rx.id.substring(0, 8)}... ({rx.date}) SPH OD:{rx.od.sph} OS:{rx.os.sph}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                          <button type="button" onClick={() => setShowOrderForm(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                          <button type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1b5e85] text-white hover:bg-[#154d70] transition-colors">Create Order</button>
                        </div>
                      </form>
                    )}

                    {selected.orders.map((o, i) => (
                      <div key={i} className="flex items-start justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs">ID: {o.id}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{o.date}</p>
                          <p className="text-slate-600 text-xs mt-1.5 font-bold">{o.item}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-slate-900 text-sm">{o.price}</p>
                          <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusBadge(o.status)}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                    {selected.orders.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-6">No order history found</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-semibold">Select a patient to view their records</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
