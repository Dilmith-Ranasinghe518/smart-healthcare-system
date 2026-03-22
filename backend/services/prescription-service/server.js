const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/prescriptions', prescriptionRoutes);

const PORT = process.env.PRESCRIPTION_PORT;
app.listen(PORT, () => console.log(`Prescription Service running on port ${PORT}`));
