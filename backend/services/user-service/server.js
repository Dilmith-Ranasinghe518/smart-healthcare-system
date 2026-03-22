const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('User Service: MongoDB connected'))
  .catch((err) => console.log('User Service: DB Connection error', err));

app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.USER_PORT;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
