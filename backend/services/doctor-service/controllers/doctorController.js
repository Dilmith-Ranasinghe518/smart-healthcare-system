const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create doctor profile
exports.createProfile = catchAsync(async (req, res, next) => {
  const { name, specialization, qualifications, experience, userId } = req.body;
  let targetUserId = null;

  // If a DOCTOR is creating a profile, enforce the 1-profile limit
  if (req.user.role === 'doctor') {
    const existingDoc = await Doctor.findOne({ userId: req.user._id });
    if (existingDoc) {
      return next(new AppError('You already have a doctor profile attached to this account', 400));
    }
    targetUserId = req.user._id; // Force attach to their own account
  }

  // If an ADMIN is creating a profile, they bypass the limit.
  // They can optionally pass a `userId` in the body to link it to an auth account, 
  // or leave it blank to just create a standalone doctor in the directory.
  if (req.user.role === 'admin') {
    targetUserId = userId || null;
  }

  const newDoctor = await Doctor.create({
    userId: targetUserId,
    name,
    specialization,
    qualifications,
    experience
  });

  res.status(201).json({
    message: 'Doctor profile created successfully',
    doctor: newDoctor
  });
});

// Get all doctors (optionally filter by location and specialization)
// This is the PUBLIC endpoint that hides unverified doctors
exports.getDoctors = catchAsync(async (req, res, next) => {
  const { specialization, location } = req.query;

  let filter = { isVerified: true }; // Only show verified doctors publicly

  if (specialization) {
    // Case insensitive regex search
    filter.specialization = { $regex: new RegExp(specialization, 'i') };
  }

  if (location) {
    filter['locations.city'] = { $regex: new RegExp(location, 'i') };
  }

  const doctors = await Doctor.find(filter);

  res.status(200).json({
    message: 'Doctors retrieved successfully',
    results: doctors.length,
    doctors
  });
});

// Get ALL doctors without filters (strictly Admin Only)
exports.getAllDoctorsAdmin = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).json({
    message: 'All doctors (including unverified) retrieved successfully for Admin',
    results: doctors.length,
    doctors
  });
});

// Get doctor by ID
exports.getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    message: 'Doctor retrieved successfully',
    doctor
  });
});

// Update doctor profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // Verify ownership or admin role
  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // Exclude fields that shouldn't be updated here
  const { name, specialization, qualifications, experience } = req.body;
  const updateData = { name, specialization, qualifications, experience };

  // Remove undefined fields
  Object.keys(updateData).forEach(
    key => updateData[key] === undefined && delete updateData[key]
  );

  const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    message: 'Doctor profile updated successfully',
    doctor: updatedDoctor
  });
});

// Delete doctor profile
exports.deleteProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    message: 'Doctor profile deleted successfully'
  });
});

// Verify doctor
exports.verifyDoctor = catchAsync(async (req, res, next) => {
  const { isVerified } = req.body;

  if (typeof isVerified !== 'boolean') {
    return next(new AppError('Please provide a valid boolean value for isVerified', 400));
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    message: 'Doctor verification status updated successfully',
    doctor
  });
});

// Manage doctor locations and availabilities
exports.manageLocations = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own locations', 403));
  }

  const { hospitalId, availability } = req.body;

  if (!hospitalId) {
    return next(new AppError('Please provide a hospitalId', 400));
  }

  // Check if hospital exists
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }

  // Check if the doctor already has this hospital in their locations array
  const locationIndex = doctor.locations.findIndex(
    loc => loc.hospitalId.toString() === hospitalId
  );

  // Simple conflict check (Can be expanded)
  if (!availability || !Array.isArray(availability)) {
    return next(new AppError('Please provide availability array', 400));
  }

  if (locationIndex > -1) {
    // Update existing location availability
    // For simplicity, replacing the entire availability array. 
    // It can be optimized to update/add specific slots without replacing all.
    doctor.locations[locationIndex].availability = availability;
  } else {
    // Add new location to doctor
    doctor.locations.push({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      city: hospital.city,
      address: hospital.address,
      availability
    });
  }

  await doctor.save({ validateBeforeSave: true });

  res.status(200).json({
    message: 'Doctor locations updated successfully',
    doctor
  });
});
