const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());

require('dotenv').config();

// Define service URLs (Default to localhost for local testing)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const TELEMEDICINE_SERVICE_URL = process.env.TELEMEDICINE_SERVICE_URL;
const PRESCRIPTION_SERVICE_URL = process.env.PRESCRIPTION_SERVICE_URL;
const AI_SYMPTOM_SERVICE_URL = process.env.AI_SYMPTOM_SERVICE_URL;

console.log(`Gateway: Proxying /api/auth to ${AUTH_SERVICE_URL}`);
console.log(`Gateway: Proxying /api/users to ${USER_SERVICE_URL}`);
console.log(`Gateway: Proxying /api/telemedicine to ${TELEMEDICINE_SERVICE_URL}`);
console.log(`Gateway: Proxying /api/prescriptions to ${PRESCRIPTION_SERVICE_URL}`);
console.log(`Gateway: Proxying /api/dashboard to ${USER_SERVICE_URL}`);
console.log(`Gateway: Proxying /api/ai-symptoms to ${AI_SYMPTOM_SERVICE_URL}`);

// Route Auth requests
app.use('/api/auth', proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/auth${req.url}`;
  }
}));

// Route User and Dashboard requests
app.use('/api/users', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/users${req.url}`;
  }
}));

app.use('/api/dashboard', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/dashboard${req.url}`;
  }
}));

app.use('/api/telemedicine', proxy(TELEMEDICINE_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/telemedicine${req.url}`;
  }
}));

app.use('/api/prescriptions', proxy(PRESCRIPTION_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/prescriptions${req.url}`;
  }
}));

// Route AI Symptom Checker requests
app.use('/api/ai-symptoms', proxy(AI_SYMPTOM_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/symptoms${req.url}`;
  }
}));

const PORT = process.env.GATEWAY_PORT;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));