const Tesseract = require('tesseract.js');
const { refinePrescriptionText } = require('../utils/deepseekClient');

// @desc    Scan Prescription Image (Hybrid OCR: Tesseract + DeepSeek)
// @route   POST /api/prescriptions/scan
// @access  Private
const scanPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // 1. Perform raw OCR with Tesseract
    const ocrResult = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      { logger: m => console.log(m) }
    );

    const rawText = ocrResult.data.text;

    // 2. Refine results using DeepSeek
    const refinedText = await refinePrescriptionText(rawText);

    res.status(200).json({ 
      text: refinedText,
      confidence: ocrResult.data.confidence 
    });
  } catch (error) {
    console.error('Hybrid OCR Error:', error);
    res.status(500).json({ 
      message: 'Server Error during OCR scanning', 
      details: error.message 
    });
  }
};

module.exports = {
  scanPrescription,
};
