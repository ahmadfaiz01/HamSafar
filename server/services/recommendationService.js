const Place = require('../models/Place');

/**
 * Get nearby attractions using MongoDB geospatial query
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of nearby places
 */
exports.getNearbyAttractions = async (options) => {
  try {
    const { 
      latitude, 
      longitude, 
      maxDistance = 15000, 
      interests = [], 
      limit = 20 
    } = options;
    
    console.log(`Searching for places near [${longitude}, ${latitude}] within ${maxDistance}m`);
    
    // Build the base geospatial query without interest filtering
    const baseQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    // Execute the query without interest filters first
    console.log('Executing MongoDB base query:', JSON.stringify(baseQuery));
    const allPlaces = await Place.find(baseQuery).limit(parseInt(limit) * 2).exec();
    console.log(`Found ${allPlaces.length} places near coordinates before filtering interests`);
    
    // First try filtering places by interests (case-insensitive)
    let filteredPlaces = [];
    if (interests && interests.length > 0) {
      console.log(`Filtering by interests (case-insensitive): ${interests.join(', ')}`);
      
      // Create regex patterns for case-insensitive matching
      const interestPatterns = interests.map(interest => 
        new RegExp(interest.trim(), 'i')
      );
      
      // Filter places that match any interest pattern
      filteredPlaces = allPlaces.filter(place => {
        // Check category match
        const categoryMatches = interestPatterns.some(pattern => 
          pattern.test(place.category)
        );
        
        // Check tags match
        const tagMatches = place.tags && place.tags.some(tag => 
          interestPatterns.some(pattern => pattern.test(tag))
        );
        
        return categoryMatches || tagMatches;
      });
      
      console.log(`Found ${filteredPlaces.length} places matching interests`);
    }
    
    // If no places match interests or no interests were provided, use all places
    const placesToReturn = filteredPlaces.length > 0 ? filteredPlaces : allPlaces;
    
    // Limit to requested number
    const limitedPlaces = placesToReturn.slice(0, parseInt(limit));
    
    // Format places for client response
    return limitedPlaces.map(place => ({
      id: place._id.toString(),
      name: place.name,
      description: place.description,
      category: place.category,
      coordinates: {
        latitude: place.location.coordinates[1],
        longitude: place.location.coordinates[0]
      },
      address: place.address || '',
      city: place.city,
      imageUrl: place.imageUrl || '',
      rating: place.rating || 0,
      tags: place.tags || [],
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        place.location.coordinates[1],
        place.location.coordinates[0]
      )
    }));
  } catch (error) {
    console.error('Error in getNearbyAttractions:', error);
    throw error;
  }
};

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
