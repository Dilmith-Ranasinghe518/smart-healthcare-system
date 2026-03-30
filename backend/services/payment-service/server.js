require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err));

app.get("/", (req, res) => {
  res.send("Payment Service Running 💰");
});

app.use("/api/payment", paymentRoutes);

app.get("/success", (req, res) => {
  res.send("Payment Successful ✅");
});

app.get("/cancel", (req, res) => {
  res.send("Payment Cancelled ❌");
});

const PORT = process.env.PAYMENT_PORT || 5009;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});