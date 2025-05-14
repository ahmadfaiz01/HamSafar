const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Weather Data schema
const WeatherDataSchema = new Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true // Index for city-based queries
    },
    country: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    temperature: {
      min: Number,
      max: Number,
      average: Number
    },
    humidity: Number,
    windSpeed: Number,
    windDirection: String,
    precipitation: {
      probability: Number, // 0-100%
      amount: Number // in mm
    },
    weatherCondition: {
      main: String, // e.g., "Clear", "Clouds", "Rain"
      description: String,
      icon: String // Icon code from weather API
    }
  }],
  historicalData: {
    averageTemperature: {
      january: Number,
      february: Number,
      march: Number,
      april: Number,
      may: Number,
      june: Number,
      july: Number,
      august: Number,
      september: Number,
      october: Number,
      november: Number,
      december: Number
    },
    averageRainfall: {
      january: Number,
      february: Number,
      march: Number,
      april: Number,
      may: Number,
      june: Number,
      july: Number,
      august: Number,
      september: Number,
      october: Number,
      november: Number,
      december: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
WeatherDataSchema.index({ 'location.coordinates': '2dsphere' });

// Create compound index for location and date
WeatherDataSchema.index({ 'location.city': 1, date: 1 });

// TTL index to automatically remove outdated weather forecasts (expire after 3 days)
WeatherDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

module.exports = mongoose.model('WeatherData', WeatherDataSchema);