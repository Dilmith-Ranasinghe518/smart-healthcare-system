"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
            <XCircle size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Payment Cancelled</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Your transaction was not completed. No charges were made to your account.
          </p>
          
          <div className="flex flex-col gap-3 w-full mt-6">
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <RefreshCcw size={18} /> Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard/user/find-doctors")}
              className="w-full py-3 px-6 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft size={18} /> Back to Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}