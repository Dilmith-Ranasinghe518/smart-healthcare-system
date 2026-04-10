import { useState, useEffect } from "react";
import { X, Percent, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TaxSettingModal({ isOpen, onClose, user }) {
  const [percentage, setPercentage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTaxSetting();
    }
  }, [isOpen]);

  const fetchTaxSetting = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/tax-setting`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPercentage(data.percentage);
      }
    } catch (err) {
      setError("Failed to fetch tax setting.");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/tax-setting`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percentage: Number(percentage) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update tax setting");
      
      toast.success("Global tax setting updated!");
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
            <Percent size={20} className="text-indigo-500" />
            Global Tax Setting
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
            Configure the default tax percentage applied to patient appointment transactions checkout.
          </p>

          {error && (
            <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {fetching ? (
             <div className="py-8 text-center text-slate-400">Loading current setting...</div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-lg"
              />
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
            {loading ? "Saving..." : <><Save size={16} /> Save Setting</>}
          </button>
        </div>
      </div>
    </div>
  );
}
