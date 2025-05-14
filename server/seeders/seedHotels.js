const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

// This script will run the collectHotelData.js utility to seed the database
// You only need to run this once to populate the database

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Require the hotel data collection script to run it
require('../utils/collectHotelData');

console.log('Hotel seeder script has started the collection process.');
