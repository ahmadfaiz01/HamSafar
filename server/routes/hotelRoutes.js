const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Public routes
router.get('/cities', hotelController.getCities);
router.get('/popular-destinations', hotelController.getPopularDestinations);
router.get('/search', hotelController.searchHotels);

// Generic routes for single items come after specific routes
router.get('/:id', hotelController.getHotelById);
router.get('/', hotelController.getAllHotels);

// Admin routes - should have authentication middleware in production
router.post('/', hotelController.createHotel);
router.put('/:id', hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;