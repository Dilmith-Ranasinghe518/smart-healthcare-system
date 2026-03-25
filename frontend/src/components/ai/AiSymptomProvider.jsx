"use client";

import { useState } from "react";
import AiSymptomButton from "@/components/ai/AiSymptomButton";
import AiSymptomModal from "@/components/ai/AiSymptomModal";

export default function AiSymptomProvider() {
  const [openAiModal, setOpenAiModal] = useState(false);

  return (
    <>
      <AiSymptomButton onClick={() => setOpenAiModal(true)} />
      <AiSymptomModal
        open={openAiModal}
        onClose={() => setOpenAiModal(false)}
      />
    </>
  );
}