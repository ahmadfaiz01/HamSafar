const mongoose = require('mongoose');

// IMPORTANT: This is the fix - explicitly define the MongoDB Atlas URI
// Do NOT use process.env.MONGODB_URI here since it seems to be resolving to localhost
const MONGODB_URI = 'mongodb+srv://itsahmadfaiz:lQgIw7Zus5McHvbd@hamsafar.itrl9eo.mongodb.net/hamsafar';

/**
 * Initialize MongoDB connection with error handling and logging
 * @returns {Promise} MongoDB connection
 */
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas using URI:', 
      MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));
    
    // Remove deprecated options
    const connection = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    
    return connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Mongoose connection disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };