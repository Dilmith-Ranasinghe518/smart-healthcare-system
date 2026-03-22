const Tesseract = require('tesseract.js');

// @desc    Scan Prescription Image (OCR)
// @route   POST /api/prescriptions/scan
// @access  Private
const scanPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Tesseract.recognize supports Buffer directly
    const result = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      { logger: m => console.log(m) }
    );

    res.status(200).json({ 
      text: result.data.text,
      confidence: result.data.confidence 
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ message: 'Server Error during OCR scanning' });
  }
};

module.exports = {
  scanPrescription,
};
