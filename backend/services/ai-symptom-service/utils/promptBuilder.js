const { buildPatientPrompt } = require("./prompts/patientPrompt");
const { buildDoctorPrompt } = require("./prompts/doctorPrompt");

function buildPromptByRole(role, symptoms) {
  if (role === "doctor") {
    return buildDoctorPrompt(symptoms);
  }

  return buildPatientPrompt(symptoms);
}

module.exports = { buildPromptByRole };