const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A hospital must have a name'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'A hospital must belong to a city'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'A hospital must have an address'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Sparse 2dsphere index on hospital location
hospitalSchema.index({ location: '2dsphere' }, { sparse: true });

// Prevent exact duplicates — same name + city + address
// Same hospital chain CAN have multiple branches (different address) in the same city
hospitalSchema.index({ name: 1, city: 1, address: 1 }, { unique: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
