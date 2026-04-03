"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Clock3, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APPOINTMENT_API = API_BASE;
const DOCTOR_API = API_BASE;

export default function UserAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({}); // cache doctor details by ID
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "user") fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");

      const appts = data.appointments || [];

      // Sort: upcoming first (by date then time)
      appts.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.timeSlot.startTime}`);
        const dateTimeB = new Date(`${b.date}T${b.timeSlot.startTime}`);
        return dateTimeA - dateTimeB;
      });

      setAppointments(appts);

      // Fetch doctor names for unique doctorIds
      const uniqueDoctorIds = [...new Set(appts.map(a => a.doctorId))];
      uniqueDoctorIds.forEach(id => {
        if (!doctors[id]) fetchDoctorDetails(id);
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchDoctorDetails = async (doctorId) => {
    try {
      const res = await fetch(`${DOCTOR_API}/doctors/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(prev => ({ ...prev, [doctorId]: data.doctor }));
      }
    } catch (err) {
      console.warn("Failed to fetch doctor info for ID:", doctorId);
    }
  };

  const handleCancelClick = (appointmentId) => {
    setCancelTargetId(appointmentId);
    setShowCancelModal(true);
  };

  const executeCancel = async () => {
    if (!cancelTargetId) return;
    setCancelling(cancelTargetId);
    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments/${cancelTargetId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: "Cancelled by User" })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      toast.success("Appointment cancelled successfully.");
      setShowCancelModal(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
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
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold tracking-wide border border-indigo-500/20"><CheckCircle size={14} /> COMPLETED</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold tracking-wide border border-slate-200 dark:border-slate-700">{status}</span>;
    }
  };

  if (loading || !user) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-2">
          My Appointments
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track and manage your upcoming doctor visits and see past history.
        </p>
      </header>

      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-center gap-2">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {fetching ? (
        <div className="py-20 text-center text-slate-500">Loading your appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel py-20 text-center flex flex-col items-center gap-3">
          <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Appointments</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-4">
            You don't have any booked appointments yet.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/dashboard/user/find-doctors")}>
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map(app => {
            const docInfo = doctors[app.doctorId];
            const isCancellable = app.status === 'PENDING' || app.status === 'CONFIRMED';

            return (
              <div key={app._id} className={`glass-panel p-5 flex flex-col relative overflow-hidden transition-all ${!isCancellable ? 'opacity-70 grayscale-[30%]' : ''}`}>

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
                      ID: {app.appointmentId || app._id.slice(-6)}
                    </span>
                    {app.queueNo && (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Queue: {app.queueNo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pl-2 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">
                      {docInfo ? docInfo.name : "Loading Doctor..."}
                    </h3>
                    {app.appointmentType && (
                      <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 mt-1">
                        {app.appointmentType}
                      </span>
                    )}
                  </div>
                  {docInfo && <p className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold mb-5">{docInfo.specialization}</p>}

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                      <Calendar size={18} className="text-emerald-500 mt-0.5 shrink-0" />
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
                  </div>
                </div>

                {isCancellable && (
                  <button
                    className="mt-6 w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs font-bold transition-all disabled:opacity-50"
                    onClick={() => handleCancelClick(app._id)}
                    disabled={cancelling === app._id}
                  >
                    {cancelling === app._id ? "Cancelling..." : "Cancel Appointment"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirm Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={executeCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Cancel Appointment"
        isLoading={cancelling === cancelTargetId}
      />
    </div>
  );
}
