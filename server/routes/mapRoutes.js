const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Save user location - changed to match frontend path
router.post('/locations', mapController.saveUserLocation);

// Get user's saved locations
router.get('/locations/user/:userId', mapController.getUserLocationHistory);

// Get nearby points of interest
router.get('/locations/nearby', mapController.getNearbyPointsOfInterest);

// Get points of interest within bounds
router.get('/locations/bounds', mapController.getPointsInBounds);

// Save a place to favorites
router.post('/locations/saved-places', mapController.savePlace);

// Get user's saved places
router.get('/locations/saved-places/:userId', mapController.getSavedPlaces);

// Delete a saved place
router.delete('/locations/saved-places/:placeId', mapController.deleteSavedPlace);

// Get location based recommendations
router.get('/locations/recommendations', mapController.getLocationRecommendations);

module.exports = router;