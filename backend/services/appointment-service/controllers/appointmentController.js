const axios = require('axios');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Internal URL of doctor-service (set in .env)
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const sendNotificationEvent = require("../utils/notificationClient");

// Helper: fetch doctor data from doctor-service
const fetchDoctor = async (doctorId) => {
  console.log(`Appointment Service: Fetching doctor info for ID: ${doctorId} from ${DOCTOR_SERVICE_URL}`);
  const { data } = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
  return data.doctor;
};

const fetchUserById = async (userId) => {
  const { data } = await axios.get(
    `${USER_SERVICE_URL}/api/users/internal/${userId}`,
    {
      headers: {
        "x-internal-service-secret": process.env.INTERNAL_SERVICE_SECRET
      }
    }
  );
  return data;
};

const safeSendNotification = async (eventType, payload) => {
  try {
    await sendNotificationEvent(eventType, payload);
    console.log(`Appointment Service: Notification sent for ${eventType}`);
  } catch (err) {
    console.error(`Appointment Service: Notification failed for ${eventType}`);
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
  }
};

const buildAppointmentNotificationPayload = async (appointment, extra = {}) => {
  console.log("buildAppointmentNotificationPayload: Fetching patient by ID:", appointment.patientId);
  const patient = await fetchUserById(appointment.patientId);

  console.log("buildAppointmentNotificationPayload: Fetching doctor by ID:", appointment.doctorId);
  const doctor = await fetchDoctor(
    appointment.doctorId.toString ? appointment.doctorId.toString() : appointment.doctorId
  );

  let doctorUser = null;
  if (doctor?.userId) {
    try {
      console.log("buildAppointmentNotificationPayload: Fetching doctor user by ID:", doctor.userId);
      doctorUser = await fetchUserById(doctor.userId);
    } catch (err) {
      console.warn("Appointment Service: Failed to fetch doctor user email:", err.message);
    }
  }

  const payload = {
    patientName: patient?.name || "Patient",
    patientEmail: patient?.email || "",
    doctorName: doctor?.name || "Doctor",
    doctorEmail: doctorUser?.email || "",
    hospitalName: appointment.location?.hospitalName || "",
    city: appointment.location?.city || "",
    address: appointment.location?.address || "",
    date: appointment.date || "",
    startTime: appointment.timeSlot?.startTime || "",
    endTime: appointment.timeSlot?.endTime || "",
    appointmentType: appointment.appointmentType || "",
    appointmentId: appointment.appointmentId || appointment._id?.toString() || "",
    statusReason: appointment.statusReason || "",
    ...extra
  };

  console.log("buildAppointmentNotificationPayload: Final payload:", payload);
  return payload;
};

// Helper: validate that the given date string is today or in the future
const isFutureDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date >= today;
};

// Helper: get the day-of-week name from a YYYY-MM-DD date string
const getDayName = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateStr).getDay()];
};

// BOOKING

// POST /appointments
exports.createAppointment = catchAsync(async (req, res, next) => {
  const { doctorId, locationId, slotId, date, notes, appointmentType } = req.body;

  if (!doctorId || !locationId || !slotId || !date || !appointmentType) {
    return next(new AppError('Please provide doctorId, locationId, slotId, date, and appointmentType', 400));
  }

  // 1. Validate future date
  if (!isFutureDate(date)) {
    return next(new AppError('Appointment date must be today or in the future', 400));
  }

  // 2. Fetch doctor from doctor-service
  let doctor;
  try {
    doctor = await fetchDoctor(doctorId);
  } catch (err) {
    return next(new AppError('Doctor not found or doctor-service unavailable', 404));
  }

  // 3. Validate location exists on this doctor
  const location = doctor.locations.find(loc => loc._id === locationId || loc._id.toString() === locationId);
  if (!location) {
    return next(new AppError('The specified location does not exist for this doctor', 404));
  }

  // 4. Validate slot exists on the location
  const slot = location.availability.find(s => s._id === slotId || s._id.toString() === slotId);
  if (!slot) {
    return next(new AppError('The specified time slot does not exist at this location', 404));
  }

  // 5. Check if slot is available manually toggled by doctor
  if (slot.isAvailable === false) {
    return next(new AppError('This time slot is marked as unavailable by the doctor.', 400));
  }

  // 6. Check if slot has reached patient limit
  const bookedCount = await Appointment.countDocuments({
    'timeSlot.slotId': slot._id,
    date,
    status: { $in: ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED'] }
  });

  const limit = slot.patientLimit || 1;
  if (bookedCount >= limit) {
    return next(new AppError('This session is fully booked for that date. Please choose another.', 409));
  }

  // 7. Validate the date day matches the slot's day
  const dateDay = getDayName(date);
  if (dateDay !== slot.day) {
    return next(new AppError(
      `This slot is for ${slot.day}s but ${date} is a ${dateDay}. Please choose a matching date.`,
      400
    ));
  }

  // Calculate queue number based on all bookings for this slot + date
  const totalBookings = await Appointment.countDocuments({
    'timeSlot.slotId': slot._id,
    date
  });
  const queueNo = totalBookings + 1;

  // 8. Create the appointment (partial unique index prevents double-booking per patient at DB level too)
  let appointment;
  try {
    appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      location: {
        hospitalId: location.hospitalId,
        hospitalName: location.hospitalName,
        city: location.city,
        address: location.address,
        consultationFee: location.consultationFee
      },
      timeSlot: {
        slotId: slot._id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime
      },
      date,
      appointmentType,
      queueNo,
      notes: notes || '',
      status: 'AWAITING_PAYMENT', // Lock the appointment until payment success
      paymentStatus: 'PENDING'
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You already have a booking for this slot on that date', 409));
    }
    return next(err);
  }

  res.status(201).json({
    message: 'Appointment booked successfully',
    appointment
  });
});

// CANCELLATION & RESCHEDULING

// PATCH /appointments/:id/cancel
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  let isPatient = false;
  let isDoctor = false;
  let isAdmin = req.user.role === 'admin';

  if (req.user.role === 'user' && appointment.patientId === req.user.id) {
    isPatient = true;
  } else if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      if (doctor && doctor.userId === req.user.id) isDoctor = true;
    } catch (err) { }
  }

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new AppError('You do not have permission to cancel this appointment', 403));
  }

  if (isPatient && appointment.status !== 'PENDING') {
    return next(new AppError('Patients can only cancel pending appointments.', 400));
  }

  if (isDoctor && !['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    return next(new AppError('Doctors can only cancel pending or confirmed appointments.', 400));
  }

  if (isAdmin && !['PENDING', 'CONFIRMED', 'AWAITING_PAYMENT'].includes(appointment.status)) {
    return next(new AppError('Admins can only cancel pending, confirmed, or awaiting payment appointments.', 400));
  }

  appointment.status = 'CANCELLED';
  appointment.statusReason = req.body?.reason || '';
  await appointment.save();

  try {
    const payload = await buildAppointmentNotificationPayload(appointment, {
      cancelledBy: req.user.role
    });

    await safeSendNotification("APPOINTMENT_CANCELLED", payload);
  } catch (notifyErr) {
    console.error("Appointment Service: Failed to send cancel email:", notifyErr.message);
  }

  res.status(200).json({
    message: 'Appointment cancelled successfully',
    appointment
  });
});



// DOCTOR STATUS MANAGEMENT

// PATCH /appointments/:id/accept  (doctor or admin)
exports.acceptAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      if (!doctor || doctor.userId !== req.user.id) {
        return next(new AppError('You can only manage your own appointments', 403));
      }
    } catch (err) {
      return next(new AppError('Doctor verification failed', 503));
    }
  }

  if (appointment.status !== 'PENDING') {
    return next(new AppError(
      `Can only confirm a PENDING appointment. Current status: ${appointment.status}`,
      400
    ));
  }

  appointment.status = 'CONFIRMED';
  await appointment.save();

  try {
    const payload = await buildAppointmentNotificationPayload(appointment);
    await safeSendNotification("APPOINTMENT_ACCEPTED", payload);
  } catch (notifyErr) {
    console.error("Appointment Service: Failed to send accept email:", notifyErr.message);
  }

  res.status(200).json({
    message: 'Appointment confirmed successfully',
    appointment
  });
});

// PATCH /appointments/:id/confirm-payment (Internal/Secure)
exports.confirmPayment = catchAsync(async (req, res, next) => {
  console.log("confirmPayment route hit for appointment ID:", req.params.id);

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, paymentStatus: { $ne: 'COMPLETED' } },
    { $set: { status: 'PENDING', paymentStatus: 'COMPLETED' } },
    { new: true }
  );

  if (!appointment) {
    console.error("confirmPayment: No appointment found or already confirmed for ID:", req.params.id);
    return res.status(200).json({ message: 'Payment already confirmed or appointment not found', isDuplicate: true });
  }

  console.log("confirmPayment: Appointment updated atomically to PENDING and COMPLETED:", appointment._id);
  try {
    console.log("confirmPayment: Building notification payload...");

    const payload = await buildAppointmentNotificationPayload(appointment);

    console.log("confirmPayment: Notification payload built successfully:", payload);

    console.log("confirmPayment: Sending notification event to notification-service...");

    await safeSendNotification("APPOINTMENT_BOOKED_PAYMENT_CONFIRMED", payload);

    console.log("confirmPayment: Notification event send attempt completed");
  } catch (notifyErr) {
    console.error("Appointment Service: Failed to send booking confirmation email:", notifyErr);
  }

  res.status(200).json({
    message: 'Payment confirmed and appointment activated',
    appointment
  });
});



// PATCH /appointments/:id/complete  (doctor or admin)
exports.completeAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      if (!doctor || doctor.userId !== req.user.id) {
        return next(new AppError('You can only manage your own appointments', 403));
      }
    } catch (err) {
      return next(new AppError('Doctor verification failed', 503));
    }
  }

  if (appointment.status === 'COMPLETED') {
    return res.status(200).json({
      message: 'Appointment already marked as completed',
      appointment
    });
  }

  if (appointment.status !== 'CONFIRMED') {
    return next(new AppError(
      `Can only complete a CONFIRMED appointment. Current status: ${appointment.status}`,
      400
    ));
  }

  appointment.status = 'COMPLETED';
  await appointment.save();

  try {
    const payload = await buildAppointmentNotificationPayload(appointment);
    await safeSendNotification("APPOINTMENT_COMPLETED", payload);
  } catch (notifyErr) {
    console.error("Appointment Service: Failed to send completion email:", notifyErr.message);
  }

  res.status(200).json({
    message: 'Appointment marked as completed',
    appointment
  });
});

// PATCH /appointments/:id/toggle-meeting (doctor or admin)
exports.toggleMeeting = catchAsync(async (req, res, next) => {
  console.log(`Appointment Service: Toggling meeting for ID: ${req.params.id} (User: ${req.user.id}, Role: ${req.user.role})`);
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new AppError('No appointment found with that ID', 404));

  console.log(`Appointment Service: Found appointment for doctor: ${appointment.doctorId}`);

  // Auth check: only doctor of this appointment or admin
  if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      console.log(`Appointment Service: Verified doctor userID from service: ${doctor?.userId}`);
      if (!doctor || doctor.userId !== req.user.id) {
        console.error(`Appointment Service: Unauthorized. Doctor userID ${doctor?.userId} !== req.user.id ${req.user.id}`);
        return next(new AppError('You can only manage your own appointments', 403));
      }
    } catch (err) {
      console.error(`Appointment Service: Doctor verification error: ${err.message}`);
      return next(new AppError('Doctor verification failed', 503));
    }
  } else if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to toggle meetings', 403));
  }

  // Toggle flag
  appointment.isMeetingEnabled = !appointment.isMeetingEnabled;
  await appointment.save();

  console.log(`Appointment Service: Meeting enabled state updated to: ${appointment.isMeetingEnabled}`);

  res.status(200).json({
    status: 'success',
    isMeetingEnabled: appointment.isMeetingEnabled,
    appointment
  });
});

// QUERIES

// GET /appointments/my  — patient's own appointments
exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const filter = { patientId: req.user.id };
  
  // Filter out AWAITING_PAYMENT unless specific status requested
  if (status) {
    filter.status = status.toUpperCase();
  } else {
    filter.status = { $ne: 'AWAITING_PAYMENT' };
  }

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    message: appointments.length
      ? 'Your appointments retrieved successfully'
      : 'You have no appointments',
    results: appointments.length,
    appointments
  });
});

// GET /appointments/doctor/:doctorId  — all appointments for a doctor (doctor or admin)
exports.getDoctorAppointments = catchAsync(async (req, res, next) => {
  const { status, date } = req.query;
  const filter = { doctorId: req.params.doctorId };
  
  if (status) {
    filter.status = status.toUpperCase();
  } else {
    filter.status = { $ne: 'AWAITING_PAYMENT' };
  }
  
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    message: appointments.length
      ? 'Doctor appointments retrieved successfully'
      : 'No appointments found for this doctor',
    results: appointments.length,
    appointments
  });
});

// GET /appointments/:id  — single appointment detail
exports.getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Only the patient, the doctor (checked by doctorId match), or admin can view
  const isPatient = appointment.patientId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isDoctor = req.user.role === 'doctor'; // doctor sees via /doctor/:id route

  if (!isPatient && !isAdmin && !isDoctor) {
    return next(new AppError('You do not have permission to view this appointment', 403));
  }

  res.status(200).json({
    message: 'Appointment retrieved successfully',
    appointment
  });
});

// GET /appointments  — admin: all appointments
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const { status, doctorId, patientId, date } = req.query;
  const filter = {};
  
  if (status) {
    filter.status = status.toUpperCase();
  }
  // Admin intentionally sees all records including AWAITING_PAYMENT by default
  
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    message: 'All appointments retrieved',
    results: appointments.length,
    appointments
  });
});

// GET /appointments/doctor/:doctorId/booked-slots?date=YYYY-MM-DD
// Fast endpoint for patients to check availability without seeing full appointment details
exports.getBookedSlots = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return next(new AppError('Please provide a date query parameter formatted as YYYY-MM-DD', 400));
  }

  const mongoose = require('mongoose');

  const appointments = await Appointment.aggregate([
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        date,
        status: { $in: ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED'] }
      }
    },
    {
      $group: {
        _id: '$timeSlot.slotId',
        count: { $sum: 1 }
      }
    }
  ]);

  const bookedSlots = appointments.map(app => ({
    slotId: app._id,
    count: app.count
  }));

  res.status(200).json({
    message: 'Booked slots retrieved successfully',
    date,
    bookedSlots
  });
});