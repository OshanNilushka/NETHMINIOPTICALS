import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const APPOINTMENT_TYPES = ["Eye Exam", "Frame Fitting", "Prescription Pickup", "Contact Lens Fitting", "Follow-Up", "Consultation"];
const DOCTORS = ["Dr. Sarah Perera", "Dr. James Wong", "Dr. Kavya Raj"];

const statusConfig = {
  "Confirmed": { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "Pending": { cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  "Cancelled": { cls: "bg-red-50 text-red-700 border border-red-200" },
  "Completed": { cls: "bg-slate-100 text-slate-600 border border-slate-200" },
};

const typeColors = {
  "Eye Exam": "bg-blue-50 text-blue-700",
  "Frame Fitting": "bg-violet-50 text-violet-700",
  "Prescription Pickup": "bg-emerald-50 text-emerald-700",
  "Contact Lens Fitting": "bg-cyan-50 text-cyan-700",
  "Follow-Up": "bg-orange-50 text-orange-700",
  "Consultation": "bg-slate-100 text-slate-600",
};

const TODAY = new Date().toISOString().split('T')[0];

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newAppt, setNewAppt] = useState({
    patient: "", patientId: "", date: "", time: "9:00 AM",
    type: "Eye Exam", doctor: DOCTORS[0], notes: "", status: "Pending",
  });

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const formatUtcToSlot = (dateTimeStr) => {
    const d = new Date(dateTimeStr);
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = String(minutes).padStart(2, '0');
    return `${hours}:${minStr} ${ampm}`;
  };

  const parseNotesMetadata = (notes) => {
    if (!notes) return { reason: "Eye Exam", location: "Giriulla Branch", doctor: "Dr. Sarah Perera", displayNotes: "" };
    const locationMatch = notes.match(/Location:\s*([^|]+)/);
    const typeMatch = notes.match(/Type:\s*([^|]+)/);
    const docMatch = notes.match(/Doctor:\s*([^|]+)/);
    const notesMatch = notes.match(/Notes:\s*(.+)$/);
    
    // Check if there's a prepended guest name
    let guestPatientName = null;
    const patientMatch = notes.match(/Patient:\s*([^|]+)/);
    if (patientMatch) {
      guestPatientName = patientMatch[1].trim();
    }

    return {
      location: locationMatch ? locationMatch[1].trim() : "Giriulla Branch",
      reason: typeMatch ? typeMatch[1].trim() : "Eye Exam",
      doctor: docMatch ? docMatch[1].trim() : "Dr. Sarah Perera",
      displayNotes: notesMatch ? notesMatch[1].trim() : notes,
      guestPatientName
    };
  };

  const mapDbStatusToUi = (status) => {
    const map = {
      "PENDING": "Pending",
      "CONFIRMED": "Confirmed",
      "CANCELLED": "Cancelled",
      "COMPLETED": "Completed"
    };
    return map[status] || status;
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(apt => {
          const meta = parseNotesMetadata(apt.notes);
          const dateObj = new Date(apt.dateTime);
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayName = daysOfWeek[dateObj.getUTCDay()];
          
          return {
            id: apt.id.substring(0, 8).toUpperCase(),
            rawId: apt.id,
            patient: meta.guestPatientName || apt.patient?.fullName || "Unregistered Patient",
            patientId: apt.patient?.email || "None",
            date: apt.dateTime.split('T')[0],
            day: dayName,
            time: formatUtcToSlot(apt.dateTime),
            type: meta.reason,
            doctor: meta.doctor,
            status: mapDbStatusToUi(apt.status),
            notes: meta.displayNotes
          };
        });
        setAppointments(mapped);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (rawId, newUiStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Session expired. Please log in.");
      return;
    }

    const dbStatus = newUiStatus.toUpperCase();
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${rawId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: dbStatus })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update status.");
      }

      notify(`Appointment marked as ${newUiStatus}`);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  const addAppointment = async () => {
    if (!newAppt.patient || !newAppt.date) { notify("Please fill patient name and date"); return; }
    
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Session expired. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          patient: newAppt.patient,
          date: newAppt.date,
          time: newAppt.time,
          type: newAppt.type,
          doctor: newAppt.doctor,
          notes: newAppt.notes,
          location: "Giriulla Branch" // Default to Giriulla branch for optician scheduled
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to schedule appointment.");
      }

      setShowModal(false);
      setNewAppt({ patient: "", patientId: "", date: "", time: "9:00 AM", type: "Eye Exam", doctor: DOCTORS[0], notes: "", status: "Pending" });
      notify("Appointment scheduled successfully");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(`Error scheduling: ${err.message}`);
    }
  };

  const filtered = appointments.filter(a => filterStatus === "All" || a.status === filterStatus);
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const pendingCount = appointments.filter(a => a.status === "Pending").length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 bg-emerald-500 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Scheduler</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Schedule, manage, and track patient appointments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAppointments} disabled={loading}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all">
            Refresh
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1b5e85] hover:bg-[#154d70] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Appointments", value: todayAppts.length, color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Pending Confirmation", value: pendingCount, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Total Bookings", value: appointments.length, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Confirmed", value: appointments.filter(a => a.status === "Confirmed").length, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Today's quick view */}
      {todayAppts.length > 0 && (
        <div className="bg-gradient-to-r from-[#0f2d45] to-[#1a4a6b] rounded-3xl p-5 mb-6 text-white">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Today's Schedule — {TODAY}</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {todayAppts.map(a => (
              <div key={a.rawId} className="bg-white/10 border border-white/15 rounded-2xl p-3.5 min-w-[200px] shrink-0">
                <p className="font-bold text-sm">{a.time}</p>
                <p className="font-semibold text-white/90 text-sm mt-0.5">{a.patient}</p>
                <p className="text-white/60 text-xs mt-0.5">{a.type}</p>
                <p className="text-white/50 text-xs">{a.doctor}</p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${statusConfig[a.status]?.cls || ""}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View toggle + filter */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filterStatus === s ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["ID", "Patient", "Date & Time", "Type", "Doctor", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => (
                <tr key={a.rawId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-700 text-xs">{a.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{a.patient}</p>
                    <p className="text-slate-400 text-xs">{a.patientId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{a.date}</p>
                    <p className="text-slate-500 text-xs">{a.day} · {a.time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${typeColors[a.type] || "bg-slate-100 text-slate-600"}`}>{a.type}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs font-medium">{a.doctor}</td>
                  <td className="px-5 py-4">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${statusConfig[a.status]?.cls}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {a.status === "Pending" && (
                        <button onClick={() => updateStatus(a.rawId, "Confirmed")}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all border border-emerald-200 shadow-sm hover:shadow active:scale-[0.97]">
                          Confirm
                        </button>
                      )}
                      {a.status !== "Cancelled" && a.status !== "Completed" && (
                        <button onClick={() => updateStatus(a.rawId, "Cancelled")}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all border border-red-200 shadow-sm hover:shadow active:scale-[0.97]">
                          Cancel
                        </button>
                      )}
                      {a.status === "Confirmed" && (
                        <button onClick={() => updateStatus(a.rawId, "Completed")}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all border border-slate-200 shadow-sm hover:shadow active:scale-[0.97]">
                          Done
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No appointments found</div>
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">Schedule Appointment</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Patient Name *", key: "patient", span: true },
                { label: "Date *", key: "date", type: "date" },
                { label: "Time", key: "time", isSelect: true, options: HOURS },
                { label: "Appointment Type", key: "type", isSelect: true, options: APPOINTMENT_TYPES, span: false },
                { label: "Doctor", key: "doctor", isSelect: true, options: DOCTORS, span: true },
                { label: "Notes", key: "notes", span: true },
              ].map(f => (
                <div key={f.key} className={f.span ? "col-span-2" : ""}>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">{f.label}</label>
                  {f.isSelect ? (
                    <select value={newAppt[f.key]} onChange={e => setNewAppt(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type || "text"} value={newAppt[f.key]} onChange={e => setNewAppt(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={addAppointment}
                className="flex-1 py-2.5 bg-[#1b5e85] text-white rounded-xl font-bold text-sm hover:bg-[#154d70] transition-colors">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

