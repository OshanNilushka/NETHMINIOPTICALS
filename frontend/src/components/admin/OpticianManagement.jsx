import { useState, useEffect } from "react";

const API = "http://localhost:3000";

export default function OpticianManagement() {
  const [opticians, setOpticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phoneNumber: "", gender: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [form, setForm] = useState({ fullName: "", email: "", password: "", phoneNumber: "", gender: "" });

  const fetchOpticians = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${API}/api/admin/users?role=OPTICIAN`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setOpticians(Array.isArray(d) ? d : []))
      .catch(() => setOpticians([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOpticians(); }, []);

  const startEdit = (opt) => {
    setEditingId(opt.id);
    setEditForm({ fullName: opt.fullName || "", email: opt.email || "", phoneNumber: opt.phoneNumber || "", gender: opt.gender || "" });
    setEditError("");
    setConfirmId(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const handleEditSubmit = async (id) => {
    setEditSubmitting(true);
    setEditError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/admin/opticians/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setOpticians((prev) =>
          prev.map((o) => o.id === id ? { ...o, fullName: editForm.fullName, email: editForm.email, phoneNumber: editForm.phoneNumber, gender: editForm.gender } : o)
        );
        setSuccessMsg(`✅ Optician "${editForm.fullName}" updated successfully.`);
        setEditingId(null);
      } else {
        setEditError(data.error || "Failed to update.");
      }
    } catch { setEditError("Network error."); }
    finally { setEditSubmitting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(""); setSuccessMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/admin/opticians`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`✅ Optician account created for ${data.optician.fullName}`);
        setForm({ fullName: "", email: "", password: "", phoneNumber: "", gender: "" });
        setShowForm(false);
        fetchOpticians();
      } else { setErrorMsg(data.error || "Failed to create optician."); }
    } catch { setErrorMsg("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    setDeleting(id);
    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setOpticians((prev) => prev.filter((o) => o.id !== id));
    } catch (e) { console.error(e); }
    finally { setDeleting(null); setConfirmId(null); }
  };

  const filtered = opticians.filter(
    (o) => o.fullName?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Optician Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">Create, edit, and manage optician staff accounts</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search opticians..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none w-52"
            />
          </div>
          <button
            onClick={() => { setShowForm(true); setSuccessMsg(""); setErrorMsg(""); }}
            className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Optician
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold">{successMsg}</div>}
      {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{errorMsg}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-3xl border border-violet-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-slate-800 text-base">Create Optician Account</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name *", key: "fullName", type: "text", placeholder: "e.g. Nadeesha Perera" },
              { label: "Email Address *", key: "email", type: "email", placeholder: "optician@example.com" },
              { label: "Password *", key: "password", type: "password", placeholder: "Strong password" },
              { label: "Phone Number", key: "phoneNumber", type: "tel", placeholder: "0771234567" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  required={label.includes("*")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Gender</label>
              <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                style={{ background: submitting ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                {submitting ? "Creating..." : "Create Account"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opticians Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 font-semibold">Loading opticians...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="font-semibold">No opticians found</p>
            <p className="text-sm mt-1">Click "New Optician" to create the first account</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Optician</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Gender</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((opt) => (
                <>
                  <tr key={opt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                          {opt.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{opt.fullName}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#7c3aed" }}>OPTICIAN</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 text-sm font-medium">{opt.email}</p>
                      <p className="text-slate-400 text-xs">{opt.phoneNumber || "No phone"}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm">{opt.gender || "—"}</td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm">{new Date(opt.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => editingId === opt.id ? cancelEdit() : startEdit(opt)}
                          className="text-violet-500 hover:text-violet-700 hover:bg-violet-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {editingId === opt.id ? "Cancel" : "Edit"}
                        </button>

                        {/* Delete button */}
                        {confirmId === opt.id ? (
                          <>
                            <button onClick={() => handleDelete(opt.id)} disabled={deleting === opt.id}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              {deleting === opt.id ? "Removing..." : "Confirm"}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { setConfirmId(opt.id); setEditingId(null); }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline Edit Row */}
                  {editingId === opt.id && (
                    <tr key={`edit-${opt.id}`} className="bg-violet-50/60">
                      <td colSpan={5} className="px-6 py-5">
                        <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3">✏️ Edit Optician Details</p>
                        {editError && <p className="text-red-500 text-xs font-semibold mb-3">{editError}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { label: "Full Name", key: "fullName", type: "text" },
                            { label: "Email", key: "email", type: "email" },
                            { label: "Phone Number", key: "phoneNumber", type: "tel" },
                          ].map(({ label, key, type }) => (
                            <div key={key}>
                              <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                              <input type={type} value={editForm[key]}
                                onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-violet-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                              />
                            </div>
                          ))}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
                            <select value={editForm.gender} onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-violet-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white">
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handleEditSubmit(opt.id)} disabled={editSubmitting}
                            className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all"
                            style={{ background: editSubmitting ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                            {editSubmitting ? "Saving..." : "Save Changes"}
                          </button>
                          <button onClick={cancelEdit}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-5 py-2 rounded-xl text-sm transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
