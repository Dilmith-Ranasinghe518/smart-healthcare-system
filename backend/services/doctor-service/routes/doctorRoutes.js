const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, restrictTo } = require('../user-service/middleware/authMiddleware');

const router = express.Router();

router.route('/admin/all')
  .get(
    protect,
    restrictTo('admin'),
    doctorController.getAllDoctorsAdmin
  );

router.route('/')
  .get(doctorController.getDoctors)
  .post(
    protect,
    restrictTo('doctor', 'admin'),
    doctorController.createProfile
  );

router.route('/:id')
  .get(doctorController.getDoctorById)
  .put(
    protect,
    restrictTo('doctor', 'admin'),
    doctorController.updateProfile
  )
  .delete(
    protect,
    restrictTo('admin'),
    doctorController.deleteProfile
  );

router.route('/:id/verify')
  .patch(
    protect,
    restrictTo('admin'),
    doctorController.verifyDoctor
  );

router.route('/:id/locations')
  .patch(
    protect,
    restrictTo('doctor', 'admin'),
    doctorController.manageLocations
  );

module.exports = router;
