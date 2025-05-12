// In server/routes/api.js
const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

// Weather routes
router.get('/weather/:city', weatherController.getWeather);

// Add other API routes here

module.exports = router;