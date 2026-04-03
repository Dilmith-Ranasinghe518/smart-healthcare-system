const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const appointmentRoutes = require('./routes/appointmentRoutes');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('Appointment Service: MongoDB connected'))
  .catch((err) => console.log('Appointment Service: DB Connection error', err));

app.use('/api/appointments', appointmentRoutes);

// Handle undefined routes
app.all(/(.*)/, (req, res, next) => {
  const AppError = require('./utils/appError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.APPOINTMENT_PORT;
app.listen(PORT, () => console.log(`Appointment Service running on port ${PORT}`));
