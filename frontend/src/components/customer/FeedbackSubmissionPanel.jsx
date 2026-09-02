import { useState, useEffect } from "react";
import { Star, Send, Clock, CheckCircle2, XCircle, MessageSquarePlus } from "lucide-react";

export default function FeedbackSubmissionPanel({ profile }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [message, setMessage] = useState(null);

  const fetchMyReviews = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/api/reviews/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch customer reviews:", err);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Feedback submitted! Pending optician review." });
        setComment("");
        setRating(5);
        fetchMyReviews();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit feedback." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error submitting feedback. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Published
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected by Optician
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Optician Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <MessageSquarePlus className="w-7 h-7 text-cyan-400" />
            Customer Feedback & Reviews
          </h2>
          <p className="text-slate-300 text-sm mt-1.5 font-medium max-w-xl">
            Share your experience with Nethmini Opticals. All feedback is verified by our opticians before publishing on our platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Submit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            Submit New Feedback
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating Stars Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Overall Rating
              </label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-slate-700">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Your Feedback / Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your optical fitting, frame quality, AR try-on, or service experience..."
                rows={5}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none font-medium"
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-xs font-extrabold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Submitting..." : "Submit Feedback for Verification"}
              {!loading && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Previous Feedback History */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">My Submitted Feedbacks</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Total: {myReviews.length}
            </span>
          </div>

          {myReviews.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <MessageSquarePlus className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No feedbacks submitted yet</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Fill out the form on the left to submit your verified patient review to our optician team.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {myReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    {getStatusBadge(rev.status)}
                  </div>

                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                    Submitted on {new Date(rev.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
