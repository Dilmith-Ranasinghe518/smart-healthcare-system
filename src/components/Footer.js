import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/50 backdrop-blur-md mt-auto py-8 w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Activity size={18} className="text-indigo-400" /> SmartHealth
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Smart Healthcare Node. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
