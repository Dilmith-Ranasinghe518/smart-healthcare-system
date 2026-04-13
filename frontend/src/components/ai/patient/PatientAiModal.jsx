"use client";

import { useState } from "react";
import { checkSymptoms } from "@/utils/aiSymptomService";

export default function PatientAiModal({ open, onClose, role }) {
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

  const recommendedDoctors = result?.recommendedDoctors || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl text-black max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Patient AI Symptom Checker</h2>
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
          placeholder="Describe your symptoms here... Example: fever, sore throat, headache for 2 days"
          className="min-h-[140px] w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Get Suggestion"}
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
              <h3 className="font-semibold text-black">Summary</h3>
              <p className="text-black">{result.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Recommended Specialty</h3>
              <p className="text-black">{result.recommendedSpecialty}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Urgency</h3>
              <p className="text-black">{result.urgency}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black">Possible Causes</h3>
              <ul className="list-disc pl-5 text-black">
                {result.possibleCauses?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-black">Self Care</h3>
              <ul className="list-disc pl-5 text-black">
                {result.selfCare?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              {result.disclaimer}
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-semibold text-black mb-3">
                Recommended Doctors from Our System
              </h3>

              {recommendedDoctors.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No matching doctors found in the system for this specialty right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {recommendedDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <h4 className="font-semibold text-black">{doctor.name}</h4>
                      <p className="text-sm text-gray-700">
                        Specialization: {doctor.specialization}
                      </p>
                      <p className="text-sm text-gray-700">
                        Experience: {doctor.experience} years
                      </p>

                      {doctor.qualifications?.length > 0 && (
                        <p className="text-sm text-gray-700">
                          Qualifications: {doctor.qualifications.join(", ")}
                        </p>
                      )}

                      {doctor.locations?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-black">Available Locations</p>
                          <div className="mt-1 space-y-1">
                            {doctor.locations.map((location, index) => (
                              <div
                                key={`${doctor._id}-${index}`}
                                className="rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                              >
                                <p>{location.hospitalName}</p>
                                <p>{location.city}</p>
                                <p>{location.address}</p>
                                <p>Consultation Fee: Rs. {location.consultationFee}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}