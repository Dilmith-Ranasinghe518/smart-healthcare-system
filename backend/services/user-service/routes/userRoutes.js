const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfile,
  getUserByIdInternal
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { protectInternal } = require('../middleware/internalMiddleware');

// Internal route for other microservices
router.get('/internal/:id', protectInternal, getUserByIdInternal);

router.use(protect);

// Allow any logged-in user to update their own profile
router.put('/profile', updateProfile);

// Admin & Doctor can view user list (for name resolution)
router.get('/', restrictTo('admin', 'doctor'), getAllUsers);

// Restrict following routes to Admin execution
router.use(restrictTo('admin'));

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;