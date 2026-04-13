"use client";

export default function AiSymptomButton({ onClick, role }) {
  const label = role === "doctor" ? "Doctor AI" : "Health AI";

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
}