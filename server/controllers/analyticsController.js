const User = require('../models/User');
const Itinerary = require('../models/Itinerary');
const Destination = require('../models/destination');
const PointOfInterest = require('../models/PointOfInterest');
const mongoose = require('mongoose');

// Get trending destinations
exports.getTrendingDestinations = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$destinations'
      },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations.destinationId',
          foreignField: '_id',
          as: 'destinationDetails'
        }
      },
      {
        $unwind: '$destinationDetails'
      },
      {
        $group: {
          _id: '$destinations.destinationId',
          destinationName: { $first: '$destinationDetails.name' },
          country: { $first: '$destinationDetails.country' },
          city: { $first: '$destinationDetails.city' },
          count: { $sum: 1 },
          averageStayDuration: { $avg: '$destinations.duration' },
          image: { $first: { $arrayElemAt: ['$destinationDetails.images', 0] } }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          name: '$destinationName',
          country: 1,
          city: 1,
          popularity: '$count',
          averageStayDuration: { $round: ['$averageStayDuration', 1] },
          image: 1
        }
      }
    ];
    
    const trendingDestinations = await Itinerary.aggregate(pipeline);
    
    res.status(200).json(trendingDestinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular attractions by POI visit count
exports.getPopularAttractions = async (req, res) => {
  try {
    const { destination, limit = 10 } = req.query;
    
    const pipeline = [
      destination ? {
        $match: {
          'location.city': { $regex: new RegExp(destination, 'i') }
        }
      } : { $match: {} },
      {
        $sort: { visitCount: -1, averageRating: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          description: 1,
          averageRating: 1,
          visitCount: 1,
          location: 1,
          imageUrl: { $arrayElemAt: ['$images', 0] }
        }
      }
    ];
    
    if (!destination) {
      pipeline.shift(); // Remove the empty $match if no destination provided
    }
    
    const popularAttractions = await PointOfInterest.aggregate(pipeline);
    
    res.status(200).json(popularAttractions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get destination insights
exports.getDestinationInsights = async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    // Get visit stats by month
    const visitsByMonth = await Itinerary.aggregate([
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $unwind: '$destinations'
      },
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      }
    ]);
    
    // Get average stay duration
    const stayDuration = await Itinerary.aggregate([
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $unwind: '$destinations'
      },
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$destinations.duration' },
          minDuration: { $min: '$destinations.duration' },
          maxDuration: { $max: '$destinations.duration' }
        }
      },
      {
        $project: {
          _id: 0,
          averageDuration: { $round: ['$averageDuration', 1] },
          minDuration: 1,
          maxDuration: 1
        }
      }
    ]);
    
    // Get popular activities
    const popularActivities = await Itinerary.aggregate([
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $unwind: '$dailyPlans'
      },
      {
        $unwind: '$dailyPlans.activities'
      },
      {
        $group: {
          _id: '$dailyPlans.activities.category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);
    
    // Get traveler demographics
    const travelerDemographics = await Itinerary.aggregate([
      {
        $match: {
          'destinations.destinationId': mongoose.Types.ObjectId(destinationId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $group: {
          _id: {
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ['$userDetails.age', 18] }, then: 'Under 18' },
                  { case: { $and: [{ $gte: ['$userDetails.age', 18] }, { $lt: ['$userDetails.age', 25] }] }, then: '18-24' },
                  { case: { $and: [{ $gte: ['$userDetails.age', 25] }, { $lt: ['$userDetails.age', 35] }] }, then: '25-34' },
                  { case: { $and: [{ $gte: ['$userDetails.age', 35] }, { $lt: ['$userDetails.age', 45] }] }, then: '35-44' },
                  { case: { $and: [{ $gte: ['$userDetails.age', 45] }, { $lt: ['$userDetails.age', 55] }] }, then: '45-54' },
                  { case: { $and: [{ $gte: ['$userDetails.age', 55] }, { $lt: ['$userDetails.age', 65] }] }, then: '55-64' }
                ],
                default: '65+'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          ageGroup: '$_id.ageGroup',
          count: 1
        }
      },
      {
        $sort: { ageGroup: 1 }
      }
    ]);
    
    // Get top POIs in this destination
    const topPOIs = await PointOfInterest.aggregate([
      {
        $match: {
          'location.city': destination.city,
          'location.country': destination.country
        }
      },
      {
        $sort: { averageRating: -1, visitCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          averageRating: 1,
          visitCount: 1,
          reviewCount: { $size: '$reviews' }
        }
      }
    ]);
    
    const insights = {
      destination: {
        id: destination._id,
        name: destination.name,
        city: destination.city,
        country: destination.country
      },
      visitsByMonth,
      stayDuration: stayDuration[0] || { averageDuration: 0, minDuration: 0, maxDuration: 0 },
      popularActivities,
      travelerDemographics,
      topPOIs
    };
    
    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user travel insights
exports.getUserTravelInsights = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get travel history stats
    const travelStats = await Itinerary.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDestinations: { $sum: { $size: '$destinations' } },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalTrips: 1,
          totalDestinations: 1,
          totalDays: { $ceil: '$totalDays' }
        }
      }
    ]);
    
    // Get most visited countries
    const topCountries = await Itinerary.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) }
      },
      {
        $unwind: '$destinations'
      },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations.destinationId',
          foreignField: '_id',
          as: 'destinationDetails'
        }
      },
      {
        $unwind: '$destinationDetails'
      },
      {
        $group: {
          _id: '$destinationDetails.country',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          count: 1
        }
      }
    ]);
    
    // Get travel pattern by month
    const travelByMonth = await Itinerary.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: { $month: '$startDate' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1
        }
      }
    ]);
    
    // Get favorite activity types
    const favoriteActivities = await Itinerary.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) }
      },
      {
        $unwind: '$dailyPlans'
      },
      {
        $unwind: '$dailyPlans.activities'
      },
      {
        $group: {
          _id: '$dailyPlans.activities.category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);
    
    // Get average trip duration
    const tripDuration = await Itinerary.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          averageDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageDuration: { $round: ['$averageDuration', 1] }
        }
      }
    ]);
    
    const insights = {
      user: {
        id: user._id,
        name: user.name
      },
      travelStats: travelStats[0] || { totalTrips: 0, totalDestinations: 0, totalDays: 0 },
      topCountries,
      travelByMonth,
      favoriteActivities,
      averageTripDuration: tripDuration[0]?.averageDuration || 0
    };
    
    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get global travel trends
exports.getGlobalTravelTrends = async (req, res) => {
  try {
    // Get top destinations globally
    const topDestinations = await Itinerary.aggregate([
      {
        $unwind: '$destinations'
      },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations.destinationId',
          foreignField: '_id',
          as: 'destinationDetails'
        }
      },
      {
        $unwind: '$destinationDetails'
      },
      {
        $group: {
          _id: '$destinations.destinationId',
          name: { $first: '$destinationDetails.name' },
          city: { $first: '$destinationDetails.city' },
          country: { $first: '$destinationDetails.country' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          name: 1,
          city: 1,
          country: 1,
          popularity: '$count'
        }
      }
    ]);
    
    // Get seasonal popularity trends
    const seasonalTrends = await Itinerary.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            quarter: { $ceil: { $divide: [{ $month: '$startDate' }, 3] } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.quarter': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          quarter: '$_id.quarter',
          count: 1
        }
      }
    ]);
    
    // Get popular activity categories
    const popularActivities = await Itinerary.aggregate([
      {
        $unwind: '$dailyPlans'
      },
      {
        $unwind: '$dailyPlans.activities'
      },
      {
        $group: {
          _id: '$dailyPlans.activities.category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);
    
    // Get average trip duration
    const averageTripDuration = await Itinerary.aggregate([
      {
        $group: {
          _id: null,
          averageDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageDuration: { $round: ['$averageDuration', 1] }
        }
      }
    ]);
    
    const trends = {
      topDestinations,
      seasonalTrends,
      popularActivities,
      averageTripDuration: averageTripDuration[0]?.averageDuration || 0
    };
    
    res.status(200).json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};