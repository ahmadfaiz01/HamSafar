const mongoose = require('mongoose');

const PointOfInterestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['restaurant', 'hotel', 'attraction', 'shopping', 'transport', 'other'],
    default: 'other'
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
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  priceLevel: {
    type: Number,
    min: 1,
    max: 4,
    default: 2
  },
  openingHours: {
    type: String
  },
  website: {
    type: String
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
PointOfInterestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PointOfInterest', PointOfInterestSchema);