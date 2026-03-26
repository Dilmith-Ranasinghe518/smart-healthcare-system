const mongoose = require('mongoose');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'A slot must have a day'],
    enum: {
      values: VALID_DAYS,
      message: '{VALUE} is not a valid day. Must be a day of the week.'
    }
  },
  startTime: {
    type: String,
    required: [true, 'A slot must have a start time'],
    enum: {
      values: VALID_TIMES,
      message: '{VALUE} is not a valid start time'
    }
  },
  endTime: {
    type: String,
    required: [true, 'A slot must have an end time'],
    enum: {
      values: VALID_TIMES,
      message: '{VALUE} is not a valid end time'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  patientLimit: {
    type: Number,
    required: [true, 'A slot must have a patient limit'],
    default: 5,
    min: [1, 'Patient limit must be at least 1']
  }
}, { _id: true });

const locationSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hospital',
    required: [true, 'A location must reference a hospital']
  },
  hospitalName: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: [true, 'A location must specify a consultation fee'],
    default: 0,
    min: [0, 'Fee cannot be negative']
  },
  locationPoint: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  availability: [availabilitySlotSchema]
}, { _id: true });

// Sparse 2dsphere index — only indexes documents that have locationPoint set
locationSchema.index({ locationPoint: '2dsphere' }, { sparse: true });

const doctorSchema = new mongoose.Schema({
  userId: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'A doctor must have a name'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'A doctor must have a specialization'],
    enum: {
      values: [
        'Cardiology', 'Dermatology', 'Endocrinology', 'ENT',
        'Gastroenterology', 'General Practitioner', 'General Surgery',
        'Gynecology', 'Internal Medicine', 'Neurology', 'Oncology',
        'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Pulmonology', 'Radiology', 'Urology', 'Dentistry', 'Other'
      ],
      message: '{VALUE} is not a valid medical specialization'
    },
    trim: true
  },
  qualifications: {
    type: [String],
    required: [true, 'A doctor must have at least one qualification']
  },
  experience: {
    type: Number,
    required: [true, 'A doctor must specify years of experience'],
    min: [0, 'Experience cannot be negative']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  locations: [locationSchema]
}, {
  timestamps: true
});

// Export valid options so controllers can send them to the frontend (for dropdowns)
doctorSchema.statics.VALID_DAYS = VALID_DAYS;
doctorSchema.statics.VALID_TIMES = VALID_TIMES;

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
