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
 * Scan an image buffer and extract structured medical information
 * @param {Buffer} imageBuffer - The image buffer to scan
 * @param {string} mimeType - The mime type of the image (e.g. 'image/jpeg')
 * @returns {Promise<string>} - The extracted styled text
 */
async function scanPrescriptionImage(imageBuffer, mimeType = "image/jpeg") {
  const genAI = getGenAI();
  const modelName = process.env.PRESCRIPTION_OCR_MODEL || "models/gemini-1.5-flash";

  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = `
    You are a professional medical assistant. Analyze the provided image of a medical prescription and extract the information accurately.
    
    The handwriting may be difficult to read; please use your medical knowledge to disambiguate medication names and dosages.
    
    Format the output as HIGHLY STYLED MARKDOWN as follows:
    
    # 🏥 Prescription Analysis
    
    ## 🏥 Hospital Information
    - **Hospital Name:** [Extract hospital name]
    - **Contact:** [Extract address/phone/email if available]
    
    ## 👤 Patient Details
    - **Name:** [Patient Name]
    - **Age/Gender:** [Age/Gender if available]
    - **Date:** [Prescription Date]
    
    ---
    
    ## 💊 Medications
    [List each medication in the following format]
    - **[Medication Name]**: [Dosage/Frequency/Duration]
    
    ---
    
    ## 📝 Additional Notes / Instructions
    - [Any other handwritten notes, symptoms, or instructions]
    
    ---
    *Disclaimer: This is an AI-assisted extraction. Please verify with a qualified pharmacist or doctor.*
  `;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;

  return response.text();
}

module.exports = { scanPrescriptionImage };
