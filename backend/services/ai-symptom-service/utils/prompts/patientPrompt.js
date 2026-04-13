const { VALID_SPECIALTIES } = require("../specialtyMapper");

function buildPatientPrompt(symptoms) {
  return `
You are an AI symptom checker for a smart healthcare platform.

A patient has entered these symptoms:
"${symptoms}"

Your task:
1. Give a short preliminary health suggestion in simple patient-friendly language.
2. Mention 2 to 4 possible common causes only.
3. Recommend the most suitable doctor specialty.
4. Mention whether the patient should seek:
   - home care / monitor
   - doctor soon
   - urgent medical attention
5. Include 2 to 4 basic self-care tips if appropriate.
6. Include a safety disclaimer that this is not a final medical diagnosis.
7. Do not be overly alarming.
8. Do not claim certainty.
9. The recommendedSpecialty MUST be exactly one of these values:
   ${VALID_SPECIALTIES.join(", ")}

Return JSON only in this exact format:

{
  "summary": "short paragraph",
  "possibleCauses": ["cause1", "cause2"],
  "recommendedSpecialty": "one exact value from the allowed list",
  "urgency": "home care / monitor or doctor soon or urgent medical attention",
  "selfCare": ["tip1", "tip2"],
  "disclaimer": "text"
}
`;
}

module.exports = { buildPatientPrompt };