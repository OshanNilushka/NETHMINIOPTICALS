import React, { useEffect } from "react";

export default function AuthSuccessModal({
  isOpen,
  role = "PATIENT",
  userName = "User",
  onComplete,
  duration = 5000, // 5 seconds default
}) {
  useEffect(() => {
    if (!isOpen) return;

    const redirectTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [isOpen, duration, onComplete]);

  if (!isOpen) return null;

  // Determine Greeting based on hour
  const hour = new Date().getHours();
  let greeting = "Good Evening,";
  if (hour >= 4 && hour < 12) {
    greeting = "Good Morning,";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon,";
  }

  // Determine Badge & Subtitle per role
  let badgeText = "• PATIENT PORTAL • VERIFIED MEMBER";
  let descriptionText = "Logged in successfully. Preparing your vision care workspace and orders...";

  const upperRole = (role || "PATIENT").toUpperCase();
  if (upperRole === "OPTICIAN") {
    badgeText = "• OPTICIAN PORTAL • VERIFIED STAFF";
    descriptionText = "Logged in successfully. Preparing your clinical workspace and patient appointments...";
  } else if (upperRole === "ADMIN") {
    badgeText = "• ADMIN PORTAL • SYSTEM ADMINISTRATOR";
    descriptionText = "Logged in successfully. Preparing your administrative workspace and analytics...";
  }

  // Format user display name cleanly
  const displayName = userName || (upperRole === "ADMIN" ? "Admin User" : upperRole === "OPTICIAN" ? "Optician Staff" : "Patient Member");

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[28px] p-8 max-w-sm w-full text-center shadow-2xl shadow-blue-950/20 relative overflow-hidden border border-slate-100 animate-[scaleUp_0.35s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Top Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400 w-full absolute top-0 left-0 right-0 rounded-t-[28px]" />

        {/* Center Icon Box */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>

        {/* Role Pill Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
          {badgeText}
        </div>

        {/* Greeting & Name */}
        <div className="mb-4">
          <p className="text-slate-400 text-xs font-medium tracking-wide mb-0.5">
            {greeting}
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
            <span>{displayName}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h2>
        </div>

        {/* Subtitle Description */}
        <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed mb-6">
          {descriptionText}
        </p>

        {/* Full Complete Gradient Line */}
        <div className="w-full h-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400 mb-4 shadow-sm" />

        {/* Loading Indicator Footer */}
        <div className="text-slate-400 text-[12px] font-medium flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Entering workspace automatically...</span>
        </div>
      </div>
    </div>
  );
}
