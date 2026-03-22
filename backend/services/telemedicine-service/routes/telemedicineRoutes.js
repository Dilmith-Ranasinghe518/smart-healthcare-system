const express = require('express');
const router = express.Router();
const { getStreamToken } = require('../controllers/telemedicineController');
const { protect } = require('../middleware/authMiddleware');

// Get Stream Meet Token
router.get('/stream-token', protect, getStreamToken);

module.exports = router;
