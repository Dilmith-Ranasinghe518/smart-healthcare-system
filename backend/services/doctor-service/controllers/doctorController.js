const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Profile Management //

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
    targetUserId = req.user._id;
  }

  // If an ADMIN is creating a profile, they can optionally link it to a userId
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

// Get all doctors — PUBLIC, only verified, supports filters
exports.getDoctors = catchAsync(async (req, res, next) => {
  const { specialization, city } = req.query;

  const filter = { isVerified: true };

  if (specialization) {
    filter.specialization = { $regex: new RegExp(specialization, 'i') };
  }

  if (city) {
    filter['locations.city'] = { $regex: new RegExp(city, 'i') };
  }

  const doctors = await Doctor.find(filter).select(
    'name specialization qualifications experience locations isVerified'
  );

  res.status(200).json({
    message: doctors.length ? 'Doctors retrieved successfully' : 'No doctors found matching the criteria',
    results: doctors.length,
    doctors
  });
});

// Get ALL doctors without filters — Admin only
exports.getAllDoctorsAdmin = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).json({
    message: 'All doctors (including unverified) retrieved for Admin',
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

// Get my profile — for authenticated doctors
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: String(req.user._id) });

  res.status(200).json({
    message: doctor ? 'Doctor profile retrieved successfully' : 'Profile not configured yet',
    doctor: doctor || null
  });
});

// Update doctor profile (basic fields only — not locations)
exports.updateProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const { name, specialization, qualifications, experience, userId } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (specialization !== undefined) updateData.specialization = specialization;
  if (qualifications !== undefined) updateData.qualifications = qualifications;
  if (experience !== undefined) updateData.experience = experience;
  if (req.user.role === 'admin' && userId !== undefined) {
    updateData.userId = userId;
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
    returnDocument: 'after',
    runValidators: true
  });

  res.status(200).json({
    message: 'Doctor profile updated successfully',
    doctor: updatedDoctor
  });
});

// Delete doctor profile — Admin only
exports.deleteProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({ message: 'Doctor profile deleted successfully' });
});

// Verify / unverify a doctor — Admin only
exports.verifyDoctor = catchAsync(async (req, res, next) => {
  const { isVerified } = req.body;

  if (typeof isVerified !== 'boolean') {
    return next(new AppError('Please provide a boolean value for isVerified', 400));
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified },
    { returnDocument: 'after', runValidators: true }
  );

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    message: 'Doctor verification status updated successfully',
    doctor
  });
});

// Location & Hospital Manangement //

// Add or update a hospital location for a doctor
exports.manageLocations = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own locations', 403));
  }

  const { hospitalId, consultationFee } = req.body;

  if (!hospitalId) {
    return next(new AppError('Please provide a hospitalId', 400));
  }

  // Validate hospital exists and is active
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }
  if (!hospital.isActive) {
    return next(new AppError('This hospital is currently inactive', 400));
  }

  // Check if the doctor already has this hospital
  const locationIndex = doctor.locations.findIndex(
    loc => loc.hospitalId.toString() === hospitalId
  );

  // Copy GeoJSON point from hospital if it has coordinates
  const locationPoint = hospital.location && hospital.location.coordinates && hospital.location.coordinates.length === 2
    ? hospital.location
    : undefined;

  if (locationIndex > -1) {
    // Hospital already in locations — refresh all denormalized fields
    if (locationPoint) doctor.locations[locationIndex].locationPoint = locationPoint;
    doctor.locations[locationIndex].hospitalName = hospital.name;
    doctor.locations[locationIndex].city = hospital.city;
    doctor.locations[locationIndex].address = hospital.address;
    if (consultationFee !== undefined) doctor.locations[locationIndex].consultationFee = consultationFee;
  } else {
    // Add new location entry
    const newLocation = {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      city: hospital.city,
      address: hospital.address,
      consultationFee: consultationFee || 0,
      availability: []
    };
    if (locationPoint) newLocation.locationPoint = locationPoint;
    doctor.locations.push(newLocation);
  }

  await doctor.save({ validateBeforeSave: true });

  res.status(200).json({
    message: locationIndex > -1
      ? 'Hospital location updated successfully'
      : 'Hospital location added successfully',
    doctor
  });
});

// Remove a hospital location from a doctor
exports.removeLocation = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own locations', 403));
  }

  const { hospitalId } = req.body;
  if (!hospitalId) {
    return next(new AppError('Please provide a hospitalId to remove', 400));
  }

  const before = doctor.locations.length;
  doctor.locations = doctor.locations.filter(
    loc => loc.hospitalId.toString() !== hospitalId
  );

  if (doctor.locations.length === before) {
    return next(new AppError('This hospital was not found in your locations', 404));
  }

  await doctor.save();

  res.status(200).json({ message: 'Hospital location removed successfully', doctor });
});

// Availability Management //

// Replace availability slots for a specific hospital location
exports.setAvailability = catchAsync(async (req, res, next) => {
  const { locationId } = req.params;
  const { slots } = req.body; // Array of { day, startTime, endTime }

  if (!Array.isArray(slots)) {
    return next(new AppError('Please provide a slots array', 400));
  }

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own availability', 403));
  }

  const location = doctor.locations.id(locationId);
  if (!location) {
    return next(new AppError('No location found with that ID on this doctor', 404));
  }

  // Deduplicate incoming slots by day+startTime+endTime key
  const seen = new Set();
  const dedupedSlots = slots.filter(slot => {
    const key = `${slot.day}-${slot.startTime}-${slot.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Replace entire availability for this location
  location.availability = dedupedSlots;

  await doctor.save({ validateBeforeSave: true });

  res.status(200).json({
    message: 'Availability updated successfully',
    doctor,
    availability: location.availability
  });
});

// Add a single availability slot to a specific location
exports.addAvailabilitySlot = catchAsync(async (req, res, next) => {
  const { locationId } = req.params;
  const { day, startTime, endTime, patientLimit, isAvailable } = req.body;

  if (!day || !startTime || !endTime) {
    return next(new AppError('Please provide day, startTime, and endTime', 400));
  }

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own availability', 403));
  }

  const location = doctor.locations.id(locationId);
  if (!location) {
    return next(new AppError('No location found with that ID on this doctor', 404));
  }

  // Prevent duplicate slot
  const isDuplicate = location.availability.some(
    s => s.day === day && s.startTime === startTime && s.endTime === endTime
  );

  if (isDuplicate) {
    return next(new AppError('This availability slot already exists', 409));
  }

  location.availability.push({ 
    day, 
    startTime, 
    endTime,
    patientLimit: patientLimit || 10,
    isAvailable: isAvailable !== undefined ? isAvailable : true
  });

  await doctor.save({ validateBeforeSave: true });

  res.status(200).json({
    message: 'Availability slot added successfully',
    availability: location.availability
  });
});

// Remove a single availability slot from a specific location
exports.removeAvailabilitySlot = catchAsync(async (req, res, next) => {
  const { locationId, slotId } = req.params;

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  if (doctor.userId !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own availability', 403));
  }

  const location = doctor.locations.id(locationId);
  if (!location) {
    return next(new AppError('No location found with that ID on this doctor', 404));
  }

  const slot = location.availability.id(slotId);
  if (!slot) {
    return next(new AppError('No availability slot found with that ID', 404));
  }

  slot.deleteOne();
  await doctor.save();

  res.status(200).json({
    message: 'Availability slot removed successfully',
    availability: location.availability
  });
});

// Get valid dropdown options for the frontend
exports.getAvailabilityOptions = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: 'Valid availability dropdown options',
    days: Doctor.VALID_DAYS,
    times: Doctor.VALID_TIMES
  });
});

// Search //

exports.getDoctorsNear = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 10, specialization } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng query parameters', 400));
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusInMeters = parseFloat(radius) * 1000; // km to metres

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInMeters)) {
    return next(new AppError('lat, lng, and radius must be valid numbers', 400));
  }

  const geoQuery = {
    isVerified: true,
    'locations.locationPoint': {
      $near: {
        $geometry: { type: 'Point', coordinates: [latitude, longitude] }, // Swapped to [lat, lng] to match db
        $maxDistance: radiusInMeters
      }
    }
  };

  if (specialization) {
    geoQuery.specialization = { $regex: new RegExp(specialization, 'i') };
  }

  let doctors = [];
  try {
    doctors = await Doctor.find(geoQuery).select(
      'name specialization qualifications experience locations isVerified'
    );
  } catch (err) {
    console.warn("GeoQuery failed (possibly missing 2dsphere index). Falling back to city search...");
    // Let doctors remain [] so the fallback executes
  }

  // If no geo results, fall back to city-based search using the nearest hospital's city
  if (doctors.length === 0) {
    const nearbyHospital = await Hospital.findOne({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [latitude, longitude] }, // Swapped to [lat, lng] to match db
          $maxDistance: radiusInMeters * 5 // expand radius for fallback
        }
      }
    });

    if (nearbyHospital) {
      const cityFilter = {
        isVerified: true,
        'locations.city': { $regex: new RegExp(nearbyHospital.city, 'i') }
      };
      if (specialization) cityFilter.specialization = { $regex: new RegExp(specialization, 'i') };
      doctors = await Doctor.find(cityFilter).select(
        'name specialization qualifications experience locations isVerified'
      );
    }
  }

  res.status(200).json({
    message: doctors.length
      ? 'Nearby doctors retrieved successfully'
      : 'No doctors found near this location',
    results: doctors.length,
    doctors
  });
});

