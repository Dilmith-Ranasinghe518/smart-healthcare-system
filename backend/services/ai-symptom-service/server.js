const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const symptomRoutes = require("./routes/symptomRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ai-symptom-service",
    status: "running"
  });
});

app.use("/api/symptoms", symptomRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`AI Symptom Service running on port ${PORT}`);
});