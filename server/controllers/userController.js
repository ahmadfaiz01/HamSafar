const User = require('../models/User');

// Middleware to validate Firebase UID
const validateFirebaseUid = (uid) => {
  if (!uid || typeof uid !== 'string' || uid.length < 20) {
    throw new Error('Invalid Firebase UID');
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    validateFirebaseUid(firebaseUid);
    
    const user = await User.findOne({ firebaseUid }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to retrieve user profile',
      error: error.toString() 
    });
  }
};

// Create or update user profile
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { 
      firebaseUid, 
      email, 
      displayName, 
      photoURL, 
      preferences, 
      homeLocation 
    } = req.body;
    
    validateFirebaseUid(firebaseUid);
    
    // Validate required fields
    if (!email || !displayName) {
      return res.status(400).json({ message: 'Email and display name are required' });
    }
    
    // Check if user exists
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { firebaseUid },
        { 
          $set: { 
            email, 
            displayName, 
            photoURL: photoURL || user.photoURL, 
            preferences, 
            homeLocation,
            lastActive: new Date()
          }
        },
        { 
          new: true,
          runValidators: true // Ensure schema validations run
        }
      );
    } else {
      // Create new user with explicit createdAt date
      user = new User({
        firebaseUid,
        email,
        displayName,
        photoURL,
        preferences,
        homeLocation,
        createdAt: new Date(),  // Explicitly set the creation date
        lastActive: new Date()
      });
      
      await user.save();
    }
    
    // Exclude version key from response
    const userResponse = user.toObject();
    delete userResponse.__v;
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Create/update user error:', error);
    res.status(400).json({ 
      message: 'Failed to create or update user profile',
      error: error.toString() 
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    const { preferences, location } = req.body;
    
    validateFirebaseUid(firebaseUid);
    
    // Build the update object
    const updateData = {
      preferences: preferences || {},
    };
    
    // Add location if it exists
    if (location) {
      updateData.location = location;
    }
    
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        $set: updateData,
        $currentDate: { lastActive: true }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Exclude version key from response
    const userResponse = user.toObject();
    delete userResponse.__v;
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(400).json({ 
      message: 'Failed to update user preferences',
      error: error.toString() 
    });
  }
};

// Add search to user history
exports.addSearchHistory = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    const { query } = req.body;
    
    validateFirebaseUid(firebaseUid);
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Invalid search query' });
    }
    
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        $push: { 
          searchHistory: { 
            query, 
            timestamp: new Date() 
          } 
        },
        $currentDate: { lastActive: true }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Search history updated',
      searchHistoryLength: user.searchHistory.length 
    });
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(400).json({ 
      message: 'Failed to add search to history',
      error: error.toString() 
    });
  }
};

// Get users with similar preferences (for recommendation system)
exports.getSimilarUsers = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    const limit = parseInt(req.query.limit) || 10;
    
    validateFirebaseUid(firebaseUid);
    
    const similarUsers = await User.findSimilarUsers(firebaseUid, limit);
    
    res.status(200).json(similarUsers);
  } catch (error) {
    console.error('Get similar users error:', error);
    res.status(400).json({ 
      message: 'Failed to find similar users',
      error: error.toString() 
    });
  }
};

// Find nearby users (using geospatial query)
exports.getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query; // maxDistance in meters, default 50km
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const numLongitude = parseFloat(longitude);
    const numLatitude = parseFloat(latitude);
    
    if (isNaN(numLongitude) || isNaN(numLatitude)) {
      return res.status(400).json({ message: 'Invalid coordinate values' });
    }
    
    // Find users near the specified coordinates
    const nearbyUsers = await User.find({
      'homeLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [numLongitude, numLatitude]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('firebaseUid displayName homeLocation photoURL');
    
    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(400).json({ 
      message: 'Failed to find nearby users',
      error: error.toString() 
    });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    
    validateFirebaseUid(firebaseUid);
    
    // Find the user
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Use aggregation to analyze user search history
    const searchAnalytics = await User.aggregate([
      {
        $match: { firebaseUid }
      },
      {
        $unwind: '$searchHistory'
      },
      {
        $group: {
          _id: '$searchHistory.query',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchHistory.timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.status(200).json({
      user: {
        firebaseUid: user.firebaseUid,
        displayName: user.displayName,
        email: user.email
      },
      searchAnalytics,
      accountAge: {
        days: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      },
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(400).json({ 
      message: 'Failed to retrieve user analytics',
      error: error.toString() 
    });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    
    validateFirebaseUid(firebaseUid);
    
    const user = await User.findOneAndDelete({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: {
        firebaseUid: user.firebaseUid,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({ 
      message: 'Failed to delete user account',
      error: error.toString() 
    });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    
    validateFirebaseUid(firebaseUid);
    
    // Check if the file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Construct URL to access the image - simplify this to a relative URL
    // This makes it work regardless of environment (localhost, production, etc.)
    const photoURL = `/uploads/profiles/${req.file.filename}`;
    
    // Update user record with the new photo URL
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        $set: { photoURL },
        $currentDate: { lastActive: true }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Include the full URL in the response for client-side use
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fullPhotoURL = `${serverUrl}${photoURL}`;
    
    res.status(200).json({ 
      message: 'Profile image uploaded successfully',
      photoURL: fullPhotoURL // Send the absolute URL to the client
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(400).json({ 
      message: 'Failed to upload profile image',
      error: error.toString() 
    });
  }
};