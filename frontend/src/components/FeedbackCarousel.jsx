import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const FALLBACK_REVIEWS = [
  {
    id: "fb-1",
    patient: { fullName: "Tharindu Madhushanka" },
    rating: 5,
    comment: "Excellent optical care and frame selection! The AR Virtual Try-on made selecting my frames so fast and fun. The precision of the prescription lens fitting is world class.",
    createdAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "fb-2",
    patient: { fullName: "Dilini Samarasinghe" },
    rating: 5,
    comment: "Uploaded my handwritten optical slip using the OCR tool, and my custom anti-glare glasses were ready in 2 days. Phenomenal customer service!",
    createdAt: "2026-08-04T14:30:00.000Z"
  },
  {
    id: "fb-3",
    patient: { fullName: "Kavinda Bandara" },
    rating: 5,
    comment: "Very professional opticians and high quality frames. The online dashboard tracking kept me updated at every stage of production.",
    createdAt: "2026-08-07T09:15:00.000Z"
  }
];

export default function FeedbackCarousel() {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/reviews/approved");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setReviews(data);
          }
        }
      } catch (err) {
        console.error("Failed to load approved reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedReviews();
  }, []);

  // Auto rotate cards every 6 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [reviews]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const current = reviews[currentIndex] || reviews[0];

  return (
    <section className="py-24 bg-slate-50 text-slate-800 relative overflow-hidden font-sans border-t border-slate-200">
      {/* Ambient Soft Accent Glows */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Verified Patient Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Patients Say</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            Real feedback verified and approved by our licensed clinical optician team.
          </p>
        </div>

        {/* Testimonial Card Slider Container */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-100/90 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400 absolute top-0 left-0 right-0" />

            {/* Quote Icon & Rating Header */}
            <div className="flex items-center justify-between mb-6 pt-2">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Quote className="w-6 h-6" />
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (current.rating || 5)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment Text */}
            <p className="text-slate-800 text-lg sm:text-xl font-medium leading-relaxed italic mb-8 min-h-[90px]">
              "{current.comment}"
            </p>

            {/* Patient Footer Info */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                  {current.patient?.fullName ? current.patient.fullName.charAt(0).toUpperCase() : "P"}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {current.patient?.fullName || "Verified Patient"}
                  </h4>
                  <span className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Verified Customer
                  </span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-2xl bg-white hover:bg-blue-600 text-slate-600 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200 hover:border-blue-600 shadow-sm active:scale-95"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-2xl bg-white hover:bg-blue-600 text-slate-600 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200 hover:border-blue-600 shadow-sm active:scale-95"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-8 bg-blue-600 shadow-sm"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
