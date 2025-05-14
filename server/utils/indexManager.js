/**
 * Utility class for managing MongoDB indexes
 * This file handles the creation and management of various types of indexes
 * to optimize query performance for the HamSafar application
 */
const mongoose = require('mongoose');

class IndexManager {
  /**
   * Initialize all required indexes for the application
   * Should be called once during application startup
   */
  static async initializeIndexes() {
    try {
      console.log('Initializing database indexes...');
      await Promise.all([
        this.createUserIndexes(),
        this.createDestinationIndexes(),
        this.createPoiIndexes(),
        this.createItineraryIndexes(),
        this.createWeatherDataIndexes()
      ]);
      console.log('All indexes initialized successfully');
    } catch (error) {
      console.error('Error initializing indexes:', error);
      throw error;
    }
  }

  /**
   * Create indexes for the User collection
   */
  static async createUserIndexes() {
    const User = mongoose.model('User');
    
    // Create unique index on email for fast lookups and to ensure uniqueness
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    // Create unique index on username for fast lookups and to ensure uniqueness
    await User.collection.createIndex({ username: 1 }, { unique: true });
    
    // Create index on preferences for recommendation queries
    await User.collection.createIndex({ preferences: 1 });
    
    // Create TTL index to automatically remove reset tokens after expiration
    await User.collection.createIndex(
      { 'passwordReset.expiresAt': 1 }, 
      { expireAfterSeconds: 0, partialFilterExpression: { 'passwordReset.expiresAt': { $exists: true } } }
    );
    
    console.log('User indexes created');
  }

  /**
   * Create indexes for the Destination collection
   */
  static async createDestinationIndexes() {
    const Destination = mongoose.model('Destination');
    
    // Create text index for full-text search on destination name and description
    await Destination.collection.createIndex(
      { name: 'text', description: 'text' },
      { weights: { name: 10, description: 5 }, name: 'destination_text_search' }
    );
    
    // Create geo index for location-based queries
    await Destination.collection.createIndex({ location: '2dsphere' });
    
    // Create compound index for popularity and rating queries
    await Destination.collection.createIndex({ popularity: -1, avgRating: -1 });
    
    // Create index for country and city to speed up filtering
    await Destination.collection.createIndex({ country: 1, city: 1 });
    
    console.log('Destination indexes created');
  }

  /**
   * Create indexes for the PointOfInterest collection
   */
  static async createPoiIndexes() {
    const PointOfInterest = mongoose.model('PointOfInterest');
    
    // Create geo index for nearby queries
    await PointOfInterest.collection.createIndex({ location: '2dsphere' });
    
    // Create index for category-based filtering
    await PointOfInterest.collection.createIndex({ category: 1 });
    
    // Create text index for search functionality
    await PointOfInterest.collection.createIndex(
      { name: 'text', description: 'text' },
      { weights: { name: 10, description: 5 }, name: 'poi_text_search' }
    );
    
    // Create compound index for filtering by destination and category
    await PointOfInterest.collection.createIndex({ destinationId: 1, category: 1 });
    
    console.log('POI indexes created');
  }

  /**
   * Create indexes for the Itinerary collection
   */
  static async createItineraryIndexes() {
    const Itinerary = mongoose.model('Itinerary');
    
    // Create index on user ID for fast user-specific queries
    await Itinerary.collection.createIndex({ userId: 1 });
    
    // Create compound index for querying by date range
    await Itinerary.collection.createIndex({ userId: 1, 'dateRange.start': 1, 'dateRange.end': 1 });
    
    // Create index on destination for filtering
    await Itinerary.collection.createIndex({ destinations: 1 });
    
    console.log('Itinerary indexes created');
  }

  /**
   * Create indexes for the WeatherData collection
   */
  static async createWeatherDataIndexes() {
    const WeatherData = mongoose.model('WeatherData');
    
    // Create compound index for location and date
    await WeatherData.collection.createIndex({ locationId: 1, date: 1 }, { unique: true });
    
    // Create TTL index to automatically remove old weather data
    // Keeps only 14 days of historical data plus future forecasts
    await WeatherData.collection.createIndex(
      { date: 1 }, 
      { expireAfterSeconds: 14 * 24 * 60 * 60 } // 14 days in seconds
    );
    
    console.log('WeatherData indexes created');
  }

  /**
   * Drop all indexes from a specific collection
   * Useful during development or schema migration
   * @param {String} collectionName - Name of the collection
   */
  static async dropCollectionIndexes(collectionName) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      await collection.dropIndexes();
      console.log(`All indexes dropped for ${collectionName}`);
    } catch (error) {
      console.error(`Error dropping indexes for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a compound index 
   * @param {String} modelName - Mongoose model name
   * @param {Object} fields - Fields to index with direction (1 for ascending, -1 for descending)
   * @param {Object} options - Index options
   */
  static async createCompoundIndex(modelName, fields, options = {}) {
    try {
      const model = mongoose.model(modelName);
      await model.collection.createIndex(fields, options);
      console.log(`Compound index created for ${modelName}`);
    } catch (error) {
      console.error(`Error creating compound index for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Create a geospatial index
   * @param {String} modelName - Mongoose model name
   * @param {String} field - Field to create geospatial index on
   */
  static async createGeoIndex(modelName, field) {
    try {
      const model = mongoose.model(modelName);
      await model.collection.createIndex({ [field]: '2dsphere' });
      console.log(`Geospatial index created for ${modelName}.${field}`);
    } catch (error) {
      console.error(`Error creating geospatial index for ${modelName}.${field}:`, error);
      throw error;
    }
  }
}

module.exports = IndexManager;