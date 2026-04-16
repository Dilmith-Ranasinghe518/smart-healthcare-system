"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Video,
  Plus,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Radio,
  PhoneCall,
  Copy,
  Check
} from "lucide-react";
import { API_URL } from "@/utils/api";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  CallControls,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function MeetingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCallId = searchParams.get("callId") || "";

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(initialCallId);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!call?.id) return;
    navigator.clipboard.writeText(call.id);
    setCopied(true);
    toast.success("Meeting ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!loading && user) {
      if (initialCallId) {
        fetch(`${API_URL}/appointments/${initialCallId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.appointment) {
              setAppointment(data.appointment);
            }
          })
          .catch((err) => console.error("Error fetching appointment:", err));
      }

      fetch(`${API_URL}/telemedicine/stream-token`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to authenticate stream");
          return res.json();
        })
        .then((data) => {
          if (!data.token) throw new Error("Token generation failed");

          const videoClient = new StreamVideoClient({
            apiKey: data.apiKey,
            user: {
              id: user._id.toString(),
              name: user.name,
              image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user.name
              )}`,
            },
            token: data.token,
          });

          setClient(videoClient);
        })
        .catch((err) => {
          console.error("Stream initialization error:", err);
          setError("Could not authorize video consultation access.");
        });
    }

    return () => {
      if (client) client.disconnectUser();
    };
  }, [user, loading]);

  useEffect(() => {
    if (client && initialCallId && !call) {
      joinCall(initialCallId);
    }
  }, [client, initialCallId, call]);

  const joinCall = async (id) => {
    if (!client || !id) return;

    try {
      const activeCall = client.call("default", id);
      await activeCall.join({ create: true });
      setCall(activeCall);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndConsultation = async () => {
    if (!call || !user) return;

    const confirmEnd = window.confirm(
      "Are you sure you want to end this consultation? This will disconnect the patient and mark the appointment as completed."
    );
    if (!confirmEnd) return;

    setIsEnding(true);

    try {
      await call.endCall();

      const res = await fetch(`${API_URL}/appointments/${initialCallId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to mark appointment as completed");
      }

      toast.success("Consultation ended successfully");
      setCall(null);
      router.push("/dashboard/doctor/appointments");
    } catch (err) {
      console.error("Error ending consultation:", err);
      toast.error(err.message || "Failed to end consultation");
    } finally {
      setIsEnding(false);
    }
  };

  const createCall = () => {
    const newId = `meet_${Math.random().toString(36).substring(7)}`;
    setCallId(newId);
    joinCall(newId);
  };

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading consultations...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      {!call && (
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Telemedicine Workspace
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Video Consultations
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Host or join secure consultation sessions for remote patient care and
              follow-up appointments.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <Video size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Virtual Care</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Meet patients remotely through live video sessions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Secure Access</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Use authenticated video nodes for protected consultations.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <Radio size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Live Sessions</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Start, join, and control active consultation rooms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <PhoneCall size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Session Access</h2>
              <p className="text-xs text-slate-500">Create or join your meeting room</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              {error}
            </div>
          )}

          {client && !call && (
            <div className="space-y-4">
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
                onClick={createCall}
              >
                <span className="flex items-center justify-center gap-2">
                  <Plus size={18} /> Create Instant Meeting
                </span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>Or join by ID</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                  placeholder="Enter Call ID"
                  value={callId}
                  onChange={(e) => setCallId(e.target.value)}
                />
                <button
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => joinCall(callId)}
                >
                  Join
                </button>
              </div>

              {appointment && (
                <div className="rounded-2xl bg-[#F8FBF9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Linked Appointment
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    Consultation session available
                  </p>
                </div>
              )}
            </div>
          )}

          {!client && !error && (
            <div className="rounded-2xl bg-[#F8FBF9] p-5 text-sm text-slate-500">
              Authorizing secure video access...
            </div>
          )}
        </section>
        </div>
      )}

      {client && call && (
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,#f8fbf9_0%,#eef7f4_100%)] px-5 py-4">
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-800">Active Consultation</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500">
                  {appointment ? "Linked to appointment" : "Instant Meeting"}
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-[10px] font-mono font-bold text-slate-400">MEETING ID:</span>
                  <p className="font-mono text-[10px] font-bold text-slate-800 tracking-wider uppercase">{call?.id}</p>
                  <button 
                    onClick={handleCopyId}
                    className="text-[#74B49B] hover:text-[#2F8F68] transition-colors"
                    title="Copy ID"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {appointment && (
              <button
                onClick={handleEndConsultation}
                disabled={isEnding}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700 disabled:opacity-70"
              >
                {isEnding ? "Ending..." : "End Consultation"}
              </button>
            )}
          </div>

          <div className="relative flex h-[680px] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <StreamTheme theme="dark">
                  <SpeakerLayout />
                  <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
                    <CallControls onLeave={() => setCall(null)} />
                  </div>
                </StreamTheme>
              </StreamCall>
            </StreamVideo>
          </div>
        </div>
      )}

      {!client && error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <AlertTriangle size={34} className="mx-auto mb-3 text-rose-500" />
          <h3 className="text-lg font-black text-rose-700">Video Access Failed</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-rose-600">
            The system could not initialize your video consultation session. Please
            refresh the page or try again later.
          </p>
        </div>
      )}
    </div>
  );
}