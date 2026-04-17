const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Get configured Gemini instance
 */
function getGenAI() {
  const apiKey = process.env.PRESCRIPTION_OCR_API_KEY;

  if (!apiKey) {
    throw new Error("PRESCRIPTION_OCR_API_KEY is missing in environment variables");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Refine raw OCR text into styled Markdown using Gemini
 * @param {string} rawText - The noisy raw text from Tesseract
 * @returns {Promise<string>} - The professionally styled Markdown
 */
async function refinePrescriptionText(rawText) {
  const genAI = getGenAI();
  const modelName = process.env.PRESCRIPTION_OCR_MODEL;

  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = `
    You are a professional medical assistant. Analyze the following raw OCR text extracted from a medical prescription.
    
    The raw text is noisy and contains errors from handwriting recognition. Please:
    1. Fix all typos and remove random characters/noise.
    2. Correct medication names and dosages based on medical knowledge.
    3. Extract the Hospital Name, Patient Name, Patient Age, Date, and detailed Medication lists.
    
    Format the output as HIGHLY STYLED MARKDOWN as follows:
    
    # 🏥 Prescription Analysis (AI Refined)
    
    ## 🏥 Hospital Information
    - **Hospital Name:** [Corrected hospital name]
    - **Contact:** [Address/Phone/Email if available]
    
    ## 👤 Patient Details
    - **Name:** [Patient Name]
    - **Age/Gender:** [Age/Gender]
    - **Date:** [Prescription Date]
    
    ---
    
    ## 💊 Medications
    [List each medication clearly]
    - **[Medication Name]**: [Dosage/Frequency/Duration]
    
    ---
    
    ## 📝 Additional Notes / Instructions
    - [Any other handwritten notes or symptoms identified]
    
    ---
    *Disclaimer: This is an AI-assisted analysis of a handwritten document. Please verify with a pharmacist or doctor.*
    
    RAW TEXT TO ANALYZE:
    "${rawText}"
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}

module.exports = { refinePrescriptionText };
