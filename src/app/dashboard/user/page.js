"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Heart, Activity, User, Calendar, Plus } from "lucide-react";
import { API_URL } from "@/utils/api";

export default function UserDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
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
          if (!res.ok) throw new Error("Failed to load layout");
          return res.json();
        })
        .then((data) => setData(data))
        .catch((err) => {
          setError(err.message);
          logout();
        });
    }
  }, [user, loading, router, logout]);

  if (loading || !user) return <div className="flex items-center justify-center p-10 h-full text-slate-600 dark:text-slate-400">Loading dashboard...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          Welcome back, {user.name}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor your vitals and upcoming appointments below.</p>
      </header>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Heart Rate</h4>
            <Heart size={20} className="text-rose-500" />
          </div>
          <p className="text-3xl font-bold">72 <span className="text-base font-normal text-slate-500">BPM</span></p>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: "72%" }}></div>
          </div>
        </div>
        
        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Blood Pressure</h4>
            <Activity size={20} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-bold">120/80 <span className="text-base font-normal text-slate-500">mmHg</span></p>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: "80%" }}></div>
          </div>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Sleep Score</h4>
            <User size={20} className="text-violet-400" />
          </div>
          <p className="text-3xl font-bold">85% <span className="text-base font-normal text-slate-500">Good</span></p>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div className="h-full bg-violet-400 rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel lg:col-span-2 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-indigo-400" /> Health Summary
              </h3>
              <p className="p-4 bg-emerald-500/5 text-emerald-300 rounded-xl border-l-4 border-emerald-500 text-sm">
                {data?.message || "System indicates all parameters within nominal bounds."}
              </p>
              
              <h4 className="mt-2 text-sm font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-slate-600 dark:text-slate-400" /> Upcoming Activities
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">0 Upcoming Appointments.</p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="btn btn-primary w-full justify-start gap-2 text-sm py-3 px-4">
                  <Plus size={20} /> Book Appointment
                </button>
                <button className="btn btn-secondary w-full justify-start gap-2 text-sm py-3 px-4">
                  <Calendar size={20} /> View Medical Reports
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
