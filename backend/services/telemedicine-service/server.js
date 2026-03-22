const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const telemedicineRoutes = require('./routes/telemedicineRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/telemedicine', telemedicineRoutes);

const PORT = process.env.TELEMEDICINE_PORT;
app.listen(PORT, () => console.log(`Telemedicine Service running on port ${PORT}`));
