const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'A message must belong to an appointment'],
    ref: 'Appointment'
  },
  senderId: {
    type: String,
    required: [true, 'A message must have a sender ID']
  },
  senderRole: {
    type: String,
    enum: ['doctor', 'user', 'admin'],
    required: [true, 'A message must have a sender role']
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast retrieval of messages for an appointment
messageSchema.index({ appointmentId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
