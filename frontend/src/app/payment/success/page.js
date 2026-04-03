"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2 as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
  Loader2 as LoaderIcon
} from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/payment/success/${sessionId}`, {
            method: "PUT",
          });
          if (res.ok) {
            setStatus("success");
            // Auto redirect after 5 seconds
            setTimeout(() => {
              router.push("/dashboard/user/find-doctors");
            }, 5000);
          } else {
            setStatus("error");
          }
        } catch (err) {
          console.error("Verification error:", err);
          setStatus("error");
        }
      };
      verifyPayment();
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 text-center animate-[fadeIn_0.5s_ease-out]">
        {status === "verifying" ? (
          <div className="flex flex-col items-center gap-4">
            <LoaderIcon size={64} className="text-indigo-500 animate-spin" />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Verifying Payment...</h1>
            <p className="text-slate-500">Please wait while we confirm your transaction.</p>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircleIcon size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Payment Successful!</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Your appointment has been confirmed. You will be redirected to your dashboard in a few seconds.
            </p>
            <button
              onClick={() => router.push("/dashboard/user/find-doctors")}
              className="mt-6 w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Go to Dashboard <ArrowRightIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
              <CheckCircleIcon size={48} className="rotate-45" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Something went wrong</h1>
            <p className="text-slate-500">We couldn't verify your payment, but your appointment might still be safe. Please check your dashboard.</p>
            <button
              onClick={() => router.push("/dashboard/user/find-doctors")}
              className="mt-6 w-full py-3 px-6 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold transition-all active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}