const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('Doctor Service: MongoDB connected'))
  .catch((err) => console.log('Doctor Service: DB Connection error', err));

app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Handle undefined routes
app.all(/(.*)/, (req, res, next) => {
  const AppError = require('./utils/appError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.DOCTOR_PORT || 5007;
app.listen(PORT, () => console.log(`Doctor Service running on port ${PORT}`));
