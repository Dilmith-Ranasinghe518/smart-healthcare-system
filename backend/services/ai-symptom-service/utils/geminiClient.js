const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in ai-symptom-service .env");
  }

  return new GoogleGenerativeAI(apiKey);
}

async function generateSymptomAdvice(prompt) {
  const genAI = getGenAI();

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const model = genAI.getGenerativeModel({
    model: modelName
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { generateSymptomAdvice };