"use client";

import Link from "next/link";
import { Activity, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
      <nav className="flex justify-between items-center py-8 border-none">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-white hover:opacity-90">
          <Activity size={28} className="text-indigo-400" /> SmartHealth
        </Link>
        
        <div className="flex gap-3 items-center">
          {/* Theme Toggle Button */}
          <button 
            className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200 cursor-pointer"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {loading ? (
            <div className="text-slate-500 dark:text-slate-400 text-sm">Loading...</div>
          ) : user ? (
            <Link href={`/dashboard/${user.role}`} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-200">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                {user.name[0]}
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn btn-secondary px-5 py-2 text-sm font-medium">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
