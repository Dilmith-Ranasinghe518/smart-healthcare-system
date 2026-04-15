"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle,
  Clock3,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Filter,
  Stethoscope,
  ClipboardList,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APPOINTMENT_API = API_BASE;
const DOCTOR_API = API_BASE;

export default function UserAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "user") fetchAppointments();
  }, [user, statusFilter]);

  const fetchAppointments = async () => {
    setFetching(true);
    setError("");
    try {
      let url = `${APPOINTMENT_API}/appointments/my`;
      if (statusFilter !== "ALL") {
        url += `?status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");

      const appts = data.appointments || [];
      setAppointments(appts);

      const uniqueDoctorIds = [...new Set(appts.map((a) => a.doctorId))];
      uniqueDoctorIds.forEach((id) => {
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
        setDoctors((prev) => ({ ...prev, [doctorId]: data.doctor }));
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Cancelled by User" }),
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

  const handleCardClick = (app) => {
    setSelectedAppointment(app);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#F3F7E8] px-3 py-1 text-xs font-bold tracking-wide text-[#7C9440]">
            <Clock3 size={14} /> PENDING
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EAF7F1] px-3 py-1 text-xs font-bold tracking-wide text-[#2F8F68]">
            <CheckCircle size={14} /> CONFIRMED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#FDECEC] px-3 py-1 text-xs font-bold tracking-wide text-[#D35C5C]">
            <XCircle size={14} /> CANCELLED
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#FDECEC] px-3 py-1 text-xs font-bold tracking-wide text-[#D35C5C]">
            <XCircle size={14} /> REJECTED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EAF3F8] px-3 py-1 text-xs font-bold tracking-wide text-[#4F7EA8]">
            <CheckCircle size={14} /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wide text-slate-500">
            {status}
          </span>
        );
    }
  };

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    };
  }, [appointments]);

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Patient Appointment Center
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              My Appointments
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Track upcoming doctor visits, review status changes, and manage your
              consultation journey from one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <ClipboardList size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Total Records</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{stats.total}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <Clock3 size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Pending</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{stats.pending}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Confirmed</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{stats.confirmed}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <Filter size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Status Filter</h2>
              <p className="text-xs text-slate-500">Review appointments by status</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Appointment Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setStatusFilter("ALL")}
            >
              Reset Filter
            </button>

            <button
              className="w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
              onClick={() => router.push("/dashboard/user/find-doctors")}
            >
              <span className="flex items-center justify-center gap-2">
                <Search size={16} />
                Find a Doctor
              </span>
            </button>
          </div>
        </section>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {fetching ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm">
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Calendar size={34} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Appointments</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            You do not have any booked appointments yet.
          </p>
          <button
            className="mt-6 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
            onClick={() => router.push("/dashboard/user/find-doctors")}
          >
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {appointments.map((app) => {
            const docInfo = doctors[app.doctorId];
            const isCancellable = app.status === "PENDING";

            return (
              <div
                key={app._id}
                onClick={() => handleCardClick(app)}
                className={`relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#74B49B]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${
                  !isCancellable ? "opacity-80" : ""
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    app.status === "PENDING"
                      ? "bg-[#A9BF5A]"
                      : app.status === "CONFIRMED"
                      ? "bg-[#5AA7A7]"
                      : app.status === "COMPLETED"
                      ? "bg-[#6C8CBF]"
                      : "bg-[#D35C5C]"
                  }`}
                />

                <div className="mb-4 flex items-start justify-between pl-2">
                  <div className="flex flex-col items-start gap-2">
                    {getStatusBadge(app.status)}
                    {app.isChatEnabled && (
                      <span className="flex items-center gap-1.5 rounded-lg border border-[#6C8CBF]/20 bg-[#EAF3F8] px-2 py-1 text-[10px] font-bold text-[#4F7EA8]">
                        <MessageSquare size={10} /> CHAT ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
                      ID: {app.appointmentId || app._id.slice(-6)}
                    </span>
                    {app.queueNo && (
                      <span className="rounded border border-[#74B49B]/20 bg-[#EAF7F1] px-2 py-1 text-[10px] font-bold text-[#2F8F68]">
                        Queue: {app.queueNo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 pl-2">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="max-w-[210px] overflow-hidden text-ellipsis whitespace-nowrap text-lg font-black text-slate-800">
                        {docInfo ? docInfo.name : "Loading Doctor..."}
                      </h3>
                      {docInfo && (
                        <p className="mt-1 text-xs font-semibold text-[#4F7EA8]">
                          {docInfo.specialization}
                        </p>
                      )}
                    </div>

                    {app.appointmentType && (
                      <span className="rounded-full border border-[#6C8CBF]/20 bg-[#EAF3F8] px-2.5 py-1 text-[10px] font-semibold text-[#4F7EA8]">
                        {app.appointmentType}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FBF9] p-3">
                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="mt-0.5 shrink-0 text-[#4F7EA8]" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {app.date}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={12} /> {app.timeSlot.startTime} -{" "}
                            {app.timeSlot.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 px-1">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {app.location.hospitalName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {app.location.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isCancellable && (
                  <button
                    className="mt-6 w-full rounded-2xl border border-rose-100 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelClick(app._id);
                    }}
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

      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        user={user}
        onStatusUpdate={() => {}}
        onToggleMeeting={() => {}}
      />

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