const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true
    },
    to: {
      type: [String],
      default: []
    },
    subject: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true
    },
    provider: {
      type: String,
      default: "resend"
    },
    providerMessageId: {
      type: String,
      default: ""
    },
    errorMessage: {
      type: String,
      default: ""
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);