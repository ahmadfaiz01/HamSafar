const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for verification'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function verifyHotelData() {
  try {
    // Check total number of hotels
    const totalHotels = await Hotel.countDocuments();
    console.log(`Total hotels in database: ${totalHotels}`);
    
    // Check Pakistan hotels
    const pakistanHotels = await Hotel.countDocuments({ country: /pakistan/i });
    console.log(`Hotels in Pakistan: ${pakistanHotels}`);
    
    // Check hotels by city
    const lahoreHotels = await Hotel.countDocuments({ city: /lahore/i });
    console.log(`Hotels in Lahore: ${lahoreHotels}`);
    
    const karachiHotels = await Hotel.countDocuments({ city: /karachi/i });
    console.log(`Hotels in Karachi: ${karachiHotels}`);
    
    const islamabadHotels = await Hotel.countDocuments({ city: /islamabad/i });
    console.log(`Hotels in Islamabad: ${islamabadHotels}`);
    
    // Print a sample hotel to verify data structure
    const sampleHotel = await Hotel.findOne();
    console.log('\nSample hotel data:');
    console.log(JSON.stringify(sampleHotel, null, 2));
    
    // Check if search is working
    const searchTest = await Hotel.find({ city: /lahore/i });
    console.log(`\nSearch test for 'lahore' returned ${searchTest.length} hotels`);
    if (searchTest.length > 0) {
      console.log('First result:', searchTest[0].name, 'in', searchTest[0].city);
    }
    
  } catch (error) {
    console.error('Error verifying hotel data:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

verifyHotelData();
