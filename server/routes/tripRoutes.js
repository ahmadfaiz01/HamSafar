const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Create a new trip
router.post('/', tripController.createTrip);

// Get all trips for a user
router.get('/user/:userId', tripController.getUserTrips);

// Get a single trip by ID
router.get('/:id', tripController.getTripById);

// Update a trip
router.put('/:id', tripController.updateTrip);

// Delete a trip
router.delete('/:id', tripController.deleteTrip);

module.exports = router;