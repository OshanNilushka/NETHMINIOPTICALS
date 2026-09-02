import React from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="text-slate-300 font-sans border-t border-blue-900/40 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0b192e 0%, #0d213a 60%, #071324 100%)" }}
    >
      {/* Top CTA Banner */}
      <div className="max-w-[1650px] w-[90%] lg:w-[95%] mx-auto pt-12">
        <div
          className="relative overflow-hidden rounded-3xl text-white px-8 py-10 md:p-12 shadow-2xl group border border-blue-500/30"
          style={{
            background: "linear-gradient(135deg, #102a4d 0%, #1a3c6c 50%, #1d4ed8 100%)",
            boxShadow: "0 20px 50px rgba(15,23,42,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}
        >
          {/* Grid dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />
          {/* Glow orbs */}
          <div
            className="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"
            style={{ background: "rgba(59,130,246,0.3)" }}
          />
          <div
            className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(14,165,233,0.25)" }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-2xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-4 border"
                style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)", color: "#93c5fd" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                Annual Eye Care Reminder
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-white">
                Is it time for your annual check-up?
              </h3>
              <p className="text-blue-100 text-base mt-2 font-medium opacity-90">
                Book a comprehensive eye test with our certified expert optometrists today. Keep your vision sharp.
              </p>
            </div>
            <a
              href="#appointment"
              className="font-extrabold px-8 py-4 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 text-base whitespace-nowrap inline-block cursor-pointer"
              style={{ background: "#ffffff", color: "#1e3a8a" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}
            >
              Schedule Eye Test
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1650px] w-[90%] lg:w-[95%] mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #2563eb, #0284c7)", boxShadow: "0 8px 20px rgba(37,99,235,0.35)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Nethmini
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Opticals</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed max-w-sm text-slate-300">
              Your vision is our priority. Providing premium eyecare, designer frames, and precision lenses to keep your world clear, colorful, and beautiful.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(37,99,235,0.3)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4
              className="font-extrabold text-[11px] uppercase tracking-widest mb-6 pb-3"
              style={{ color: "#93c5fd", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              Our Services
            </h4>
            <ul className="space-y-3.5 text-sm font-medium">
              {[
                "Comprehensive Eye Exams",
                "Contact Lens Fitting",
                "Pediatric Eyecare",
                "Prescription Sunglasses",
                "Frame Repair & Adjustments"
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#/services"
                    className="transition-all duration-200 inline-flex items-center gap-2 group/link hover:translate-x-1.5 text-slate-300 hover:text-white"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity bg-blue-400"
                    />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4
              className="font-extrabold text-[11px] uppercase tracking-widest mb-6 pb-3"
              style={{ color: "#93c5fd", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              Contact Info
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                <span className="leading-relaxed text-slate-300">123 Vision Avenue, Suite 10, Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0 text-blue-400" />
                <a
                  href="tel:+94112345678"
                  className="transition-colors hover:text-white"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-blue-400" />
                <a
                  href="mailto:info@nethminioptical.com"
                  className="transition-colors hover:text-white"
                >
                  info@nethminioptical.com
                </a>
              </li>
              <li className="flex items-start gap-3 pt-1">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p className="text-slate-400">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4
              className="font-extrabold text-[11px] uppercase tracking-widest mb-2 pb-3"
              style={{ color: "#93c5fd", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              Newsletter
            </h4>
            <p className="text-sm leading-relaxed font-medium text-slate-300">
              Subscribe for new designer arrivals, eye health tips, and exclusive offers.
            </p>
            <form className="space-y-2.5 pt-1" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#ffffff",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(59,130,246,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.2)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
              <button
                type="submit"
                className="w-full text-white text-sm font-extrabold py-3 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #0284c7 100%)",
                  boxShadow: "0 4px 15px rgba(37,99,235,0.35)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #2563eb 0%, #0284c7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(37,99,235,0.35)";
                }}
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Gradient Divider */}
      <div className="max-w-[1650px] w-[90%] lg:w-[95%] mx-auto">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />
      </div>

      {/* Bottom Legal Bar */}
      <div className="py-6 text-xs font-medium text-slate-400">
        <div className="max-w-[1650px] w-[90%] lg:w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Nethmini Opticals. All rights reserved.
          </div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors duration-200 hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
