const PointOfInterest = require('../models/PointOfInterest');

// Get all POIs with pagination
exports.getAllPOIs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'rating', order = 'desc' } = req.query;
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    const pois = await PointOfInterest.find()
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await PointOfInterest.countDocuments();
    
    res.status(200).json({
      pois,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPOIs: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get POI by ID
exports.getPOIById = async (req, res) => {
  try {
    const poiId = req.params.id;
    
    const poi = await PointOfInterest.findById(poiId);
    
    if (!poi) {
      return res.status(404).json({ message: 'Point of Interest not found' });
    }
    
    res.status(200).json(poi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new POI
exports.createPOI = async (req, res) => {
  try {
    const poiData = req.body;
    
    const newPOI = new PointOfInterest(poiData);
    await newPOI.save();
    
    res.status(201).json(newPOI);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update POI
exports.updatePOI = async (req, res) => {
  try {
    const poiId = req.params.id;
    const updateData = req.body;
    
    const updatedPOI = await PointOfInterest.findByIdAndUpdate(
      poiId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPOI) {
      return res.status(404).json({ message: 'Point of Interest not found' });
    }
    
    res.status(200).json(updatedPOI);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete POI
exports.deletePOI = async (req, res) => {
  try {
    const poiId = req.params.id;
    
    const deletedPOI = await PointOfInterest.findByIdAndDelete(poiId);
    
    if (!deletedPOI) {
      return res.status(404).json({ message: 'Point of Interest not found' });
    }
    
    res.status(200).json({ message: 'Point of Interest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find nearby POIs (using geospatial query)
exports.getNearbyPOIs = async (req, res) => {
  try {
    const { 
      longitude, 
      latitude, 
      maxDistance = 5000, // Default 5km
      categories,
      minRating,
      limit = 20 
    } = req.query;
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    // Build query
    const query = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    // Add category filter if provided
    if (categories) {
      const categoriesArray = categories.split(',');
      query.category = { $in: categoriesArray };
    }
    
    // Add rating filter if provided
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    // Find POIs near the specified coordinates
    const nearbyPOIs = await PointOfInterest.find(query)
      .limit(parseInt(limit))
      .select('name description category location rating images');
    
    // Calculate distance for each POI (optional)
    const poisWithDistance = nearbyPOIs.map(poi => {
      const [poiLong, poiLat] = poi.location.coordinates;
      
      // Simple distance calculation (approximation)
      const distance = calculateDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        poiLat, 
        poiLong
      );
      
      return {
        ...poi.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });
    
    res.status(200).json(poisWithDistance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search POIs with filtering
exports.searchPOIs = async (req, res) => {
  try {
    const {
      query,
      category,
      city,
      country,
      minRating,
      maxPriceLevel,
      sort = 'rating',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    
    if (country) {
      filter['location.country'] = { $regex: country, $options: 'i' };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (maxPriceLevel) {
      filter.priceLevel = { $lte: parseInt(maxPriceLevel) };
    }
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const pois = await PointOfInterest.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await PointOfInterest.countDocuments(filter);
    
    res.status(200).json({
      pois,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPOIs: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get POI analytics using aggregation pipeline
exports.getPOIAnalytics = async (req, res) => {
  try {
    // Top rated POIs by category
    const topRatedByCategory = await PointOfInterest.aggregate([
      {
        $match: { rating: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$category',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
          topPOIs: {
            $push: {
              name: '$name',
              rating: '$rating',
              city: '$location.city'
            }
          }
        }
      },
      { $sort: { averageRating: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          count: 1,
          topPOIs: { $slice: ['$topPOIs', 3] }
        }
      }
    ]);
    
    // Distribution by city
    const cityDistribution = await PointOfInterest.aggregate([
      {
        $group: {
          _id: {
            city: '$location.city',
            country: '$location.country'
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          count: 1,
          averageRating: { $round: ['$averageRating', 1] },
          categoryCount: { $size: '$categories' }
        }
      }
    ]);
    
    // Price level distribution
    const priceDistribution = await PointOfInterest.aggregate([
      {
        $match: { priceLevel: { $exists: true } }
      },
      {
        $group: {
          _id: '$priceLevel',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          priceLevel: '$_id',
          count: 1,
          averageRating: { $round: ['$averageRating', 1] }
        }
      }
    ]);
    
    res.status(200).json({
      topRatedByCategory,
      cityDistribution,
      priceDistribution,
      totalPOIs: await PointOfInterest.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a review to POI
exports.addReview = async (req, res) => {
  try {
    const poiId = req.params.id;
    const { userId, rating, comment } = req.body;
    
    // Validate input
    if (!userId || !rating) {
      return res.status(400).json({ message: 'User ID and rating are required' });
    }
    
    // Check if POI exists
    const poi = await PointOfInterest.findById(poiId);
    
    if (!poi) {
      return res.status(404).json({ message: 'Point of Interest not found' });
    }
    
    // Check if user already reviewed this POI
    const existingReviewIndex = poi.reviews.findIndex(review => review.userId === userId);
    
    if (existingReviewIndex !== -1) {
      // Update existing review
      poi.reviews[existingReviewIndex] = {
        userId,
        rating: parseFloat(rating),
        comment,
        date: new Date()
      };
    } else {
      // Add new review
      poi.reviews.push({
        userId,
        rating: parseFloat(rating),
        comment,
        date: new Date()
      });
    }
    
    // Recalculate overall rating
    const totalRating = poi.reviews.reduce((sum, review) => sum + review.rating, 0);
    poi.rating = totalRating / poi.reviews.length;
    
    await poi.save();
    
    res.status(200).json(poi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Simple haversine formula
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