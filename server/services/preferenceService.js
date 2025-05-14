const UserPreference = require('../models/UserPreference');

// Get user preferences
exports.getUserPreferences = async (userId) => {
  try {
    const preference = await UserPreference.findOne({ userId });
    return preference;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
};

// Update user preferences
exports.updateUserPreferences = async (userId, preferencesData) => {
  try {
    // Normalize and validate data
    const normalizedData = normalizePreferenceData(preferencesData);
    
    // Update or create preferences
    const preferences = await UserPreference.findOneAndUpdate(
      { userId },
      { userId, ...normalizedData },
      { new: true, upsert: true }
    );
    
    return preferences;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Helper function to normalize preference data
function normalizePreferenceData(data) {
  const normalized = {};
  
  // Normalize travelStyles
  if (data.travelStyles) {
    normalized.travelStyles = Array.isArray(data.travelStyles) 
      ? data.travelStyles 
      : [data.travelStyles];
  }
  
  // Normalize activities
  if (data.activities) {
    normalized.activities = Array.isArray(data.activities) 
      ? data.activities 
      : [data.activities];
  }
  
  // Normalize budgetRange
  if (data.budgetRange) {
    normalized.budgetRange = data.budgetRange;
  }
  
  // Normalize preferredSeasons
  if (data.preferredSeasons) {
    normalized.preferredSeasons = Array.isArray(data.preferredSeasons) 
      ? data.preferredSeasons 
      : [data.preferredSeasons];
  }
  
  // Normalize tripDuration
  if (data.tripDuration) {
    normalized.tripDuration = data.tripDuration;
  }
  
  // Normalize destinationTypes
  if (data.destinationTypes) {
    normalized.destinationTypes = Array.isArray(data.destinationTypes) 
      ? data.destinationTypes 
      : [data.destinationTypes];
  }
  
  return normalized;
}
