import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Catalog", href: "#catalog" },
    { name: "About", href: "#aboutsection2" },
    { name: "Services", href: "#/services" },
    { name: "Pages", href: "#" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300 animate-[slideDown_0.6s_ease]">
      <div className="max-w-[1650px] w-[90%] lg:w-[95%] mx-auto">
        <div className="flex justify-between items-center h-18">

          {/* Brand Logo */}
          <div className="flex-1 flex justify-start items-center cursor-pointer group">
            <div className="flex items-center gap-2.5">
              {/* Icon */}
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                Nethmini<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Opticals</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center items-center gap-x-8 lg:gap-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-slate-600 font-semibold text-[17px] hover:text-blue-600 py-2 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons & Mobile Toggle */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <a
              href="#login"
              className="hidden md:flex shrink-0 whitespace-nowrap items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-200 hover:-translate-y-[2px] hover:scale-105 active:scale-95 hover:shadow-[0_10px_20px_rgba(37,99,235,0.35)] cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="#login"
              className="hidden md:flex shrink-0 whitespace-nowrap items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-200 hover:-translate-y-[2px] hover:scale-105 active:scale-95 hover:shadow-[0_10px_20px_rgba(37,99,235,0.35)] cursor-pointer"
            >
              Appointment
            </a>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 focus:outline-none p-2.5 rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl shadow-2xl border-t border-slate-200 transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-0 invisible"
        }`}
      >
        <div className="px-6 pt-4 pb-8 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-6 pb-2 flex flex-col gap-3">
            <a
              href="#login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-base font-bold transition-all shadow-md active:scale-[0.95] cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="#login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-base font-bold transition-all shadow-md active:scale-[0.95] cursor-pointer"
            >
              Appointment
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}