const { buildSymptomPrompt } = require("../utils/promptBuilder");
const { generateSymptomAdvice } = require("../utils/geminiClient");

function tryParseJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required"
      });
    }

    const prompt = buildSymptomPrompt(symptoms);
    const rawText = await generateSymptomAdvice(prompt);

    const parsed = tryParseJson(rawText);

    if (!parsed) {
      return res.status(200).json({
        success: true,
        data: {
          summary: rawText,
          possibleCauses: [],
          recommendedSpecialty: "General Physician",
          urgency: "doctor soon",
          selfCare: [],
          disclaimer:
            "This AI response is for preliminary guidance only and is not a medical diagnosis."
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error("AI symptom check error full:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate symptom suggestions"
    });
  }
};

module.exports = { checkSymptoms };