const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripDaySchema = new Schema({
  day: { type: Number, required: true },
  activities: [{
    name: { type: String, required: true },
    category: { type: String },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    startTime: String,
    endTime: String,
    description: String,
    cost: Number
  }]
});

const tripSchema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  destination: {
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: [tripDaySchema],
  totalBudget: { type: Number },
  spentBudget: { type: Number, default: 0 },
  notes: { type: String },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  // Categorize trips for interest-based recommendations
  categories: [{ type: String }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

tripSchema.index({ "destination.city": "text", "destination.country": "text" });

module.exports = mongoose.model('Trip', tripSchema);