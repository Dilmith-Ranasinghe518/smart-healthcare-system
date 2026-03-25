const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const { protect, restrictTo } = require('../user-service/middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(hospitalController.getAllHospitals)
  .post(
    protect,
    restrictTo('admin'),
    hospitalController.createHospital
  );

router.route('/:id')
  .get(hospitalController.getHospital)
  .put(
    protect,
    restrictTo('admin'),
    hospitalController.updateHospital
  );

module.exports = router;
