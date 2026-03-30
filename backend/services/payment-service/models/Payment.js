const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: String,
  appointmentId: String,
  amount: Number,
  status: {
    type: String,
    default: "pending",
  },
  stripeSessionId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);