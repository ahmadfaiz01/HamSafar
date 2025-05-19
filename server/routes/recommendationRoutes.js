const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Check if controller functions exist
if (!recommendationController.getNearbyAttractions) {
  console.error('Warning: getNearbyAttractions function is not defined in the controller');
}

// Get various types of recommendations
router.get('/personalized', recommendationController.getPersonalizedRecommendations);
router.get('/category/:category', recommendationController.getCategoryRecommendations);
router.get('/destinations', recommendationController.getAllDestinations);
router.get('/destinations/:id', recommendationController.getDestinationById);

// Get nearby attractions
router.get('/nearby', recommendationController.getNearbyAttractions);

// Add to wishlist endpoint
router.post('/wishlist', recommendationController.addToWishlist);

// Store user location
router.post('/user-location', recommendationController.storeUserLocation);

module.exports = router;
