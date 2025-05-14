const Destination = require('../models/Destination');
const UserPreference = require('../models/UserPreference');

// Get personalized recommendations
exports.getPersonalizedRecommendations = async (userId) => {
  try {
    // If userId not provided or invalid, return default recommendations
    if (!userId) {
      return await getDefaultRecommendations();
    }
    
    // Find user preferences
    const userPreference = await UserPreference.findOne({ userId });
    
    if (!userPreference) {
      return await getDefaultRecommendations();
    }
    
    // Build query based on user preferences
    let query = {};
    
    if (userPreference.destinationTypes && userPreference.destinationTypes.length > 0) {
      query.categories = { $in: userPreference.destinationTypes };
    }
    
    if (userPreference.budgetRange) {
      query.budgetCategory = userPreference.budgetRange;
    }
    
    // Find matching destinations
    let destinations = await Destination.find(query).sort({ popularity: -1 }).limit(10);
    
    // If no matching destinations found based on preferences, return default recommendations
    if (destinations.length === 0) {
      return await getDefaultRecommendations();
    }
    
    return destinations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return await getDefaultRecommendations();
  }
};

// Get recommendations by category
exports.getCategoryRecommendations = async (category) => {
  try {
    // Find destinations in this category
    const destinations = await Destination.find({ categories: category })
      .sort({ popularity: -1 })
      .limit(20);
    
    // If no destinations found, create sample destinations for this category
    if (destinations.length === 0) {
      return await createSampleDestinations(category);
    }
    
    return destinations;
  } catch (error) {
    console.error(`Error getting ${category} recommendations:`, error);
    return [];
  }
};

// Get all destinations with optional filters
exports.getAllDestinations = async (filters = {}) => {
  try {
    let query = {};
    
    if (filters.categories) {
      query.categories = { $in: Array.isArray(filters.categories) ? filters.categories : [filters.categories] };
    }
    
    if (filters.province) {
      query['location.province'] = filters.province;
    }
    
    if (filters.budgetCategory) {
      query.budgetCategory = filters.budgetCategory;
    }
    
    const destinations = await Destination.find(query).sort({ popularity: -1 });
    
    // If no destinations found, create sample destinations
    if (destinations.length === 0) {
      return await createSampleDestinations();
    }
    
    return destinations;
  } catch (error) {
    console.error('Error getting all destinations:', error);
    return [];
  }
};

// Get destination by ID
exports.getDestinationById = async (id) => {
  try {
    const destination = await Destination.findById(id);
    
    if (!destination) {
      throw new Error('Destination not found');
    }
    
    return destination;
  } catch (error) {
    console.error('Error getting destination by ID:', error);
    throw error;
  }
};

// Add destination to wishlist (assuming User model has wishlist field)
exports.addToWishlist = async (userId, destinationId) => {
  try {
    const User = require('../models/User');  // Import User model
    
    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }
    
    // Add to user's wishlist
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: destinationId } },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Default recommendations if no preferences or matches
async function getDefaultRecommendations() {
  try {
    // Get popular destinations
    let destinations = await Destination.find().sort({ popularity: -1 }).limit(10);
    
    // If no destinations in database, create samples
    if (destinations.length === 0) {
      destinations = await createSampleDestinations();
    }
    
    return destinations;
  } catch (error) {
    console.error('Error getting default recommendations:', error);
    return [];
  }
}

// Create sample destinations if none exist
async function createSampleDestinations(category = null) {
  try {
    // Define sample destinations based on categories
    let sampleDestinations = [];
    
    // Beach destinations
    if (!category || category === 'beach') {
      sampleDestinations.push(
        {
          name: 'Kund Malir Beach',
          location: {
            province: 'Balochistan',
            city: 'Hingol'
          },
          categories: ['beach'],
          description: {
            short: 'Beautiful beach along the Makran Coastal Highway',
            full: 'Kund Malir is one of Pakistan\'s most beautiful beaches, located in Balochistan along the Makran Coastal Highway. It features pristine waters, golden sands, and unique rock formations.'
          },
          activities: ['Swimming', 'Camping', 'Photography'],
          bestSeasons: ['winter', 'autumn'],
          budgetCategory: 'moderate',
          images: ['https://example.com/kund-malir.jpg'],
          popularity: 90
        },
        {
          name: 'Hawkes Bay Beach',
          location: {
            province: 'Sindh',
            city: 'Karachi'
          },
          categories: ['beach'],
          description: {
            short: 'Popular beach destination near Karachi',
            full: 'Hawkes Bay is one of the most popular beaches near Karachi, known for its clear waters and sandy shores. It\'s a great place for swimming, sunbathing, and enjoying seaside activities.'
          },
          activities: ['Swimming', 'Picnics', 'Camel Riding'],
          bestSeasons: ['winter', 'spring'],
          budgetCategory: 'budget',
          images: ['https://example.com/hawkes-bay.jpg'],
          popularity: 85
        }
      );
    }
    
    // Mountain destinations
    if (!category || category === 'mountain') {
      sampleDestinations.push(
        {
          name: 'Hunza Valley',
          location: {
            province: 'Gilgit-Baltistan',
            city: 'Hunza'
          },
          categories: ['mountain'],
          description: {
            short: 'Breathtaking valley surrounded by snow-capped mountains',
            full: 'Hunza Valley is a mountainous valley in the Gilgit-Baltistan region of Pakistan. The valley is situated at an elevation of 2,438 meters and is surrounded by several peaks over 6,000 meters. It\'s known for its stunning landscapes, apricot farms, and friendly locals.'
          },
          activities: ['Hiking', 'Trekking', 'Camping', 'Cultural Tours'],
          bestSeasons: ['summer', 'spring'],
          budgetCategory: 'moderate',
          images: ['https://example.com/hunza.jpg'],
          popularity: 95
        },
        {
          name: 'Swat Valley',
          location: {
            province: 'Khyber Pakhtunkhwa',
            city: 'Swat'
          },
          categories: ['mountain', 'rural'],
          description: {
            short: 'Beautiful valley known as the Switzerland of Pakistan',
            full: 'Swat Valley, often called the Switzerland of Pakistan, is a picturesque valley in the Khyber Pakhtunkhwa province. With its snow-capped mountains, green meadows, and flowing rivers, it offers some of the most scenic views in the country.'
          },
          activities: ['Hiking', 'Fishing', 'Skiing', 'Nature Walks'],
          bestSeasons: ['summer', 'spring'],
          budgetCategory: 'budget',
          images: ['https://example.com/swat.jpg'],
          popularity: 88
        }
      );
    }
    
    // City destinations
    if (!category || category === 'city') {
      sampleDestinations.push(
        {
          name: 'Lahore',
          location: {
            province: 'Punjab',
            city: 'Lahore'
          },
          categories: ['city', 'historical'],
          description: {
            short: 'Cultural heart of Pakistan with rich heritage',
            full: 'Lahore is the second-largest city in Pakistan and the historical cultural center of the Punjab region. The city is famous for its rich culture, cuisine, and Mughal architecture. Key attractions include the Lahore Fort, Badshahi Mosque, and Shalimar Gardens.'
          },
          activities: ['Sightseeing', 'Food Tours', 'Shopping', 'Museum Visits'],
          bestSeasons: ['spring', 'autumn', 'winter'],
          budgetCategory: 'budget',
          images: ['https://example.com/lahore.jpg'],
          popularity: 92
        },
        {
          name: 'Islamabad',
          location: {
            province: 'Federal Territory',
            city: 'Islamabad'
          },
          categories: ['city'],
          description: {
            short: 'Modern capital city with beautiful surroundings',
            full: 'Islamabad is the capital city of Pakistan, known for its modern architecture, well-organized layout, and beautiful natural surroundings. The city is nestled against the backdrop of the Margalla Hills and offers a perfect blend of urban amenities and natural beauty.'
          },
          activities: ['Hiking', 'Shopping', 'Dining', 'Cultural Tours'],
          bestSeasons: ['spring', 'autumn'],
          budgetCategory: 'luxury',
          images: ['https://example.com/islamabad.jpg'],
          popularity: 87
        }
      );
    }
    
    // Historical destinations
    if (!category || category === 'historical') {
      sampleDestinations.push(
        {
          name: "Mohenjo-daro",
          location: {
            province: 'Sindh',
            city: 'Larkana'
          },
          categories: ['historical'],
          description: {
            short: "Ancient archaeological site of the Indus Valley Civilization",
            full: 'Mohenjo-daro is an archaeological site built around 2500 BCE. It was one of the largest settlements of the ancient Indus Valley Civilization and one of the world\'s earliest major cities. Today, it\'s a UNESCO World Heritage Site.'
          },
          activities: ['Archaeological Tours', 'Photography', 'Historical Education'],
          bestSeasons: ['winter'],
          budgetCategory: 'budget',
          images: ['https://example.com/mohenjodaro.jpg'],
          popularity: 80
        }
      );
    }
    
    // Rural destinations
    if (!category || category === 'rural') {
      sampleDestinations.push(
        {
          name: 'Kalash Valley',
          location: {
            province: 'Khyber Pakhtunkhwa',
            city: 'Chitral'
          },
          categories: ['rural', 'cultural'],
          description: {
            short: 'Home to the unique Kalash culture and traditions',
            full: 'Kalash Valley is home to the Kalash people, who maintain a unique culture and traditions different from the rest of Pakistan. The valley is known for its beautiful landscapes, distinctive wooden architecture, and colorful festivals.'
          },
          activities: ['Cultural Exploration', 'Hiking', 'Festival Attendance', 'Photography'],
          bestSeasons: ['summer', 'spring'],
          budgetCategory: 'moderate',
          images: ['https://example.com/kalash.jpg'],
          popularity: 75
        }
      );
    }
    
    // Filter destinations based on category if specified
    const destinationsToCreate = category 
      ? sampleDestinations 
      : sampleDestinations.slice(0, 5); // Limit to 5 if creating all categories
    
    // Check if destinations already exist in the database
    for (const dest of destinationsToCreate) {
      const existingDest = await Destination.findOne({ name: dest.name });
      if (!existingDest) {
        await Destination.create(dest);
      }
    }
    
    // Return created destinations
    if (category) {
      return await Destination.find({ categories: category }).sort({ popularity: -1 });
    } else {
      return await Destination.find().sort({ popularity: -1 }).limit(10);
    }
  } catch (error) {
    console.error('Error creating sample destinations:', error);
    return [];
  }
}
