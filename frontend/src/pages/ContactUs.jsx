import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center py-20 px-6 font-sans relative overflow-hidden">
      {/* Background soft blue radial accents for visual depth */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#000050]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#000077]/5 blur-[130px] pointer-events-none" />

      {/* Grid structure */}
      <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch relative z-10">
        
        {/* Left Side: Get in Touch Info */}
        <div className="flex flex-col justify-between py-6">
          <div className="space-y-6">
            <h1 className="text-slate-800 font-extrabold tracking-tight leading-none" style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}>
              Get in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00008b] via-[#0000c6] to-[#0000ed]">touch</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-md font-medium">
              Have questions about appointments, designer frames, or custom lens fittings? Feel free to reach out, and our team will follow up promptly.
            </p>
          </div>

          <div className="space-y-8 mt-12 lg:mt-0">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-[#0000c6] shrink-0 shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-1">Our Location</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  123 Vision Avenue, Suite 10,<br />
                  Colombo, Sri Lanka
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-[#0000c6] shrink-0 shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-1">Phone Number</p>
                <a href="tel:+94112345678" className="text-slate-500 hover:text-[#0000ed] transition-colors text-sm font-medium">
                  +94 11 234 5678
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-[#0000c6] shrink-0 shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-1">Email Address</p>
                <a href="mailto:info@nethminioptical.com" className="text-slate-500 hover:text-[#0000ed] transition-colors text-sm font-medium">
                  info@nethminioptical.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-[#ffffff] border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100/80 flex flex-col justify-center">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  className="w-full bg-[#ffffff] border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0000b2] focus:ring-2 focus:ring-[#0000b2]/10 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  className="w-full bg-[#ffffff] border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0000b2] focus:ring-2 focus:ring-[#0000b2]/10 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className="w-full bg-[#ffffff] border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0000b2] focus:ring-2 focus:ring-[#0000b2]/10 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Phone number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="w-full bg-[#ffffff] border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0000b2] focus:ring-2 focus:ring-[#0000b2]/10 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
                rows={5}
                className="w-full bg-[#ffffff] border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0000b2] focus:ring-2 focus:ring-[#0000b2]/10 transition-all duration-300 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold">{error}</p>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-600 text-sm font-bold animate-[slideDown_0.3s_ease]">
                Message sent successfully! Our team will get back to you shortly.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:float-right bg-gradient-to-r from-[#00008b] via-[#0000c6] to-[#0000ed] hover:from-[#00009f] hover:to-[#0000ed] text-white text-sm font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-[#00008b]/20 hover:shadow-[#0000ed]/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send message"}
              {!loading && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
