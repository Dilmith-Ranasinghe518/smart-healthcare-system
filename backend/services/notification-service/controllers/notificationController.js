const NotificationLog = require("../models/NotificationLog");
const { sendEventEmail } = require("../services/emailService");

exports.healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notification service healthy"
  });
};

exports.sendEventNotification = async (req, res) => {
  const { eventType, payload } = req.body;

  if (!eventType || !payload) {
    return res.status(400).json({
      success: false,
      message: "eventType and payload are required"
    });
  }

  try {
    const { template, response } = await sendEventEmail({ eventType, payload });

    const log = await NotificationLog.create({
      eventType,
      to: template.to,
      subject: template.subject,
      status: "SUCCESS",
      provider: "resend",
      providerMessageId: response?.data?.id || "",
      payload
    });

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      logId: log._id
    });
  } catch (error) {
    const failedLog = await NotificationLog.create({
      eventType,
      to: [],
      subject: "",
      status: "FAILED",
      provider: "resend",
      errorMessage: error.message,
      payload
    });

    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
      logId: failedLog._id
    });
  }
};