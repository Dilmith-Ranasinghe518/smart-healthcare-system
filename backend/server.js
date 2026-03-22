const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(cors());

require('dotenv').config();

// Connect to MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-healthcare';
console.log('Connecting to MongoDB using URI:', uri);
mongoose.connect(uri)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error', err));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
