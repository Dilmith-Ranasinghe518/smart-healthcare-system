"use client";

import { useState } from "react";
import { checkSymptoms } from "@/utils/aiSymptomService";

export default function DoctorAiModal({ open, onClose, role }) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await checkSymptoms({
        symptoms,
        role
      });

      setResult(response.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl text-black max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Doctor AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-lg font-semibold text-black"
          >
            ×
          </button>
        </div>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter patient symptoms, clinical notes, or short case summary..."
          className="min-h-[140px] w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Case"}
          </button>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-black"
          >
            Close
          </button>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {result && (
          <div className="mt-6 space-y-4 rounded-lg border border-gray-300 p-4 text-black">
            <div>
              <h3 className="font-semibold text-black">Clinical Summary</h3>
              <p className="text-black">{result.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Likely Considerations</h3>
              <ul className="list-disc pl-5 text-black">
                {result.likelyConsiderations?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-black">Triage Level</h3>
              <p className="text-black">{result.triageLevel}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Recommended Department</h3>
              <p className="text-black">{result.recommendedDepartment}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Suggested Follow-up Questions</h3>
              <ul className="list-disc pl-5 text-black">
                {result.followUpQuestions?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-black">Suggested Next Steps</h3>
              <ul className="list-disc pl-5 text-black">
                {result.nextSteps?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              {result.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}