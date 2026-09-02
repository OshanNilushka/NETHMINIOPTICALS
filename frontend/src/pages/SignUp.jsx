import { useState } from "react";
import { getImage } from "../constants/images";
import { API_BASE_URL } from "../config/api";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!fullName || !email || !password || !confirmPassword || !phone || !dob || !gender) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          dob,
          gender,
          role: "PATIENT", // Public sign-up is always for patients only
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setLoading(false);
      localStorage.setItem("token", data.token);
      alert("Account created successfully! Welcome to NethminiOpticals.");
      
      const guestOrder = localStorage.getItem("guest_order");
      if (guestOrder) {
        localStorage.setItem("checkout_after_login", "true");
        window.location.hash = "#/catalog";
      } else {
        window.location.hash = "#/dashboard";
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
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
              Join Us Today &
              <br />
              <span className="text-cyan-200">Start Caring</span> For Your Eyes.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              Create an account as a patient to schedule appointment slots, digitize your prescriptions via OCR scan, or customize order lenses online.
            </p>
          </div>

          {/* Bullet highlights */}
          <div className="flex flex-col gap-4.5 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-300/20 flex items-center justify-center text-cyan-200">
                ✓
              </div>
              <p className="text-white font-semibold text-[15px]">Interactive Virtual Spectacle Try-On</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-300/20 flex items-center justify-center text-cyan-200">
                ✓
              </div>
              <p className="text-white font-semibold text-[15px]">Prescription Digitization in Seconds</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-300/20 flex items-center justify-center text-cyan-200">
                ✓
              </div>
              <p className="text-white font-semibold text-[15px]">Automated Order Tracking & SMS Alerts</p>
            </div>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col gap-7 animate-[fadeIn_0.8s_ease] my-8">

          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="lg:hidden flex items-center gap-2 mb-1">
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
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Create your account
            </h2>
            <p className="text-slate-500 font-medium">
              Start monitoring your visual health today.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-[14px] font-medium flex items-center gap-3 animate-[shake_0.4s_ease-in-out]">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-[14px] font-bold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email & Phone side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[14px] font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="text-[14px] font-bold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="e.g. 0771234567"
                  required
                />
              </div>
            </div>

            {/* Date of Birth & Gender side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="dob" className="text-[14px] font-bold text-slate-700">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="gender" className="text-[14px] font-bold text-slate-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-850 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[14px] font-bold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="text-[14px] font-bold text-slate-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center -mt-1">
              <input
                id="showPass"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4.5 h-4.5 border border-slate-200 rounded text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <label htmlFor="showPass" className="ml-2.5 text-[13px] font-semibold text-slate-500 cursor-pointer select-none">
                Show Passwords
              </label>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-5 h-5 border border-slate-200 rounded-lg text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 text-[13.5px] font-semibold text-slate-500 cursor-pointer select-none leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-bold transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-bold transition-colors">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white text-[15px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] mt-2 ${loading
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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500">
              Already have an account?{" "}
              <a href="#login" className="text-blue-600 hover:text-blue-500 transition-colors font-bold">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
