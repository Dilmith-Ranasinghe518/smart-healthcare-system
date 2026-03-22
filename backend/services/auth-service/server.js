const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('Auth Service: MongoDB connected'))
  .catch((err) => console.log('Auth Service: DB Connection error', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.AUTH_PORT;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
