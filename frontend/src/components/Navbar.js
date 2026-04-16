"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, Menu, X, ChevronRight } from "lucide-react";
import { API_URL } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Doctors", href: "/doctors" },
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Roles", href: "#roles" },
    { name: "Contact", href: "#contact" },
  ];

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

      {/* Mobile Menu Content */}
      <div
        className={`fixed inset-0 top-20 z-[100] bg-white transition-all duration-300 md:hidden ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-base font-bold text-slate-700 active:bg-slate-100 border border-slate-100 shadow-sm"
            >
              {link.name}
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          ))}
          {user ? (
            <Link
              href={`/dashboard/${user.role}`}
              onClick={() => setIsOpen(false)}
              className="mt-4 flex items-center justify-center gap-3 p-5 rounded-3xl bg-[#96D7C6]/20 text-[#2F8F68] font-black border-2 border-[#96D7C6]/40"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="mt-4 flex items-center justify-center p-5 rounded-3xl bg-slate-100 text-slate-700 font-black"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}