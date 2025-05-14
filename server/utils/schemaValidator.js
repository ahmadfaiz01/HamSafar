const mongoose = require('mongoose');
/**
 * Utility for creating and managing MongoDB collection schema validations
 * These are advanced server-side validations that enforce data integrity at the database level
 */
class SchemaValidator {
  /**
   * Create collection schema validation for User collection
   * @returns {Object} JSON Schema for MongoDB validation
   */
  static getUserValidationSchema() {
    return {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              description: 'Must be a valid email address'
            },
            username: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'Must be between 3 and 30 characters'
            },
            password: {
              bsonType: 'string',
              minLength: 8,
              description: 'Must be at least 8 characters'
            },
            profile: {
              bsonType: 'object',
              properties: {
                fullName: { bsonType: 'string' },
                age: { bsonType: 'int', minimum: 13, maximum: 120 },
                gender: { bsonType: 'string', enum: ['male', 'female', 'other', 'prefer not to say'] },
                location: { bsonType: 'string' },
                bio: { bsonType: 'string', maxLength: 500 }
              }
            },
            preferences: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            role: {
              bsonType: 'string',
              enum: ['user', 'admin'],
              description: 'Must be either user or admin'
            },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
            lastLogin: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    };
  }
  
  /**
   * Create collection schema validation for Destination collection
   * @returns {Object} JSON Schema for MongoDB validation
   */
  static getDestinationValidationSchema() {
    return {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'city', 'country', 'location'],
          properties: {
            name: {
              bsonType: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Must be a valid destination name'
            },
            city: {
              bsonType: 'string',
              description: 'City where the destination is located'
            },
            country: {
              bsonType: 'string',
              description: 'Country where the destination is located'
            },
            description: {
              bsonType: 'string',
              description: 'Detailed description of the destination'
            },
            location: {
              bsonType: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  bsonType: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON type, must be Point'
                },
                coordinates: {
                  bsonType: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: { bsonType: 'double' },
                  description: '[longitude, latitude] coordinates'
                }
              }
            },
            categories: {
              bsonType: 'array',
              items: { bsonType: 'string' },
              description: 'Categories the destination belongs to (beach, mountain, etc.)'
            },
            avgRating: {
              bsonType: 'double',
              minimum: 0,
              maximum: 5,
              description: 'Average rating (0-5)'
            },
            reviewCount: {
              bsonType: 'int',
              minimum: 0,
              description: 'Number of reviews'
            },
            visitCount: {
              bsonType: 'int',
              minimum: 0,
              description: 'Number of visitors'
            },
            trendingIndex: {
              bsonType: 'int',
              minimum: 0,
              maximum: 100,
              description: 'Trending score (0-100)'
            },
            imageUrl: {
              bsonType: 'string',
              description: 'URL to the destination image'
            },
            isActive: {
              bsonType: 'bool',
              description: 'Whether the destination is active'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    };
  }

  /**
   * Create collection schema validation for Point of Interest collection
   * @returns {Object} JSON Schema for MongoDB validation
   */
  static getPointOfInterestValidationSchema() {
    return {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'location', 'category', 'destinationId'],
          properties: {
            name: {
              bsonType: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Name of the point of interest'
            },
            destinationId: {
              bsonType: 'objectId',
              description: 'Reference to the destination this POI belongs to'
            },
            description: {
              bsonType: 'string',
              description: 'Description of the POI'
            },
            category: {
              bsonType: 'string',
              enum: [
                'restaurant', 'cafe', 'attraction', 'museum', 'park', 
                'shopping', 'nightlife', 'transport', 'accommodation', 'other'
              ],
              description: 'Category of the POI'
            },
            location: {
              bsonType: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  bsonType: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON type, must be Point'
                },
                coordinates: {
                  bsonType: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: { bsonType: 'double' },
                  description: '[longitude, latitude] coordinates'
                }
              }
            },
            address: {
              bsonType: 'string',
              description: 'Physical address of the POI'
            },
            rating: {
              bsonType: 'double',
              minimum: 0,
              maximum: 5,
              description: 'Rating of the POI (0-5)'
            },
            priceLevel: {
              bsonType: 'int',
              minimum: 1,
              maximum: 5,
              description: 'Price level (1-5, where 1 is cheap and 5 is expensive)'
            },
            openingHours: {
              bsonType: 'object',
              description: 'Opening hours by day of week'
            },
            contactInfo: {
              bsonType: 'object',
              properties: {
                phone: { bsonType: 'string' },
                email: { bsonType: 'string' },
                website: { bsonType: 'string' }
              }
            },
            imageUrl: {
              bsonType: 'string',
              description: 'URL to the POI image'
            },
            isActive: {
              bsonType: 'bool',
              description: 'Whether the POI is active'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    };
  }

  /**
   * Create collection schema validation for Itinerary collection
   * @returns {Object} JSON Schema for MongoDB validation
   */
  static getItineraryValidationSchema() {
    return {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'title', 'dateRange', 'destinations'],
          properties: {
            userId: {
              bsonType: 'objectId',
              description: 'Reference to the user who created this itinerary'
            },
            title: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 100,
              description: 'Title of the itinerary'
            },
            description: {
              bsonType: 'string',
              description: 'Description of the itinerary'
            },
            dateRange: {
              bsonType: 'object',
              required: ['start', 'end'],
              properties: {
                start: { bsonType: 'date' },
                end: { bsonType: 'date' }
              }
            },
            destinations: {
              bsonType: 'array',
              minItems: 1,
              items: {
                bsonType: 'object',
                required: ['destinationId', 'order'],
                properties: {
                  destinationId: { bsonType: 'objectId' },
                  name: { bsonType: 'string' },
                  city: { bsonType: 'string' },
                  country: { bsonType: 'string' },
                  order: { bsonType: 'int', minimum: 1 },
                  dateRange: {
                    bsonType: 'object',
                    properties: {
                      arrival: { bsonType: 'date' },
                      departure: { bsonType: 'date' }
                    }
                  },
                  accommodation: {
                    bsonType: 'object',
                    properties: {
                      name: { bsonType: 'string' },
                      address: { bsonType: 'string' },
                      confirmationNumber: { bsonType: 'string' }
                    }
                  }
                }
              }
            },
            activities: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['poiId', 'date'],
                properties: {
                  poiId: { bsonType: 'objectId' },
                  name: { bsonType: 'string' },
                  date: { bsonType: 'date' },
                  time: { bsonType: 'string' },
                  notes: { bsonType: 'string' }
                }
              }
            },
            transportationType: {
              bsonType: 'string',
              enum: ['flight', 'train', 'bus', 'car', 'cruise', 'other'],
              description: 'Primary transportation type for this trip'
            },
            transportDetails: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  from: { bsonType: 'string' },
                  to: { bsonType: 'string' },
                  carrier: { bsonType: 'string' },
                  departureTime: { bsonType: 'date' },
                  arrivalTime: { bsonType: 'date' },
                  confirmationNumber: { bsonType: 'string' }
                }
              }
            },
            estimatedCost: {
              bsonType: 'double',
              minimum: 0,
              description: 'Estimated total cost of the trip'
            },
            costBreakdown: {
              bsonType: 'object',
              properties: {
                accommodation: { bsonType: 'double', minimum: 0 },
                transport: { bsonType: 'double', minimum: 0 },
                food: { bsonType: 'double', minimum: 0 },
                activities: { bsonType: 'double', minimum: 0 },
                miscellaneous: { bsonType: 'double', minimum: 0 }
              }
            },
            currency: {
              bsonType: 'string',
              description: 'Currency code (USD, EUR, etc.)'
            },
            status: {
              bsonType: 'string',
              enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'],
              description: 'Status of the itinerary'
            },
            visibility: {
              bsonType: 'string',
              enum: ['private', 'shared', 'public'],
              description: 'Visibility setting for this itinerary'
            },
            sharedWith: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'List of user IDs this itinerary is shared with'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    };
  }

  /**
   * Create collection schema validation for Weather Data collection
   * @returns {Object} JSON Schema for MongoDB validation
   */
  static getWeatherDataValidationSchema() {
    return {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['locationId', 'date', 'forecast'],
          properties: {
            locationId: {
              bsonType: 'objectId',
              description: 'Reference to the destination this weather data belongs to'
            },
            date: {
              bsonType: 'date',
              description: 'Date of the weather forecast'
            },
            forecast: {
              bsonType: 'object',
              required: ['temperature', 'condition', 'precipitation'],
              properties: {
                temperature: {
                  bsonType: 'object',
                  required: ['min', 'max', 'avg'],
                  properties: {
                    min: { bsonType: 'double' },
                    max: { bsonType: 'double' },
                    avg: { bsonType: 'double' }
                  }
                },
                condition: {
                  bsonType: 'string',
                  enum: [
                    'sunny', 'partly-cloudy', 'cloudy', 'rain', 
                    'thunderstorm', 'snow', 'sleet', 'fog', 'windy'
                  ]
                },
                precipitation: {
                  bsonType: 'double',
                  minimum: 0,
                  description: 'Precipitation amount in mm'
                },
                humidity: {
                  bsonType: 'double',
                  minimum: 0,
                  maximum: 100,
                  description: 'Humidity percentage'
                },
                windSpeed: {
                  bsonType: 'double',
                  minimum: 0,
                  description: 'Wind speed in km/h'
                },
                windDirection: {
                  bsonType: 'string',
                  description: 'Wind direction (N, NE, E, SE, S, SW, W, NW)'
                },
                uvIndex: {
                  bsonType: 'int',
                  minimum: 0,
                  maximum: 11,
                  description: 'UV index (0-11)'
                }
              }
            },
            source: {
              bsonType: 'string',
              description: 'Source of the weather data (e.g., OpenWeatherMap)'
            },
            lastUpdated: {
              bsonType: 'date',
              description: 'When this forecast was last updated'
            }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    };
  }

  /**
   * Apply schema validations to all collections
   * @param {Object} db - MongoDB database connection
   */
  static async applyAllValidations(db) {
    try {
      console.log('Applying schema validations to collections...');
      
      // Get list of collections
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      // Apply validations based on collection existence
      if (collectionNames.includes('users')) {
        await db.command({
          collMod: 'users',
          ...this.getUserValidationSchema()
        });
        console.log('Applied validation to users collection');
      }
      
      if (collectionNames.includes('destinations')) {
        await db.command({
          collMod: 'destinations',
          ...this.getDestinationValidationSchema()
        });
        console.log('Applied validation to destinations collection');
      }
      
      if (collectionNames.includes('pointsofinterest')) {
        await db.command({
          collMod: 'pointsofinterest',
          ...this.getPointOfInterestValidationSchema()
        });
        console.log('Applied validation to pointsofinterest collection');
      }
      
      if (collectionNames.includes('itineraries')) {
        await db.command({
          collMod: 'itineraries',
          ...this.getItineraryValidationSchema()
        });
        console.log('Applied validation to itineraries collection');
      }
      
      if (collectionNames.includes('weatherdata')) {
        await db.command({
          collMod: 'weatherdata',
          ...this.getWeatherDataValidationSchema()
        });
        console.log('Applied validation to weatherdata collection');
      }
      
      console.log('All schema validations applied successfully');
    } catch (error) {
      console.error('Error applying schema validations:', error);
      throw error;
    }
  }
}

module.exports = SchemaValidator;