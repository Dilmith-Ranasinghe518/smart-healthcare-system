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

    return res.status(500).json({
      success: false,
      message: "Failed to generate symptom suggestions",
      error: error.message
    });
  }
};

module.exports = { checkSymptoms };