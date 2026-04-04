const axios = require('axios');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Internal URL of doctor-service (set in .env)
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL;

// Helper: fetch doctor data from doctor-service
const fetchDoctor = async (doctorId) => {
  const { data } = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
  return data.doctor;
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

  let isAuthorized = false;
  if (req.user.role === 'admin') {
    isAuthorized = true;
  } else if (req.user.role === 'user' && appointment.patientId === req.user.id) {
    isAuthorized = true;
  } else if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      if (doctor && doctor.userId === req.user.id) isAuthorized = true;
    } catch (err) { }
  }

  if (!isAuthorized) {
    return next(new AppError('You do not have permission to cancel this appointment', 403));
  }

  const cancellableStatuses = ['PENDING', 'CONFIRMED'];
  if (!cancellableStatuses.includes(appointment.status)) {
    return next(new AppError(
      `Cannot cancel an appointment with status ${appointment.status}`,
      400
    ));
  }

  appointment.status = 'CANCELLED';
  appointment.statusReason = req.body?.reason || '';
  await appointment.save();

  res.status(200).json({
    message: 'Appointment cancelled successfully',
    appointment
  });
});

// PATCH /appointments/:id/reschedule
exports.rescheduleAppointment = catchAsync(async (req, res, next) => {
  const { newSlotId, newLocationId, newDate } = req.body;

  if (!newSlotId || !newLocationId || !newDate) {
    return next(new AppError('Please provide newSlotId, newLocationId, and newDate', 400));
  }

  if (!isFutureDate(newDate)) {
    return next(new AppError('New appointment date must be today or in the future', 400));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  let isAuthorized = false;
  if (req.user.role === 'admin') {
    isAuthorized = true;
  } else if (req.user.role === 'user' && appointment.patientId === req.user.id) {
    isAuthorized = true;
  } else if (req.user.role === 'doctor') {
    try {
      const doctor = await fetchDoctor(appointment.doctorId);
      if (doctor && doctor.userId === req.user.id) isAuthorized = true;
    } catch (err) { }
  }

  if (!isAuthorized) {
    return next(new AppError('You do not have permission to reschedule this appointment', 403));
  }

  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    return next(new AppError(
      `Cannot reschedule an appointment with status ${appointment.status}`,
      400
    ));
  }

  // Fetch doctor to validate new slot
  let doctor;
  try {
    doctor = await fetchDoctor(appointment.doctorId.toString());
  } catch (err) {
    return next(new AppError('Doctor-service unavailable', 503));
  }

  const newLocation = doctor.locations.find(l => l._id.toString() === newLocationId);
  if (!newLocation) {
    return next(new AppError('New location not found on this doctor', 404));
  }

  const newSlot = newLocation.availability.find(s => s._id.toString() === newSlotId);
  if (!newSlot) {
    return next(new AppError('New time slot not found at this location', 404));
  }

  const existingAppt = await Appointment.findOne({
    'timeSlot.slotId': newSlot._id,
    date: newDate,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });
  if (existingAppt) {
    return next(new AppError('The new time slot is already booked on that date', 409));
  }

  const dateDay = getDayName(newDate);
  if (dateDay !== newSlot.day) {
    return next(new AppError(
      `This slot is for ${newSlot.day}s but ${newDate} is a ${dateDay}`,
      400
    ));
  }



  // Update appointment with new slot/location/date, reset to PENDING
  appointment.location = {
    hospitalId: newLocation.hospitalId,
    hospitalName: newLocation.hospitalName,
    city: newLocation.city,
    address: newLocation.address,
    consultationFee: newLocation.consultationFee
  };
  appointment.timeSlot = {
    slotId: newSlot._id,
    day: newSlot.day,
    startTime: newSlot.startTime,
    endTime: newSlot.endTime
  };
  appointment.date = newDate;
  appointment.status = 'PENDING';
  await appointment.save();

  res.status(200).json({
    message: 'Appointment rescheduled successfully',
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

  res.status(200).json({
    message: 'Appointment confirmed successfully',
    appointment
  });
});

// PATCH /appointments/:id/confirm-payment (Internal/Secure)
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Update status to PENDING (for doctor) and paymentStatus to COMPLETED
  appointment.status = 'PENDING';
  appointment.paymentStatus = 'COMPLETED';
  await appointment.save();

  res.status(200).json({
    message: 'Payment confirmed and appointment activated',
    appointment
  });
});

// PATCH /appointments/:id/reject  (doctor or admin)
exports.rejectAppointment = catchAsync(async (req, res, next) => {
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

  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    return next(new AppError(
      `Cannot reject an appointment with status ${appointment.status}`,
      400
    ));
  }

  appointment.status = 'REJECTED';
  appointment.statusReason = req.body?.reason || '';
  await appointment.save();

  res.status(200).json({
    message: 'Appointment rejected',
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

  if (appointment.status !== 'CONFIRMED') {
    return next(new AppError(
      `Can only complete a CONFIRMED appointment. Current status: ${appointment.status}`,
      400
    ));
  }

  appointment.status = 'COMPLETED';
  await appointment.save();

  res.status(200).json({
    message: 'Appointment marked as completed',
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

  const appointments = await Appointment.find(filter).sort({ date: 1, 'timeSlot.startTime': 1 });

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

  const appointments = await Appointment.find(filter).sort({ date: 1, 'timeSlot.startTime': 1 });

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
  } else {
    filter.status = { $ne: 'AWAITING_PAYMENT' };
  }
  
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter).sort({ date: 1, 'timeSlot.startTime': 1 });

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
