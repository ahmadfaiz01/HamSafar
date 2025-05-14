const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');

/**
 * Create a new itinerary
 */
exports.createItinerary = async (userId, itineraryData) => {
  try {
    const itinerary = new Itinerary({
      user: userId,
      ...itineraryData
    });
    
    return await itinerary.save();
  } catch (error) {
    console.error('Error creating itinerary:', error);
    throw error;
  }
};

/**
 * Get all itineraries for a user
 */
exports.getUserItineraries = async (userId) => {
  try {
    return await Itinerary.find({ user: userId })
      .select('title startDate endDate status destinations totalBudget')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching user itineraries:', error);
    throw error;
  }
};

/**
 * Get a specific itinerary by ID
 */
exports.getItineraryById = async (itineraryId, userId) => {
  try {
    const itinerary = await Itinerary.findOne({ 
      _id: itineraryId, 
      user: userId 
    }).populate('destinations.destinationId');
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }
    
    return itinerary;
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
};

/**
 * Update an existing itinerary
 */
exports.updateItinerary = async (itineraryId, userId, updates) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: itineraryId, user: userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }
    
    return itinerary;
  } catch (error) {
    console.error('Error updating itinerary:', error);
    throw error;
  }
};

/**
 * Delete an itinerary
 */
exports.deleteItinerary = async (itineraryId, userId) => {
  try {
    const result = await Itinerary.findOneAndDelete({ 
      _id: itineraryId, 
      user: userId 
    });
    
    if (!result) {
      throw new Error('Itinerary not found');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    throw error;
  }
};

/**
 * Generate itinerary days with schedule
 */
exports.generateItineraryDays = async (itineraryId, userId) => {
  try {
    // Get the itinerary
    const itinerary = await Itinerary.findOne({ 
      _id: itineraryId, 
      user: userId 
    });
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }
    
    // Calculate duration
    const duration = itinerary.tripDuration;
    const destinations = itinerary.destinations || [];
    const totalBudget = itinerary.totalBudget || 0;
    
    // Create empty day entries
    const days = [];
    let currentDate = new Date(itinerary.startDate);
    
    for (let i = 0; i < duration; i++) {
      const dayDate = new Date(currentDate);
      
      days.push({
        dayNumber: i + 1,
        date: dayDate,
        accommodation: {},
        activities: [],
        transportation: {},
        meals: [],
        dailyBudget: Math.round(totalBudget / duration),
        notes: ''
      });
      
      // Increment date by 1 day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Update itinerary with empty days
    const updatedItinerary = await Itinerary.findOneAndUpdate(
      { _id: itineraryId },
      { days },
      { new: true }
    );
    
    return updatedItinerary;
  } catch (error) {
    console.error('Error generating itinerary days:', error);
    throw error;
  }
};

/**
 * Get recommendations for destinations based on preferences
 */
exports.getRecommendedDestinations = async (preferences) => {
  try {
    const { budget, tripDuration, interests } = preferences;
    
    // Building query based on preferences
    let query = {};
    
    if (budget) {
      if (budget === 'low') {
        query.budgetCategory = 'budget';
      } else if (budget === 'medium') {
        query.budgetCategory = 'moderate';
      } else if (budget === 'high') {
        query.budgetCategory = 'luxury';
      }
    }
    
    if (interests && interests.length > 0) {
      query.categories = { $in: interests };
    }
    
    // Get destinations that match the query
    const destinations = await Destination.find(query)
      .sort({ popularity: -1 })
      .limit(10);
    
    return destinations;
  } catch (error) {
    console.error('Error getting recommended destinations:', error);
    throw error;
  }
};
