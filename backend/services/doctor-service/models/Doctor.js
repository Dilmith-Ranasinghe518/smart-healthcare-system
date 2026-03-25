const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: String,
    // Optional, so admins can create standalone profiles without an Auth account
    // Not unique, because we enforce the 1-profile-per-doctor rule in the controller
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
        'Cardiology',
        'Dermatology',
        'Endocrinology',
        'ENT',
        'Gastroenterology',
        'General Practitioner',
        'General Surgery',
        'Gynecology',
        'Internal Medicine',
        'Neurology',
        'Oncology',
        'Ophthalmology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'Pulmonology',
        'Radiology',
        'Urology',
        'Dentistry',
        'Other'
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
    required: [true, 'A doctor must specify years of experience']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  locations: [
    {
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
      availability: [
        {
          date: {
            // Can be a specific date (YYYY-MM-DD) or day of week (Monday, etc)
            type: String,
            required: true
          },
          startTime: {
            type: String,
            required: true // Format HH:mm
          },
          endTime: {
            type: String,
            required: true // Format HH:mm
          }
        }
      ]
    }
  ]
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
