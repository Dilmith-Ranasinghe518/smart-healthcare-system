const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

export async function checkSymptoms({ symptoms, role }) {
  const response = await fetch(`${API_BASE_URL}/ai-symptoms/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ symptoms, role })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to check symptoms");
  }

  return data;
}