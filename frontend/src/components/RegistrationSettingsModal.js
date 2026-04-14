import { useState, useEffect } from "react";
import { X, ShieldCheck, Save, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/utils/api";

export default function RegistrationSettingsModal({ isOpen, onClose, user }) {
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchRegistrationConfig();
    }
  }, [isOpen]);

  const fetchRegistrationConfig = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/otp/config`);
      const data = await res.json();
      if (res.ok) {
        setIsOtpEnabled(data.isOtpEnabled);
      }
    } catch (err) {
      setError("Failed to fetch registration configuration.");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/settings/otp`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOtpEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update registration settings");
      
      toast.success("Registration security settings updated!");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-500" />
            Registration Security
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Configure whether new users must verify their email address via a 6-digit OTP before creating an account.
          </p>

          {error && (
            <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {fetching ? (
             <div className="py-8 text-center text-slate-400">Loading security protocols...</div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Email OTP Verification</span>
                <span className="text-xs text-slate-500">Enable multi-step registration</span>
              </div>
              <button 
                onClick={() => setIsOtpEnabled(!isOtpEnabled)}
                className={`transition-all duration-300 ${isOtpEnabled ? 'text-emerald-500' : 'text-slate-500'}`}
              >
                {isOtpEnabled ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={loading || fetching}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : <><Save size={16} /> Update Security</>}
          </button>
        </div>
      </div>
    </div>
  );
}
