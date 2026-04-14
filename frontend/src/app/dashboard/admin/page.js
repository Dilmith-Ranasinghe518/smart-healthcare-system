"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Grid,
  RefreshCw,
  Power,
  Plus,
  ShieldCheck,
  Sparkles,
  Settings2,
  UserCog,
  Activity,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { API_URL } from "@/utils/api";

import TaxSettingModal from "@/components/TaxSettingModal";
import RegistrationSettingsModal from "@/components/RegistrationSettingsModal";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user && user.role === "admin") {
      fetch(`${API_URL}/dashboard/admin`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((response) => setData(response))
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [user, loading, router]);

  const systemMessage = useMemo(() => {
    if (data?.message) return data.message;
    return "Administrative controls are available. Use the dashboard to manage platform settings, registration security, and user operations.";
  }, [data]);

  const adminHighlights = [
    {
      icon: <ShieldCheck size={20} />,
      title: "Access Control",
      text: "Manage who can enter and operate inside the platform.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: <RefreshCw size={20} />,
      title: "Tax Configuration",
      text: "Update and monitor platform-wide payment-related settings.",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: <LockKeyhole size={20} />,
      title: "Registration Security",
      text: "Review onboarding controls and verification behavior.",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const adminActions = [
    {
      title: "Manage Global Tax Settings",
      subtitle: "Open and maintain tax configuration rules",
      icon: <RefreshCw size={20} />,
      onClick: () => setIsTaxModalOpen(true),
      className:
        "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100",
    },
    {
      title: "Registration Security",
      subtitle: "Adjust registration and verification settings",
      icon: <ShieldCheck size={20} />,
      onClick: () => setIsRegistrationModalOpen(true),
      className:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100",
    },
    {
      title: "Provision Doctor Node",
      subtitle: "Create and configure new doctor access paths",
      icon: <Plus size={20} />,
      onClick: () => {},
      className:
        "bg-[linear-gradient(90deg,#5AA7A7_0%,#74B49B_100%)] text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)]",
    },
    {
      title: "Manage User Directory",
      subtitle: "Go to the user administration workspace",
      icon: <Users size={20} />,
      onClick: () => router.push("/dashboard/admin/users"),
      className:
        "bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200",
    },
    {
      title: "Maintenance Mode",
      subtitle: "Prepare restricted-operation system controls",
      icon: <Power size={20} />,
      onClick: () => {},
      className:
        "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
    },
  ];

  const auditNotes = [
    {
      title: "System Control Center",
      text: "Use this dashboard to govern core platform administration and secure operational changes.",
      tag: "Admin",
    },
    {
      title: "Security-first Configuration",
      text: "Registration and tax settings are managed through dedicated secure modals.",
      tag: "Security",
    },
    {
      title: "Operational Readiness",
      text: "User, doctor, hospital, and financial administration remain accessible from the sidebar and quick actions.",
      tag: "Operations",
    },
  ];

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
        <section className="relative overflow-hidden rounded-[32px] border border-[#6C8CBF]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f7f9fc_45%,#eef3fb_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-14 -top-12 h-40 w-40 rounded-full bg-[#6C8CBF]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#74B49B]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6C8CBF]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5B74AA] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Administration Workspace
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              System Administration
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {systemMessage}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {adminHighlights.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FB] text-[#5B74AA]">
              <UserCog size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Admin Snapshot</h2>
              <p className="text-xs text-slate-500">Current control session</p>
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
                Control Status
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-600">Authorized</p>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Configuration Access
                </h4>
                <Settings2 size={20} className="text-indigo-500" />
              </div>
              <p className="text-3xl font-black text-slate-800">Enabled</p>
              <p className="mt-2 text-sm text-slate-500">
                Platform settings and controls are available
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Security Controls
                </h4>
                <ShieldCheck size={20} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-slate-800">Ready</p>
              <p className="mt-2 text-sm text-slate-500">
                Registration and control workflows can be managed
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  System Status
                </h4>
                <Grid size={20} className="text-[#6C8CBF]" />
              </div>
              <p className="text-3xl font-black text-slate-800">Online</p>
              <p className="mt-2 text-sm text-slate-500">
                Administrative dashboard is currently reachable
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEFF0] text-rose-500">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    System Audit Overview
                  </h3>
                  <p className="text-sm text-slate-500">
                    Important administrative notes without dummy log values
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {auditNotes.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_100%)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-black text-slate-800">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {item.text}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#EEF3FB] px-3 py-1 text-[11px] font-bold text-[#5B74AA]">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[26px] bg-[linear-gradient(135deg,#f7f9fc_0%,#eef3fb_100%)] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#5B74AA] shadow-sm">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Administrative Status Summary
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {systemMessage}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-5 text-lg font-black text-slate-800">
                  Quick Actions
                </h3>

                <div className="flex flex-col gap-3">
                  {adminActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`inline-flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all duration-300 ${
                        action.className.includes("from-[")
                          ? `${action.className} hover:-translate-y-0.5`
                          : `${action.className}`
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex-shrink-0">{action.icon}</span>
                        <span>
                          <span className="block text-sm font-semibold">
                            {action.title}
                          </span>
                          <span className="mt-1 block text-xs opacity-80">
                            {action.subtitle}
                          </span>
                        </span>
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-4 text-lg font-black text-slate-800">
                  Control Notes
                </h3>

                <div className="rounded-2xl bg-[linear-gradient(135deg,#f8fbf9_0%,#eef7f4_100%)] p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    This admin dashboard has been updated to remove fake totals,
                    fake health percentages, and sample audit values while keeping
                    your original admin control flow intact.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      <TaxSettingModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        user={user}
      />

      <RegistrationSettingsModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        user={user}
      />
    </div>
  );
}