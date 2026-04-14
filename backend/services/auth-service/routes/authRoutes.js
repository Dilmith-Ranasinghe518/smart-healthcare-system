const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  sendOtp, 
  verifyOtp, 
  getRegistrationConfig, 
  updateRegistrationConfig 
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// OTP Routes
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.get('/otp/config', getRegistrationConfig);

// Admin Settings
router.put('/settings/otp', protect, restrictTo('admin'), updateRegistrationConfig);

module.exports = router;
