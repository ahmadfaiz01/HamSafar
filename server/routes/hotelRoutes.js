const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Get available cities
router.get('/cities', hotelController.getCities);

// Get popular destinations
router.get('/popular-destinations', hotelController.getPopularDestinations);

// Search hotels
router.get('/search', hotelController.searchHotels);

// Get hotel by ID
router.get('/:id', hotelController.getHotelById);

// Get hotels by city
router.get('/city/:city', hotelController.getHotelsByCity);

module.exports = router;