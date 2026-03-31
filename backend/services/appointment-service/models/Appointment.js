const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true
  },
  patientId: {
    type: String,
    required: [true, 'An appointment must have a patient']
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'An appointment must reference a doctor']
  },
  // Embedded snapshot of the doctor location at time of booking
  location: {
    hospitalId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'An appointment must specify a hospital location']
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
      required: true,
      default: 0
    }
  },
  // Embedded snapshot of the booked time slot
  timeSlot: {
    slotId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'An appointment must reference a slot ID']
    },
    day: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  // The calendar date for this appointment (YYYY-MM-DD)
  date: {
    type: String,
    required: [true, 'An appointment must have a date'],
    validate: {
      validator: v => /^\d{4}-\d{2}-\d{2}$/.test(v),
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  appointmentType: {
    type: String,
    required: [true, 'An appointment must have a type'],
    enum: ['General Checkup', 'Follow-up', 'Report Review', 'First Time Consultation', 'Urgent Care', 'Other']
  },
  queueNo: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: {
      values: APPOINTMENT_STATUSES,
      message: '{VALUE} is not a valid appointment status'
    },
    default: 'PENDING'
  },
  // Optional notes from patient at booking time
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // Reason provided when cancelling or rejecting
  statusReason: {
    type: String,
    trim: true,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'COMPLETED', 'FAILED'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Prevent the same patient from double-booking the exact same slot on the same date
// Multiple patients can now book the same slot up to its limit
appointmentSchema.index(
  { patientId: 1, 'timeSlot.slotId': 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['CANCELLED', 'REJECTED'] }
    }
  }
);

// Fast lookups by doctor and patient
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });

appointmentSchema.statics.STATUSES = APPOINTMENT_STATUSES;

appointmentSchema.pre('save', function () {
  if (!this.appointmentId) {
    // Generate a 10-digit numeric string 
    this.appointmentId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
