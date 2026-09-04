import { useState } from "react";
import { getImage } from "../constants/images";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [role, setRole] = useState("PATIENT"); // PATIENT, OPTICIAN, ADMIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password views and inputs
  const [view, setView] = useState("LOGIN"); // LOGIN, FORGOT_EMAIL, FORGOT_RESET
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned status ${response.status}: ${text.slice(0, 80) || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      setLoading(false);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_email", data.user.email);
      alert(`Logged in successfully as ${data.user.role}!`);
      if (data.user.role === "PATIENT") {
        const guestOrder = localStorage.getItem("guest_order");
        if (guestOrder) {
          localStorage.setItem("checkout_after_login", "true");
          window.location.hash = "#/catalog";
        } else {
          window.location.hash = "#/dashboard";
        }
      } else if (data.user.role === "OPTICIAN") {
        window.location.hash = "#/optician-dashboard";
      } else if (data.user.role === "ADMIN") {
        window.location.hash = "#/admin-dashboard";
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset code.");
      
      setSuccessMessage(data.message || "Reset OTP sent successfully.");
      setView("FORGOT_RESET");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!resetOtp || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password.");
      
      alert("Password reset successfully! You can now log in.");
      setView("LOGIN");
      setEmail(resetEmail); // autofill their email
      setResetEmail("");
      setResetOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans relative">
      {/* Floating Home Button */}
      <button
        onClick={() => window.location.hash = "#/"}
        className="absolute top-6 left-6 z-[120] flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-xl text-xs transition-all active:scale-95 border border-slate-200 shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      {/* Left Column: Visual & Brand Content (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 items-center justify-center overflow-hidden p-12">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 pointer-events-none"
          style={{ backgroundImage: `url(${getImage("eyeTech")})` }}
        />

        {/* Text Contrast Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-blue-900/30 to-blue-950/70 pointer-events-none" />

        {/* Abstract Background Highlights */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-white/10 blur-3xl animate-[pulse_6s_infinite_ease-in-out]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-300/20 blur-3xl animate-[pulse_8s_infinite_ease-in-out]"></div>

        <div className="relative z-10 max-w-lg text-white flex flex-col gap-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg shadow-black/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              Nethmini<span className="text-cyan-200">Opticals</span>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-extrabold leading-tight">
              Your Vision, Our Insight.
              <br />
              <span className="text-cyan-200">Modern Eye Care</span> Simplified.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              Log in to schedule appointments, check optical orders, access digitized prescriptions with AI OCR, or manage store frame inventory.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl shadow-xl flex flex-col gap-3">
            <p className="text-white/95 italic text-[16px] leading-relaxed">
              "The virtual try-on mirror made selecting my spectacle frames incredibly easy. Highly recommend the smart recommendation!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                JD
              </div>
              <div>
                <p className="text-white font-bold text-sm">John Doe</p>
                <p className="text-white/60 text-xs font-semibold">Patient since 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Right Column: Login / Forgot Password Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20">
        <div className="w-full max-w-md flex flex-col gap-8 animate-[fadeIn_0.8s_ease]">

          {/* Brand Logo for Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Nethmini<span className="text-blue-600">Opticals</span>
            </span>
          </div>

          {/* Header */}
          {view === "LOGIN" && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 font-medium">
                Please enter your details to sign in to your dashboard.
              </p>
            </div>
          )}
          {view === "FORGOT_EMAIL" && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Forgot Password
              </h2>
              <p className="text-slate-500 font-medium">
                Enter your email address to receive a 6-digit password verification code.
              </p>
            </div>
          )}
          {view === "FORGOT_RESET" && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Reset Password
              </h2>
              <p className="text-slate-500 font-medium">
                Check your inbox for a verification code, then enter it along with your new password below.
              </p>
            </div>
          )}

          {/* Role Selection Tabs (Only on Login view) */}
          {view === "LOGIN" && (
            <div className="bg-slate-100 p-1 rounded-2xl flex relative shadow-inner">
              {["PATIENT", "OPTICIAN", "ADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all duration-300 ${role === r
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-[14px] font-medium flex items-center gap-3 animate-[shake_0.4s_ease-in-out]">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl text-[14px] font-medium flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Normal Login Form */}
          {view === "LOGIN" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[14px] font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[14px] font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("FORGOT_EMAIL"); setError(""); setSuccessMessage(""); }}
                    className="text-[14px] font-bold text-blue-600 hover:text-blue-500 transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 border border-slate-200 rounded-lg text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2.5 text-[14px] font-semibold text-slate-600 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white text-[15px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${loading
                  ? "bg-slate-300 shadow-none cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 shadow-blue-500/10 hover:-translate-y-[1px]"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Forgot Password - Step 1: Input Email */}
          {view === "FORGOT_EMAIL" && (
            <form onSubmit={handleForgotEmailSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="resetEmail" className="text-[14px] font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-12 pr-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white text-[15px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${loading
                  ? "bg-slate-300 shadow-none cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 shadow-blue-500/10 hover:-translate-y-[1px]"
                  }`}
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>

              <button
                type="button"
                onClick={() => setView("LOGIN")}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm text-center transition-colors py-1"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Forgot Password - Step 2: Input OTP & New Password */}
          {view === "FORGOT_RESET" && (
            <form onSubmit={handleForgotResetSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-bold text-slate-700">
                  Email Address (Locked)
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-semibold text-slate-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="resetOtp" className="text-[14px] font-bold text-slate-700">
                  6-Digit Verification Code
                </label>
                <input
                  id="resetOtp"
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-center tracking-[0.4em] text-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="000000"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-[14px] font-bold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white text-[15px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${loading
                  ? "bg-slate-300 shadow-none cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 shadow-blue-500/10 hover:-translate-y-[1px]"
                  }`}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setView("LOGIN")}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm text-center transition-colors py-1"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Footer Navigation (Only on Login view) */}
          {view === "LOGIN" && (
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-500">
                New to NethminiOpticals?{" "}
                <a href="#signup" className="text-blue-600 hover:text-blue-500 transition-colors font-bold">
                  Create an account
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
