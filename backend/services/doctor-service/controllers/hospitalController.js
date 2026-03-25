const Hospital = require('../models/Hospital');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new hospital
exports.createHospital = catchAsync(async (req, res, next) => {
  const { name, city, address, coordinates } = req.body;

  let locationData;
  if (coordinates && coordinates.length === 2) {
    locationData = {
      type: 'Point',
      coordinates
    };
  }

  const newHospital = await Hospital.create({
    name,
    city,
    address,
    location: locationData
  });

  res.status(201).json({
    message: 'Hospital created successfully',
    hospital: newHospital
  });
});

// Get all hospitals
exports.getAllHospitals = catchAsync(async (req, res, next) => {
  // Simple filtering by city if provided
  const filter = {};
  if (req.query.city) {
    filter.city = req.query.city;
  }

  const hospitals = await Hospital.find(filter);

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

// Update hospital by ID
exports.updateHospital = catchAsync(async (req, res, next) => {
  const { name, city, address, coordinates } = req.body;
  const updateData = { name, city, address };

  // Remove undefined fields
  Object.keys(updateData).forEach(
    key => updateData[key] === undefined && delete updateData[key]
  );

  if (coordinates && coordinates.length === 2) {
    updateData.location = {
      type: 'Point',
      coordinates
    };
  }

  const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!hospital) {
    return next(new AppError('No hospital found with that ID', 404));
  }

  res.status(200).json({
    message: 'Hospital updated successfully',
    hospital
  });
});
