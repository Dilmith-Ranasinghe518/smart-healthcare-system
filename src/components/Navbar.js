"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
      <nav className="flex justify-between items-center py-8 border-none">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white hover:opacity-90">
          <Activity size={28} className="text-indigo-400" /> SmartHealth
        </Link>
        
        <div className="flex gap-4 items-center">
          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : user ? (
            <Link href={`/dashboard/${user.role}`} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all duration-200">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                {user.name[0]}
              </div>
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
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
