"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, Users, Clock, Clipboard, Plus, CheckCircle } from "lucide-react";
import { API_URL } from "@/utils/api";

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "doctor" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch(`${API_URL}/dashboard/doctor`, {
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
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center p-10 h-full text-slate-400">Loading dashboard...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-1">
          Physician Portal
        </h2>
        <p className="text-slate-400 text-sm">Manage your daily queue and patient records.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-400 text-xs font-semibold">Today's Patients</h4>
            <Users size={20} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-emerald-400">12</p>
          <p className="text-xs text-slate-400 mt-1">4 remaining</p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-400 text-xs font-semibold">Pending Reports</h4>
            <Clipboard size={20} className="text-rose-400" />
          </div>
          <p className="text-4xl font-extrabold text-rose-400">4</p>
          <p className="text-xs text-slate-400 mt-1">Require review</p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-400 text-xs font-semibold">Next Appointment</h4>
            <Clock size={20} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-bold">14:30 <span className="text-sm font-normal text-slate-500">(15m away)</span></p>
          <p className="text-xs text-slate-400 mt-1">Sarah Jenkins</p>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel lg:col-span-2 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" /> Active Patient Queue
              </h3>
              
              <div className="flex flex-col gap-3">
                {[
                  { name: "Sarah Jenkins", time: "14:30", type: "Follow-up", status: "Waiting" },
                  { name: "Michael Chen", time: "15:00", type: "General Checkup", status: "Scheduled" },
                  { name: "Emma Davis", time: "15:30", type: "Report Review", status: "Scheduled" },
                ].map((patient, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        {patient.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100">{patient.name}</h4>
                        <p className="text-slate-400 text-xs">{patient.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{patient.time}</p>
                      <span className={`badge ${patient.status === 'Waiting' ? 'badge-admin' : 'badge-doctor'} text-[10px] px-2 py-0.5 mt-1`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4 h-fit">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="btn btn-primary w-full justify-start gap-2 text-sm py-3 px-4">
                  <Plus size={20} /> Write Prescription
                </button>
                <button className="btn btn-secondary w-full justify-start gap-2 text-sm py-3 px-4">
                  <CheckCircle size={20} /> View Medical History
                </button>
              </div>
              
              <div className="mt-2 p-4 bg-emerald-500/5 text-emerald-300 rounded-xl border border-emerald-500/10 text-xs">
                <h4 className="font-semibold mb-1">System Notification</h4>
                <p className="text-slate-400">{data?.message || "All critical services online."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
