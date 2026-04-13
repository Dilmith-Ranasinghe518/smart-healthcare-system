"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AiSymptomButton from "@/components/ai/AiSymptomButton";
import PatientAiModal from "@/components/ai/patient/PatientAiModal";
import DoctorAiModal from "@/components/ai/doctor/DoctorAiModal";

export default function AiSymptomProvider() {
  const { user, loading } = useAuth();
  const [openAiModal, setOpenAiModal] = useState(false);

  if (loading) return null;
  if (!user) return null;

  const role = user?.role;

  if (role !== "user" && role !== "doctor") {
    return null;
  }

  return (
    <>
      <AiSymptomButton
        role={role}
        onClick={() => setOpenAiModal(true)}
      />

      {role === "user" && (
        <PatientAiModal
          open={openAiModal}
          onClose={() => setOpenAiModal(false)}
          role={role}
        />
      )}

      {role === "doctor" && (
        <DoctorAiModal
          open={openAiModal}
          onClose={() => setOpenAiModal(false)}
          role={role}
        />
      )}
    </>
  );
}