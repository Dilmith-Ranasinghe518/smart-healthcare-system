"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Activity,
  Users,
  Clock,
  Clipboard,
  CheckCircle,
  CalendarDays,
  Sparkles,
  Stethoscope,
  ArrowRight,
  UserCircle2,
} from "lucide-react";
import { API_URL } from "@/utils/api";

const DOCTOR_API = API_URL;
const APPOINTMENT_API = API_URL;

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

    if (user && (user.role === "doctor" || user.role === "admin")) {
      const fetchData = async () => {
        try {
          const res = await fetch(`${API_URL}/dashboard/doctor`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          if (res.ok) {
            setData(await res.json());
          }

          const profRes = await fetch(`${DOCTOR_API}/doctors/me`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const profData = await profRes.json();

          if (!profRes.ok || !profData.doctor) return;

          const myDoctor = profData.doctor;

          const today = new Date();
          const todayString = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

          const apptRes = await fetch(
            `${APPOINTMENT_API}/appointments/doctor/${myDoctor._id}?date=${todayString}`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          const apptData = await apptRes.json();

          if (apptRes.ok && apptData.appointments) {
            const activeAppts = apptData.appointments.filter((a) =>
              ["PENDING", "CONFIRMED"].includes(a.status)
            );

            activeAppts.sort((a, b) => {
              const timeA = a.timeSlot?.startTime || "00:00";
              const timeB = b.timeSlot?.startTime || "00:00";
              return timeA.localeCompare(timeB);
            });

            setAppointments(activeAppts);

            const userRes = await fetch(`${API_URL}/users`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });

            if (userRes.ok) {
              const userData = await userRes.json();
              const actualUsers = Array.isArray(userData)
                ? userData
                : userData.users || [];

              const pMap = {};
              actualUsers.forEach((u) => {
                pMap[u._id] = u.name;
              });
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

  const todayPatientsCount = appointments.length;
  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === "PENDING"
  ).length;
  const confirmedAppointmentsCount = appointments.filter(
    (a) => a.status === "CONFIRMED"
  ).length;

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  const overviewMessage = useMemo(() => {
    if (data?.message) return data.message;
    return "Review today’s patient queue, appointment flow, and clinical actions from your doctor workspace.";
  }, [data]);

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
        <section className="relative overflow-hidden rounded-[32px] border border-[#BAC94A]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#BAC94A]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#74B49B]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BAC94A]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#7D8E2A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Doctor Workspace
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Physician Portal
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {overviewMessage}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#74B49B]/12 text-[#5C8D7A]">
                  <Users size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Patient Queue</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  View active patient flow for today.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BAC94A]/15 text-[#879B2E]">
                  <Stethoscope size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Clinical Actions</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Continue consultations and patient care tasks.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C8CBF]/12 text-[#6C8CBF]">
                  <CalendarDays size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Daily Schedule</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep track of confirmed and pending appointments.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F8F0] text-[#879B2E]">
              <UserCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Doctor Snapshot</h2>
              <p className="text-xs text-slate-500">Your active dashboard session</p>
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
                Session Status
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
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Today’s Patients
                </h4>
                <Users size={20} className="text-emerald-500" />
              </div>
              <p className="text-4xl font-black text-slate-800">{todayPatientsCount}</p>
              <p className="mt-2 text-sm text-slate-500">
                Active appointments scheduled for today
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pending Confirmations
                </h4>
                <Clipboard size={20} className="text-amber-500" />
              </div>
              <p className="text-4xl font-black text-slate-800">{pendingAppointmentsCount}</p>
              <p className="mt-2 text-sm text-slate-500">
                Appointments still awaiting confirmation
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Confirmed Visits
                </h4>
                <CheckCircle size={20} className="text-indigo-500" />
              </div>
              <p className="text-4xl font-black text-slate-800">{confirmedAppointmentsCount}</p>
              <p className="mt-2 text-sm text-slate-500">
                Confirmed consultations in your queue
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF7F4] text-[#5C8D7A]">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    Upcoming Appointments
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your real appointment queue for today
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {appointments.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-[#FCFDFC] p-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      No active appointments for today
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Once new appointments are scheduled, they will appear here.
                    </p>
                  </div>
                ) : (
                  appointments.map((app) => {
                    const patientName = patientMap[app.patientId] || app.patientId;
                    const appointmentCode = app.appointmentId || app._id?.slice(-6);

                    return (
                      <div
                        key={app._id}
                        className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_100%)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#74B49B]/12 text-sm font-black uppercase text-[#5C8D7A]">
                              {patientName?.[0] || "P"}

                              {app.queueNo && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-[#6C8CBF] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                  #{app.queueNo}
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-base font-black text-slate-800">
                                {patientName}
                              </h4>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#F1F7F4] px-2.5 py-1 text-[11px] font-semibold text-[#5C8D7A]">
                                  {app.appointmentType || "General Checkup"}
                                </span>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">
                                  {appointmentCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-2 md:items-end">
                            <p className="text-lg font-black text-slate-800">
                              {app.timeSlot?.startTime || "--:--"}
                            </p>

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                app.status === "PENDING"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-5 text-lg font-black text-slate-800">Quick Actions</h3>

                <div className="flex flex-col gap-3">
                  <button className="inline-flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#BAC94A] to-[#9EB73B] px-5 py-4 text-left text-white shadow-[0_14px_30px_rgba(158,183,59,0.24)] transition-all duration-300 hover:-translate-y-0.5">
                    <span className="flex items-center gap-3 font-semibold">
                      <Clipboard size={19} />
                      Write Prescription
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <button className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#F8FBF9] px-5 py-4 text-left text-slate-800 transition-all duration-300 hover:bg-[#F1F7F4]">
                    <span className="flex items-center gap-3 font-semibold">
                      <CheckCircle size={19} />
                      View Medical History
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-4 text-lg font-black text-slate-800">
                  Schedule Focus
                </h3>

                <div className="rounded-2xl bg-[linear-gradient(135deg,#f8fbf9_0%,#eef7f4_100%)] p-5">
                  {nextAppointment ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Next Appointment
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-800">
                        {nextAppointment.timeSlot?.startTime || "--:--"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {patientMap[nextAppointment.patientId] ||
                          nextAppointment.patientId}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Next Appointment
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        No appointment is currently scheduled for the next slot.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-[#FCFDFC] p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    This dashboard now shows real queue-based values from your
                    appointment flow. Static dummy values have been removed.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}