import { useState, useEffect } from "react";

const statusConfig = {
  "Pending Review": { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
  "Validated":      { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400" },
  "Rejected":       { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-400" },
};

const RxField = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl p-3 text-center">
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-slate-900 font-extrabold text-sm">{value || "—"}</p>
  </div>
);

export default function PrescriptionReview() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // States for correcting prescription values in-place
  const [editRx, setEditRx] = useState({
    odSph: "", odCyl: "", odAxis: "",
    osSph: "", osCyl: "", osAxis: "",
    pd: "", add: ""
  });

  // State for logging a new exam from scratch
  const [newRx, setNewRx] = useState({
    patientId: "",
    odSph: "", odCyl: "", odAxis: "",
    osSph: "", osCyl: "", osAxis: "",
    pd: "", add: "",
    notes: ""
  });

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/api/prescriptions/patients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/api/prescriptions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(rx => {
          const patientHistory = data
            .filter(other => other.patientId === rx.patientId && other.id !== rx.id)
            .map(h => ({
              date: h.createdAt.split('T')[0],
              od: { sphere: h.odSph !== null ? h.odSph.toFixed(2) : "—", cyl: h.odCyl !== null ? h.odCyl.toFixed(2) : "—", axis: h.odAxis !== null ? h.odAxis.toString() : "—" },
              os: { sphere: h.osSph !== null ? h.osSph.toFixed(2) : "—", cyl: h.osCyl !== null ? h.osCyl.toFixed(2) : "—", axis: h.osAxis !== null ? h.osAxis.toString() : "—" },
              pd: h.pd !== null ? h.pd.toString() : "—"
            }));

          return {
            id: rx.id,
            shortId: rx.id.substring(0, 8).toUpperCase(),
            patientName: rx.patient?.fullName || "Patient",
            patientId: rx.patient?.email || "None",
            date: rx.createdAt.split('T')[0],
            doctor: rx.optician?.user?.fullName || rx.optician?.fullName || (() => {
              const raw = rx.rawOcrResult || "";
              const match = raw.match(/(?:doctor(?:\s+name)?|dr\.?)\s*[:\-]?\s*(?:dr\.?\s*)?([a-z\s.]+)/i);
              if (match && match[1] && match[1].trim() && match[1].trim().toLowerCase() !== "name" && match[1].trim().toLowerCase() !== "unknown") {
                const clean = match[1].trim().replace(/\b[a-z]/g, (l) => l.toUpperCase());
                return clean.toLowerCase().startsWith("dr") ? clean : `Dr. ${clean}`;
              }
              return "Dr. Nayanagama";
            })(),
            status: rx.status === "PENDING" ? "Pending Review" : rx.status === "VALIDATED" ? "Validated" : "Rejected",
            rejectionReason: rx.rejectionReason || null,
            od: {
              sphere: rx.odSph !== null ? rx.odSph.toFixed(2) : "—",
              cyl: rx.odCyl !== null ? rx.odCyl.toFixed(2) : "—",
              axis: rx.odAxis !== null ? rx.odAxis.toString() : "—",
              va: "6/6"
            },
            os: {
              sphere: rx.osSph !== null ? rx.osSph.toFixed(2) : "—",
              cyl: rx.osCyl !== null ? rx.osCyl.toFixed(2) : "—",
              axis: rx.osAxis !== null ? rx.osAxis.toString() : "—",
              va: "6/6"
            },
            add: rx.odAdd !== null ? `+${rx.odAdd.toFixed(2)}` : "—",
            pd: rx.pd !== null ? rx.pd.toString() : "—",
            notes: rx.rawOcrResult || "No notes available.",
            imageUrl: rx.ocrImageUrl || null,
            history: patientHistory
          };
        });
        setPrescriptions(mapped);
        
        if (selected) {
          const updatedSelected = mapped.find(p => p.id === selected.id);
          if (updatedSelected) {
            setSelected(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  // Initialize edit fields when selected changes
  useEffect(() => {
    if (selected) {
      setEditRx({
        odSph: selected.od.sphere === "—" ? "" : selected.od.sphere,
        odCyl: selected.od.cyl === "—" ? "" : selected.od.cyl,
        odAxis: selected.od.axis === "—" ? "" : selected.od.axis,
        osSph: selected.os.sphere === "—" ? "" : selected.os.sphere,
        osCyl: selected.os.cyl === "—" ? "" : selected.os.cyl,
        osAxis: selected.os.axis === "—" ? "" : selected.os.axis,
        pd: selected.pd === "—" ? "" : selected.pd,
        add: selected.add === "—" ? "" : selected.add.replace("+", ""),
        doctor: selected.doctor || "Dr. Nayanagama",
      });
      setNotes(selected.notes);
    }
  }, [selected]);

  const updateStatus = async (id, newStatus, reason = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Session expired. Please log in again.", "error");
      return;
    }

    const dbStatus = newStatus === "Validated" ? "VALIDATED" : "REJECTED";

    try {
      const payload = { 
        status: dbStatus,
        odSph: editRx.odSph !== "" ? editRx.odSph : null,
        odCyl: editRx.odCyl !== "" ? editRx.odCyl : null,
        odAxis: editRx.odAxis !== "" ? editRx.odAxis : null,
        osSph: editRx.osSph !== "" ? editRx.osSph : null,
        osCyl: editRx.osCyl !== "" ? editRx.osCyl : null,
        osAxis: editRx.osAxis !== "" ? editRx.osAxis : null,
        pd: editRx.pd !== "" ? editRx.pd : null,
        odAdd: editRx.add !== "" ? editRx.add : null,
        rejectionReason: reason !== "" ? reason : null,
      };

      const response = await fetch(`http://localhost:3000/api/prescriptions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update prescription status.");
      }

      notify(`Prescription ${newStatus.toLowerCase()} successfully!`);
      await fetchPrescriptions();
    } catch (err) {
      console.error(err);
      notify(`Error: ${err.message}`, "error");
    }
  };

  const handleCreateRx = async (e) => {
    e.preventDefault();
    if (!newRx.patientId) {
      notify("Please select a patient.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: newRx.patientId,
          odSph: newRx.odSph || null,
          odCyl: newRx.odCyl || null,
          odAxis: newRx.odAxis || null,
          osSph: newRx.osSph || null,
          osCyl: newRx.osCyl || null,
          osAxis: newRx.osAxis || null,
          pd: newRx.pd || null,
          odAdd: newRx.add || null,
          rawOcrResult: newRx.notes || "Eye Exam Prescription"
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create prescription.");
      }

      notify("In-shop eye exam prescription logged and validated!");
      setShowCreateForm(false);
      setNewRx({ patientId: "", odSph: "", odCyl: "", odAxis: "", osSph: "", osCyl: "", osAxis: "", pd: "", add: "", notes: "" });
      await fetchPrescriptions();
      await fetchPatients();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const filtered = prescriptions.filter(p => filterStatus === "All" || p.status === filterStatus);

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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prescription Review</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Validate prescriptions, adjust values in real-time, and log in-shop eye exams</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: list */}
        <div className="w-full lg:w-[360px] shrink-0 space-y-3">
          <button 
            onClick={() => { setSelected(null); setShowCreateForm(true); }}
            className="w-full bg-[#1b5e85] hover:bg-[#154d70] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Log In-Shop Eye Exam
          </button>

          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {["All", "Pending Review", "Validated", "Rejected"].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setShowCreateForm(false); }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${filterStatus === s ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"}`}>
                {s === "All" ? "All" : s === "Pending Review" ? "Pending" : s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(rx => {
              const cfg = statusConfig[rx.status];
              return (
                <button key={rx.id} onClick={() => { setSelected(rx); setShowCreateForm(false); setShowHistory(false); }}
                  className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-md
                    ${selected?.id === rx.id ? "border-blue-400 ring-2 ring-blue-400/20" : "border-slate-100"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{rx.patientName}</p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{rx.shortId} · {rx.date}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{rx.doctor}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.cls}`}>
                      {rx.status}
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No prescriptions found</div>
            )}
          </div>
        </div>

        {/* Right panel: detail or log new prescription */}
        {showCreateForm && !selected ? (
          <form onSubmit={handleCreateRx} className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Log Eye Exam</h2>
                <p className="text-slate-500 text-xs mt-0.5">Log and validate prescription from a physical eye exam</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Select Patient */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Select Patient *</label>
              <select 
                required 
                value={newRx.patientId}
                onChange={e => setNewRx(p => ({ ...p, patientId: e.target.value }))}
                className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
              >
                <option value="">Choose a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right Eye (OD) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Right Eye (OD)</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">SPH</label>
                    <input type="number" step="0.25" placeholder="-1.50" value={newRx.odSph}
                      onChange={e => setNewRx(p => ({ ...p, odSph: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">CYL</label>
                    <input type="number" step="0.25" placeholder="-0.50" value={newRx.odCyl}
                      onChange={e => setNewRx(p => ({ ...p, odCyl: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">AXIS</label>
                    <input type="number" step="1" min="0" max="180" placeholder="90" value={newRx.odAxis}
                      onChange={e => setNewRx(p => ({ ...p, odAxis: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                </div>
              </div>

              {/* Left Eye (OS) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Left Eye (OS)</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">SPH</label>
                    <input type="number" step="0.25" placeholder="-1.25" value={newRx.osSph}
                      onChange={e => setNewRx(p => ({ ...p, osSph: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">CYL</label>
                    <input type="number" step="0.25" placeholder="-0.25" value={newRx.osCyl}
                      onChange={e => setNewRx(p => ({ ...p, osCyl: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">AXIS</label>
                    <input type="number" step="1" min="0" max="180" placeholder="95" value={newRx.osAxis}
                      onChange={e => setNewRx(p => ({ ...p, osAxis: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pupillary Distance (PD) *</label>
                <input type="number" step="0.5" placeholder="63" required value={newRx.pd}
                  onChange={e => setNewRx(p => ({ ...p, pd: e.target.value }))}
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Addition (ADD)</label>
                <input type="number" step="0.25" placeholder="1.50" value={newRx.add}
                  onChange={e => setNewRx(p => ({ ...p, add: e.target.value }))}
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none bg-white" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Notes</label>
              <textarea 
                rows={3} 
                placeholder="Diagnostic comments or doctor recommendations..."
                value={newRx.notes}
                onChange={e => setNewRx(p => ({ ...p, notes: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-[#1b5e85] text-white rounded-xl font-bold text-xs hover:bg-[#154d70] transition-colors"
              >
                Save & Validate Rx
              </button>
            </div>
          </form>
        ) : selected ? (
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 overflow-y-auto max-h-[85vh]">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 className="text-xl font-extrabold text-slate-900">{selected.patientName}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConfig[selected.status].cls}`}>
                    {selected.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">{selected.shortId} · Issued {selected.date} by {selected.doctor}</p>
              </div>
              <div className="flex gap-2">
                {selected.status === "Pending Review" && (
                  <>
                    <button onClick={() => updateStatus(selected.id, "Validated")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Validate Corrected Rx
                    </button>
                    <button onClick={() => {
                      setRejectionReason("The uploaded image is too blurry to read.");
                      setCustomReason("");
                      setShowRejectModal(true);
                    }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Rx table (Editable if status is Pending Review) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription Values</p>
                {selected.status === "Pending Review" && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">Editable mode active - verify against scan below</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Right Eye (OD)", isOD: true, data: selected.od },
                  { title: "Left Eye (OS)", isOD: false, data: selected.os },
                ].map(eye => (
                  <div key={eye.title} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="font-bold text-slate-700 text-sm mb-3">{eye.title}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selected.status === "Pending Review" ? (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">SPH</label>
                            <input 
                              type="number" step="0.25"
                              value={eye.isOD ? editRx.odSph : editRx.osSph}
                              onChange={e => setEditRx(prev => eye.isOD ? { ...prev, odSph: e.target.value } : { ...prev, osSph: e.target.value })}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">CYL</label>
                            <input 
                              type="number" step="0.25"
                              value={eye.isOD ? editRx.odCyl : editRx.osCyl}
                              onChange={e => setEditRx(prev => eye.isOD ? { ...prev, odCyl: e.target.value } : { ...prev, osCyl: e.target.value })}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">AXIS</label>
                            <input 
                              type="number" step="1" min="0" max="180"
                              value={eye.isOD ? editRx.odAxis : editRx.osAxis}
                              onChange={e => setEditRx(prev => eye.isOD ? { ...prev, odAxis: e.target.value } : { ...prev, osAxis: e.target.value })}
                              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                            />
                          </div>
                          <RxField label="VA" value={eye.data.va} />
                        </>
                      ) : (
                        <>
                          <RxField label="SPH" value={eye.data.sphere} />
                          <RxField label="CYL" value={eye.data.cyl} />
                          <RxField label="AXIS" value={eye.data.axis} />
                          <RxField label="VA" value={eye.data.va} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* PD, ADD & Doctor Name */}
              <div className="flex gap-4 mt-3 flex-wrap items-center">
                {selected.status === "Pending Review" ? (
                  <>
                    <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-slate-100 min-w-[150px]">
                      <span className="text-slate-500 text-xs font-bold">PD</span>
                      <input 
                        type="number" step="0.5"
                        value={editRx.pd}
                        onChange={e => setEditRx(prev => ({ ...prev, pd: e.target.value }))}
                        className="w-20 text-xs font-extrabold border border-slate-200 rounded-lg p-1 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                      />
                      <span className="text-xs text-slate-400 font-medium">mm</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-slate-100 min-w-[150px]">
                      <span className="text-slate-500 text-xs font-bold">ADD</span>
                      <input 
                        type="number" step="0.25"
                        value={editRx.add}
                        onChange={e => setEditRx(prev => ({ ...prev, add: e.target.value }))}
                        className="w-20 text-xs font-extrabold border border-slate-200 rounded-lg p-1 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none"
                      />
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-slate-100 flex-1 min-w-[220px]">
                      <span className="text-slate-500 text-xs font-bold shrink-0">Doctor Name:</span>
                      <input 
                        type="text"
                        value={editRx.doctor || ""}
                        onChange={e => setEditRx(prev => ({ ...prev, doctor: e.target.value }))}
                        placeholder="Dr. Nayanagama"
                        className="w-full text-xs font-extrabold border border-slate-200 rounded-lg p-1 bg-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none text-slate-900"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-100">
                      <span className="text-slate-500 text-xs font-bold">PD</span>
                      <span className="text-slate-900 font-extrabold">{selected.pd} mm</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-100">
                      <span className="text-slate-500 text-xs font-bold">ADD</span>
                      <span className="text-slate-900 font-extrabold">{selected.add}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-100">
                      <span className="text-slate-500 text-xs font-bold">Doctor Name:</span>
                      <span className="text-slate-900 font-extrabold">{selected.doctor}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Original Uploaded Slip */}
            {selected.imageUrl && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Original Uploaded Slip</p>
                <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/50 shadow-inner">
                  <img
                    src={selected.imageUrl.startsWith("http") ? selected.imageUrl : `http://localhost:3000${selected.imageUrl}`}
                    alt="Uploaded Prescription Slip"
                    className="max-h-64 rounded-xl object-contain mx-auto border border-slate-200 shadow-sm"
                  />
                  <div className="text-center mt-2.5">
                    <a
                      href={selected.imageUrl.startsWith("http") ? selected.imageUrl : `http://localhost:3000${selected.imageUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Original Image in New Tab
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason Display for Optician */}
            {selected.status === "Rejected" && selected.rejectionReason && (
              <div className="bg-rose-50 border border-rose-250 rounded-2xl p-4 text-rose-700 text-xs font-semibold">
                <strong>Rejection Reason:</strong> {selected.rejectionReason}
              </div>
            )}

            {/* Clinical notes */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Notes / OCR Text</p>
              <textarea
                rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 resize-none"
                placeholder="Add clinical notes..."
              />
              <button onClick={() => notify("Notes saved")}
                className="mt-2 px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors">
                Save Notes
              </button>
            </div>

            {/* Clinical history toggle */}
            <div>
              <button onClick={() => setShowHistory(h => !h)}
                className="flex items-center gap-2 text-sm font-bold text-[#1b5e85] hover:text-blue-700 transition-colors">
                <svg className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Clinical History ({selected.history.length} previous records)
              </button>

              {showHistory && (
                <div className="mt-3 space-y-3">
                  {selected.history.length === 0 ? (
                    <p className="text-slate-400 text-sm px-2">No previous records found.</p>
                  ) : (
                    selected.history.map((h, i) => (
                      <div key={i} className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-blue-600 mb-2">Exam Date: {h.date}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {[
                            { label: "OD SPH", val: h.od.sphere }, { label: "OD CYL", val: h.od.cyl }, { label: "OD AXIS", val: h.od.axis },
                            { label: "OS SPH", val: h.os.sphere }, { label: "OS CYL", val: h.os.cyl }, { label: "OS AXIS", val: h.os.axis },
                            { label: "PD", val: h.pd + " mm" },
                          ].map((f, j) => (
                            <div key={j} className="bg-white rounded-lg p-2 text-center">
                              <p className="text-slate-400 text-[10px] font-bold">{f.label}</p>
                              <p className="text-slate-800 font-extrabold">{f.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-400 font-semibold">Select a prescription to review or log a new eye exam</p>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 animate-[popupFadeUp_0.25s_ease]">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Reject Prescription</h3>
              <p className="text-slate-500 text-xs mt-0.5">Please provide a reason for rejecting this prescription slip.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">Select a Reason</label>
              {[
                "The uploaded image is too blurry to read.",
                "The doctor's signature or stamp is missing.",
                "The prescription has expired.",
                "The details do not match the uploaded slip.",
                "Other (Write custom reason below)"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="accent-blue-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {rejectionReason === "Other (Write custom reason below)" && (
              <div className="animate-[popupFadeUp_0.2s_ease]">
                <label className="text-xs font-bold text-slate-600 block mb-1">Custom Rejection Reason</label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter the specific reason for rejecting this prescription..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const finalReason = rejectionReason === "Other (Write custom reason below)" ? customReason : rejectionReason;
                  if (!finalReason.trim()) {
                    alert("Please provide or select a rejection reason.");
                    return;
                  }
                  setShowRejectModal(false);
                  await updateStatus(selected.id, "Rejected", finalReason);
                }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-colors shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
