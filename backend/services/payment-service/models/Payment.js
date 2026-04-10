const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: String,
  appointmentId: String,
  consultationFee: Number,
  taxAmount: Number,
  amount: Number, // Total amount = consultationFee + taxAmount
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



