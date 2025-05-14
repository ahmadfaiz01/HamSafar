const PointOfInterest = require('../models/PointOfInterest');
const Destination = require('../models/destination');
const mongoose = require('mongoose');

// Find points of interest near a specified location
exports.findNearbyPOIs = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000, limit = 20 } = req.query;
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    // Convert string parameters to numbers
    const coords = [parseFloat(longitude), parseFloat(latitude)];
    const distance = parseInt(maxDistance);
    const resultLimit = parseInt(limit);
    
    // Execute geospatial query
    const nearbyPOIs = await PointOfInterest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords
          },
          $maxDistance: distance // distance in meters
        }
      }
    })
    .limit(resultLimit)
    .select('name description address location type categories openingHours rating');
    
    res.status(200).json({
      count: nearbyPOIs.length,
      maxDistance: `${distance} meters`,
      pois: nearbyPOIs
    });
  } catch (error) {
    console.error('Error finding nearby POIs:', error);
    res.status(500).json({ message: 'Failed to find nearby points of interest', error: error.message });
  }
};

// Find POIs within a specific area/bounds
exports.findPOIsInBounds = async (req, res) => {
  try {
    const { minLng, minLat, maxLng, maxLat, types, limit = 50 } = req.query;
    
    // Validate bounds parameters
    if (!minLng || !minLat || !maxLng || !maxLat) {
      return res.status(400).json({ message: 'All boundary coordinates (minLng, minLat, maxLng, maxLat) are required' });
    }
    
    // Build the query
    const query = {
      location: {
        $geoWithin: {
          $box: [
            [parseFloat(minLng), parseFloat(minLat)],
            [parseFloat(maxLng), parseFloat(maxLat)]
          ]
        }
      }
    };
    
    // Add type filter if provided
    if (types) {
      const typesList = types.split(',');
      query.type = { $in: typesList };
    }
    
    // Execute the query
    const pois = await PointOfInterest.find(query)
      .limit(parseInt(limit))
      .select('name description location type categories rating images');
    
    res.status(200).json({
      count: pois.length,
      pois: pois
    });
  } catch (error) {
    console.error('Error finding POIs in bounds:', error);
    res.status(500).json({ message: 'Failed to find POIs in the specified area', error: error.message });
  }
};

// Find POIs by category within a radius
exports.findPOIsByCategory = async (req, res) => {
  try {
    const { longitude, latitude, category, maxDistance = 5000, limit = 20 } = req.query;
    
    // Validate parameters
    if (!longitude || !latitude || !category) {
      return res.status(400).json({ message: 'Longitude, latitude, and category are required' });
    }
    
    // Convert string parameters to numbers
    const coords = [parseFloat(longitude), parseFloat(latitude)];
    const distance = parseInt(maxDistance);
    const resultLimit = parseInt(limit);
    
    // Execute geospatial query with category filter
    const pois = await PointOfInterest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords
          },
          $maxDistance: distance
        }
      },
      categories: category
    })
    .limit(resultLimit)
    .select('name description address location type categories rating images');
    
    res.status(200).json({
      count: pois.length,
      category: category,
      maxDistance: `${distance} meters`,
      pois: pois
    });
  } catch (error) {
    console.error('Error finding POIs by category:', error);
    res.status(500).json({ message: 'Failed to find POIs by category', error: error.message });
  }
};

// Calculate distance between two points
exports.calculateDistance = async (req, res) => {
  try {
    const { fromLng, fromLat, toLng, toLat } = req.query;
    
    // Validate parameters
    if (!fromLng || !fromLat || !toLng || !toLat) {
      return res.status(400).json({ message: 'All coordinates are required (fromLng, fromLat, toLng, toLat)' });
    }
    
    // Use MongoDB's $geoNear aggregate to calculate the distance
    const result = await PointOfInterest.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(toLng), parseFloat(toLat)]
          },
          distanceField: 'distance',
          spherical: true,
          query: {
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [parseFloat(fromLng), parseFloat(fromLat)]
                },
                $maxDistance: 1 // Just to find the exact point
              }
            }
          },
          limit: 1
        }
      }
    ]);
    
    // If no points found at exact locations, calculate manually using Haversine formula
    if (result.length === 0) {
      // Radius of the Earth in meters
      const R = 6371e3;
      
      // Convert coordinates to radians
      const φ1 = parseFloat(fromLat) * Math.PI / 180;
      const φ2 = parseFloat(toLat) * Math.PI / 180;
      const Δφ = (parseFloat(toLat) - parseFloat(fromLat)) * Math.PI / 180;
      const Δλ = (parseFloat(toLng) - parseFloat(fromLng)) * Math.PI / 180;
      
      // Haversine formula
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return res.status(200).json({
        fromCoordinates: [parseFloat(fromLng), parseFloat(fromLat)],
        toCoordinates: [parseFloat(toLng), parseFloat(toLat)],
        distanceInMeters: distance,
        distanceInKm: distance / 1000
      });
    }
    
    res.status(200).json({
      fromCoordinates: [parseFloat(fromLng), parseFloat(fromLat)],
      toCoordinates: [parseFloat(toLng), parseFloat(toLat)],
      distanceInMeters: result[0].distance,
      distanceInKm: result[0].distance / 1000
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ message: 'Failed to calculate distance', error: error.message });
  }
};

// Find destinations within a specific region
exports.findDestinationsInRegion = async (req, res) => {
  try {
    const { country, region, limit = 20 } = req.query;
    
    // Build the query based on provided parameters
    const query = {};
    if (country) query.country = country;
    if (region) query.region = region;
    
    // Execute the query
    const destinations = await Destination.find(query)
      .limit(parseInt(limit))
      .select('name country city region description images categories popularity');
    
    res.status(200).json({
      count: destinations.length,
      destinations: destinations
    });
  } catch (error) {
    console.error('Error finding destinations in region:', error);
    res.status(500).json({ message: 'Failed to find destinations in the specified region', error: error.message });
  }
};