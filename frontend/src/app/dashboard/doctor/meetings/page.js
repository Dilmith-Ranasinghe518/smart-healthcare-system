"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Video, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { API_URL } from "@/utils/api";
import { StreamVideoClient, StreamVideo, StreamCall, SpeakerLayout, CallControls, StreamTheme } from "@stream-io/video-react-sdk";
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

  useEffect(() => {
    if (!loading && user) {
      // 1. Fetch Appointment if ID is present to check status
      if (initialCallId) {
        fetch(`${API_URL}/appointments/${initialCallId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.appointment) {
            setAppointment(data.appointment);
            // Doctor can always rejoin, even if status is COMPLETED
          }
        })
        .catch(err => console.error("Error fetching appointment:", err));
      }

      // 2. Fetch Stream Token from Backend
      fetch(`${API_URL}/telemedicine/stream-token`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to authenticate stream");
        return res.json();
      })
      .then(data => {
        if (!data.token) throw new Error("Token generation failed");
        
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
      })
      .catch(err => {
        console.error("Stream initialization error:", err);
        setError("Could not authorize Video consult nodes.");
      });
    }

    return () => {
      if (client) client.disconnectUser();
    };
  }, [user, loading]);

  // Auto-join if callId is provided in URL
  useEffect(() => {
    if (client && initialCallId && !call) {
      joinCall(initialCallId);
    }
  }, [client, initialCallId, call]);

  const joinCall = async (id) => {
    if (!client || !id) return;
    try {
      const activeCall = client.call('default', id);
      await activeCall.join({ create: true });
      setCall(activeCall);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndConsultation = async () => {
    if (!call || !user) return;
    
    const confirmEnd = window.confirm("Are you sure you want to end this consultation? This will disconnect the patient and mark the appointment as completed.");
    if (!confirmEnd) return;

    setIsEnding(true);
    try {
      // 1. End the call for everyone
      await call.endCall();
      
      // 2. Update status in database
      const res = await fetch(`${API_URL}/appointments/${initialCallId}/complete`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to mark appointment as completed");
      }

      toast.success("Consultation ended successfully");
      setCall(null);
      router.push('/dashboard/doctor/appointments');
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

  if (loading || !user) return <div className="text-slate-600 dark:text-slate-400 p-10">Loading consultations...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          Video Consultations
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Host or join HIPAA compliant stream consultation nodes.</p>
      </header>

      {error && (
        <div className="text-rose-400 mb-6 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-sm">
          {error}
        </div>
      )}

      {client && !call && (
        <div className="glass-panel p-6 flex flex-col gap-5 max-w-md mx-auto animate-[scaleIn_0.3s_ease-out]">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <Video size={20} /> Telemedicine Portal
          </h3>
          
          <button className="btn btn-primary w-full justify-center gap-2 py-3" onClick={createCall}>
            <Plus size={18} /> Create Instant Meeting
          </button>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 my-1 justify-center">
            <div className="h-px bg-white/5 flex-1" />
            <span>OR JOIN BY ID</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              className="input-field mb-0 text-sm flex-1" 
              placeholder="Enter Call ID"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
            />
            <button className="btn btn-secondary text-sm px-4" onClick={() => joinCall(callId)}>
              Join
            </button>
          </div>
        </div>
      )}

      {client && call && (
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-200 dark:border-white/5 animate-[scaleIn_0.3s_ease-out] h-[600px] w-full flex flex-col relative">
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                <SpeakerLayout />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4">
                  <CallControls onLeave={() => setCall(null)} />
                  <button 
                    onClick={handleEndConsultation}
                    disabled={isEnding}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                  >
                    {isEnding ? "Ending..." : "End Consultation"}
                  </button>
                </div>
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        </div>
      )}
    </div>
  );
}
