const PointOfInterest = require('../models/PointOfInterest');
const User = require('../models/User');
const UserLocation = require('../models/UserLocation');
const SavedPlace = require('../models/SavedPlace');

/**
 * Save user's current location
 * POST /api/locations
 */
exports.saveUserLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude, timestamp } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, latitude, and longitude'
      });
    }
    
    // Create a new location record
    const userLocation = new UserLocation({
      userId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      timestamp: timestamp || new Date()
    });
    
    await userLocation.save();
    
    // Update user's last known location in their profile
    await User.findOneAndUpdate(
      { firebaseUid: userId },
      { 
        $set: { 
          'homeLocation.coordinates': [longitude, latitude],
          lastActive: new Date()
        } 
      }
    );
    
    res.status(201).json({
      success: true,
      data: userLocation
    });
  } catch (error) {
    console.error('Error saving user location:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get nearby points of interest
 * GET /api/locations/nearby
 */
exports.getNearbyPointsOfInterest = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000, category } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide longitude and latitude'
      });
    }
    
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    const pointsOfInterest = await PointOfInterest.find(query);
    
    res.status(200).json({
      success: true,
      count: pointsOfInterest.length,
      data: pointsOfInterest
    });
  } catch (error) {
    console.error('Error getting nearby points of interest:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get points of interest within map bounds
 * GET /api/locations/bounds
 */
exports.getPointsInBounds = async (req, res) => {
  try {
    const { sw_lng, sw_lat, ne_lng, ne_lat, category } = req.query;
    
    if (!sw_lng || !sw_lat || !ne_lng || !ne_lat) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all bounds coordinates: sw_lng, sw_lat, ne_lng, ne_lat'
      });
    }
    
    const query = {
      location: {
        $geoWithin: {
          $box: [
            [parseFloat(sw_lng), parseFloat(sw_lat)],
            [parseFloat(ne_lng), parseFloat(ne_lat)]
          ]
        }
      }
    };
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    const pointsOfInterest = await PointOfInterest.find(query);
    
    res.status(200).json({
      success: true,
      count: pointsOfInterest.length,
      data: pointsOfInterest
    });
  } catch (error) {
    console.error('Error getting points in bounds:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Save a place to user's saved places
 * POST /api/locations/saved-places
 */
exports.savePlace = async (req, res) => {
  try {
    const { userId, placeId, name, address, location, rating, photo, category, notes } = req.body;
    
    if (!userId || !name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, name, and location'
      });
    }
    
    // Check if place is already saved by this user
    const existingPlace = await SavedPlace.findOne({ userId, placeId });
    
    if (existingPlace) {
      return res.status(400).json({
        success: false,
        error: 'Place already saved by this user'
      });
    }
    
    // Create new saved place
    const savedPlace = new SavedPlace({
      userId,
      placeId,
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      rating,
      photo,
      category,
      notes
    });
    
    await savedPlace.save();
    
    res.status(201).json({
      success: true,
      data: savedPlace
    });
  } catch (error) {
    console.error('Error saving place:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get user's saved places
 * GET /api/locations/saved-places/:userId
 */
exports.getSavedPlaces = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId'
      });
    }
    
    const savedPlaces = await SavedPlace.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: savedPlaces.length,
      data: savedPlaces
    });
  } catch (error) {
    console.error('Error getting saved places:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a saved place
 * DELETE /api/locations/saved-places/:placeId
 */
exports.deleteSavedPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const deletedPlace = await SavedPlace.findByIdAndDelete(placeId);
    
    if (!deletedPlace) {
      return res.status(404).json({
        success: false,
        error: 'Saved place not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting saved place:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get user location history
 * GET /api/locations/user/:userId
 */
exports.getUserLocationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId'
      });
    }
    
    const locationHistory = await UserLocation.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: locationHistory.length,
      data: locationHistory
    });
  } catch (error) {
    console.error('Error getting user location history:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get location based recommendations
 * GET /api/locations/recommendations
 */
exports.getLocationRecommendations = async (req, res) => {
  try {
    const { longitude, latitude, userId } = req.query;
    
    if ((!longitude || !latitude) && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either coordinates or userId'
      });
    }
    
    let userLocation;
    
    // If userId is provided, get their most recent location
    if (userId) {
      const userLocationRecord = await UserLocation.findOne({ userId })
        .sort({ timestamp: -1 });
      
      if (userLocationRecord) {
        userLocation = userLocationRecord.location.coordinates;
      }
    } else {
      userLocation = [parseFloat(longitude), parseFloat(latitude)];
    }
    
    if (!userLocation) {
      return res.status(404).json({
        success: false,
        error: 'No location found for this user'
      });
    }
    
    // Get recommendations based on highest-rated POIs
    const recommendations = await PointOfInterest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userLocation
          },
          $maxDistance: 50000 // 50km
        }
      }
    })
    .sort({ rating: -1 })
    .limit(10);
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting location recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
