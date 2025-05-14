const Destination = require('../models/destination');
const User = require('../models/User');

// Get all destinations with pagination
exports.getAllDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'popularityScore', order = 'desc' } = req.query;
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    const destinations = await Destination.find()
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Destination.countDocuments();
    
    res.status(200).json({
      destinations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalDestinations: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get destination by ID
exports.getDestinationById = async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.status(200).json(destination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new destination
exports.createDestination = async (req, res) => {
  try {
    const destinationData = req.body;
    
    const newDestination = new Destination(destinationData);
    await newDestination.save();
    
    res.status(201).json(newDestination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update destination
exports.updateDestination = async (req, res) => {
  try {
    const destinationId = req.params.id;
    const updateData = req.body;
    
    const updatedDestination = await Destination.findByIdAndUpdate(
      destinationId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedDestination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.status(200).json(updatedDestination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete destination
exports.deleteDestination = async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    const deletedDestination = await Destination.findByIdAndDelete(destinationId);
    
    if (!deletedDestination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find nearby destinations (using geospatial query)
exports.getNearbyDestinations = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 100000, limit = 10 } = req.query; // maxDistance in meters, default 100km
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    // Find destinations near the specified coordinates
    const nearbyDestinations = await Destination.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .limit(parseInt(limit))
    .select('name description location categories images popularityScore');
    
    res.status(200).json(nearbyDestinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search destinations with filtering
exports.searchDestinations = async (req, res) => {
  try {
    const {
      query,
      categories,
      minCost,
      maxCost,
      country,
      city,
      sort = 'popularityScore',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (categories) {
      const categoriesArray = categories.split(',');
      filter.categories = { $in: categoriesArray };
    }
    
    if (minCost || maxCost) {
      filter.costLevel = {};
      if (minCost) filter.costLevel.$gte = parseInt(minCost);
      if (maxCost) filter.costLevel.$lte = parseInt(maxCost);
    }
    
    if (country) {
      filter['location.country'] = { $regex: country, $options: 'i' };
    }
    
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const destinations = await Destination.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Destination.countDocuments(filter);
    
    res.status(200).json({
      destinations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalDestinations: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Destination analytics using aggregation pipeline
exports.getDestinationAnalytics = async (req, res) => {
  try {
    // Top destinations by country
    const topDestinationsByCountry = await Destination.aggregate([
      {
        $group: {
          _id: '$location.country',
          count: { $sum: 1 },
          averagePopularity: { $avg: '$popularityScore' },
          topDestinations: { 
            $push: { 
              name: '$name',
              city: '$location.city',
              popularityScore: '$popularityScore' 
            } 
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          country: '$_id',
          count: 1,
          averagePopularity: { $round: ['$averagePopularity', 1] },
          topDestinations: { $slice: ['$topDestinations', 3] }
        }
      }
    ]);
    
    // Distribution by category
    const categoryDistribution = await Destination.aggregate([
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          averageCost: { $avg: '$costLevel' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          averageCost: { $round: ['$averageCost', 1] }
        }
      }
    ]);
    
    // Cost level distribution
    const costDistribution = await Destination.aggregate([
      {
        $group: {
          _id: '$costLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          costLevel: '$_id',
          count: 1
        }
      }
    ]);
    
    res.status(200).json({
      topDestinationsByCountry,
      categoryDistribution,
      costDistribution,
      totalDestinations: await Destination.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personalized destination recommendations for a user
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user preferences
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Build recommendation query using user preferences
    const query = {};
    
    // Match preferred categories
    if (user.preferences.preferredActivities && user.preferences.preferredActivities.length > 0) {
      // Map user activities to destination categories
      const mappedCategories = user.preferences.preferredActivities.map(activity => {
        // Simple mapping logic - can be expanded
        if (activity.includes('beach')) return 'beach';
        if (activity.includes('hiking') || activity.includes('nature')) return 'mountain';
        if (activity.includes('museum') || activity.includes('art')) return 'cultural';
        if (activity.includes('history')) return 'historical';
        return activity;
      });
      
      query.categories = { $in: mappedCategories };
    }
    
    // Match travel style with cost level
    if (user.preferences.travelStyle) {
      switch(user.preferences.travelStyle) {
        case 'budget':
          query.costLevel = { $lte: 2 };
          break;
        case 'luxury':
          query.costLevel = { $gte: 4 };
          break;
        default:
          // For other travel styles, don't filter by cost
          break;
      }
    }
    
    // Find matching destinations
    const recommendations = await Destination.find(query)
      .sort({ popularityScore: -1 })
      .limit(10);
    
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};