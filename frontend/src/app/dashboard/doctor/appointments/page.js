"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle,
  Clock3,
  AlertCircle,
  Check,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Users,
  Filter,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";
import Sel from "@/components/Sel";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APPOINTMENT_API = API_BASE;
const DOCTOR_API = API_BASE;

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);
  const [patientMap, setPatientMap] = useState({});

  const [search, setSearch] = useState("");
  const [filterHospital, setFilterHospital] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterTimeSlot, setFilterTimeSlot] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "doctor") fetchDoctorAndAppointments();
  }, [user]);

  // Handle URL params for auto-open modal
  useEffect(() => {
    if (!fetching && appointments.length > 0) {
      const appId = searchParams.get("appId");
      const tab = searchParams.get("tab");
      const searchVal = searchParams.get("search");

      if (searchVal) setSearch(searchVal);

      if (appId) {
        const targetApp = appointments.find(a => a._id === appId || a.appointmentId === appId);
        if (targetApp) {
          setSelectedAppointment(targetApp);
          setShowDetailsModal(true);
        }
      }
    }
  }, [searchParams, fetching, appointments]);

  const fetchDoctorAndAppointments = async () => {
    setFetching(true);
    setError("");

    try {
      const profRes = await fetch(`${DOCTOR_API}/doctors/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message);

      const myDoctor = profData.doctor;
      if (!myDoctor) {
        setFetching(false);
        return;
      }

      setDoctor(myDoctor);

      const apptRes = fetch(`${APPOINTMENT_API}/appointments/doctor/${myDoctor._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const userRes = fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const [rAppt, rUser] = await Promise.all([apptRes, userRes]);

      const apptData = await rAppt.json();
      if (!rAppt.ok) throw new Error(apptData.message);

      const userData = rUser.ok ? await rUser.json() : [];
      const pMap = {};
      const actualUsers = Array.isArray(userData) ? userData : userData.users || [];
      actualUsers.forEach((u) => (pMap[u._id] = u.name));
      setPatientMap(pMap);

      const appts = apptData.appointments || [];
      appts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAppointments(appts);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (appId, actionStr) => {
    setProcessing(`${appId}-${actionStr}`);

    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments/${appId}/${actionStr}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Failed to ${actionStr}`);
      }

      const labels = {
        accept: "Appointment accepted!",
        reject: "Appointment rejected.",
        complete: "Marked as completed.",
        cancel: "Appointment cancelled.",
      };

      toast.success(labels[actionStr] || "Status updated.");
      fetchDoctorAndAppointments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleMeeting = async (appId) => {
    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments/${appId}/toggle-meeting`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to toggle meeting");

      toast.success(
        data.isMeetingEnabled ? "Meeting enabled for patient" : "Meeting disabled"
      );

      const updatedAppt = data.appointment;
      setAppointments((prev) => prev.map((a) => (a._id === appId ? updatedAppt : a)));

      if (selectedAppointment?._id === appId) {
        setSelectedAppointment(updatedAppt);
      }
    } catch (err) {
      toast.error(err.message);
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
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EAF3F8] px-3 py-1 text-xs font-bold tracking-wide text-[#4F7EA8]">
            <CheckSquare size={14} /> COMPLETED
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

  const filteredAppointments = appointments.filter((app) => {
    const q = search.toLowerCase();
    const pName = (patientMap[app.patientId] || app.patientId).toLowerCase();
    const matchSearch =
      pName.includes(q) ||
      (app.notes || "").toLowerCase().includes(q) ||
      String(app.appointmentId || app._id).toLowerCase().includes(q);

    const matchHospital =
      filterHospital === "all" || app.location.hospitalName === filterHospital;

    const matchDate = !filterDate || app.date === filterDate;

    const timeSlotStr = app.timeSlot
      ? `${app.timeSlot.startTime} - ${app.timeSlot.endTime}`
      : "";

    const matchTimeSlot = filterTimeSlot === "all" || timeSlotStr === filterTimeSlot;
    const matchStatus = filterStatus === "all" || app.status === filterStatus;

    return (
      matchSearch &&
      matchHospital &&
      matchDate &&
      matchTimeSlot &&
      matchStatus
    );
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterHospital, filterDate, filterTimeSlot, filterStatus]);

  const uniqueHospitals = [...new Set(appointments.map((a) => a.location.hospitalName))];
  const uniqueTimeSlots = [
    ...new Set(
      appointments.map((a) =>
        a.timeSlot ? `${a.timeSlot.startTime} - ${a.timeSlot.endTime}` : ""
      )
    ),
  ].filter(Boolean);

  const uniqueStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  const pendingFiltered = filteredAppointments.filter((a) => a.status === "PENDING");

  const handleBulkAccept = async () => {
    if (pendingFiltered.length === 0) return;

    setBulkLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const app of pendingFiltered) {
      try {
        const res = await fetch(`${APPOINTMENT_API}/appointments/${app._id}/accept`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully accepted ${successCount} appointment(s).`);
    }
    if (failCount > 0) {
      toast.error(`Failed to accept ${failCount} appointment(s).`);
    }

    setBulkLoading(false);
    setShowBulkConfirm(false);
    fetchDoctorAndAppointments();
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
      <div className="mb-8 grid w-full gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Doctor Schedule Control
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Patient Appointments
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Approve requests, manage your daily schedule, and review appointment
              details from one organized workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <Users size={20} />
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
              <h2 className="text-lg font-black text-slate-800">Schedule Filters</h2>
              <p className="text-xs text-slate-500">Refine your appointment list</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search patient, notes..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="date"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />

            <Sel
              className="w-full"
              value={filterTimeSlot}
              onChange={(e) => setFilterTimeSlot(e.target.value)}
            >
              <option value="all">All Time Slots</option>
              {uniqueTimeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Sel>

            <Sel
              className="w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Sel>

            <Sel
              className="w-full"
              value={filterHospital}
              onChange={(e) => setFilterHospital(e.target.value)}
            >
              <option value="all">All Hospitals</option>
              {uniqueHospitals.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Sel>

            <button
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              onClick={() => {
                setSearch("");
                setFilterHospital("all");
                setFilterDate("");
                setFilterTimeSlot("all");
                setFilterStatus("all");
              }}
            >
              Reset Filters
            </button>

            {pendingFiltered.length > 0 && (
              <button
                disabled={bulkLoading}
                onClick={() => setShowBulkConfirm(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                {bulkLoading
                  ? "Accepting..."
                  : `Accept All Pending (${pendingFiltered.length})`}
              </button>
            )}
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
          Syncing schedule...
        </div>
      ) : !doctor ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Calendar size={34} />
          </div>
          <h3 className="text-lg font-black text-slate-800">Profile Required</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            You must configure your Doctor Profile and add availability slots before
            you can receive appointments.
          </p>
          <button
            className="mt-6 rounded-2xl bg-gradient-to-r from-[#BAC94A] to-[#9EB73B] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(158,183,59,0.24)] transition hover:-translate-y-0.5"
            onClick={() => router.push("/dashboard/doctor/profile")}
          >
            Setup Profile Now
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <ClipboardList size={34} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Appointments</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            You do not have any booked patient sessions across your locations.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedAppointments.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">
                No appointments match your filters.
              </div>
            ) : (
              paginatedAppointments.map((app) => {
                const isPending = app.status === "PENDING";
                const isConfirmed = app.status === "CONFIRMED";

                return (
                  <div
                    key={app._id}
                    onClick={() => handleCardClick(app)}
                    className="relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#74B49B]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
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
                            <MessageSquare size={10} /> CHAT ENABLED
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

                    <div className="mb-6 flex-1 pl-2">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="max-w-[210px] overflow-hidden text-ellipsis whitespace-nowrap text-lg font-black text-slate-800"
                            title={patientMap[app.patientId] || app.patientId}
                          >
                            {patientMap[app.patientId] || "Unknown Patient"}
                          </h3>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                            User ID: {app.patientId.slice(-6)}
                          </p>
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

                        {app.notes && (
                          <div className="mt-1 rounded-2xl border-l-2 border-[#BAC94A] bg-[#F9FBF2] p-3 text-xs italic text-slate-600">
                            "{app.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full gap-2">
                      {isPending && (
                        <button
                          className="flex-1 rounded-2xl bg-[#EAF7F1] py-2.5 text-xs font-bold text-[#2F8F68] transition hover:bg-[#DDF2E8] disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(app._id, "accept");
                          }}
                          disabled={processing === `${app._id}-accept`}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <Check size={14} /> Accept
                          </span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          className="flex-1 rounded-2xl border border-[#6C8CBF]/20 bg-[#EAF3F8] py-2.5 text-xs font-bold text-[#4F7EA8] transition hover:bg-[#DDEAF4] disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(app._id, "complete");
                          }}
                          disabled={processing === `${app._id}-complete`}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <CheckSquare size={14} /> Complete
                          </span>
                        </button>
                      )}

                      {(isPending || isConfirmed) && (
                        <button
                          className="flex-1 rounded-2xl border border-rose-100 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(app._id, "cancel");
                          }}
                          disabled={processing === `${app._id}-cancel`}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <XCircle size={14} /> Cancel
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        user={user}
        onStatusUpdate={(id, action) => {
          updateStatus(id, action);
          setShowDetailsModal(false);
        }}
        onToggleMeeting={handleToggleMeeting}
        initialTab={searchParams.get("tab") || "info"}
      />

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