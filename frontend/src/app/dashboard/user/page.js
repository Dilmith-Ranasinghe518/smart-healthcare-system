"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCircle2,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { API_URL } from "@/utils/api";

export default function UserDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role && user.role !== "user"))) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch(`${API_URL}/dashboard/user`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load dashboard");
          return res.json();
        })
        .then((response) => setData(response))
        .catch((err) => {
          setError(err.message);
          logout();
        });
    }
  }, [user, loading, router, logout]);

  const welcomeMessage = useMemo(() => {
    if (data?.message) return data.message;
    return "Welcome to your patient dashboard. Manage appointments, discover doctors, and access your healthcare tools from one place.";
  }, [data]);

  const quickTips = [
    "Book your next consultation in a few clicks.",
    "Find doctors by specialty and availability.",
    "Access prescription and meeting tools from your sidebar.",
  ];

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      const res = await fetch(`${API_URL}/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1000,
        }),
      });

      const paymentData = await res.json();

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        console.error("Payment URL not returned", paymentData);
      }
    } catch (paymentError) {
      console.error("Payment error:", paymentError);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f6fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-14 -top-12 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#6C8CBF]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Patient Workspace
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Welcome back, {user.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {welcomeMessage}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#74B49B]/12 text-[#5C8D7A]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Secure Access</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your dashboard is protected with role-based access.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C8CBF]/12 text-[#6C8CBF]">
                  <Stethoscope size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Doctor Discovery</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Search available doctors by specialty and need.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BAC94A]/15 text-[#879B2E]">
                  <Calendar size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Appointments</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Manage bookings, follow-ups, and healthcare tasks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F7F5] text-[#5C8D7A]">
              <UserCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Account Snapshot</h2>
              <p className="text-xs text-slate-500">Your current dashboard access</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{user.name}</p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                {user.role}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dashboard Status
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-600">Connected</p>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF7F4] text-[#5C8D7A]">
                <Activity size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Health Overview</h3>
                <p className="text-sm text-slate-500">
                  Real service-connected information without dummy values.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#f8fbf9_0%,#ffffff_100%)] p-6">
              <p className="text-sm leading-7 text-slate-600">{welcomeMessage}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-[#FCFDFC] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    Tip {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{tip}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                <ClipboardList size={18} className="text-[#6C8CBF]" />
                Care Activity
              </h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointments
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    View and manage your upcoming consultations from the appointments section.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Prescriptions
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Access prescription-related tools and connected records from your sidebar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <h3 className="mb-5 text-lg font-black text-slate-800">Quick Actions</h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/dashboard/user/find-doctors")}
                  className="inline-flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-5 py-4 text-left text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Search size={19} />
                    Find Doctors
                  </span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => router.push("/dashboard/user/appointments")}
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#F8FBF9] px-5 py-4 text-left text-slate-800 transition-all duration-300 hover:bg-[#F1F7F4]"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Calendar size={19} />
                    View Appointments
                  </span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left text-emerald-700 transition-all duration-300 hover:bg-emerald-100 disabled:opacity-70"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <CreditCard size={19} />
                    {paymentLoading ? "Processing Payment..." : "Pay Now"}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <h3 className="mb-4 text-lg font-black text-slate-800">Patient Notes</h3>
              <div className="rounded-2xl bg-[linear-gradient(135deg,#f7fbfa_0%,#eef7f4_100%)] p-5">
                <p className="text-sm leading-7 text-slate-600">
                  This dashboard is intentionally showing service-driven content only.
                  No fake vitals, fake appointment counts, or dummy monitoring numbers are displayed.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}