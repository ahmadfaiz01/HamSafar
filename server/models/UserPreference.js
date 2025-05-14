const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  travelStyles: {
    type: [String],
    enum: ['adventure', 'relaxation', 'cultural', 'family', 'budget', 'luxury'],
    default: []
  },
  activities: {
    type: [String],
    default: []
  },
  budgetRange: {
    type: String,
    enum: ['budget', 'moderate', 'luxury'],
    default: 'moderate'
  },
  preferredSeasons: {
    type: [String],
    enum: ['spring', 'summer', 'autumn', 'winter'],
    default: []
  },
  tripDuration: {
    type: String,
    enum: ['weekend', 'week', 'twoWeeks', 'month'],
    default: 'week'
  },
  destinationTypes: {
    type: [String],
    enum: ['beach', 'mountain', 'city', 'historical', 'rural'],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
