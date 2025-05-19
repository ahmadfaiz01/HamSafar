const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: String,
  city: {
    type: String,
    required: true
  },
  imageUrl: String,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  tags: [String],
  priceLevel: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
placeSchema.index({ location: "2dsphere" });

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;