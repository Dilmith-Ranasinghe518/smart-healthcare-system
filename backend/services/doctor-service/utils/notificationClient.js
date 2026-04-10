const axios = require("axios");

const sendNotificationEvent = async (eventType, payload) => {
  const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

  if (!NOTIFICATION_SERVICE_URL) {
    console.warn("Doctor Service: NOTIFICATION_SERVICE_URL is missing");
    return;
  }

  await axios.post(
    `${NOTIFICATION_SERVICE_URL}/api/notifications/email/event`,
    { eventType, payload },
    { timeout: 8000 }
  );
};

module.exports = sendNotificationEvent;