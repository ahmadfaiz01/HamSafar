const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/UserController');
const destinationController = require('../controllers/destinationController');
const poiController = require('../controllers/poiController');
const itineraryController = require('../controllers/itineraryController');
const weatherController = require('../controllers/weatherController');
const analyticsController = require('../controllers/analyticsController');
const recommendationController = require('../controllers/recommendationController');
const geospatialController = require('../controllers/geospatialController');

// Middleware for authentication
const authMiddleware = require('../middleware/auth');

// User routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.get('/users/profile/:id', authMiddleware, userController.getUserProfile);
router.put('/users/profile/:id', authMiddleware, userController.updateUserProfile);
router.get('/users/preferences/:id', authMiddleware, userController.getUserPreferences);
router.put('/users/preferences/:id', authMiddleware, userController.updateUserPreferences);

// Destination routes
router.get('/destinations', destinationController.getAllDestinations);
router.get('/destinations/:id', destinationController.getDestinationById);
router.post('/destinations', authMiddleware, destinationController.createDestination);
router.put('/destinations/:id', authMiddleware, destinationController.updateDestination);
router.delete('/destinations/:id', authMiddleware, destinationController.deleteDestination);
router.get('/destinations/search/text', destinationController.searchDestinations);
router.get('/destinations/country/:country', destinationController.getDestinationsByCountry);
router.get('/destinations/category/:category', destinationController.getDestinationsByCategory);

// Point of Interest routes
router.get('/pois', poiController.getAllPOIs);
router.get('/pois/:id', poiController.getPOIById);
router.get('/pois/destination/:destinationId', poiController.getPOIsByDestination);
router.post('/pois', authMiddleware, poiController.createPOI);
router.put('/pois/:id', authMiddleware, poiController.updatePOI);
router.delete('/pois/:id', authMiddleware, poiController.deletePOI);
router.get('/pois/type/:type', poiController.getPOIsByType);
router.get('/pois/search/text', poiController.searchPOIs);

// Itinerary routes
router.get('/itineraries/user/:userId', authMiddleware, itineraryController.getUserItineraries);
router.get('/itineraries/:id', authMiddleware, itineraryController.getItineraryById);
router.post('/itineraries', authMiddleware, itineraryController.createItinerary);
router.put('/itineraries/:id', authMiddleware, itineraryController.updateItinerary);
router.delete('/itineraries/:id', authMiddleware, itineraryController.deleteItinerary);
router.get('/itineraries/public', itineraryController.getPublicItineraries);
router.put('/itineraries/:id/visibility', authMiddleware, itineraryController.toggleItineraryVisibility);
router.post('/itineraries/:id/destinations', authMiddleware, itineraryController.addDestinationToItinerary);
router.delete('/itineraries/:id/destinations/:destinationId', authMiddleware, itineraryController.removeDestinationFromItinerary);
router.post('/itineraries/:id/pois', authMiddleware, itineraryController.addPOIToItinerary);
router.delete('/itineraries/:id/pois/:poiId', authMiddleware, itineraryController.removePOIFromItinerary);

// Weather routes
router.get('/weather/destination/:destinationId', weatherController.getWeatherForDestination);
router.get('/weather/forecast/:destinationId', weatherController.getWeatherForecast);
router.post('/weather/update', authMiddleware, weatherController.updateWeatherData);

// Analytics routes
router.get('/analytics/popular-destinations', analyticsController.getPopularDestinations);
router.get('/analytics/user-activity', authMiddleware, analyticsController.getUserActivity);
router.get('/analytics/destination-trends', analyticsController.getDestinationTrends);
router.get('/analytics/seasonal-patterns', analyticsController.getSeasonalPatterns);
router.get('/analytics/user-demographics', authMiddleware, analyticsController.getUserDemographics);
router.get('/analytics/travel-patterns', analyticsController.getTravelPatterns);

// Recommendation routes
router.get('/recommendations/destinations/:userId', authMiddleware, recommendationController.getDestinationRecommendations);
router.get('/recommendations/pois/:userId/:destinationId', authMiddleware, recommendationController.getPoiRecommendations);
router.get('/recommendations/similar-itineraries/:itineraryId', recommendationController.getSimilarItineraries);
router.get('/recommendations/trending', recommendationController.getTrendingDestinations);

// Geospatial routes
router.get('/geo/nearby', geospatialController.findNearbyPOIs);
router.get('/geo/bounds', geospatialController.findPOIsInBounds);
router.get('/geo/category', geospatialController.findPOIsByCategory);
router.get('/geo/distance', geospatialController.calculateDistance);
router.get('/geo/region', geospatialController.findDestinationsInRegion);

module.exports = router;