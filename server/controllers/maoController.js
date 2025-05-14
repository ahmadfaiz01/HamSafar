const User = require('../models/User');
const PointOfInterest = require('../models/PointOfInterest');

// Save user location
exports.saveUserLocation = async (req, res) => {
  try {
    const { userId, coordinates } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid coordinates format' });
    }
    
    // Add new location to user's locations array
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          locations: { 
            coordinates: {
              type: 'Point',
              coordinates
            },
            timestamp: new Date()
          } 
        } 
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ message: 'Location saved successfully' });
  } catch (error) {
    console.error('Error saving user location:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
};

// Get nearby points of interest
exports.getNearbyPointsOfInterest = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000, category } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Coordinates are required' });
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
    
    const nearbyPoints = await PointOfInterest.find(query).limit(50);
    
    res.status(200).json(nearbyPoints);
  } catch (error) {
    console.error('Error finding nearby points of interest:', error);
    res.status(500).json({ error: 'Failed to get nearby points of interest' });
  }
};

// Get points of interest within a bounding box
exports.getPointsInBounds = async (req, res) => {
  try {
    const { sw_lng, sw_lat, ne_lng, ne_lat, category } = req.query;
    
    if (!sw_lng || !sw_lat || !ne_lng || !ne_lat) {
      return res.status(400).json({ error: 'Bounding box coordinates are required' });
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
    
    const pointsInBounds = await PointOfInterest.find(query).limit(100);
    
    res.status(200).json(pointsInBounds);
  } catch (error) {
    console.error('Error finding points in bounds:', error);
    res.status(500).json({ error: 'Failed to get points in bounds' });
  }
};