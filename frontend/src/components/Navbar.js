"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Activity, Menu, X, ChevronRight, Home, Search, Heart, Shield, MessageSquare, Briefcase } from "lucide-react";
import { API_URL } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Find Doctors", href: "/doctors", icon: <Search size={18} /> },
    { name: "Services", href: "#services", icon: <Briefcase size={18} /> },
    { name: "Features", href: "#features", icon: <Shield size={18} /> },
    { name: "Roles", href: "#roles", icon: <Heart size={18} /> },
    { name: "Contact", href: "#contact", icon: <MessageSquare size={18} /> },
  ];

  // Prevent scrolling when menu is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#96D7C6]/40 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <div className="h-16 w-auto overflow-hidden">
              <img
                src="/logo.png"
                alt="MediSync Logo"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 hover:text-[#5AA7A7] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              className="text-sm font-medium text-slate-700 hover:text-[#5AA7A7] transition-colors"
            >
              Find Doctors
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium text-slate-700 hover:text-[#5AA7A7] transition-colors"
            >
              Services
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-700 hover:text-[#BAC94A] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="text-sm font-medium text-slate-700 hover:text-[#6C8CBF] transition-colors"
            >
              Roles
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-700 hover:text-[#E2D36B] transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : user ? (
              <Link
                href={`/dashboard/${user.role}`}
                className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#96D7C6]/40 bg-[#96D7C6]/20 hover:bg-[#96D7C6]/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#6C8CBF] flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden border border-white/20">
                  {user?.profilePicture ? (
                    <img
                      src={`${API_URL}${user.profilePicture}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0] || "U"
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {user.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex px-5 py-2.5 rounded-xl bg-[#5AA7A7] hover:bg-[#4c9999] text-white text-sm font-semibold shadow-lg shadow-[#5AA7A7]/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          </div>
        </nav>
      </div>
    </header>

    {/* Mobile Bottom Sheet (Moved outside header for stacking context) */}
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm md:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Bottom Sheet Content */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[999] w-full bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden shadow-[0_-30px_70px_rgba(0,0,0,0.2)] flex flex-col rounded-t-[40px] border-t border-slate-100 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          {/* Sheet Handle */}
          <div className="flex flex-col items-center pt-3 pb-2 shrink-0" onClick={() => setIsOpen(false)}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-4" />
          </div>

          <div className="flex items-center justify-between px-8 pb-4 border-b border-slate-50 shrink-0">
             <h3 className="text-xl font-black text-slate-800">Menu</h3>
             <button
               onClick={() => setIsOpen(false)}
               className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full"
             >
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-50 hover:bg-[#F0F7F4] hover:text-[#2F8F68] transition-all"
              >
                <div className="flex items-center gap-4">
                   <div className="text-slate-400">
                     {link.icon}
                   </div>
                   {link.name}
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-slate-100">
               {user ? (
                 <Link
                   href={`/dashboard/${user.role}`}
                   onClick={() => setIsOpen(false)}
                   className="flex items-center gap-4 p-5 rounded-3xl bg-[#EAF7F1] border border-[#D7EBDD]"
                 >
                   <div className="w-12 h-12 rounded-full bg-[#6C8CBF] flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden border-2 border-white shadow-sm shrink-0">
                     {user?.profilePicture ? (
                       <img src={`${API_URL}${user.profilePicture}`} className="w-full h-full object-cover" />
                     ) : (
                       user?.name?.[0] || "U"
                     )}
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-black text-slate-800">Personal Dashboard</p>
                      <p className="text-xs text-[#2F8F68] font-bold">Access {user.role} workspace</p>
                   </div>
                 </Link>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center p-5 rounded-3xl bg-slate-100 text-slate-700 text-sm font-black"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center p-5 rounded-3xl bg-[#5AA7A7] text-white text-sm font-black shadow-lg"
                    >
                      Join Now
                    </Link>
                 </div>
               )}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0 pb-safe">
             <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold opacity-60">MediSync Platform • 2026</p>
          </div>
        </div>
      </div>
    </>
  );
}