/**
 * This script seeds the database with sample points of interest
 * Run with: node scripts/seedPointsOfInterest.js
 */

const mongoose = require('mongoose');
const config = require('../config/config');
const PointOfInterest = require('../models/PointOfInterest');

// Sample points of interest across different locations
const seedData = [
  // Delhi region
  {
    name: "India Gate",
    category: "attraction",
    description: "Historic monument in the heart of Delhi",
    location: { type: "Point", coordinates: [77.2293, 28.6129] },
    address: "Rajpath, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.5,
    images: ["https://images.unsplash.com/photo-1587474260584-136574528ed5"]
  },
  {
    name: "Taj Mahal Palace",
    category: "hotel",
    description: "Luxury historic hotel with stunning architecture",
    location: { type: "Point", coordinates: [77.2215, 28.6127] },
    address: "Central Delhi, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1598804702225-f64baf65c152"]
  },
  {
    name: "Karim's Restaurant",
    category: "restaurant",
    description: "Famous for authentic Mughlai cuisine",
    location: { type: "Point", coordinates: [77.2335, 28.6152] },
    address: "Jama Masjid, Old Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"]
  },
  {
    name: "Connaught Place Shopping",
    category: "shopping",
    description: "Popular shopping district with stores and restaurants",
    location: { type: "Point", coordinates: [77.2173, 28.6329] },
    address: "Connaught Place, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.3,
    images: ["https://images.unsplash.com/photo-1611235115922-72d11d7c83d8"]
  },
  {
    name: "Delhi Metro",
    category: "transport",
    description: "Modern rapid transit system serving Delhi",
    location: { type: "Point", coordinates: [77.2090, 28.6139] },
    address: "New Delhi Railway Station, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.0,
    images: ["https://images.unsplash.com/photo-1516834611397-8d633eaec5d0"]
  },
  {
    name: "Red Fort",
    category: "attraction",
    description: "Historic red sandstone fort built in the 17th century",
    location: { type: "Point", coordinates: [77.2410, 28.6562] },
    address: "Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.5,
    images: ["https://images.unsplash.com/photo-1597044731070-34438c88510e"]
  },
  {
    name: "Humayun's Tomb",
    category: "attraction",
    description: "Magnificent tomb built in 1570, a UNESCO World Heritage Site",
    location: { type: "Point", coordinates: [77.2507, 28.5933] },
    address: "Mathura Road, Opposite Dargah Nizamuddin, New Delhi",
    city: "New Delhi",
    country: "India",
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1518309254115-628d6e9a5112"]
  },
  
  // Add points for your current location (these will be examples, replace coordinates with your area)
  {
    name: "Local Coffee Shop",
    category: "restaurant",
    description: "Cozy coffee shop with great ambiance",
    location: { type: "Point", coordinates: [77.2215, 28.6127] }, // Example coordinates, will be near Delhi
    address: "Local Address", 
    city: "Local City",
    country: "India",
    rating: 4.2,
    images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"]
  },
  {
    name: "Neighborhood Park",
    category: "attraction",
    description: "Beautiful local park with walking trails",
    location: { type: "Point", coordinates: [77.2220, 28.6130] }, // Example coordinates, will be near Delhi
    address: "Park Address",
    city: "Local City",
    country: "India",
    rating: 4.0,
    images: ["https://images.unsplash.com/photo-1519331379826-f10be5486c6f"]
  },
  {
    name: "Corner Market",
    category: "shopping",
    description: "Local market with fresh produce and goods",
    location: { type: "Point", coordinates: [77.2225, 28.6133] }, // Example coordinates, will be near Delhi
    address: "Market Address",
    city: "Local City",
    country: "India",
    rating: 3.8,
    images: ["https://images.unsplash.com/photo-1561715402-066968df67a0"]
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');
    
    // First, check how many POIs already exist
    const existingCount = await PointOfInterest.countDocuments();
    console.log(`Found ${existingCount} existing points of interest`);
    
    if (existingCount === 0) {
      // Insert seed data
      const result = await PointOfInterest.insertMany(seedData);
      console.log(`Added ${result.length} points of interest to the database`);
    } else {
      console.log('Database already has points of interest, skipping seeding');
    }
    
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
