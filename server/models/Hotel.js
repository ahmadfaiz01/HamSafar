const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  amenities: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  rooms: {
    type: [
      {
        type: { type: String, required: true },
        price: { type: Number, required: true },
        amenities: { type: [String], default: [] }
      }
    ],
    default: []
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  reviews: {
    type: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

// Add text indexes for searching
hotelSchema.index({ name: 'text', description: 'text', city: 'text' });

// Pre-save middleware to update the 'updated' field on document updates
hotelSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;