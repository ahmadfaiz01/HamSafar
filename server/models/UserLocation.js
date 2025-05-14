const mongoose = require('mongoose');

const UserLocationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
UserLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('UserLocation', UserLocationSchema);
