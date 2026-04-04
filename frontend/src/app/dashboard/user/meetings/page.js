"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Video, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { API_URL } from "@/utils/api";
import { StreamVideoClient, StreamVideo, StreamCall, SpeakerLayout, CallControls, StreamTheme } from "@stream-io/video-react-sdk";
import { useSearchParams, useRouter } from "next/navigation";

function MeetingsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCallId = searchParams.get("callId") || "";

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(initialCallId);
  const [isCallLive, setIsCallLive] = useState(false);
  const [checking, setChecking] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");

  // Fetch Appointment Details and Stream Token
  useEffect(() => {
    if (!loading && user && initialCallId) {
      // 1. Fetch Appointment Status
      fetch(`${API_URL}/appointments/${initialCallId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.appointment) {
          setAppointment(data.appointment);
        }
      })
      .catch(err => console.error("Error fetching appointment:", err));

      // 2. Fetch Stream Token
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

  // Listen for call ended event
  useEffect(() => {
    if (!call) return;
    const unbind = call.on('call.ended', () => {
      setCall(null);
      setIsCallLive(false);
      setError("The consultation has been ended by the doctor. Thank you for using our service.");
    });
    return () => unbind();
  }, [call]);

  // Auto-check if call exists periodically
  useEffect(() => {
    const targetId = callId || initialCallId;
    // Only check if call hasn't started
    if (client && targetId && !call) {
      const checkCall = async () => {
        try {
          const { calls } = await client.queryCalls({
            filter_conditions: { id: { $eq: targetId } },
          });
          // Stability fix: Once live, keep it live to avoid flicker. 
          // If the doctor really ended it, joinCall will handle the error.
          if (calls.length > 0) {
            setIsCallLive(true);
          }
        } catch (err) {
          console.error("Check call error:", err);
        }
      };
      
      checkCall();
      const interval = setInterval(checkCall, 5000); // Check every 5s
      return () => clearInterval(interval);
    }
  }, [client, callId, initialCallId, call]);

  // Auto-check logic removed from here

  const joinCall = async (id) => {
    if (!client || !id || !isCallLive) return;
    try {
      const activeCall = client.call('default', id);
      // Patients should NOT create calls. They must wait for the doctor to start.
      await activeCall.join(); 
      setCall(activeCall);
      setError(""); 
    } catch (err) {
      // Check if it's a "Call Not Found" error (Code 16)
      if (err.code === 16 || err.message?.includes("Can't find call")) {
        setError("Your doctor has not started the meeting yet. Please wait for the doctor to activate the consultation room.");
      } else {
        setError("Unable to join the consultation room. Please try again or contact support.");
      }
      console.error("Join Call Error:", err);
    }
  };

  if (loading || !user) return <div className="text-slate-600 dark:text-slate-400 p-10 font-medium">Loading session...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
            Consultation Room
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm italic">Secure HIPAA compliant video consultation.</p>
        </div>
        {!call && (
          <button 
            onClick={() => router.push('/dashboard/user/appointments')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to My Appointments
          </button>
        )}
      </header>

      {error && (
        <div className="text-rose-400 mb-6 bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 text-sm flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {client && !call && (
        <div className="glass-panel p-10 flex flex-col gap-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-500">
            <Video size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Join Consultation</h3>
          <p className="text-sm text-slate-500">
            Please enter the room ID provided in your appointment details to join your doctor.
          </p>
          
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              className="input-field text-center font-bold tracking-widest uppercase mb-0" 
              placeholder="ROOM ID"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
            />
            <button 
              className="btn btn-primary w-full justify-center py-3 font-bold disabled:opacity-50 disabled:grayscale transition-all" 
              onClick={() => joinCall(callId)}
              disabled={!isCallLive || !callId}
            >
              {isCallLive ? (
                <span className="flex items-center gap-2"><CheckCircle size={18} /> Join Meeting</span>
              ) : (
                <span className="flex items-center gap-2 animate-pulse">Wait for Doctor to Start...</span>
              )}
            </button>
            {!isCallLive && callId && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mt-2">
                <p className="text-[11px] text-amber-500 uppercase font-bold tracking-wider mb-1">
                  🔴 System Status: Waiting
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  The consultation room is locked. The "Join" button will activate automatically once your doctor initializes the secure connection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {client && call && (
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-200 dark:border-white/10 animate-[scaleIn_0.3s_ease-out] h-[650px] w-full flex flex-col relative">
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                <SpeakerLayout />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
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
        <Suspense fallback={<div className="p-10 text-slate-400">Loading experience...</div>}>
            <MeetingsContent />
        </Suspense>
    );
}
