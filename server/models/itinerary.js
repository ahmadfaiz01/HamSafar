const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  destinations: [{
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    name: String,
    location: String,
    order: Number
  }],
  days: [{
    dayNumber: Number,
    date: Date,
    accommodation: {
      name: String,
      location: String,
      cost: Number,
      notes: String
    },
    activities: [{
      name: String,
      location: String,
      time: String,
      cost: Number,
      notes: String
    }],
    transportation: {
      type: String,
      from: String,
      to: String,
      cost: Number,
      notes: String
    },
    meals: [{
      type: String, // breakfast, lunch, dinner
      location: String,
      cost: Number,
      notes: String
    }],
    dailyBudget: Number,
    notes: String
  }],
  status: {
    type: String,
    enum: ['draft', 'planned', 'ongoing', 'completed'],
    default: 'draft'
  },
  travelPreferences: {
    travelStyle: {
      type: String,
      enum: ['budget', 'standard', 'luxury']
    },
    transportationPreference: {
      type: String,
      enum: ['public', 'rental', 'private']
    },
    activityLevel: {
      type: String,
      enum: ['relaxed', 'moderate', 'active']
    },
    accommodationType: {
      type: String,
      enum: ['hotel', 'hostel', 'resort', 'guesthouse', 'camping']
    }
  },
  aiRecommendations: {
    suggestedStops: [{
      name: String,
      reason: String,
      location: String
    }],
    optimizedRoute: String,
    budgetTips: [String],
    weatherConsiderations: String,
    timingRecommendations: String
  }
}, { timestamps: true });

// Calculate the trip duration in days
ItinerarySchema.virtual('tripDuration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end days
});

// Calculate the total cost of the itinerary
ItinerarySchema.virtual('totalCost').get(function() {
  let total = 0;
  if (this.days && this.days.length > 0) {
    this.days.forEach(day => {
      // Add accommodation cost
      if (day.accommodation && day.accommodation.cost) {
        total += day.accommodation.cost;
      }
      
      // Add activities costs
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach(activity => {
          if (activity.cost) total += activity.cost;
        });
      }
      
      // Add transportation cost
      if (day.transportation && day.transportation.cost) {
        total += day.transportation.cost;
      }
      
      // Add meals costs
      if (day.meals && day.meals.length > 0) {
        day.meals.forEach(meal => {
          if (meal.cost) total += meal.cost;
        });
      }
    });
  }
  return total;
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);