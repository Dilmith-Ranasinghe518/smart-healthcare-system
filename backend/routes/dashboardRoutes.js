const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/user', protect, restrictTo('user', 'admin', 'doctor'), (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, this is the user dashboard.` });
});

router.get('/admin', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}, this is the admin dashboard.` });
});

router.get('/doctor', protect, restrictTo('doctor', 'admin'), (req, res) => {
  res.json({ message: `Welcome Dr. ${req.user.name}, this is the doctor dashboard.` });
});

module.exports = router;
