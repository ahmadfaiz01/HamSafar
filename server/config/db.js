'use strict';

const mongoose = require('mongoose');
const indexManager = require('./utils/indexManager');

// Configuration options for MongoDB connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

/**
 * Initialize MongoDB connection with error handling and logging
 * @param {string} uri - MongoDB connection string
 * @returns {Promise} MongoDB connection
 */
const connectDB = async (uri) => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, mongooseOptions);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up global mongoose settings
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    // Create indexes on startup if not in production
    if (process.env.NODE_ENV !== 'production') {
      await indexManager.createIndexes();
    }
    
    // Log successful connection
    console.log('All database configurations completed successfully');
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise} Disconnect promise
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Check MongoDB connection status
 * @returns {Object} Connection status information
 */
const checkConnectionStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    state: getConnectionStateName(mongoose.connection.readyState),
    host: mongoose.connection.host || 'Not connected',
    database: mongoose.connection.name || 'Not connected',
    collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0,
    models: Object.keys(mongoose.models).length
  };
};

/**
 * Get readable name for connection state
 * @param {Number} state - Mongoose connection state
 * @returns {String} Connection state name
 */
const getConnectionStateName = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[state] || 'unknown';
};

/**
 * Get MongoDB database statistics
 * @returns {Promise<Object>} MongoDB statistics
 */
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const stats = await mongoose.connection.db.stats();
    
    // Add collection statistics
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = {};
    
    for (const collection of collections) {
      const collStats = await mongoose.connection.db.collection(collection.name).stats();
      collectionStats[collection.name] = {
        count: collStats.count,
        size: (collStats.size / 1024 / 1024).toFixed(2) + ' MB',
        avgDocSize: (collStats.avgObjSize / 1024).toFixed(2) + ' KB',
        storageSize: (collStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
        indexes: collStats.nindexes,
        indexSize: (collStats.totalIndexSize / 1024 / 1024).toFixed(2) + ' MB'
      };
    }
    
    return {
      database: mongoose.connection.name,
      collections: collections.length,
      documentsTotal: stats.objects,
      dataSize: (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
      storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
      indexes: stats.indexes,
      indexSize: (stats.indexSize / 1024 / 1024).toFixed(2) + ' MB',
      collectionDetails: collectionStats
    };
  } catch (error) {
    console.error(`Error getting database stats: ${error.message}`);
    throw error;
  }
};

// Set up event listeners for connection status
mongoose.connection.on('connected', () => {
  console.log('Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
});

// Gracefully close the connection when the process terminates
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  checkConnectionStatus,
  getDatabaseStats
};