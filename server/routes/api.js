const express = require('express');
const cors = require('cors');

// Import controllers
const weatherController = require('../controllers/weatherController');
const userController = require('../controllers/userController');
const hotelController = require('../controllers/hotelController');
const flightController = require('../controllers/flightController');
const itineraryController = require('../controllers/itineraryController');

const router = express.Router();

// Global middleware
router.use(cors({
  origin: [
    'http://localhost:5173', // Vite default dev server
    'http://localhost:3000', // React default dev server
    process.env.FRONTEND_URL // Production frontend URL
  ].filter(Boolean), // Remove any undefined origins
  credentials: true
}));

// Weather routes
router.get('/weather', weatherController.getWeather);
router.get('/weather/:city', weatherController.getWeatherByCity);

// User routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);

// Hotel routes
router.get('/hotels/search', hotelController.searchHotels);
router.get('/hotels/:id', hotelController.getHotelDetails);
router.post('/hotels/book', hotelController.bookHotel);

// Flight routes
router.get('/flights/search', flightController.searchFlights);
router.get('/flights/offers', flightController.getFlightOffers);
router.post('/flights/book', flightController.bookFlight);

// Itinerary routes
router.post('/itinerary/create', itineraryController.createItinerary);
router.get('/itinerary', itineraryController.getUserItineraries);
router.get('/itinerary/:id', itineraryController.getItineraryDetails);
router.put('/itinerary/:id', itineraryController.updateItinerary);
router.delete('/itinerary/:id', itineraryController.deleteItinerary);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = router;