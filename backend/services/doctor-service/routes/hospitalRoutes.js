const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(hospitalController.getAllHospitals)
  .post(protect, restrictTo('admin'), hospitalController.createHospital);

router.route('/:id')
  .put(protect, restrictTo('admin'), hospitalController.updateHospital);

// Toggle hospital active/inactive
router.route('/:id/toggle-status')
  .patch(protect, restrictTo('admin'), hospitalController.toggleHospitalStatus);

module.exports = router;
