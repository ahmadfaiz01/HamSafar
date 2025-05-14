const preferenceService = require('../services/preferenceService');

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await preferenceService.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'No preferences found for this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferencesData = req.body;
    
    const updatedPreferences = await preferenceService.updateUserPreferences(userId, preferencesData);
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};
