const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    province: {
      type: String,
      required: true
    },
    city: String
  },
  categories: {
    type: [String],
    enum: ['beach', 'mountain', 'city', 'historical', 'rural'],
    required: true
  },
  description: {
    short: {
      type: String,
      maxlength: 200
    },
    full: String
  },
  activities: [String],
  bestSeasons: {
    type: [String],
    enum: ['spring', 'summer', 'autumn', 'winter']
  },
  budgetCategory: {
    type: String,
    enum: ['budget', 'moderate', 'luxury'],
    default: 'moderate'
  },
  images: [String],
  popularity: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Destination', DestinationSchema);