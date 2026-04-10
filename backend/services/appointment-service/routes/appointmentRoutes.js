const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { protectInternal } = require('../middleware/internalMiddleware');

const router = express.Router();

// Patient routes 
// Book an appointment
router.route('/')
  .post(protect, restrictTo('user', 'admin'), appointmentController.createAppointment);

// View patient's own appointments — GET /appointments/my?status=PENDING
router.route('/my')
  .get(protect, restrictTo('user', 'admin'), appointmentController.getMyAppointments);

// Admin: view all appointments 
// GET /appointments?status=&doctorId=&patientId=&date=
router.route('/all')
  .get(protect, restrictTo('admin'), appointmentController.getAllAppointments);

// Doctor routes 
// View all appointments for a specific doctor
// GET /appointments/doctor/:doctorId?status=&date=
router.route('/doctor/:doctorId')
  .get(protect, restrictTo('doctor', 'admin'), appointmentController.getDoctorAppointments);

// GET /appointments/doctor/:doctorId/booked-slots?date=YYYY-MM-DD
// Fast endpoint for patients to check availability
router.route('/doctor/:doctorId/booked-slots')
  .get(protect, appointmentController.getBookedSlots);

// Single appointment actions 
router.route('/:id')
  .get(protect, appointmentController.getAppointmentById);

// Patient: cancel
router.route('/:id/cancel')
  .patch(protect, appointmentController.cancelAppointment);

// Patient: reschedule
router.route('/:id/reschedule')
  .patch(protect, restrictTo('user', 'admin'), appointmentController.rescheduleAppointment);

// Doctor: confirm
router.route('/:id/accept')
  .patch(protect, restrictTo('doctor', 'admin'), appointmentController.acceptAppointment);

// Doctor: reject
router.route('/:id/reject')
  .patch(protect, restrictTo('doctor', 'admin'), appointmentController.rejectAppointment);

// Doctor: mark completed
router.route('/:id/complete')
  .patch(protect, restrictTo('doctor', 'admin'), appointmentController.completeAppointment);

// Confirm payment - INTERNAL ONLY
router.route('/:id/confirm-payment')
  .patch(protectInternal, appointmentController.confirmPayment);

// Toggle meeting
router.patch('/:id/toggle-meeting', protect, restrictTo('doctor', 'admin'), appointmentController.toggleMeeting);

module.exports = router;