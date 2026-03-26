const Hospital = require('../models/Hospital');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new hospital (Admin only)
exports.createHospital = catchAsync(async (req, res, next) => {
  const { name, city, address, coordinates, isActive } = req.body;

  const hospitalData = { name, city, address };
  if (isActive !== undefined) hospitalData.isActive = isActive;

  // Attach GeoJSON location if coordinates [lng, lat] are provided
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    hospitalData.location = {
      type: 'Point',
      coordinates // [longitude, latitude]
    };
  }

  let newHospital;
  try {
    newHospital = await Hospital.create(hospitalData);
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError(
        `A hospital named "${name}" at "${address}" in ${city} already exists. ` +
        `To add a branch, use a different address.`,
        409
      ));
    }
    return next(err);
  }

  res.status(201).json({
    message: 'Hospital created successfully',
    hospital: newHospital
  });
});

// Get all hospitals (optional filters: city, isActive)
exports.getAllHospitals = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.city) {
    filter.city = { $regex: new RegExp(req.query.city, 'i') };
  }

  // By default only return active hospitals; admin can pass ?isActive=all to override
  if (req.query.isActive === 'all') {
    // No filter — return everything
  } else if (req.query.isActive === 'false') {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  const hospitals = await Hospital.find(filter).sort({ name: 1 });

  res.status(200).json({
    message: 'Hospitals retrieved successfully',
    results: hospitals.length,
    hospitals
  });
});

// Get hospital by ID
exports.getHospital = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }

  res.status(200).json({
    message: 'Hospital retrieved successfully',
    hospital
  });
});

// Update hospital by ID (Admin only)
exports.updateHospital = catchAsync(async (req, res, next) => {
  const { name, city, address, coordinates, isActive } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (city !== undefined) updateData.city = city;
  if (address !== undefined) updateData.address = address;
  if (isActive !== undefined) updateData.isActive = isActive;

  if (Array.isArray(coordinates) && coordinates.length === 2) {
    updateData.location = {
      type: 'Point',
      coordinates // [longitude, latitude]
    };
  }

  let hospital;
  try {
    hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError(
        'A hospital with that name and address already exists in that city.',
        409
      ));
    }
    return next(err);
  }

  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }

  res.status(200).json({
    message: 'Hospital updated successfully',
    hospital
  });
});

// Toggle hospital active status (Admin only)
exports.toggleHospitalStatus = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }

  hospital.isActive = !hospital.isActive;
  await hospital.save();

  res.status(200).json({
    message: `Hospital ${hospital.isActive ? 'activated' : 'deactivated'} successfully`,
    hospital
  });
});
