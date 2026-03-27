"use client";
import { AlertCircle, X } from "lucide-react";
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out] p-4">
      <div 
        className="glass-panel w-full max-w-lg p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl relative flex flex-col items-center text-center animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          isDestructive ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"
        }`}>
          <AlertCircle size={24} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-2">{message}</p>
        
        <div className="flex gap-4 w-full">
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button 
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-3 px-6 rounded-xl text-white text-sm font-semibold transition-all flex justify-center items-center gap-2 ${
              isDestructive 
                ? "bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                : "bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isDestructive && <X size={16} />}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}