"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, XCircle, CheckCircle, Clock3,
  AlertCircle, Check, X, CheckSquare, Search, RefreshCw, Activity
} from "lucide-react";
import toast from "react-hot-toast";
import Sel from "@/components/Sel";
import Pagination from "@/components/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APPOINTMENT_API = API_BASE;
const DOCTOR_API = API_BASE;
const USER_API = API_BASE;

export default function AdminAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null); // stores appointment ID loading

  // Name Maps
  const [patientMap, setPatientMap] = useState({});
  const [doctorMap, setDoctorMap] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") fetchAllAppointments();
  }, [user]);

  const fetchAllAppointments = async () => {
    setFetching(true);
    setError("");
    try {
      const apptRes = fetch(`${APPOINTMENT_API}/appointments/all`, { headers: { Authorization: `Bearer ${user.token}` } });
      const docRes = fetch(`${DOCTOR_API}/doctors/admin/all`, { headers: { Authorization: `Bearer ${user.token}` } });
      const userRes = fetch(`${USER_API}/users`, { headers: { Authorization: `Bearer ${user.token}` } });

      const [rAppt, rDoc, rUser] = await Promise.all([apptRes, docRes, userRes]);

      if (!rAppt.ok) { const d = await rAppt.json(); throw new Error(d.message || "Failed to fetch appointments"); }

      const apptData = await rAppt.json();
      const docData = rDoc.ok ? await rDoc.json() : { doctors: [] };
      const userData = rUser.ok ? await rUser.json() : [];

      // Build Lookup Maps
      const pMap = {};
      const actualUsers = Array.isArray(userData) ? userData : userData.users || [];
      actualUsers.forEach(u => pMap[u._id] = u.name);
      setPatientMap(pMap);

      const dMap = {};
      const actualDocs = docData.doctors || [];
      actualDocs.forEach(d => dMap[d._id] = d.name);
      setDoctorMap(dMap);

      const appts = apptData.appointments || [];

      // Sort by absolute date+time (newest first for admin view)
      appts.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.timeSlot.startTime}`);
        const dateTimeB = new Date(`${b.date}T${b.timeSlot.startTime}`);
        return dateTimeB - dateTimeA;
      });

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
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(actionStr === 'cancel' ? { reason: "Cancelled by Admin" } : {})
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Failed to ${actionStr}`);
      }

      const labels = {
        accept: 'Appointment accepted',
        reject: 'Appointment rejected',
        complete: 'Marked as completed',
        cancel: 'Appointment cancelled'
      };

      toast.success(labels[actionStr] || 'Status updated');
      fetchAllAppointments();
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
      case 'AWAITING_PAYMENT':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-wide border border-blue-500/20"><Clock size={14} /> AWAITING PAYMENT</span>;  
      case 'COMPLETED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold tracking-wide border border-indigo-500/20"><CheckSquare size={14} /> COMPLETED</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold tracking-wide border border-slate-200 dark:border-slate-700">{status}</span>;
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    const q = search.toLowerCase();
    const pName = (patientMap[app.patientId] || app.patientId).toLowerCase();
    const dName = (doctorMap[app.doctorId] || app.doctorId).toLowerCase();
    const hName = (app.location?.hospitalName || "").toLowerCase();
    const dateStr = (app.date || "").toLowerCase();
    const timeStr = `${app.timeSlot?.startTime || ""} ${app.timeSlot?.endTime || ""}`.toLowerCase();

    const matchSearch = String(app.appointmentId || app._id).toLowerCase().includes(q) || pName.includes(q) || dName.includes(q) || hName.includes(q) || dateStr.includes(q) || timeStr.includes(q);
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchDoctor = doctorFilter === "all" || app.doctorId === doctorFilter;
    return matchSearch && matchStatus && matchDoctor;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, doctorFilter]);

  const uniqueStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "AWAITING_PAYMENT"];
  const uniqueDoctors = [...new Set(appointments.map(a => a.doctorId))].filter(Boolean);

  if (loading || !user) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-2">
          Appointments Management
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          System-wide overview of all patient bookings. Admins can override statuses in case of disputes.
        </p>
      </header>

      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-center gap-2">
          <AlertCircle size={16} /> <span>{error}</span>
          <button className="ml-auto underline text-xs" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, hospital..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Sel
            className="w-full md:w-48"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Sel>
          <Sel
            className="w-full md:w-48"
            value={doctorFilter}
            onChange={e => setDoctorFilter(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {uniqueDoctors.map(docId => (
              <option key={docId} value={docId}>{doctorMap[docId] || docId}</option>
            ))}
          </Sel>
        </div>

        <button
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all flex-shrink-0"
          onClick={fetchAllAppointments}
          title="Refresh"
        >
          <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      {fetching ? (
        <div className="py-20 text-center text-slate-500">Loading system appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="glass-panel py-32 text-center flex flex-col items-center gap-3">
          <Activity size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Appointments Found</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            {search || statusFilter !== 'all' ? "Try clearing your filters." : "The system currently has no booked appointments."}
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Appointment Info</th>
                <th className="pb-3 font-semibold">Doctor & Patient</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Admin Overrides</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map(app => {
                const isPending = app.status === 'PENDING';
                const isConfirmed = app.status === 'CONFIRMED';
                const pName = patientMap[app.patientId] || app.patientId;
                const dName = doctorMap[app.doctorId] || app.doctorId;

                return (
                  <tr key={app._id} className="border-b border-slate-200 dark:border-white/5 last:border-none hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">

                    {/* Time & Date */}
                    <td className="py-4 pr-4">
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-indigo-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{app.date}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            {app.timeSlot?.startTime} - {app.timeSlot?.endTime}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <p className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID: {app.appointmentId || app._id.slice(-6)}</p>
                            {app.appointmentType && (
                              <p className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-1.5 py-0.5 rounded">{app.appointmentType}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Participants */}
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">DR</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{dName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">PT</span>
                          <span className="text-slate-600 dark:text-slate-400">{pName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 pr-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">{app.location?.hospitalName}</p>
                          <p className="text-xs text-slate-500">{app.location?.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 pr-4">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <>
                            <button
                              title="Accept"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                              onClick={() => updateStatus(app._id, 'accept')}
                              disabled={processing}
                            ><Check size={16} /></button>
                          </>
                        )}

                        {isConfirmed && (
                          <>
                            <button
                              title="Complete"
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                              onClick={() => updateStatus(app._id, 'complete')}
                              disabled={processing}
                            ><CheckSquare size={16} /></button>
                          </>
                        )}
                        
                        {(isPending || isConfirmed || app.status === 'AWAITING_PAYMENT') && (
                          <>
                            <button
                              title="Cancel"
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                              onClick={() => updateStatus(app._id, 'cancel')}
                              disabled={processing}
                            ><XCircle size={16} /></button>
                          </>
                        )}

                        {['CANCELLED', 'COMPLETED'].includes(app.status) && (
                          <span className="text-xs text-slate-400 italic">No actions</span>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedAppointments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

        </div>
      )}
    </div>
  );
}
