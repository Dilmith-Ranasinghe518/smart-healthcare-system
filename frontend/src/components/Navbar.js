"use client";

import Link from "next/link";
import { Activity, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#96D7C6]/40 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5AA7A7] flex items-center justify-center shadow-lg shadow-[#5AA7A7]/30">
              <Activity size={22} className="text-white" />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                SmartHealth
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modern Healthcare Platform
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#5AA7A7] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#5AA7A7] transition-colors"
            >
              Find Doctors
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#5AA7A7] transition-colors"
            >
              Services
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#BAC94A] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#6C8CBF] transition-colors"
            >
              Roles
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#E2D36B] transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              onClick={toggleTheme}
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {loading ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">Loading...</div>
            ) : user ? (
              <Link
                href={`/dashboard/${user.role}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#96D7C6]/40 dark:border-white/10 bg-[#96D7C6]/20 dark:bg-slate-900 hover:bg-[#96D7C6]/30 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#6C8CBF] flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.name?.[0] || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
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
          </div>
        </nav>
      </div>
    </header>
  );
}