const express = require("express");
const router = express.Router();

const {
  healthCheck,
  sendEventNotification
} = require("../controllers/notificationController");

router.get("/health", healthCheck);
router.post("/email/event", sendEventNotification);

module.exports = router;