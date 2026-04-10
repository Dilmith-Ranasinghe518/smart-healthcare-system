const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Notification Service: MongoDB connected"))
  .catch((err) => console.log("Notification Service: DB Connection error", err));

app.get("/", (req, res) => {
  res.send("Notification Service Running 📩");
});

app.use("/api/notifications", notificationRoutes);

const PORT = process.env.NOTIFICATION_PORT || 5010;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});