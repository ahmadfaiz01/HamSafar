/**
 * Service for handling complex MongoDB aggregation pipelines
 * This file contains reusable aggregation pipelines for analytics,
 * recommendations, and other data processing needs
 */
const mongoose = require('mongoose');

class AggregationService {
  /**
   * Get the most popular destinations based on user visits and ratings
   * @param {Number} limit - Number of destinations to return
   * @returns {Array} - Popular destinations with calculated metrics
   */
  static async getPopularDestinations(limit = 10) {
    const Destination = mongoose.model('Destination');
    
    try {
      return await Destination.aggregate([
        // Match only active destinations with minimum data
        { $match: { isActive: true, reviewCount: { $gte: 5 } } },
        
        // Calculate a popularity score based on multiple factors
        { $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ["$avgRating", 10] },  // Weight rating heavily
              { $multiply: ["$visitCount", 0.5] }, // Consider visit count
              { $cond: { 
                if: { $gte: ["$trendingIndex", 80] }, 
                then: 50,  // Bonus for trending places
                else: 0 
              }}
            ]
          }
        }},
        
        // Sort by the calculated popularity score
        { $sort: { popularityScore: -1 } },
        
        // Limit results
        { $limit: limit },
        
        // Project only needed fields
        { $project: {
          _id: 1,
          name: 1,
          city: 1,
          country: 1,
          description: 1,
          avgRating: 1,
          reviewCount: 1,
          imageUrl: 1,
          popularityScore: 1
        }}
      ]);
    } catch (error) {
      console.error('Error in getPopularDestinations aggregation:', error);
      throw error;
    }
  }

  /**
   * Get personalized destination recommendations for a user
   * @param {String} userId - User ID to get recommendations for
   * @param {Number} limit - Number of recommendations to return
   * @returns {Array} - Recommended destinations with explanation
   */
  static async getPersonalizedRecommendations(userId, limit = 5) {
    const User = mongoose.model('User');
    const Destination = mongoose.model('Destination');
    
    try {
      // First get the user's preferences and past travels
      const user = await User.findById(userId).lean();
      if (!user) throw new Error('User not found');
      
      const userPreferences = user.preferences || [];
      
      // Build a pipeline that considers user preferences
      return await Destination.aggregate([
        // Match destinations that align with user preferences
        { $match: {
          isActive: true,
          $or: [
            // Match destinations with categories that overlap with user preferences
            { categories: { $in: userPreferences } },
            // Also include generally popular destinations
            { avgRating: { $gte: 4.5 } }
          ]
        }},
        
        // Calculate a personalization score
        { $addFields: {
          preferenceMatchCount: {
            $size: {
              $setIntersection: ["$categories", userPreferences]
            }
          },
          // Calculate days since destination was created (for recency bias)
          daysSinceCreation: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          }
        }},
        
        // Calculate final recommendation score
        { $addFields: {
          recommendationScore: {
            $add: [
              { $multiply: ["$preferenceMatchCount", 10] }, // Strong boost for preference matches
              { $multiply: ["$avgRating", 5] },             // Consider ratings
              { $cond: {                                    // Recency boost for newer destinations
                if: { $lt: ["$daysSinceCreation", 30] },    // If less than 30 days old
                then: 20,
                else: 0
              }}
            ]
          }
        }},
        
        // Sort by recommendation score
        { $sort: { recommendationScore: -1 } },
        
        // Limit results
        { $limit: limit },
        
        // Add explanation for recommendation
        { $addFields: {
          recommendationReason: {
            $cond: {
              if: { $gt: ["$preferenceMatchCount", 0] },
              then: "Matches your travel preferences",
              else: {
                $cond: {
                  if: { $gte: ["$avgRating", 4.5] },
                  then: "Highly rated destination",
                  else: "Popular among travelers like you"
                }
              }
            }
          }
        }},
        
        // Project only needed fields
        { $project: {
          _id: 1,
          name: 1,
          city: 1,
          country: 1,
          description: 1,
          avgRating: 1,
          imageUrl: 1,
          recommendationReason: 1
        }}
      ]);
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations aggregation:', error);
      throw error;
    }
  }

  /**
   * Generate statistics about user travel patterns
   * @param {String} userId - User ID to analyze
   * @returns {Object} - Travel statistics for the user
   */
  static async getUserTravelStats(userId) {
    const Itinerary = mongoose.model('Itinerary');
    
    try {
      const stats = await Itinerary.aggregate([
        // Match only this user's itineraries
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        
        // Unwind destinations to analyze each destination separately
        { $unwind: "$destinations" },
        
        // Group and calculate statistics
        { $group: {
          _id: "$userId",
          totalTrips: { $sum: 1 },
          uniqueDestinations: { $addToSet: "$destinations.destinationId" },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ["$dateRange.end", "$dateRange.start"] },
                1000 * 60 * 60 * 24 // Convert ms to days
              ]
            }
          },
          averageTripCost: { $avg: "$estimatedCost" },
          mostVisitedCountries: { $addToSet: "$destinations.country" },
          upcomingTrips: {
            $sum: {
              $cond: {
                if: { $gt: ["$dateRange.start", new Date()] },
                then: 1,
                else: 0
              }
            }
          }
        }},
        
        // Add calculated fields
        { $addFields: {
          uniqueDestinationCount: { $size: "$uniqueDestinations" },
          mostVisitedCountryCount: { $size: "$mostVisitedCountries" }
        }},
        
        // Project final results
        { $project: {
          _id: 0,
          userId: "$_id",
          totalTrips: 1,
          uniqueDestinationCount: 1,
          totalDays: { $round: ["$totalDays", 1] }, // Round to 1 decimal place
          averageTripLength: { 
            $round: [{ $divide: ["$totalDays", "$totalTrips"] }, 1]
          },
          averageTripCost: { $round: ["$averageTripCost", 2] },
          mostVisitedCountryCount: 1,
          upcomingTrips: 1
        }}
      ]);
      
      return stats[0] || {
        userId,
        totalTrips: 0,
        uniqueDestinationCount: 0,
        totalDays: 0,
        averageTripLength: 0,
        averageTripCost: 0,
        mostVisitedCountryCount: 0,
        upcomingTrips: 0
      };
    } catch (error) {
      console.error('Error in getUserTravelStats aggregation:', error);
      throw error;
    }
  }

  /**
   * Find nearby points of interest based on location
   * @param {Number} longitude - Longitude coordinate
   * @param {Number} latitude - Latitude coordinate
   * @param {Number} maxDistanceKm - Maximum distance in kilometers
   * @param {Array} categories - Optional categories to filter by
   * @returns {Array} - Nearby POIs with distance information
   */
  static async findNearbyPOIs(longitude, latitude, maxDistanceKm = 5, categories = []) {
    const PointOfInterest = mongoose.model('PointOfInterest');
    
    try {
      const matchStage = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistanceKm * 1000 // Convert to meters
          }
        }
      };
      
      // Add category filter if provided
      if (categories && categories.length > 0) {
        matchStage.category = { $in: categories };
      }
      
      return await PointOfInterest.aggregate([
        { $match: matchStage },
        
        // Calculate distance in kilometers
        { $addFields: {
          distanceKm: {
            $divide: [
              { $meta: "searchScore" }, // The distance in meters
              1000 // Convert to kilometers
            ]
          }
        }},
        
        // Limit results
        { $limit: 20 },
        
        // Project needed fields including the calculated distance
        { $project: {
          _id: 1,
          name: 1,
          category: 1,
          description: 1,
          rating: 1,
          address: 1,
          distanceKm: { $round: ["$distanceKm", 2] }, // Round to 2 decimal places
          location: 1,
          openingHours: 1,
          imageUrl: 1
        }},
        
        // Sort by distance
        { $sort: { distanceKm: 1 } }
      ]);
    } catch (error) {
      console.error('Error in findNearbyPOIs aggregation:', error);
      throw error;
    }
  }

  /**
   * Generate travel trends analysis for overall platform
   * @returns {Object} - Various statistics about travel trends
   */
  static async getTravelTrends() {
    const Itinerary = mongoose.model('Itinerary');
    const Destination = mongoose.model('Destination');
    
    try {
      // Get top destinations by month for the past year
      const monthlyTrends = await Itinerary.aggregate([
        // Consider only itineraries from the past year
        { $match: {
          'dateRange.start': { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
        }},
        
        // Unwind destinations
        { $unwind: "$destinations" },
        
        // Add month information
        { $addFields: {
          month: { $month: "$dateRange.start" },
          year: { $year: "$dateRange.start" }
        }},
        
        // Group by month and destination
        { $group: {
          _id: {
            month: "$month",
            year: "$year",
            destination: "$destinations.destinationId"
          },
          count: { $sum: 1 }
        }},
        
        // Sort by month and count
        { $sort: { "_id.year": 1, "_id.month": 1, "count": -1 } },
        
        // Group again to get top destinations per month
        { $group: {
          _id: {
            month: "$_id.month",
            year: "$_id.year"
          },
          topDestinations: {
            $push: {
              destinationId: "$_id.destination",
              count: "$count"
            }
          }
        }},
        
        // Limit top destinations to 5 per month
        { $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          topDestinations: { $slice: ["$topDestinations", 5] }
        }},
        
        // Sort by year and month
        { $sort: { "year": 1, "month": 1 } }
      ]);
      
      // Get overall platform statistics
      const platformStats = await Itinerary.aggregate([
        { $group: {
          _id: null,
          totalItineraries: { $sum: 1 },
          averageTripDuration: {
            $avg: {
              $divide: [
                { $subtract: ["$dateRange.end", "$dateRange.start"] },
                1000 * 60 * 60 * 24 // Convert ms to days
              ]
            }
          },
          averageTripCost: { $avg: "$estimatedCost" },
          mostPopularTransportTypes: { $push: "$transportationType" }
        }},
        { $project: {
          _id: 0,
          totalItineraries: 1,
          averageTripDuration: { $round: ["$averageTripDuration", 1] },
          averageTripCost: { $round: ["$averageTripCost", 2] }
        }}
      ]);
      
      // Get trending destinations
      const trendingDestinations = await Destination.aggregate([
        // Find destinations with recent increased traffic
        { $match: {
          updatedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) },
          trendingIndex: { $gte: 70 }
        }},
        { $sort: { trendingIndex: -1 } },
        { $limit: 10 },
        { $project: {
          _id: 1,
          name: 1,
          city: 1,
          country: 1,
          trendingIndex: 1,
          avgRating: 1,
          imageUrl: 1
        }}
      ]);
      
      return {
        monthlyTrends,
        platformStats: platformStats[0] || {},
        trendingDestinations
      };
    } catch (error) {
      console.error('Error in getTravelTrends aggregation:', error);
      throw error;
    }
  }
  
  /**
   * Generate custom cost statistics aggregation for budget planning
   * @param {Object} filters - Optional filters like destination, date range, etc.
   * @returns {Object} - Cost statistics for budget planning
   */
  static async getCostStatistics(filters = {}) {
    const Itinerary = mongoose.model('Itinerary');
    
    try {
      const matchStage = {};
      
      // Apply filters if provided
      if (filters.destinationId) {
        matchStage['destinations.destinationId'] = mongoose.Types.ObjectId(filters.destinationId);
      }
      
      if (filters.dateRange) {
        matchStage['dateRange.start'] = { $gte: new Date(filters.dateRange.start) };
        matchStage['dateRange.end'] = { $lte: new Date(filters.dateRange.end) };
      }
      
      const costStats = await Itinerary.aggregate([
        // Apply filters
        { $match: matchStage },
        
        // Group by destination or overall
        { $group: {
          _id: filters.groupByDestination ? "$destinations.destinationId" : null,
          averageCost: { $avg: "$estimatedCost" },
          minCost: { $min: "$estimatedCost" },
          maxCost: { $max: "$estimatedCost" },
          costDistribution: {
            $push: "$estimatedCost"
          },
          // Calculate costs by category if available
          accommodationCosts: { $avg: "$costBreakdown.accommodation" },
          transportCosts: { $avg: "$costBreakdown.transport" },
          foodCosts: { $avg: "$costBreakdown.food" },
          activityCosts: { $avg: "$costBreakdown.activities" },
          miscCosts: { $avg: "$costBreakdown.miscellaneous" },
          sampleCount: { $sum: 1 }
        }},
        
        // Calculate percentiles
        { $project: {
          _id: 1,
          averageCost: { $round: ["$averageCost", 2] },
          minCost: { $round: ["$minCost", 2] },
          maxCost: { $round: ["$maxCost", 2] },
          medianCost: { $arrayElemAt: [
            "$costDistribution",
            { $floor: { $multiply: [{ $size: "$costDistribution" }, 0.5] } }
          ]},
          costBreakdown: {
            accommodation: { $round: ["$accommodationCosts", 2] },
            transport: { $round: ["$transportCosts", 2] },
            food: { $round: ["$foodCosts", 2] },
            activities: { $round: ["$activityCosts", 2] },
            miscellaneous: { $round: ["$miscCosts", 2] }
          },
          sampleCount: 1
        }}
      ]);
      
      // If grouping by destination, fetch destination names
      if (filters.groupByDestination && costStats.length > 0) {
        const Destination = mongoose.model('Destination');
        
        // Fetch destination details for IDs
        const destinationIds = costStats.map(stat => stat._id);
        const destinations = await Destination.find(
          { _id: { $in: destinationIds } },
          { name: 1, city: 1, country: 1 }
        ).lean();
        
        // Create a map for easy lookup
        const destinationMap = {};
        destinations.forEach(dest => {
          destinationMap[dest._id.toString()] = dest;
        });
        
        // Add destination info to stats
        costStats.forEach(stat => {
          const destInfo = destinationMap[stat._id.toString()];
          if (destInfo) {
            stat.destination = {
              name: destInfo.name,
              city: destInfo.city,
              country: destInfo.country
            };
          }
        });
      }
      
      return costStats;
    } catch (error) {
      console.error('Error in getCostStatistics aggregation:', error);
      throw error;
    }
  }
}

module.exports = AggregationService;