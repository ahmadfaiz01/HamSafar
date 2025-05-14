const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const pakistanHotels = require('../data/pakistanHotels');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hamsafar')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed function
async function seedPakistanHotels() {
  try {
    // Check for existing Pakistani hotels
    const existingCount = await Hotel.countDocuments({ country: 'Pakistan' });
    
    if (existingCount > 0) {
      console.log(`${existingCount} Pakistani hotels already exist in the database`);
    } else {
      // Insert the sample data
      await Hotel.insertMany(pakistanHotels);
      console.log(`${pakistanHotels.length} Pakistani hotels added to the database`);
    }
    
    // Disconnect from the database
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding Pakistani hotels:', error);
    process.exit(1);
  }
}

// Run the seeder
seedPakistanHotels();
