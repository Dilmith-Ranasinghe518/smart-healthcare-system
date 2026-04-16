import { API_URL } from "@/utils/api";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBusyMessage(message = "") {
  const msg = message.toLowerCase();

  return (
    msg.includes("busy") ||
    msg.includes("overloaded") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("service unavailable") ||
    msg.includes("503") ||
    msg.includes("model is overloaded") ||
    msg.includes("try again")
  );
}

export async function checkSymptoms(symptoms, role = "user") {
  const maxAttempts = 5;
  const retryDelay = 2500;

  let lastError = "Failed to generate symptom suggestions";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}/ai-symptoms/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendMessage =
          data?.message || "Failed to generate symptom suggestions";

        lastError = backendMessage;

        if (isBusyMessage(backendMessage) && attempt < maxAttempts) {
          await sleep(retryDelay);
          continue;
        }

        throw new Error(backendMessage);
      }

      return data;
    } catch (error) {
      lastError = error.message || "Failed to generate symptom suggestions";

      if (isBusyMessage(lastError) && attempt < maxAttempts) {
        await sleep(retryDelay);
        continue;
      }

      throw new Error(lastError);
    }
  }

  throw new Error(lastError);
}