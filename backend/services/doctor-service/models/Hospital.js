const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A hospital must have a name'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'A hospital must belong to a city'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'A hospital must have an address'],
  },
  location: {
    // GeoJSON for future scalability
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number] // [longitude, latitude]
  }
}, {
  timestamps: true
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
