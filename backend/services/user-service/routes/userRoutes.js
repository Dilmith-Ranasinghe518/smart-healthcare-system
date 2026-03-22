const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, updateProfile, getStreamToken } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// Allow any logged-in user to update their own profile
router.put('/profile', updateProfile);

// Get Stream Meet Token
router.get('/stream-token', getStreamToken);

// Restrict following routes to Admin execution
router.use(restrictTo('admin'));

router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
