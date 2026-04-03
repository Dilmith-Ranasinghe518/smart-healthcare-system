"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Clock3, AlertCircle, Check, X, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import Sel from "@/components/Sel";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APPOINTMENT_API = API_BASE;
const DOCTOR_API = API_BASE;

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null); // stores appointment ID loading

  // Filter & Bulk
  const [search, setSearch] = useState("");
  const [filterHospital, setFilterHospital] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterTimeSlot, setFilterTimeSlot] = useState("all");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "doctor") fetchDoctorAndAppointments();
  }, [user]);

  const fetchDoctorAndAppointments = async () => {
    setFetching(true);
    setError("");
    try {
      // 1. Get my doctor profile to find _id
      const profRes = await fetch(`${DOCTOR_API}/doctors/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message);

      const myDoctor = profData.doctor;
      if (!myDoctor) {
        setFetching(false);
        return; // No profile configured
      }
      setDoctor(myDoctor);

      // 2. Fetch appointments for this doctor
      const apptRes = await fetch(`${APPOINTMENT_API}/appointments/doctor/${myDoctor._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const apptData = await apptRes.json();
      if (!apptRes.ok) throw new Error(apptData.message);

      const appts = apptData.appointments || [];

      // Sort: upcoming logic (Pending and Confirmed first, then past)
      appts.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.timeSlot.startTime}`);
        const dateTimeB = new Date(`${b.date}T${b.timeSlot.startTime}`);
        return dateTimeA - dateTimeB;
      });

      setAppointments(appts);

    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (appId, actionStr) => {
    setProcessing(`${appId}-${actionStr}`); // e.g., '123-accept'
    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments/${appId}/${actionStr}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Failed to ${actionStr}`);
      }

      const labels = { accept: 'Appointment accepted!', reject: 'Appointment rejected.', complete: 'Marked as completed.', cancel: 'Appointment cancelled.' };
      toast.success(labels[actionStr] || 'Status updated.');
      fetchDoctorAndAppointments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold tracking-wide border border-amber-500/20"><Clock3 size={14} /> PENDING</span>;
      case 'CONFIRMED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold tracking-wide border border-emerald-500/20"><CheckCircle size={14} /> CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold tracking-wide border border-rose-500/20"><XCircle size={14} /> CANCELLED</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold tracking-wide border border-rose-500/20"><XCircle size={14} /> REJECTED</span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold tracking-wide border border-indigo-500/20"><CheckSquare size={14} /> COMPLETED</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold tracking-wide border border-slate-200 dark:border-slate-700">{status}</span>;
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    const q = search.toLowerCase();
    const matchSearch = String(app.patientId).toLowerCase().includes(q) || (app.notes || "").toLowerCase().includes(q) || String(app.appointmentId || app._id).toLowerCase().includes(q);
    const matchHospital = filterHospital === "all" || app.location.hospitalName === filterHospital;
    const matchDate = !filterDate || app.date === filterDate;
    const timeSlotStr = app.timeSlot ? `${app.timeSlot.startTime} - ${app.timeSlot.endTime}` : "";
    const matchTimeSlot = filterTimeSlot === "all" || timeSlotStr === filterTimeSlot;

    return matchSearch && matchHospital && matchDate && matchTimeSlot;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterHospital, filterDate, filterTimeSlot]);

  const uniqueHospitals = [...new Set(appointments.map(a => a.location.hospitalName))];
  const uniqueTimeSlots = [...new Set(appointments.map(a => a.timeSlot ? `${a.timeSlot.startTime} - ${a.timeSlot.endTime}` : ""))].filter(Boolean);
  const pendingFiltered = filteredAppointments.filter(a => a.status === 'PENDING');

  const handleBulkAccept = async () => {
    if (pendingFiltered.length === 0) return;
    setBulkLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const app of pendingFiltered) {
      try {
        const res = await fetch(`${APPOINTMENT_API}/api/appointments/${app._id}/accept`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (successCount > 0) toast.success(`Successfully accepted ${successCount} appointment(s).`);
    if (failCount > 0) toast.error(`Failed to accept ${failCount} appointment(s).`);

    setBulkLoading(false);
    setShowBulkConfirm(false);
    fetchDoctorAndAppointments();
  };

  if (loading || !user) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-2">
          Patient Appointments
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Approve requests, manage your schedule, and complete sessions.
        </p>
      </header>

      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-center gap-2">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {fetching ? (
        <div className="py-20 text-center text-slate-500">Syncing schedule...</div>
      ) : !doctor ? (
        <div className="glass-panel py-20 text-center flex flex-col items-center justify-center gap-4">
          <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Profile Required</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-4">
            You must configure your Doctor Profile and add availability slots before you can receive appointments.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/dashboard/doctor/profile")}>
            Setup Profile Now
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel py-20 text-center flex flex-col items-center gap-3">
          <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Appointments</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            You don't have any booked patient sessions across your locations.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex w-full md:w-auto flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="Search patient, notes..."
                className="w-full md:w-56 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <input
                type="date"
                className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
              <Sel
                className="w-full md:w-auto flex-1 min-w-[140px]"
                value={filterTimeSlot}
                onChange={e => setFilterTimeSlot(e.target.value)}
              >
                <option value="all">All Time Slots</option>
                {uniqueTimeSlots.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Sel>
              <Sel
                className="w-full md:w-auto flex-1 min-w-[150px]"
                value={filterHospital}
                onChange={e => setFilterHospital(e.target.value)}
              >
                <option value="all">All Hospitals</option>
                {uniqueHospitals.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </Sel>
            </div>

            {pendingFiltered.length > 0 && (
              <button
                disabled={bulkLoading}
                onClick={() => setShowBulkConfirm(true)}
                className="w-full md:w-auto btn bg-emerald-500 hover:bg-emerald-600 text-white min-w-[200px]"
              >
                {bulkLoading ? "Accepting..." : `Accept All Pending (${pendingFiltered.length})`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedAppointments.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500">
                No appointments match your filters.
              </div>
            ) : paginatedAppointments.map(app => {
              const isPending = app.status === 'PENDING';
              const isConfirmed = app.status === 'CONFIRMED';

              return (
                <div key={app._id} className="glass-panel p-5 flex flex-col relative overflow-hidden transition-all hover:border-indigo-500/30">

                  {/* Visual Status Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${app.status === 'PENDING' ? 'bg-amber-400' :
                    app.status === 'CONFIRMED' ? 'bg-emerald-500' :
                      app.status === 'COMPLETED' ? 'bg-indigo-500' :
                        'bg-rose-500'
                    }`} />

                  <div className="flex items-start justify-between mb-4 pl-2">
                    {getStatusBadge(app.status)}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {app.appointmentId || app._id.slice(-6)}
                      </span>
                      {app.queueNo && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Queue: {app.queueNo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pl-2 flex-1 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-0.5">
                          Patient ID
                        </h3>
                        <p className="text-slate-400 text-[10px] font-mono">{app.patientId}</p>
                      </div>
                      {app.appointmentType && (
                        <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full mt-1 border border-indigo-500/20">
                          {app.appointmentType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <Calendar size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{app.date}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Clock size={12} /> {app.timeSlot.startTime} - {app.timeSlot.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 px-1">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{app.location.hospitalName}</p>
                          <p className="text-[11px] text-slate-500">{app.location.city}</p>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-l-2 border-slate-300 dark:border-slate-700 italic">
                          "{app.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex gap-2 w-full shrink-0">
                      <button
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        onClick={() => updateStatus(app._id, 'accept')}
                        disabled={processing === `${app._id}-accept`}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        onClick={() => updateStatus(app._id, 'reject')}
                        disabled={processing === `${app._id}-reject`}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {isConfirmed && (
                    <div className="flex gap-2 w-full shrink-0">
                      <button
                        className="flex-1 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        onClick={() => updateStatus(app._id, 'complete')}
                        disabled={processing === `${app._id}-complete`}
                      >
                        <CheckSquare size={14} /> Complete
                      </button>
                      <button
                        className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        onClick={() => updateStatus(app._id, 'cancel')}
                        disabled={processing === `${app._id}-cancel`}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

        </div>
      )}

      {/* Bulk Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkAccept}
        title="Accept Pending Appointments"
        message={`Are you sure you want to accept ${pendingFiltered.length} pending appointment(s)? This will notify the patients immediately.`}
        confirmText="Accept All"
        isLoading={bulkLoading}
      />
    </div>
  );
}
