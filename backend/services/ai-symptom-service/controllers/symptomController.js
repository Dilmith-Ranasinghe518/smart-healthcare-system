const { buildPromptByRole } = require("../utils/promptBuilder");
const { generateSymptomAdvice } = require("../utils/geminiClient");
const { normalizeSpecialty } = require("../utils/specialtyMapper");
const { getRecommendedDoctorsBySpecialty } = require("../services/doctorRecommendationService");

function tryParseJson(text) {
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

const buildPatientFallback = (rawText) => ({
  summary: rawText,
  possibleCauses: [],
  recommendedSpecialty: "General Practitioner",
  urgency: "doctor soon",
  selfCare: [],
  disclaimer:
    "This AI response is for preliminary guidance only and is not a medical diagnosis.",
  recommendedDoctors: []
});

const buildDoctorFallback = (rawText) => ({
  summary: rawText,
  likelyConsiderations: [],
  triageLevel: "prompt review",
  recommendedDepartment: "General Practitioner",
  followUpQuestions: [],
  nextSteps: [],
  disclaimer:
    "This AI response is for clinical support only and does not replace professional judgment."
});

function buildReadableAiError(error) {
  const rawMessage = error?.message || "Unknown AI service error";
  const msg = rawMessage.toLowerCase();

  if (
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("model is overloaded") ||
    msg.includes("service unavailable") ||
    msg.includes("busy")
  ) {
    return "The AI service is busy right now. Please wait a few seconds and try again.";
  }

  if (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted")
  ) {
    return "The AI request limit has been reached for now. Please try again shortly.";
  }

  if (
    msg.includes("api key") ||
    msg.includes("permission denied") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden")
  ) {
    return "The AI service configuration is invalid. Please contact the system administrator.";
  }

  if (
    msg.includes("model not found") ||
    msg.includes("404")
  ) {
    return "The configured AI model is unavailable right now. Please contact the system administrator.";
  }

  return "Failed to generate symptom suggestions. Please try again.";
}

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms, role = "user" } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required"
      });
    }

    const normalizedRole = role === "doctor" ? "doctor" : "user";

    const prompt = buildPromptByRole(normalizedRole, symptoms);
    const rawText = await generateSymptomAdvice(prompt);
    const parsed = tryParseJson(rawText);

    if (normalizedRole === "doctor") {
      const doctorData = parsed || buildDoctorFallback(rawText);

      doctorData.recommendedDepartment = normalizeSpecialty(
        doctorData.recommendedDepartment
      );

      return res.status(200).json({
        success: true,
        data: doctorData
      });
    }

    const patientData = parsed || buildPatientFallback(rawText);

    patientData.recommendedSpecialty = normalizeSpecialty(
      patientData.recommendedSpecialty
    );

    const recommendedDoctors = await getRecommendedDoctorsBySpecialty(
      patientData.recommendedSpecialty
    );

    patientData.recommendedDoctors = recommendedDoctors;

    return res.status(200).json({
      success: true,
      data: patientData
    });
  } catch (error) {
    console.error("AI symptom check error full:", error);

    const readableMessage = buildReadableAiError(error);

    return res.status(500).json({
      success: false,
      message: readableMessage,
      error: error.message
    });
  }
};

module.exports = { checkSymptoms };