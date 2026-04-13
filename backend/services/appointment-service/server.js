const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const appointmentRoutes = require('./routes/appointmentRoutes');
const path = require('path');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

// Static folder for chat uploads
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/api/appointments/uploads', express.static(uploadDir));

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('Appointment Service: MongoDB connected'))
  .catch((err) => console.log('Appointment Service: DB Connection error', err));

app.use('/api/appointments', appointmentRoutes);

// Initialize Cron Jobs
const initCron = require('./utils/cron');
initCron();

// Handle undefined routes
app.all(/(.*)/, (req, res, next) => {
  const AppError = require('./utils/appError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.APPOINTMENT_PORT;
app.listen(PORT, () => console.log(`Appointment Service running on port ${PORT}`));
