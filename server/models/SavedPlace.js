const mongoose = require('mongoose');

const SavedPlaceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  placeId: {
    type: String
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  photo: {
    type: String
  },
  category: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
SavedPlaceSchema.index({ location: '2dsphere' });

// Compound index for faster user-specific queries
SavedPlaceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedPlace', SavedPlaceSchema);
