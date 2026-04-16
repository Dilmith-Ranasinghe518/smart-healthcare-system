"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  RefreshCw,
} from "lucide-react";
import { checkSymptoms } from "@/utils/aiSymptomService";

export default function AiSymptomModal({ open, onClose, role = "user" }) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingText, setLoadingText] = useState("Analyzing your symptoms...");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      setError("Please enter your symptoms first.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      let step = 0;
      const loadingMessages = [
        "Analyzing your symptoms...",
        "Checking possible causes...",
        "Preparing medical guidance...",
        "AI is busy, retrying automatically...",
        "Still working, please wait...",
      ];

      setLoadingText(loadingMessages[0]);

      const interval = setInterval(() => {
        step = (step + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[step]);
      }, 2200);

      const response = await checkSymptoms(symptoms, role);

      clearInterval(interval);
      setResult(response.data);
    } catch (err) {
      setError(err.message || "Failed to generate symptom suggestions");
    } finally {
      setLoading(false);
      setLoadingText("Analyzing your symptoms...");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSymptoms("");
    setResult(null);
    setError("");
    setLoadingText("Analyzing your symptoms...");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                AI Symptom Checker
              </h2>
              <p className="text-sm text-slate-500">
                Enter symptoms and get preliminary guidance
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl px-3 py-1 text-lg font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-[#F8FBF9] p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Describe your symptoms
          </label>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Example: fever, sore throat, headache for 2 days"
            className="min-h-[160px] w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                <Stethoscope size={18} />
                Get Suggestion
              </>
            )}
          </button>

          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {loading && (
          <div className="mt-5 rounded-2xl border border-[#D7EBDD] bg-[#F4FBF7] p-4">
            <div className="flex items-start gap-3">
              <RefreshCw size={18} className="mt-0.5 animate-spin text-[#2F8F68]" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {loadingText}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Please stay on this window while the AI finishes processing.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 text-rose-600" />
              <div>
                <p className="text-sm font-bold text-rose-700">
                  Request failed
                </p>
                <p className="mt-1 text-sm text-rose-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#2F8F68]" />
              <h3 className="text-base font-black text-slate-800">
                Analysis Result
              </h3>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <h4 className="mb-1 text-sm font-bold text-slate-800">Summary</h4>
              <p className="text-sm leading-7 text-slate-700">{result.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F8FBF9] p-4">
                <h4 className="mb-1 text-sm font-bold text-slate-800">
                  Recommended Specialty
                </h4>
                <p className="text-sm text-slate-700">
                  {result.recommendedSpecialty}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FBF9] p-4">
                <h4 className="mb-1 text-sm font-bold text-slate-800">Urgency</h4>
                <p className="text-sm text-slate-700">{result.urgency}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-800">
                Possible Causes
              </h4>
              {result.possibleCauses?.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {result.possibleCauses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No possible causes listed.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Self Care</h4>
              {result.selfCare?.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {result.selfCare.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No self-care advice listed.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              {result.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}