"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Video, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { API_URL } from "@/utils/api";
import { StreamVideoClient, StreamVideo, StreamCall, SpeakerLayout, CallControls, StreamTheme } from "@stream-io/video-react-sdk";

export default function MeetingsPage() {
  const { user, loading } = useAuth();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      // Fetch Stream Token from Backend
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
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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
