const recommendationService = require('../services/recommendationService');

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

// Add destination to wishlist
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
