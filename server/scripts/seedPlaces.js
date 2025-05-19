require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Place = require('../models/Place');

// Sample data of Pakistani tourist attractions
const placesData = [
  // ISLAMABAD
  {
    name: "Faisal Mosque",
    description: "The Faisal Mosque is the national mosque of Pakistan located in capital city Islamabad. It is the fifth-largest mosque in the world and the largest within South Asia.",
    category: "Religious",
    location: {
      type: "Point",
      coordinates: [73.0372, 33.7295] // [longitude, latitude]
    },
    address: "Shah Faisal Ave, E-8, Islamabad",
    city: "Islamabad",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Faisal_Mosque_%28full_view%29.jpg/1280px-Faisal_Mosque_%28full_view%29.jpg",
    rating: 4.8,
    tags: ["mosque", "landmark", "architecture", "prayer"],
    priceLevel: 1
  },
  {
    name: "Pakistan Monument",
    description: "The Pakistan Monument is a national monument representing the nation's history, located in Islamabad. The monument was constructed to symbolize the unity of the Pakistani people.",
    category: "Historical",
    location: {
      type: "Point",
      coordinates: [73.0666, 33.6936]
    },
    address: "Shakarparian Hills, Islamabad",
    city: "Islamabad",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Pakistan_Monument_at_Night.jpg/1280px-Pakistan_Monument_at_Night.jpg",
    rating: 4.7,
    tags: ["monument", "history", "architecture", "sightseeing"],
    priceLevel: 1
  },
  {
    name: "Monal Restaurant",
    description: "The Monal is a popular restaurant located on the Margalla Hills offering panoramic views of Islamabad along with Pakistani and international cuisine.",
    category: "Restaurant",
    location: {
      type: "Point",
      coordinates: [73.0757, 33.7493]
    },
    address: "Pir Sohawa Rd, Islamabad",
    city: "Islamabad",
    imageUrl: "https://live.staticflickr.com/5599/15335814747_df1338e030_b.jpg",
    rating: 4.5,
    tags: ["dining", "view", "pakistani cuisine", "outdoor seating"],
    priceLevel: 3
  },
  {
    name: "Daman-e-Koh",
    description: "Daman-e-Koh is a viewing point and hill top garden north of Islamabad, offering a panoramic view of the city, especially the Faisal Mosque.",
    category: "Viewpoint",
    location: {
      type: "Point",
      coordinates: [73.0566, 33.7444]
    },
    address: "Margalla Hills, Islamabad",
    city: "Islamabad",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Islamabad_From_Daman-e-Koh.jpg",
    rating: 4.6,
    tags: ["viewpoint", "nature", "sightseeing", "photography"],
    priceLevel: 1
  },
  
  // LAHORE
  {
    name: "Badshahi Mosque",
    description: "The Badshahi Mosque is a Mughal-era mosque in Lahore, Pakistan. It is the second largest mosque in Pakistan and South Asia and the 5th largest mosque in the world.",
    category: "Historical",
    location: {
      type: "Point",
      coordinates: [74.3107, 31.5882]
    },
    address: "Walled City, Lahore",
    city: "Lahore",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Badshahi_Mosque_front_picture.jpg/1280px-Badshahi_Mosque_front_picture.jpg",
    rating: 4.9,
    tags: ["mosque", "mughal", "architecture", "history"],
    priceLevel: 1
  },
  {
    name: "Lahore Fort",
    description: "The Lahore Fort is a citadel in the city of Lahore. The fortress is located at the northern end of walled city Lahore, and spreads over an area greater than 20 hectares.",
    category: "Historical",
    location: {
      type: "Point",
      coordinates: [74.3152, 31.5882]
    },
    address: "Fort Rd, Walled City, Lahore",
    city: "Lahore",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lahore_Fort_view.jpg/1280px-Lahore_Fort_view.jpg",
    rating: 4.7,
    tags: ["fort", "mughal", "history", "architecture"],
    priceLevel: 2
  },
  
  // KARACHI
  {
    name: "Clifton Beach",
    description: "Clifton Beach is a public beach located in Karachi. It is one of the most popular beaches in Pakistan and a major tourist attraction in the city.",
    category: "Beach",
    location: {
      type: "Point",
      coordinates: [67.0099, 24.7936]
    },
    address: "Clifton, Karachi",
    city: "Karachi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/An_aerial_view_of_Clifton_Beach_%28cropped%29.jpg",
    rating: 3.9,
    tags: ["beach", "seaside", "camel rides", "entertainment"],
    priceLevel: 1
  },
  {
    name: "Mazar-e-Quaid",
    description: "Mazar-e-Quaid is the tomb of the founder of Pakistan, Muhammad Ali Jinnah. It is an iconic symbol of Karachi throughout the world.",
    category: "Historical",
    location: {
      type: "Point",
      coordinates: [67.0384, 24.8761]
    },
    address: "M.A. Jinnah Road, Karachi",
    city: "Karachi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mazar_e_Quaid.JPG/1280px-Mazar_e_Quaid.JPG",
    rating: 4.7,
    tags: ["mausoleum", "history", "architecture", "memorial"],
    priceLevel: 1
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Drop existing collection if it exists
    try {
      await mongoose.connection.db.dropCollection('places');
      console.log('Dropped existing places collection');
    } catch (err) {
      console.log('No existing collection to drop or error:', err.message);
    }
    
    // Insert places
    console.log(`Inserting ${placesData.length} places...`);
    const result = await Place.insertMany(placesData);
    console.log(`${result.length} places inserted successfully`);
    
    // Create 2dsphere index
    await Place.collection.createIndex({ location: '2dsphere' });
    console.log('Created 2dsphere index for geospatial queries');
    
    // Test a simple query to confirm everything works
    const testPlaces = await Place.find().limit(2);
    console.log(`Test query returned ${testPlaces.length} places:`);
    testPlaces.forEach(place => {
      console.log(`- ${place.name} (${place.city})`);
    });
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
  }
};

// Run the seeder
seedDatabase();