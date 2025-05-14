const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const auth = require('../middleware/auth');

// Protect all itinerary routes
router.use(auth);

// Get all itineraries for a user
router.get('/', itineraryController.getUserItineraries);

// Create a new itinerary
router.post('/', itineraryController.createItinerary);

// Get, update, or delete a specific itinerary
router.get('/:id', itineraryController.getItineraryById);
router.put('/:id', itineraryController.updateItinerary);
router.delete('/:id', itineraryController.deleteItinerary);

// Generate itinerary days
router.post('/:id/generate-days', itineraryController.generateItineraryDays);

// Generate AI-powered itinerary
router.post('/:id/generate-ai-itinerary', itineraryController.generateAIItinerary);

// Get destination recommendations
router.post('/recommend-destinations', itineraryController.getRecommendedDestinations);

module.exports = router;
