"use client";
import { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock3,
  ExternalLink,
  ShieldCheck,
  Zap,
  MessageSquare,
  Send,
  Paperclip,
  RotateCw,
  Mail,
  FileIcon,
  Download,
  Check
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AppointmentDetailsModal({ 
  isOpen, 
  onClose, 
  appointment, 
  user,
  onStatusUpdate,
  onToggleMeeting,
  initialTab = "info"
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // info, chat, email
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(appointment?.isChatEnabled || false);
  
  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      setIsChatEnabled(appointment.isChatEnabled);
      setActiveTab(initialTab || "info");
      if (appointment.isChatEnabled || user.role === 'doctor') {
        fetchMessages();
      }
    }
  }, [isOpen, appointment, initialTab]);

  if (!isOpen || !appointment) return null;

  const isDoctor = user.role === "doctor";
  const isPending = appointment.status === "PENDING";
  const isConfirmed = appointment.status === "CONFIRMED";
  const isMeetingEnabled = !!appointment.isMeetingEnabled;

  const fetchMessages = async () => {
    setFetchingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/${appointment._id}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setFetchingMessages(false);
    }
  };

  const handleToggleChat = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/${appointment._id}/toggle-chat`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsChatEnabled(data.isChatEnabled);
        toast.success(data.isChatEnabled ? "Chat enabled for patient" : "Chat disabled");
      }
    } catch (err) {
      toast.error("Failed to toggle chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE}/appointments/${appointment._id}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });

      if (res.ok) {
        setNewMessage("");
        setSelectedFile(null);
        fetchMessages();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    setSendingEmail(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/${appointment._id}/send-email`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({ subject: emailSubject, body: emailBody })
      });

      if (res.ok) {
        toast.success("Email sent to patient");
        setEmailSubject("");
        setEmailBody("");
        setActiveTab("info");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send email");
      }
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleToggleMeeting = async () => {
    setLoading(true);
    try {
      await onToggleMeeting(appointment._id);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    AWAITING_PAYMENT: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock3 },
    PENDING: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock3 },
    CONFIRMED: { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
    CANCELLED: { color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle },
    REJECTED: { color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle },
    COMPLETED: { color: "text-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: CheckCircle },
  };

  const config = statusConfig[appointment.status] || { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: FileText };
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="glass-panel w-full max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className={`h-1.5 w-full shrink-0 ${config.color.replace('text', 'bg')}`} />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} border ${config.border}`}>
                <StatusIcon size={30} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Appointment Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
                    {appointment.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {appointment.appointmentId || appointment._id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-slate-50 dark:bg-white/5 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'info' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <FileText size={14} /> Information
            </button>
            {(isChatEnabled || isDoctor) && (
              <button 
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <MessageSquare size={14} /> Chat
              </button>
            )}
            {isDoctor && (
              <button 
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'email' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Mail size={14} /> Email Patient
              </button>
            )}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fadeIn_0.2s_ease-out]">
                {/* Left Column: Info */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-500" /> Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Time & Date</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{appointment.date} at {appointment.timeSlot.startTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Location</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{appointment.location.hospitalName}</p>
                          <p className="text-[11px] text-slate-500">{appointment.location.address}, {appointment.location.city}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {appointment.notes && (
                    <section>
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={14} className="text-indigo-500" /> Patient Notes
                      </h3>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                          "{appointment.notes}"
                        </p>
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Actions & Meeting */}
                <div className="space-y-6">
                  {/* Meeting Section */}
                  <section className={`p-5 rounded-2xl border transition-all ${
                    isMeetingEnabled 
                      ? "bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                      : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Video size={18} className={isMeetingEnabled ? "text-indigo-500" : "text-slate-400"} /> Video Consultation
                      </h3>
                      {isDoctor && isConfirmed && (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isMeetingEnabled}
                            onChange={handleToggleMeeting}
                            disabled={loading}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      )}
                    </div>
                    {/* ... rest of meeting UI ... */}
                    <div className="space-y-4">
                      {isMeetingEnabled ? (
                        <>
                          <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                            <ShieldCheck size={14} /> HIPAA Secure Link Ready
                          </div>
                          <a 
                            href={`/dashboard/${isDoctor ? 'doctor' : 'user'}/meetings?callId=${appointment._id}`}
                            target="_blank"
                            className="btn btn-primary w-full justify-center gap-2 group"
                          >
                            <Zap size={16} className="fill-white group-hover:animate-pulse" /> Join Secure Meeting <ExternalLink size={14} />
                          </a>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-xs text-slate-400">
                            {isDoctor ? "Toggle the switch to enable video consultation." : "Video consultation has not been enabled yet."}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Chat Toggle (Doctor Only) */}
                  {isDoctor && isConfirmed && (
                    <section className="p-5 rounded-2xl border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <MessageSquare size={18} className={isChatEnabled ? "text-indigo-500" : "text-slate-400"} /> Patient Chat
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-1">Enable messaging for this appointment</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isChatEnabled}
                            onChange={handleToggleChat}
                            disabled={loading}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </section>
                  )}

                  {/* Status Actions */}
                  {isDoctor && (isPending || isConfirmed) && (
                    <section className="space-y-3">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">Quick Actions</h3>
                      <div className="flex gap-2">
                        {isPending && (
                          <>
                            <button className="flex-1 btn bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 justify-center text-xs" onClick={() => onStatusUpdate(appointment._id, 'accept')}>Confirm</button>
                            <button className="flex-1 btn bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 justify-center text-xs" onClick={() => onStatusUpdate(appointment._id, 'reject')}>Reject</button>
                          </>
                        )}
                        {isConfirmed && (
                          <button className="flex-1 btn bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20 justify-center text-xs" onClick={() => onStatusUpdate(appointment._id, 'complete')}>Complete Session</button>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-[500px] animate-[fadeIn_0.2s_ease-out]">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Direct Messaging {isDoctor ? `with ${appointment.patientName || 'Patient'}` : `with Dr. ${appointment.doctorName || 'Doctor'}`}
                  </h3>
                  <button 
                    onClick={fetchMessages}
                    disabled={fetchingMessages}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all active:rotate-180"
                    title="Refresh messages"
                  >
                    <RotateCw size={16} className={fetchingMessages ? "animate-spin text-indigo-500" : ""} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 overflow-y-auto p-4 space-y-4 mb-4">
                  {fetchingMessages && messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">Loading history...</div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                      <MessageSquare size={32} className="mb-3 opacity-20" />
                      <p className="text-xs">No messages yet. Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const userId = user.id || user._id;
                      const isMe = msg.senderId === userId;
                      const senderLabel = msg.senderRole === 'doctor' ? 'Doctor' : 'Patient';
                      
                      return (
                        <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[10px] font-bold text-slate-400 ml-2 mb-1 uppercase tracking-wider">
                              {senderLabel}
                            </span>
                          )}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-none'
                          }`}>
                            {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                            {msg.fileUrl && (
                              <div className={`mt-2 p-2 rounded-xl flex items-center gap-3 ${isMe ? 'bg-white/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                  <FileIcon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[10px] font-bold truncate ${isMe ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{msg.fileName}</p>
                                  <a 
                                    href={`${API_BASE}/appointments/${msg.fileUrl}`} 
                                    target="_blank" 
                                    className={`text-[9px] hover:underline flex items-center gap-1 mt-0.5 ${isMe ? 'text-white/70' : 'text-indigo-500'}`}
                                  >
                                    View File <ExternalLink size={8} />
                                  </a>
                                </div>
                              </div>
                            )}
                            <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <p className={`text-[9px] opacity-60 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {isMe && <Check size={10} className="text-white/60" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="relative group">
                  {selectedFile && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg flex items-center justify-between animate-slideUp">
                      <div className="flex items-center gap-3">
                        <FileIcon size={18} className="text-indigo-500" />
                        <div className="text-xs">
                          <p className="font-bold text-slate-700 dark:text-slate-200">{selectedFile.name}</p>
                          <p className="text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-indigo-500/50 transition-all shadow-sm">
                    <label className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 cursor-pointer transition-colors shrink-0">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 5 * 1024 * 1024) {
                            toast.error("File size exceeds 5MB limit");
                            return;
                          }
                          setSelectedFile(file);
                        }}
                      />
                      <Paperclip size={20} />
                    </label>
                    <textarea 
                      rows="1"
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-1 dark:text-white placeholder:text-slate-400 resize-none max-h-32"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                      className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all shrink-0"
                    >
                      {sendingMessage ? <RotateCw size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "email" && (
              <form onSubmit={handleSendEmail} className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Mail size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    This will send a professional direct email to the patient's registered address (<strong>{appointment.patientEmail || 'Patient Email'}</strong>). Use this for formal updates or documentation requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Subject</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Appointment Update - Dr. Smith"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all dark:text-white"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Message Content</label>
                    <textarea 
                      required
                      rows="8"
                      placeholder="Type your formal message to the patient here..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all dark:text-white resize-none"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={sendingEmail}
                    className="btn btn-primary min-w-[150px] justify-center gap-2"
                  >
                    {sendingEmail ? <RotateCw size={18} className="animate-spin" /> : <Send size={18} />}
                    Send Formal Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
