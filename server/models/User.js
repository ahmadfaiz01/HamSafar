const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const UserSchema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true // Index for faster queries by Firebase UID
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Index for faster authentication queries
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true
  },  // Add location as a string field
  preferences: {
    tripTypes: [{
      type: String,
      trim: true
    }],
    activities: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      trim: true
    }],
    climate: [{
      type: String,
      trim: true
    }],
    budget: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      default: 'moderate'
    }
  },
  homeLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  searchHistory: [{
    query: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // User preferences and interests
  interests: [{
    category: String,
    weight: { type: Number, default: 1 }
  }],
  // User locations history for location-based recommendations
  locations: [{
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now }
  }],
  // Saved trips
  savedTrips: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip' 
  }]
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries on homeLocation
UserSchema.index({ 'homeLocation.coordinates': '2dsphere' });

// Create a TTL index for searchHistory to auto-expire old entries after 60 days
UserSchema.index({ 'searchHistory.timestamp': 1 }, { expireAfterSeconds: 5184000 });

// Create compound index for optimizing user preferences queries
UserSchema.index({ 'preferences.travelStyle': 1, 'preferences.preferredActivities': 1 });

// Pre-save middleware to validate and normalize data
UserSchema.pre('save', function(next) {
  // Normalize email
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Ensure coordinates are valid
  if (this.homeLocation && this.homeLocation.coordinates) {
    const [lon, lat] = this.homeLocation.coordinates;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      this.homeLocation.coordinates = [0, 0];
    }
  }
  
  next();
});

// Static method to find similar users
UserSchema.statics.findSimilarUsers = async function(userId, limit = 10) {
  const user = await this.findOne({ firebaseUid: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return this.aggregate([
    {
      $match: {
        firebaseUid: { $ne: userId }, // Exclude the current user
        'preferences.travelStyle': user.preferences.travelStyle
      }
    },
    {
      $addFields: {
        commonActivities: {
          $size: {
            $setIntersection: ['$preferences.preferredActivities', user.preferences.preferredActivities]
          }
        }
      }
    },
    {
      $match: {
        commonActivities: { $gt: 0 } // At least one common preferred activity
      }
    },
    {
      $sort: { commonActivities: -1 } // Sort by most common activities
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 0,
        firebaseUid: 1,
        displayName: 1,
        commonActivities: 1,
        preferences: 1,
        photoURL: 1
      }
    }
  ]);
};

module.exports = mongoose.model('User', UserSchema);