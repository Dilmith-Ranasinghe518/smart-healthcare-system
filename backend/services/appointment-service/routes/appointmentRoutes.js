const express = require('express');
const multer = require('multer');
const path = require('path');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { protectInternal } = require('../middleware/internalMiddleware');

const router = express.Router();

// Multer Config for Chat Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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


// Doctor: confirm
router.route('/:id/accept')
  .patch(protect, restrictTo('doctor', 'admin'), appointmentController.acceptAppointment);


// Doctor: mark completed
router.route('/:id/complete')
  .patch(protect, restrictTo('doctor', 'admin'), appointmentController.completeAppointment);

// Confirm payment - INTERNAL ONLY
router.route('/:id/confirm-payment')
  .patch(protectInternal, appointmentController.confirmPayment);

// Toggle meeting
router.patch('/:id/toggle-meeting', protect, restrictTo('doctor', 'admin'), appointmentController.toggleMeeting);

// Toggle chat
router.patch('/:id/toggle-chat', protect, restrictTo('doctor', 'admin'), appointmentController.toggleChat);

// Chat messages
router.route('/:id/messages')
  .get(protect, appointmentController.getMessages)
  .post(protect, upload.single('file'), appointmentController.sendMessage);

// Send direct email (doctor/admin only)
router.post('/:id/send-email', protect, restrictTo('doctor', 'admin'), appointmentController.sendDoctorEmail);

module.exports = router;