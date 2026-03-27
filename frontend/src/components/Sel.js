"use client";
import { ChevronDown } from "lucide-react";

/**
 * Themed select dropdown — works correctly in both light and dark mode.
 * Drop-in replacement for <select> across all management pages.
 */
export default function Sel({ value, onChange, children, className = "", required = false, disabled = false }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full appearance-none cursor-pointer px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}
