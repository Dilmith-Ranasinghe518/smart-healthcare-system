"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Video,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Mail,
  ArrowRight,
  Sparkles,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function DoctorPatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, chat, meeting

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "doctor") fetchPatientsData();
  }, [user]);

  const fetchPatientsData = async () => {
    setFetching(true);
    setError("");

    try {
      // 1. Get Doctor Profile
      const profRes = await fetch(`${API_BASE}/doctors/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message);

      const doctorId = profData.doctor?._id;
      if (!doctorId) {
        setFetching(false);
        return;
      }

      // 2. Get Appointments and Users in parallel
      const [apptRes, userRes] = await Promise.all([
        fetch(`${API_BASE}/appointments/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ]);

      const apptData = await apptRes.json();
      const userData = await userRes.json();

      if (!apptRes.ok) throw new Error(apptData.message);
      
      const pMap = {};
      const actualUsers = Array.isArray(userData) ? userData : userData.users || [];
      actualUsers.forEach((u) => (pMap[u._id] = u));
      setPatientMap(pMap);

      setAppointments(apptData.appointments || []);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load patient data");
    } finally {
      setFetching(false);
    }
  };

  const processedPatients = useMemo(() => {
    const patients = {};

    // Only consider appointments that have chat or meeting enabled
    const enabledAppointments = appointments.filter(
      (app) => app.isChatEnabled || app.isMeetingEnabled
    );

    enabledAppointments.forEach((app) => {
      const pid = app.patientId;
      if (!patients[pid]) {
        patients[pid] = {
          id: pid,
          details: patientMap[pid] || { name: "Unknown Patient", email: "N/A" },
          isChatEnabled: false,
          isMeetingEnabled: false,
          lastAppointment: app,
          appointmentCount: 0
        };
      }

      if (app.isChatEnabled) patients[pid].isChatEnabled = true;
      if (app.isMeetingEnabled) patients[pid].isMeetingEnabled = true;
      
      patients[pid].appointmentCount++;

      // Keep latest appointment
      if (new Date(app.date) > new Date(patients[pid].lastAppointment.date)) {
        patients[pid].lastAppointment = app;
      }
    });

    return Object.values(patients);
  }, [appointments, patientMap]);

  const filteredPatients = processedPatients.filter((p) => {
    const nameMatch = p.details.name.toLowerCase().includes(search.toLowerCase());
    const emailMatch = p.details.email.toLowerCase().includes(search.toLowerCase());
    
    let typeMatch = true;
    if (filterType === "chat") typeMatch = p.isChatEnabled;
    if (filterType === "meeting") typeMatch = p.isMeetingEnabled;

    return (nameMatch || emailMatch) && typeMatch;
  });

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      {/* Header Section */}
      <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
            <Sparkles size={14} />
            Patient Management
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
            My Active Patients
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Quickly access patients for whom you've enabled telemedicine features.
            Start chats, join meetings, or review their history.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                <Users size={20} />
              </div>
              <p className="text-sm font-bold text-slate-800">Total Patients</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{processedPatients.length}</p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                <MessageSquare size={20} />
              </div>
              <p className="text-sm font-bold text-slate-800">Chat Enabled</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {processedPatients.filter(p => p.isChatEnabled).length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Video size={20} />
              </div>
              <p className="text-sm font-bold text-slate-800">Video Meetings</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {processedPatients.filter(p => p.isMeetingEnabled).length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType("all")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-[#2F8F68] text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-[#74B49B]"
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilterType("chat")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              filterType === "chat"
                ? "bg-[#4F7EA8] text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-[#4F7EA8]"
            }`}
          >
            Chat Enabled
          </button>
          <button
            onClick={() => setFilterType("meeting")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              filterType === "meeting"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-500"
            }`}
          >
            Meetings Enabled
          </button>
        </div>
      </div>

      {/* Patient List */}
      {fetching ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#74B49B]/20 border-t-[#74B49B]" />
            <span>Loading patient records...</span>
          </div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Users size={34} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Patients Found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {search || filterType !== 'all' 
              ? "No patients match your current filters. Try adjusting your search."
              : "You haven't enabled chat or meetings for any patients yet. Go to Appointments to enable these features."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#74B49B]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              {/* Patient Profile & Info */}
              <div className="mb-6 flex items-start gap-4">
                <div className="relative h-14 w-14 rounded-2xl bg-[#EAF7F1] flex items-center justify-center text-[#2F8F68] font-black text-lg border border-[#D7EBDD] overflow-hidden">
                   {p.details.profilePicture ? (
                     <img 
                       src={`${API_BASE}${p.details.profilePicture}`} 
                       alt={p.details.name}
                       className="h-full w-full object-cover"
                       onError={(e) => { e.target.src = ""; e.target.parentElement.innerHTML = p.details.name[0]; }}
                     />
                   ) : (
                     p.details.name[0]
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-lg font-black text-slate-800 group-hover:text-[#2F8F68] transition-colors">
                    {p.details.name}
                  </h3>
                  <p className="truncate text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} className="shrink-0" /> {p.details.email}
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <div className="rounded-full bg-slate-50 p-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={16} />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="mb-6 flex flex-wrap gap-2">
                {p.isChatEnabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#6C8CBF]/20 bg-[#EAF3F8] px-2.5 py-1 text-[10px] font-bold text-[#4F7EA8]">
                    <MessageSquare size={12} /> CHAT ACTIVE
                  </span>
                )}
                {p.isMeetingEnabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                    <Video size={12} /> MEETING READY
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  <ClipboardList size={12} /> {p.appointmentCount} SESSION(S)
                </span>
              </div>

              {/* Latest Session */}
              <div className="mt-auto rounded-2xl border border-slate-100 bg-[#F8FBF9] p-4">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Appointment</p>
                   <span className="text-[10px] font-mono text-slate-400">ID: {p.lastAppointment.appointmentId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-[#4F7EA8]" />
                  <p className="text-sm font-bold text-slate-700">
                    {p.lastAppointment.date}
                  </p>
                  <ArrowRight size={14} className="text-slate-300 ml-auto" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push(`/dashboard/doctor/appointments?search=${p.details.name}`)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-[#74B49B]"
                >
                  History
                </button>
                <button
                  onClick={() => router.push(`/dashboard/doctor/appointments?appId=${p.lastAppointment._id}&tab=chat`)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2F8F68] py-2.5 text-xs font-bold text-white transition hover:bg-[#257354] shadow-md shadow-[#2F8F68]/10"
                >
                  Contact <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
