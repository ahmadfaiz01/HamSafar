const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Get personalized recommendations (requires auth)
router.get('/', optionalAuth, recommendationController.getPersonalizedRecommendations);

// Get recommendations by category
router.get('/category/:category', recommendationController.getCategoryRecommendations);

// Get all destinations
router.get('/destinations', recommendationController.getAllDestinations);

// Get destination by ID
router.get('/destinations/:id', recommendationController.getDestinationById);

// Add destination to wishlist (requires auth)
router.post('/wishlist', auth, recommendationController.addToWishlist);

module.exports = router;
