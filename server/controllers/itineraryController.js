const itineraryService = require('../services/itineraryService');
const geminiItineraryService = require('../services/geminiItineraryService');

/**
 * Create a new itinerary
 */
exports.createItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const itineraryData = req.body;
    
    const itinerary = await itineraryService.createItinerary(userId, itineraryData);
    
    res.status(201).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create itinerary',
      error: error.message
    });
  }
};

/**
 * Get all itineraries for the authenticated user
 */
exports.getUserItineraries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const itineraries = await itineraryService.getUserItineraries(userId);
    
    res.status(200).json({
      success: true,
      data: itineraries
    });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries',
      error: error.message
    });
  }
};

/**
 * Get a specific itinerary by ID
 */
exports.getItineraryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const itinerary = await itineraryService.getItineraryById(id, userId);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    
    if (error.message === 'Itinerary not found') {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary',
      error: error.message
    });
  }
};

/**
 * Update an existing itinerary
 */
exports.updateItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    
    const itinerary = await itineraryService.updateItinerary(id, userId, updates);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    
    if (error.message === 'Itinerary not found') {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary',
      error: error.message
    });
  }
};

/**
 * Delete an itinerary
 */
exports.deleteItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await itineraryService.deleteItinerary(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    
    if (error.message === 'Itinerary not found') {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary',
      error: error.message
    });
  }
};

/**
 * Generate empty itinerary days
 */
exports.generateItineraryDays = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const itinerary = await itineraryService.generateItineraryDays(id, userId);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error generating itinerary days:', error);
    
    if (error.message === 'Itinerary not found') {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary days',
      error: error.message
    });
  }
};

/**
 * Generate AI-powered itinerary
 */
exports.generateAIItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const itinerary = await geminiItineraryService.generateAIItinerary(id, userId);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    
    if (error.message === 'Itinerary not found') {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI itinerary',
      error: error.message
    });
  }
};

/**
 * Get recommended destinations for itinerary
 */
exports.getRecommendedDestinations = async (req, res) => {
  try {
    const preferences = req.body;
    
    const destinations = await itineraryService.getRecommendedDestinations(preferences);
    
    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error getting recommended destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get destination recommendations',
      error: error.message
    });
  }
};