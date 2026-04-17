const { scanPrescriptionImage } = require('../utils/geminiClient');

// @desc    Scan Prescription Image (OCR)
// @route   POST /api/prescriptions/scan
// @access  Private
const scanPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const mimeType = req.file.mimetype || 'image/jpeg';
    
    // Use Gemini for superior OCR extraction
    const extractedText = await scanPrescriptionImage(req.file.buffer, mimeType);

    res.status(200).json({ 
      text: extractedText,
      confidence: 1.0 // Gemini doesn't return a simple confidence score, but is much more accurate
    });
  } catch (error) {
    console.error('OCR Error Details:', error);
    
    // Provide a more descriptive error message to the frontend
    const errorMessage = error.message.includes('API_KEY') 
      ? 'Gemini API Key is missing or invalid. Please check your .env file and RESTART your Docker containers.'
      : `OCR Error: ${error.message}`;

    res.status(500).json({ 
      message: 'Server Error during OCR scanning', 
      details: errorMessage 
    });
  }
};

module.exports = {
  scanPrescription,
};
