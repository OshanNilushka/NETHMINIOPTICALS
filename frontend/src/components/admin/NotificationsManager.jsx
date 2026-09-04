import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

const API = API_BASE_URL;

const TARGET_ROLES = [
  { value: "PATIENT", label: "All Patients", icon: "👤", color: "bg-violet-50 border-violet-200 text-violet-700" },
  { value: "OPTICIAN", label: "All Opticians", icon: "🔬", color: "bg-blue-50 border-blue-200 text-blue-700" },
];

export default function NotificationsManager() {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "PATIENT" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/admin/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
        setForm((p) => ({ ...p, title: "", message: "" }));
      } else {
        setResult({ success: false, message: data.error || "Failed to send notification." });
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Notifications Manager</h2>
        <p className="text-slate-500 text-sm mt-0.5">Send system-wide announcements to patients or opticians</p>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold border ${
            result.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Send To</label>
            <div className="flex gap-3 flex-wrap">
              {TARGET_ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, targetRole: role.value }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    form.targetRole === role.value
                      ? role.color + " shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span>{role.icon}</span>
                  {role.label}
                  {form.targetRole === role.value && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Notification Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Important Update from InsightOpticals"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Message *
            </label>
            <textarea
              placeholder="Write your announcement here..."
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50 resize-none"
            />
            <p className="text-slate-400 text-xs mt-1.5">{form.message.length} characters</p>
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className="rounded-2xl border border-dashed border-violet-200 p-4 bg-violet-50/50">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2">Preview</p>
              <p className="font-bold text-slate-800 text-sm">{form.title || "—"}</p>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">{form.message || "—"}</p>
              <p className="text-violet-400 text-xs mt-2 font-medium">
                → Will be sent to: {TARGET_ROLES.find((r) => r.value === form.targetRole)?.label}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            style={{ background: submitting ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {submitting ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>

      {/* Info cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
          <p className="font-bold text-violet-800 text-sm mb-1">👤 Sending to Patients</p>
          <p className="text-violet-600 text-xs leading-relaxed">Notifications appear in the patient's dashboard bell icon. Use for appointment reminders, promotions, or service updates.</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="font-bold text-blue-800 text-sm mb-1">🔬 Sending to Opticians</p>
          <p className="text-blue-600 text-xs leading-relaxed">Notifications appear in the optician dashboard. Use for staff updates, schedule changes, or system announcements.</p>
        </div>
      </div>
    </div>
  );
}
