const recommendationService = require('../services/recommendationService');
const Place = require('../models/Place');

// Get personalized recommendations
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user ? req.user.id : null;
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// Get recommendations by category
exports.getCategoryRecommendations = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['beach', 'mountain', 'city', 'historical', 'rural'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const recommendations = await recommendationService.getCategoryRecommendations(category);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting category recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category recommendations',
      error: error.message
    });
  }
};

// Get all destinations
exports.getAllDestinations = async (req, res) => {
  try {
    const filters = req.query;
    const destinations = await recommendationService.getAllDestinations(filters);
    
    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error getting all destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get destinations',
      error: error.message
    });
  }
};

// Get destination by ID
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await recommendationService.getDestinationById(id);
    
    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error getting destination by ID:', error);
    
    if (error.message === 'Destination not found') {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get destination details',
      error: error.message
    });
  }
};

/**
 * Get nearby attractions based on user location and interests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNearbyAttractions = async (req, res) => {
  try {
    console.log('Received request for nearby attractions with params:', req.query);
    
    const { 
      latitude, 
      longitude, 
      maxDistance = 15000, 
      interests, 
      limit = 20 
    } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Call the service with parsed parameters
    const attractions = await recommendationService.getNearbyAttractions({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude), 
      maxDistance: parseInt(maxDistance),
      interests: interests ? interests.split(',') : [],
      limit: parseInt(limit)
    });
    
    return res.json({
      success: true,
      count: attractions.length,
      data: attractions
    });
  } catch (error) {
    console.error('Error in getNearbyAttractions controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby attractions',
      error: error.message
    });
  }
};

/**
 * Store user coordinates and preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.storeUserLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, latitude and longitude are required' 
      });
    }
    
    // In a real app, you would store this in your user database
    // For now, just return success
    return res.status(200).json({
      success: true,
      message: 'User location stored successfully'
    });
    
  } catch (error) {
    console.error('Error storing user location:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Add destination to wishlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addToWishlist = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;
    const { destinationId } = req.body;
    
    if (!destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Destination ID is required'
      });
    }
    
    const updatedUser = await recommendationService.addToWishlist(userId, destinationId);
    
    res.status(200).json({
      success: true,
      message: 'Destination added to wishlist',
      data: {
        wishlist: updatedUser.wishlist
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    
    if (error.message === 'Destination not found') {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};
