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
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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
        </nav>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Side Drawer Content */}
      <div
        className={`fixed top-0 right-0 z-[100] h-screen w-[280px] bg-white transition-all duration-300 ease-in-out md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
               <img src="/logo.png" alt="MediSync" className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Navigation Menu</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-50 hover:bg-[#F0F7F4] hover:text-[#2F8F68] transition-all border border-transparent active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                   <div className="text-slate-400 group-hover:text-[#2F8F68]">
                     {link.icon}
                   </div>
                   {link.name}
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
            ))}
          </div>

          <div className="p-5 border-t border-slate-100 shrink-0">
               {user ? (
                 <Link
                   href={`/dashboard/${user.role}`}
                   onClick={() => setIsOpen(false)}
                   className="flex items-center gap-4 p-4 rounded-2xl bg-[#EAF7F1] border border-[#D7EBDD]"
                 >
                   <div className="w-10 h-10 rounded-full bg-[#6C8CBF] flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden border-2 border-white shadow-sm shrink-0">
                     {user?.profilePicture ? (
                       <img src={`${API_URL}${user.profilePicture}`} className="w-full h-full object-cover" />
                     ) : (
                       user?.name?.[0] || "U"
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-[#2F8F68] font-bold uppercase">Dashboard Access</p>
                   </div>
                 </Link>
               ) : (
                 <div className="grid grid-cols-2 gap-3">
                   <Link
                     href="/login"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center justify-center p-4 rounded-2xl bg-slate-100 text-slate-700 text-sm font-black"
                   >
                     Login
                   </Link>
                   <Link
                     href="/register"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center justify-center p-4 rounded-2xl bg-[#5AA7A7] text-white text-sm font-black shadow-lg"
                   >
                     Join
                   </Link>
                 </div>
               )}
               <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest opacity-50 font-bold">MediSync Platform • 2026</p>
          </div>
        </div>
      </div>
    </header>
  );
}