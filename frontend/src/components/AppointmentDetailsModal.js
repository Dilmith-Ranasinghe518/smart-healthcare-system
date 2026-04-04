"use client";
import { useState } from "react";
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
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function AppointmentDetailsModal({ 
  isOpen, 
  onClose, 
  appointment, 
  user,
  onStatusUpdate,
  onToggleMeeting
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const isDoctor = user.role === "doctor";
  const isPending = appointment.status === "PENDING";
  const isConfirmed = appointment.status === "CONFIRMED";
  const isMeetingEnabled = !!appointment.isMeetingEnabled;

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
        className="glass-panel w-full max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className={`h-1.5 w-full ${config.color.replace('text', 'bg')}`} />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} border ${config.border}`}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <div className="space-y-4">
                  {isMeetingEnabled ? (
                    <>
                      <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                        <ShieldCheck size={14} /> HIPAA Secure Link Ready
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        The video consultation room is active for this appointment. You can join the secure stream below.
                      </p>
                      <a 
                        href={`/dashboard/${isDoctor ? 'doctor' : 'user'}/meetings?callId=${appointment._id}`}
                        target="_blank"
                        className="btn btn-primary w-full justify-center gap-2 group"
                      >
                        <Zap size={16} className="fill-white group-hover:animate-pulse" />
                        Join Secure Meeting
                        <ExternalLink size={14} />
                      </a>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <Video size={20} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {isDoctor 
                          ? "Toggle the switch to enable video consultation for this patient." 
                          : "Video consultation has not been enabled by the doctor yet."}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Status Actions (Doctor) */}
              {isDoctor && (isPending || isConfirmed) && (
                <section className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Quick Actions
                  </h3>
                  <div className="flex gap-2">
                    {isPending && (
                      <>
                        <button 
                          className="flex-1 btn bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 justify-center text-xs"
                          onClick={() => onStatusUpdate(appointment._id, 'accept')}
                        >
                          Confirm
                        </button>
                        <button 
                          className="flex-1 btn bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 justify-center text-xs"
                          onClick={() => onStatusUpdate(appointment._id, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {isConfirmed && (
                      <button 
                        className="flex-1 btn bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 justify-center text-xs"
                        onClick={() => onStatusUpdate(appointment._id, 'complete')}
                      >
                        Complete Session
                      </button>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
