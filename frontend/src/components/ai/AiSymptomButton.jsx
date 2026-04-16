"use client";
import { Activity } from "lucide-react";

export default function AiSymptomButton({ onClick, role }) {
  const label = role === "doctor" ? "Doctor AI" : "Health AI";

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 md:bottom-6 md:right-10 z-[105] rounded-full bg-blue-600 px-6 py-3.5 text-white shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm md:text-base border border-white/10"
    >
      <Activity size={18} />
      {label}
    </button>
  );
}