const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanPrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Scan Prescription (OCR)
router.post('/scan', protect, upload.single('image'), scanPrescription);

module.exports = router;
