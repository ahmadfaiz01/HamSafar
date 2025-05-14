const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

// MongoDB connection string - use environment variable
const mongoUri = process.env.MONGODB_URI;

// Get nearby locations
router.get('/nearby', async (req, res) => {
  try {
    // Parse query parameters
    const latitude = parseFloat(req.query.lat);
    const longitude = parseFloat(req.query.lng);
    const maxDistance = parseInt(req.query.distance) || 10000; // Default to 10km
    const interests = req.query.interests ? req.query.interests.split(',') : [];

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    // Query locations collection
    const db = client.db('hamsafar');
    const locationsCollection = db.collection('locations');

    // Build query with geospatial operator
    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude] order
          },
          $maxDistance: maxDistance
        }
      }
    };

    // Add interests filter if provided
    if (interests.length > 0) {
      query.tags = { $in: interests };
    }

    // Execute query with limit
    const locations = await locationsCollection.find(query)
      .limit(20)
      .toArray();

    // Calculate distance for each location and format response
    const formattedLocations = locations.map(location => {
      // Calculate straight-line distance in meters
      const distance = calculateDistance(
        latitude, 
        longitude, 
        location.location.coordinates[1], 
        location.location.coordinates[0]
      );

      return {
        id: location._id.toString(),
        name: location.name,
        category: location.category,
        description: location.description,
        imageUrl: location.imageUrl,
        coordinates: {
          latitude: location.location.coordinates[1],
          longitude: location.location.coordinates[0]
        },
        tags: location.tags || [],
        distance: Math.round(distance)
      };
    });

    // Close MongoDB connection
    await client.close();

    res.json(formattedLocations);
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to wishlist
router.post('/wishlist', auth, async (req, res) => {
  try {
    const { placeId } = req.body;
    const userId = req.user.id;

    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('hamsafar');
    
    // Get location details
    const locationsCollection = db.collection('locations');
    const location = await locationsCollection.findOne({ _id: new ObjectId(placeId) });
    
    if (!location) {
      await client.close();
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Add to user's wishlist
    const wishlistCollection = db.collection('wishlists');
    
    // Check if already in wishlist
    const existing = await wishlistCollection.findOne({ 
      userId: userId,
      placeId: placeId 
    });
    
    if (existing) {
      await client.close();
      return res.status(400).json({ message: 'Already in wishlist' });
    }
    
    // Add to wishlist
    const result = await wishlistCollection.insertOne({
      userId: userId,
      placeId: placeId,
      name: location.name,
      category: location.category,
      imageUrl: location.imageUrl,
      description: location.description,
      coordinates: location.location.coordinates,
      addedAt: new Date()
    });
    
    // Close MongoDB connection
    await client.close();
    
    res.status(201).json({ message: 'Added to wishlist', id: result.insertedId });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate distance between coordinates in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

module.exports = router;