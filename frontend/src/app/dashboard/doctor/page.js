"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, Users, Clock, Clipboard, Plus, CheckCircle } from "lucide-react";
import { API_URL } from "@/utils/api";

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_URL;
const APPOINTMENT_API = process.env.NEXT_PUBLIC_APPOINTMENT_API_URL;

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "doctor" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          // Fetch generic dashboard data (system notification etc)
          const res = await fetch(`${API_URL}/dashboard/doctor`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.ok) {
            setData(await res.json());
          }

          // Fetch doctor profile to get _id
          const profRes = await fetch(`${DOCTOR_API}/api/doctors/me`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const profData = await profRes.json();
          if (!profRes.ok || !profData.doctor) return;

          const myDoctor = profData.doctor;

          // Fetch today's appointments
          const today = new Date();
          const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const apptRes = await fetch(`${APPOINTMENT_API}/api/appointments/doctor/${myDoctor._id}?date=${todayString}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const apptData = await apptRes.json();

          if (apptRes.ok && apptData.appointments) {
            // Filter only PENDING and CONFIRMED
            const activeAppts = apptData.appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status));

            // Sort by time
            activeAppts.sort((a, b) => {
              const timeA = a.timeSlot?.startTime || "00:00";
              const timeB = b.timeSlot?.startTime || "00:00";
              return timeA.localeCompare(timeB);
            });

            setAppointments(activeAppts);

            // Fetch user names
            const userRes = await fetch(`${API_URL}/users`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              const actualUsers = Array.isArray(userData) ? userData : userData.users || [];
              const pMap = {};
              actualUsers.forEach(u => pMap[u._id] = u.name);
              setPatientMap(pMap);
            }
          }
        } catch (err) {
          setError(err.message);
        }
      };

      fetchData();
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center p-10 h-full text-slate-600 dark:text-slate-400">Loading dashboard...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          Physician Portal
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your daily queue and patient records.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Today's Patients</h4>
            <Users size={20} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-emerald-400">{appointments.length}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {appointments.filter(a => a.status === 'PENDING').length} unconfirmed
          </p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Pending Reports</h4>
            <Clipboard size={20} className="text-rose-400" />
          </div>
          <p className="text-4xl font-extrabold text-rose-400">4</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Require review</p>
        </div>

        <div className="glass-panel stat-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Next Appointment</h4>
            <Clock size={20} className="text-indigo-400" />
          </div>
          {appointments.length > 0 ? (
            <>
              <p className="text-2xl font-bold">{appointments[0].timeSlot?.startTime}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">{patientMap[appointments[0].patientId] || 'Patient ID: ' + appointments[0].patientId}</p>
            </>
          ) : (
            <p className="text-sm border-t border-transparent text-slate-500 mt-2">None scheduled</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel lg:col-span-2 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" /> Upcoming Appointments
              </h3>

              <div className="flex flex-col gap-3">
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No active appointments for today.</p>
                ) : appointments.map((app) => {
                  const pName = patientMap[app.patientId] || app.patientId;

                  return (
                    <div key={app._id} className="flex items-center justify-between p-4 bg-slate-200/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-800/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold relative">
                          {pName[0]?.toUpperCase()}
                          {app.queueNo && (
                            <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-100 dark:border-slate-900 shadow-sm">
                              #{app.queueNo}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{pName}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[120px]">{app.appointmentType || 'General Checkup'}</p>
                            <span className="text-[9px] text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{app.appointmentId || app._id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-semibold text-sm">{app.timeSlot?.startTime}</p>
                        <span className={`badge ${app.status === 'PENDING' ? 'badge-user' : 'badge-doctor'} text-[9px] px-2 py-0.5`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                <p className="text-slate-600 dark:text-slate-400">{data?.message || "All critical services online."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
