import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
  User,
  CheckCircle,
} from "lucide-react";
import eyeVisual from "../assets/Register.jpg";

export default function Register() {
  const [credentials, setCredentials] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    alert(
      `Welcome ${credentials.fullName}! Your account has been created.`
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#07132c] to-[#001b2f]" />

      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[15%] top-[10%] h-72 w-72 rounded-full bg-cyan-500 blur-[180px]" />
        <div className="absolute right-[10%] bottom-[15%] h-80 w-80 rounded-full bg-blue-600 blur-[180px]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center p-5">
        <div
          className="grid w-full max-w-7xl overflow-hidden rounded-[36px]
        border border-white/10
        bg-white/5
        backdrop-blur-3xl
        shadow-[0_0_100px_rgba(0,255,255,0.12)]
        lg:grid-cols-2"
        >
          {/* LEFT - Image Panel */}
          <div className="relative hidden lg:block">
            <img
              src={eyeVisual}
              alt="Futuristic digital eye"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />

            <div className="absolute top-8 left-8">
              <a
                href="/"
                className="flex items-center gap-2 rounded-full
                bg-white/10 px-4 py-2 hover:bg-white/20 transition"
              >
                <ArrowLeft size={18} />
                Back
              </a>
            </div>

            <div className="absolute bottom-10 left-10">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={18} />
                <span className="uppercase tracking-[4px]">
                  Insight Opticals
                </span>
              </div>

              <h1 className="mt-5 text-6xl font-black leading-tight">
                Join Our
                <br />
                <span
                  className="bg-gradient-to-r
                from-cyan-300
                to-blue-400
                bg-clip-text
                text-transparent"
                >
                  Vision Community
                </span>
              </h1>

              <p className="mt-5 max-w-md text-slate-300">
                Create an account to access personalized optical recommendations,
                appointment scheduling, and exclusive member benefits.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-cyan-400" />
                  <span className="text-sm">Smart prescription tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-cyan-400" />
                  <span className="text-sm">AI-powered frame recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-cyan-400" />
                  <span className="text-sm">Priority appointment booking</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Registration Form */}
          <div className="flex items-center justify-center p-10">
            <div className="w-full max-w-md">
              <h2 className="text-4xl font-black">Create Account</h2>

              <p className="mt-3 text-slate-400">
                Join us to experience smarter vision care
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {/* FULL NAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300"
                      size={18}
                    />

                    <input
                      name="fullName"
                      type="text"
                      required
                      value={credentials.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-2xl
                      border border-white/10
                      bg-white/5
                      py-3 pl-12 pr-4
                      text-sm
                      outline-none
                      transition
                      focus:border-cyan-400
                      focus:ring-2
                      focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300"
                      size={18}
                    />

                    <input
                      name="email"
                      type="email"
                      required
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl
                      border border-white/10
                      bg-white/5
                      py-3 pl-12 pr-4
                      text-sm
                      outline-none
                      transition
                      focus:border-cyan-400
                      focus:ring-2
                      focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full rounded-2xl
                      border border-white/10
                      bg-white/5
                      py-3 pl-12 pr-14
                      text-sm
                      outline-none
                      transition
                      focus:border-cyan-400
                      focus:ring-2
                      focus:ring-cyan-500/30"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:text-cyan-300"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300"
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={credentials.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full rounded-2xl
                      border border-white/10
                      bg-white/5
                      py-3 pl-12 pr-14
                      text-sm
                      outline-none
                      transition
                      focus:border-cyan-400
                      focus:ring-2
                      focus:ring-cyan-500/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:text-cyan-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* TERMS & CONDITIONS */}
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-sm">
                    I agree to the{" "}
                    <a href="#" className="text-cyan-300 hover:text-cyan-200">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-cyan-300 hover:text-cyan-200">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="w-full rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  to-blue-500
                  py-3 px-4
                  font-bold
                  text-black
                  text-sm
                  transition
                  hover:scale-[1.02]
                  hover:shadow-[0_0_40px_rgba(0,255,255,0.4)]"
                >
                  Create Account
                </button>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-8 text-center text-slate-400">
                Already have an account?
                <a href="/login" className="ml-2 text-cyan-300 hover:text-cyan-200">
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
