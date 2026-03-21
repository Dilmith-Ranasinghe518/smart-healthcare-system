"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, Users, Grid, RefreshCw, Power, Plus, ShieldCheck } from "lucide-react";
import { API_URL } from "@/utils/api";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch(`${API_URL}/dashboard/admin`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => setData(data))
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center p-10 h-full text-slate-600 dark:text-slate-400">Loading dashboard...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          System Administration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor core nodes and audit access logs.</p>
      </header>

      {/* Admin Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Total Users</h4>
            <Users size={20} className="text-indigo-400" />
          </div>
          <p className="text-4xl font-extrabold text-indigo-400">1,240</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">+12 today</p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Active Doctors</h4>
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-emerald-400">45</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">3 on duty</p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">System Health</h4>
            <Grid size={20} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold">99.9% <span className="text-sm font-normal text-emerald-400">Stable</span></p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">0 incidents</p>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel lg:col-span-2 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-400" /> System Audit Stream
              </h3>
              
              <div className="flex flex-col gap-2">
                {[
                  { event: "Node authentication authorized", time: "15:12:44", type: "Security" },
                  { event: "DB replica batch write completed", time: "15:10:02", type: "Sync" },
                  { event: "New Doctor provisioned node", time: "14:55:10", type: "Access" },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-200/50  dark:bg-slate-800/20 rounded-xl border border-slate-200  dark:border-white/5 hover:bg-slate-200/80 dark:hover:bg-slate-800/40 transition-all duration-200">
                    <div>
                      <h4 className="font-medium text-slate-900  dark:text-slate-200 text-sm">{log.event}</h4>
                      <p className="text-slate-500 text-xs">{log.time}</p>
                    </div>
                    <span className="badge badge-admin text-[10px] px-2 py-0.5">{log.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4 h-fit">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="btn btn-primary w-full justify-start gap-2 text-sm py-3 px-4">
                  <Plus size={20} /> Provision Doctor Node
                </button>
                <button className="btn btn-secondary w-full justify-start gap-2 text-sm py-3 px-4" onClick={() => router.push('/dashboard/admin/users')}>
                  <Users size={20} /> Manage User Directory
                </button>
                <button className="btn btn-secondary w-full justify-start gap-2 text-sm py-3 px-4 text-rose-400 border-rose-500/10 hover:bg-rose-500/10">
                  <Power size={20} /> Maintenance Mode
                </button>
              </div>
              
              <div className="mt-2 p-4 bg-indigo-500/5 text-indigo-300 rounded-xl border border-indigo-500/10 text-xs">
                <h4 className="font-semibold mb-1">Status Summary</h4>
                <p className="text-slate-600 dark:text-slate-400">{data?.message || "Node online."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
