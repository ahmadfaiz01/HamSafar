const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Pakistan' // Default for existing records
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  mainImage: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  userRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geo queries
HotelSchema.index({ location: '2dsphere' });

// Create index for search by city and country
HotelSchema.index({ city: 'text', country: 'text', name: 'text', address: 'text' });

// Create additional index for case-insensitive searches
HotelSchema.index({ city: 1 });
HotelSchema.index({ country: 1 });

module.exports = mongoose.model('Hotel', HotelSchema);