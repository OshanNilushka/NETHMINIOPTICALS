import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Clock, MessageSquare, Filter } from "lucide-react";

export default function FeedbackReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/api/reviews/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch customer feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchReviews();
      } else {
        const err = await response.json();
        alert(`Failed to update status: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating feedback status.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Customer Feedbacks Moderation</h1>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm font-medium">
            Review and moderate registered patient feedback submissions before they are published to the home page carousel.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Status:</span>
        </div>

        <div className="flex gap-2">
          {[
            { label: "Pending", value: "PENDING", count: pendingCount },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "All Feedbacks", value: "ALL", count: reviews.length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filter === tab.value
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-semibold text-sm">
          Loading feedback submissions...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No feedbacks found</h3>
          <p className="text-xs text-slate-400">
            There are currently no customer feedbacks matching the "{filter}" filter status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                      {rev.patient?.fullName ? rev.patient.fullName.charAt(0) : "P"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{rev.patient?.fullName || "Patient"}</h4>
                      <p className="text-xs text-slate-400">{rev.patient?.email}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {rev.status === "APPROVED" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {rev.status === "REJECTED" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {rev.status === "PENDING" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 items-center pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-500 ml-1">({rev.rating}/5)</span>
                </div>

                {/* Comment Content */}
                <p className="text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Action Buttons & Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Submitted: {new Date(rev.createdAt).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  {rev.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                      disabled={actionLoading === rev.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer border-none flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept & Publish
                    </button>
                  )}
                  {rev.status !== "REJECTED" && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                      disabled={actionLoading === rev.id}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
