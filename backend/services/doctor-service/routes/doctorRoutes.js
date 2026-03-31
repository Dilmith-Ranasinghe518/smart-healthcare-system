const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin
router.route('/admin/all')
  .get(protect, restrictTo('admin'), doctorController.getAllDoctorsAdmin);

// Public search endpoints 
router.route('/')
  .get(doctorController.getDoctors)
  .post(protect, restrictTo('doctor', 'admin'), doctorController.createProfile);

router.route('/near')
  .get(doctorController.getDoctorsNear);

router.route('/options/availability')
  .get(doctorController.getAvailabilityOptions);

// Doctor profile 
router.route('/me')
  .get(protect, restrictTo('doctor'), doctorController.getMyProfile);

router.route('/:id')
  .get(doctorController.getDoctorById)
  .put(protect, restrictTo('doctor', 'admin'), doctorController.updateProfile)
  .delete(protect, restrictTo('admin'), doctorController.deleteProfile);

router.route('/:id/verify')
  .patch(protect, restrictTo('admin'), doctorController.verifyDoctor);

// Location management 
router.route('/:id/locations')
  .patch(protect, restrictTo('doctor', 'admin'), doctorController.manageLocations)
  .delete(protect, restrictTo('doctor', 'admin'), doctorController.removeLocation);

// Availability management 
router.route('/:id/locations/:locationId/availability')
  .put(protect, restrictTo('doctor', 'admin'), doctorController.setAvailability)
  .post(protect, restrictTo('doctor', 'admin'), doctorController.addAvailabilitySlot);

router.route('/:id/locations/:locationId/availability/:slotId')
  .delete(protect, restrictTo('doctor', 'admin'), doctorController.removeAvailabilitySlot);

module.exports = router;
