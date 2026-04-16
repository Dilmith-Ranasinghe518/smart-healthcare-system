"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Video, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Zap, 
  ExternalLink,
  Loader2,
  Sparkles,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { API_URL } from "@/utils/api";
import { 
  StreamVideoClient, 
  StreamVideo, 
  StreamCall, 
  SpeakerLayout, 
  CallControls, 
  StreamTheme 
} from "@stream-io/video-react-sdk";
import { useSearchParams, useRouter } from "next/navigation";

function MeetingsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCallId = searchParams.get("callId") || "";

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [selectedCallId, setSelectedCallId] = useState(initialCallId);
  const [appointments, setAppointments] = useState([]);
  const [liveCalls, setLiveCalls] = useState({}); // { id: boolean }
  const [fetchingAppts, setFetchingAppts] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch Appointments and Stream Token
  useEffect(() => {
    if (!loading && user) {
      fetchUserAppointments();
      initializeStream();
    }
    return () => { if (client) client.disconnectUser(); };
  }, [user, loading]);

  const fetchUserAppointments = async () => {
    setFetchingAppts(true);
    try {
      const res = await fetch(`${API_URL}/appointments/user/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Filter for confirmed and meeting-enabled appointments
        const valid = (data.appointments || []).filter(
          app => app.status === "CONFIRMED" && app.isMeetingEnabled
        );
        setAppointments(valid);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setFetchingAppts(false);
    }
  };

  const initializeStream = async () => {
    try {
      const res = await fetch(`${API_URL}/telemedicine/stream-token`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error("Failed to authenticate stream");
      
      const videoClient = new StreamVideoClient({
        apiKey: data.apiKey,
        user: { 
          id: user._id.toString(), 
          name: user.name,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}` 
        },
        token: data.token
      });
      setClient(videoClient);
    } catch (err) {
      console.error("Stream initialization error:", err);
      setError("Could not authorize security nodes for video consultations.");
    }
  };

  // 2. Periodically check which appointments are "Live"
  useEffect(() => {
    if (client && appointments.length > 0) {
      const checkLiveStatus = async () => {
        const statuses = {};
        for (const app of appointments) {
          try {
            const { calls } = await client.queryCalls({
              filter_conditions: { id: { $eq: app._id } },
            });
            statuses[app._id] = calls.length > 0;
          } catch (e) {
            statuses[app._id] = false;
          }
        }
        setLiveCalls(statuses);
      };

      checkLiveStatus();
      const interval = setInterval(checkLiveStatus, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [client, appointments]);

  // 3. Handle specific call join from list
  const joinCall = async (id) => {
    if (!client || !id || !liveCalls[id]) return;
    try {
      const activeCall = client.call('default', id);
      await activeCall.join(); 
      setCall(activeCall);
      setSelectedCallId(id);
      setError(""); 
    } catch (err) {
      setError("Unable to join consultation. The session may have ended.");
      console.error("Join Call Error:", err);
    }
  };

  useEffect(() => {
    if (client && initialCallId && liveCalls[initialCallId] && !call) {
      joinCall(initialCallId);
    }
  }, [client, initialCallId, liveCalls, call]);

  if (loading || !user) return <div className="p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      {/* Header section consistent with dashboard */}
      <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
            <Sparkles size={14} />
            Virtual Health Hub
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
            Telemedicine
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Access your secure video consultations. Your doctor will enable the 
            meeting room when they are ready to begin your session.
          </p>
        </div>
      </section>

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
          <AlertTriangle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      {!call ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Active Sessions List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
              <Video className="text-[#5C8D7A]" size={22} /> Available Sessions
            </h2>

            {fetchingAppts ? (
              <div className="flex h-40 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                  <Video size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800">No Active Meetings</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 italic">
                  Join links will appear here once your doctor enables video consultation for an appointment.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map((app) => {
                  const isLive = liveCalls[app._id];
                  return (
                    <div 
                      key={app._id}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#74B49B]/30 hover:shadow-md"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                          <User size={30} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#74B49B] mb-1">Appointment with</p>
                          <h3 className="text-xl font-black text-slate-800">
                             Dr. {app.doctorName || "Your Specialist"}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                             <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                               <Calendar size={14} className="text-indigo-400" /> {app.date}
                             </span>
                             <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                               <Clock size={14} className="text-indigo-400" /> {app.timeSlot.startTime}
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ${isLive ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                          <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {isLive ? 'Doctor is Live' : 'Waiting for Doctor'}
                        </div>
                        <button 
                          onClick={() => joinCall(app._id)}
                          disabled={!isLive}
                          className={`flex w-full min-w-[180px] items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${isLive ? 'bg-[#2F8F68] text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                          <Zap size={16} fill={isLive ? "white" : "none"} /> Join Consultation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                 <ShieldCheck size={24} />
               </div>
               <h3 className="text-lg font-black text-slate-800">Secure Access Only</h3>
               <p className="mt-2 text-sm leading-relaxed text-slate-500">
                 All video consultations are encrypted and HIPAA compliant. Only your 
                 authorized doctor can start the session.
               </p>
               <ul className="mt-4 space-y-3">
                 <li className="flex items-start gap-2 text-xs text-slate-600">
                   <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#74B49B] shrink-0" />
                   Ensure your camera and microphone are permitted.
                 </li>
                 <li className="flex items-start gap-2 text-xs text-slate-600">
                   <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#74B49B] shrink-0" />
                   A stable internet connection is recommended.
                 </li>
               </ul>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#F1F7F4] p-6 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                 <MessageSquare size={16} /> Need help?
               </h3>
               <p className="mt-2 text-xs text-slate-600">
                 If your doctor hasn't arrived, you can use the chat in your 
                 appointment card to send them a message.
               </p>
               <button 
                onClick={() => router.push('/dashboard/user/appointments')}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-[#2F8F68] hover:underline"
               >
                 Go to My Appointments <ArrowLeft size={14} className="rotate-180" />
               </button>
            </section>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] overflow-hidden shadow-2xl bg-slate-950 border border-slate-200 dark:border-white/10 animate-[scaleIn_0.3s_ease-out] h-[750px] w-full flex flex-col relative">
          <div className="absolute top-4 left-4 z-[60]">
             <button 
               onClick={() => { setCall(null); window.location.reload(); }}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-all"
             >
               <ArrowLeft size={16} /> Leave Room
             </button>
          </div>
          
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                <SpeakerLayout />
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                  <CallControls onLeave={() => setCall(null)} />
                </div>
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        </div>
      )}
    </div>
  );
}

export default function UserMeetingsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-slate-400">Loading Telemedicine...</div>}>
            <MeetingsContent />
        </Suspense>
    );
}
